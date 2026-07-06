import type { ComponentClassification } from '@typefigma/analyzer';
import type { Annotation, AnnotationSet, ComponentRole } from '@typefigma/annotations';
import { isAnnotationSet } from '@typefigma/annotations';

/**
 * Maps each array key in ComponentClassification to the corresponding ComponentRole.
 * Mirrors the Phase A mapping table exactly.
 */
export const ANALYZER_ROLE_MAP: Record<string, ComponentRole> = {
  headers: 'header',
  footers: 'footer',
  navigation: 'nav-menu',
  heroes: 'hero',
  ctaSections: 'cta',
  testimonials: 'testimonial',
  galleries: 'gallery',
  productCards: 'product-card',
  productDetails: 'product-detail',
  cartComponents: 'cart',
  checkoutComponents: 'checkout',
  postCards: 'blog-list',
  postDetail: 'blog-post',
  contactForms: 'contact-form',
  searchBars: 'search-form',
  newsletters: 'newsletter',
  sections: 'section',
  containers: 'container',
  columns: 'column',
};

/**
 * Default confidence values for component types that the analyzer
 * does NOT expose a confidence field on.
 *
 * Source: packages/core/analyzer/src/types.ts
 *   - NavigationComponent: no confidence field (line 117-123)
 *   - GalleryComponent: no confidence field (line 162-166)
 *   - SearchComponent: no confidence field (line 335-340)
 *   - NewsletterComponent: no confidence field (line 344-348)
 *   - ContainerComponent: no confidence field (line 402-406)
 *   - ColumnComponent: no confidence field (line 408-412)
 */
const DEFAULT_CONFIDENCE: Record<string, number> = {
  navigation: 0.7,
  galleries: 0.6,
  searchBars: 0.65,
  newsletters: 0.6,
  containers: 0.5,
  columns: 0.5,
};

function getConfidence(comp: Record<string, unknown>, category: string): number {
  const conf = comp.confidence;
  if (typeof conf === 'number' && isFinite(conf) && conf >= 0 && conf <= 1) {
    return conf;
  }
  return DEFAULT_CONFIDENCE[category] ?? 0.5;
}

/**
 * Convert analyzer ComponentClassification into an AnnotationSet.
 *
 * @param input           - figmaFileKey and the analyzer's classification output
 * @param clock           - Optional clock function for testability (defaults to Date.now ISO)
 * @returns               - A validated AnnotationSet
 */
export function buildAutoAnnotations(
  input: {
    figmaFileKey: string;
    classification: ComponentClassification;
  },
  clock?: () => string,
): AnnotationSet {
  const now = clock?.() ?? new Date().toISOString();
  const annotations: Annotation[] = [];
  const { classification } = input;

  appendAnnotations(annotations, classification.headers, 'headers', now);
  appendAnnotations(annotations, classification.footers, 'footers', now);
  appendAnnotations(annotations, classification.navigation, 'navigation', now);
  appendAnnotations(annotations, classification.heroes, 'heroes', now);
  appendAnnotations(annotations, classification.ctaSections, 'ctaSections', now);
  appendAnnotations(annotations, classification.testimonials, 'testimonials', now);
  appendAnnotations(annotations, classification.galleries, 'galleries', now);
  appendAnnotations(annotations, classification.productCards, 'productCards', now);
  appendAnnotations(annotations, classification.productDetails, 'productDetails', now);
  appendAnnotations(annotations, classification.cartComponents, 'cartComponents', now);
  appendAnnotations(annotations, classification.checkoutComponents, 'checkoutComponents', now);
  appendAnnotations(annotations, classification.postCards, 'postCards', now);
  appendAnnotations(annotations, classification.postDetail, 'postDetail', now);
  appendAnnotations(annotations, classification.contactForms, 'contactForms', now);
  appendAnnotations(annotations, classification.searchBars, 'searchBars', now);
  appendAnnotations(annotations, classification.newsletters, 'newsletters', now);
  appendAnnotations(annotations, classification.sections, 'sections', now);
  appendAnnotations(annotations, classification.containers, 'containers', now);
  appendAnnotations(annotations, classification.columns, 'columns', now);

  annotations.sort((a, b) => a.figmaNodeId.localeCompare(b.figmaNodeId));

  const result: AnnotationSet = {
    schemaVersion: 1,
    figmaFileKey: input.figmaFileKey,
    annotations,
    createdAt: now,
    updatedAt: now,
  };

  if (!isAnnotationSet(result)) {
    throw new TypeError(
      'buildAutoAnnotations produced an invalid AnnotationSet — ' +
        'this indicates a programming error or type drift in the analyzer',
    );
  }

  return result;
}

function appendAnnotations(
  out: Annotation[],
  components: ReadonlyArray<{ figmaNodeId: string }>,
  category: string,
  now: string,
): void {
  const role = ANALYZER_ROLE_MAP[category];
  if (!role) return;

  for (const comp of components) {
    const compRecord = comp as unknown as Record<string, unknown>;
    const figmaNodeId = compRecord.figmaNodeId as string;
    const name = (compRecord.name as string | undefined) ?? undefined;
    const confidence = getConfidence(compRecord, category);

    const annotation: Annotation = {
      figmaNodeId,
      domSelector: `[data-tf-node-id="${figmaNodeId}"]`,
      role,
      source: 'auto',
      confidence,
      ...(name ? { props: { name } } : {}),
      updatedAt: now,
    };

    out.push(annotation);
  }
}
