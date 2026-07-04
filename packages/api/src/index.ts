import express from 'express';
import cors from 'cors';
import { Analyzer } from '@typefigma/analyzer';
import { CodeGenerator } from '@typefigma/code-generator';
import { ElementorGenerator, getSectionTemplates } from '@typefigma/elementor-mapper';
import { ThemeBuilder, slugify } from '@typefigma/theme-builder';
import { Validator } from '@typefigma/validator';
import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const zipStore = new Map<string, string>();

interface GenerateRequest {
  figmaUrl: string;
  figmaToken: string;
  themeName?: string;
  outputDir?: string;
  createZip?: boolean;
  selectedSections?: string[];
  hierarchicalSelection?: import('@typefigma/elementor-mapper').HierarchicalSelection;
  includeDtcg?: boolean;
  includeThemeJson?: boolean;
  includeTailwind?: boolean;
  includeBlocks?: boolean;
}

interface GenerateResponse {
  success: boolean;
  themeSlug?: string;
  themePath?: string;
  zipPath?: string;
  files?: number;
  validation?: {
    score: number;
    errors: number;
    warnings: number;
    accessibilityScore: number;
  };
  projectType?: string;
  confidence?: number;
  error?: string;
  duration?: number;
  selectionConfig?: import('@typefigma/elementor-mapper').SectionSelectionConfig;
  hierarchicalSelection?: import('@typefigma/elementor-mapper').HierarchicalSelection;
  templates?: import('@typefigma/elementor-mapper').SectionTemplate[];
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
  const startTime = Date.now();
  const body = req.body as GenerateRequest;

  if (!body.figmaUrl || !body.figmaToken) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: figmaUrl, figmaToken',
    } as GenerateResponse);
  }

  try {
    const analyzer = new Analyzer(body.figmaToken);
    const analysis = await analyzer.analyze(body.figmaUrl);
    const pType = analysis.projectType;

    const elementorGen = new ElementorGenerator(analysis.designTokens);
    const selectionConfig = elementorGen.getSelectionConfig(analysis.components);
    const hierarchicalSelection = elementorGen.getHierarchicalSelection(analysis.components);
    const templates = elementorGen.getTemplates();

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      projectType: pType.type,
      confidence: pType.confidence,
      duration,
      selectionConfig,
      hierarchicalSelection,
      templates,
      recommendedPlugins: pType.recommendedPlugins,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    } as GenerateResponse);
  }
});

app.post('/api/generate', async (req, res) => {
  const startTime = Date.now();
  const body = req.body as GenerateRequest;

  if (!body.figmaUrl || !body.figmaToken) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: figmaUrl, figmaToken',
    } as GenerateResponse);
  }

  const themeName = body.themeName || 'Generated Theme';
  const themeSlug = slugify(themeName);
  const outputDir = path.resolve(body.outputDir || './output');
  const themeDir = path.join(outputDir, themeSlug);

  try {
    const analyzer = new Analyzer(body.figmaToken);
    const analysis = await analyzer.analyze(body.figmaUrl);
    const pType = analysis.projectType;

    const codeGen = new CodeGenerator({
      includeDtcg: body.includeDtcg || false,
      includeThemeJson: body.includeThemeJson || body.includeBlocks || false,
      includeTailwind: body.includeTailwind || false,
      includeBlocks: body.includeBlocks || false,
    });
    const generatedCode = codeGen.generate(analysis.components, analysis.designTokens, analysis.content);

    const elementorGen = new ElementorGenerator(analysis.designTokens);
    let selection: import('@typefigma/elementor-mapper').SectionSelectionConfig | undefined;
    let elementorOutput: import('@typefigma/elementor-mapper').ElementorTemplate[];

    if (body.hierarchicalSelection) {
      elementorOutput = elementorGen.generateHierarchical(body.hierarchicalSelection, [pType.type]);
    } else if (body.selectedSections && body.selectedSections.length > 0) {
      const config = elementorGen.getSelectionConfig(analysis.components);
      selection = { sections: config.sections, selected: body.selectedSections };
      elementorOutput = elementorGen.generate(analysis.components, selection).templates;
    } else {
      const full = elementorGen.generate(analysis.components);
      elementorOutput = full.templates;
    }

    const themeBuilder = new ThemeBuilder(
      { themeName, themeSlug, projectType: pType.type },
      analysis,
    );
    const globalSettings = elementorGen.generate(analysis.components).globalSettings;
    const themeFiles = themeBuilder.build(
      elementorOutput,
      globalSettings,
      generatedCode,
    );

    for (const file of themeFiles) {
      const filePath = path.join(themeDir, file.path);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }

    const validator = new Validator();
    const report = validator.validate(themeFiles);

    let zipPath: string | undefined;
    if (body.createZip) {
      zipPath = path.join(outputDir, `${themeSlug}.zip`);
      await createZip(themeDir, zipPath);
      zipStore.set(themeSlug, zipPath);
    }

    const duration = Date.now() - startTime;

    const response: GenerateResponse = {
      success: report.errors.length === 0,
      themeSlug,
      themePath: themeDir,
      zipPath,
      files: themeFiles.length,
      validation: {
        score: report.summary.score,
        errors: report.errors.length,
        warnings: report.warnings.length,
        accessibilityScore: report.accessibility.score,
      },
      projectType: pType.type,
      confidence: pType.confidence,
      duration,
      selectionConfig: elementorGen.getSelectionConfig(analysis.components),
    };

    res.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    } as GenerateResponse);
  }
});

app.get('/api/templates', (_req, res) => {
  res.json({ templates: getSectionTemplates() });
});

app.get('/api/download/:slug', (req, res) => {
  const slug = req.params.slug;
  const stored = zipStore.get(slug);
  const zipPath = stored || path.resolve(`./output/${slug}.zip`);

  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'ZIP not found' });
  }
  res.download(zipPath);
});

function createZip(sourceDir: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

app.listen(PORT, () => {
  console.log(`TypeFigma API running on http://localhost:${PORT}`);
});
