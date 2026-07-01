export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: DocumentNode;
}

export interface DocumentNode {
  id: string;
  name: string;
  type: NodeType;
  children?: SceneNode[];
}

export interface SceneNode {
  id: string;
  name: string;
  type: NodeType;
  visible: boolean;
  locked: boolean;
  children?: SceneNode[];
  absoluteBoundingBox?: Rect;
  backgroundColor?: Color;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  cornerRadius?: number;
  effects?: Effect[];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutGrids?: LayoutGrid[];
  componentProperties?: ComponentProperty[];
}

export type NodeType =
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'VECTOR'
  | 'TEXT'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'LINE'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Paint {
  type: 'SOLID' | 'GRADIENT' | 'IMAGE' | 'EMOJI';
  visible: boolean;
  color?: Color;
  opacity?: number;
  blendMode?: string;
}

export interface Effect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible: boolean;
  radius: number;
  offset?: Vector2;
  color?: Color;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface LayoutGrid {
  pattern: 'COLUMNS' | 'ROWS' | 'GRID';
  sectionSize: number;
  visible: boolean;
  color: Color;
  alignment: 'MIN' | 'STRETCH' | 'CENTER';
  gutterSize: number;
  count: number;
}

export interface ComponentProperty {
  type: 'BOOLEAN' | 'INSTANCE_SWAP' | 'TEXT';
  key: string;
  name: string;
  value: string | boolean;
}

export interface FigmaStyles {
  colors: FigmaColorStyle[];
  textStyles: FigmaTextStyle[];
  effects: FigmaEffectStyle[];
}

export interface FigmaColorStyle {
  key: string;
  name: string;
  color: Color;
  description?: string;
}

export interface FigmaTextStyle {
  key: string;
  name: string;
  fontFamily: string;
  fontPostScriptName: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textCase: 'UPPER' | 'LOWER' | 'TITLE' | 'ORIGINAL';
  textDecoration: 'UNDERLINE' | 'STRIKETHROUGH' | 'NONE';
}

export interface FigmaEffectStyle {
  key: string;
  name: string;
  effects: Effect[];
}
