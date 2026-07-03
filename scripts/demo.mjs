/**
 * TypeFigma Demo — generates a sample WordPress theme from built-in mock data.
 * No Figma API token required.
 */

import { CodeGenerator } from '@typefigma/code-generator';
import { ElementorGenerator } from '@typefigma/elementor-mapper';
import { ThemeBuilder, slugify } from '@typefigma/theme-builder';
import { Validator } from '@typefigma/validator';
import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

// ── Mock Figma Analysis ────────────────────────────────────────────
// Simulates what the real Analyzer would produce.

const mockProjectType = {
  type: 'ecommerce',
  confidence: 0.87,
  indicators: {
    hasProductCards: true,
    hasAddToCart: true,
    hasCheckout: true,
    hasWishlist: true,
    hasProductGallery: true,
    hasReviews: true,
    hasPricing: true,
    hasBlogPosts: false,
    hasPortfolioItems: false,
    hasContactForms: true,
    hasTeamSection: false,
    hasServicesSection: false,
  },
  recommendedPlugins: ['Elementor Pro', 'WooCommerce', 'YITH WooCommerce Wishlist'],
};

const mockTokens = {
  colors: {
    primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
    secondary: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
    accent: { 50: '#fef3c7', 100: '#fde68a', 500: '#f59e0b', 900: '#b45309' },
    neutral: { 50: '#fafafa', 100: '#f5f5f5', 300: '#d4d4d4', 500: '#737373', 700: '#404040', 900: '#171717' },
    success: { 500: '#22c55e' },
    warning: { 500: '#eab308' },
    error: { 500: '#ef4444' },
    info: { 500: '#3b82f6' },
    background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' },
    text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' },
    border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' },
    ecommerce: { sale: '#ef4444', newArrival: '#10b981', outOfStock: '#6b7280', inStock: '#22c55e', price: '#171717', salePrice: '#ef4444', rating: '#f59e0b' },
  },
  typography: {
    fontFamilies: {
      heading: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'system-ui, sans-serif' },
      body: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'system-ui, sans-serif' },
      mono: { name: 'JetBrains Mono', weights: [400, 500], fallback: 'monospace' },
    },
    fontSizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem' },
    fontWeights: { thin: 100, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeights: { none: 1, tight: 1.25, normal: 1.5, relaxed: 1.75 },
    letterSpacing: { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em' },
    textStyles: {
      h1: { fontFamily: 'Inter', fontSize: '2.25rem', fontWeight: 700, lineHeight: '1.25', letterSpacing: '0' },
      h2: { fontFamily: 'Inter', fontSize: '1.875rem', fontWeight: 700, lineHeight: '1.25', letterSpacing: '0' },
      h3: { fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0' },
      h4: { fontFamily: 'Inter', fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0' },
      h5: { fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: 500, lineHeight: '1.25', letterSpacing: '0' },
      h6: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: 500, lineHeight: '1.25', letterSpacing: '0' },
      body: { fontFamily: 'Inter', fontSize: '1rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
      bodyLarge: { fontFamily: 'Inter', fontSize: '1.125rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
      bodySmall: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
      caption: { fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
      overline: { fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '0.05em' },
      button: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 600, lineHeight: '1', letterSpacing: '0' },
    },
  },
  spacing: { '0': '0', '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem', '8': '2rem', '10': '2.5rem', '12': '3rem', '16': '4rem', '20': '5rem', '24': '6rem', '32': '8rem', '40': '10rem', '48': '12rem', '56': '14rem', '64': '16rem', '72': '18rem', '80': '20rem', '96': '24rem' },
  sizing: { container: '1280px', page: '100%', full: '100%', half: '50%', third: '33.333%', twoThirds: '66.666%', quarter: '25%' },
  borderRadius: { none: '0', sm: '0.125rem', default: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' },
  shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', base: '0 1px 3px 0 rgb(0 0 0 / 0.1)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
  borders: { width: { none: '0', default: '1px', sm: '2px', md: '4px', lg: '8px' }, styles: { solid: 'solid', dashed: 'dashed', dotted: 'dotted' } },
  transitions: { duration: { none: '0ms', fast: '150ms', base: '250ms', slow: '400ms' }, timing: { linear: 'linear', ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out' } },
  breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
  zIndex: { dropdown: '100', sticky: '200', modal: '300', toast: '400', tooltip: '500' },
};

const mockComponents = {
  headers: [{
    id: 'header_1',
    figmaNodeId: 'header_1',
    name: 'Header',
    confidence: 0.95,
    type: 'sticky',
    hasLogo: true,
    hasMenu: true,
    hasSearch: true,
    hasCTA: true,
    layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } },
  }],
  footers: [{
    id: 'footer_1',
    figmaNodeId: 'footer_1',
    name: 'Footer',
    confidence: 0.95,
    type: 'multi-column',
    columns: 4,
    hasNewsletter: true,
    hasSocialLinks: true,
    hasCopyright: true,
    layout: { width: 'full', padding: { top: '3rem', right: '2rem', bottom: '1.5rem', left: '2rem' } },
  }],
  navigation: [],
  heroes: [{
    id: 'hero_1',
    figmaNodeId: 'hero_1',
    name: 'Hero Banner',
    confidence: 0.85,
    type: 'split',
    hasHeadline: true,
    hasSubtext: true,
    hasCTA: true,
    hasImage: true,
    hasBadge: false,
    alignment: 'left',
    layout: { minHeight: '600px', maxWidth: '1280px', padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' } },
  }],
  ctaSections: [{
    id: 'cta_1',
    figmaNodeId: 'cta_1',
    name: 'Newsletter CTA',
    confidence: 0.7,
    type: 'newsletter',
    hasHeadline: true,
    hasDescription: true,
    hasButton: true,
    hasImage: false,
    buttonText: 'Subscribe',
    layout: { alignment: 'center', padding: { top: '3rem', right: '2rem', bottom: '3rem', left: '2rem' } },
  }],
  testimonials: [{
    id: 'testimonial_1',
    figmaNodeId: 'testimonial_1',
    name: 'Testimonial',
    confidence: 0.7,
    type: 'card',
    hasAvatar: true,
    hasName: true,
    hasRole: true,
    hasQuote: true,
    hasRating: true,
    layout: { alignment: 'center', padding: { top: '2rem', right: '2rem', bottom: '2rem', left: '2rem' } },
  }],
  galleries: [],
  productCards: [{
    id: 'product-card_1',
    figmaNodeId: 'product-card_1',
    name: 'Product Card',
    confidence: 0.8,
    structure: {
      productImage: { nodeId: 'img_1', aspectRatio: '1 / 1', hasBorderRadius: true, hasHoverEffect: true },
      productBadge: { nodeId: 'badge_1', position: 'top-right', text: 'Sale!' },
      productTitle: { nodeId: 'title_1', maxLines: 2 },
      productPrice: { nodeId: 'price_1', format: 'sale', hasCurrency: true },
      productRating: { nodeId: 'rating_1', style: 'stars' },
      shortDescription: { nodeId: 'desc_1', maxLength: 100 },
      addToCartButton: { nodeId: 'cart_btn_1', text: 'Add to Cart', iconPosition: 'right' },
      quickViewButton: { nodeId: 'qv_btn_1' },
      wishlistButton: { nodeId: 'wl_btn_1', position: { x: 0, y: 0 } },
      compareButton: { nodeId: 'cmp_btn_1' },
    },
    layout: { type: 'card', alignment: 'left', spacing: { top: '0', right: '0', bottom: '0', left: '0' }, containerPadding: { top: '0', right: '0', bottom: '0', left: '0' } },
  }],
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

const mockAnalysis = {
  projectMeta: { figmaUrl: 'https://figma.com/file/demo', fileName: 'Shop Demo', lastModified: new Date().toISOString() },
  projectType: mockProjectType,
  pages: [{ id: 'page_1', name: 'Home', nodes: [] }],
  components: mockComponents,
  designTokens: mockTokens,
};

// ── Pipeline ───────────────────────────────────────────────────────

const themeName = 'ShopDemo';
const themeSlug = slugify(themeName);
const outputDir = path.resolve('./output');

console.log('\nTypeFigma Demo — Generating Sample WordPress Theme\n');

try {
  // Step 4: Code Generation
  console.log('Step 4: Generating HTML/CSS...');
  const codeGen = new CodeGenerator();
  const generatedCode = codeGen.generate(mockComponents, mockTokens);
  console.log('   HTML + CSS generated');

  // Step 5: Elementor Generation
  console.log('Step 5: Generating Elementor JSON...');
  const elementorGen = new ElementorGenerator(mockTokens);
  const elementorOutput = elementorGen.generate(mockComponents);
  console.log(`   ${elementorOutput.templates.length} Elementor templates generated`);

  // Step 6-7: Theme Building
  console.log('Step 6-7: Building WordPress theme structure...');
  const themeBuilder = new ThemeBuilder(
    { themeName, themeSlug, projectType: 'ecommerce' },
    mockAnalysis,
  );
  const themeFiles = themeBuilder.build(
    elementorOutput.templates,
    elementorOutput.globalSettings,
    generatedCode,
  );
  console.log(`   ${themeFiles.length} theme files created`);

  // Write files
  const themeDir = path.join(outputDir, themeSlug);
  for (const file of themeFiles) {
    const filePath = path.join(themeDir, file.path);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.content, 'utf-8');
  }
  console.log(`   Files written to ${themeDir}`);

  // Step 9: Validate
  console.log('Step 9: Validating...');
  const validator = new Validator();
  const report = validator.validate(themeFiles);

  if (report.errors.length) {
    console.log(`   ${report.errors.length} errors:`);
    report.errors.forEach(e => console.log(`      [${e.file}] ${e.message}`));
  }
  if (report.warnings.length) {
    console.log(`   ${report.warnings.length} warnings (first 5):`);
    report.warnings.slice(0, 5).forEach(w => console.log(`      [${w.file}] ${w.message}`));
  }

  // Step 10: ZIP
  const zipPath = path.join(outputDir, `${themeSlug}.zip`);
  await createZip(themeDir, zipPath);

  console.log(`\nDone!`);
  console.log(`   Theme:    ${themeDir}/`);
  console.log(`   ZIP:      ${zipPath}`);
  console.log(`   Score:    ${report.summary.score}/100`);
  console.log(`   Errors:   ${report.errors.length}`);
  console.log(`   Warnings: ${report.warnings.length}`);
  console.log(`   CSS:      ${(report.performance.cssSize / 1024).toFixed(1)} KB`);
  console.log(`   JS:       ${(report.performance.jsSize / 1024).toFixed(1)} KB`);
  console.log(`   Total:    ${(report.performance.totalSize / 1024).toFixed(1)} KB`);
  console.log(`   a11y:     ${report.accessibility.score}/100`);
  console.log(`   i18n fns: ${report.wordpress.i18nFunctions}`);
  console.log(`   Nonces:   ${report.wordpress.noncesFound}`);

} catch (err) {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
}

function createZip(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
