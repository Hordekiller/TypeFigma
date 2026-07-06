import type { ComponentRole, Annotation, AnnotationSet } from './types.js';

const COMPONENT_ROLES: readonly string[] = [
  'header', 'footer', 'nav-menu', 'hero', 'cta',
  'button', 'login-form', 'search-form',
  'slider', 'carousel',
  'product-card', 'product-detail', 'product-grid',
  'cart', 'checkout',
  'blog-list', 'blog-post',
  'user-profile', 'sidebar',
  'gallery', 'testimonial', 'pricing-table',
  'contact-form', 'newsletter', 'breadcrumb',
  'social-icons', 'container', 'section', 'column',
  'text', 'image',
  'unknown',
];

export function isComponentRole(v: unknown): v is ComponentRole {
  return typeof v === 'string' && COMPONENT_ROLES.includes(v);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isParseableIsoDate(s: unknown): boolean {
  if (typeof s !== 'string') return false;
  const ts = Date.parse(s);
  return !isNaN(ts) && isFinite(ts);
}

function isConfidence(n: unknown): n is number {
  return typeof n === 'number' && isFinite(n) && n >= 0 && n <= 1;
}

export function isAnnotation(v: unknown): v is Annotation {
  if (!isRecord(v)) return false;
  if (typeof v.figmaNodeId !== 'string' || v.figmaNodeId.length === 0) return false;
  if (typeof v.domSelector !== 'string' || v.domSelector.length === 0) return false;
  if (!isComponentRole(v.role)) return false;
  if (v.source !== 'auto' && v.source !== 'user') return false;
  if (!isConfidence(v.confidence)) return false;
  if (v.props !== undefined) {
    if (!isRecord(v.props)) return false;
    for (const val of Object.values(v.props)) {
      if (typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') {
        return false;
      }
    }
  }
  if (!isParseableIsoDate(v.updatedAt)) return false;
  return true;
}

export function isAnnotationSet(v: unknown): v is AnnotationSet {
  if (!isRecord(v)) return false;
  if (v.schemaVersion !== 1) return false;
  if (typeof v.figmaFileKey !== 'string' || v.figmaFileKey.length === 0) return false;
  if (!Array.isArray(v.annotations)) return false;
  for (const a of v.annotations) {
    if (!isAnnotation(a)) return false;
  }
  if (!isParseableIsoDate(v.createdAt)) return false;
  if (!isParseableIsoDate(v.updatedAt)) return false;
  return true;
}

export class AnnotationParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnnotationParseError';
  }
}

export function parseAnnotationSet(json: string): AnnotationSet {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new AnnotationParseError('Invalid JSON string');
  }

  if (!isRecord(parsed)) {
    throw new AnnotationParseError('Parsed value must be a non-null object');
  }

  if (parsed.schemaVersion !== 1) {
    throw new AnnotationParseError(
      `Unsupported schemaVersion: expected 1, got ${String(parsed.schemaVersion)}`,
    );
  }

  if (!isAnnotationSet(parsed)) {
    if (typeof parsed.figmaFileKey !== 'string' || parsed.figmaFileKey.length === 0) {
      throw new AnnotationParseError('figmaFileKey must be a non-empty string');
    }
    if (!Array.isArray(parsed.annotations)) {
      throw new AnnotationParseError('annotations must be an array');
    }
    for (let i = 0; i < (parsed.annotations as unknown[]).length; i++) {
      if (!isAnnotation((parsed.annotations as unknown[])[i])) {
        throw new AnnotationParseError(`Invalid annotation at index ${i}`);
      }
    }
    if (!isParseableIsoDate(parsed.createdAt)) {
      throw new AnnotationParseError('createdAt must be a parseable ISO 8601 date string');
    }
    if (!isParseableIsoDate(parsed.updatedAt)) {
      throw new AnnotationParseError('updatedAt must be a parseable ISO 8601 date string');
    }
    throw new AnnotationParseError('Invalid annotation set structure');
  }

  return parsed;
}
