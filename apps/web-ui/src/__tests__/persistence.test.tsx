import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEditorState } from '../hooks/useEditorState';
import type { AnnotationSet } from '@typefigma/annotations';

function makeSet(): AnnotationSet {
  return {
    schemaVersion: 1,
    figmaFileKey: 'test-key',
    annotations: [
      { figmaNodeId: 'n1', domSelector: '[data-tf-node-id="n1"]', role: 'header', source: 'auto', confidence: 0.9, updatedAt: '2025-01-01T00:00:00.000Z' },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

describe('useEditorState persistence', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('starts in idle state when no saveOptions', () => {
    const { result } = renderHook(() => useEditorState(makeSet()));
    expect(result.current.saveStatus).toBe('idle');
    expect(result.current.saveError).toBeNull();
  });

  it('fires debounced save on annotation change when saveOptions provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });
    globalThis.fetch = mockFetch;

    const { result } = renderHook(() =>
      useEditorState(makeSet(), { projectId: 'proj-1' }),
    );

    await act(async () => {
      result.current.upsertRole('n1', 'cta');
      await new Promise((r) => setTimeout(r, 1100));
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/proj-1/annotations',
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(result.current.saveStatus).toBe('saved');
  });

  it('sets error state on failed save', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 400, json: () => Promise.resolve({ error: 'Invalid' }) });
    globalThis.fetch = mockFetch;

    const { result } = renderHook(() =>
      useEditorState(makeSet(), { projectId: 'proj-1' }),
    );

    await act(async () => {
      result.current.upsertRole('n1', 'cta');
      await new Promise((r) => setTimeout(r, 1100));
    });

    expect(result.current.saveStatus).toBe('error');
    expect(result.current.saveError).not.toBeNull();
  });

  it('manual save works immediately', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });
    globalThis.fetch = mockFetch;

    const { result } = renderHook(() =>
      useEditorState(makeSet(), { projectId: 'proj-1' }),
    );

    await act(async () => {
      result.current.save();
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.saveStatus).toBe('saved');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('does not fire auto-save without saveOptions', async () => {
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch;

    const { result } = renderHook(() => useEditorState(makeSet()));

    act(() => {
      result.current.upsertRole('n1', 'cta');
    });

    expect(result.current.saveStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
