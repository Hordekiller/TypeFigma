import { describe, it, expect } from 'vitest';
import { CodeGenerator } from '../index.js';
import type { ComponentClassification, ExtractedTokens } from '@typefigma/analyzer';

const mockComponents: ComponentClassification = {
  headers: [{ id: 'h1', figmaNodeId: 'h1', name: 'Header', confidence: 0.95, type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true, layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } } }],
  footers: [{ id: 'f1', figmaNodeId: 'f1', name: 'Footer', confidence: 0.9, columns: 4, hasNewsletter: true, hasSocial: true, hasMenu: true }],
  navigation: [], heroes: [], ctaSections: [], testimonials: [],
  galleries: [], productCards: [], productDetails: [],
  cartComponents: [], checkoutComponents: [], postCards: [], postDetail: [],
  contactForms: [], searchBars: [], newsletters: [],
  sections: [], containers: [], columns: [],
  responsiveBreakpoints: [],
  interactionStates: [],
};

const mockTokens: ExtractedTokens = {
  colors: { primary: { '500': '#3b82f6' }, secondary: { '500': '#22c55e' }, accent: { '500': '#f59e0b' }, neutral: { '50': '#fafafa', '500': '#737373', '700': '#404040', '900': '#171717' }, success: { '500': '#22c55e' }, warning: { '500': '#eab308' }, error: { '500': '#ef4444' }, info: { '500': '#3b82f6' }, background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' }, text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' }, border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' } },
  typography: { fontFamilies: { heading: { name: 'Inter', weights: [400, 600, 700], fallback: 'system-ui, sans-serif' }, body: { name: 'Inter', weights: [400, 500], fallback: 'system-ui, sans-serif' } }, fontSizes: { base: '1rem' }, fontWeights: { normal: 400, bold: 700 }, lineHeights: { normal: 1.5, tight: 1.25 }, letterSpacing: { normal: '0' }, textStyles: {
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
  } },
  spacing: {}, sizing: {}, borderRadius: {}, shadows: {},
  borders: { width: {}, styles: {} },
  transitions: { duration: {}, timing: {} },
  breakpoints: {}, zIndex: {},
};

describe('CodeGenerator', () => {
  it('should generate HTML and CSS by default', () => {
    const gen = new CodeGenerator();
    const result = gen.generate(mockComponents, mockTokens);
    expect(result.html).toBeDefined();
    expect(result.html.length).toBeGreaterThan(0);
    expect(result.globalCss).toBeDefined();
    expect(result.globalCss.length).toBeGreaterThan(0);
    expect(result.componentsCss).toBeDefined();
    expect(result.componentsCss.length).toBeGreaterThan(0);
  });

  it('should include tailwind when option is set', () => {
    const gen = new CodeGenerator({ includeTailwind: true });
    const result = gen.generate(mockComponents, mockTokens);
    expect(result.tailwindCss).toBeDefined();
    expect(result.tailwindComponents).toBeDefined();
  });

  it('should include theme.json when option is set', () => {
    const gen = new CodeGenerator({ includeThemeJson: true });
    const result = gen.generate(mockComponents, mockTokens);
    expect(result.themeJson).toBeDefined();
    const parsed = JSON.parse(result.themeJson!);
    expect(parsed.version).toBe(3);
  });

  it('should include DTCG when option is set', () => {
    const gen = new CodeGenerator({ includeDtcg: true });
    const result = gen.generate(mockComponents, mockTokens);
    expect(result.dtcgJson).toBeDefined();
    expect(result.dtcgTokens).toBeDefined();
    expect(result.styleDictionary).toBeDefined();
  });

  it('should include block patterns and templates when option is set', () => {
    const gen = new CodeGenerator({ includeBlocks: true });
    const result = gen.generate(mockComponents, mockTokens);
    expect(result.blockPatterns).toBeDefined();
    expect(result.blockPatterns!.length).toBeGreaterThan(0);
    expect(result.blockTemplates).toBeDefined();
    expect(result.blockTemplates!.length).toBeGreaterThan(0);
  });

  it('should include all outputs when all options enabled', () => {
    const gen = new CodeGenerator({
      includeDtcg: true,
      includeThemeJson: true,
      includeTailwind: true,
      includeBlocks: true,
    });
    const result = gen.generate(mockComponents, mockTokens);
    expect(result.html).toBeDefined();
    expect(result.globalCss).toBeDefined();
    expect(result.componentsCss).toBeDefined();
    expect(result.tailwindCss).toBeDefined();
    expect(result.themeJson).toBeDefined();
    expect(result.dtcgJson).toBeDefined();
    expect(result.blockPatterns).toBeDefined();
    expect(result.blockTemplates).toBeDefined();
  });

  it('should use custom viewport sizes', () => {
    const gen = new CodeGenerator({ minViewport: '320px', maxViewport: '1920px' });
    const result = gen.generate(mockComponents, mockTokens);
    expect(result.globalCss).toContain('--fluid-text-');
    expect(result.globalCss).toContain('clamp(');
  });
});
