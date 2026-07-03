import type { FigmaFile, FigmaStyles, FigmaVariablesResponse } from './types.js';

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const DEFAULT_MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

export class FigmaClient {
  private accessToken: string;
  private maxRetries: number;
  private baseRetryDelayMs: number;

  constructor(accessToken: string, maxRetries: number = DEFAULT_MAX_RETRIES, baseRetryDelayMs: number = INITIAL_RETRY_DELAY_MS) {
    this.accessToken = accessToken;
    this.maxRetries = maxRetries;
    this.baseRetryDelayMs = baseRetryDelayMs;
  }

  private async request<T>(path: string, attempt: number = 1): Promise<T> {
    const url = `${FIGMA_API_BASE}${path}`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    if (
      attempt < this.maxRetries &&
      (response.status === 429 || response.status >= 500)
    ) {
      const retryAfter = response.headers.get('Retry-After');
      const baseDelay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : this.baseRetryDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 500;
      const delay = baseDelay + jitter;

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.request<T>(path, attempt + 1);
    }

    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
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
