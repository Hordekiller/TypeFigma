export type { ComponentRole, AnnotationSource, Annotation, AnnotationSet } from './types.js';
export { isComponentRole, isAnnotation, isAnnotationSet, parseAnnotationSet, AnnotationParseError } from './guards.js';
export { mergeAnnotations, upsertAnnotation } from './merge.js';
