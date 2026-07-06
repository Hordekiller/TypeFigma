'use client';

import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { buildEditorHtml, isTfReady, isTfSelect, isTfHover, PROTOCOL_VERSION } from '@typefigma/editor-protocol';
import type { TfSelectMessage, TfHoverMessage } from '@typefigma/editor-protocol';

export interface EditorCanvasHandle {
  highlightNode: (nodeId: string | null) => void;
  setRoleBadge: (nodeId: string, role: string) => void;
}

interface EditorCanvasProps {
  html: string;
  onReady?: () => void;
  onSelect?: (msg: TfSelectMessage) => void;
  onHover?: (msg: TfHoverMessage) => void;
}

const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(
  ({ html, onReady, onSelect, onHover }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const editorHtml = useMemo(() => buildEditorHtml(html), [html]);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const blob = new Blob([editorHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframe.src = url;
      return () => {
        URL.revokeObjectURL(url);
      };
    }, [editorHtml]);

    useEffect(() => {
      const handler = (e: MessageEvent) => {
        const data = e.data;
        if (isTfReady(data)) {
          onReady?.();
        } else if (isTfSelect(data)) {
          onSelect?.(data);
        } else if (isTfHover(data)) {
          onHover?.(data);
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }, [onReady, onSelect, onHover]);

    useImperativeHandle(ref, () => ({
      highlightNode(nodeId: string | null) {
        iframeRef.current?.contentWindow?.postMessage(
          { protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId },
          '*',
        );
      },
      setRoleBadge(nodeId: string, role: string) {
        iframeRef.current?.contentWindow?.postMessage(
          { protocolVersion: PROTOCOL_VERSION, type: 'TF_SET_ROLE_BADGE', nodeId, role },
          '*',
        );
      },
    }), []);

    return (
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        title="Editor Canvas"
        className="w-full h-full border-0"
      />
    );
  },
);

EditorCanvas.displayName = 'EditorCanvas';
export default EditorCanvas;
