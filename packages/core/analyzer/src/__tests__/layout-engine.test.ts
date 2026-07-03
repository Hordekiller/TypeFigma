import { describe, it, expect } from 'vitest';
import { LayoutEngine } from '../layout-engine.js';
import type { SceneNode } from '@typefigma/figma-client';

describe('LayoutEngine', () => {
  const engine = new LayoutEngine();

  it('should compute flex row for HORIZONTAL layout', () => {
    const node: SceneNode = {
      id: '1',
      name: 'Row',
      type: 'FRAME',
      visible: true,
      locked: false,
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      itemSpacing: 16,
      paddingTop: 10,
      paddingRight: 20,
      paddingBottom: 10,
      paddingLeft: 20,
    };

    const result = engine.computeLayout(node);
    expect(result.self.display).toBe('flex');
    expect(result.self.flexDirection).toBe('row');
    expect(result.self.justifyContent).toBe('center');
    expect(result.self.alignItems).toBe('center');
    expect(result.self.gap).toBe('16px');
    expect(result.self.padding).toBe('10px 20px 10px 20px');
  });

  it('should compute flex column for VERTICAL layout', () => {
    const node: SceneNode = {
      id: '2',
      name: 'Column',
      type: 'FRAME',
      visible: true,
      locked: false,
      layoutMode: 'VERTICAL',
      primaryAxisAlignItems: 'SPACE_BETWEEN',
      itemSpacing: 8,
    };

    const result = engine.computeLayout(node);
    expect(result.self.display).toBe('flex');
    expect(result.self.flexDirection).toBe('column');
    expect(result.self.justifyContent).toBe('space-between');
    expect(result.self.gap).toBe('8px');
  });

  it('should detect absolute positioning', () => {
    const node: SceneNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      visible: true,
      locked: false,
      layoutPositioning: 'ABSOLUTE',
      absoluteBoundingBox: { x: -50, y: -50, width: 100, height: 100 },
    };

    const result = engine.computeLayout(node);
    expect(result.self.position).toBe('absolute');
  });

  it('should handle auto sizing modes', () => {
    const node: SceneNode = {
      id: '3',
      name: 'AutoRow',
      type: 'FRAME',
      visible: true,
      locked: false,
      layoutMode: 'HORIZONTAL',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO',
    };

    const result = engine.computeLayout(node);
    expect(result.self.width).toBe('fit-content');
    expect(result.self.height).toBe('fit-content');
  });

  it('should handle stretch layout align via computeLayout', () => {
    const parent: SceneNode = {
      id: 'p',
      name: 'Parent',
      type: 'FRAME',
      visible: true,
      locked: false,
      layoutMode: 'HORIZONTAL',
      children: [{
        id: 'c',
        name: 'Child',
        type: 'RECTANGLE',
        visible: true,
        locked: false,
        layoutAlign: 'STRETCH',
        layoutGrow: 1,
      }],
    };

    const result = engine.computeLayout(parent);
    expect(result.children.length).toBe(1);
    expect(result.children[0].alignSelf).toBe('stretch');
    expect(result.children[0].flex).toBe('1 1 0%');
  });

  it('should add border-radius for rectangles', () => {
    const node: SceneNode = {
      id: '4',
      name: 'RoundRect',
      type: 'RECTANGLE',
      visible: true,
      locked: false,
      cornerRadius: 8,
    };

    const result = engine.computeLayout(node);
    expect(result.self.borderRadius).toBe('8px');
  });

  it('should handle image aspect ratio', () => {
    const node: SceneNode = {
      id: '5',
      name: 'Image',
      type: 'RECTANGLE',
      visible: true,
      locked: false,
      absoluteBoundingBox: { x: 0, y: 0, width: 400, height: 300 },
      fills: [{ type: 'IMAGE', visible: true }],
    };

    const result = engine.computeLayout(node);
    expect(result.self.aspectRatio).toBe('400 / 300');
    expect(result.self.objectFit).toBe('cover');
  });

  it('should convert layout CSS to string', () => {
    const css = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
    };

    const output = engine.layoutToCSS(css);
    expect(output).toContain('display: flex;');
    expect(output).toContain('justify-content: center;');
    expect(output).toContain('align-items: center;');
    expect(output).toContain('gap: 16px;');
  });
});
