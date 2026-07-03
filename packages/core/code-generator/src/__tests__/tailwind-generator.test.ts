import { describe, it, expect } from 'vitest';
import { TailwindV4Generator } from '../tailwind-generator.js';
import type { ExtractedTokens, FigmaAnalysis } from '@typefigma/analyzer';

const mockTokens: ExtractedTokens = {
  colors: { primary: { '500': '#3b82f6', '700': '#1d4ed8' }, secondary: { '500': '#22c55e' }, accent: { '500': '#f59e0b' }, neutral: { '50': '#fafafa', '500': '#737373', '900': '#171717' }, success: { '500': '#22c55e' }, warning: { '500': '#eab308' }, error: { '500': '#ef4444' }, info: { '500': '#3b82f6' }, background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' }, text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' }, border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' } },
  typography: { fontFamilies: { heading: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'system-ui, sans-serif' }, body: { name: 'Inter', weights: [400, 500], fallback: 'system-ui, sans-serif' } }, fontSizes: { xs: '0.75rem', base: '1rem', xl: '1.25rem', '3xl': '1.875rem' }, fontWeights: { normal: 400, semibold: 600, bold: 700 }, lineHeights: { normal: 1.5, tight: 1.25 }, letterSpacing: { normal: '0' }, textStyles: {
    h1: { fontFamily: 'Inter', fontSize: '1.875rem', fontWeight: 700, lineHeight: '1.25', letterSpacing: '0' },
    h2: { fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: 700, lineHeight: '1.25', letterSpacing: '0' },
    h3: { fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0' },
    h4: { fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0' },
    h5: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: 500, lineHeight: '1.25', letterSpacing: '0' },
    h6: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.25', letterSpacing: '0' },
    body: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
    bodyLarge: { fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
    bodySmall: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
    caption: { fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
  } },
  spacing: { '0': '0', '1': '0.25rem', '4': '1rem', '8': '2rem', '16': '4rem' },
  sizing: { full: '100%', auto: 'auto' },
  borderRadius: { none: '0', default: '0.375rem', lg: '0.75rem', full: '9999px' },
  shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  borders: { width: { '0': '0', default: '1px' }, styles: { solid: 'solid', none: 'none' } },
  transitions: { duration: { base: '250ms' }, timing: { ease: 'ease' } },
  breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
  zIndex: { '0': 0, auto: 'auto' },
};

describe('TailwindV4Generator', () => {
  it('should generate Tailwind v4 theme CSS', () => {
    const gen = new TailwindV4Generator(mockTokens);
    const css = gen.generateThemeCSS();
    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain('@theme');
    expect(css).toContain('--color-primary-500');
    expect(css).toContain('--font-heading');
    expect(css).toContain('--font-body');
  });

  it('should convert flex layout to Tailwind classes', () => {
    const gen = new TailwindV4Generator(mockTokens);
    const classes = gen.layoutToTailwind({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    });
    expect(classes).toContain('flex');
    expect(classes).toContain('justify-center');
    expect(classes).toContain('items-center');
  });

  it('should handle grid layout', () => {
    const gen = new TailwindV4Generator(mockTokens);
    const classes = gen.layoutToTailwind({ display: 'grid' });
    expect(classes).toContain('grid');
  });

  it('should handle empty color tokens', () => {
    const gen = new TailwindV4Generator({ ...mockTokens, colors: { primary: {}, secondary: {}, accent: {}, neutral: {}, success: {}, warning: {}, error: {}, info: {}, background: {}, text: {}, border: {} } });
    const css = gen.generateThemeCSS();
    expect(css).toContain('@import "tailwindcss"');
  });

  it('should handle empty layout in layoutToTailwind', () => {
    const gen = new TailwindV4Generator(mockTokens);
    const classes = gen.layoutToTailwind({});
    expect(classes).toEqual([]);
  });

  it('should handle unknown layout properties gracefully', () => {
    const gen = new TailwindV4Generator(mockTokens);
    const classes = gen.layoutToTailwind({
      display: 'flex',
      justifyContent: 'unknown-value',
    });
    expect(classes).toContain('flex');
  });

  it('should handle minimal tokens', () => {
    const gen = new TailwindV4Generator({
      colors: mockTokens.colors,
      typography: { fontFamilies: { heading: { name: 'Inter', weights: [400], fallback: 'sans-serif' }, body: { name: 'Inter', weights: [400], fallback: 'sans-serif' } }, fontSizes: {}, fontWeights: {}, lineHeights: {}, letterSpacing: {}, textStyles: {} },
      spacing: {},
      sizing: {},
      borderRadius: {},
      shadows: {},
      borders: { width: {}, styles: {} },
      transitions: { duration: {}, timing: {} },
      breakpoints: {},
      zIndex: {},
    } as unknown as ExtractedTokens);
    const css = gen.generateThemeCSS();
    expect(css).toContain('@theme');
  });
});
