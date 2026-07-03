import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FigmaClient } from '../client.js';

describe('FigmaClient', () => {
  let client: FigmaClient;

  beforeEach(() => {
    client = new FigmaClient('test-token');
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
      const mockResponse = { ok: false, status: 403, statusText: 'Forbidden' };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as Response);

      await expect(client.getFile('test-key')).rejects.toThrow('Figma API error: 403 Forbidden');
    });
  });
});
