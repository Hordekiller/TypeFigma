import { WordPressFileBuilder } from './wordpress-files.js';
import type { ThemeFile, ThemeOptions } from './wordpress-files.js';
import type { FigmaAnalysis } from '@typefigma/analyzer';
import type { ElementorTemplate, GlobalSettings } from '@typefigma/elementor-mapper';
import type { GeneratedCode } from '@typefigma/code-generator';

export class ThemeBuilder {
  private options: ThemeOptions;
  private analysis: FigmaAnalysis;

  constructor(options: ThemeOptions, analysis: FigmaAnalysis) {
    this.options = options;
    this.analysis = analysis;
  }

  build(
    elementorTemplates: ElementorTemplate[],
    globalSettings: GlobalSettings,
    codeGen: GeneratedCode,
  ): ThemeFile[] {
    const builder = new WordPressFileBuilder(this.options, this.analysis);

    return builder.getAllFiles(elementorTemplates, globalSettings, codeGen);
  }
}

export { WordPressFileBuilder } from './wordpress-files.js';
export type { ThemeFile, ThemeOptions } from './wordpress-files.js';

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
