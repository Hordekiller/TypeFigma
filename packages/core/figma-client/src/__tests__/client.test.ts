import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FigmaClient } from '../client.js';
import { FigmaApiError, FigmaRateLimitError, FigmaNotFoundError, FigmaForbiddenError } from '../errors.js';

describe('FigmaClient', () => {
  let client: FigmaClient;

  beforeEach(() => {
    client = new FigmaClient('test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should accept string token', () => {
      const c = new FigmaClient('personal-token');
      expect(c).toBeInstanceOf(FigmaClient);
    });

    it('should accept config object with accessToken', () => {
      const c = new FigmaClient({ accessToken: 'pat' });
      expect(c).toBeInstanceOf(FigmaClient);
    });

    it('should accept config object with oauthToken', () => {
      const c = new FigmaClient({ oauthToken: 'oauth-token' });
      expect(c).toBeInstanceOf(FigmaClient);
    });

    it('should accept config with custom retries', () => {
      const c = new FigmaClient({ accessToken: 't', maxRetries: 5, baseRetryDelayMs: 500 });
      expect(c).toBeInstanceOf(FigmaClient);
    });

    it('should accept config with cache disabled', () => {
      const c = new FigmaClient({ accessToken: 't', cacheEnabled: false });
      expect(c).toBeInstanceOf(FigmaClient);
    });

    it('should accept config with rate limiting disabled', () => {
      const c = new FigmaClient({ accessToken: 't', rateLimitingEnabled: false });
      expect(c).toBeInstanceOf(FigmaClient);
    });
  });

  describe('extractFileKey', () => {
    it('should extract key from standard figma.com/file URL', () => {
      expect(client.extractFileKey('https://www.figma.com/file/abc123def/My-Design'))
        .toBe('abc123def');
    });

    it('should extract key from figma.com/design URL', () => {
      expect(client.extractFileKey('https://www.figma.com/design/xyz789/Another-Design'))
        .toBe('xyz789');
    });

    it('should extract key from proto URL', () => {
      expect(client.extractFileKey('https://www.figma.com/proto/abc123/Proto-Name'))
        .toBe('abc123');
    });

    it('should extract key from slides URL', () => {
      expect(client.extractFileKey('https://www.figma.com/slides/slideKey/Slide-Name'))
        .toBe('slideKey');
    });

    it('should extract key with query params', () => {
      expect(client.extractFileKey('https://www.figma.com/file/abc123/Test?node-id=0%3A1'))
        .toBe('abc123');
    });

    it('should extract key without filename', () => {
      expect(client.extractFileKey('https://www.figma.com/file/abc123'))
        .toBe('abc123');
    });

    it('should handle URLs with trailing slash', () => {
      expect(client.extractFileKey('https://www.figma.com/file/abc123/Design/'))
        .toBe('abc123');
    });

    it('should throw for invalid URLs', () => {
      expect(() => client.extractFileKey('https://example.com'))
        .toThrow('Invalid Figma URL');
    });

    it('should throw for empty string', () => {
      expect(() => client.extractFileKey(''))
        .toThrow('Invalid Figma URL');
    });

    it('should trim whitespace from URL', () => {
      expect(client.extractFileKey('  https://www.figma.com/file/abc123/Design  '))
        .toBe('abc123');
    });
  });

  describe('parseFigmaUrl', () => {
    it('should return fileKey and type for file URLs', () => {
      const parsed = client.parseFigmaUrl('https://www.figma.com/file/abc123/Design');
      expect(parsed.fileKey).toBe('abc123');
      expect(parsed.type).toBe('file');
      expect(parsed.fileName).toBe('Design');
    });

    it('should return nodeId when present', () => {
      const parsed = client.parseFigmaUrl('https://www.figma.com/file/abc123/Design?node-id=123%3A456');
      expect(parsed.nodeId).toBe('123:456');
    });

    it('should return type design for design URLs', () => {
      const parsed = client.parseFigmaUrl('https://www.figma.com/design/xyz789/Test');
      expect(parsed.type).toBe('design');
    });

    it('should not have fileName for key-only URLs', () => {
      const parsed = client.parseFigmaUrl('https://www.figma.com/file/abc123');
      expect(parsed.fileName).toBeUndefined();
    });
  });

  describe('API endpoint URLs', () => {
    let c: FigmaClient;

    beforeEach(() => {
      c = new FigmaClient({ accessToken: 'test-token', rateLimitingEnabled: false });
    });

    function mockFetch(jsonData: unknown) {
      return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(jsonData),
        headers: { get: () => null },
      } as unknown as Response);
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('getFile should call /files/:key', async () => {
      const spy = mockFetch({ name: 'test' });
      await c.getFile('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123',
        expect.objectContaining({ headers: { 'X-Figma-Token': 'test-token' } }),
      );
    });

    it('getFile should pass version and depth params', async () => {
      const spy = mockFetch({});
      await c.getFile('key123', { version: 'v1', depth: 2 });
      const url = spy.mock.calls[0][0] as string;
      expect(url).toContain('version=v1');
      expect(url).toContain('depth=2');
    });

    it('getFileNodes should call /files/:key/nodes with ids', async () => {
      const spy = mockFetch({ nodes: {} });
      await c.getFileNodes('key123', ['1:1', '1:2']);
      const url = spy.mock.calls[0][0] as string;
      expect(url).toContain('/files/key123/nodes');
      expect(url).toContain('ids=1%3A1%2C1%3A2');
    });

    it('getFileVersions should call /files/:key/versions', async () => {
      const spy = mockFetch({ versions: [] });
      await c.getFileVersions('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/versions',
        expect.any(Object),
      );
    });

    it('getFileMeta should call /files/:key/meta', async () => {
      const spy = mockFetch({ name: 'test' });
      await c.getFileMeta('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/meta',
        expect.any(Object),
      );
    });

    it('getImageUrls should call /images/:key with ids', async () => {
      const spy = mockFetch({ images: { '1:1': 'https://img.url' } });
      const result = await c.getImageUrls('key123', ['1:1']);
      const url = spy.mock.calls[0][0] as string;
      expect(url).toContain('/images/key123');
      expect(url).toContain('ids=1%3A1');
      expect(result['1:1']).toBe('https://img.url');
    });

    it('getImageFills should call /files/:key/images', async () => {
      const spy = mockFetch({ meta: { images: {} } });
      await c.getImageFills('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/images',
        expect.any(Object),
      );
    });

    it('getFilePublishedComponents should call /files/:key/components', async () => {
      const spy = mockFetch({ components: [] });
      await c.getFilePublishedComponents('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/components',
        expect.any(Object),
      );
    });

    it('getFilePublishedStyles should call /files/:key/styles', async () => {
      const spy = mockFetch({ styles: [] });
      await c.getFilePublishedStyles('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/styles',
        expect.any(Object),
      );
    });

    it('getComponent should call /components/:key', async () => {
      const spy = mockFetch({ key: 'ckey' });
      await c.getComponent('ckey');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/components/ckey',
        expect.any(Object),
      );
    });

    it('getComponentSet should call /component_sets/:key', async () => {
      const spy = mockFetch({ key: 'cskey' });
      await c.getComponentSet('cskey');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/component_sets/cskey',
        expect.any(Object),
      );
    });

    it('getStyle should call /styles/:key', async () => {
      const spy = mockFetch({ key: 'skey' });
      await c.getStyle('skey');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/styles/skey',
        expect.any(Object),
      );
    });

    it('getVariables should call /variables/local', async () => {
      const spy = mockFetch({ meta: { variables: {}, variableCollections: {} } });
      await c.getVariables('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/variables/local',
        expect.any(Object),
      );
    });

    it('getPublishedVariables should call /variables/published', async () => {
      const spy = mockFetch({ meta: { variables: {}, variableCollections: {} } });
      await c.getPublishedVariables('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/variables/published',
        expect.any(Object),
      );
    });

    it('getComments should call /files/:key/comments', async () => {
      const spy = mockFetch({ comments: [] });
      await c.getComments('key123');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/comments',
        expect.any(Object),
      );
    });

    it('postComment should send POST with body', async () => {
      const spy = mockFetch({ id: 'c1' });
      await c.postComment('key123', { message: 'Nice!' });
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/comments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ message: 'Nice!' }),
        }),
      );
    });

    it('deleteComment should send DELETE', async () => {
      const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true, json: () => Promise.resolve({}),
        headers: { get: () => null },
      } as unknown as Response);
      await c.deleteComment('key123', 'c1');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/key123/comments/c1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('getTeamComponents should call /teams/:id/components', async () => {
      const spy = mockFetch({ components: [] });
      await client.getTeamComponents('team1');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/teams/team1/components',
        expect.any(Object),
      );
    });

    it('getTeamProjects should call /teams/:id/projects', async () => {
      const spy = mockFetch({ projects: [] });
      await client.getTeamProjects('team1');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/teams/team1/projects',
        expect.any(Object),
      );
    });

    it('getProjectFiles should call /projects/:id/files', async () => {
      const spy = mockFetch({ files: [] });
      await client.getProjectFiles('proj1');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/projects/proj1/files',
        expect.any(Object),
      );
    });

    it('getMe should call /me', async () => {
      const spy = mockFetch({ id: 'u1', handle: 'test' });
      await client.getMe();
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma.com/v1/me',
        expect.any(Object),
      );
    });
  });

  describe('Error handling and retries', () => {
    function mockErrorResponse(status: number, statusText: string) {
      return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false, status, statusText,
        headers: { get: () => null },
        text: () => Promise.resolve(''),
      } as unknown as Response);
    }

    it('should throw FigmaRateLimitError on 429', async () => {
      const c = new FigmaClient({ accessToken: 't', maxRetries: 1, baseRetryDelayMs: 10 });
      mockErrorResponse(429, 'Too Many Requests');
      await expect(c.getFile('k')).rejects.toThrow(FigmaRateLimitError);
    });

    it('should throw FigmaNotFoundError on 404', async () => {
      const c = new FigmaClient({ accessToken: 't', maxRetries: 1, baseRetryDelayMs: 10 });
      mockErrorResponse(404, 'Not Found');
      await expect(c.getFile('k')).rejects.toThrow(FigmaNotFoundError);
    });

    it('should throw FigmaForbiddenError on 403', async () => {
      const c = new FigmaClient({ accessToken: 't', maxRetries: 1, baseRetryDelayMs: 10 });
      mockErrorResponse(403, 'Forbidden');
      await expect(c.getFile('k')).rejects.toThrow(FigmaForbiddenError);
    });

    it('should retry on 429 and succeed', async () => {
      const c = new FigmaClient({ accessToken: 't', maxRetries: 3, baseRetryDelayMs: 5, rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch');
      spy
        .mockResolvedValueOnce({
          ok: false, status: 429, statusText: 'Too Many',
          headers: { get: () => null }, text: () => Promise.resolve(''),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true, json: () => Promise.resolve({ name: 'retried' }),
        } as unknown as Response);

      const result = await c.getFile('k');
      expect(result).toEqual({ name: 'retried' });
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should retry on 500 and succeed', async () => {
      const c = new FigmaClient({ accessToken: 't', maxRetries: 3, baseRetryDelayMs: 5, rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch');
      spy
        .mockResolvedValueOnce({
          ok: false, status: 500, statusText: 'Server Error',
          headers: { get: () => null }, text: () => Promise.resolve(''),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true, json: () => Promise.resolve({ name: 'recovered' }),
        } as unknown as Response);

      const result = await c.getFile('k');
      expect(result).toEqual({ name: 'recovered' });
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should exhaust retries on persistent 429', async () => {
      const c = new FigmaClient({ accessToken: 't', maxRetries: 2, baseRetryDelayMs: 5, rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch');
      spy.mockResolvedValue({
        ok: false, status: 429, statusText: 'Limit',
        headers: { get: () => null }, text: () => Promise.resolve(''),
      } as unknown as Response);

      await expect(c.getFile('k')).rejects.toThrow('Limit');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 403', async () => {
      const c = new FigmaClient({ accessToken: 't', maxRetries: 3, baseRetryDelayMs: 5, rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch');
      spy.mockResolvedValue({
        ok: false, status: 403, statusText: 'Forbidden',
        headers: { get: () => null }, text: () => Promise.resolve(''),
      } as unknown as Response);

      await expect(c.getFile('k')).rejects.toThrow('Forbidden');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authentication', () => {
    it('should use X-Figma-Token for PAT', async () => {
      const c = new FigmaClient({ accessToken: 'my-pat', rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true, json: () => Promise.resolve({}),
        headers: { get: () => null },
      } as unknown as Response);
      await c.getFile('k');
      expect(spy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ headers: { 'X-Figma-Token': 'my-pat' } }),
      );
    });

    it('should use Bearer token for OAuth', async () => {
      const c = new FigmaClient({ oauthToken: 'oauth-tok', rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true, json: () => Promise.resolve({}),
        headers: { get: () => null },
      } as unknown as Response);
      await c.getFile('k');
      expect(spy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ headers: { 'Authorization': 'Bearer oauth-tok' } }),
      );
    });
  });

  describe('Gov mode', () => {
    it('should use figma-gov.com base URL', async () => {
      const c = new FigmaClient({ accessToken: 't', rateLimitingEnabled: false });
      c.setGovMode(true);
      const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true, json: () => Promise.resolve({}),
        headers: { get: () => null },
      } as unknown as Response);
      await c.getFile('k');
      expect(spy).toHaveBeenCalledWith(
        'https://api.figma-gov.com/v1/files/k',
        expect.any(Object),
      );
    });
  });

  describe('Cache', () => {
    it('should cache GET responses', async () => {
      const c = new FigmaClient({ accessToken: 't', cacheEnabled: true, rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true, json: () => Promise.resolve({ name: 'cached' }),
      } as Response);

      await c.getFile('k');
      await c.getFile('k');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should skip cache when disabled', async () => {
      const c = new FigmaClient({ accessToken: 't', cacheEnabled: false, rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true, json: () => Promise.resolve({}),
      } as Response);

      await c.getFile('k');
      await c.getFile('k');

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should clear cache', async () => {
      const c = new FigmaClient({ accessToken: 't', cacheEnabled: true, rateLimitingEnabled: false });
      const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true, json: () => Promise.resolve({}),
      } as Response);

      await c.getFile('k');
      c.clearCache();
      await c.getFile('k');

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Pagination iterators', () => {
    it('iterateTeamComponents should yield across pages', async () => {
      const c = new FigmaClient({ accessToken: 't', rateLimitingEnabled: false });
      let callCount = 0;
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        callCount++;
        return {
          ok: true,
          json: () => {
            if (callCount === 1) {
              return Promise.resolve({
                components: [{ key: 'c1', name: 'A' }, { key: 'c2', name: 'B' }],
                cursor: { next: 'p2' },
              });
            }
            return Promise.resolve({ components: [{ key: 'c3', name: 'C' }] });
          },
        } as Response;
      });

      const names: string[] = [];
      for await (const comp of c.iterateTeamComponents('team1')) {
        names.push(comp.name);
        if (names.length >= 3) break; // safety
      }
      expect(names).toEqual(['A', 'B', 'C']);
    });
  });
});

describe('Error classes', () => {
  it('FigmaRateLimitError should parse rate limit headers', () => {
    const headers = {
      get: (key: string) => {
        if (key === 'X-Figma-Rate-Limit-Type') return 'high';
        if (key === 'X-Figma-Rate-Limit-Remaining') return '5';
        if (key === 'X-Figma-Rate-Limit-Max') return '20';
        if (key === 'X-Figma-Rate-Limit-Reset') return '30';
        return null;
      },
    } as Headers;
    const err = new FigmaRateLimitError(429, 'Too Many', headers);
    expect(err.limitType).toBe('high');
    expect(err.limitRemaining).toBe(5);
    expect(err.limitMax).toBe(20);
    expect(err.limitReset).toBe(30);
  });

  it('should detect error types correctly', () => {
    const err429 = new FigmaRateLimitError(429, 'limit', undefined);
    expect(err429.isRateLimit).toBe(true);
    expect(err429.isNotFound).toBe(false);
    expect(err429.isServerError).toBe(false);

    const err404 = new FigmaNotFoundError('missing');
    expect(err404.isNotFound).toBe(true);
    expect(err404.isRateLimit).toBe(false);

    const err500 = new FigmaApiError(500, 'internal');
    expect(err500.isServerError).toBe(true);
  });
});
