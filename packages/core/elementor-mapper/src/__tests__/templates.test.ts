import { describe, it, expect } from 'vitest';
import { SECTION_TEMPLATES, getSectionTemplates, getSectionTemplate } from '../templates.js';
import type { ElementorDocumentType } from '../types.js';

const VALID_DOC_TYPES: ElementorDocumentType[] = [
  'header', 'footer', 'section', 'page',
  'single-post', 'single-page', 'archive',
  'product', 'product-archive', 'error-404', 'popup',
];

const VALID_CATEGORIES = ['basic', 'woocommerce', 'marketing', 'utility', 'blog', 'page'];

function validateWidgetType(wt: string): boolean {
  return typeof wt === 'string' && wt.length > 0;
}

describe('SECTION_TEMPLATES', () => {
  it('should have at least 25 templates', () => {
    expect(SECTION_TEMPLATES.length).toBeGreaterThanOrEqual(25);
  });

  it('should have unique keys', () => {
    const keys = SECTION_TEMPLATES.map(t => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  describe.each(SECTION_TEMPLATES)('template: $key', (template) => {
    it('should have all required fields', () => {
      expect(template.key).toBeTruthy();
      expect(template.label).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(VALID_DOC_TYPES).toContain(template.templateType);
      expect(VALID_CATEGORIES).toContain(template.category);
      expect(Array.isArray(template.relevantFor)).toBe(true);
      expect(template.icon).toBeTruthy();
      expect(typeof template.enabled).toBe('boolean');
      expect(template.containerSettings).toBeTruthy();
      expect(Array.isArray(template.widgetGroups)).toBe(true);
    });

    it('should have at least one widget group', () => {
      expect(template.widgetGroups.length).toBeGreaterThanOrEqual(1);
    });

    describe.each(template.widgetGroups)('widgetGroup: $key', (group) => {
      it('should have valid group structure', () => {
        expect(group.key).toBeTruthy();
        expect(group.label).toBeTruthy();
        expect(group.description).toBeTruthy();
        expect(Array.isArray(group.widgets)).toBe(true);
        expect(group.widgets.length).toBeGreaterThanOrEqual(1);
      });

      describe.each(group.widgets)('widget: $widgetType', (widget) => {
        it('should have valid widget structure', () => {
          expect(validateWidgetType(widget.widgetType)).toBe(true);
          expect(widget.label).toBeTruthy();
          expect(widget.icon).toBeTruthy();
          expect(widget.defaultSettings).toBeTruthy();
          expect(typeof widget.defaultSettings).toBe('object');
        });
      });
    });
  });
});

describe('getSectionTemplates()', () => {
  it('should return all templates when called without args', () => {
    const all = getSectionTemplates();
    expect(all.length).toBe(SECTION_TEMPLATES.length);
  });

  it('should filter by project type', () => {
    const blog = getSectionTemplates(['blog']);
    expect(blog.length).toBeLessThan(SECTION_TEMPLATES.length);
    for (const t of blog) {
      expect(t.relevantFor).toContain('blog');
    }
  });

  it('should filter by multiple project types', () => {
    const results = getSectionTemplates(['ecommerce', 'blog']);
    for (const t of results) {
      const hasMatch = t.relevantFor.some(r => ['ecommerce', 'blog'].includes(r));
      expect(hasMatch).toBe(true);
    }
  });

  it('should return empty when no templates match', () => {
    const results = getSectionTemplates(['nonexistent-type']);
    expect(results.length).toBe(0);
  });
});

describe('getSectionTemplate()', () => {
  it('should find template by key', () => {
    const t = getSectionTemplate('header');
    expect(t).toBeDefined();
    expect(t!.key).toBe('header');
  });

  it('should return undefined for unknown key', () => {
    expect(getSectionTemplate('nonexistent')).toBeUndefined();
  });

  it.each(SECTION_TEMPLATES.map(t => t.key))('should find template: %s', (key) => {
    expect(getSectionTemplate(key)).toBeDefined();
  });
});

describe('Section template widgetType validation', () => {
  const allWidgetTypes = new Set<string>();
  for (const t of SECTION_TEMPLATES) {
    for (const g of t.widgetGroups) {
      for (const w of g.widgets) {
        allWidgetTypes.add(w.widgetType);
      }
    }
  }

  it('should have valid widgetTypes (no empty strings)', () => {
    for (const wt of allWidgetTypes) {
      expect(wt.length).toBeGreaterThan(0);
    }
  });

  it('should include common free widgets', () => {
    expect(allWidgetTypes).toContain('heading');
    expect(allWidgetTypes).toContain('image');
    expect(allWidgetTypes).toContain('button');
    expect(allWidgetTypes).toContain('text-editor');
    expect(allWidgetTypes).toContain('icon');
  });

  it('should include Pro theme builder widgets', () => {
    expect(allWidgetTypes).toContain('site-logo');
    expect(allWidgetTypes).toContain('site-title');
    expect(allWidgetTypes).toContain('nav-menu');
    expect(allWidgetTypes).toContain('search-form');
  });
});
