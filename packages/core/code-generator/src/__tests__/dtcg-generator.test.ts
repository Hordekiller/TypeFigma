import { describe, it, expect } from 'vitest';
import { DtcgGenerator, pxToRem, parseUnitValue, toDtcgDimension, hexToRgba, rgbaToHex } from '../dtcg-generator.js';
import type { ExtractedTokens } from '@typefigma/analyzer';

function makeTokens(overrides?: Partial<ExtractedTokens>): ExtractedTokens {
  return {
    colors: {
      primary: { '500': '#3b82f6', '700': '#1d4ed8' },
      secondary: { '500': '#22c55e' },
      accent: { '500': '#f59e0b' },
      neutral: { '50': '#fafafa', '500': '#737373', '900': '#171717' },
      success: { '500': '#22c55e' },
      warning: { '500': '#eab308' },
      error: { '500': '#ef4444' },
      info: { '500': '#3b82f6' },
      background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' },
      text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' },
      border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' },
    },
    typography: {
      fontFamilies: {
        heading: { name: 'Inter', weights: [400, 600, 700], fallback: 'system-ui, sans-serif' },
        body: { name: 'Inter', weights: [400, 500], fallback: 'system-ui, sans-serif' },
      },
      fontSizes: { base: '1rem', lg: '1.125rem', xl: '1.25rem' },
      fontWeights: { normal: 400, bold: 700 },
      lineHeights: { normal: 1.5, tight: 1.25 },
      letterSpacing: { normal: '0' },
      textStyles: {
        h1: { fontFamily: 'Inter', fontSize: '2rem', fontWeight: 700, lineHeight: '1.25', letterSpacing: '0' },
        h2: { fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: 700, lineHeight: '1.25', letterSpacing: '0' },
        h3: { fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0' },
        h4: { fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0' },
        h5: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: 500, lineHeight: '1.25', letterSpacing: '0' },
        h6: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.25', letterSpacing: '0' },
        body: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
        bodyLarge: { fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
        bodySmall: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
        caption: { fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
        overline: { fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: 500, lineHeight: '1.5', letterSpacing: '0.05em', textTransform: 'uppercase' },
        button: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.5', letterSpacing: '0' },
      },
    },
    spacing: { '0': '0', '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem' },
    sizing: { full: '100%', auto: 'auto' },
    borderRadius: { none: '0', sm: '0.125rem', default: '0.375rem', full: '9999px' },
    shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
    borders: { width: { '0': '0', default: '1px', '2': '2px' }, styles: { solid: 'solid', none: 'none' } },
    transitions: { duration: { base: '250ms', fast: '150ms' }, timing: { ease: 'ease' } },
    breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
    zIndex: { '0': 0, '10': 10, '50': 50, auto: 'auto' },
    ...overrides,
  } as ExtractedTokens;
}

describe('DtcgGenerator', () => {
  it('should generate DTCG JSON with color tokens', () => {
    const gen = new DtcgGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"color"');
    expect(json).toContain('#3b82f6');
    expect(json).toContain('#22c55e');
    expect(json).toContain('"$type"');
    expect(json).toContain('"$value"');
  });

  it('should generate typography tokens', () => {
    const gen = new DtcgGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"fontFamily"');
    expect(json).toContain('Inter');
    expect(json).toContain('"fontWeight"');
  });

  it('should generate spacing tokens', () => {
    const gen = new DtcgGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"dimension"');
    expect(json).toContain('"spacing-4"');
  });

  it('should generate border radius tokens', () => {
    const gen = new DtcgGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"borderRadius"');
    expect(json).toContain('"value": 9999');
  });

  it('should produce valid JSON', () => {
    const gen = new DtcgGenerator(makeTokens());
    const json = gen.toJSON();
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.color).toBeDefined();
    expect(parsed.fontFamily).toBeDefined();
  });

  it('should generate dtcg tokens document', () => {
    const gen = new DtcgGenerator(makeTokens());
    const dtcg = gen.generateDtcg();
    expect(Object.keys(dtcg).length).toBeGreaterThan(0);
    expect(dtcg.color).toBeDefined();
    expect(dtcg.fontFamily).toBeDefined();
  });

  it('should generate Style Dictionary output', () => {
    const gen = new DtcgGenerator(makeTokens());
    const sd = gen.generateStyleDictionary();
    expect(sd).toBeDefined();
    expect(typeof sd).toBe('object');
  });

  it('should handle empty tokens gracefully', () => {
    const empty: ExtractedTokens = {
      colors: { primary: {}, secondary: {}, accent: {}, neutral: {}, success: {}, warning: {}, error: {}, info: {}, background: {}, text: {}, border: {} } as any,
      typography: { fontFamilies: {} as any, fontSizes: {}, fontWeights: {}, lineHeights: {}, letterSpacing: {}, textStyles: null as unknown as ExtractedTokens['typography']['textStyles'] },
      spacing: {}, sizing: {}, borderRadius: {}, shadows: {},
      borders: { width: {}, styles: {} },
      transitions: { duration: {}, timing: {} },
      breakpoints: {}, zIndex: {},
    };
    const gen = new DtcgGenerator(empty);
    expect(() => gen.toJSON()).not.toThrow();
  });
});

describe('pxToRem', () => {
  it('should convert px to rem', () => {
    expect(pxToRem(16)).toBe('1rem');
    expect(pxToRem(8)).toBe('0.5rem');
    expect(pxToRem(24)).toBe('1.5rem');
  });

  it('should support custom base', () => {
    expect(pxToRem(10, 10)).toBe('1rem');
  });
});

describe('parseUnitValue', () => {
  it('should parse px values', () => {
    const result = parseUnitValue('16px');
    expect(result).toEqual({ value: 16, unit: 'px' });
  });

  it('should parse rem values', () => {
    const result = parseUnitValue('1.5rem');
    expect(result).toEqual({ value: 1.5, unit: 'rem' });
  });

  it('should parse unitless numbers as px', () => {
    const result = parseUnitValue('42');
    expect(result).toEqual({ value: 42, unit: 'px' });
  });

  it('should return null for invalid values', () => {
    expect(parseUnitValue('auto')).toBeNull();
    expect(parseUnitValue('')).toBeNull();
  });
});

describe('toDtcgDimension', () => {
  it('should convert valid values to dimension object', () => {
    const d = toDtcgDimension('16px');
    expect(d).toEqual({ value: 16, unit: 'px' });
  });

  it('should return string for invalid values', () => {
    expect(toDtcgDimension('auto')).toBe('auto');
  });
});

describe('hexToRgba', () => {
  it('should convert hex to rgba', () => {
    expect(hexToRgba('#3b82f6')).toBe('#3b82f6');
  });

  it('should expand 3-digit hex', () => {
    expect(hexToRgba('#fff')).toBe('#ffffff');
  });

  it('should handle 8-digit hex (with alpha)', () => {
    const result = hexToRgba('#0000004d');
    expect(result).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.30\)/);
  });
});

describe('rgbaToHex', () => {
  it('should convert rgba string to hex', () => {
    expect(rgbaToHex('rgba(59, 130, 246, 1)')).toBe('#3b82f6');
  });
});
