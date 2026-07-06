import { describe, it, expect } from 'vitest';
import { editorReducer, createInitialState } from '../hooks/useEditorState';
import type { AnnotationSet, Annotation } from '@typefigma/annotations';

function makeSet(overrides?: Partial<AnnotationSet>): AnnotationSet {
  return {
    schemaVersion: 1,
    figmaFileKey: 'test-key',
    annotations: [
      { figmaNodeId: 'n1', domSelector: '[data-tf-node-id="n1"]', role: 'header', source: 'auto', confidence: 0.9, updatedAt: '2025-01-01T00:00:00.000Z' },
      { figmaNodeId: 'n2', domSelector: '[data-tf-node-id="n2"]', role: 'hero', source: 'auto', confidence: 0.8, updatedAt: '2025-01-01T00:00:00.000Z' },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('editorReducer', () => {
  it('initial state from createInitialState', () => {
    const set = makeSet();
    const state = createInitialState(set);
    expect(state.annotationSet).toBe(set);
    expect(state.selectedNodeId).toBeNull();
    expect(state.hoveredNodeId).toBeNull();
  });

  it('SELECT sets selectedNodeId', () => {
    const initial = createInitialState(makeSet());
    const next = editorReducer(initial, { type: 'SELECT', nodeId: 'n1' });
    expect(next.selectedNodeId).toBe('n1');
    expect(next.hoveredNodeId).toBeNull();
  });

  it('HOVER sets hoveredNodeId', () => {
    const initial = createInitialState(makeSet());
    const next = editorReducer(initial, { type: 'HOVER', nodeId: 'n2' });
    expect(next.hoveredNodeId).toBe('n2');
    expect(next.selectedNodeId).toBeNull();
  });

  it('HOVER with null clears hoveredNodeId', () => {
    const initial = { ...createInitialState(makeSet()), hoveredNodeId: 'n1' };
    const next = editorReducer(initial, { type: 'HOVER', nodeId: null });
    expect(next.hoveredNodeId).toBeNull();
  });

  it('UPSERT_ROLE updates annotation and sets source to user', () => {
    const initial = createInitialState(makeSet());
    const next = editorReducer(initial, { type: 'UPSERT_ROLE', nodeId: 'n1', role: 'cta' });
    const updated = next.annotationSet.annotations.find((a) => a.figmaNodeId === 'n1')!;
    expect(updated.role).toBe('cta');
    expect(updated.source).toBe('user');
    expect(updated.confidence).toBe(1);
  });

  it('UPSERT_ROLE does nothing for unknown nodeId', () => {
    const initial = createInitialState(makeSet());
    const next = editorReducer(initial, { type: 'UPSERT_ROLE', nodeId: 'nonexistent', role: 'cta' });
    expect(next.annotationSet).toBe(initial.annotationSet);
  });

  it('SET_ANNOTATIONS replaces annotation set', () => {
    const initial = createInitialState(makeSet());
    const newSet = makeSet({ figmaFileKey: 'new-key' });
    const next = editorReducer(initial, { type: 'SET_ANNOTATIONS', annotationSet: newSet });
    expect(next.annotationSet.figmaFileKey).toBe('new-key');
  });

  it('SELECT preserves other state fields', () => {
    const initial = { ...createInitialState(makeSet()), hoveredNodeId: 'n2' };
    const next = editorReducer(initial, { type: 'SELECT', nodeId: 'n1' });
    expect(next.selectedNodeId).toBe('n1');
    expect(next.hoveredNodeId).toBe('n2');
  });

  it('default case returns state unchanged', () => {
    const initial = createInitialState(makeSet());
    const next = editorReducer(initial, { type: 'UNKNOWN' } as never);
    expect(next).toBe(initial);
  });
});

describe('getAnnotationByNodeId and getExportPayload (via useEditorState simulation)', () => {
  it('find annotation by nodeId', () => {
    const state = createInitialState(makeSet());
    const found = state.annotationSet.annotations.find((a) => a.figmaNodeId === 'n1');
    expect(found).toBeDefined();
    expect(found!.role).toBe('header');
  });

  it('export produces valid JSON', () => {
    const state = createInitialState(makeSet());
    const json = JSON.stringify(state.annotationSet, null, 2);
    const parsed = JSON.parse(json);
    expect(parsed.figmaFileKey).toBe('test-key');
    expect(parsed.annotations).toHaveLength(2);
  });
});
