import { HtmlGenerator } from './html-generator.js';
import { CssGenerator } from './css-generator.js';
import { TailwindV4Generator } from './tailwind-generator.js';
import { ThemeJsonGenerator } from './theme-json-generator.js';
import { WpBlockGenerator } from './wp-block-generator.js';
import { DtcgGenerator } from './dtcg-generator.js';
import type { ComponentClassification, ExtractedTokens, ExtractedContent } from '@typefigma/analyzer';
import type { GeneratedCode, BlockPattern, BlockTemplate, TailwindOutput, ThemeJson, ThemeSettings, ThemeStyles } from './types.js';

export type { GeneratedCode, BlockPattern, BlockTemplate, TailwindOutput, ThemeJson, ThemeSettings, ThemeStyles };

export interface GeneratorOptions {
  includeDtcg?: boolean;
  includeThemeJson?: boolean;
  includeTailwind?: boolean;
  includeBlocks?: boolean;
  minViewport?: string;
  maxViewport?: string;
}

export class CodeGenerator {
  private htmlGen: HtmlGenerator;
  private cssGen: CssGenerator;
  private options: GeneratorOptions;

  constructor(options: GeneratorOptions = {}) {
    this.htmlGen = new HtmlGenerator();
    this.cssGen = new CssGenerator();
    this.options = {
      includeDtcg: false,
      includeThemeJson: false,
      includeTailwind: false,
      includeBlocks: false,
      minViewport: '375px',
      maxViewport: '1440px',
      ...options,
    };
  }

  generate(
    components: ComponentClassification,
    tokens: ExtractedTokens,
    content?: ExtractedContent,
  ): GeneratedCode {
    const result: GeneratedCode = {
      html: this.htmlGen.generatePage(components, tokens, content),
      globalCss: this.cssGen.generateGlobal(tokens, this.options.minViewport, this.options.maxViewport),
      componentsCss: this.cssGen.generateComponents(tokens),
    };

    if (this.options.includeTailwind) {
      const twGen = new TailwindV4Generator(tokens);
      const twOutput = twGen.generate({} as any);
      result.tailwindCss = twOutput.css;
      result.tailwindComponents = twOutput.components;
    }

    if (this.options.includeThemeJson) {
      const tjGen = new ThemeJsonGenerator(tokens);
      result.themeJson = tjGen.toJSON();
    }

    if (this.options.includeBlocks) {
      const wpGen = new WpBlockGenerator(components, tokens);
      result.blockPatterns = wpGen.generatePatterns();
      result.blockTemplates = wpGen.generateTemplates();
    }

    if (this.options.includeDtcg) {
      const dtcgGen = new DtcgGenerator(tokens);
      result.dtcgJson = dtcgGen.toJSON();
      result.dtcgTokens = dtcgGen.generateDtcg();
      result.styleDictionary = dtcgGen.generateStyleDictionary();
    }

    return result;
  }
}

export { HtmlGenerator } from './html-generator.js';
export { CssGenerator, clampValue } from './css-generator.js';
export { TailwindV4Generator } from './tailwind-generator.js';
export { ThemeJsonGenerator, pxToRem, clampValue as tjClampValue } from './theme-json-generator.js';
export { WpBlockGenerator } from './wp-block-generator.js';
export { DtcgGenerator, pxToRem as dtcgPxToRem, parseUnitValue, toDtcgDimension, hexToRgba, rgbaToHex } from './dtcg-generator.js';
