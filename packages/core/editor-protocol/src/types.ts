export const PROTOCOL_VERSION = 1;

export interface TfReadyMessage {
  protocolVersion: typeof PROTOCOL_VERSION;
  type: 'TF_READY';
}

export interface TfSelectMessage {
  protocolVersion: typeof PROTOCOL_VERSION;
  type: 'TF_SELECT';
  nodeId: string;
  role: string;
  name?: string;
  rect: TfRect;
}

export interface TfHoverMessage {
  protocolVersion: typeof PROTOCOL_VERSION;
  type: 'TF_HOVER';
  nodeId: string | null;
}

export interface TfHighlightMessage {
  protocolVersion: typeof PROTOCOL_VERSION;
  type: 'TF_HIGHLIGHT';
  nodeId: string | null;
}

export interface TfSetRoleBadgeMessage {
  protocolVersion: typeof PROTOCOL_VERSION;
  type: 'TF_SET_ROLE_BADGE';
  nodeId: string;
  role: string;
}

export interface TfRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type EditorProtocolMessage =
  | TfReadyMessage
  | TfSelectMessage
  | TfHoverMessage
  | TfHighlightMessage
  | TfSetRoleBadgeMessage;

export type EditorOutboundMessage = TfReadyMessage | TfSelectMessage | TfHoverMessage;
export type EditorInboundMessage = TfHighlightMessage | TfSetRoleBadgeMessage;
