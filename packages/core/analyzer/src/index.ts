import { FigmaClient } from '@typefigma/figma-client';
import { ComponentDetector } from './component-detector.js';
import { TokenExtractor } from './token-extractor.js';
import type { FigmaAnalysis } from './types.js';

export class Analyzer {
  private figmaClient: FigmaClient;
  private detector: ComponentDetector;
  private tokenExtractor: TokenExtractor;

  constructor(figmaToken: string) {
    this.figmaClient = new FigmaClient(figmaToken);
    this.detector = new ComponentDetector();
    this.tokenExtractor = new TokenExtractor();
  }

  async analyze(figmaUrl: string): Promise<FigmaAnalysis> {
    const fileKey = this.figmaClient.extractFileKey(figmaUrl);

    const [file, styles] = await Promise.all([
      this.figmaClient.getFile(fileKey),
      this.figmaClient.getStyles(fileKey).catch(() => undefined),
    ]);

    const detection = this.detector.detect(file);
    const designTokens = this.tokenExtractor.extract(file, styles);

    const pages = (file.document.children ?? []).map(page => ({
      id: page.id,
      name: page.name,
      nodes: page.children ?? [],
    }));

    return {
      projectType: detection.projectType,
      confidence: detection.confidence,
      pages,
      components: detection.components,
      designTokens,
    };
  }
}

export { ComponentDetector } from './component-detector.js';
export { TokenExtractor } from './token-extractor.js';
export * from './types.js';
