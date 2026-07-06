import { describe, it, expect } from 'vitest';
import type { ComponentClassification } from '@typefigma/analyzer';
import { buildAutoAnnotations, ANALYZER_ROLE_MAP } from '../bridge.js';
import { isAnnotationSet } from '@typefigma/annotations';

const FIXED_DATE = '2026-07-06T12:00:00.000Z';
const fixedClock = () => FIXED_DATE;

describe('ANALYZER_ROLE_MAP', () => {
  it('should map all 19 component categories', () => {
    expect(Object.keys(ANALYZER_ROLE_MAP)).toHaveLength(19);
  });

  it('should map each category to a valid ComponentRole', () => {
    for (const role of Object.values(ANALYZER_ROLE_MAP)) {
      expect(role).toEqual(expect.any(String));
      expect(role.length).toBeGreaterThan(0);
    }
  });

  it('should match the Phase A mapping table', () => {
    expect(ANALYZER_ROLE_MAP.headers).toBe('header');
    expect(ANALYZER_ROLE_MAP.footers).toBe('footer');
    expect(ANALYZER_ROLE_MAP.navigation).toBe('nav-menu');
    expect(ANALYZER_ROLE_MAP.heroes).toBe('hero');
    expect(ANALYZER_ROLE_MAP.ctaSections).toBe('cta');
    expect(ANALYZER_ROLE_MAP.testimonials).toBe('testimonial');
    expect(ANALYZER_ROLE_MAP.galleries).toBe('gallery');
    expect(ANALYZER_ROLE_MAP.productCards).toBe('product-card');
    expect(ANALYZER_ROLE_MAP.productDetails).toBe('product-detail');
    expect(ANALYZER_ROLE_MAP.cartComponents).toBe('cart');
    expect(ANALYZER_ROLE_MAP.checkoutComponents).toBe('checkout');
    expect(ANALYZER_ROLE_MAP.postCards).toBe('blog-list');
    expect(ANALYZER_ROLE_MAP.postDetail).toBe('blog-post');
    expect(ANALYZER_ROLE_MAP.contactForms).toBe('contact-form');
    expect(ANALYZER_ROLE_MAP.searchBars).toBe('search-form');
    expect(ANALYZER_ROLE_MAP.newsletters).toBe('newsletter');
    expect(ANALYZER_ROLE_MAP.sections).toBe('section');
    expect(ANALYZER_ROLE_MAP.containers).toBe('container');
    expect(ANALYZER_ROLE_MAP.columns).toBe('column');
  });
});

describe('buildAutoAnnotations', () => {
  it('should return a valid AnnotationSet for empty classification', () => {
    const result = buildAutoAnnotations(
      { figmaFileKey: 'test-key', classification: emptyClassification() },
      fixedClock,
    );
    expect(isAnnotationSet(result)).toBe(true);
    expect(result.figmaFileKey).toBe('test-key');
    expect(result.annotations).toHaveLength(0);
    expect(result.createdAt).toBe(FIXED_DATE);
    expect(result.updatedAt).toBe(FIXED_DATE);
  });

  it('should create one annotation per component with correct role mapping', () => {
    const classification = singlePerCategory();
    const result = buildAutoAnnotations(
      { figmaFileKey: 'key', classification },
      fixedClock,
    );
    expect(result.annotations).toHaveLength(19);

    for (const a of result.annotations) {
      expect(a.source).toBe('auto');
      expect(a.domSelector).toBe(`[data-tf-node-id="${a.figmaNodeId}"]`);
      expect(a.updatedAt).toBe(FIXED_DATE);
    }
  });

  it('should preserve analyzer confidence when present', () => {
    const classification = emptyClassification();
    classification.headers = [
      { id: 'h1', figmaNodeId: 'header:1', name: 'Header', confidence: 0.95, type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true, layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } } },
    ];
    const result = buildAutoAnnotations(
      { figmaFileKey: 'key', classification },
      fixedClock,
    );
    expect(result.annotations[0].confidence).toBe(0.95);
  });

  it('should use default confidence for components without confidence field', () => {
    const classification = emptyClassification();
    classification.navigation = [
      { id: 'n1', figmaNodeId: 'nav:1', type: 'horizontal', items: 5, hasDropdown: false },
    ];
    classification.galleries = [
      { id: 'g1', figmaNodeId: 'gal:1', layout: 'grid', imageCount: 6, hasLightbox: false, hasFilter: false },
    ];
    const result = buildAutoAnnotations(
      { figmaFileKey: 'key', classification },
      fixedClock,
    );
    const navAnnotation = result.annotations.find(a => a.figmaNodeId === 'nav:1');
    const galAnnotation = result.annotations.find(a => a.figmaNodeId === 'gal:1');
    expect(navAnnotation?.confidence).toBe(0.7);
    expect(galAnnotation?.confidence).toBe(0.6);
  });

  it('should include name in props when component has name', () => {
    const classification = emptyClassification();
    classification.headers = [
      { id: 'h1', figmaNodeId: 'header:1', name: 'My Header', confidence: 0.95, type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true, layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } } },
    ];
    classification.navigation = [
      { id: 'n1', figmaNodeId: 'nav:1', type: 'horizontal', items: 5, hasDropdown: false },
    ];
    const result = buildAutoAnnotations(
      { figmaFileKey: 'key', classification },
      fixedClock,
    );
    const headerAnnotation = result.annotations.find(a => a.figmaNodeId === 'header:1');
    const navAnnotation = result.annotations.find(a => a.figmaNodeId === 'nav:1');
    expect(headerAnnotation?.props).toEqual({ name: 'My Header' });
    expect(navAnnotation?.props).toBeUndefined();
  });

  it('should produce deterministic output sorted by figmaNodeId', () => {
    const classification = emptyClassification();
    classification.headers = [
      { id: 'h1', figmaNodeId: 'z:1', name: 'Z', confidence: 0.9, type: 'sticky', hasLogo: false, hasMenu: false, hasSearch: false, hasCTA: false, layout: { alignment: 'space-between', height: '80px', padding: { top: '0', right: '0', bottom: '0', left: '0' } } },
      { id: 'h2', figmaNodeId: 'a:1', name: 'A', confidence: 0.9, type: 'sticky', hasLogo: false, hasMenu: false, hasSearch: false, hasCTA: false, layout: { alignment: 'space-between', height: '80px', padding: { top: '0', right: '0', bottom: '0', left: '0' } } },
    ];
    classification.footers = [
      { id: 'f1', figmaNodeId: 'm:1', name: 'M', confidence: 0.9, columns: 3, hasSocial: false, hasNewsletter: false, hasMenu: false },
    ];

    const result = buildAutoAnnotations(
      { figmaFileKey: 'key', classification },
      fixedClock,
    );

    expect(result.annotations.map(a => a.figmaNodeId)).toEqual(['a:1', 'm:1', 'z:1']);
  });

  it('should produce stable timestamps with injected clock', () => {
    const result1 = buildAutoAnnotations(
      { figmaFileKey: 'key', classification: emptyClassification() },
      fixedClock,
    );
    const result2 = buildAutoAnnotations(
      { figmaFileKey: 'key', classification: emptyClassification() },
      fixedClock,
    );
    expect(result1.createdAt).toBe(result2.createdAt);
    expect(result1.updatedAt).toBe(result2.updatedAt);
  });

  it('default clock should produce valid ISO timestamps', () => {
    const classification = emptyClassification();
    classification.headers = [
      { id: 'h1', figmaNodeId: 'h:1', name: 'H', confidence: 0.9, type: 'sticky', hasLogo: false, hasMenu: false, hasSearch: false, hasCTA: false, layout: { alignment: 'space-between', height: '80px', padding: { top: '0', right: '0', bottom: '0', left: '0' } } },
    ];
    const result = buildAutoAnnotations({ figmaFileKey: 'key', classification });
    expect(() => new Date(result.createdAt)).not.toThrow();
    expect(result.annotations[0].updatedAt).toBeTruthy();
  });
});

function singlePerCategory(): ComponentClassification {
  return {
    headers: [{ id: 'h1', figmaNodeId: 'header:1', name: 'Header', confidence: 0.95, type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true, layout: { alignment: 'space-between', height: '80px', padding: { top: '0', right: '0', bottom: '0', left: '0' } } }],
    footers: [{ id: 'f1', figmaNodeId: 'footer:1', name: 'Footer', confidence: 0.9, columns: 4, hasSocial: false, hasNewsletter: false, hasMenu: false }],
    navigation: [{ id: 'n1', figmaNodeId: 'nav:1', type: 'horizontal', items: 3, hasDropdown: false }],
    heroes: [{ id: 'he1', figmaNodeId: 'hero:1', name: 'Hero', confidence: 0.85, layout: 'centered', hasVideo: false, hasSlider: false, hasOverlay: false, content: { hasHeadline: true, hasSubtext: false, hasButtons: true, hasImage: false } }],
    ctaSections: [{ id: 'c1', figmaNodeId: 'cta:1', confidence: 0.8, type: 'banner', hasButton: true, hasImage: false }],
    testimonials: [{ id: 't1', figmaNodeId: 'testimonial:1', confidence: 0.9, layout: 'grid', hasAvatar: true, hasRating: true, hasCompanyLogo: false }],
    galleries: [{ id: 'g1', figmaNodeId: 'gallery:1', layout: 'grid', imageCount: 6, hasLightbox: false, hasFilter: false }],
    productCards: [{
      id: 'pc1', figmaNodeId: 'product:1', name: 'Product', confidence: 0.9,
      structure: {
        productImage: { nodeId: 'i1', aspectRatio: '1/1', hasBorderRadius: false, hasHoverEffect: false },
        productTitle: { nodeId: 't1', maxLines: 2 },
        productPrice: { nodeId: 'p1', format: 'regular', hasCurrency: true },
        addToCartButton: { nodeId: 'atc1', text: 'Add to Cart' },
      },
      layout: { type: 'card', alignment: 'left', spacing: { top: '0', right: '0', bottom: '0', left: '0' }, containerPadding: { top: '0', right: '0', bottom: '0', left: '0' } },
    }],
    productDetails: [{
      id: 'pd1', figmaNodeId: 'pdetail:1', confidence: 0.85, layout: 'fullwidth',
      sections: {
        productGallery: { nodeId: 'pg1', type: 'slider', hasZoom: false, hasLightbox: false },
        productMeta: {
          title: { nodeId: 'pt1', tag: 'h1' },
          price: { nodeId: 'pp1', showSalePrice: false, showSavings: false },
          rating: { nodeId: 'pr1', showCount: true, linkToReviews: false },
          availability: { nodeId: 'pa1' },
        },
        shortDescription: { nodeId: 'psd1' },
        addToCart: {
          quantitySelector: { nodeId: 'qs1', style: 'input' },
          addToCartButton: { nodeId: 'acb1', text: 'Add to Cart' },
        },
        productActions: {},
        productTabs: { nodeId: 'ptb1', type: 'tabs', hasDescription: true, hasAdditionalInfo: true, hasReviews: true },
      },
    }],
    cartComponents: [{ id: 'ca1', figmaNodeId: 'cart:1', confidence: 0.8, type: 'full-cart', hasQuantityControl: true, hasRemoveButton: true, hasCouponInput: false, hasProceedToCheckout: true }],
    checkoutComponents: [{ id: 'ch1', figmaNodeId: 'checkout:1', confidence: 0.85, layout: 'two-column', hasBillingForm: true, hasShippingForm: false, hasOrderSummary: true, hasPaymentMethods: true }],
    postCards: [{ id: 'po1', figmaNodeId: 'post:1', confidence: 0.85, hasImage: true, hasCategory: true, hasDate: true, hasAuthor: true, hasExcerpt: true, hasReadMore: true, layout: 'vertical' }],
    postDetail: [{ id: 'pde1', figmaNodeId: 'pdetail2:1', confidence: 0.8, hasFeaturedImage: true, hasAuthorBio: false, hasRelatedPosts: false, hasComments: false, hasShareButtons: true }],
    contactForms: [{
      id: 'cf1', figmaNodeId: 'form:1', name: 'Contact', confidence: 0.9, type: 'contact',
      fields: { inputs: [], textareas: [] },
      submitButton: { nodeId: 'sb1', text: 'Send' },
      layout: { columns: 1, fieldSpacing: 16, labelPosition: 'top' },
    }],
    searchBars: [{ id: 's1', figmaNodeId: 'search:1', type: 'inline', hasDropdown: false, hasCategories: false }],
    newsletters: [{ id: 'nl1', figmaNodeId: 'newsletter:1', hasName: false, hasEmail: true, hasConsentCheckbox: true }],
    sections: [{
      id: 'se1', figmaNodeId: 'section:1', name: 'Features', confidence: 0.75, type: 'features', hasGrid: true,
      layout: { fullWidth: false, hasContainer: true, padding: { top: '0', right: '0', bottom: '0', left: '0' } },
    }],
    containers: [{ id: 'co1', figmaNodeId: 'container:1', type: 'flex', direction: 'row', gap: '1rem' }],
    columns: [{ id: 'col1', figmaNodeId: 'column:1', span: 6, width: '50%' }],
    responsiveBreakpoints: [],
    interactionStates: [],
  };
}

function emptyClassification(): ComponentClassification {
  return {
    headers: [], footers: [], navigation: [], heroes: [],
    ctaSections: [], testimonials: [], galleries: [],
    productCards: [], productDetails: [], cartComponents: [],
    checkoutComponents: [], postCards: [], postDetail: [],
    contactForms: [], searchBars: [], newsletters: [],
    sections: [], containers: [], columns: [],
    responsiveBreakpoints: [],
    interactionStates: [],
  };
}
