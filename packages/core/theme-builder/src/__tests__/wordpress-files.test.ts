import { describe, it, expect } from 'vitest';
import { WordPressFileBuilder } from '../wordpress-files.js';
import type { FigmaAnalysis } from '@typefigma/analyzer';

const mockAnalysis: FigmaAnalysis = {
  projectMeta: { figmaUrl: 'https://figma.com/file/test', fileName: 'Test Design', lastModified: '2024-01-01' },
  projectType: {
    type: 'ecommerce',
    confidence: 0.85,
    indicators: {
      hasProductCards: true, hasAddToCart: true, hasCheckout: true, hasWishlist: true,
      hasProductGallery: true, hasReviews: true, hasPricing: true,
      hasBlogPosts: false, hasPortfolioItems: false, hasContactForms: true,
      hasTeamSection: false, hasServicesSection: false,
    },
    recommendedPlugins: ['WooCommerce', 'Elementor'],
  },
  pages: [{ id: '1', name: 'Home', nodes: [] }],
  components: {
    headers: [{ id: 'h1', figmaNodeId: 'h1', name: 'Header', confidence: 0.9, type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true, layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } } }],
    footers: [{ id: 'f1', figmaNodeId: 'f1', name: 'Footer', confidence: 0.9, type: 'multi-column', columns: 4, hasNewsletter: true, hasSocialLinks: true, hasCopyright: true, layout: { width: 'full', padding: { top: '3rem', right: '2rem', bottom: '1.5rem', left: '2rem' } } }],
    navigation: [], heroes: [], ctaSections: [], testimonials: [], galleries: [],
    productCards: [], productDetails: [], cartComponents: [], checkoutComponents: [],
    postCards: [], postDetail: [], contactForms: [], searchBars: [], newsletters: [],
    sections: [], containers: [], columns: [],
  },
  designTokens: {
    colors: { primary: { '500': '#3b82f6' }, secondary: { '500': '#22c55e' }, accent: { '500': '#f59e0b' }, neutral: { '50': '#fafafa', '500': '#737373', '900': '#171717' }, success: { '500': '#22c55e' }, warning: { '500': '#eab308' }, error: { '500': '#ef4444' }, info: { '500': '#3b82f6' }, background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' }, text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' }, border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' } },
    typography: { fontFamilies: { heading: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'system-ui, sans-serif' }, body: { name: 'Inter', weights: [400, 500], fallback: 'system-ui, sans-serif' } }, fontSizes: { base: '1rem' }, fontWeights: { normal: 400, bold: 700 }, lineHeights: { normal: 1.5, tight: 1.25 }, letterSpacing: { normal: '0' },     textStyles: {
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
    } },
    spacing: { '0': '0', '4': '1rem' },
    sizing: { full: '100%', auto: 'auto' },
    borderRadius: { none: '0', default: '0.375rem', full: '9999px' },
    shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
    borders: { width: { '0': '0', default: '1px' }, styles: { solid: 'solid', none: 'none' } },
    transitions: { duration: { base: '250ms' }, timing: { ease: 'ease' } },
    breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
    zIndex: { '0': 0, auto: 'auto' },
  },
  content: { textNodes: [], imageNodes: [], sectionContent: {} },
};

const mockGeneratedCode = {
  html: '<div>Test HTML</div>',
  globalCss: ':root { --color-primary: #3b82f6; }',
  componentsCss: '.product-card { border: 1px solid; }',
};

describe('WordPressFileBuilder', () => {
  const builder = new WordPressFileBuilder(
    { themeName: 'Test Theme', themeSlug: 'test-theme', projectType: 'ecommerce' },
    mockAnalysis,
  );

  it('should build style.css with theme metadata', () => {
    const css = builder.buildStyleCss();
    expect(css).toContain('Theme Name: Test Theme');
    expect(css).toContain('Text Domain: test-theme');
    expect(css).toContain('WooCommerce');
  });

  it('should build functions.php with theme setup', () => {
    const php = builder.buildFunctionsPhp();
    expect(php).toContain('<?php');
    expect(php).toContain('after_setup_theme');
    expect(php).toContain('wp_enqueue_scripts');
    expect(php).toContain('woocommerce');
  });

  it('should build index.php', () => {
    const php = builder.buildIndexPhp();
    expect(php).toContain('get_header');
    expect(php).toContain('the_content');
    expect(php).toContain('get_footer');
  });

  it('should build header.php', () => {
    const php = builder.buildHeaderPhp();
    expect(php).toContain('<!DOCTYPE html>');
    expect(php).toContain('wp_head');
    expect(php).toContain('wp_body_open');
  });

  it('should build footer.php', () => {
    const php = builder.buildFooterPhp();
    expect(php).toContain('wp_footer');
    expect(php).toContain('site-footer');
  });

  it('should build single.php', () => {
    const php = builder.buildSinglePhp();
    expect(php).toContain('the_post');
    expect(php).toContain('comments_template');
  });

  it('should build 404.php', () => {
    const php = builder.build404Php();
    expect(php).toContain('Page Not Found');
    expect(php).toContain('get_search_form');
  });

  it('should build WooCommerce archive template', () => {
    const php = builder.buildWooArchivePhp();
    expect(php).toContain('woocommerce_before_main_content');
    expect(php).toContain('woocommerce_product_loop');
  });

  it('should build WooCommerce single product template', () => {
    const php = builder.buildWooSinglePhp();
    expect(php).toContain('single-product');
    expect(php).toContain('woocommerce_before_main_content');
    expect(php).toContain('woocommerce_after_main_content');
  });

  it('should build customizer.php with sections', () => {
    const php = builder.buildCustomizerPhp();
    expect(php).toContain('customize_register');
    expect(php).toContain('Theme Colors');
    expect(php).toContain('Typography');
    expect(php).toContain('Layout');
    expect(php).toContain('Shop Layout');
    expect(php).toContain('Social Links');
  });

  it('should build screenshot.png as valid PNG', () => {
    const png = builder.buildScreenshotPng();
    expect(png).toBeInstanceOf(Buffer);
    expect(png.length).toBeGreaterThan(100);
    expect(png[0]).toBe(137);  // PNG signature
    expect(png[1]).toBe(80);   // P
    expect(png[2]).toBe(78);   // N
    expect(png[3]).toBe(71);   // G
  });

  it('should generate all files in getAllFiles', () => {
    const files = builder.getAllFiles(
      [{ type: 'header', title: 'Header', content: [], page_settings: {} }],
      { colors: [], typography: '{"fontFamilies":[]}', breakpoints: {} },
      mockGeneratedCode,
    );
    expect(files.length).toBeGreaterThan(20);
    expect(files.some(f => f.path === 'style.css')).toBe(true);
    expect(files.some(f => f.path === 'functions.php')).toBe(true);
    expect(files.some(f => f.path === 'screenshot.png')).toBe(true);
    expect(files.some(f => f.path.startsWith('woocommerce/'))).toBe(true);
  });
});
