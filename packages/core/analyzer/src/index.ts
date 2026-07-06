import { FigmaClient } from '@typefigma/figma-client';
import { ComponentDetector } from './component-detector.js';
import { TokenExtractor } from './token-extractor.js';
import { ContentExtractor } from './content-extractor.js';
import { VariableExtractor } from './variable-extractor.js';
import type { FigmaAnalysis } from './types.js';

export class Analyzer {
  private figmaClient: FigmaClient;
  private detector: ComponentDetector;
  private tokenExtractor: TokenExtractor;
  private contentExtractor: ContentExtractor;
  private variableExtractor: VariableExtractor;

  constructor(figmaToken: string) {
    this.figmaClient = new FigmaClient(figmaToken);
    this.detector = new ComponentDetector();
    this.tokenExtractor = new TokenExtractor();
    this.contentExtractor = new ContentExtractor();
    this.variableExtractor = new VariableExtractor();
  }

  async analyze(figmaUrl: string): Promise<FigmaAnalysis> {
    const fileKey = this.figmaClient.extractFileKey(figmaUrl);

    const [file, styles, variablesResp] = await Promise.all([
      this.figmaClient.getFile(fileKey, { depth: 4 }),
      this.figmaClient.getStyles(fileKey).catch(() => undefined),
      this.figmaClient.getVariables(fileKey).catch(() => undefined),
    ]);

    const detection = this.detector.detect(file);
    const designTokens = this.tokenExtractor.extract(file, styles);
    const designSystem = variablesResp
      ? this.variableExtractor.extract(variablesResp)
      : undefined;

    const pages = (file.document.children ?? []).map(page => ({
      id: page.id,
      name: page.name,
      nodes: page.children ?? [],
    }));

    const allPageNodes = pages.flatMap(p => p.nodes);
    const content = this.contentExtractor.extract(allPageNodes);

    return {
      projectMeta: {
        figmaUrl,
        fileName: file.name,
        lastModified: file.lastModified,
      },
      projectType: detection.projectType,
      pages,
      components: detection.components,
      designTokens,
      content,
      designSystem,
    };
  }
}

export { ComponentDetector } from './component-detector.js';
export { TokenExtractor } from './token-extractor.js';
export { ContentExtractor } from './content-extractor.js';
export type { ExtractedContent, TextContent, ImageContent, SectionContent } from './content-extractor.js';
export { LayoutEngine } from './layout-engine.js';
export type { LayoutCSS, FrameLayout, ResponsiveInfo, ResponsiveVariant, ConstraintAnalysis, GridInfo, GridChildPosition } from './layout-engine.js';
export { VariableExtractor } from './variable-extractor.js';
export type { DesignSystem, DesignCollection, DesignVariable } from './variable-extractor.js';
export * from './types.js';
