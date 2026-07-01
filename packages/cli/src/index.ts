#!/usr/bin/env node

import { Command } from 'commander';
import { Analyzer } from '@typefigma/analyzer';
import { CodeGenerator } from '@typefigma/code-generator';
import { ElementorGenerator } from '@typefigma/elementor-mapper';
import { ThemeBuilder, slugify } from '@typefigma/theme-builder';
import { Validator } from '@typefigma/validator';
import * as fs from 'fs';
import * as path from 'path';

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
  .action(async (figmaUrl: string, options) => {
    const token = options.token || process.env.FIGMA_TOKEN;
    if (!token) {
      console.error('Error: Figma access token required (--token or FIGMA_TOKEN env var)');
      process.exit(1);
    }

    const outputDir = path.resolve(options.output);
    const themeName = options.name;
    const themeSlug = slugify(themeName);

    console.log(`\n🚀 TypeFigma — Generating WordPress Theme from Figma\n`);
    console.log(`   URL: ${figmaUrl}`);
    console.log(`   Theme: ${themeName} (${themeSlug})\n`);

    try {
      // Step 1-3: Analyze
      console.log('📥 Step 1-3: Fetching & Analyzing Figma design...');
      const analyzer = new Analyzer(token);
      const analysis = await analyzer.analyze(figmaUrl);
      console.log(`   ✅ Detected: ${analysis.projectType} (${Math.round(analysis.confidence * 100)}% confidence)`);

      // Step 4: Code Generation
      console.log('\n💻 Step 4: Generating HTML/CSS...');
      const codeGen = new CodeGenerator();
      const generatedCode = codeGen.generate(analysis.components, analysis.designTokens);
      console.log('   ✅ HTML + CSS generated');

      // Step 5: Elementor Generation
      console.log('\n📦 Step 5: Generating Elementor JSON...');
      const elementorGen = new ElementorGenerator(analysis.designTokens);
      const elementorOutput = elementorGen.generate(analysis.components);
      console.log(`   ✅ ${elementorOutput.templates.length} Elementor templates generated`);

      // Step 6-7: Theme Building
      console.log('\n📁 Step 6-7: Building WordPress theme structure...');
      const themeBuilder = new ThemeBuilder(
        { themeName, themeSlug, projectType: analysis.projectType },
        analysis,
      );
      const themeFiles = themeBuilder.build(
        elementorOutput.templates,
        elementorOutput.globalSettings,
        generatedCode,
      );
      console.log(`   ✅ ${themeFiles.length} theme files created`);

      // Write files
      for (const file of themeFiles) {
        const filePath = path.join(outputDir, themeSlug, file.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }
      console.log(`   ✅ Files written to ${path.join(outputDir, themeSlug)}`);

      // Step 9: Validate
      console.log('\n✅ Step 9: Validating...');
      const validator = new Validator();
      const report = validator.validate(themeFiles);

      if (report.errors.length > 0) {
        console.log(`   ❌ ${report.errors.length} errors found`);
        for (const err of report.errors) {
          console.log(`      - [${err.file}] ${err.message}`);
        }
      }
      if (report.warnings.length > 0) {
        console.log(`   ⚠️  ${report.warnings.length} warnings`);
      }
      if (report.errors.length === 0) {
        console.log('   ✅ Theme validation passed');
      }

      console.log(`\n🎉 Done! Theme ready at: ${path.join(outputDir, themeSlug)}`);
      console.log(`   CSS size: ${(report.performance.cssSize / 1024).toFixed(1)} KB`);
      console.log(`   JS size: ${(report.performance.jsSize / 1024).toFixed(1)} KB`);

    } catch (error) {
      console.error('\n❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(process.argv);
