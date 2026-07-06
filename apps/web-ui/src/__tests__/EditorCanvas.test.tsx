import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import EditorCanvas from '../components/EditorCanvas';
import { PROTOCOL_VERSION } from '@typefigma/editor-protocol';

const sampleHtml = '<html><body><header data-tf-node-id="h1" data-tf-role="header">Header</header></body></html>';

describe('EditorCanvas', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let messageHandler: ((e: MessageEvent) => void) | null = null;

  beforeEach(() => {
    messageHandler = null;
    addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
      if (type === 'message') {
        messageHandler = handler as (e: MessageEvent) => void;
      }
    });
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation((type, handler) => {
      if (type === 'message' && messageHandler === handler) {
        messageHandler = null;
      }
    });
    // Mock URL.createObjectURL / revokeObjectURL
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an iframe with sandbox attribute', () => {
    const { container } = render(<EditorCanvas html={sampleHtml} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    expect(iframe).toHaveAttribute('title', 'Editor Canvas');
  });

  it('calls onReady when TF_READY message is received', () => {
    const onReady = vi.fn();
    render(<EditorCanvas html={sampleHtml} onReady={onReady} />);

    act(() => {
      messageHandler!({ data: { protocolVersion: PROTOCOL_VERSION, type: 'TF_READY' } } as MessageEvent);
    });

    expect(onReady).toHaveBeenCalledOnce();
  });

  it('calls onSelect when TF_SELECT message is received', () => {
    const onSelect = vi.fn();
    render(<EditorCanvas html={sampleHtml} onSelect={onSelect} />);

    const msg = {
      protocolVersion: PROTOCOL_VERSION,
      type: 'TF_SELECT',
      nodeId: 'h1',
      role: 'header',
      rect: { x: 0, y: 0, width: 100, height: 50, top: 0, right: 100, bottom: 50, left: 0 },
    };

    act(() => {
      messageHandler!({ data: msg } as MessageEvent);
    });

    expect(onSelect).toHaveBeenCalledWith(msg);
  });

  it('calls onHover when TF_HOVER message is received', () => {
    const onHover = vi.fn();
    render(<EditorCanvas html={sampleHtml} onHover={onHover} />);

    act(() => {
      messageHandler!({ data: { protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: 'h1' } } as MessageEvent);
    });

    expect(onHover).toHaveBeenCalledWith({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: 'h1' });
  });

  it('ignores unknown message types', () => {
    const onSelect = vi.fn();
    const onHover = vi.fn();
    const onReady = vi.fn();
    render(<EditorCanvas html={sampleHtml} onSelect={onSelect} onHover={onHover} onReady={onReady} />);

    act(() => {
      messageHandler!({ data: { protocolVersion: PROTOCOL_VERSION, type: 'TF_UNKNOWN' } } as MessageEvent);
    });

    expect(onSelect).not.toHaveBeenCalled();
    expect(onHover).not.toHaveBeenCalled();
    expect(onReady).not.toHaveBeenCalled();
  });

  it('ignores malformed messages that fail guards', () => {
    const onSelect = vi.fn();
    render(<EditorCanvas html={sampleHtml} onSelect={onSelect} />);

    act(() => {
      messageHandler!({ data: { protocolVersion: PROTOCOL_VERSION, type: 'TF_SELECT' } } as MessageEvent);
    });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('exposes highlightNode and setRoleBadge via ref', () => {
    const ref = React.createRef<{ highlightNode: (id: string | null) => void; setRoleBadge: (id: string, role: string) => void }>();
    const postMessage = vi.fn();

    render(<EditorCanvas html={sampleHtml} ref={ref} />);
    const iframe = document.querySelector('iframe')!;
    // Simulate contentWindow being available
    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage },
      writable: true,
    });

    ref.current!.highlightNode('h1');
    expect(postMessage).toHaveBeenCalledWith(
      { protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId: 'h1' },
      '*',
    );

    ref.current!.setRoleBadge('h1', 'hero');
    expect(postMessage).toHaveBeenCalledWith(
      { protocolVersion: PROTOCOL_VERSION, type: 'TF_SET_ROLE_BADGE', nodeId: 'h1', role: 'hero' },
      '*',
    );
  });
});
