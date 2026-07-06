import { PROTOCOL_VERSION } from './types.js';
import type {
  TfReadyMessage,
  TfSelectMessage,
  TfHoverMessage,
  TfHighlightMessage,
  TfSetRoleBadgeMessage,
  TfRect,
} from './types.js';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}

function hasValidProtocol(v: Record<string, unknown>): boolean {
  return v.protocolVersion === PROTOCOL_VERSION;
}

export function isTfRect(v: unknown): v is TfRect {
  if (!isRecord(v)) return false;
  const keys: (keyof TfRect)[] = ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left'];
  for (const k of keys) {
    if (!isNumber(v[k])) return false;
  }
  return true;
}

export function isTfReady(v: unknown): v is TfReadyMessage {
  return isRecord(v) && hasValidProtocol(v) && v.type === 'TF_READY';
}

export function isTfSelect(v: unknown): v is TfSelectMessage {
  if (!isRecord(v) || !hasValidProtocol(v) || v.type !== 'TF_SELECT') return false;
  if (!isString(v.nodeId) || v.nodeId.length === 0) return false;
  if (!isString(v.role) || v.role.length === 0) return false;
  if (v.name !== undefined && !isString(v.name)) return false;
  if (!isTfRect(v.rect)) return false;
  return true;
}

export function isTfHover(v: unknown): v is TfHoverMessage {
  if (!isRecord(v) || !hasValidProtocol(v) || v.type !== 'TF_HOVER') return false;
  if (v.nodeId !== null && !isString(v.nodeId)) return false;
  return true;
}

export function isTfHighlight(v: unknown): v is TfHighlightMessage {
  if (!isRecord(v) || !hasValidProtocol(v) || v.type !== 'TF_HIGHLIGHT') return false;
  if (v.nodeId !== null && !isString(v.nodeId)) return false;
  return true;
}

export function isTfSetRoleBadge(v: unknown): v is TfSetRoleBadgeMessage {
  if (!isRecord(v) || !hasValidProtocol(v) || v.type !== 'TF_SET_ROLE_BADGE') return false;
  if (!isString(v.nodeId) || v.nodeId.length === 0) return false;
  if (!isString(v.role) || v.role.length === 0) return false;
  return true;
}

export function isEditorInboundMessage(v: unknown): v is TfHighlightMessage | TfSetRoleBadgeMessage {
  return isTfHighlight(v) || isTfSetRoleBadge(v);
}
