import { describe, it, expect } from 'vitest';
import { CodeGenerator } from '../../index.js';
import { buildEditorHtml, buildSelectionScript } from '@typefigma/editor-protocol';
import { isTfReady, isTfSelect, isTfHover, isTfHighlight, isTfSetRoleBadge } from '@typefigma/editor-protocol';
import { PROTOCOL_VERSION } from '@typefigma/editor-protocol';
import { simpleComponents, mockTokens } from './fixtures.js';

describe('E1-1: E2E harness — drive protocol messages through code-generator', () => {
  it('generated HTML with traceability contains data-tf-node-id and data-tf-role for every component', () => {
    const gen = new CodeGenerator({ traceability: true });
    const { html } = gen.generate(simpleComponents, mockTokens);

    for (const components of Object.values(simpleComponents)) {
      if (!Array.isArray(components)) continue;
      for (const comp of components) {
        const nodeId = (comp as { figmaNodeId: string }).figmaNodeId;
        expect(html).toContain(`data-tf-node-id="${nodeId}"`);
        expect(html).toContain(`data-tf-role="`);
      }
    }
  });

  it('buildEditorHtml injects selection script referencing all 5 message types', () => {
    const gen = new CodeGenerator({ traceability: true });
    const { html } = gen.generate(simpleComponents, mockTokens);
    const editorHtml = buildEditorHtml(html);

    expect(editorHtml).toContain('TF_READY');
    expect(editorHtml).toContain('TF_SELECT');
    expect(editorHtml).toContain('TF_HOVER');
    expect(editorHtml).toContain('TF_HIGHLIGHT');
    expect(editorHtml).toContain('TF_SET_ROLE_BADGE');
    expect(editorHtml).toMatch(/<script>[\s\S]*<\/script>$/);
  });

  it('buildSelectionScript contains all 5 message type strings', () => {
    const script = buildSelectionScript();
    expect(script).toContain('TF_READY');
    expect(script).toContain('TF_SELECT');
    expect(script).toContain('TF_HOVER');
    expect(script).toContain('TF_HIGHLIGHT');
    expect(script).toContain('TF_SET_ROLE_BADGE');
    expect(script).toContain('protocolVersion');
  });

  it('valid TF_READY message passes guard', () => {
    expect(isTfReady({ protocolVersion: PROTOCOL_VERSION, type: 'TF_READY' })).toBe(true);
  });

  it('valid TF_SELECT message passes guard', () => {
    expect(isTfSelect({
      protocolVersion: PROTOCOL_VERSION,
      type: 'TF_SELECT',
      nodeId: 'h1',
      role: 'header',
      rect: { x: 0, y: 0, width: 100, height: 50, top: 0, right: 100, bottom: 50, left: 0 },
    })).toBe(true);
  });

  it('valid TF_HOVER message passes guard', () => {
    expect(isTfHover({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: 'h1' })).toBe(true);
    expect(isTfHover({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: null })).toBe(true);
  });

  it('valid TF_HIGHLIGHT message passes guard', () => {
    expect(isTfHighlight({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId: 'h1' })).toBe(true);
    expect(isTfHighlight({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId: null })).toBe(true);
  });

  it('valid TF_SET_ROLE_BADGE message passes guard', () => {
    expect(isTfSetRoleBadge({
      protocolVersion: PROTOCOL_VERSION,
      type: 'TF_SET_ROLE_BADGE',
      nodeId: 'h1',
      role: 'cta',
    })).toBe(true);
  });


});
