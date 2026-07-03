import type {
  FigmaFile,
  FigmaStyles,
  FigmaVariablesResponse,
  FigmaClientConfig,
  FigmaFileNodesResponse,
  FigmaImageResponse,
  FigmaImageFillsResponse,
  FigmaFileVersionsResponse,
  FigmaFileMeta,
  FigmaComment,
  FigmaCreateCommentRequest,
  FigmaCreateReactionRequest,
  FigmaTeamComponentsResponse,
  FigmaTeamStylesResponse,
  FigmaPublishedComponent,
  FigmaPublishedStyle,
  FigmaMe,
  FigmaTeamProject,
  FigmaProjectFile,
  ParsedFigmaUrl,
  FigmaReaction,
  FigmaAiUsageResponse,
  FigmaOEmbed,
  FigmaActivityLogsResponse,
  FigmaDevResourcesResponse,
  FigmaWebhook,
  FigmaWebhooksResponse,
  FigmaWebhookCreateRequest,
  FigmaWebhookUpdateRequest,
  FigmaLibraryAnalyticsResponse,
} from './types.js';
import { createFigmaError, FigmaApiError } from './errors.js';
import { RateLimiter } from './rate-limiter.js';
import { FigmaCache } from './cache.js';

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_GOV_API_BASE = 'https://api.figma-gov.com/v1';
const DEFAULT_MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class FigmaClient {
  private accessToken?: string;
  private oauthToken?: string;
  private maxRetries: number;
  private baseRetryDelayMs: number;
  private apiBase: string;
  private rateLimiter: RateLimiter;
  private cache: FigmaCache;
  private cacheEnabled: boolean;
  private rateLimitingEnabled: boolean;

  constructor(config: FigmaClientConfig | string) {
    this.maxRetries = DEFAULT_MAX_RETRIES;
    this.baseRetryDelayMs = INITIAL_RETRY_DELAY_MS;
    this.cacheEnabled = true;
    this.rateLimitingEnabled = true;
    this.cache = new FigmaCache();
    this.apiBase = FIGMA_API_BASE;
    this.rateLimiter = new RateLimiter();

    if (typeof config === 'string') {
      this.accessToken = config;
      this.oauthToken = undefined;
    } else {
      this.accessToken = config.accessToken;
      this.oauthToken = config.oauthToken;
      if (config.maxRetries !== undefined) this.maxRetries = config.maxRetries;
      if (config.baseRetryDelayMs !== undefined) this.baseRetryDelayMs = config.baseRetryDelayMs;
      if (config.cacheEnabled !== undefined) this.cacheEnabled = config.cacheEnabled;
      if (config.cacheMaxEntries !== undefined || config.cacheTtlMs !== undefined) {
        this.cache = new FigmaCache(
          config.cacheMaxEntries ?? 200,
          config.cacheTtlMs ?? 5 * 60 * 1000,
        );
      }
      if (config.rateLimitingEnabled !== undefined) this.rateLimitingEnabled = config.rateLimitingEnabled;
    }
  }

  setGovMode(enabled: boolean): void {
    this.apiBase = enabled ? FIGMA_GOV_API_BASE : FIGMA_API_BASE;
  }

  // ── URL Parsing ──────────────────────────────────────────

  extractFileKey(url: string): string {
    return this.parseFigmaUrl(url).fileKey;
  }

  parseFigmaUrl(url: string): ParsedFigmaUrl {
    const sanitized = url.trim();

    const patterns: Array<{ regex: RegExp; type: ParsedFigmaUrl['type'] }> = [
      { regex: /figma\.com\/(file)\/([a-zA-Z0-9]+)(?:\/([^?#]+))?.*$/i, type: 'file' },
      { regex: /figma\.com\/(design)\/([a-zA-Z0-9]+)(?:\/([^?#]+))?.*$/i, type: 'design' },
      { regex: /figma\.com\/(proto)\/([a-zA-Z0-9]+)(?:\/([^?#]+))?.*$/i, type: 'proto' },
      { regex: /figma\.com\/(slides)\/([a-zA-Z0-9]+)(?:\/([^?#]+))?.*$/i, type: 'slides' },
      { regex: /figma\.com\/file\/([a-zA-Z0-9]+)/i, type: 'file' },
      { regex: /figma\.com\/design\/([a-zA-Z0-9]+)/i, type: 'design' },
    ];

    for (const { regex, type } of patterns) {
      const match = sanitized.match(regex);
      if (match?.[2] || (match?.[1] && patterns.indexOf({ regex, type } as any) > 3)) {
        const key = match[2] || match[1];
        const fileName = match[3] ? decodeURIComponent(match[3].replace(/\/$/, '')) : undefined;
        const nodeMatch = sanitized.match(/[?&]node-id=([^&]+)/);
        return {
          fileKey: key,
          fileName,
          nodeId: nodeMatch?.[1] ? decodeURIComponent(nodeMatch[1]) : undefined,
          type,
        };
      }
    }

    throw new Error(
      `Invalid Figma URL: could not extract file key. ` +
      `Expected format: https://www.figma.com/file/{key}/{name} or ` +
      `https://www.figma.com/design/{key}/{name}`,
    );
  }

  // ── File Endpoints ───────────────────────────────────────

  async getFile(
    fileKey: string,
    options?: {
      version?: string;
      ids?: string[];
      depth?: number;
      geometry?: 'paths';
      pluginData?: string;
      branchData?: boolean;
    },
  ): Promise<FigmaFile> {
    const params = this.toQueryString(options as Record<string, unknown>);
    return this.request<FigmaFile>('GET', `/files/${fileKey}${params}`);
  }

  async getFileNodes(
    fileKey: string,
    ids: string[],
    options?: {
      version?: string;
      depth?: number;
      geometry?: 'paths';
      pluginData?: string;
    },
  ): Promise<FigmaFileNodesResponse> {
    const allParams = { ids: ids.join(','), ...options };
    const params = this.toQueryString(allParams as Record<string, unknown>);
    return this.request<FigmaFileNodesResponse>('GET', `/files/${fileKey}/nodes${params}`);
  }

  async getFileVersions(
    fileKey: string,
    options?: { page_size?: number; before?: number; after?: number },
  ): Promise<FigmaFileVersionsResponse> {
    const params = this.toQueryString(options as Record<string, unknown>);
    return this.request<FigmaFileVersionsResponse>('GET', `/files/${fileKey}/versions${params}`);
  }

  async getFileMeta(fileKey: string): Promise<FigmaFileMeta> {
    return this.request<FigmaFileMeta>('GET', `/files/${fileKey}/meta`);
  }

  // ── Image Endpoints ──────────────────────────────────────

  async getImageUrls(
    fileKey: string,
    ids: string[],
    options?: {
      version?: string;
      scale?: number;
      format?: 'png' | 'jpg' | 'svg' | 'pdf';
      svgOutlineText?: boolean;
      svgIncludeId?: boolean;
      svgIncludeNodeId?: boolean;
      svgSimplifyStroke?: boolean;
      contentsOnly?: boolean;
      useAbsoluteBounds?: boolean;
    },
  ): Promise<Record<string, string | null>> {
    const allParams: Record<string, unknown> = { ids: ids.join(',') };
    if (options?.scale) allParams.scale = options.scale;
    if (options?.format) allParams.format = options.format;
    if (options?.version) allParams.version = options.version;
    if (options?.svgOutlineText !== undefined) allParams.svg_outline_text = options.svgOutlineText;
    if (options?.svgIncludeId !== undefined) allParams.svg_include_id = options.svgIncludeId;
    if (options?.svgIncludeNodeId !== undefined) allParams.svg_include_node_id = options.svgIncludeNodeId;
    if (options?.svgSimplifyStroke !== undefined) allParams.svg_simplify_stroke = options.svgSimplifyStroke;
    if (options?.contentsOnly !== undefined) allParams.contents_only = options.contentsOnly;
    if (options?.useAbsoluteBounds !== undefined) allParams.use_absolute_bounds = options.useAbsoluteBounds;

    const params = this.toQueryString(allParams);
    const result = await this.request<FigmaImageResponse>('GET', `/images/${fileKey}${params}`);
    return result.images;
  }

  async getImageFills(fileKey: string): Promise<Record<string, string>> {
    const result = await this.request<FigmaImageFillsResponse>('GET', `/files/${fileKey}/images`);
    return result.meta?.images ?? result.images ?? {};
  }

  // ── File Components & Styles ─────────────────────────────

  async getFilePublishedComponents(fileKey: string): Promise<FigmaPublishedComponent[]> {
    const result = await this.request<{ components: FigmaPublishedComponent[] }>(
      'GET', `/files/${fileKey}/components`,
    );
    return result.components;
  }

  async getFilePublishedComponentSets(fileKey: string): Promise<FigmaPublishedComponent[]> {
    const result = await this.request<{ component_sets: FigmaPublishedComponent[] }>(
      'GET', `/files/${fileKey}/component_sets`,
    );
    return result.component_sets;
  }

  async getFilePublishedStyles(fileKey: string): Promise<FigmaPublishedStyle[]> {
    const result = await this.request<{ styles: FigmaPublishedStyle[] }>(
      'GET', `/files/${fileKey}/styles`,
    );
    return result.styles;
  }

  /**
   * Backward-compatible method that matched the old FigmaStyles response shape.
   * For the newer published styles endpoint, use getFilePublishedStyles() instead.
   */
  async getStyles(fileKey: string): Promise<FigmaStyles> {
    return this.request<FigmaStyles>('GET', `/files/${fileKey}/styles`);
  }

  // ── Component/Style by Key ───────────────────────────────

  async getComponent(key: string): Promise<FigmaPublishedComponent> {
    return this.request<FigmaPublishedComponent>('GET', `/components/${key}`);
  }

  async getComponentSet(key: string): Promise<FigmaPublishedComponent> {
    return this.request<FigmaPublishedComponent>('GET', `/component_sets/${key}`);
  }

  async getStyle(key: string): Promise<FigmaPublishedStyle> {
    return this.request<FigmaPublishedStyle>('GET', `/styles/${key}`);
  }

  // ── Variables Endpoints ──────────────────────────────────

  async getVariables(fileKey: string): Promise<FigmaVariablesResponse> {
    return this.request<FigmaVariablesResponse>('GET', `/files/${fileKey}/variables/local`);
  }

  async getPublishedVariables(fileKey: string): Promise<FigmaVariablesResponse> {
    return this.request<FigmaVariablesResponse>('GET', `/files/${fileKey}/variables/published`);
  }

  // ── Comment Endpoints ────────────────────────────────────

  async getComments(fileKey: string): Promise<FigmaComment[]> {
    const result = await this.request<{ comments: FigmaComment[] }>(
      'GET', `/files/${fileKey}/comments`,
    );
    return result.comments;
  }

  async postComment(fileKey: string, body: FigmaCreateCommentRequest): Promise<FigmaComment> {
    return this.request<FigmaComment>('POST', `/files/${fileKey}/comments`, body);
  }

  async deleteComment(fileKey: string, commentId: string): Promise<void> {
    await this.request<void>('DELETE', `/files/${fileKey}/comments/${commentId}`);
  }

  async getCommentReactions(fileKey: string, commentId: string): Promise<FigmaReaction[]> {
    const result = await this.request<{ reactions: FigmaReaction[] }>(
      'GET', `/files/${fileKey}/comments/${commentId}/reactions`,
    );
    return result.reactions;
  }

  async postCommentReaction(fileKey: string, commentId: string, body: FigmaCreateReactionRequest): Promise<void> {
    await this.request<void>('POST', `/files/${fileKey}/comments/${commentId}/reactions`, body);
  }

  async deleteCommentReaction(fileKey: string, commentId: string, reactionId: string): Promise<void> {
    await this.request<void>('DELETE', `/files/${fileKey}/comments/${commentId}/reactions/${reactionId}`);
  }

  async *iterateCommentReactions(fileKey: string, commentId: string): AsyncIterableIterator<FigmaReaction> {
    let cursor: string | undefined;
    do {
      const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const result = await this.request<{ reactions: FigmaReaction[]; cursor?: { next: string } }>(
        'GET', `/files/${fileKey}/comments/${commentId}/reactions${params}`,
      );
      for (const reaction of result.reactions) {
        yield reaction;
      }
      cursor = result.cursor?.next;
    } while (cursor);
  }

  // ── Team Endpoints ───────────────────────────────────────

  async getTeamComponents(
    teamId: string,
    options?: { page_size?: number; cursor?: string },
  ): Promise<FigmaTeamComponentsResponse> {
    const params = this.toQueryString(options as Record<string, unknown>);
    return this.request<FigmaTeamComponentsResponse>('GET', `/teams/${teamId}/components${params}`);
  }

  async *iterateTeamComponents(teamId: string): AsyncIterableIterator<FigmaPublishedComponent> {
    let cursor: string | undefined;
    do {
      const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const result = await this.request<FigmaTeamComponentsResponse>(
        'GET', `/teams/${teamId}/components${params}`,
      );
      for (const component of result.components) {
        yield component;
      }
      cursor = result.cursor?.next;
    } while (cursor);
  }

  async getTeamComponentSets(
    teamId: string,
    options?: { page_size?: number; cursor?: string },
  ): Promise<FigmaTeamComponentsResponse> {
    const params = this.toQueryString(options as Record<string, unknown>);
    return this.request<FigmaTeamComponentsResponse>('GET', `/teams/${teamId}/component_sets${params}`);
  }

  async getTeamStyles(
    teamId: string,
    options?: { page_size?: number; cursor?: string },
  ): Promise<FigmaTeamStylesResponse> {
    const params = this.toQueryString(options as Record<string, unknown>);
    return this.request<FigmaTeamStylesResponse>('GET', `/teams/${teamId}/styles${params}`);
  }

  async *iterateTeamStyles(teamId: string): AsyncIterableIterator<FigmaPublishedStyle> {
    let cursor: string | undefined;
    do {
      const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const result = await this.request<FigmaTeamStylesResponse>(
        'GET', `/teams/${teamId}/styles${params}`,
      );
      for (const style of result.styles) {
        yield style;
      }
      cursor = result.cursor?.next;
    } while (cursor);
  }

  async getTeamProjects(teamId: string): Promise<FigmaTeamProject[]> {
    const result = await this.request<{ projects: FigmaTeamProject[] }>(
      'GET', `/teams/${teamId}/projects`,
    );
    return result.projects;
  }

  async getProjectFiles(projectId: string): Promise<FigmaProjectFile[]> {
    const result = await this.request<{ files: FigmaProjectFile[] }>(
      'GET', `/projects/${projectId}/files`,
    );
    return result.files;
  }

  // ── User Endpoints ───────────────────────────────────────

  async getMe(): Promise<FigmaMe> {
    return this.request<FigmaMe>('GET', '/me');
  }

  // ── Internal Request Method ─────────────────────────────

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    attempt: number = 1,
  ): Promise<T> {
    if (this.rateLimitingEnabled) {
      const tier = this.rateLimiter.getEndpointTier(path);
      await this.rateLimiter.acquire(tier);
    }

    const cacheKey = this.cache.buildKey(path, { method, body: JSON.stringify(body) });
    if (this.cacheEnabled && method === 'GET') {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== undefined) return cached;
    }

    try {
      const response = await this.executeRequest(method, path, body);

      if (this.rateLimitingEnabled) {
        const tier = this.rateLimiter.getEndpointTier(path);
        this.rateLimiter.updateFromHeaders(tier, response.headers);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorBody: unknown;
        try { errorBody = JSON.parse(errorText); } catch { errorBody = errorText; }

        const figmaError = createFigmaError(
          response.status,
          response.statusText || errorText || 'Unknown error',
          response.headers,
          errorBody,
        );

        if (
          attempt < this.maxRetries &&
          (figmaError.isRateLimit || figmaError.isServerError)
        ) {
          await this.delayBeforeRetry(figmaError, attempt);
          return this.request<T>(method, path, body, attempt + 1);
        }

        throw figmaError;
      }

      if (method === 'DELETE' || response.status === 204) {
        return undefined as T;
      }

      const data = await response.json() as T;

      if (this.cacheEnabled && method === 'GET') {
        this.cache.set(cacheKey, data);
      }

      return data;
    } catch (err) {
      if (err instanceof FigmaApiError) throw err;

      if (attempt < this.maxRetries) {
        const delay = this.baseRetryDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request<T>(method, path, body, attempt + 1);
      }

      throw new Error(`Request failed after ${attempt} attempts: ${(err as Error).message}`);
    }
  }

  private async executeRequest(method: HttpMethod, path: string, body?: unknown): Promise<Response> {
    const url = `${this.apiBase}${path}`;
    const headers: Record<string, string> = {};

    if (this.accessToken) {
      headers['X-Figma-Token'] = this.accessToken;
    } else if (this.oauthToken) {
      headers['Authorization'] = `Bearer ${this.oauthToken}`;
    }

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  private async delayBeforeRetry(error: FigmaApiError, attempt: number): Promise<void> {
    if (error.retryAfterMs) {
      await new Promise(resolve => setTimeout(resolve, error.retryAfterMs!));
      return;
    }
    const delay = this.baseRetryDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private toQueryString(options?: Record<string, unknown>): string {
    if (!options) return '';
    const entries = Object.entries(options).filter(
      ([, v]) => v !== undefined && v !== null,
    );
    if (entries.length === 0) return '';
    return '?' + entries.map(([k, v]) =>
      `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    ).join('&');
  }

  // ── AI Usage API ──────────────────────────────────────────

  async getAiUsage(
    options?: { start_date?: string; end_date?: string; cursor?: string },
  ): Promise<FigmaAiUsageResponse> {
    const params = this.toQueryString(options as Record<string, unknown>);
    return this.request<FigmaAiUsageResponse>('GET', `/ai-usage/daily${params}`);
  }

  // ── oEmbed API ────────────────────────────────────────────

  async getOEmbed(url: string): Promise<FigmaOEmbed> {
    return this.request<FigmaOEmbed>('GET', `/oembed?url=${encodeURIComponent(url)}`);
  }

  // ── Activity Logs (Gov only) ──────────────────────────────

  async getActivityLogs(
    options?: { cursor?: string; limit?: number },
  ): Promise<FigmaActivityLogsResponse> {
    const params = this.toQueryString(options as Record<string, unknown>);
    return this.request<FigmaActivityLogsResponse>('GET', `/activity_logs${params}`);
  }

  // ── Dev Resources ─────────────────────────────────────────

  async getDevResources(fileKey: string): Promise<FigmaDevResourcesResponse> {
    return this.request<FigmaDevResourcesResponse>('GET', `/files/${fileKey}/dev_resources`);
  }

  // ── Webhooks ──────────────────────────────────────────────

  async getWebhooks(teamId: string): Promise<FigmaWebhooksResponse> {
    return this.request<FigmaWebhooksResponse>('GET', `/teams/${teamId}/webhooks`);
  }

  async createWebhook(teamId: string, body: FigmaWebhookCreateRequest): Promise<FigmaWebhook> {
    return this.request<FigmaWebhook>('POST', `/teams/${teamId}/webhooks`, body);
  }

  async getWebhook(webhookId: string): Promise<FigmaWebhook> {
    return this.request<FigmaWebhook>('GET', `/webhooks/${webhookId}`);
  }

  async updateWebhook(webhookId: string, body: FigmaWebhookUpdateRequest): Promise<FigmaWebhook> {
    return this.request<FigmaWebhook>('PUT', `/webhooks/${webhookId}`, body);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.request<void>('DELETE', `/webhooks/${webhookId}`);
  }

  // ── Library Analytics ─────────────────────────────────────

  async getLibraryAnalytics(fileKey: string): Promise<FigmaLibraryAnalyticsResponse> {
    return this.request<FigmaLibraryAnalyticsResponse>('GET', `/files/${fileKey}/library_analytics`);
  }

  // ── Cache Control ────────────────────────────────────────

  clearCache(): void {
    this.cache.clear();
  }

  resetRateLimiter(): void {
    this.rateLimiter.reset();
  }
}
