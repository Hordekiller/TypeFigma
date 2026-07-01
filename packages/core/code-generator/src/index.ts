import { HtmlGenerator } from './html-generator.js';
import { CssGenerator } from './css-generator.js';
import type { DetectedComponents, ExtractedTokens } from '@typefigma/analyzer';

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

  generate(components: DetectedComponents, tokens: ExtractedTokens): GeneratedCode {
    return {
      html: this.htmlGen.generatePage(components, tokens),
      globalCss: this.cssGen.generateGlobal(tokens),
      componentsCss: this.cssGen.generateComponents(tokens),
    };
  }
}

export { HtmlGenerator } from './html-generator.js';
export { CssGenerator } from './css-generator.js';
