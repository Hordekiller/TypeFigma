import { describe, it, expect } from 'vitest';
import type { ComponentClassification, ExtractedTokens } from '@typefigma/analyzer';
import { CodeGenerator } from '@typefigma/code-generator';
import { buildAutoAnnotations } from '../bridge.js';
import { isAnnotation, mergeAnnotations } from '@typefigma/annotations';
import type { Annotation } from '@typefigma/annotations';

const FIXED_DATE = '2026-07-06T12:00:00.000Z';
const fixedClock = () => FIXED_DATE;

const mockTokens: ExtractedTokens = {
  colors: {
    primary: { '500': '#3b82f6' }, secondary: { '500': '#22c55e' }, accent: { '500': '#f59e0b' },
    neutral: { '50': '#fafafa', '500': '#737373', '900': '#171717' },
    success: { '500': '#22c55e' }, warning: { '500': '#eab308' }, error: { '500': '#ef4444' }, info: { '500': '#3b82f6' },
    background: { body: '#ffffff', surface: '#fafafa', overlay: '#0000004d' },
    text: { primary: '#171717', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' },
    border: { default: '#e5e5e5', hover: '#d4d4d4', focus: '#3b82f6' },
  },
  typography: {
    fontFamilies: { heading: { name: 'Inter', weights: [400, 600, 700], fallback: 'system-ui, sans-serif' }, body: { name: 'Inter', weights: [400, 500], fallback: 'system-ui, sans-serif' } },
    fontSizes: { base: '1rem', lg: '1.125rem', xl: '1.25rem' },
    fontWeights: { normal: 400, semibold: 600, bold: 700 },
    lineHeights: { normal: 1.5, tight: 1.25 },
    letterSpacing: { normal: '0' },
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
      overline: { fontFamily: 'Inter', fontSize: '0.75rem', fontWeight: 500, lineHeight: '1.5', letterSpacing: '0.05em', textTransform: 'uppercase' },
      button: { fontFamily: 'Inter', fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.5', letterSpacing: '0' },
    },
  },
  spacing: { '0': '0', '4': '1rem', '6': '1.5rem', '8': '2rem' },
  sizing: { full: '100%', auto: 'auto', container: '1200px' },
  borderRadius: { none: '0', default: '0.375rem', full: '9999px' },
  shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  borders: { width: { '0': '0', default: '1px' }, styles: { solid: 'solid', none: 'none' } },
  transitions: { duration: { base: '250ms' }, timing: { ease: 'ease' } },
  breakpoints: { sm: '640px', md: '768px', lg: '1024px' },
  zIndex: { '0': 0, '10': 10, auto: 'auto' },
};

const FIXTURE_CLASSIFICATION: ComponentClassification = {
  headers: [{
    id: 'h1', figmaNodeId: 'fig:1', name: 'Site Header', confidence: 0.95,
    type: 'sticky', hasLogo: true, hasMenu: true, hasSearch: false, hasCTA: true,
    layout: { alignment: 'space-between', height: '80px', padding: { top: '1rem', right: '2rem', bottom: '1rem', left: '2rem' } },
  }],
  footers: [{
    id: 'f1', figmaNodeId: 'fig:2', name: 'Site Footer', confidence: 0.9,
    columns: 3, hasSocial: true, hasNewsletter: false, hasMenu: true,
  }],
  heroes: [{
    id: 'he1', figmaNodeId: 'fig:3', name: 'Main Hero', confidence: 0.85,
    layout: 'centered', hasVideo: false, hasSlider: false, hasOverlay: false,
    content: { hasHeadline: true, hasSubtext: true, hasButtons: true, hasImage: false },
  }],
  sections: [{
    id: 'se1', figmaNodeId: 'fig:4', name: 'Features', confidence: 0.75,
    type: 'features', hasGrid: true,
    layout: { fullWidth: false, hasContainer: true, padding: { top: '0', right: '0', bottom: '0', left: '0' } },
  }],
  navigation: [],
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
  containers: [],
  columns: [],
  responsiveBreakpoints: [],
  interactionStates: [],
};

describe('Round-trip: analyzer → code-generator → annotation-bridge', () => {
  it('every annotation domSelector should match exactly one element in generated HTML', () => {
    const gen = new CodeGenerator({ traceability: true });
    const { html } = gen.generate(FIXTURE_CLASSIFICATION, mockTokens);

    const annotations = buildAutoAnnotations(
      { figmaFileKey: 'test-key', classification: FIXTURE_CLASSIFICATION },
      fixedClock,
    );

    expect(annotations.annotations.length).toBeGreaterThan(0);

    for (let i = 0; i < annotations.annotations.length; i++) {
      const a = annotations.annotations[i];
      expect(isAnnotation(a)).toBe(true);
      const escapedId = a.figmaNodeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`data-tf-node-id="${escapedId}"`, 'g');
      const matches = html.match(pattern);
      expect(matches, `figmaNodeId "${a.figmaNodeId}" (index ${i}) not found or duplicated in HTML`).not.toBeNull();
      expect(matches!.length, `figmaNodeId "${a.figmaNodeId}" appears ${matches!.length} times, expected 1`).toBe(1);
    }
  });

  it('every annotation role appears as data-tf-role on the correct element', () => {
    const gen = new CodeGenerator({ traceability: true });
    const { html } = gen.generate(FIXTURE_CLASSIFICATION, mockTokens);

    const annotations = buildAutoAnnotations(
      { figmaFileKey: 'test-key', classification: FIXTURE_CLASSIFICATION },
      fixedClock,
    );

    for (const a of annotations.annotations) {
      const escapedId = a.figmaNodeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const elementPattern = new RegExp(
        `<[a-z]+[^>]*data-tf-node-id="${escapedId}"[^>]*data-tf-role="${a.role}"[^>]*>`,
      );
      expect(
        elementPattern.test(html),
        `expected element with data-tf-node-id="${a.figmaNodeId}" and data-tf-role="${a.role}"`,
      ).toBe(true);
    }
  });

  it('merging with a user override flips exactly one role and leaves the rest untouched', () => {
    const gen = new CodeGenerator({ traceability: true });
    gen.generate(FIXTURE_CLASSIFICATION, mockTokens);

    const autoAnnotations = buildAutoAnnotations(
      { figmaFileKey: 'test-key', classification: FIXTURE_CLASSIFICATION },
      fixedClock,
    );

    const overrideRole = 'cta';
    const hasNaturalCta = autoAnnotations.annotations.some(a => a.role === overrideRole);
    expect(hasNaturalCta).toBe(false);

    const userOverride: Annotation = {
      figmaNodeId: 'fig:1',
      domSelector: '[data-tf-node-id="fig:1"]',
      role: overrideRole,
      source: 'user',
      confidence: 1,
      updatedAt: FIXED_DATE,
    };

    const merged = mergeAnnotations(autoAnnotations.annotations, [userOverride]);
    expect(merged).toHaveLength(autoAnnotations.annotations.length);

    const headerAnnotation = merged.find(a => a.figmaNodeId === 'fig:1');
    expect(headerAnnotation).toBeDefined();
    expect(headerAnnotation!.role).toBe(overrideRole);
    expect(headerAnnotation!.source).toBe('user');
    expect(headerAnnotation!.confidence).toBe(1);

    for (const a of merged) {
      if (a.figmaNodeId === 'fig:1') continue;
      expect(a.source).toBe('auto');
      expect(a.confidence).toBeLessThan(1);
    }
  });
});
