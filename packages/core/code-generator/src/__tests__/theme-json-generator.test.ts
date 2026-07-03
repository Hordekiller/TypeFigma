import { describe, it, expect } from 'vitest';
import { ThemeJsonGenerator, pxToRem } from '../theme-json-generator.js';
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
      fontSizes: { base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' },
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
    spacing: { '0': '0', '4': '1rem', '8': '2rem' },
    sizing: { full: '100%', auto: 'auto' },
    borderRadius: { none: '0', default: '0.375rem', full: '9999px' },
    shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
    borders: { width: { '0': '0', default: '1px' }, styles: { solid: 'solid', none: 'none' } },
    transitions: { duration: { base: '250ms' }, timing: { ease: 'ease' } },
    breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
    zIndex: { '0': 0, auto: 'auto' },
    ...overrides,
  } as ExtractedTokens;
}

describe('ThemeJsonGenerator', () => {
  it('should generate valid theme.json version 3', () => {
    const gen = new ThemeJsonGenerator(makeTokens());
    const json = gen.toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(3);
  });

  it('should include color palette settings', () => {
    const gen = new ThemeJsonGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"color"');
    expect(json).toContain('"palette"');
    expect(json).toContain('#3b82f6');
  });

  it('should include typography settings with font families', () => {
    const gen = new ThemeJsonGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"typography"');
    expect(json).toContain('Inter');
    expect(json).toContain('"fontFamilies"');
  });

  it('should include fluid font size presets', () => {
    const gen = new ThemeJsonGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"fluid"');
    expect(json).toContain('"min"');
    expect(json).toContain('"max"');
  });

  it('should include spacing preset', () => {
    const gen = new ThemeJsonGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"spacing"');
    expect(json).toContain('"spacingScale"');
  });

  it('should include shadow presets', () => {
    const gen = new ThemeJsonGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"shadow"');
    expect(json).toContain('"presets"');
  });

  it('should include block styles', () => {
    const gen = new ThemeJsonGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"styles"');
    expect(json).toContain('"blocks"');
    expect(json).toContain('core/paragraph');
  });

  it('should include element styles', () => {
    const gen = new ThemeJsonGenerator(makeTokens());
    const json = gen.toJSON();
    expect(json).toContain('"elements"');
    expect(json).toContain('"link"');
  });

  it('should handle empty tokens gracefully', () => {
    const empty: ExtractedTokens = {
      colors: { primary: {}, secondary: {}, accent: {}, neutral: {}, success: {}, warning: {}, error: {}, info: {}, background: {}, text: {}, border: {} } as any,
      typography: { fontFamilies: { heading: {} as any, body: {} as any }, fontSizes: {}, fontWeights: {}, lineHeights: {}, letterSpacing: {}, textStyles: null as unknown as ExtractedTokens['typography']['textStyles'] } as any,
      spacing: {}, sizing: {}, borderRadius: {}, shadows: {},
      borders: { width: {}, styles: {} },
      transitions: { duration: {}, timing: {} },
      breakpoints: {}, zIndex: {},
    };
    const gen = new ThemeJsonGenerator(empty);
    expect(() => JSON.parse(gen.toJSON())).not.toThrow();
  });
});

describe('pxToRem (theme-json)', () => {
  it('should convert px to rem', () => {
    expect(pxToRem(16)).toBe('1rem');
    expect(pxToRem(32)).toBe('2rem');
    expect(pxToRem(0)).toBe('0rem');
  });
});
