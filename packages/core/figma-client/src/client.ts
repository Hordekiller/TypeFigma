import type { FigmaFile, FigmaStyles, FigmaVariablesResponse } from './types.js';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

export class FigmaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${FIGMA_API_BASE}${path}`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    return this.request<FigmaFile>(`/files/${fileKey}`);
  }

  async getFileNodes(fileKey: string, ids: string[]): Promise<FigmaFile> {
    const idsParam = ids.join(',');
    return this.request<FigmaFile>(`/files/${fileKey}/nodes?ids=${idsParam}`);
  }

  async getStyles(fileKey: string): Promise<FigmaStyles> {
    return this.request<FigmaStyles>(`/files/${fileKey}/styles`);
  }

  async getImageUrls(fileKey: string, ids: string[]): Promise<Record<string, string>> {
    const idsParam = ids.join(',');
    const result = await this.request<{ images: Record<string, string> }>(`/images/${fileKey}?ids=${idsParam}`);
    return result.images;
  }

  async getVariables(fileKey: string): Promise<FigmaVariablesResponse> {
    return this.request<FigmaVariablesResponse>(`/files/${fileKey}/variables/local`);
  }

  extractFileKey(url: string): string {
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/,
      /figma\.com\/design\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    throw new Error('Invalid Figma URL: could not extract file key');
  }
}
