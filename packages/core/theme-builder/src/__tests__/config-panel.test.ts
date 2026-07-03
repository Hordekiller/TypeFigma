import { describe, it, expect } from 'vitest';
import { AdminPanelGenerator } from '../config-panel.js';
import type { ExtractedTokens, ComponentClassification } from '@typefigma/analyzer';

const mockTokens: ExtractedTokens = {
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
      heading: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'system-ui, sans-serif' },
      body: { name: 'Inter', weights: [400, 500], fallback: 'system-ui, sans-serif' },
    },
    fontSizes: { base: '1rem' },
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
  spacing: { '0': '0', '4': '1rem' },
  sizing: { full: '100%', auto: 'auto' },
  borderRadius: { none: '0', default: '0.375rem', full: '9999px' },
  shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  borders: { width: { '0': '0', default: '1px' }, styles: { solid: 'solid', none: 'none' } },
  transitions: { duration: { base: '250ms' }, timing: { ease: 'ease' } },
  breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
  zIndex: { '0': 0, auto: 'auto' },
};

const mockComponents: ComponentClassification = {
  headers: [{ id: 'h1', figmaNodeId: 'h1', name: 'Header', confidence: 0.9, type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true, layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } } }],
  footers: [{ id: 'f1', figmaNodeId: 'f1', name: 'Footer', confidence: 0.9, columns: 4, hasNewsletter: true, hasSocial: true, hasMenu: true }],
  navigation: [{ id: 'n1', figmaNodeId: 'n1', type: 'horizontal', items: 4, hasDropdown: true }],
  heroes: [{ id: 'he1', figmaNodeId: 'he1', name: 'Hero', confidence: 0.9, layout: 'centered', hasVideo: false, hasSlider: true, hasOverlay: false, content: { hasHeadline: true, hasSubtext: true, hasButtons: true, hasImage: true } }],
  ctaSections: [{ id: 'c1', figmaNodeId: 'c1', confidence: 0.9, type: 'banner', hasButton: true, hasImage: true }],
  testimonials: [{ id: 't1', figmaNodeId: 't1', confidence: 0.9, layout: 'grid', hasAvatar: true, hasRating: true, hasCompanyLogo: false }],
  galleries: [{ id: 'g1', figmaNodeId: 'g1', layout: 'grid', imageCount: 8, hasLightbox: true, hasFilter: true }],
  productCards: [{ id: 'p1', figmaNodeId: 'p1', name: 'Product Card', confidence: 0.9, structure: { productImage: { nodeId: 'img1', aspectRatio: '1:1', hasBorderRadius: true, hasHoverEffect: true }, productTitle: { nodeId: 'title1', maxLines: 2 }, productPrice: { nodeId: 'price1', format: 'regular', hasCurrency: true }, addToCartButton: { nodeId: 'btn1', text: 'Add to Cart' } }, layout: { type: 'card', alignment: 'center', spacing: { top: '0', right: '0', bottom: '0', left: '0' }, containerPadding: { top: '0', right: '0', bottom: '0', left: '0' } } }],
  productDetails: [], cartComponents: [], checkoutComponents: [],
  postCards: [{ id: 'pc1', figmaNodeId: 'pc1', confidence: 0.8, hasImage: true, hasCategory: true, hasDate: true, hasAuthor: false, hasExcerpt: true, hasReadMore: true, layout: 'vertical' }],
  postDetail: [], contactForms: [], searchBars: [], newsletters: [],
  sections: [], containers: [], columns: [],
};

describe('AdminPanelGenerator', () => {
  const generator = new AdminPanelGenerator({
    themeSlug: 'test-theme',
    themeName: 'Test Theme',
    tokens: mockTokens,
    components: mockComponents,
  });

  it('should generate admin page PHP with correct theme name', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('Test Theme');
    expect(php).toContain('test-theme');
    expect(php).toContain('<?php');
    expect(php).toContain('admin_menu');
    expect(php).toContain('admin_init');
  });

  it('should include all expected settings tabs', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('tab=general');
    expect(php).toContain('tab=shop');
    expect(php).toContain('tab=typography');
    expect(php).toContain('tab=colors');
    expect(php).toContain('tab=layout');
    expect(php).toContain('tab=social');
    expect(php).toContain('tab=advanced');
  });

  it('should include shop settings when productCards are present', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('products_per_page');
    expect(php).toContain('product_columns');
    expect(php).toContain('catalog_mode');
  });

  it('should include header settings', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('header_sticky');
    expect(php).toContain('header_transparent');
  });

  it('should include footer columns setting', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('footer_columns');
  });

  it('should include social link fields', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('social_facebook');
    expect(php).toContain('social_twitter');
    expect(php).toContain('social_instagram');
    expect(php).toContain('social_linkedin');
  });

  it('should register default color from tokens', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('#3b82f6');
    expect(php).toContain('color_primary');
  });

  it('should register default fonts from tokens', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('Inter');
    expect(php).toContain('body_font');
    expect(php).toContain('heading_font');
  });

  it('should generate style variations from token colors', () => {
    const variations = generator.generateStyleVariations(mockTokens);
    expect(variations.length).toBeGreaterThanOrEqual(1);
    const defaultVar = variations.find(v => v.slug === 'default');
    expect(defaultVar).toBeDefined();
    expect(defaultVar!.name).toBe('Default');
    const parsed = JSON.parse(defaultVar!.content);
    expect(parsed.version).toBe(3);
    expect(parsed.settings.color.palette[0].color).toBe('#3b82f6');
  });

  it('should generate dark style variation', () => {
    const variations = generator.generateStyleVariations(mockTokens);
    const darkVar = variations.find(v => v.slug === 'dark');
    expect(darkVar).toBeDefined();
    expect(darkVar!.name).toBe('Dark');
    const parsed = JSON.parse(darkVar!.content);
    expect(parsed.settings.color.palette[0].color).toBe('#3b82f6');
    expect(parsed.styles.color.background).toBe('#171717');
  });

  it('should generate file list with settings.php', () => {
    const files = generator.getFileList();
    expect(files.some(f => f.path === 'inc/admin/settings.php')).toBe(true);
    const settingsFile = files.find(f => f.path === 'inc/admin/settings.php');
    expect(settingsFile!.content).toContain('test-theme');
  });

  it('should include style variation files in file list', () => {
    const files = generator.getFileList();
    expect(files.some(f => f.path === 'styles/default.json')).toBe(true);
    expect(files.some(f => f.path === 'styles/dark.json')).toBe(true);
  });
});

describe('AdminPanelGenerator - non-ecommerce', () => {
  const nonEcomComponents: ComponentClassification = {
    ...mockComponents,
    productCards: [],
  };

  const generator = new AdminPanelGenerator({
    themeSlug: 'blog-theme',
    themeName: 'Blog Theme',
    tokens: mockTokens,
    components: nonEcomComponents,
  });

  it('should NOT include shop tab when no productCards', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).not.toContain('tab=shop');
    expect(php).not.toContain('products_per_page');
  });
});

describe('AdminPanelGenerator - minimal tokens', () => {
  const minimalTokens: ExtractedTokens = {
    colors: {
      primary: {}, secondary: {}, accent: {}, neutral: {},
      success: {}, warning: {}, error: {}, info: {},
      background: { body: '#ffffff', surface: '#fafafa', overlay: '#000' },
      text: { primary: '#000', secondary: '#666', disabled: '#999', inverse: '#fff' },
      border: { default: '#ddd', hover: '#bbb', focus: '#333' },
    },
    typography: {
      fontFamilies: { heading: { name: '', weights: [], fallback: '' }, body: { name: '', weights: [], fallback: '' } },
      fontSizes: {}, fontWeights: {}, lineHeights: {}, letterSpacing: {},
      textStyles: undefined as unknown as ExtractedTokens['typography']['textStyles'],
    },
    spacing: {}, sizing: {}, borderRadius: {}, shadows: {},
    borders: { width: {}, styles: {} }, transitions: { duration: {}, timing: {} },
    breakpoints: {}, zIndex: {},
  };

  const generator = new AdminPanelGenerator({
    themeSlug: 'minimal',
    themeName: 'Minimal',
    tokens: minimalTokens,
    components: {
      headers: [], footers: [], navigation: [], heroes: [], ctaSections: [],
      testimonials: [], galleries: [], productCards: [], productDetails: [],
      cartComponents: [], checkoutComponents: [], postCards: [], postDetail: [],
      contactForms: [], searchBars: [], newsletters: [],
      sections: [], containers: [], columns: [],
    },
  });

  it('should handle minimal tokens gracefully', () => {
    const php = generator.generateAdminPagePhp();
    expect(php).toContain('<?php');
    const files = generator.getFileList();
    expect(files.some(f => f.path === 'inc/admin/settings.php')).toBe(true);
  });

  it('should return empty style variations with sparse tokens', () => {
    const variations = generator.generateStyleVariations(minimalTokens);
    expect(variations.length).toBe(0);
  });
});
