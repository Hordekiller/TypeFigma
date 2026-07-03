import { describe, it, expect } from 'vitest';
import { HtmlGenerator } from '../html-generator.js';
import type { ComponentClassification, ExtractedTokens, ExtractedContent } from '@typefigma/analyzer';

const mockComponents: ComponentClassification = {
  headers: [{ id: 'h1', figmaNodeId: 'h1', name: 'Header', confidence: 0.95, type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true, layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } } }],
  footers: [{ id: 'f1', figmaNodeId: 'f1', name: 'Footer', confidence: 0.9, type: 'multi-column', columns: 4, hasNewsletter: true, hasSocialLinks: true, hasCopyright: true, layout: { width: 'full', padding: { top: '3rem', right: '2rem', bottom: '1.5rem', left: '2rem' } } }],
  navigation: [],
  heroes: [{ id: 'hero1', figmaNodeId: 'hero1', name: 'Hero Section', confidence: 0.85, type: 'centered', hasHeadline: true, hasSubtext: true, hasCTA: true, hasImage: false, hasBadge: false, alignment: 'center', layout: { minHeight: '500px', maxWidth: '1200px', padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' } } }],
  ctaSections: [],
  testimonials: [],
  galleries: [],
  productCards: [],
  productDetails: [],
  cartComponents: [],
  checkoutComponents: [],
  postCards: [],
  postDetail: [],
  contactForms: [],
  searchBars: [],
  newsletters: [],
  sections: [],
  containers: [],
  columns: [],
};

const mockTokens: ExtractedTokens = {
  colors: { primary: { '500': '#3b82f6' }, secondary: { '500': '#22c55e' }, accent: { '500': '#f59e0b' }, neutral: { '50': '#fafafa', '500': '#737373', '900': '#171717' }, success: { '500': '#22c55e' }, warning: { '500': '#eab308' }, error: { '500': '#ef4444' }, info: { '500': '#3b82f6' }, background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' }, text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' }, border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' } },
  typography: { fontFamilies: { heading: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'system-ui, sans-serif' }, body: { name: 'Inter', weights: [400, 500], fallback: 'system-ui, sans-serif' } }, fontSizes: { base: '1rem', lg: '1.125rem', xl: '1.25rem' }, fontWeights: { normal: 400, semibold: 600, bold: 700 }, lineHeights: { normal: 1.5, tight: 1.25 }, letterSpacing: { normal: '0' }, textStyles: {
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
  } },
  spacing: { '0': '0', '4': '1rem', '8': '2rem' },
  sizing: { full: '100%', auto: 'auto', container: '1200px' },
  borderRadius: { none: '0', default: '0.375rem', full: '9999px' },
  shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  borders: { width: { '0': '0', default: '1px' }, styles: { solid: 'solid', none: 'none' } },
  transitions: { duration: { base: '250ms' }, timing: { ease: 'ease' } },
  breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
  zIndex: { '0': 0, '10': 10, auto: 'auto' },
};

describe('HtmlGenerator', () => {
  const gen = new HtmlGenerator();

  it('should generate a complete HTML page', () => {
    const html = gen.generatePage(mockComponents, mockTokens);
    expect(html).toContain('page-wrapper');
    expect(html).toContain('site-header');
    expect(html).toContain('site-footer');
  });

  it('should include header in the output', () => {
    const html = gen.generatePage(mockComponents, mockTokens);
    expect(html).toContain('Header');
  });

  it('should include footer in the output', () => {
    const html = gen.generatePage(mockComponents, mockTokens);
    expect(html).toContain('Footer');
  });

  it('should include hero section in the output', () => {
    const html = gen.generatePage(mockComponents, mockTokens);
    expect(html).toContain('Hero');
  });
});
