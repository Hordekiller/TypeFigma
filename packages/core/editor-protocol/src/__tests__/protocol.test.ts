import { describe, it, expect } from 'vitest';
import {
  isTfReady,
  isTfSelect,
  isTfHover,
  isTfHighlight,
  isTfSetRoleBadge,
  isTfRect,
  isEditorInboundMessage,
} from '../guards.js';
import { PROTOCOL_VERSION } from '../types.js';

const validRect = { x: 10, y: 20, width: 300, height: 150, top: 20, right: 310, bottom: 170, left: 10 };

describe('protocol guards', () => {
  describe('isTfRect', () => {
    it('accepts a valid rect', () => {
      expect(isTfRect(validRect)).toBe(true);
    });

    it('rejects null', () => {
      expect(isTfRect(null)).toBe(false);
    });

    it('rejects missing fields', () => {
      expect(isTfRect({ x: 1, y: 2 })).toBe(false);
    });

    it('rejects non-number fields', () => {
      expect(isTfRect({ ...validRect, x: 'bad' })).toBe(false);
    });
  });

  describe('isTfReady', () => {
    it('accepts a valid TF_READY message', () => {
      expect(isTfReady({ protocolVersion: PROTOCOL_VERSION, type: 'TF_READY' })).toBe(true);
    });

    it('rejects null', () => {
      expect(isTfReady(null)).toBe(false);
    });

    it('rejects wrong protocolVersion', () => {
      expect(isTfReady({ protocolVersion: 999, type: 'TF_READY' })).toBe(false);
    });

    it('rejects wrong type', () => {
      expect(isTfReady({ protocolVersion: PROTOCOL_VERSION, type: 'TF_SELECT' })).toBe(false);
    });
  });

  describe('isTfSelect', () => {
    const validSelect = {
      protocolVersion: PROTOCOL_VERSION,
      type: 'TF_SELECT',
      nodeId: 'n1',
      role: 'header',
      rect: validRect,
    };

    it('accepts a valid TF_SELECT message', () => {
      expect(isTfSelect(validSelect)).toBe(true);
    });

    it('accepts with optional name field', () => {
      expect(isTfSelect({ ...validSelect, name: 'Header' })).toBe(true);
    });

    it('rejects empty nodeId', () => {
      expect(isTfSelect({ ...validSelect, nodeId: '' })).toBe(false);
    });

    it('rejects missing nodeId', () => {
      const { nodeId: _, ...rest } = validSelect;
      expect(isTfSelect(rest)).toBe(false);
    });

    it('rejects non-string role', () => {
      expect(isTfSelect({ ...validSelect, role: 42 })).toBe(false);
    });

    it('rejects empty role', () => {
      expect(isTfSelect({ ...validSelect, role: '' })).toBe(false);
    });

    it('rejects non-object rect', () => {
      expect(isTfSelect({ ...validSelect, rect: 'bad' })).toBe(false);
    });

    it('rejects invalid rect', () => {
      expect(isTfSelect({ ...validSelect, rect: { x: 1 } })).toBe(false);
    });

    it('rejects non-string name', () => {
      expect(isTfSelect({ ...validSelect, name: false })).toBe(false);
    });

    it('rejects wrong protocolVersion', () => {
      expect(isTfSelect({ ...validSelect, protocolVersion: 0 })).toBe(false);
    });
  });

  describe('isTfHover', () => {
    it('accepts valid TF_HOVER with nodeId', () => {
      expect(isTfHover({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: 'n1' })).toBe(true);
    });

    it('accepts valid TF_HOVER with null nodeId', () => {
      expect(isTfHover({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: null })).toBe(true);
    });

    it('rejects non-string nodeId', () => {
      expect(isTfHover({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HOVER', nodeId: 42 })).toBe(false);
    });

    it('rejects null input', () => {
      expect(isTfHover(null)).toBe(false);
    });
  });

  describe('isTfHighlight', () => {
    it('accepts valid TF_HIGHLIGHT with nodeId', () => {
      expect(isTfHighlight({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId: 'n1' })).toBe(true);
    });

    it('accepts valid TF_HIGHLIGHT with null', () => {
      expect(isTfHighlight({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId: null })).toBe(true);
    });

    it('rejects non-string nodeId', () => {
      expect(isTfHighlight({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId: true })).toBe(false);
    });

    it('rejects empty object', () => {
      expect(isTfHighlight({})).toBe(false);
    });
  });

  describe('isTfSetRoleBadge', () => {
    it('accepts valid TF_SET_ROLE_BADGE', () => {
      expect(isTfSetRoleBadge({ protocolVersion: PROTOCOL_VERSION, type: 'TF_SET_ROLE_BADGE', nodeId: 'n1', role: 'hero' })).toBe(true);
    });

    it('rejects empty nodeId', () => {
      expect(isTfSetRoleBadge({ protocolVersion: PROTOCOL_VERSION, type: 'TF_SET_ROLE_BADGE', nodeId: '', role: 'hero' })).toBe(false);
    });

    it('rejects empty role', () => {
      expect(isTfSetRoleBadge({ protocolVersion: PROTOCOL_VERSION, type: 'TF_SET_ROLE_BADGE', nodeId: 'n1', role: '' })).toBe(false);
    });

    it('rejects missing role', () => {
      expect(isTfSetRoleBadge({ protocolVersion: PROTOCOL_VERSION, type: 'TF_SET_ROLE_BADGE', nodeId: 'n1' })).toBe(false);
    });
  });

  describe('isEditorInboundMessage', () => {
    it('accepts TF_HIGHLIGHT', () => {
      expect(isEditorInboundMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_HIGHLIGHT', nodeId: null })).toBe(true);
    });

    it('accepts TF_SET_ROLE_BADGE', () => {
      expect(isEditorInboundMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_SET_ROLE_BADGE', nodeId: 'n1', role: 'cta' })).toBe(true);
    });

    it('rejects TF_READY', () => {
      expect(isEditorInboundMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_READY' })).toBe(false);
    });

    it('rejects unknown message', () => {
      expect(isEditorInboundMessage({ protocolVersion: PROTOCOL_VERSION, type: 'TF_UNKNOWN' })).toBe(false);
    });
  });

  describe('malformed / unknown messages are ignored', () => {
    it('rejects undefined', () => {
      expect(isTfReady(undefined)).toBe(false);
      expect(isTfSelect(undefined)).toBe(false);
      expect(isTfHover(undefined)).toBe(false);
      expect(isTfHighlight(undefined)).toBe(false);
      expect(isTfSetRoleBadge(undefined)).toBe(false);
    });

    it('rejects arrays', () => {
      expect(isTfReady([])).toBe(false);
      expect(isTfSelect([])).toBe(false);
    });

    it('rejects messages with extra unknown fields (still valid if shape ok)', () => {
      expect(isTfReady({ protocolVersion: PROTOCOL_VERSION, type: 'TF_READY', extra: true })).toBe(true);
    });
  });
});
