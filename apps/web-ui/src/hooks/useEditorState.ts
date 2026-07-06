import { useReducer, useCallback } from 'react';
import type { Annotation, AnnotationSet, ComponentRole } from '@typefigma/annotations';
import { upsertAnnotation } from '@typefigma/annotations';

export interface EditorState {
  annotationSet: AnnotationSet;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
}

export type EditorAction =
  | { type: 'SELECT'; nodeId: string }
  | { type: 'HOVER'; nodeId: string | null }
  | { type: 'UPSERT_ROLE'; nodeId: string; role: ComponentRole }
  | { type: 'SET_ANNOTATIONS'; annotationSet: AnnotationSet };

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selectedNodeId: action.nodeId };
    case 'HOVER':
      return { ...state, hoveredNodeId: action.nodeId };
    case 'UPSERT_ROLE': {
      const existing = state.annotationSet.annotations.find(
        (a) => a.figmaNodeId === action.nodeId,
      );
      if (!existing) return state;
      const updatedAnnotation: Annotation = {
        ...existing,
        role: action.role,
        source: 'user',
        confidence: 1,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        annotationSet: upsertAnnotation(state.annotationSet, updatedAnnotation),
      };
    }
    case 'SET_ANNOTATIONS':
      return { ...state, annotationSet: action.annotationSet };
    default:
      return state;
  }
}

export function createInitialState(annotationSet: AnnotationSet): EditorState {
  return {
    annotationSet,
    selectedNodeId: null,
    hoveredNodeId: null,
  };
}

export function useEditorState(initialAnnotationSet: AnnotationSet) {
  const [state, dispatch] = useReducer(editorReducer, initialAnnotationSet, createInitialState);

  const select = useCallback((nodeId: string) => {
    dispatch({ type: 'SELECT', nodeId });
  }, []);

  const hover = useCallback((nodeId: string | null) => {
    dispatch({ type: 'HOVER', nodeId });
  }, []);

  const upsertRole = useCallback((nodeId: string, role: ComponentRole) => {
    dispatch({ type: 'UPSERT_ROLE', nodeId, role });
  }, []);

  const setAnnotations = useCallback((annotationSet: AnnotationSet) => {
    dispatch({ type: 'SET_ANNOTATIONS', annotationSet });
  }, []);

  const getAnnotationByNodeId = useCallback(
    (nodeId: string): Annotation | undefined => {
      return state.annotationSet.annotations.find((a) => a.figmaNodeId === nodeId);
    },
    [state.annotationSet.annotations],
  );

  const getExportPayload = useCallback((): string => {
    return JSON.stringify(state.annotationSet, null, 2);
  }, [state.annotationSet]);

  return {
    state,
    dispatch,
    select,
    hover,
    upsertRole,
    setAnnotations,
    getAnnotationByNodeId,
    getExportPayload,
  };
}
