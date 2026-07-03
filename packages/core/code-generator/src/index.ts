import { HtmlGenerator } from './html-generator.js';
import { CssGenerator } from './css-generator.js';
import type { ComponentClassification, ExtractedTokens, ExtractedContent } from '@typefigma/analyzer';

export interface GeneratedCode {
  html: string;
  globalCss: string;
  componentsCss: string;
}

export class CodeGenerator {
  private htmlGen: HtmlGenerator;
  private cssGen: CssGenerator;

  constructor() {
    this.htmlGen = new HtmlGenerator();
    this.cssGen = new CssGenerator();
  }

  generate(components: ComponentClassification, tokens: ExtractedTokens, content?: ExtractedContent): GeneratedCode {
    return {
      html: this.htmlGen.generatePage(components, tokens, content),
      globalCss: this.cssGen.generateGlobal(tokens),
      componentsCss: this.cssGen.generateComponents(tokens),
    };
  }
}

export { HtmlGenerator } from './html-generator.js';
export { CssGenerator } from './css-generator.js';
export { TailwindV4Generator } from './tailwind-generator.js';
export type { TailwindOutput } from './tailwind-generator.js';
export { ThemeJsonGenerator } from './theme-json-generator.js';
export type { ThemeJson, ThemeSettings, ThemeStyles, TemplatePart, ColorSettings, PaletteItem, TypographySettings, FontFamilyItem, FontSizeItem, SpacingSettings, LayoutSettings } from './theme-json-generator.js';
export { WpBlockGenerator } from './wp-block-generator.js';
export type { BlockOutput, BlockPattern, BlockTemplate } from './wp-block-generator.js';
