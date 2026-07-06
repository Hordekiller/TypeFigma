import { describe, it, expect } from 'vitest';
import {
  isComponentRole,
  isAnnotation,
  isAnnotationSet,
  parseAnnotationSet,
  AnnotationParseError,
  mergeAnnotations,
  upsertAnnotation,
} from '../index.js';
import type { Annotation, AnnotationSet } from '../types.js';

const validHeaderAnnotation: Annotation = {
  figmaNodeId: '1:23',
  domSelector: '[data-tf-node-id="1:23"]',
  role: 'header',
  source: 'auto',
  confidence: 0.85,
  updatedAt: '2025-01-15T10:00:00.000Z',
};

const validUserAnnotation: Annotation = {
  figmaNodeId: '2:45',
  domSelector: '[data-tf-node-id="2:45"]',
  role: 'hero',
  source: 'user',
  confidence: 1,
  updatedAt: '2025-01-15T10:00:00.000Z',
};

const validSet: AnnotationSet = {
  schemaVersion: 1,
  figmaFileKey: 'abc123',
  annotations: [validHeaderAnnotation, validUserAnnotation],
  createdAt: '2025-01-15T10:00:00.000Z',
  updatedAt: '2025-01-15T10:00:00.000Z',
};

// ─── isComponentRole ───────────────────────────────────────

describe('isComponentRole', () => {
  it('accepts valid roles', () => {
    expect(isComponentRole('header')).toBe(true);
    expect(isComponentRole('footer')).toBe(true);
    expect(isComponentRole('nav-menu')).toBe(true);
    expect(isComponentRole('hero')).toBe(true);
    expect(isComponentRole('cta')).toBe(true);
    expect(isComponentRole('button')).toBe(true);
    expect(isComponentRole('product-card')).toBe(true);
    expect(isComponentRole('product-detail')).toBe(true);
    expect(isComponentRole('cart')).toBe(true);
    expect(isComponentRole('checkout')).toBe(true);
    expect(isComponentRole('blog-list')).toBe(true);
    expect(isComponentRole('blog-post')).toBe(true);
    expect(isComponentRole('newsletter')).toBe(true);
    expect(isComponentRole('column')).toBe(true);
    expect(isComponentRole('unknown')).toBe(true);
  });

  it('rejects invalid strings', () => {
    expect(isComponentRole('not-a-role')).toBe(false);
    expect(isComponentRole('')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isComponentRole(42)).toBe(false);
    expect(isComponentRole(null)).toBe(false);
    expect(isComponentRole(undefined)).toBe(false);
    expect(isComponentRole({})).toBe(false);
  });
});

// ─── isAnnotation ───────────────────────────────────────────

describe('isAnnotation', () => {
  it('accepts a valid auto annotation', () => {
    expect(isAnnotation(validHeaderAnnotation)).toBe(true);
  });

  it('accepts a valid user annotation with props', () => {
    const withProps: Annotation = {
      ...validHeaderAnnotation,
      source: 'user',
      confidence: 1,
      props: { color: 'red', count: 3, enabled: true },
    };
    expect(isAnnotation(withProps)).toBe(true);
  });

  it('rejects non-object', () => {
    expect(isAnnotation(null)).toBe(false);
    expect(isAnnotation('string')).toBe(false);
    expect(isAnnotation(42)).toBe(false);
  });

  it('rejects empty figmaNodeId', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, figmaNodeId: '' })).toBe(false);
  });

  it('rejects missing figmaNodeId', () => {
    const { figmaNodeId: _, ...rest } = validHeaderAnnotation;
    expect(isAnnotation(rest)).toBe(false);
  });

  it('rejects empty domSelector', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, domSelector: '' })).toBe(false);
  });

  it('rejects invalid role', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, role: 'bogus' })).toBe(false);
  });

  it('rejects invalid source', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, source: 'admin' })).toBe(false);
  });

  it('rejects confidence below 0', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, confidence: -0.1 })).toBe(false);
  });

  it('rejects confidence above 1', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, confidence: 1.1 })).toBe(false);
  });

  it('accepts confidence exactly 0', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, confidence: 0 })).toBe(true);
  });

  it('accepts confidence exactly 1', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, confidence: 1 })).toBe(true);
  });

  it('rejects confidence NaN', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, confidence: NaN })).toBe(false);
  });

  it('rejects confidence Infinity', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, confidence: Infinity })).toBe(false);
  });

  it('rejects confidence as string', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, confidence: '0.5' })).toBe(false);
  });

  it('rejects invalid date string', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, updatedAt: 'not-a-date' })).toBe(false);
  });

  it('rejects empty date string', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, updatedAt: '' })).toBe(false);
  });

  it('rejects non-string date', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, updatedAt: 123 })).toBe(false);
  });

  it('rejects props with invalid value type', () => {
    expect(isAnnotation({ ...validHeaderAnnotation, props: { key: null } })).toBe(false);
  });

  it('accepts optional props undefined', () => {
    const { props: _, ...noProps } = validHeaderAnnotation;
    expect(isAnnotation(noProps)).toBe(true);
  });
});

// ─── isAnnotationSet ────────────────────────────────────────

describe('isAnnotationSet', () => {
  it('accepts a valid set', () => {
    expect(isAnnotationSet(validSet)).toBe(true);
  });

  it('rejects non-object', () => {
    expect(isAnnotationSet(null)).toBe(false);
  });

  it('rejects unknown schemaVersion', () => {
    expect(isAnnotationSet({ ...validSet, schemaVersion: 2 })).toBe(false);
  });

  it('rejects empty figmaFileKey', () => {
    expect(isAnnotationSet({ ...validSet, figmaFileKey: '' })).toBe(false);
  });

  it('rejects non-array annotations', () => {
    expect(isAnnotationSet({ ...validSet, annotations: 'not-array' })).toBe(false);
  });

  it('rejects set with invalid annotation inside', () => {
    expect(isAnnotationSet({
      ...validSet,
      annotations: [{ ...validHeaderAnnotation, role: 'bogus' }],
    })).toBe(false);
  });

  it('rejects invalid createdAt', () => {
    expect(isAnnotationSet({ ...validSet, createdAt: 'invalid' })).toBe(false);
  });

  it('rejects invalid updatedAt', () => {
    expect(isAnnotationSet({ ...validSet, updatedAt: 'invalid' })).toBe(false);
  });
});

// ─── parseAnnotationSet ────────────────────────────────────

describe('parseAnnotationSet', () => {
  it('parses valid JSON', () => {
    const result = parseAnnotationSet(JSON.stringify(validSet));
    expect(result.figmaFileKey).toBe('abc123');
    expect(result.annotations).toHaveLength(2);
  });

  it('throws AnnotationParseError for invalid JSON', () => {
    expect(() => parseAnnotationSet('not json')).toThrow(AnnotationParseError);
    expect(() => parseAnnotationSet('not json')).toThrow('Invalid JSON');
  });

  it('throws AnnotationParseError for non-object parsed value', () => {
    expect(() => parseAnnotationSet('"string"')).toThrow('non-null object');
  });

  it('throws AnnotationParseError for unknown schemaVersion', () => {
    const bad = JSON.stringify({ ...validSet, schemaVersion: 99 });
    expect(() => parseAnnotationSet(bad)).toThrow('Unsupported schemaVersion');
    expect(() => parseAnnotationSet(bad)).toThrow('expected 1, got 99');
  });

  it('throws AnnotationParseError for missing figmaFileKey', () => {
    const { figmaFileKey: _, ...rest } = validSet;
    expect(() => parseAnnotationSet(JSON.stringify(rest))).toThrow('figmaFileKey');
  });

  it('throws AnnotationParseError for invalid annotation at index', () => {
    const bad = {
      ...validSet,
      annotations: [validHeaderAnnotation, { ...validUserAnnotation, role: 'bogus' }],
    };
    expect(() => parseAnnotationSet(JSON.stringify(bad))).toThrow('Invalid annotation at index 1');
  });
});

// ─── mergeAnnotations ──────────────────────────────────────

describe('mergeAnnotations', () => {
  const auto1: Annotation = {
    figmaNodeId: '1',
    domSelector: '[data-tf-node-id="1"]',
    role: 'header',
    source: 'auto',
    confidence: 0.7,
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
  const auto2: Annotation = {
    figmaNodeId: '2',
    domSelector: '[data-tf-node-id="2"]',
    role: 'footer',
    source: 'auto',
    confidence: 0.6,
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
  const user2: Annotation = {
    figmaNodeId: '2',
    domSelector: '[data-tf-node-id="2"]',
    role: 'hero',
    source: 'user',
    confidence: 0.9,
    updatedAt: '2025-01-02T00:00:00.000Z',
  };
  const user3: Annotation = {
    figmaNodeId: '3',
    domSelector: '[data-tf-node-id="3"]',
    role: 'button',
    source: 'user',
    confidence: 0.5,
    updatedAt: '2025-01-02T00:00:00.000Z',
  };

  it('user annotation overrides auto for same figmaNodeId', () => {
    const result = mergeAnnotations([auto1, auto2], [user2]);
    const found = result.find((a) => a.figmaNodeId === '2')!;
    expect(found.role).toBe('hero');
    expect(found.source).toBe('user');
    expect(found.confidence).toBe(1);
  });

  it('auto annotations not overridden pass through unchanged', () => {
    const result = mergeAnnotations([auto1, auto2], [user3]);
    const found1 = result.find((a) => a.figmaNodeId === '1')!;
    expect(found1.role).toBe('header');
    expect(found1.source).toBe('auto');
    expect(found1.confidence).toBe(0.7);
  });

  it('user-only entries appear in output', () => {
    const result = mergeAnnotations([], [user3]);
    expect(result).toHaveLength(1);
    expect(result[0].figmaNodeId).toBe('3');
  });

  it('auto-only entries appear when no user overlap', () => {
    const result = mergeAnnotations([auto1], [user3]);
    expect(result).toHaveLength(2);
  });

  it('duplicate within auto list: last wins', () => {
    const dup1 = { ...auto1, confidence: 0.3 };
    const dup2 = { ...auto1, confidence: 0.9 };
    const result = mergeAnnotations([dup1, dup2], []);
    const found = result.find((a) => a.figmaNodeId === '1')!;
    expect(found.confidence).toBe(0.9);
  });

  it('output is sorted by figmaNodeId', () => {
    const result = mergeAnnotations([auto2, auto1], [user3]);
    expect(result[0].figmaNodeId).toBe('1');
    expect(result[1].figmaNodeId).toBe('2');
    expect(result[2].figmaNodeId).toBe('3');
  });

  it('same inputs produce same output (determinism)', () => {
    const a = mergeAnnotations([auto1, auto2], [user2]);
    const b = mergeAnnotations([auto1, auto2], [user2]);
    expect(a).toEqual(b);
  });

  it('does not mutate input arrays', () => {
    const autoCopy = [...[auto1]];
    const userCopy = [...[user2]];
    Object.freeze(autoCopy[0]);
    Object.freeze(userCopy[0]);
    expect(() => mergeAnnotations(autoCopy, userCopy)).not.toThrow();
  });
});

// ─── upsertAnnotation ──────────────────────────────────────

describe('upsertAnnotation', () => {
  const baseSet: AnnotationSet = {
    schemaVersion: 1,
    figmaFileKey: 'key',
    annotations: [validHeaderAnnotation],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  it('inserts a new annotation', () => {
    const result = upsertAnnotation(baseSet, validUserAnnotation);
    expect(result.annotations).toHaveLength(2);
    expect(result.annotations.find((a) => a.figmaNodeId === '2:45')).toBeDefined();
  });

  it('replaces an existing annotation with same figmaNodeId', () => {
    const replacement: Annotation = {
      ...validHeaderAnnotation,
      role: 'footer',
      source: 'user',
      confidence: 1,
      updatedAt: '2025-02-01T00:00:00.000Z',
    };
    const result = upsertAnnotation(baseSet, replacement);
    expect(result.annotations).toHaveLength(1);
    const found = result.annotations[0];
    expect(found.role).toBe('footer');
    expect(found.source).toBe('user');
  });

  it('refreshes updatedAt on returned set', () => {
    const before = Date.now();
    const result = upsertAnnotation(baseSet, validUserAnnotation);
    const updated = Date.parse(result.updatedAt);
    expect(updated).toBeGreaterThanOrEqual(before);
  });

  it('does not mutate the original set', () => {
    Object.freeze(baseSet.annotations[0]);
    const copy = { ...baseSet, annotations: [...baseSet.annotations] };
    Object.freeze(copy.annotations);
    const result = upsertAnnotation(copy, validUserAnnotation);
    expect(result.annotations).toHaveLength(2);
    expect(baseSet.annotations).toHaveLength(1);
  });
});
