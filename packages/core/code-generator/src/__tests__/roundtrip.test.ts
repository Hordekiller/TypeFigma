import { describe, it, expect } from 'vitest';
import { CodeGenerator } from '../index.js';
import type { ComponentClassification, ExtractedTokens } from '@typefigma/analyzer';
import type { AnnotationSet } from '@typefigma/annotations';

const mockComponents: ComponentClassification = {
  headers: [{ id: 'h1', figmaNodeId: 'h1', name: 'Main Header', hasLogo: true, hasMenu: true, hasCTA: true, hasSearch: false, type: 'sticky', layout: { alignment: 'space-between', height: '80px', padding: { top: '16', right: '24', bottom: '16', left: '24' } }, confidence: 0.95 }],
  heroes: [{ id: 'hero1', figmaNodeId: 'hero1', name: 'Hero', layout: 'centered', hasVideo: false, hasSlider: false, hasOverlay: false, content: { hasHeadline: true, hasSubtext: true, hasButtons: true, hasImage: false }, confidence: 0.9 }],
  footers: [{ id: 'f1', figmaNodeId: 'f1', name: 'Footer', columns: 3, hasSocial: true, hasNewsletter: false, hasMenu: true, confidence: 0.95 }],
  navigation: [],
  sections: [],
  ctaSections: [],
  productCards: [],
  productDetails: [],
  cartComponents: [],
  checkoutComponents: [],
  searchBars: [],
  newsletters: [],
  contactForms: [],
  testimonials: [],
  galleries: [],
  postCards: [],
  postDetail: [],
  containers: [],
  columns: [],
  responsiveBreakpoints: [],
  interactionStates: [],
};

const mockTokens: ExtractedTokens = {
  colors: { primary: { '500': '#1a1a2e' }, secondary: { '500': '#16213e' }, accent: { '500': '#0f3460' }, neutral: { '50': '#f8f9fa', '500': '#737373', '900': '#1a1a2e' }, success: { '500': '#22c55e' }, warning: { '500': '#eab308' }, error: { '500': '#ef4444' }, info: { '500': '#3b82f6' }, background: { body: '#ffffff', surface: '#f8f9fa', overlay: '#0000004d' }, text: { primary: '#333333', secondary: '#737373', disabled: '#a3a3a3', inverse: '#ffffff' }, border: { default: '#e0e0e0', hover: '#d4d4d4', focus: '#3b82f6' } },
  typography: { fontFamilies: { heading: { name: 'system-ui', weights: [400, 600, 700], fallback: 'sans-serif' }, body: { name: 'system-ui', weights: [400, 500], fallback: 'sans-serif' } }, fontSizes: { base: '1rem', lg: '1.125rem', xl: '1.25rem' }, fontWeights: { normal: 400, semibold: 600, bold: 700 }, lineHeights: { normal: 1.5, tight: 1.2 }, letterSpacing: { normal: '0' }, textStyles: {
    h1: { fontFamily: 'system-ui', fontSize: '3rem', fontWeight: 700, lineHeight: '1.2', letterSpacing: '0' },
    h2: { fontFamily: 'system-ui', fontSize: '2.25rem', fontWeight: 700, lineHeight: '1.2', letterSpacing: '0' },
    h3: { fontFamily: 'system-ui', fontSize: '1.5rem', fontWeight: 600, lineHeight: '1.2', letterSpacing: '0' },
    h4: { fontFamily: 'system-ui', fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.2', letterSpacing: '0' },
    h5: { fontFamily: 'system-ui', fontSize: '1rem', fontWeight: 500, lineHeight: '1.2', letterSpacing: '0' },
    h6: { fontFamily: 'system-ui', fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.2', letterSpacing: '0' },
    body: { fontFamily: 'system-ui', fontSize: '1rem', fontWeight: 400, lineHeight: '1.6', letterSpacing: '0' },
    bodyLarge: { fontFamily: 'system-ui', fontSize: '1.125rem', fontWeight: 400, lineHeight: '1.6', letterSpacing: '0' },
    bodySmall: { fontFamily: 'system-ui', fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.6', letterSpacing: '0' },
    caption: { fontFamily: 'system-ui', fontSize: '0.75rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
    overline: { fontFamily: 'system-ui', fontSize: '0.75rem', fontWeight: 500, lineHeight: '1.5', letterSpacing: '0.05em', textTransform: 'uppercase' },
    button: { fontFamily: 'system-ui', fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.5', letterSpacing: '0' },
  } },
  spacing: { '0': '0', '4': '1rem', '8': '2rem', section: '6rem' },
  sizing: { full: '100%', auto: 'auto', container: '1200px' },
  borderRadius: { none: '0', default: '0.375rem', full: '9999px' },
  shadows: { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
  borders: { width: { '0': '0', default: '1px', '2': '2px', '4': '4px' }, styles: { solid: 'solid', none: 'none' } },
  transitions: { duration: { base: '300ms' }, timing: { ease: 'ease' } },
  breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
  zIndex: { '0': 0, '10': 10, auto: 'auto' },
};

function extractRoles(html: string): Map<string, string> {
  const roles = new Map<string, string>();
  const regex = /data-tf-node-id="([^"]*)"[^>]*data-tf-role="([^"]*)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    roles.set(match[1], match[2]);
  }
  return roles;
}

describe('round-trip: annotation overrides in regeneration', () => {
  it('overriding one role changes exactly one data-tf-role and output otherwise byte-identical', () => {
    const gen = new CodeGenerator({ traceability: true });

    const htmlBase = gen.generate(mockComponents, mockTokens).html;
    const rolesBase = extractRoles(htmlBase);

    const annotationSet: AnnotationSet = {
      schemaVersion: 1,
      figmaFileKey: 'test-key',
      annotations: [
        { figmaNodeId: 'h1', domSelector: '[data-tf-node-id="h1"]', role: 'cta', source: 'user', confidence: 1, updatedAt: '2025-01-02T00:00:00.000Z' },
      ],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    };

    const htmlOverridden = gen.generate(mockComponents, mockTokens, undefined, annotationSet).html;
    const rolesOverridden = extractRoles(htmlOverridden);

    expect(rolesBase.get('h1')).toBe('header');
    expect(rolesOverridden.get('h1')).toBe('cta');

    let changedCount = 0;
    const allNodeIds = new Set([...rolesBase.keys(), ...rolesOverridden.keys()]);
    for (const nodeId of allNodeIds) {
      if (rolesBase.get(nodeId) !== rolesOverridden.get(nodeId)) {
        changedCount++;
      }
    }
    expect(changedCount).toBe(1);
  });

  it('no annotations passed produces identical output to empty annotations', () => {
    const gen = new CodeGenerator({ traceability: true });

    const htmlNoAnno = gen.generate(mockComponents, mockTokens).html;
    const emptySet: AnnotationSet = {
      schemaVersion: 1,
      figmaFileKey: 'test-key',
      annotations: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const htmlEmptyAnno = gen.generate(mockComponents, mockTokens, undefined, emptySet).html;

    expect(htmlNoAnno).toBe(htmlEmptyAnno);
  });

  it('multiple overrides each change their respective roles', () => {
    const gen = new CodeGenerator({ traceability: true });

    const htmlBase = gen.generate(mockComponents, mockTokens).html;
    const rolesBase = extractRoles(htmlBase);

    const annotationSet: AnnotationSet = {
      schemaVersion: 1,
      figmaFileKey: 'test-key',
      annotations: [
        { figmaNodeId: 'h1', domSelector: '[data-tf-node-id="h1"]', role: 'cta', source: 'user', confidence: 1, updatedAt: '2025-01-02T00:00:00.000Z' },
        { figmaNodeId: 'hero1', domSelector: '[data-tf-node-id="hero1"]', role: 'section', source: 'user', confidence: 1, updatedAt: '2025-01-02T00:00:00.000Z' },
        { figmaNodeId: 'f1', domSelector: '[data-tf-node-id="f1"]', role: 'contact-form', source: 'user', confidence: 1, updatedAt: '2025-01-02T00:00:00.000Z' },
      ],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    };

    const htmlOverridden = gen.generate(mockComponents, mockTokens, undefined, annotationSet).html;
    const rolesOverridden = extractRoles(htmlOverridden);

    expect(rolesOverridden.get('h1')).toBe('cta');
    expect(rolesOverridden.get('hero1')).toBe('section');
    expect(rolesOverridden.get('f1')).toBe('contact-form');

    let changedCount = 0;
    const allNodeIds = new Set([...rolesBase.keys(), ...rolesOverridden.keys()]);
    for (const nodeId of allNodeIds) {
      if (rolesBase.get(nodeId) !== rolesOverridden.get(nodeId)) {
        changedCount++;
      }
    }
    expect(changedCount).toBe(3);
  });
});
