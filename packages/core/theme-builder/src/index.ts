import { WordPressFileBuilder } from './wordpress-files.js';
import { FontManager } from './font-manager.js';
import type { ThemeFile, ThemeOptions, ThemeFontConfig } from './wordpress-files.js';
import type { FontFamilyEntry } from './font-manager.js';
import type { FigmaAnalysis } from '@typefigma/analyzer';
import type { ElementorTemplate, GlobalSettings } from '@typefigma/elementor-mapper';
import type { GeneratedCode } from '@typefigma/code-generator';
import type { ThemeConfig } from './types.js';

// Map ThemeConfig to ThemeOptions for backward compatibility
function mapToThemeOptions(config: ThemeConfig): ThemeOptions {
  return {
    themeName: config.name,
    themeSlug: config.textDomain,
    projectType: 'website', // Default fallback
  };
}

export class ThemeBuilder {
  private options: ThemeConfig;
  private analysis: FigmaAnalysis;
  private fontManager: FontManager;

  constructor(options: ThemeConfig, analysis: FigmaAnalysis, fontManager?: FontManager) {
    this.options = options;
    this.analysis = analysis;
    this.fontManager = fontManager || new FontManager();
  }

  private getThemeOptions(): ThemeOptions {
    return {
      themeName: this.options.name,
      themeSlug: this.options.textDomain,
      projectType: this.analysis.projectType.type || 'website',
    };
  }

  private generateMetadataJson(): ThemeFile {
    const metadata = {
      name: this.options.name,
      description: this.options.description,
      version: this.options.version,
      author: this.options.author,
      author_uri: this.options.authorUri,
      theme_uri: this.options.themeUri,
      license: this.options.license || 'GPLv2 or later',
      license_uri: this.options.licenseUri || 'https://www.gnu.org/licenses/gpl-2.0.html',
      tags: this.options.tags || [],
      template: this.options.isChildTheme ? this.options.parentThemeFolder : undefined,
      text_domain: this.options.textDomain,
      requires_php: this.options.requiresPhp,
      requires_wp: this.options.requiresWp,
    };

    // Remove undefined fields
    const cleanMetadata = Object.fromEntries(
      Object.entries(metadata).filter(([_, value]) => value !== undefined)
    );

    return {
      path: 'metadata.json',
      content: JSON.stringify(cleanMetadata, null, 2),
    };
  }

  private generateChildTheme(): ThemeFile[] {
    if (!this.options.isChildTheme || !this.options.parentThemeFolder) {
      return [];
    }

    const files: ThemeFile[] = [];

    // style.css
    const styleCss = `/*
Theme Name: ${this.options.name}
Template: ${this.options.parentThemeFolder}
Version: ${this.options.version}
Text Domain: ${this.options.textDomain}
${this.options.description ? `Description: ${this.options.description}` : ''}
${this.options.author ? `Author: ${this.options.author}` : ''}
${this.options.authorUri ? `Author URI: ${this.options.authorUri}` : ''}
${this.options.license ? `License: ${this.options.license}` : ''}
${this.options.licenseUri ? `License URI: ${this.options.licenseUri}` : ''}
*/`;
    files.push({ path: 'style.css', content: styleCss });

    // functions.php
    const functionsPhp = `<?php
add_action('wp_enqueue_scripts', function() {
  wp_enqueue_style('parent-style', get_parent_theme_file_uri('style.css'));
  wp_enqueue_style('child-style', get_stylesheet_uri(), ['parent-style']);
});`;
    files.push({ path: 'functions.php', content: functionsPhp });

    return files;
  }

  private generateWooCommerceTemplates(): ThemeFile[] {
    if (!this.options.includeWooCommerce) {
      return [];
    }

    const { WooCommerceGenerator } = require('@typefigma/woocommerce-generator');
    const generator = new WooCommerceGenerator(this.options, this.options.woocommerceFeatures);
    const templates = generator.generateTemplates();

    return Object.entries(templates).map(([path, content]) => ({
      path: `woocommerce/${path}`,
      content
    }));
  }

  build(
    elementorTemplates: ElementorTemplate[],
    globalSettings: GlobalSettings,
    codeGen: GeneratedCode,
    fontConfig?: ThemeFontConfig,
  ): ThemeFile[] {
    const builder = new WordPressFileBuilder(this.getThemeOptions(), this.analysis);

    let fontEntries: FontFamilyEntry[] | undefined;

    if (fontConfig?.families && fontConfig.families.length > 0) {
      fontEntries = [];
      for (const fontOpt of fontConfig.families) {
        const name = fontOpt.name;
        const slug = this.slugify(name);
        const weights = fontOpt.weights || [400];
        const styles = fontOpt.styles || ['normal'];

        if (fontOpt.source === 'local' && fontOpt.file) {
          const entry = this.fontManager.importLocalFont(fontOpt.file, fontOpt.buffer || Buffer.alloc(0), name);
          fontEntries.push(entry);
        } else {
          const faces = weights.flatMap(w =>
            styles.map(s => ({
              fontFamily: name,
              fontWeight: `${w}`,
              fontStyle: s,
              fontDisplay: 'swap' as const,
              src: [] as string[],
            })),
          );
          fontEntries.push({
            fontFamily: `${name}, ${name}`,
            name,
            slug,
            fallback: '-apple-system, sans-serif',
            fontFace: faces,
          });
        }
      }
    } else {
      const families = this.analysis.designTokens.typography.fontFamilies;
      const seen = new Set<string>();
      fontEntries = [];

      for (const key of ['heading', 'body', 'mono'] as const) {
        const ref = families[key];
        if (ref?.name && !seen.has(ref.name)) {
          seen.add(ref.name);
          const slug = this.slugify(ref.name);
          fontEntries.push({
            fontFamily: `${ref.name}, ${ref.fallback}`,
            name: ref.name,
            slug,
            fallback: ref.fallback,
            fontFace: ref.weights.map(w => ({
              fontFamily: ref.name,
              fontWeight: `${w}`,
              fontStyle: 'normal',
              fontDisplay: 'swap' as const,
              src: [] as string[],
            })),
          });
        }
      }
    }

    const files = builder.getAllFiles(elementorTemplates, globalSettings, codeGen, fontEntries);

    // Add metadata.json
    files.push(this.generateMetadataJson());

    // Add child theme files if enabled
    if (this.options.isChildTheme) {
      const childThemeFiles = this.generateChildTheme();
      files.push(...childThemeFiles);
    }

    // Add WooCommerce templates if enabled
    if (this.options.includeWooCommerce) {
      const woocommerceFiles = this.generateWooCommerceTemplates();
      files.push(...woocommerceFiles);
    }

    return files;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export { WordPressFileBuilder } from './wordpress-files.js';
export { DocGenerator } from './doc-generator.js';
export type { ThemeFile, ThemeOptions, ThemeFontConfig, FontOption } from './wordpress-files.js';

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
