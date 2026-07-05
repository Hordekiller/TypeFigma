// ── Core Types ────────────────────────────────────────────

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
  editorType?: 'figma' | 'figjam';
  linkAccess?: string;
  mainFileKey?: string;
  branches?: FigmaBranch[];
}

export interface FigmaBranch {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
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
  | 'MEDIA' | 'SECTION' | 'TABLE' | 'TABLE_CELL'
  | 'EMBED' | 'LINK_UNFURL' | 'STICKY' | 'SHAPE_WITH_TEXT'
  | 'CONNECTOR' | 'WASHI_TAPE' | 'WIDGET'
  | 'REGULAR_POLYGON';

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
  isFixed?: boolean;
  transitionDuration?: number;
  transitionEasing?: EasingType;
  transitionNodeID?: string;
  devStatus?: DevStatus;
  exportSettings?: ExportSetting[];
  hyperlink?: { url: string } | string;
  complexStrokeProperties?: {
    brushStroke?: boolean;
    dynamicStroke?: boolean;
    strokeCap?: string;
    strokeJoin?: string;
  };
  variableWidthPoints?: Array<{
    point: number;
    width: number;
  }>;
  textPathStartData?: {
    startOffset: number;
  };
  transformModifiers?: Array<{
    type: string;
    value?: number;
  }>;
}

export type EasingType =
  | 'EASE_IN' | 'EASE_OUT' | 'EASE_IN_AND_OUT'
  | 'LINEAR' | 'GENTLE' | 'GENTLE_SPRING'
  | 'CUSTOM_CUBIC_BEZIER';

export interface DevStatus {
  type: 'CURRENT' | 'DEPRECATED' | 'NO_ACCESS';
  description?: string;
}

export interface ExportSetting {
  suffix: string;
  format: 'PNG' | 'JPG' | 'SVG' | 'PDF';
  constraint: { type: 'SCALE' | 'WIDTH' | 'HEIGHT'; value: number };
}

// ── Layout Types ──────────────────────────────────────────

export type LayoutMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL';
export type LayoutAlign = 'INHERIT' | 'STRETCH';
export type LayoutPositioning = 'AUTO' | 'ABSOLUTE';
export type SizingMode = 'FIXED' | 'AUTO' | 'FILL';
export type PrimaryAxisAlign = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
export type CounterAxisAlign = 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
export type OverflowDirection = 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'BOTH';
export type BlendMode =
  | 'PASS_THROUGH' | 'NORMAL' | 'MULTIPLY' | 'SCREEN' | 'OVERLAY'
  | 'DARKEN' | 'LIGHTEN' | 'COLOR_DODGE' | 'COLOR_BURN' | 'HARD_LIGHT'
  | 'SOFT_LIGHT' | 'DIFFERENCE' | 'EXCLUSION' | 'HUE' | 'SATURATION'
  | 'COLOR' | 'LUMINOSITY';
export type StrokeAlign = 'INSIDE' | 'OUTSIDE' | 'CENTER';
export type StrokeCap = 'NONE' | 'ROUND' | 'SQUARE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL';
export type StrokeJoin = 'MITER' | 'BEVEL' | 'ROUND';

// ── Geometry Types ────────────────────────────────────────

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
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

// ── Paint Types ───────────────────────────────────────────

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
  pattern?: PatternInfo;
}

export type PaintType =
  | 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL'
  | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND'
  | 'IMAGE' | 'EMOJI' | 'PATTERN';

export interface PatternInfo {
  pattern: {
    name: string;
    // pattern-specific props
  };
}

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

// ── Effect Types ──────────────────────────────────────────

export interface Effect {
  type: EffectType;
  visible: boolean;
  radius: number;
  offset?: Vector2;
  color?: Color;
  spread?: number;
  showShadowBehindNode?: boolean;
}

export type EffectType =
  | 'DROP_SHADOW' | 'INNER_SHADOW'
  | 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  | 'TEXTURE' | 'NOISE';

// ── Grid Types ────────────────────────────────────────────

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

// ── Component Types ───────────────────────────────────────

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

// ── Guide Types ───────────────────────────────────────────

export interface GuideLine {
  axis: 'X' | 'Y';
  position: number;
}

// ── Text Style Types ──────────────────────────────────────

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
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  truncatedChars?: number;
}

export interface LineHeight {
  value: number;
  unit: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
}

export type LetterCase = 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
export type TextDecoration = 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
export type TextAutoResize = 'HEIGHT' | 'WIDTH_AND_HEIGHT' | 'TRUNCATE' | 'NONE' | 'AUTO_WITH_OFFSET';
export type ListType = 'ORDERED' | 'UNORDERED' | 'NONE';

// ── Hyperlink Type ────────────────────────────────────────

export interface Hyperlink {
  type: 'URL' | 'NODE';
  url: string;
  nodeId?: string;
}

// ── Mixed Fixed ───────────────────────────────────────────

export interface MixedFixed {
  unit: 'PIXELS' | 'PERCENTAGE';
  value: number;
}

// ── Component/Style Metadata ──────────────────────────────

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

// ── Styles Response ───────────────────────────────────────

export interface FigmaStyles {
  colors: FigmaColorStyle[];
  textStyles: FigmaTextStyle[];
  effects: FigmaEffectStyle[];
  grids?: FigmaGridStyle[];
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
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
}

export interface FigmaEffectStyle {
  key: string;
  name: string;
  effectType: EffectType;
  effects: Effect[];
}

export interface FigmaGridStyle {
  key: string;
  name: string;
  grid: LayoutGrid;
}

// ── Content Types (used internally) ──────────────────────

export interface ContentText {
  text: string;
  style: TypeStyle;
}

// ── Variables API ─────────────────────────────────────────

export type VariableResolvedType = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

export type VariableScope =
  | 'ALL_SCOPES' | 'TEXT_CONTENT' | 'CORNER_RADIUS' | 'WIDTH_HEIGHT' | 'GAP'
  | 'STROKE_SIZE' | 'OPACITY' | 'STROKE_FLOAT' | 'EFFECT_FLOAT' | 'FILL_FLOAT'
  | 'FRAME_FILL' | 'STROKE_COLOR' | 'EFFECT_COLOR' | 'TEXT_COLOR' | 'FILL_COLOR'
  | 'FONT_FAMILY' | 'FONT_STYLE' | 'FONT_WEIGHT' | 'FONT_SIZE' | 'LINE_HEIGHT'
  | 'LETTER_SPACING' | 'PARAGRAPH_SPACING' | 'PARAGRAPH_INDENT';

export interface VariableCodeSyntax {
  WEB: string;
  ANDROID?: string;
  IOS?: string;
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

// ── New FigmaFileNodesResponse type ──────────────────────

export interface FigmaFileNodesResponse {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  editorType?: 'figma' | 'figjam';
  nodes: Record<string, {
    document: SceneNode;
    components: Record<string, ComponentMetadata>;
    componentSets: Record<string, ComponentSetMetadata>;
    schemaVersion: number;
    styles: Record<string, StyleMetadata>;
  }>;
}

// ── Image Types ───────────────────────────────────────────

export interface FigmaImageResponse {
  images: Record<string, string | null>;
  status?: number;
  error?: boolean;
}

export interface FigmaImageFillsResponse {
  images: Record<string, string>;
  status?: number;
  error?: boolean;
  meta?: {
    images: Record<string, string>;
  };
}

// ── File Versions ─────────────────────────────────────────

export interface FigmaFileVersion {
  id: string;
  created_at: string;
  label: string;
  description: string;
  user: FigmaUser;
}

export interface FigmaFileVersionsResponse {
  versions: FigmaFileVersion[];
}

// ── File Meta ─────────────────────────────────────────────

export interface FigmaFileMeta {
  name: string;
  key: string;
  thumbnail_url: string;
  last_modified: string;
  editor_type: 'figma' | 'figjam';
  link_access: string;
  created_at: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
  };
}

// ── Comments ──────────────────────────────────────────────

export interface FigmaUser {
  id: string;
  name: string;
  avatar_url: string;
  email?: string;
}

export interface FigmaComment {
  id: string;
  file_key: string;
  parent_id: string;
  user: FigmaUser;
  created_at: string;
  resolved_at: string | null;
  message: string;
  reactions?: FigmaReaction[];
  client_meta?: {
    node_id: string;
    node_offset?: { x: number; y: number };
  };
  order_id: number;
  type: 'text' | 'video';
}

export interface FigmaReaction {
  emoji: string;
  user: FigmaUser;
  created_at: string;
}

export interface FigmaCreateCommentRequest {
  message: string;
  client_meta?: {
    node_id?: string;
    node_offset?: { x: number; y: number };
  };
  comment_id?: string;
}

export interface FigmaCreateReactionRequest {
  emoji: string;
}

// ── Team/Project Types ────────────────────────────────────

export interface FigmaTeamProject {
  id: string;
  name: string;
}

export interface FigmaProjectFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface FigmaTeamComponentsResponse {
  components: FigmaPublishedComponent[];
  cursor?: { next: string };
}

export interface FigmaPublishedComponent {
  key: string;
  name: string;
  description: string;
  user: FigmaUser;
  created_at: string;
  updated_at: string;
  containing_frame: {
    name: string;
    node_id: string;
  };
}

export interface FigmaTeamStylesResponse {
  styles: FigmaPublishedStyle[];
  cursor?: { next: string };
}

export interface FigmaPublishedStyle {
  key: string;
  name: string;
  description: string;
  style_type: string;
  user: FigmaUser;
  created_at: string;
  updated_at: string;
}

// ── Me (Authenticated User) ───────────────────────────────

export interface FigmaMe {
  id: string;
  email: string;
  handle: string;
  img_url: string;
  is_probable_robot: boolean;
}

// ── Client Configuration ──────────────────────────────────

export interface FigmaClientConfig {
  accessToken?: string;
  oauthToken?: string;
  maxRetries?: number;
  baseRetryDelayMs?: number;
  cacheEnabled?: boolean;
  cacheMaxEntries?: number;
  cacheTtlMs?: number;
  rateLimitingEnabled?: boolean;
}

// ── URL Types ─────────────────────────────────────────────

export interface ParsedFigmaUrl {
  fileKey: string;
  nodeId?: string;
  fileName?: string;
  type: 'file' | 'design' | 'proto' | 'slides' | 'unknown';
}

// ── AI Usage API (2026) ───────────────────────────────────

export interface FigmaAiUsageEntry {
  user_id: string;
  user_handle: string;
  date: string;
  credits_used: number;
  credits_remaining: number;
  feature: string;
}

export interface FigmaAiUsageResponse {
  usage: FigmaAiUsageEntry[];
}

// ── oEmbed API (2026) ────────────────────────────────────

export interface FigmaOEmbed {
  type: 'rich';
  version: string;
  title: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  cache_age: number;
  width: number;
  height: number;
  html: string;
}

// ── Activity Logs ─────────────────────────────────────────

export interface FigmaActivityLog {
  id: string;
  timestamp: string;
  actor: FigmaUser;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  ip_address: string;
  user_agent: string;
}

export interface FigmaActivityLogsResponse {
  logs: FigmaActivityLog[];
  cursor?: string;
}

// ── Dev Resources ─────────────────────────────────────────

export interface FigmaDevResource {
  id: string;
  name: string;
  url: string;
  file_key: string;
  node_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FigmaDevResourcesResponse {
  resources: FigmaDevResource[];
}

// ── Webhooks ──────────────────────────────────────────────

export interface FigmaWebhook {
  id: string;
  team_id: string;
  event_type: string;
  endpoint: string;
  passcode: string;
  status: 'ACTIVE' | 'PAUSED' | 'DISABLED';
  description: string;
  protocol_version: string;
}

export interface FigmaWebhookCreateRequest {
  event_type: string;
  endpoint: string;
  passcode: string;
  description?: string;
}

export interface FigmaWebhookUpdateRequest {
  endpoint?: string;
  passcode?: string;
  status?: 'ACTIVE' | 'PAUSED';
  description?: string;
}

export interface FigmaWebhooksResponse {
  webhooks: FigmaWebhook[];
}

// ── Library Analytics ─────────────────────────────────────

export interface FigmaLibraryAnalytics {
  file_key: string;
  file_name: string;
  component_count: number;
  style_count: number;
  variable_count: number;
  used_by: Array<{
    file_key: string;
    file_name: string;
    component_count: number;
  }>;
}

export interface FigmaLibraryAnalyticsResponse {
  libraries: FigmaLibraryAnalytics[];
}

// ── OAuth ─────────────────────────────────────────────────

export interface FigmaOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user_id: string;
  user_id_string: string;
}
