import { describe, it, expect } from 'vitest';
import { ElementorMapper } from '../mapper.js';
import { getSectionTemplate } from '../templates.js';
import type { ComponentClassification, ExtractedTokens } from '@typefigma/analyzer';

const minimalTokens: ExtractedTokens = {
  colors: {
    primary: { '500': '#3B82F6', '600': '#2563EB' },
    secondary: { '500': '#8B5CF6' },
    accent: { '500': '#F59E0B' },
    neutral: { '50': '#F9FAFB', '100': '#F3F4F6', '200': '#E5E7EB', '300': '#D1D5DB', '400': '#9CA3AF', '500': '#6B7280', '600': '#4B5563', '700': '#374151', '800': '#1F2937', '900': '#111827' },
    success: { '500': '#10B981' },
    warning: { '500': '#F59E0B' },
    error: { '500': '#EF4444' },
    info: { '500': '#3B82F6' },
    background: { body: '#FFFFFF', surface: '#F9FAFB', overlay: '#00000033' },
    text: { primary: '#111827', secondary: '#6B7280', disabled: '#9CA3AF', inverse: '#FFFFFF' },
    border: { default: '#E5E7EB', hover: '#D1D5DB', focus: '#3B82F6' },
  },
  typography: {
    fontFamilies: {
      heading: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'sans-serif' },
      body: { name: 'Inter', weights: [400, 500, 600, 700], fallback: 'sans-serif' },
    },
    fontSizes: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px', '3xl': '30px', '4xl': '36px', '5xl': '48px' },
    fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeights: { none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 },
    letterSpacing: { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em', widest: '0.1em' },
    textStyles: {
      h1: { fontFamily: 'Inter', fontSize: '48px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' },
      h2: { fontFamily: 'Inter', fontSize: '36px', fontWeight: 700, lineHeight: '1.25', letterSpacing: '-0.02em' },
      h3: { fontFamily: 'Inter', fontSize: '30px', fontWeight: 600, lineHeight: '1.3', letterSpacing: 'normal' },
      h4: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 600, lineHeight: '1.4', letterSpacing: 'normal' },
      h5: { fontFamily: 'Inter', fontSize: '20px', fontWeight: 600, lineHeight: '1.4', letterSpacing: 'normal' },
      h6: { fontFamily: 'Inter', fontSize: '18px', fontWeight: 600, lineHeight: '1.4', letterSpacing: 'normal' },
      body: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 400, lineHeight: '1.5', letterSpacing: 'normal' },
      bodyLarge: { fontFamily: 'Inter', fontSize: '18px', fontWeight: 400, lineHeight: '1.5', letterSpacing: 'normal' },
      bodySmall: { fontFamily: 'Inter', fontSize: '14px', fontWeight: 400, lineHeight: '1.5', letterSpacing: 'normal' },
      caption: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 400, lineHeight: '1.5', letterSpacing: 'normal' },
      overline: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, lineHeight: '1.5', letterSpacing: '0.1em' },
      button: { fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, lineHeight: '1', letterSpacing: 'normal' },
    },
  },
  spacing: {},
  sizing: {},
  borderRadius: {},
  shadows: {},
  borders: { width: {}, styles: {} },
  transitions: { duration: {}, timing: {} },
  breakpoints: {},
  zIndex: {},
};

function createMapper(): ElementorMapper {
  return new ElementorMapper(minimalTokens);
}

function emptyClassification(): ComponentClassification {
  return {
    headers: [],
    footers: [],
    navigation: [],
    heroes: [],
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
}

describe('ElementorMapper.generateHierarchicalSelection()', () => {
  it('should include error-404 even with no components', () => {
    const mapper = createMapper();
    const result = mapper.generateHierarchicalSelection(emptyClassification());
    expect(result.selectedSections).toContain('error-404');
  });

  it('should include header when headers are present', () => {
    const mapper = createMapper();
    const comps = emptyClassification();
    comps.headers.push({
      id: 'header_1', figmaNodeId: 'n1', name: 'Header', confidence: 0.9,
      type: 'static', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: false,
      layout: { alignment: 'center', height: '80px', padding: { top: '16px', right: '40px', bottom: '16px', left: '40px' } },
    });
    const result = mapper.generateHierarchicalSelection(comps);
    expect(result.selectedSections).toContain('header');
  });

  it('should include hero and about when sections are present', () => {
    const mapper = createMapper();
    const comps = emptyClassification();
    comps.sections.push({
      id: 'section_1', figmaNodeId: 'n2', name: 'Section', type: 'generic', confidence: 0.8,
      layout: { fullWidth: false, hasContainer: true, padding: { top: '80px', right: '40px', bottom: '80px', left: '40px' } },
    });
    const result = mapper.generateHierarchicalSelection(comps);
    expect(result.selectedSections).toContain('hero');
    expect(result.selectedSections).toContain('about');
    expect(result.selectedSections).toContain('services');
    expect(result.selectedSections).toContain('features');
  });

  it('should include WooCommerce sections from product components', () => {
    const mapper = createMapper();
    const comps = emptyClassification();
    comps.productCards.push({
      id: 'pc_1', figmaNodeId: 'n3', name: 'Product Card', confidence: 0.9,
      structure: {
        productImage: { nodeId: 'img1', aspectRatio: '1:1', hasBorderRadius: true, hasHoverEffect: true },
        productTitle: { nodeId: 'title1', maxLines: 2 },
        productPrice: { nodeId: 'price1', format: 'regular', hasCurrency: true },
        addToCartButton: { nodeId: 'btn1', text: 'Add to Cart' },
      },
      layout: { type: 'card', alignment: 'center', spacing: { top: '8px', right: '8px', bottom: '8px', left: '8px' }, containerPadding: { top: '16px', right: '16px', bottom: '16px', left: '16px' } },
    });
    comps.productDetails.push({
      id: 'pd_1', figmaNodeId: 'n4', confidence: 0.9,
      layout: 'fullwidth',
      sections: {
        productGallery: { nodeId: 'gal1', type: 'grid', hasZoom: true, hasLightbox: true },
        productMeta: {
          title: { nodeId: 'title2', tag: 'h1' },
          price: { nodeId: 'price2', showSalePrice: true, showSavings: false },
          rating: { nodeId: 'rating1', showCount: true, linkToReviews: true },
          availability: { nodeId: 'avail1' },
        },
        shortDescription: { nodeId: 'desc1' },
        addToCart: {
          quantitySelector: { nodeId: 'qty1', style: 'stepper' },
          addToCartButton: { nodeId: 'btn2', text: 'Add to Cart' },
        },
        productActions: {},
        productTabs: { nodeId: 'tabs1', type: 'tabs', hasDescription: true, hasAdditionalInfo: true, hasReviews: true },
      },
    });
    const result = mapper.generateHierarchicalSelection(comps);
    expect(result.selectedSections).toContain('product-grid');
    expect(result.selectedSections).toContain('product-single');
  });

  it('should include cart and checkout from cart/checkout components', () => {
    const mapper = createMapper();
    const comps = emptyClassification();
    comps.cartComponents.push({
      id: 'cart_1', figmaNodeId: 'n5', confidence: 0.9,
      type: 'full-cart', hasQuantityControl: true, hasRemoveButton: true, hasCouponInput: true, hasProceedToCheckout: true,
    });
    comps.checkoutComponents.push({
      id: 'checkout_1', figmaNodeId: 'n6', confidence: 0.9,
      layout: 'two-column', hasBillingForm: true, hasShippingForm: true, hasOrderSummary: true, hasPaymentMethods: true,
    });
    const result = mapper.generateHierarchicalSelection(comps);
    expect(result.selectedSections).toContain('cart-page');
    expect(result.selectedSections).toContain('checkout-page');
  });

  it('should include testimonial section when testimonials are present', () => {
    const mapper = createMapper();
    const comps = emptyClassification();
    comps.testimonials.push({
      id: 'test_1', figmaNodeId: 'n7', confidence: 0.9,
      layout: 'grid', hasAvatar: true, hasRating: false, hasCompanyLogo: false,
    });
    const result = mapper.generateHierarchicalSelection(comps);
    expect(result.selectedSections).toContain('testimonials');
  });

  it('should include blog sections from post cards', () => {
    const mapper = createMapper();
    const comps = emptyClassification();
    comps.postCards.push({
      id: 'post_1', figmaNodeId: 'n8', confidence: 0.9,
      hasImage: true, hasCategory: true, hasDate: true, hasAuthor: true, hasExcerpt: true, hasReadMore: true,
      layout: 'vertical',
    });
    comps.postDetail.push({
      id: 'postd_1', figmaNodeId: 'n9', confidence: 0.9,
      hasFeaturedImage: true, hasAuthorBio: true, hasRelatedPosts: true, hasComments: true, hasShareButtons: true,
    });
    const result = mapper.generateHierarchicalSelection(comps);
    expect(result.selectedSections).toContain('blog-posts');
    expect(result.selectedSections).toContain('single-post');
  });

  it('should return unique sections (no duplicates)', () => {
    const mapper = createMapper();
    const comps = emptyClassification();
    comps.headers.push({
      id: 'header_2', figmaNodeId: 'n10', name: 'Header', confidence: 0.9,
      type: 'static', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: false,
      layout: { alignment: 'center', height: '80px', padding: { top: '16px', right: '40px', bottom: '16px', left: '40px' } },
    });
    comps.navigation.push({ id: 'nav_1', figmaNodeId: 'n11', type: 'horizontal', items: 5, hasDropdown: true });
    // Both headers and navigation add 'header' — should appear only once
    const result = mapper.generateHierarchicalSelection(comps);
    const unique = new Set(result.selectedSections);
    expect(unique.size).toBe(result.selectedSections.length);
  });

  it('should include footer when footers are present', () => {
    const mapper = createMapper();
    const comps = emptyClassification();
    comps.footers.push({
      id: 'footer_1', figmaNodeId: 'n12', name: 'Footer', confidence: 0.9,
      columns: 4, hasSocial: true, hasNewsletter: false, hasMenu: true,
    });
    const result = mapper.generateHierarchicalSelection(comps);
    expect(result.selectedSections).toContain('footer');
  });
});

describe('ElementorMapper.generateFromTemplates()', () => {
  it('should return empty array when no sections selected', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: [],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result).toEqual([]);
  });

  it('should generate a template for each selected section', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['header', 'footer'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result.length).toBe(2);
    const titles = result.map(t => t.title);
    expect(titles).toContain('Header');
    expect(titles).toContain('Footer');
  });

  it('should generate correct ElementorTemplate structure', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['header'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result.length).toBe(1);
    const t = result[0];
    expect(t.title).toBe('Header');
    expect(t.type).toBe('header');
    expect(Array.isArray(t.content)).toBe(true);
    expect(t.content.length).toBeGreaterThan(0);
    expect(t.condition).toBeDefined();
  });

  it('should set condition for header type', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['header'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result[0].condition).toEqual([{ name: 'include', sub_name: 'entire_site' }]);
  });

  it('should set condition for footer type', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['footer'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result[0].condition).toEqual([{ name: 'include', sub_name: 'entire_site' }]);
  });

  it('should set condition for single-post type', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['single-post'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result[0].condition).toEqual([{ name: 'include', sub_name: 'single_post' }]);
  });

  it('should set condition for archive type', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['blog-posts'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result[0].condition).toEqual([{ name: 'include', sub_name: 'archive' }]);
  });

  it('should set condition for product-archive type', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['product-grid'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result[0].condition).toEqual([{ name: 'include', sub_name: 'archive' }]);
  });

  it('should not set condition for non-theme-builder types', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['hero'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result[0].condition).toBeUndefined();
  });

  it('should generate nested container structure', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['cta-banner'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result.length).toBe(1);
    const rootContainer = result[0].content[0];
    expect(rootContainer.elType).toBe('container');
    expect(Array.isArray(rootContainer.elements)).toBe(true);
    // Each widget group becomes an inner container
    for (const child of rootContainer.elements!) {
      expect(child.elType).toBe('container');
      expect(Array.isArray(child.elements)).toBe(true);
    }
  });

  it('should generate widgets in inner containers', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['header'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    const root = result[0].content[0];
    const hasWidgets = root.elements!.some((group) =>
      group.elements && group.elements.some((w) => w.elType === 'widget' && w.widgetType),
    );
    expect(hasWidgets).toBe(true);
  });

  it('should apply widget overrides', () => {
    const mapper = createMapper();
    const overrides = {
      header: {
        background_color: '#000000',
      } as Record<string, unknown>,
    };
    const result = mapper.generateFromTemplates({
      selectedSections: ['header'],
      selectedGroups: {},
      widgetOverrides: overrides,
    });
    const root = result[0].content[0];
    expect(root.settings).toHaveProperty('background_color', '#000000');
  });

  it('should filter by project types', () => {
    const mapper = createMapper();
    const allSections = ['header', 'hero', 'cart-page', 'product-grid', 'footer'];
    const result = mapper.generateFromTemplates(
      { selectedSections: allSections, selectedGroups: {}, widgetOverrides: {} },
      ['ecommerce'],
    );
    // WooCommerce sections should appear, blog/basic should not
    for (const t of result) {
      const template = getSectionTemplateFromTitle(t.title);
      if (template) {
        expect(template.relevantFor).toContain('ecommerce');
      }
    }
  });

  it('should support multiple section types in one call', () => {
    const mapper = createMapper();
    const result = mapper.generateFromTemplates({
      selectedSections: ['header', 'hero', 'about', 'services', 'testimonials', 'footer'],
      selectedGroups: {},
      widgetOverrides: {},
    });
    expect(result.length).toBe(6);
    const types = result.map(t => t.title);
    expect(types).toContain('Header');
    expect(types).toContain('Hero Section');
  });
});

// Helper
function getSectionTemplateFromTitle(title: string) {
  const key = title.toLowerCase().replace(/\s+/g, '-');
  return getSectionTemplate(key);
}
