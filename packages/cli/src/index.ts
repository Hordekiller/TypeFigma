#!/usr/bin/env node

import { Command } from 'commander';
import { Analyzer } from '@typefigma/analyzer';
import { CodeGenerator } from '@typefigma/code-generator';
import { ElementorGenerator, getSectionTemplates } from '@typefigma/elementor-mapper';
import { ThemeBuilder, slugify } from '@typefigma/theme-builder';
import { Validator } from '@typefigma/validator';
import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

const program = new Command();

program
  .name('typefigma')
  .description('Figma to WordPress Theme Generator')
  .version('0.1.0');

// ─── Shared helpers ──────────────────────────────────

function getToken(options: { token?: string }): string {
  return options.token || process.env.FIGMA_TOKEN || '';
}

function spinner(prefix: string): { stop: (msg?: string) => void } {
  if (!process.stdout.isTTY) {
    console.log(prefix);
    return { stop: () => {} };
  }
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[i]} ${prefix} `);
    i = (i + 1) % frames.length;
  }, 80);
  return {
    stop: (msg?: string) => {
      clearInterval(interval);
      process.stdout.write(`\r${' '.repeat(process.stdout.columns || 80)}\r`);
      if (msg) console.log(`✓ ${msg}`);
    },
  };
}

// ─── generate command ────────────────────────────────

program
  .command('generate')
  .description('Generate a WordPress theme from a Figma URL')
  .argument('<figma-url>', 'Figma file URL')
  .option('-t, --token <token>', 'Figma access token')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-n, --name <name>', 'Theme name', 'Generated Theme')
  .option('-z, --zip', 'Create ZIP archive of the theme', false)
  .option('-q, --quiet', 'Minimal output', false)
  .option('--dtcg', 'Include DTCG design tokens', false)
  .option('--theme-json', 'Include theme.json', false)
  .option('--tailwind', 'Include Tailwind CSS v4', false)
  .option('--blocks', 'Include block patterns & templates', false)
  .action(async (figmaUrl: string, options) => {
    const token = getToken(options);
    if (!token) {
      console.error('Error: Figma access token required (--token or FIGMA_TOKEN env var)');
      process.exit(1);
    }

    const outputDir = path.resolve(options.output);
    const themeName = options.name;
    const themeSlug = slugify(themeName);
    const quiet = options.quiet;

    if (!quiet) {
      console.log(`\nTypeFigma — Generating WordPress Theme from Figma\n`);
      console.log(`   URL: ${figmaUrl}`);
      console.log(`   Theme: ${themeName} (${themeSlug})\n`);
    }

    try {
      // Step 1-3: Analyze
      if (!quiet) {
        const sp = spinner('Step 1-3: Fetching & Analyzing Figma design...');
        const analyzerA = new Analyzer(token);
        const analysisA = await analyzerA.analyze(figmaUrl);
        sp.stop(`Analyzed: ${analysisA.projectType.type} (${Math.round(analysisA.projectType.confidence * 100)}%)`);
      }

      const analyzer = new Analyzer(token);
      const analysis = await analyzer.analyze(figmaUrl);
      const pType = analysis.projectType;

      // Step 4: Code Generation
      let sp = spinner('Step 4: Generating HTML/CSS...');
      const codeGen = new CodeGenerator({
        includeDtcg: options.dtcg,
        includeThemeJson: options.themeJson || options.blocks,
        includeTailwind: options.tailwind,
        includeBlocks: options.blocks,
      });
      const generatedCode = codeGen.generate(analysis.components, analysis.designTokens, analysis.content);
      sp.stop('Code generated');

      // Step 5: Elementor Generation
      sp = spinner('Step 5: Generating Elementor JSON...');
      const elementorGen = new ElementorGenerator(analysis.designTokens);
      const elementorOutput = elementorGen.generate(analysis.components);
      sp.stop(`${elementorOutput.templates.length} Elementor templates generated`);

      // Step 6-7: Theme Building
      sp = spinner('Step 6-7: Building WordPress theme structure...');
      const themeBuilder = new ThemeBuilder(
        { themeName, themeSlug, projectType: pType.type },
        analysis,
      );
      const themeFiles = themeBuilder.build(
        elementorOutput.templates,
        elementorOutput.globalSettings,
        generatedCode,
      );
      sp.stop(`${themeFiles.length} theme files created`);

      // Write files
      const themeDir = path.join(outputDir, themeSlug);
      for (const file of themeFiles) {
        const filePath = path.join(themeDir, file.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }

      // Step 9: Validate
      sp = spinner('Step 9: Validating...');
      const validator = new Validator();
      const report = validator.validate(themeFiles);
      sp.stop('Validation complete');

      // Output report
      if (!quiet) {
        console.log('');
        if (report.errors.length > 0) {
          console.log(`   ${' '.repeat(4)}${report.errors.length} errors found`);
          for (const err of report.errors) {
            console.log(`   ${' '.repeat(6)}[${err.file}] ${err.message}`);
          }
        }
        if (report.warnings.length > 0) {
          console.log(`   ${' '.repeat(4)}${report.warnings.length} warnings`);
          for (const warn of report.warnings.slice(0, 10)) {
            console.log(`   ${' '.repeat(6)}[${warn.file}] ${warn.message}`);
          }
          if (report.warnings.length > 10) {
            console.log(`   ${' '.repeat(6)}... and ${report.warnings.length - 10} more`);
          }
        }
        if (report.errors.length === 0) {
          console.log(`   ${' '.repeat(4)}Validation passed`);
        }
      }

      // Step 10: Package
      let zipPath: string | undefined;
      if (options.zip) {
        sp = spinner('Step 10: Packaging...');
        zipPath = path.join(outputDir, `${themeSlug}.zip`);
        await createZip(themeDir, zipPath);
        sp.stop(`ZIP archive created: ${zipPath}`);
      }

      console.log(`\n${' '.repeat(2)}Score: ${report.summary.score}/100`);
      console.log(`${' '.repeat(2)}Errors: ${report.errors.length} | Warnings: ${report.warnings.length}`);
      console.log(`${' '.repeat(2)}CSS: ${(report.performance.cssSize / 1024).toFixed(1)} KB | JS: ${(report.performance.jsSize / 1024).toFixed(1)} KB`);
      console.log(`${' '.repeat(2)}a11y: ${report.accessibility.score}/100`);
      console.log(`\nDone! Theme ready at: ${themeDir}`);
      if (zipPath) console.log(`ZIP: ${zipPath}`);

    } catch (error) {
      console.error('\nError:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ─── analyze command ────────────────────────────────

program
  .command('analyze')
  .description('Analyze a Figma URL and show detected components')
  .argument('<figma-url>', 'Figma file URL')
  .option('-t, --token <token>', 'Figma access token')
  .option('-j, --json', 'Output as JSON', false)
  .action(async (figmaUrl: string, options) => {
    const token = getToken(options);
    if (!token) {
      console.error('Error: Figma access token required (--token or FIGMA_TOKEN env var)');
      process.exit(1);
    }

    try {
      const sp = spinner('Fetching & analyzing Figma design...');
      const analyzer = new Analyzer(token);
      const analysis = await analyzer.analyze(figmaUrl);
      sp.stop();

      if (options.json) {
        console.log(JSON.stringify(analysis, null, 2));
        return;
      }

      const pType = analysis.projectType;
      console.log(`\nProject Type: ${pType.type} (${Math.round(pType.confidence * 100)}% confidence)`);
      console.log(`Recommended plugins: ${pType.recommendedPlugins.join(', ') || 'none'}`);

      const compTypes = Object.entries(analysis.components).filter(([, v]) => Array.isArray(v) && v.length > 0);
      console.log(`\nDetected components (${compTypes.length} categories):`);
      for (const [type, comps] of compTypes) {
        const names = (comps as Array<{ name?: string }>).map(c => `"${c.name || 'unnamed'}"`).join(', ');
        console.log(`   ${type}: ${names}`);
      }

      const tokens = analysis.designTokens;
      console.log(`\nDesign Tokens:`);
      console.log(`   Colors: ${Object.keys(tokens.colors || {}).length}`);
      console.log(`   Typography: ${Object.keys(tokens.typography || {}).length}`);
      console.log(`   Spacing: ${tokens.spacing?.length || 0} values`);
      console.log(`   Shadows: ${tokens.shadows?.length || 0}`);
      console.log(`   Border radius: ${tokens.borderRadius?.length || 0}`);
      console.log(`   Breakpoints: ${tokens.breakpoints?.length || 0}`);

    } catch (error) {
      console.error('\nError:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ─── validate command ────────────────────────────────

program
  .command('validate')
  .description('Validate a generated theme directory')
  .argument('<theme-dir>', 'Path to the generated theme directory')
  .option('-j, --json', 'Output as JSON', false)
  .action(async (themeDir: string, options) => {
    const resolved = path.resolve(themeDir);

    if (!fs.existsSync(resolved)) {
      console.error(`Error: Directory not found: ${resolved}`);
      process.exit(1);
    }

    try {
      const sp = spinner('Reading theme files...');
      const files = readThemeFiles(resolved);
      sp.stop(`Read ${files.length} files`);

      const validator = new Validator();
      const report = validator.validate(files);

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      console.log(`\nValidation Report for: ${resolved}`);
      console.log(`${' '.repeat(2)}Score: ${report.summary.score}/100`);
      console.log(`${' '.repeat(2)}Errors: ${report.errors.length}`);
      console.log(`${' '.repeat(2)}Warnings: ${report.warnings.length}\n`);

      if (report.errors.length > 0) {
        console.log('Errors:');
        for (const err of report.errors) {
          console.log(`   [${err.file}] ${err.message}`);
        }
        console.log('');
      }

      if (report.warnings.length > 0) {
        console.log('Warnings:');
        for (const warn of report.warnings.slice(0, 20)) {
          console.log(`   [${warn.file}] ${warn.message}`);
        }
        if (report.warnings.length > 20) {
          console.log(`   ... and ${report.warnings.length - 20} more`);
        }
        console.log('');
      }

      console.log('Performance:');
      console.log(`   CSS: ${(report.performance.cssSize / 1024).toFixed(1)} KB`);
      console.log(`   JS: ${(report.performance.jsSize / 1024).toFixed(1)} KB`);
      console.log(`   Total: ${(report.performance.totalSize / 1024).toFixed(1)} KB`);
      console.log('');
      console.log(`Accessibility: ${report.accessibility.score}/100`);
      console.log(`WordPress i18n: ${report.wordpress.i18nFunctions} functions`);
      console.log(`Nonces found: ${report.wordpress.noncesFound}`);

    } catch (error) {
      console.error('\nError:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

function readThemeFiles(dir: string): Array<{ path: string; content: string | Buffer }> {
  const files: Array<{ path: string; content: string | Buffer }> = [];

  function walk(current: string, relative: string) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relPath = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        const binary = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.zip'];
        if (binary.includes(ext)) {
          files.push({ path: relPath, content: fs.readFileSync(fullPath) });
        } else {
          files.push({ path: relPath, content: fs.readFileSync(fullPath, 'utf-8') });
        }
      }
    }
  }

  walk(dir, '');
  return files;
}

// ─── list-templates command ──────────────────────────

program
  .command('list-templates')
  .description('List available Elementor section templates')
  .option('-t, --type <types...>', 'Filter by project type (ecommerce, blog, etc)')
  .option('-j, --json', 'Output as JSON', false)
  .action((options) => {
    const projectTypes = options.type
      ? (Array.isArray(options.type) ? options.type : [options.type])
      : undefined;

    const templates = projectTypes ? getSectionTemplates(projectTypes) : getSectionTemplates();

    if (options.json) {
      console.log(JSON.stringify({ templates, total: templates.length }, null, 2));
      return;
    }

    const categories = new Map<string, typeof templates>();
    for (const t of templates) {
      const cat = t.category || 'uncategorized';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat)!.push(t);
    }

    console.log(`\nAvailable Section Templates (${templates.length} total):\n`);

    for (const [category, items] of categories) {
      console.log(`  ${category}:`);
      for (const t of items) {
        const types = t.relevantFor.length > 0 ? ` [${t.relevantFor.join(', ')}]` : '';
        console.log(`    ${t.key.padEnd(20)} ${t.label} (${t.templateType})${types}`);
      }
      console.log('');
    }
  });

// ─── docs command ────────────────────────────────────

program
  .command('docs')
  .description('Generate documentation for the theme')
  .requiredOption('-u, --url <url>', 'Figma file URL')
  .requiredOption('-t, --token <token>', 'Figma API token')
  .option('-n, --name <name>', 'Theme name', 'Generated Theme')
  .option('-o, --output <dir>', 'Output directory', './output')
  .action(async (options) => {
    const token = getToken(options);
    if (!token) {
      console.error('Error: FIGMA_TOKEN is not set. Provide --token or set FIGMA_TOKEN env var.');
      process.exit(1);
    }

    console.log('\n  📖 Generating documentation...\n');

    const sp = spinner('Analyzing Figma design...');
    const analyzer = new Analyzer();
    let analysis;
    try {
      const fileKey = analyzer.extractFileKey(options.url);
      analysis = await analyzer.analyze(fileKey, token);
    } catch (err) {
      sp.stop(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
    sp.stop('Analysis complete');

    const slug = slugify(options.name);
    const { DocGenerator } = await import('@typefigma/theme-builder');

    const docGen = new DocGenerator({
      themeSlug: slug,
      themeName: options.name,
      tokens: analysis.designTokens,
      components: analysis.components,
      projectType: analysis.projectType.type,
      generatedFiles: [],
      plugins: analysis.projectType.recommendedPlugins,
    });

    const readme = docGen.generateReadmeMd();
    const agentsUpdate = docGen.generateAgentsUpdate();

    const outDir = path.resolve(options.output, slug);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outDir, 'README.md'), readme, 'utf-8');
    console.log(`  ✓ README.md written to ${path.join(outDir, 'README.md')}`);

    fs.writeFileSync(path.join(outDir, 'AGENTS_UPDATE.md'), agentsUpdate, 'utf-8');
    console.log(`  ✓ AGENTS_UPDATE.md written to ${path.join(outDir, 'AGENTS_UPDATE.md')}`);

    console.log('\n  📖 Documentation generated successfully!\n');
  });

// ─── createZip helper ───────────────────────────────

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

export { program };
export default program;
