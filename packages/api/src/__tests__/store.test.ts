import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { FileAnnotationStore } from '../store/file-store.js';
import type { AnnotationSet } from '@typefigma/annotations';

const testDir = path.join(process.cwd(), '.test-annotations');
const store = new FileAnnotationStore(testDir);

function makeSet(overrides?: Partial<AnnotationSet>): AnnotationSet {
  return {
    schemaVersion: 1,
    figmaFileKey: 'test-key',
    annotations: [
      { figmaNodeId: 'n1', domSelector: '[data-tf-node-id="n1"]', role: 'header', source: 'auto', confidence: 0.9, updatedAt: '2025-01-01T00:00:00.000Z' },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('FileAnnotationStore', () => {
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('save then load returns identical set', async () => {
    const set = makeSet();
    await store.save('proj-1', set);
    const loaded = await store.load('proj-1');
    expect(loaded).toEqual(set);
  });

  it('load for nonexistent project returns null', async () => {
    const result = await store.load('nonexistent');
    expect(result).toBeNull();
  });

  it('load after save returns the latest version', async () => {
    const set1 = makeSet({ figmaFileKey: 'v1', updatedAt: '2025-01-01T00:00:00.000Z' });
    const set2 = makeSet({ figmaFileKey: 'v2', updatedAt: '2025-01-02T00:00:00.000Z' });
    await store.save('proj-2', set1);
    await store.save('proj-2', set2);
    const loaded = await store.load('proj-2');
    expect(loaded!.figmaFileKey).toBe('v2');
  });

  it('multiple projects do not interfere', async () => {
    const setA = makeSet({ figmaFileKey: 'a' });
    const setB = makeSet({ figmaFileKey: 'b' });
    await store.save('proj-a', setA);
    await store.save('proj-b', setB);
    const loadedA = await store.load('proj-a');
    const loadedB = await store.load('proj-b');
    expect(loadedA!.figmaFileKey).toBe('a');
    expect(loadedB!.figmaFileKey).toBe('b');
  });
});
