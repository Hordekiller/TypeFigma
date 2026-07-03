import { describe, it, expect } from 'vitest';
import { ComponentDetector } from '../component-detector.js';
import type { FigmaFile, SceneNode } from '@typefigma/figma-client';

describe('ComponentDetector', () => {
  const detector = new ComponentDetector();

  const mockFile = (pages: SceneNode[][]): FigmaFile => ({
    name: 'Test',
    lastModified: '2024-01-01T00:00:00Z',
    thumbnailUrl: '',
    version: '1',
    schemaVersion: 0,
    document: {
      id: '0', name: 'Document', type: 'DOCUMENT', visible: true,
      children: pages.map((nodes, i) => ({
        id: `${i + 1}`, name: `Page ${i + 1}`, type: 'CANVAS' as const,
        visible: true, children: nodes, locked: false,
      })),
    },
  });

  it('should detect page structure', () => {
    const file = mockFile([[
      { id: 'frame1', name: 'Home', type: 'FRAME', visible: true, locked: false, children: [] },
    ]]);
    const result = detector.detect(file);
    expect(result.projectType).toBeDefined();
    expect(result.components).toBeDefined();
    expect(result.components.headers).toBeDefined();
    expect(result.components.footers).toBeDefined();
    expect(result.components.heroes).toBeDefined();
  });

  it('should detect a header at the top of page', () => {
    const file = mockFile([[
      {
        id: 'h1', name: 'Header / Navigation',
        type: 'FRAME', visible: true, locked: false,
        absoluteBoundingBox: { x: 0, y: 0, width: 1200, height: 80 },
        layoutMode: 'HORIZONTAL',
        children: [
          { id: 'logo', name: 'Logo', type: 'RECTANGLE', visible: true, locked: false, absoluteBoundingBox: { x: 20, y: 15, width: 120, height: 50 } },
          { id: 'nav', name: 'Nav Links', type: 'FRAME', visible: true, locked: false, absoluteBoundingBox: { x: 400, y: 20, width: 400, height: 40 }, children: [] },
          { id: 'cta', name: 'Button', type: 'RECTANGLE', visible: true, locked: false, absoluteBoundingBox: { x: 900, y: 20, width: 100, height: 40 } },
        ],
      },
    ]]);
    const result = detector.detect(file);
    expect(result.components.headers.length).toBeGreaterThan(0);
  });

  it('should detect product cards from layout structure', () => {
    const file = mockFile([[
      {
        id: 'pc1', name: 'Product Card',
        type: 'FRAME', visible: true, locked: false,
        layoutMode: 'VERTICAL',
        absoluteBoundingBox: { x: 0, y: 0, width: 300, height: 450 },
        children: [
          { id: 'img', name: 'Product Image', type: 'RECTANGLE', visible: true, locked: false, absoluteBoundingBox: { x: 0, y: 0, width: 300, height: 300 } },
          { id: 'title', name: 'Product Name', type: 'TEXT', visible: true, locked: false, characters: 'Product', absoluteBoundingBox: { x: 10, y: 310, width: 280, height: 24 } },
          { id: 'price', name: '$19.99', type: 'TEXT', visible: true, locked: false, characters: '$19.99', absoluteBoundingBox: { x: 10, y: 340, width: 100, height: 24 } },
          { id: 'btn', name: 'Add To Cart', type: 'RECTANGLE', visible: true, locked: false, absoluteBoundingBox: { x: 10, y: 380, width: 280, height: 44 } },
        ],
      },
    ]]);
    const result = detector.detect(file);
    expect(result.components.productCards.length).toBeGreaterThan(0);
  });
});
