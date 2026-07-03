import { describe, it, expect } from 'vitest';
import { WpBlockGenerator } from '../wp-block-generator.js';
import type { ComponentClassification, ExtractedTokens } from '@typefigma/analyzer';

const mockComponents: ComponentClassification = {
  headers: [{ id: 'h1', figmaNodeId: 'h1', name: 'Header', confidence: 0.95, type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true, layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } } }],
  footers: [{ id: 'f1', figmaNodeId: 'f1', name: 'Footer', confidence: 0.9, columns: 4, hasNewsletter: true, hasSocial: true, hasMenu: true }],
  navigation: [{ id: 'n1', figmaNodeId: 'n1', type: 'horizontal', items: 4, hasDropdown: true }],
  heroes: [{ id: 'hero1', figmaNodeId: 'hero1', name: 'Hero Section', confidence: 0.85, layout: 'centered', hasVideo: false, hasSlider: false, hasOverlay: false, content: { hasHeadline: true, hasSubtext: true, hasButtons: true, hasImage: false } }],
  ctaSections: [{ id: 'c1', figmaNodeId: 'c1', confidence: 0.8, type: 'banner', hasButton: true, hasImage: false }],
  testimonials: [{ id: 't1', figmaNodeId: 't1', confidence: 0.8, layout: 'grid', hasAvatar: true, hasRating: true, hasCompanyLogo: false }],
  galleries: [{ id: 'g1', figmaNodeId: 'g1', layout: 'grid', imageCount: 6, hasLightbox: true, hasFilter: false }],
  productCards: [{ id: 'p1', figmaNodeId: 'p1', name: 'Product Card', confidence: 0.9, structure: { productImage: { nodeId: 'pi1', aspectRatio: '1:1', hasBorderRadius: true, hasHoverEffect: true }, productTitle: { nodeId: 'pt1', maxLines: 2 }, productPrice: { nodeId: 'pp1', format: 'regular', hasCurrency: true }, addToCartButton: { nodeId: 'pb1', text: 'Add to Cart' } }, layout: { type: 'card', alignment: 'center', spacing: { top: '0', right: '0', bottom: '0', left: '0' }, containerPadding: { top: '0', right: '0', bottom: '0', left: '0' } } }],
  productDetails: [], cartComponents: [], checkoutComponents: [],
  postCards: [{ id: 'pc1', figmaNodeId: 'pc1', confidence: 0.8, hasImage: true, hasCategory: true, hasDate: true, hasAuthor: false, hasExcerpt: true, hasReadMore: true, layout: 'vertical' }],
  postDetail: [], contactForms: [{ id: 'cf1', figmaNodeId: 'cf1', name: 'Contact Form', confidence: 0.8, type: 'contact', fields: { inputs: [{ nodeId: 'inp1', placeholder: 'Your Name', type: 'text', required: true }, { nodeId: 'inp2', placeholder: 'Your Email', type: 'email', required: true }] }, submitButton: { nodeId: 'sb1', text: 'Send Message' }, layout: { columns: 1, fieldSpacing: 16, labelPosition: 'top' } }],
  searchBars: [{ id: 's1', figmaNodeId: 's1', type: 'inline', hasDropdown: false, hasCategories: false }],
  newsletters: [{ id: 'nl1', figmaNodeId: 'nl1', hasName: false, hasEmail: true, hasConsentCheckbox: false }],
  sections: [], containers: [], columns: [],
};

const mockTokens: ExtractedTokens = {
  colors: { primary: { '500': '#3b82f6' }, secondary: { '500': '#22c55e' }, accent: { '500': '#f59e0b' }, neutral: { '50': '#fafafa', '500': '#737373', '900': '#171717' }, success: { '500': '#22c55e' }, warning: { '500': '#eab308' }, error: { '500': '#ef4444' }, info: { '500': '#3b82f6' }, background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' }, text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' }, border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' } },
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

describe('WpBlockGenerator', () => {
  it('should generate block patterns', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const patterns = gen.generatePatterns();
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0]).toHaveProperty('slug');
    expect(patterns[0]).toHaveProperty('title');
    expect(patterns[0]).toHaveProperty('content');
  });

  it('should generate header pattern', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const patterns = gen.generatePatterns();
    const header = patterns.find(p => p.slug === 'header');
    expect(header).toBeDefined();
    expect(header!.content).toContain('wp:group');
  });

  it('should generate hero pattern', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const patterns = gen.generatePatterns();
    const hero = patterns.find(p => p.slug === 'hero-section');
    expect(hero).toBeDefined();
    expect(hero!.content).toContain('wp:cover');
  });

  it('should generate footer pattern', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const patterns = gen.generatePatterns();
    const footer = patterns.find(p => p.slug === 'footer');
    expect(footer).toBeDefined();
    expect(footer!.content).toContain('wp:group');
  });

  it('should generate product grid pattern when productCards exist', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const patterns = gen.generatePatterns();
    const productGrid = patterns.find(p => p.slug === 'product-grid');
    expect(productGrid).toBeDefined();
  });

  it('should generate testimonials pattern', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const patterns = gen.generatePatterns();
    const testimonial = patterns.find(p => p.slug === 'testimonials');
    expect(testimonial).toBeDefined();
    expect(testimonial!.content).toContain('wp:group');
  });

  it('should generate contact form pattern', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const patterns = gen.generatePatterns();
    const form = patterns.find(p => p.slug === 'contact-form');
    expect(form).toBeDefined();
  });

  it('should generate block templates', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const templates = gen.generateTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('slug');
    expect(templates[0]).toHaveProperty('content');
  });

  it('should generate page template', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const templates = gen.generateTemplates();
    const page = templates.find(t => t.slug === 'page');
    expect(page).toBeDefined();
    expect(page!.content).toContain('wp:post-content');
  });

  it('should generate archive template', () => {
    const gen = new WpBlockGenerator(mockComponents, mockTokens);
    const templates = gen.generateTemplates();
    const archive = templates.find(t => t.slug === 'archive');
    expect(archive).toBeDefined();
    expect(archive!.content).toContain('wp:query');
  });

  it('should handle empty components gracefully', () => {
    const empty: ComponentClassification = {
      headers: [], footers: [], navigation: [], heroes: [], ctaSections: [],
      testimonials: [], galleries: [], productCards: [], productDetails: [],
      cartComponents: [], checkoutComponents: [], postCards: [], postDetail: [],
      contactForms: [], searchBars: [], newsletters: [],
      sections: [], containers: [], columns: [],
    };
    const gen = new WpBlockGenerator(empty, mockTokens);
    const patterns = gen.generatePatterns();
    expect(patterns.length).toBeGreaterThanOrEqual(0);
  });
});
