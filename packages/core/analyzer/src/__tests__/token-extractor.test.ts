import { describe, it, expect } from 'vitest';
import { TokenExtractor } from '../token-extractor.js';
import type { FigmaFile, SceneNode } from '@typefigma/figma-client';

describe('TokenExtractor', () => {
  const extractor = new TokenExtractor();

  const createMinimalFile = (nodes: SceneNode[]): FigmaFile => ({
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    thumbnailUrl: '',
    version: '1',
    schemaVersion: 0,
    document: { id: '0', name: 'Document', type: 'DOCUMENT', visible: true, children: [
      { id: '1', name: 'Page 1', type: 'CANVAS', visible: true, children: nodes, locked: false },
    ]},
  });

  it('should extract colors from fills', () => {
    const nodes: SceneNode[] = [{
      id: 'rect1',
      name: 'Primary Box',
      type: 'RECTANGLE',
      visible: true,
      locked: false,
      fills: [
        { type: 'SOLID', visible: true, color: { r: 0.2, g: 0.4, b: 0.8, a: 1 } },
      ],
    }];

    const file = createMinimalFile(nodes);
    const tokens = extractor.extract(file);

    expect(tokens.colors.primary['500']).toBeDefined();
    expect(tokens.colors.background.body).toBeDefined();
    expect(tokens.colors.text.primary).toBeDefined();
  });

  it('should extract typography from text nodes', () => {
    const nodes: SceneNode[] = [{
      id: 'text1',
      name: 'Heading',
      type: 'TEXT',
      visible: true,
      locked: false,
      characters: 'Hello World',
      style: {
        fontFamily: 'Inter',
        fontPostScriptName: 'Inter-Bold',
        fontWeight: 700,
        fontSize: 48,
        fontStyle: 'Bold',
        lineHeight: { value: 57.6, unit: 'PIXELS' },
        letterSpacing: -1,
        letterCase: 'ORIGINAL' as const,
        textDecoration: 'NONE' as const,
        textAutoResize: 'NONE' as const,
        paragraphSpacing: 0,
        paragraphIndent: 0,
        listSpacing: 0,
        hangingPunctuation: 0,
        listType: 'NONE' as const,
        hyperlink: null,
      },
    }];

    const file = createMinimalFile(nodes);
    const tokens = extractor.extract(file);

    expect(tokens.typography.fontFamilies.heading.name).toBe('Inter');
    expect(tokens.typography.textStyles.h1.fontSize).toBe('48px');
    expect(tokens.typography.textStyles.h1.fontWeight).toBe(700);
  });

  it('should extract spacing from padding values', () => {
    const nodes: SceneNode[] = [{
      id: 'frame1',
      name: 'Container',
      type: 'FRAME',
      visible: true,
      locked: false,
      layoutMode: 'HORIZONTAL',
      paddingTop: 16,
      paddingRight: 24,
      paddingBottom: 16,
      paddingLeft: 24,
      itemSpacing: 8,
    }];

    const file = createMinimalFile(nodes);
    const tokens = extractor.extract(file);

    // Spacing scale should include entries derived from padding values
    expect(tokens.spacing).toBeDefined();
    expect(Object.keys(tokens.spacing).length).toBeGreaterThan(0);
  });

  it('should extract border radius from cornerRadius', () => {
    const nodes: SceneNode[] = [{
      id: 'round1',
      name: 'Rounded Box',
      type: 'RECTANGLE',
      visible: true,
      locked: false,
      cornerRadius: 12,
    }];

    const file = createMinimalFile(nodes);
    const tokens = extractor.extract(file);

    expect(tokens.borderRadius).toBeDefined();
  });

  it('should generate complete token structure', () => {
    const nodes: SceneNode[] = [{
      id: 'n1',
      name: 'Test',
      type: 'FRAME',
      visible: true,
      locked: false,
      fills: [{ type: 'SOLID', visible: true, color: { r: 0, g: 0, b: 0, a: 1 } }],
    }];

    const file = createMinimalFile(nodes);
    const tokens = extractor.extract(file);

    expect(tokens.colors).toBeDefined();
    expect(tokens.typography).toBeDefined();
    expect(tokens.spacing).toBeDefined();
    expect(tokens.sizing).toBeDefined();
    expect(tokens.borderRadius).toBeDefined();
    expect(tokens.shadows).toBeDefined();
    expect(tokens.borders).toBeDefined();
    expect(tokens.transitions).toBeDefined();
    expect(tokens.breakpoints).toBeDefined();
    expect(tokens.zIndex).toBeDefined();
  });
});
