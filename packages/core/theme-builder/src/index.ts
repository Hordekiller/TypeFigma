import { WordPressFileBuilder } from './wordpress-files.js';
import { FontManager } from './font-manager.js';
import type { ThemeFile, ThemeOptions, ThemeFontConfig } from './wordpress-files.js';
import type { FontFamilyEntry } from './font-manager.js';
import type { FigmaAnalysis } from '@typefigma/analyzer';
import type { ElementorTemplate, GlobalSettings } from '@typefigma/elementor-mapper';
import type { GeneratedCode } from '@typefigma/code-generator';

export class ThemeBuilder {
  private options: ThemeOptions;
  private analysis: FigmaAnalysis;
  private fontManager: FontManager;

  constructor(options: ThemeOptions, analysis: FigmaAnalysis, fontManager?: FontManager) {
    this.options = options;
    this.analysis = analysis;
    this.fontManager = fontManager || new FontManager();
  }

  build(
    elementorTemplates: ElementorTemplate[],
    globalSettings: GlobalSettings,
    codeGen: GeneratedCode,
    fontConfig?: ThemeFontConfig,
  ): ThemeFile[] {
    const builder = new WordPressFileBuilder(this.options, this.analysis);

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

    return builder.getAllFiles(elementorTemplates, globalSettings, codeGen, fontEntries);
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
