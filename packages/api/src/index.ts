import express from 'express';
import cors from 'cors';
import { Analyzer } from '@typefigma/analyzer';
import { CodeGenerator } from '@typefigma/code-generator';
import { ElementorGenerator, getSectionTemplates, type ElementorTemplate, type GlobalSettings } from '@typefigma/elementor-mapper';
import { ThemeBuilder, slugify } from '@typefigma/theme-builder';
import { Validator } from '@typefigma/validator';
import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import { FileAnnotationStore } from './store/index.js';
import { createAnnotationRouter } from './routes/annotations.js';
import { createSession, getSession, updateSession } from './pipeline-store.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3005;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const annotationStore = new FileAnnotationStore();
const zipStore = new Map<string, string>();
const analysisCache = new Map<string, { analysis: import('@typefigma/analyzer').FigmaAnalysis; timestamp: number }>();
const ANALYSIS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

app.use('/api/projects', createAnnotationRouter(annotationStore));

function asyncHandler(
  fn: (req: express.Request, res: express.Response) => Promise<void>,
  timeoutMs: number,
) {
  return (req: express.Request, res: express.Response) => {
    let timedOut = false;
    let finished = false;

    const timeoutId = setTimeout(() => {
      if (!finished) {
        timedOut = true;
        if (!res.destroyed) {
          res.status(504).json({
            success: false,
            error: `Server timed out after ${timeoutMs / 1000}s. The Figma file may be too large.`,
          });
        }
      }
    }, timeoutMs);

    fn(req, res)
      .catch((error) => {
        if (!timedOut && !res.destroyed) {
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      })
      .finally(() => {
        finished = true;
        clearTimeout(timeoutId);
      });
  };
}

function getCachedAnalysis(figmaUrl: string, figmaToken: string): import('@typefigma/analyzer').FigmaAnalysis | null {
  const cacheKey = `${figmaUrl}:${figmaToken}`;
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ANALYSIS_CACHE_TTL) {
    return cached.analysis;
  }
  analysisCache.delete(cacheKey);
  return null;
}

function setCachedAnalysis(figmaUrl: string, figmaToken: string, analysis: import('@typefigma/analyzer').FigmaAnalysis): void {
  const cacheKey = `${figmaUrl}:${figmaToken}`;
  analysisCache.set(cacheKey, { analysis, timestamp: Date.now() });
}

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

app.post('/api/analyze', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const body = req.body as GenerateRequest;

  if (!body.figmaUrl || !body.figmaToken) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: figmaUrl, figmaToken',
    } as GenerateResponse);
    return;
  }

  let analysis = getCachedAnalysis(body.figmaUrl, body.figmaToken);
  if (!analysis) {
    const analyzer = new Analyzer(body.figmaToken);
    analysis = await analyzer.analyze(body.figmaUrl);
    setCachedAnalysis(body.figmaUrl, body.figmaToken, analysis);
  }

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
    components: analysis.components,
    designTokens: analysis.designTokens,
  });
}, 300000));

app.post('/api/generate', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const body = req.body as GenerateRequest;

  if (!body.figmaUrl || !body.figmaToken) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: figmaUrl, figmaToken',
    } as GenerateResponse);
    return;
  }

  const themeName = body.themeName || 'Generated Theme';
  const themeSlug = slugify(themeName);
  const outputDir = path.resolve(body.outputDir || './output');
  const themeDir = path.join(outputDir, themeSlug);

  let analysis = getCachedAnalysis(body.figmaUrl, body.figmaToken);
  if (!analysis) {
    const analyzer = new Analyzer(body.figmaToken);
    analysis = await analyzer.analyze(body.figmaUrl);
    setCachedAnalysis(body.figmaUrl, body.figmaToken, analysis);
  }
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
    { name: themeName, textDomain: themeSlug, description: '', version: '1.0.0', author: '' },
    analysis,
  );
  const globalSettings = elementorGen.generate(analysis.components).globalSettings;
  const themeFiles = await themeBuilder.build(
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
}, 300000));

app.get('/api/templates', (_req, res) => {
  res.json({ templates: getSectionTemplates() });
});

// ─── Pipeline Step-by-Step Endpoints ──────────────────

app.post('/api/pipeline/start', asyncHandler(async (req, res) => {
  const body = req.body as GenerateRequest;

  if (!body.figmaUrl || !body.figmaToken) {
    res.status(400).json({ success: false, error: 'Missing required fields: figmaUrl, figmaToken' });
    return;
  }

  const themeName = body.themeName || 'Generated Theme';

  let analysis = getCachedAnalysis(body.figmaUrl, body.figmaToken);
  if (!analysis) {
    const analyzer = new Analyzer(body.figmaToken);
    analysis = await analyzer.analyze(body.figmaUrl);
    setCachedAnalysis(body.figmaUrl, body.figmaToken, analysis);
  }

  const sessionId = `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const session = createSession(
    sessionId,
    body.figmaUrl,
    body.figmaToken,
    themeName,
    analysis,
    body.selectedSections,
    body.hierarchicalSelection,
  );

  res.json({
    success: true,
    sessionId: session.id,
    projectType: analysis.projectType.type,
    confidence: analysis.projectType.confidence,
    currentStep: session.currentStep,
  });
}, 300000));

app.post('/api/pipeline/step', asyncHandler(async (req, res) => {
  const body = req.body as { sessionId: string; step: number };

  if (!body.sessionId || !body.step) {
    res.status(400).json({ success: false, error: 'Missing sessionId or step' });
    return;
  }

  const session = getSession(body.sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found or expired' });
    return;
  }

  const { step } = body;

  try {
    if (step === 4) {
      const codeGen = new CodeGenerator({
        includeDtcg: false,
        includeThemeJson: false,
        includeTailwind: false,
        includeBlocks: false,
      });
      const generatedCode = codeGen.generate(
        session.analysis.components,
        session.analysis.designTokens,
        session.analysis.content,
      );
      updateSession(session.id, { step4: { generatedCode }, currentStep: 5 });

      res.json({
        success: true,
        step: 4,
        data: {
          html: generatedCode.html,
          globalCss: generatedCode.globalCss,
          componentsCss: generatedCode.componentsCss,
        },
      });

    } else if (step === 5) {
      const elementorGen = new ElementorGenerator(session.analysis.designTokens);
      let elementorOutput: ElementorTemplate[];
      let globalSettings: GlobalSettings;

      if (session.hierarchicalSelection) {
        elementorOutput = elementorGen.generateHierarchical(
          session.hierarchicalSelection,
          [session.analysis.projectType.type],
        );
        globalSettings = elementorGen.generate(session.analysis.components).globalSettings;
      } else if (session.selectedSections && session.selectedSections.length > 0) {
        const config = elementorGen.getSelectionConfig(session.analysis.components);
        const selection = { sections: config.sections, selected: session.selectedSections };
        const result = elementorGen.generate(session.analysis.components, selection);
        elementorOutput = result.templates;
        globalSettings = result.globalSettings;
      } else {
        const full = elementorGen.generate(session.analysis.components);
        elementorOutput = full.templates;
        globalSettings = full.globalSettings;
      }

      updateSession(session.id, { step5: { elementorOutput, globalSettings }, currentStep: 6 });

      res.json({
        success: true,
        step: 5,
        data: {
          templates: elementorOutput.map(t => ({
            title: t.title,
            type: t.type,
            content: t.content,
          })),
          globalSettings,
          templateCount: elementorOutput.length,
        },
      });

    } else if (step === 6) {
      const prevStep = session.step5;
      if (!prevStep) {
        res.status(400).json({ success: false, error: 'Step 5 must be completed first' });
        return;
      }

      const codeGen = new CodeGenerator({
        includeDtcg: false,
        includeThemeJson: false,
        includeTailwind: false,
        includeBlocks: false,
      });
      const generatedCode = codeGen.generate(
        session.analysis.components,
        session.analysis.designTokens,
        session.analysis.content,
      );

      const themeBuilder = new ThemeBuilder(
        { name: session.themeName, textDomain: slugify(session.themeName), description: '', version: '1.0.0', author: '' },
        session.analysis,
      );
      const themeFiles = await themeBuilder.build(
        prevStep.elementorOutput,
        prevStep.globalSettings,
        generatedCode,
      );

      updateSession(session.id, { step6: { themeFiles }, currentStep: 7 });

      res.json({
        success: true,
        step: 6,
        data: {
          files: themeFiles.map(f => ({ path: f.path, size: f.content.length })),
          fileCount: themeFiles.length,
        },
      });

    } else if (step === 7) {
      const prevStep = session.step6;
      if (!prevStep) {
        res.status(400).json({ success: false, error: 'Step 6 must be completed first' });
        return;
      }

      updateSession(session.id, { step7: { themeFiles: prevStep.themeFiles }, currentStep: 8 });

      res.json({
        success: true,
        step: 7,
        data: {
          files: prevStep.themeFiles.map(f => ({ path: f.path, size: f.content.length })),
          fileCount: prevStep.themeFiles.length,
          note: 'Configuration layer applied (customizer.php, settings.php)',
        },
      });

    } else if (step === 8) {
      const prevStep = session.step7 || session.step6;
      if (!prevStep) {
        res.status(400).json({ success: false, error: 'Step 6 or 7 must be completed first' });
        return;
      }

      const hasWoo = session.analysis.projectType.type === 'ecommerce';
      updateSession(session.id, { step8: { themeFiles: prevStep.themeFiles }, currentStep: 9 });

      res.json({
        success: true,
        step: 8,
        data: {
          files: prevStep.themeFiles.map(f => ({ path: f.path, size: f.content.length })),
          fileCount: prevStep.themeFiles.length,
          wooCommerceEnabled: hasWoo,
          note: hasWoo ? 'WooCommerce templates integrated' : 'WooCommerce skipped (not an ecommerce project)',
        },
      });

    } else if (step === 9) {
      const prevStep = session.step8 || session.step7 || session.step6;
      if (!prevStep) {
        res.status(400).json({ success: false, error: 'Previous steps must be completed first' });
        return;
      }

      const validator = new Validator();
      const report = validator.validate(prevStep.themeFiles);

      updateSession(session.id, { step9: { validation: report as any }, currentStep: 10 });

      res.json({
        success: true,
        step: 9,
        data: {
          score: report.summary.score,
          errors: report.errors,
          warnings: report.warnings,
          accessibility: report.accessibility,
          performance: report.performance,
          summary: report.summary,
        },
      });

    } else if (step === 10) {
      if (!session.step6) {
        res.status(400).json({ success: false, error: 'Previous steps must be completed first' });
        return;
      }

      const themeSlug = slugify(session.themeName);
      const outputDir = path.resolve('./output');
      const themeDir = path.join(outputDir, themeSlug);

      const themeFiles = session.step8?.themeFiles || session.step7?.themeFiles || session.step6.themeFiles;

      for (const file of themeFiles) {
        const filePath = path.join(themeDir, file.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }

      const zipPath = path.join(outputDir, `${themeSlug}.zip`);
      await createZip(themeDir, zipPath);

      updateSession(session.id, { step10: { zipPath, themeDir }, currentStep: 11 });

      res.json({
        success: true,
        step: 10,
        data: {
          zipPath,
          themeDir,
          fileCount: themeFiles.length,
        },
      });

    } else {
      res.status(400).json({ success: false, error: `Invalid step: ${step}. Must be 4-10.` });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}, 300000));

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
