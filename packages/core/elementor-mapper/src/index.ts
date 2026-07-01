import { ElementorMapper } from './mapper.js';
import type { ElementorTemplate, ElementorNode, GlobalSettings, ElementorDocument } from './types.js';
import type { DetectedComponents, ExtractedTokens } from '@typefigma/analyzer';

export class ElementorGenerator {
  private mapper: ElementorMapper;

  constructor(tokens: ExtractedTokens) {
    this.mapper = new ElementorMapper(tokens);
  }

  generate(components: DetectedComponents): {
    templates: ElementorTemplate[];
    globalSettings: GlobalSettings;
  } {
    return {
      templates: this.mapper.mapToTemplates(components),
      globalSettings: this.mapper.generateGlobalSettings(),
    };
  }
}

export { ElementorMapper } from './mapper.js';
export * from './types.js';
