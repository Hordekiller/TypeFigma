#!/usr/bin/env node

import { Command } from 'commander';
import { Analyzer } from '@typefigma/analyzer';
import { CodeGenerator } from '@typefigma/code-generator';
import { ElementorGenerator } from '@typefigma/elementor-mapper';
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

program
  .command('generate')
  .description('Generate a WordPress theme from a Figma URL')
  .argument('<figma-url>', 'Figma file URL')
  .option('-t, --token <token>', 'Figma access token (or FIGMA_TOKEN env var)')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-n, --name <name>', 'Theme name', 'Generated Theme')
  .option('-z, --zip', 'Create ZIP archive of the theme', false)
  .action(async (figmaUrl: string, options) => {
    const token = options.token || process.env.FIGMA_TOKEN;
    if (!token) {
      console.error('Error: Figma access token required (--token or FIGMA_TOKEN env var)');
      process.exit(1);
    }

    const outputDir = path.resolve(options.output);
    const themeName = options.name;
    const themeSlug = slugify(themeName);

    console.log(`\nTypeFigma — Generating WordPress Theme from Figma\n`);
    console.log(`   URL: ${figmaUrl}`);
    console.log(`   Theme: ${themeName} (${themeSlug})\n`);

    try {
      // Step 1-3: Analyze
      console.log('Step 1-3: Fetching & Analyzing Figma design...');
      const analyzer = new Analyzer(token);
      const analysis = await analyzer.analyze(figmaUrl);
      const pType = analysis.projectType;
      console.log(`   Detected: ${pType.type} (${Math.round(pType.confidence * 100)}% confidence)`);
      if (pType.recommendedPlugins.length > 0) {
        console.log(`   Recommended plugins: ${pType.recommendedPlugins.join(', ')}`);
      }

      // Step 4: Code Generation
      console.log('\nStep 4: Generating HTML/CSS...');
      const codeGen = new CodeGenerator();
      const generatedCode = codeGen.generate(analysis.components, analysis.designTokens);
      console.log('   HTML + CSS generated');

      // Step 5: Elementor Generation
      console.log('\nStep 5: Generating Elementor JSON...');
      const elementorGen = new ElementorGenerator(analysis.designTokens);
      const elementorOutput = elementorGen.generate(analysis.components);
      console.log(`   ${elementorOutput.templates.length} Elementor templates generated`);

      // Step 6-7: Theme Building
      console.log('\nStep 6-7: Building WordPress theme structure...');
      const themeBuilder = new ThemeBuilder(
        { themeName, themeSlug, projectType: pType.type },
        analysis,
      );
      const themeFiles = themeBuilder.build(
        elementorOutput.templates,
        elementorOutput.globalSettings,
        generatedCode,
      );
      console.log(`   ${themeFiles.length} theme files created`);

      // Write files
      const themeDir = path.join(outputDir, themeSlug);
      for (const file of themeFiles) {
        const filePath = path.join(themeDir, file.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }
      console.log(`   Files written to ${themeDir}`);

      // Step 9: Validate
      console.log('\nStep 9: Validating...');
      const validator = new Validator();
      const report = validator.validate(themeFiles);

      if (report.errors.length > 0) {
        console.log(`   ${report.errors.length} errors found`);
        for (const err of report.errors) {
          console.log(`      [${err.file}] ${err.message}`);
        }
      }
      if (report.warnings.length > 0) {
        console.log(`   ${report.warnings.length} warnings`);
        for (const warn of report.warnings.slice(0, 10)) {
          console.log(`      [${warn.file}] ${warn.message}`);
        }
        if (report.warnings.length > 10) {
          console.log(`      ... and ${report.warnings.length - 10} more warnings`);
        }
      }
      if (report.errors.length === 0) {
        console.log('   Validation passed');
      }

      // Step 10: Package
      if (options.zip) {
        console.log('\nStep 10: Packaging...');
        const zipPath = path.join(outputDir, `${themeSlug}.zip`);
        await createZip(themeDir, zipPath);
        console.log(`   ZIP archive created: ${zipPath}`);
      }

      console.log(`\nDone! Theme ready at: ${themeDir}`);
      console.log(`   Score: ${report.summary.score}/100 | Errors: ${report.errors.length} | Warnings: ${report.warnings.length}`);
      console.log(`   CSS: ${(report.performance.cssSize / 1024).toFixed(1)} KB | JS: ${(report.performance.jsSize / 1024).toFixed(1)} KB | Total: ${(report.performance.totalSize / 1024).toFixed(1)} KB`);
      console.log(`   a11y score: ${report.accessibility.score}/100`);
      console.log(`   WP i18n functions: ${report.wordpress.i18nFunctions} | Nonces: ${report.wordpress.noncesFound}`);

    } catch (error) {
      console.error('\nError:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
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

program.parse(process.argv);
