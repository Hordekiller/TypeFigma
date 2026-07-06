import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { AnnotationSet } from '@typefigma/annotations';
import type { AnnotationStore } from './types.js';

export class FileAnnotationStore implements AnnotationStore {
  private dir: string;

  constructor(dir?: string) {
    this.dir = dir || path.join(process.cwd(), '.annotations');
  }

  async load(projectId: string): Promise<AnnotationSet | null> {
    const filePath = path.join(this.dir, `${projectId}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as AnnotationSet;
    } catch {
      return null;
    }
  }

  async save(projectId: string, set: AnnotationSet): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    const filePath = path.join(this.dir, `${projectId}.json`);
    await fs.writeFile(filePath, JSON.stringify(set, null, 2), 'utf-8');
  }
}
