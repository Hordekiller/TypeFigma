import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FigmaClient } from '../client.js';

describe('FigmaClient', () => {
  let client: FigmaClient;

  beforeEach(() => {
    client = new FigmaClient('test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractFileKey', () => {
    it('should extract file key from standard figma.com/file URL', () => {
      const key = client.extractFileKey('https://www.figma.com/file/abc123def/My-Design');
      expect(key).toBe('abc123def');
    });

    it('should extract file key from figma.com/design URL', () => {
      const key = client.extractFileKey('https://www.figma.com/design/xyz789/Another-Design');
      expect(key).toBe('xyz789');
    });

    it('should extract file key with query params', () => {
      const key = client.extractFileKey('https://www.figma.com/file/abc123/Test?node-id=0%3A1');
      expect(key).toBe('abc123');
    });

    it('should throw for invalid URLs', () => {
      expect(() => client.extractFileKey('https://example.com')).toThrow('Invalid Figma URL');
    });
  });

  describe('API calls', () => {
    it('should call fetch with correct headers on getFile', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ name: 'test' }) };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response);

      await client.getFile('test-key');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-key',
        { headers: { 'X-Figma-Token': 'test-token' } },
      );
    });

    it('should call fetch with correct URL on getStyles', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response);

      await client.getStyles('test-key');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-key/styles',
        expect.any(Object),
      );
    });

    it('should call fetch with correct URL on getVariables', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({}) };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response);

      await client.getVariables('test-key');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/files/test-key/variables/local',
        expect.any(Object),
      );
    });

    it('should call fetch with correct URL on getImageUrls', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ images: {} }) };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response);

      await client.getImageUrls('test-key', ['node1', 'node2']);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.figma.com/v1/images/test-key?ids=node1,node2',
        expect.any(Object),
      );
    });

    it('should throw on non-ok response', async () => {
      const mockResponse = { ok: false, status: 403, statusText: 'Forbidden', headers: { get: () => null } };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as unknown as Response);

      await expect(client.getFile('test-key')).rejects.toThrow('Figma API error: 403 Forbidden');
    });

    it('should throw on 403 without retrying', async () => {
      const mockFetch = vi.spyOn(globalThis, 'fetch');
      mockFetch.mockResolvedValue({ ok: false, status: 403, statusText: 'Forbidden', headers: { get: () => null } } as unknown as Response);

      await expect(client.getFile('test-key')).rejects.toThrow('Figma API error: 403 Forbidden');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 429 and succeed', async () => {
      const fastClient = new FigmaClient('test-token', 3, 10);
      const mockFetch = vi.spyOn(globalThis, 'fetch');
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests', headers: { get: () => null } } as unknown as Response)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ name: 'retried' }) } as unknown as Response);

      vi.spyOn(Math, 'random').mockReturnValue(0);
      const result = await fastClient.getFile('test-key');

      expect(result).toEqual({ name: 'retried' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should retry on 500 and succeed', async () => {
      const fastClient = new FigmaClient('test-token', 3, 10);
      const mockFetch = vi.spyOn(globalThis, 'fetch');
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error', headers: { get: () => null } } as unknown as Response)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ name: 'recovered' }) } as unknown as Response);

      vi.spyOn(Math, 'random').mockReturnValue(0);
      const result = await fastClient.getFile('test-key');

      expect(result).toEqual({ name: 'recovered' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should respect Retry-After header', async () => {
      const fastClient = new FigmaClient('test-token', 3, 10);
      const mockFetch = vi.spyOn(globalThis, 'fetch');
      const headersWithRetry = { get: (key: string) => key === 'Retry-After' ? '1' : null };
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests', headers: headersWithRetry } as unknown as Response)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as unknown as Response);

      await expect(fastClient.getFile('test-key')).resolves.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should exhaust retries on persistent 429', async () => {
      const fastClient = new FigmaClient('test-token', 3, 10);
      const mockFetch = vi.spyOn(globalThis, 'fetch');
      mockFetch.mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests', headers: { get: () => null } } as unknown as Response);

      vi.spyOn(Math, 'random').mockReturnValue(0);
      await expect(fastClient.getFile('test-key')).rejects.toThrow('Figma API error: 429 Too Many Requests');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should use custom maxRetries=2', async () => {
      const fastClient = new FigmaClient('test-token', 2, 10);
      const mockFetch = vi.spyOn(globalThis, 'fetch');
      mockFetch.mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests', headers: { get: () => null } } as unknown as Response);

      vi.spyOn(Math, 'random').mockReturnValue(0);
      await expect(fastClient.getFile('test-key')).rejects.toThrow('Figma API error: 429 Too Many Requests');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000);
  });
});
