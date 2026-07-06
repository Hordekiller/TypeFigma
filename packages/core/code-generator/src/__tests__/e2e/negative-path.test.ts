import { describe, it, expect } from 'vitest';
import {
  isTfReady,
  isTfSelect,
  isTfHover,
  isTfHighlight,
  isTfSetRoleBadge,
  isEditorInboundMessage,
  PROTOCOL_VERSION,
} from '@typefigma/editor-protocol';
import { parseAnnotationSet, AnnotationParseError } from '@typefigma/annotations';

const validRect = { x: 10, y: 20, width: 300, height: 150, top: 20, right: 310, bottom: 170, left: 10 };

describe('E1-4: Negative-path — malformed protocol messages', () => {
  describe('TF_READY malformed', () => {
    it('rejects null', () => { expect(isTfReady(null)).toBe(false); });
    it('rejects undefined', () => { expect(isTfReady(undefined)).toBe(false); });
    it('rejects array', () => { expect(isTfReady([])).toBe(false); });
    it('rejects wrong protocolVersion', () => { expect(isTfReady({ protocolVersion: 999, type: 'TF_READY' })).toBe(false); });
    it('rejects wrong type', () => { expect(isTfReady({ protocolVersion: PROTOCOL_VERSION, type: 'TF_SELECT' })).toBe(false); });
    it('rejects missing protocolVersion', () => { expect(isTfReady({ type: 'TF_READY' })).toBe(false); });
  });

  describe('TF_SELECT malformed', () => {
    const valid = { protocolVersion: PROTOCOL_VERSION, type: 'TF_SELECT', nodeId: 'n1', role: 'header', rect: validRect };
    it('rejects empty nodeId', () => { expect(isTfSelect({ ...valid, nodeId: '' })).toBe(false); });
    it('rejects missing nodeId', () => { const { nodeId: _, ...rest } = valid; expect(isTfSelect(rest)).toBe(false); });
    it('rejects empty role', () => { expect(isTfSelect({ ...valid, role: '' })).toBe(false); });
    it('rejects number role', () => { expect(isTfSelect({ ...valid, role: 42 })).toBe(false); });
    it('rejects missing rect', () => { const { rect: _, ...rest } = valid; expect(isTfSelect(rest)).toBe(false); });
    it('rejects string rect', () => { expect(isTfSelect({ ...valid, rect: 'bad' })).toBe(false); });
    it('rejects wrong protocolVersion', () => { expect(isTfSelect({ ...valid, protocolVersion: 0 })).toBe(false); });
  });

  describe('TF_HOVER malformed', () => {
    const valid = { protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: null };
    it('rejects number nodeId', () => { expect(isTfHover({ ...valid, nodeId: 42 })).toBe(false); });
    it('rejects boolean nodeId', () => { expect(isTfHover({ ...valid, nodeId: true })).toBe(false); });
    it('rejects empty object', () => { expect(isTfHover({})).toBe(false); });
    it('rejects null input', () => { expect(isTfHover(null)).toBe(false); });
  });

  describe('TF_HIGHLIGHT malformed', () => {
    const valid = { protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId: null };
    it('rejects number nodeId', () => { expect(isTfHighlight({ ...valid, nodeId: 42 })).toBe(false); });
    it('rejects boolean nodeId', () => { expect(isTfHighlight({ ...valid, nodeId: false })).toBe(false); });
    it('rejects empty object', () => { expect(isTfHighlight({})).toBe(false); });
  });

  describe('TF_SET_ROLE_BADGE malformed', () => {
    const valid = { protocolVersion: PROTOCOL_VERSION, type: 'TF_SET_ROLE_BADGE', nodeId: 'n1', role: 'hero' };
    it('rejects empty nodeId', () => { expect(isTfSetRoleBadge({ ...valid, nodeId: '' })).toBe(false); });
    it('rejects empty role', () => { expect(isTfSetRoleBadge({ ...valid, role: '' })).toBe(false); });
    it('rejects missing role', () => { const { role: _, ...rest } = valid; expect(isTfSetRoleBadge(rest)).toBe(false); });
    it('rejects missing nodeId', () => { const { nodeId: _, ...rest } = valid; expect(isTfSetRoleBadge(rest)).toBe(false); });
    it('rejects wrong protocolVersion', () => { expect(isTfSetRoleBadge({ ...valid, protocolVersion: 0 })).toBe(false); });
  });

  describe('protocolVersion mismatch rejected', () => {
    it('rejects TF_READY with wrong version', () => { expect(isTfReady({ protocolVersion: 999, type: 'TF_READY' })).toBe(false); });
    it('rejects TF_SELECT with wrong version', () => {
      expect(isTfSelect({ protocolVersion: 999, type: 'TF_SELECT', nodeId: 'n1', role: 'header', rect: validRect })).toBe(false);
    });
    it('rejects TF_HOVER with wrong version', () => { expect(isTfHover({ protocolVersion: 999, type: 'TF_HOVER', nodeId: 'n1' })).toBe(false); });
    it('rejects TF_HIGHLIGHT with wrong version', () => { expect(isTfHighlight({ protocolVersion: 999, type: 'TF_HIGHLIGHT', nodeId: null })).toBe(false); });
    it('rejects TF_SET_ROLE_BADGE with wrong version', () => { expect(isTfSetRoleBadge({ protocolVersion: 999, type: 'TF_SET_ROLE_BADGE', nodeId: 'n1', role: 'hero' })).toBe(false); });
  });

  describe('isEditorInboundMessage rejects outbound messages', () => {
    it('rejects TF_READY', () => { expect(isEditorInboundMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_READY' })).toBe(false); });
    it('rejects TF_SELECT', () => { expect(isEditorInboundMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_SELECT', nodeId: 'n1', role: 'h', rect: validRect })).toBe(false); });
    it('rejects TF_HOVER', () => { expect(isEditorInboundMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: null })).toBe(false); });
    it('rejects unknown type', () => { expect(isEditorInboundMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_UNKNOWN' })).toBe(false); });
  });

  describe('parseAnnotationSet negative path', () => {
    it('rejects invalid JSON', () => { expect(() => parseAnnotationSet('not json')).toThrow(AnnotationParseError); });
    it('rejects wrong schemaVersion', () => { expect(() => parseAnnotationSet(JSON.stringify({ schemaVersion: 2, figmaFileKey: 'k', annotations: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }))).toThrow(AnnotationParseError); });
    it('rejects missing figmaFileKey', () => { expect(() => parseAnnotationSet(JSON.stringify({ schemaVersion: 1, annotations: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }))).toThrow(AnnotationParseError); });
  });
});
