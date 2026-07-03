export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: DocumentNode;
  schemaVersion: number;
  role?: string;
  componentSets?: ComponentSetMetadata[];
  components?: ComponentMetadata[];
  styles?: StyleMetadata[];
}

export interface DocumentNode {
  id: string;
  name: string;
  type: NodeType;
  visible: boolean;
  children?: SceneNode[];
}

export type NodeType =
  | 'DOCUMENT' | 'CANVAS' | 'FRAME' | 'GROUP'
  | 'VECTOR' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE'
  | 'LINE' | 'COMPONENT' | 'COMPONENT_SET' | 'INSTANCE'
  | 'BOOLEAN_OPERATION' | 'STAR' | 'POLYGON' | 'SLICE'
  | 'MEDIA' | 'SECTION' | 'TABLE' | 'TABLE_CELL';

export interface SceneNode {
  id: string;
  name: string;
  type: NodeType;
  visible: boolean;
  locked: boolean;
  children?: SceneNode[];
  opacity?: number;
  blendMode?: BlendMode;
  absoluteBoundingBox?: Rect;
  absoluteRenderBounds?: Rect;
  relativeTransform?: Transform;
  size?: Vector2;
  constraints?: LayoutConstraint;
  clipsContent?: boolean;
  backgroundColor?: Color;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: StrokeAlign;
  strokeCap?: StrokeCap;
  strokeJoin?: StrokeJoin;
  dashPattern?: number[];
  cornerRadius?: number | MixedFixed;
  rectangleCornerRadii?: [number, number, number, number];
  effects?: Effect[];
  layoutMode?: LayoutMode;
  primaryAxisSizingMode?: SizingMode;
  counterAxisSizingMode?: SizingMode;
  primaryAxisAlignItems?: PrimaryAxisAlign;
  counterAxisAlignItems?: CounterAxisAlign;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  counterAxisSpacing?: number;
  layoutGrids?: LayoutGrid[];
  layoutAlign?: LayoutAlign;
  layoutGrow?: number;
  layoutPositioning?: LayoutPositioning;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  overflow?: OverflowDirection;
  componentProperties?: ComponentPropertyDefinition[];
  componentPropertyReferences?: Record<string, string>;
  boundVariables?: Record<string, VariableAlias | VariableAlias[]>;
  explicitVariableModes?: Record<string, string>;
  characters?: string;
  style?: TypeStyle;
  styleOverrideTable?: Record<string, TypeStyle>;
  isMask?: boolean;
  isMaskOutline?: boolean;
  guideLines?: GuideLine[];
}

export type LayoutMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL';
export type LayoutAlign = 'INHERIT' | 'STRETCH';
export type LayoutPositioning = 'AUTO' | 'ABSOLUTE';
export type SizingMode = 'FIXED' | 'AUTO' | 'FILL';
export type PrimaryAxisAlign = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
export type CounterAxisAlign = 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
export type OverflowDirection = 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'BOTH';
export type BlendMode = 'PASS_THROUGH' | 'NORMAL' | 'MULTIPLY' | 'SCREEN' | 'OVERLAY' | 'DARKEN' | 'LIGHTEN';
export type StrokeAlign = 'INSIDE' | 'OUTSIDE' | 'CENTER';
export type StrokeCap = 'NONE' | 'ROUND' | 'SQUARE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL';
export type StrokeJoin = 'MITER' | 'BEVEL' | 'ROUND';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Transform = [[number, number, number], [number, number, number]];

export interface Vector2 {
  x: number;
  y: number;
}

export interface LayoutConstraint {
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Paint {
  type: PaintType;
  visible: boolean;
  opacity?: number;
  color?: Color;
  blendMode?: string;
  gradientHandlePositions?: Vector2[];
  gradientStops?: ColorStop[];
  scaleMode?: 'FILL' | 'FIT' | 'CROP' | 'TILE';
  imageRef?: string;
  imageTransform?: Transform;
  filters?: ImageFilters;
  pluginData?: Record<string, unknown>;
}

export type PaintType = 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI';

export interface ColorStop {
  position: number;
  color: Color;
}

export interface ImageFilters {
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  highlights?: number;
  shadows?: number;
}

export interface Effect {
  type: EffectType;
  visible: boolean;
  radius: number;
  offset?: Vector2;
  color?: Color;
  spread?: number;
  showShadowBehindNode?: boolean;
}

export type EffectType = 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';

export interface LayoutGrid {
  pattern: 'COLUMNS' | 'ROWS' | 'GRID';
  sectionSize: number;
  visible: boolean;
  color: Color;
  alignment: 'MIN' | 'STRETCH' | 'CENTER';
  gutterSize: number;
  count: number;
  offset: number;
}

export interface ComponentPropertyDefinition {
  type: 'BOOLEAN' | 'INSTANCE_SWAP' | 'TEXT' | 'VARIANT';
  key: string;
  name: string;
  value: string | boolean;
  preferredValues?: InstanceSwapPreferredValue[];
}

export interface InstanceSwapPreferredValue {
  key: string;
  name: string;
}

export interface VariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

export interface GuideLine {
  axis: 'X' | 'Y';
  position: number;
}

export interface TypeStyle {
  fontFamily: string;
  fontPostScriptName: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  lineHeight: LineHeight | number;
  letterSpacing: number;
  letterCase: LetterCase;
  textDecoration: TextDecoration;
  textAutoResize: TextAutoResize;
  paragraphSpacing: number;
  paragraphIndent: number;
  listSpacing: number;
  hangingPunctuation: number;
  listType: ListType;
  hyperlink: Hyperlink | null;
  fills?: Paint[];
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
}

export interface LineHeight {
  value: number;
  unit: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
}

export type LetterCase = 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
export type TextDecoration = 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
export type TextAutoResize = 'HEIGHT' | 'WIDTH_AND_HEIGHT' | 'TRUNCATE' | 'NONE';
export type ListType = 'ORDERED' | 'UNORDERED' | 'NONE';

export interface Hyperlink {
  type: 'URL' | 'NODE';
  url: string;
  nodeId?: string;
}

export interface MixedFixed {
  unit: 'PIXELS' | 'PERCENTAGE';
  value: number;
}

export interface ComponentSetMetadata {
  key: string;
  name: string;
  description: string;
  componentSetKey: string;
}

export interface ComponentMetadata {
  key: string;
  name: string;
  description: string;
  componentId: string;
}

export interface StyleMetadata {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description: string;
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
  lineHeight: number | LineHeight;
  letterSpacing: number;
  textCase: LetterCase;
  textDecoration: TextDecoration;
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
}

export interface FigmaEffectStyle {
  key: string;
  name: string;
  effectType: EffectType;
  effects: Effect[];
}

export interface ContentText {
  text: string;
  style: TypeStyle;
}

// ── Variables API (Figma Variables REST API) ──────────────────────

export type VariableResolvedType = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

export type VariableScope =
  | 'ALL_SCOPES'
  | 'TEXT_CONTENT'
  | 'CORNER_RADIUS'
  | 'WIDTH_HEIGHT'
  | 'GAP'
  | 'STROKE_SIZE'
  | 'OPACITY'
  | 'STROKE_FLOAT'
  | 'EFFECT_FLOAT'
  | 'FILL_FLOAT'
  | 'FRAME_FILL'
  | 'STROKE_COLOR'
  | 'EFFECT_COLOR'
  | 'TEXT_COLOR'
  | 'FILL_COLOR';

export interface VariableCodeSyntax {
  WEB: string;
  ANDROID?: string;
  IOS?: string;
}

export interface VariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: VariableResolvedType;
  valuesByMode: Record<string, Color | number | string | boolean | VariableAlias>;
  remote: boolean;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: VariableScope[];
  codeSyntax: VariableCodeSyntax;
}

export interface VariableMode {
  modeId: string;
  name: string;
  parentModeId?: string;
}

export interface VariableCollection {
  id: string;
  name: string;
  key: string;
  modes: VariableMode[];
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
  variableIds: string[];
}

export interface FigmaVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, VariableCollection>;
  };
}
