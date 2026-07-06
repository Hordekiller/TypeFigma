import type { AnnotationSet } from '@typefigma/annotations';

export interface AnnotationStore {
  load(projectId: string): Promise<AnnotationSet | null>;
  save(projectId: string, set: AnnotationSet): Promise<void>;
}
