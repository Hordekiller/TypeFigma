export { PROTOCOL_VERSION } from './types.js';
export type {
  TfReadyMessage,
  TfSelectMessage,
  TfHoverMessage,
  TfHighlightMessage,
  TfSetRoleBadgeMessage,
  TfRect,
  EditorProtocolMessage,
  EditorOutboundMessage,
  EditorInboundMessage,
} from './types.js';

export {
  isTfReady,
  isTfSelect,
  isTfHover,
  isTfHighlight,
  isTfSetRoleBadge,
  isTfRect,
  isEditorInboundMessage,
} from './guards.js';

export { findComponentAncestor, buildSelectionScript, buildEditorHtml } from './selection-script.js';
