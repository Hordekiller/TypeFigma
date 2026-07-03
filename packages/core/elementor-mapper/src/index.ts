import { ElementorMapper } from './mapper.js';
import type { ElementorTemplate, GlobalSettings, SectionSelectionConfig, SectionOption, ElementorSettings, HierarchicalSelection, SectionTemplate } from './types.js';
import type { ComponentClassification, ExtractedTokens } from '@typefigma/analyzer';
import { getSectionTemplates, getSectionTemplate } from './templates.js';

export class ElementorGenerator {
  private mapper: ElementorMapper;

  constructor(tokens: ExtractedTokens) {
    this.mapper = new ElementorMapper(tokens);
  }

  generate(components: ComponentClassification, selection?: SectionSelectionConfig): {
    templates: ElementorTemplate[];
    globalSettings: GlobalSettings;
    selectionConfig: SectionSelectionConfig;
  } {
    return {
      templates: this.mapper.mapToTemplates(components, selection),
      globalSettings: this.mapper.generateGlobalSettings(),
      selectionConfig: this.mapper.generateSelectionConfig(components),
    };
  }

  getSelectionConfig(components: ComponentClassification): SectionSelectionConfig {
    return this.mapper.generateSelectionConfig(components);
  }

  getSectionOptions(): SectionOption[] {
    return this.mapper.getSectionOptions();
  }

  generateWithSelection(
    components: ComponentClassification,
    selectedKeys: string[],
    overrides?: Record<string, Partial<ElementorSettings>>,
  ): ElementorTemplate[] {
    return this.mapper.mapFilteredTemplates(components, selectedKeys, overrides);
  }

  /**
   * Generate templates from hierarchical selection config.
   * Uses predefined section templates with widget groups.
   */
  generateHierarchical(
    selection: HierarchicalSelection,
    projectTypes?: string[],
  ): ElementorTemplate[] {
    return this.mapper.generateFromTemplates(selection, projectTypes);
  }

  /**
   * Generate hierarchical selection config from component classification.
   */
  getHierarchicalSelection(components: ComponentClassification): HierarchicalSelection {
    return this.mapper.generateHierarchicalSelection(components);
  }

  /**
   * Get all available section templates.
   */
  getTemplates(projectTypes?: string[]): SectionTemplate[] {
    return getSectionTemplates(projectTypes);
  }

  /**
   * Get a specific section template by key.
   */
  getTemplate(key: string): SectionTemplate | undefined {
    return getSectionTemplate(key);
  }
}

export { ElementorMapper } from './mapper.js';
export * from './types.js';
export { getSectionTemplates, getSectionTemplate } from './templates.js';
export type { SectionTemplate, WidgetGroup, WidgetDef, HierarchicalSelection } from './types.js';
