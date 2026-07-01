import type { SceneNode, Color } from '@typefigma/figma-client';

export type ProjectType = 'shop' | 'corporate' | 'blog' | 'portfolio' | 'landing';

export interface Page {
  id: string;
  name: string;
  nodes: SceneNode[];
}

export interface FigmaAnalysis {
  projectType: ProjectType;
  confidence: number;
  pages: Page[];
  components: DetectedComponents;
  designTokens: ExtractedTokens;
}

export interface DetectedComponents {
  header: HeaderInfo | null;
  hero: HeroInfo | null;
  sections: SectionInfo[];
  footer: FooterInfo | null;
  productCard: ProductCardInfo | null;
  forms: FormInfo[];
}

export interface HeaderInfo {
  type: 'sticky' | 'static' | 'transparent';
  hasLogo: boolean;
  hasMenu: boolean;
  hasSearch: boolean;
  hasCTA: boolean;
  confidence: number;
  figmaNodeId: string;
}

export interface HeroInfo {
  layout: 'fullwidth' | 'centered' | 'split';
  hasVideo: boolean;
  hasSlider: boolean;
  confidence: number;
  figmaNodeId: string;
}

export interface SectionInfo {
  type: string;
  confidence: number;
  figmaNodeId: string;
  name: string;
}

export interface FooterInfo {
  columns: number;
  hasSocial: boolean;
  hasNewsletter: boolean;
  confidence: number;
  figmaNodeId: string;
}

export interface ProductCardInfo {
  hasQuickView: boolean;
  hasWishlist: boolean;
  hasRating: boolean;
  confidence: number;
  figmaNodeId: string;
}

export interface FormInfo {
  fields: number;
  type: 'newsletter' | 'contact' | 'search' | 'login';
  figmaNodeId: string;
}

export interface ExtractedTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingScale;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
}

export interface ColorTokens {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  neutral: Record<string, string>;
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface TypographyTokens {
  h1: FontStyle;
  h2: FontStyle;
  h3: FontStyle;
  h4: FontStyle;
  body: FontStyle;
  small: FontStyle;
}

export interface FontStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
}

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
}

export interface BorderRadiusTokens {
  none: string;
  sm: string;
  md: string;
  full: string;
}
