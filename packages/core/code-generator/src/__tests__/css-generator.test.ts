import { describe, it, expect } from 'vitest';
import { CssGenerator } from '../css-generator.js';
import type { ExtractedTokens } from '@typefigma/analyzer';

const mockTokens: ExtractedTokens = {
  colors: {
    primary: { '50': '#eff6ff', '500': '#3b82f6', '900': '#1e3a8a' },
    secondary: { '50': '#f0fdf4', '500': '#22c55e' },
    accent: { '500': '#f59e0b' },
    neutral: { '50': '#fafafa', '100': '#f5f5f5', '500': '#737373', '900': '#171717' },
    success: { '500': '#22c55e' },
    warning: { '500': '#eab308' },
    error: { '500': '#ef4444' },
    info: { '500': '#3b82f6' },
    background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' },
    text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' },
    border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' },
    ecommerce: { sale: '#ef4444', newArrival: '#10b981', outOfStock: '#6b7280', inStock: '#22c55e', price: '#171717', salePrice: '#ef4444', rating: '#f59e0b' },
  },
  typography: {
    fontFamilies: { heading: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'system-ui, sans-serif' }, body: { name: 'Inter', weights: [400, 500], fallback: 'system-ui, sans-serif' } },
    fontSizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem' },
    fontWeights: { thin: 100, light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeights: { none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.75, loose: 2 },
    letterSpacing: { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em', widest: '0.1em' },
    textStyles: {
      h1: { fontFamily: 'Inter', fontSize: '2.25rem', fontWeight: 700, lineHeight: '1.25', letterSpacing: '0' },
      h2: { fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: 700, lineHeight: '1.25', letterSpacing: '0' },
      h3: { fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0' },
      h4: { fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0' },
      h5: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: 500, lineHeight: '1.25', letterSpacing: '0' },
      h6: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.25', letterSpacing: '0' },
      body: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
      bodyLarge: { fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
      bodySmall: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
      caption: { fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
      button: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 600, lineHeight: '1', letterSpacing: '0' },
      overline: { fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0.05em' },
    },
  },
  spacing: { '0': '0', '1': '0.25rem', '2': '0.5rem', '4': '1rem', '8': '2rem' },
  sizing: { full: '100%', auto: 'auto' },
  borderRadius: { none: '0', sm: '0.125rem', default: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' },
  shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  borders: { width: { '0': '0', default: '1px', '2': '2px', '4': '4px', '8': '8px' }, styles: { solid: 'solid', dashed: 'dashed', dotted: 'dotted', double: 'double', none: 'none' } },
  transitions: { duration: { fast: '150ms', base: '250ms', slow: '400ms' }, timing: { ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out', linear: 'linear' } },
  breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
  zIndex: { '0': 0, '10': 10, '50': 50, auto: 'auto' },
};

describe('CssGenerator', () => {
  const gen = new CssGenerator();

  describe('generateGlobal', () => {
    it('should generate CSS with custom properties', () => {
      const css = gen.generateGlobal(mockTokens);
      expect(css).toContain(':root');
      expect(css).toContain('--color-primary-500');
      expect(css).toContain('--font-heading');
      expect(css).toContain('--spacing-4');
    });

    it('should include typography tokens', () => {
      const css = gen.generateGlobal(mockTokens);
      expect(css).toContain('Inter');
      expect(css).toContain('system-ui');
    });

    it('should include responsive media queries', () => {
      const css = gen.generateGlobal(mockTokens);
      expect(css).toContain('@media');
      expect(css).toContain('max-width');
    });

    it('should handle empty typography fontSizes', () => {
      const css = gen.generateGlobal({
        ...mockTokens,
        typography: {
          ...mockTokens.typography,
          fontSizes: {},
        },
      });
      expect(css).toContain(':root');
    });

    it('should not define ecommerce CSS variables when colors are absent', () => {
      const { ecommerce: _, ...restColors } = mockTokens.colors;
      const noEcom = { ...mockTokens, colors: restColors };
      const css = gen.generateGlobal(noEcom);
      const rootBlock = css.match(/:root\s*\{[^}]+\}/)?.[0] ?? '';
      expect(rootBlock).not.toContain('--color-ecommerce');
    });
  });

  describe('generateComponents', () => {
    it('should generate component CSS', () => {
      const css = gen.generateComponents(mockTokens);
      expect(css.length).toBeGreaterThan(0);
    });

    it('should reference CSS variables', () => {
      const css = gen.generateComponents(mockTokens);
      expect(css).toContain('var(--');
    });

    it('should handle empty tokens', () => {
      const css = gen.generateComponents({} as ExtractedTokens);
      expect(typeof css).toBe('string');
    });
  });
});
