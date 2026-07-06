import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import EditorCanvas from '../components/EditorCanvas';
import type { EditorCanvasHandle } from '../components/EditorCanvas';
import type { TfSelectMessage } from '@typefigma/editor-protocol';
import { PROTOCOL_VERSION } from '@typefigma/editor-protocol';

const MINIMAL_HTML = `<div class="page-wrapper">
  <header data-tf-node-id="h1" data-tf-role="header" data-tf-name="Main Header">
    <nav>logo</nav>
  </header>
  <section data-tf-node-id="hero1" data-tf-role="hero" data-tf-name="Hero">
    <h1>Hero title</h1>
  </section>
  <footer data-tf-node-id="f1" data-tf-role="footer" data-tf-name="Footer">
    <p>copyright</p>
  </footer>
</div>`;

describe('E1-5: web-ui smoke — EditorCanvas integration', () => {
  beforeEach(() => {
    window.document.body.innerHTML = '';
  });

  it('renders an iframe with the generated HTML', () => {
    render(<EditorCanvas html={MINIMAL_HTML} />);
    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('title')).toBe('Editor Canvas');
    expect(iframe?.getAttribute('sandbox')).toContain('allow-scripts');
  });

  it('fires onSelect callback when TF_SELECT message is received', async () => {
    const onSelect = vi.fn();
    render(<EditorCanvas html={MINIMAL_HTML} onSelect={onSelect} />);

    const selectMsg: TfSelectMessage = {
      protocolVersion: PROTOCOL_VERSION,
      type: 'TF_SELECT',
      nodeId: 'h1',
      role: 'header',
      name: 'Main Header',
      rect: { x: 0, y: 0, width: 100, height: 50, top: 0, right: 100, bottom: 50, left: 0 },
    };

    await act(async () => {
      window.postMessage(selectMsg, '*');
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(selectMsg);
  });

  it('fires onReady callback when TF_READY message is received', async () => {
    const onReady = vi.fn();
    render(<EditorCanvas html={MINIMAL_HTML} onReady={onReady} />);

    await act(async () => {
      window.postMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_READY' }, '*');
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('fires onHover callback when TF_HOVER message is received', async () => {
    const onHover = vi.fn();
    render(<EditorCanvas html={MINIMAL_HTML} onHover={onHover} />);

    await act(async () => {
      window.postMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: 'hero1' }, '*');
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(onHover).toHaveBeenCalledTimes(1);
    expect(onHover).toHaveBeenCalledWith({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: 'hero1' });
  });

  it('exposes highlightNode and setRoleBadge via ref', () => {
    const ref = createRef<EditorCanvasHandle>();
    render(<EditorCanvas html={MINIMAL_HTML} ref={ref} />);

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current!.highlightNode).toBe('function');
    expect(typeof ref.current!.setRoleBadge).toBe('function');
  });
});
