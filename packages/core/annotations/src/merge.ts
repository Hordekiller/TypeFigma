import type { Annotation, AnnotationSet } from './types.js';

/**
 * Merge auto-detected and user annotations.
 *
 * Rules:
 * - Keyed by figmaNodeId
 * - User always wins over auto for the same figmaNodeId
 * - User entries always get confidence 1
 * - Auto entries not overridden by any user entry pass through unchanged
 * - If both lists contain the same figmaNodeId (duplicate within one list),
 *   the LAST occurrence wins (consistent with subsequent-overrides-preceding)
 * - Output sorted by figmaNodeId for determinism
 * - Never mutates inputs
 */
export function mergeAnnotations(auto: Annotation[], user: Annotation[]): Annotation[] {
  const map = new Map<string, Annotation>();

  for (const a of auto) {
    map.set(a.figmaNodeId, { ...a });
  }

  for (const u of user) {
    map.set(u.figmaNodeId, {
      ...u,
      source: 'user',
      confidence: 1,
    });
  }

  const result = Array.from(map.values());
  result.sort((a, b) => a.figmaNodeId.localeCompare(b.figmaNodeId));
  return result;
}

/**
 * Upsert a single annotation into a set.
 *
 * Returns a new AnnotationSet with the annotation added or replaced.
 * The original set is not mutated. updatedAt is refreshed.
 */
export function upsertAnnotation(set: AnnotationSet, a: Annotation): AnnotationSet {
  const existingIndex = set.annotations.findIndex(
    (existing) => existing.figmaNodeId === a.figmaNodeId,
  );

  const newAnnotations = [...set.annotations];

  if (existingIndex >= 0) {
    newAnnotations[existingIndex] = { ...a };
  } else {
    newAnnotations.push({ ...a });
  }

  return {
    ...set,
    annotations: newAnnotations,
    updatedAt: new Date().toISOString(),
  };
}
