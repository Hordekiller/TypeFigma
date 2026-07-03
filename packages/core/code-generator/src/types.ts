export interface GeneratedCode {
  html: string;
  globalCss: string;
  componentsCss: string;
  tailwindCss?: string;
  tailwindComponents?: Record<string, string>;
  themeJson?: string;
  blockPatterns?: BlockPattern[];
  blockTemplates?: BlockTemplate[];
  dtcgJson?: string;
  dtcgTokens?: Record<string, unknown>;
  styleDictionary?: Record<string, unknown>;
  reactComponents?: Record<string, string>;
  tokenTypes?: string;
  tokenConstants?: string;
}

export interface BlockPattern {
  title: string;
  slug: string;
  description?: string;
  categories: string[];
  content: string;
  viewportWidth?: number;
  inserter?: boolean;
  keywords?: string[];
}

export interface BlockTemplate {
  title: string;
  slug: string;
  content: string;
  postTypes: string[];
}

export interface TailwindOutput {
  css: string;
  components: Record<string, string>;
  utilities: string[];
}

export interface ThemeJson {
  $schema: string;
  version: number;
  settings: ThemeSettings;
  styles: ThemeStyles;
  templateParts: TemplatePart[];
}

export interface ThemeSettings {
  appearanceTools?: boolean;
  useRootPaddingAwareAlignments?: boolean;
  color: ColorSettings;
  typography: TypographySettings;
  spacing: SpacingSettings;
  layout: LayoutSettings;
  border: BorderSettings;
  dimensions?: DimensionsSettings;
  background?: BackgroundSettings;
  position?: PositionSettings;
  shadow?: ShadowSettings;
  custom?: Record<string, unknown>;
  blocks?: Record<string, BlockSettings>;
}

export interface ColorSettings {
  palette: PaletteItem[];
  gradients?: GradientItem[];
  duotone?: DuotoneItem[];
  link: boolean;
  button: boolean;
  heading?: boolean;
  caption?: boolean;
  defaultPalette: boolean;
  defaultGradients?: boolean;
  defaultDuotone?: boolean;
}

export interface PaletteItem {
  slug: string;
  name: string;
  color: string;
}

export interface GradientItem {
  slug: string;
  name: string;
  gradient: string;
}

export interface DuotoneItem {
  slug: string;
  name: string;
  colors: [string, string];
}

export interface TypographySettings {
  fontFamilies: FontFamilyItem[];
  fontSizes: FontSizeItem[];
  customFontSize: boolean;
  dropCap: boolean;
  fluid?: boolean | FluidTypographyConfig;
  fontStyle?: boolean;
  fontWeight?: boolean;
  letterSpacing?: boolean;
  lineHeight?: boolean;
  textDecoration?: boolean;
  textTransform?: boolean;
  writingMode?: boolean;
  textColumns?: boolean;
  defaultFontSizes?: boolean;
}

export interface FluidTypographyConfig {
  minViewportWidth?: string;
  maxViewportWidth?: string;
  minFontSize?: string;
}

export interface FontFamilyItem {
  fontFamily: string;
  name: string;
  slug: string;
  fontFace?: FontFaceDeclaration[];
}

export interface FontFaceDeclaration {
  fontFamily: string;
  fontWeight?: string;
  fontStyle?: string;
  src: string[];
  unicodeRange?: string;
  fontDisplay?: string;
}

export interface FontSizeItem {
  name: string;
  slug: string;
  size: string;
  fluid?: {
    min: string;
    max: string;
  };
}

export interface SpacingSettings {
  padding: boolean;
  margin: boolean;
  blockGap?: boolean | null;
  spacingScale?: SpacingScaleItem[];
  spacingSizes?: SpacingSizeItem[];
  units: string[];
}

export interface SpacingScaleItem {
  operator: string;
  increment: number;
  steps: number;
  mediumStep: number;
  unit: string;
}

export interface SpacingSizeItem {
  name: string;
  slug: string;
  size: string;
  fluid?: {
    min: string;
    max: string;
  };
}

export interface LayoutSettings {
  contentSize?: string;
  wideSize?: string;
}

export interface BorderSettings {
  color: boolean;
  radius: boolean;
  style: boolean;
  width: boolean;
  radiusSizes?: SpacingSizeItem[];
}

export interface DimensionsSettings {
  minHeight?: boolean;
  aspectRatio?: boolean;
}

export interface BackgroundSettings {
  backgroundImage?: boolean;
  backgroundSize?: boolean;
}

export interface PositionSettings {
  sticky?: boolean;
}

export interface ShadowSettings {
  presets?: ShadowPresetItem[];
  defaultPresets?: boolean;
}

export interface ShadowPresetItem {
  name: string;
  slug: string;
  shadow: string;
}

export interface BlockSettings {
  color?: {
    text?: boolean;
    background?: boolean;
    link?: boolean;
    heading?: boolean;
    button?: boolean;
    caption?: boolean;
    palette?: boolean;
    gradients?: boolean;
    defaultPalette?: boolean;
    defaultGradients?: boolean;
    defaultDuotone?: boolean;
  };
  typography?: {
    fontFamily?: boolean;
    fontSize?: boolean;
    fontStyle?: boolean;
    fontWeight?: boolean;
    letterSpacing?: boolean;
    lineHeight?: boolean;
    textDecoration?: boolean;
    textTransform?: boolean;
    dropCap?: boolean;
    writingMode?: boolean;
    textColumns?: boolean;
    fluid?: boolean;
    customFontSize?: boolean;
  };
  spacing?: {
    padding?: boolean;
    margin?: boolean;
    blockGap?: boolean;
    units?: string[];
  };
  border?: {
    color?: boolean;
    radius?: boolean;
    style?: boolean;
    width?: boolean;
  };
  dimensions?: {
    minHeight?: boolean;
    aspectRatio?: boolean;
  };
  background?: {
    backgroundImage?: boolean;
    backgroundSize?: boolean;
  };
  position?: {
    sticky?: boolean;
  };
  layout?: Record<string, unknown>;
  shadow?: {
    presets?: boolean;
    defaultPresets?: boolean;
  };
}

export interface ThemeStyles {
  color: {
    text: string;
    background: string;
    link?: string;
    caption?: string;
    heading?: string;
    button?: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    fontStyle?: string;
    fontWeight?: string;
    letterSpacing?: string;
    textDecoration?: string;
    textTransform?: string;
  };
  spacing?: {
    padding?: Record<string, string>;
    margin?: Record<string, string>;
    blockGap?: string;
  };
  border?: {
    radius?: string;
    width?: string;
    color?: string;
    style?: string;
  };
  blocks?: Record<string, BlockStyle>;
  elements?: {
    link?: ElementLinkStyle;
    heading?: ElementHeadingStyle;
    button?: ElementButtonStyle;
    caption?: ElementCaptionStyle;
  };
}

export interface ElementLinkStyle {
  color: { text: string };
  typography?: { fontFamily?: string; fontWeight?: string; textDecoration?: string };
}

export interface ElementHeadingStyle {
  color: { text: string };
  typography: { fontFamily: string; fontWeight: string; lineHeight: string; letterSpacing?: string };
  spacing?: { margin?: Record<string, string>; padding?: Record<string, string> };
}

export interface ElementButtonStyle {
  color: { text: string; background: string };
  typography: { fontFamily: string; fontWeight: string; fontSize?: string };
  border: { radius: string; width?: string; color?: string; style?: string };
  spacing?: { padding?: Record<string, string> };
}

export interface ElementCaptionStyle {
  color: { text: string };
  typography: { fontFamily: string; fontSize: string; lineHeight: string; letterSpacing?: string };
}

export interface BlockStyle {
  color?: { text?: string; background?: string; link?: string };
  typography?: { fontFamily?: string; fontSize?: string; fontWeight?: string; lineHeight?: string; letterSpacing?: string };
  spacing?: { padding?: Record<string, string>; margin?: Record<string, string>; blockGap?: string };
  border?: { radius?: string; width?: string; color?: string; style?: string };
  shadow?: { preset?: string };
  elements?: {
    link?: ElementLinkStyle;
    heading?: ElementHeadingStyle;
  };
}

export interface TemplatePart {
  name: string;
  title: string;
  area: string;
}
