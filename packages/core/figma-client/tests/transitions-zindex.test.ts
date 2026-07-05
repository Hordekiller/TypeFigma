import { FigmaClient } from '../src/client';
import { vi } from 'vitest';

const figmaClient = new FigmaClient('test-token');
const mockRequest = vi.spyOn(FigmaClient.prototype as any, 'request');

describe('Figma Client - Transitions and ZIndex Extraction', () => {
  beforeEach(() => {
    mockRequest.mockClear();
  });

  test('extracts zIndex from Figma nodes', async () => {
    const mockFileData = {
      document: {
        id: '0:0',
        name: 'Page 1',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Frame 1',
            type: 'FRAME',
            absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100, zIndex: 5 },
            children: [],
          },
          {
            id: '0:2',
            name: 'Frame 2',
            type: 'FRAME',
            absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100, zIndex: 10 },
            children: [],
          },
        ],
      },
    };

    mockRequest.mockResolvedValue(mockFileData);
    const result = await figmaClient.getFile('test-key');
    expect(result.document.children?.[0].absoluteBoundingBox?.zIndex).toBe(5);
    expect(result.document.children?.[1].absoluteBoundingBox?.zIndex).toBe(10);
  });

  test('extracts transitions from Figma nodes', async () => {
    const mockFileData = {
      document: {
        id: '0:0',
        name: 'Page 1',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Button',
            type: 'FRAME',
            transitionNodeID: '0:2',
            transitionDuration: 300,
            transitionEasing: 'EASE_IN',
            children: [],
          },
        ],
      },
    };

    mockRequest.mockResolvedValue(mockFileData);
    const result = await figmaClient.getFile('test-key');
    const button = result.document.children?.[0];
    expect(button?.transitionNodeID).toBe('0:2');
    expect(button?.transitionDuration).toBe(300);
    expect(button?.transitionEasing).toBe('EASE_IN');
  });

  test('handles missing zIndex and transitions gracefully', async () => {
    const mockFileData = {
      document: {
        id: '0:0',
        name: 'Page 1',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Frame 1',
            type: 'FRAME',
            children: [],
          },
        ],
      },
    };

    mockRequest.mockResolvedValue(mockFileData);
    const result = await figmaClient.getFile('test-key');
    const frame = result.document.children?.[0];
    expect(frame?.absoluteBoundingBox?.zIndex).toBeUndefined();
    expect(frame?.transitionNodeID).toBeUndefined();
  });

  test('handles 404 errors', async () => {
    mockRequest.mockRejectedValue(new Error('File not found'));
    await expect(figmaClient.getFile('invalid-key')).rejects.toThrow('File not found');
  });

  test('handles 429 rate limit errors', async () => {
    mockRequest.mockRejectedValue(new Error('Rate limit exceeded'));
    await expect(figmaClient.getFile('rate-limited-key')).rejects.toThrow('Rate limit exceeded');
  });
});