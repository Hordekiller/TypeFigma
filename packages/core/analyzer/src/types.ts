import type { SceneNode } from '@typefigma/figma-client';
import type { ExtractedContent } from './content-extractor.js';

export type ProjectType = 'ecommerce' | 'corporate' | 'blog' | 'portfolio' | 'landing' | 'saas';

export interface ProjectTypeDetection {
  type: ProjectType;
  confidence: number;
  indicators: {
    hasProductCards: boolean;
    hasAddToCart: boolean;
    hasCheckout: boolean;
    hasWishlist: boolean;
    hasProductGallery: boolean;
    hasReviews: boolean;
    hasPricing: boolean;
    hasBlogPosts: boolean;
    hasPortfolioItems: boolean;
    hasContactForms: boolean;
    hasTeamSection: boolean;
    hasServicesSection: boolean;
  };
  recommendedPlugins: string[];
}

export interface Page {
  id: string;
  name: string;
  nodes: SceneNode[];
}

export interface FigmaAnalysis {
  projectMeta: {
    figmaUrl: string;
    fileName: string;
    lastModified: string;
  };
  projectType: ProjectTypeDetection;
  pages: Page[];
  components: ComponentClassification;
  designTokens: ExtractedTokens;
  content: ExtractedContent;
  designSystem?: import('./variable-extractor.js').DesignSystem;
}

export interface ResponsiveBreakpoint {
  name: string;
  width: number;
  componentId: string;
}

export interface InteractionState {
  figmaNodeId: string;
  componentName: string;
  states: Array<{
    type: 'hover' | 'active' | 'disabled' | 'focus' | 'selected';
    variantNodeId: string;
    name: string;
  }>;
}

export interface ComponentClassification {
  headers: HeaderComponent[];
  footers: FooterComponent[];
  navigation: NavigationComponent[];
  heroes: HeroComponent[];
  ctaSections: CTAComponent[];
  testimonials: TestimonialComponent[];
  galleries: GalleryComponent[];
  productCards: ProductCardComponent[];
  productDetails: ProductDetailComponent[];
  cartComponents: CartComponent[];
  checkoutComponents: CheckoutComponent[];
  postCards: PostCardComponent[];
  postDetail: PostDetailComponent[];
  contactForms: FormComponent[];
  searchBars: SearchComponent[];
  newsletters: NewsletterComponent[];
  sections: SectionComponent[];
  containers: ContainerComponent[];
  columns: ColumnComponent[];
  responsiveBreakpoints: ResponsiveBreakpoint[];
  interactionStates: InteractionState[];
}

export interface HeaderComponent {
  id: string;
  figmaNodeId: string;
  name: string;
  confidence: number;
  type: 'sticky' | 'static' | 'transparent';
  hasLogo: boolean;
  hasMenu: boolean;
  hasSearch: boolean;
  hasCTA: boolean;
  layout: {
    alignment: 'left' | 'center' | 'space-between';
    height: string;
    padding: SpacingValues;
  };
}

export interface FooterComponent {
  id: string;
  figmaNodeId: string;
  name: string;
  confidence: number;
  columns: number;
  hasSocial: boolean;
  hasNewsletter: boolean;
  hasMenu: boolean;
}

export interface NavigationComponent {
  id: string;
  figmaNodeId: string;
  type: 'horizontal' | 'vertical' | 'mega-menu' | 'hamburger';
  items: number;
  hasDropdown: boolean;
}

export interface HeroComponent {
  id: string;
  figmaNodeId: string;
  name: string;
  confidence: number;
  layout: 'fullwidth' | 'centered' | 'split';
  hasVideo: boolean;
  hasSlider: boolean;
  hasOverlay: boolean;
  content: {
    hasHeadline: boolean;
    hasSubtext: boolean;
    hasButtons: boolean;
    hasImage: boolean;
  };
}

export interface CTAComponent {
  id: string;
  figmaNodeId: string;
  confidence: number;
  type: 'banner' | 'section' | 'popup' | 'inline';
  hasButton: boolean;
  hasImage: boolean;
}

export interface TestimonialComponent {
  id: string;
  figmaNodeId: string;
  confidence: number;
  layout: 'grid' | 'slider' | 'single';
  hasAvatar: boolean;
  hasRating: boolean;
  hasCompanyLogo: boolean;
}

export interface GalleryComponent {
  id: string;
  figmaNodeId: string;
  layout: 'grid' | 'masonry' | 'slider' | 'carousel';
  imageCount: number;
  hasLightbox: boolean;
  hasFilter: boolean;
}

export interface ProductCardComponent {
  id: string;
  figmaNodeId: string;
  name: string;
  confidence: number;
  structure: {
    productImage: {
      nodeId: string;
      aspectRatio: string;
      hasBorderRadius: boolean;
      hasHoverEffect: boolean;
    };
    productBadge?: {
      nodeId: string;
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      text: string;
    };
    productTitle: { nodeId: string; maxLines: number };
    productPrice: {
      nodeId: string;
      format: 'regular' | 'sale' | 'range';
      hasCurrency: boolean;
    };
    productRating?: { nodeId: string; style: 'stars' | 'number' | 'both' };
    shortDescription?: { nodeId: string; maxLength: number };
    addToCartButton: { nodeId: string; text: string; iconPosition?: 'left' | 'right' | 'none' };
    quickViewButton?: { nodeId: string };
    wishlistButton?: { nodeId: string; position: Position };
    compareButton?: { nodeId: string };
  };
  layout: {
    type: 'card' | 'list' | 'compact';
    alignment: 'left' | 'center' | 'right';
    spacing: SpacingValues;
    containerPadding: SpacingValues;
  };
}

export interface Position {
  x: number;
  y: number;
}

export interface SpacingValues {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface ProductDetailComponent {
  id: string;
  figmaNodeId: string;
  confidence: number;
  layout: 'sidebar-left' | 'sidebar-right' | 'fullwidth' | 'centered';
  sections: {
    productGallery: {
      nodeId: string;
      type: 'slider' | 'grid' | 'thumbnails-left' | 'thumbnails-bottom';
      hasZoom: boolean;
      hasLightbox: boolean;
    };
    productMeta: {
      title: { nodeId: string; tag: 'h1' | 'h2' };
      price: { nodeId: string; showSalePrice: boolean; showSavings: boolean };
      rating: { nodeId: string; showCount: boolean; linkToReviews: boolean };
      sku?: { nodeId: string };
      availability: { nodeId: string };
      categories?: { nodeId: string; style: 'links' | 'badges' };
      tags?: { nodeId: string };
    };
    shortDescription: { nodeId: string };
    addToCart: {
      quantitySelector: { nodeId: string; style: 'input' | 'stepper' | 'dropdown' };
      addToCartButton: { nodeId: string; text: string };
      variations?: { nodeId: string; type: 'dropdown' | 'radio' | 'image-select' | 'button-group' };
      buyNowButton?: { nodeId: string };
    };
    productActions: {
      wishlist?: { nodeId: string };
      compare?: { nodeId: string };
      share?: { platforms: string[] };
    };
    productTabs: {
      nodeId: string;
      type: 'tabs' | 'accordion' | 'stacked';
      hasDescription: boolean;
      hasAdditionalInfo: boolean;
      hasReviews: boolean;
    };
    relatedProducts?: { nodeId: string; count: number; columns: number };
    upsellProducts?: { nodeId: string; count: number };
  };
}

export interface CartComponent {
  id: string;
  figmaNodeId: string;
  confidence: number;
  type: 'mini-cart' | 'full-cart' | 'slide-out';
  hasQuantityControl: boolean;
  hasRemoveButton: boolean;
  hasCouponInput: boolean;
  hasProceedToCheckout: boolean;
}

export interface CheckoutComponent {
  id: string;
  figmaNodeId: string;
  confidence: number;
  layout: 'single-column' | 'two-column' | 'multi-step';
  hasBillingForm: boolean;
  hasShippingForm: boolean;
  hasOrderSummary: boolean;
  hasPaymentMethods: boolean;
}

export interface PostCardComponent {
  id: string;
  figmaNodeId: string;
  confidence: number;
  hasImage: boolean;
  hasCategory: boolean;
  hasDate: boolean;
  hasAuthor: boolean;
  hasExcerpt: boolean;
  hasReadMore: boolean;
  layout: 'horizontal' | 'vertical' | 'overlay';
}

export interface PostDetailComponent {
  id: string;
  figmaNodeId: string;
  confidence: number;
  hasFeaturedImage: boolean;
  hasAuthorBio: boolean;
  hasRelatedPosts: boolean;
  hasComments: boolean;
  hasShareButtons: boolean;
}

export interface FormComponent {
  id: string;
  figmaNodeId: string;
  name: string;
  confidence: number;
  type: 'contact' | 'checkout' | 'login' | 'register' | 'search' | 'newsletter';
  fields: FormFieldGroup;
  submitButton: {
    nodeId: string;
    text: string;
    loadingText?: string;
    successText?: string;
  };
  layout: {
    columns: number;
    fieldSpacing: number;
    labelPosition: 'top' | 'left' | 'inside';
  };
}

export interface FormFieldGroup {
  inputs?: FormInputField[];
  textareas?: FormTextareaField[];
  selects?: FormSelectField[];
  checkboxes?: FormCheckboxField[];
  radios?: FormRadioField[];
}

export interface FormInputField {
  nodeId: string;
  placeholder: string;
  label?: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password';
  required: boolean;
  validation?: string;
}

export interface FormTextareaField {
  nodeId: string;
  placeholder: string;
  label?: string;
  rows: number;
  required: boolean;
}

export interface FormSelectField {
  nodeId: string;
  label: string;
  options: string[];
  required: boolean;
}

export interface FormCheckboxField {
  nodeId: string;
  label: string;
  required: boolean;
}

export interface FormRadioField {
  nodeId: string;
  label: string;
  options: string[];
  required: boolean;
}

export interface SearchComponent {
  id: string;
  figmaNodeId: string;
  type: 'inline' | 'expanded' | 'icon-only';
  hasDropdown: boolean;
  hasCategories: boolean;
}

export interface NewsletterComponent {
  id: string;
  figmaNodeId: string;
  hasName: boolean;
  hasEmail: boolean;
  hasConsentCheckbox: boolean;
}

export interface SectionComponent {
  id: string;
  figmaNodeId: string;
  name: string;
  type: string;
  confidence: number;
  hasGrid?: boolean;
  layout: {
    fullWidth: boolean;
    hasContainer: boolean;
    padding: SpacingValues;
  };
}

export interface ContainerComponent {
  id: string;
  figmaNodeId: string;
  type: 'flex' | 'grid' | 'single';
  direction?: 'row' | 'column';
  gap?: string;
}

export interface ColumnComponent {
  id: string;
  figmaNodeId: string;
  span: number;
  width: string;
}

// ─── Design Tokens ────────────────────────────────────────

export interface ExtractedTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: Record<string, string>;
  sizing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  borders: BorderTokens;
  transitions: TransitionTokens;
  breakpoints: Record<string, string>;
  zIndex: Record<string, number | string>;
  opacity?: Record<string, number>;
  blendModes?: string[];
}

export interface ColorTokens {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  accent: Record<string, string>;
  neutral: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
  info: Record<string, string>;
  background: { body: string; surface: string; overlay: string };
  text: { primary: string; secondary: string; disabled: string; inverse: string };
  border: { default: string; hover: string; focus: string };
  ecommerce?: {
    sale: string;
    newArrival: string;
    outOfStock: string;
    inStock: string;
    price: string;
    salePrice: string;
    rating: string;
  };
}

export interface TypographyTokens {
  fontFamilies: {
    heading: FontFamilyRef;
    body: FontFamilyRef;
    mono?: FontFamilyRef;
  };
  fontSizes: Record<string, string>;
  fontWeights: Record<string, number>;
  lineHeights: Record<string, number>;
  letterSpacing: Record<string, string>;
  textStyles: {
    h1: FontStyle; h2: FontStyle; h3: FontStyle; h4: FontStyle; h5: FontStyle; h6: FontStyle;
    body: FontStyle; bodyLarge: FontStyle; bodySmall: FontStyle;
    caption: FontStyle; overline: FontStyle; button: FontStyle;
  };
}

export interface FontFamilyRef {
  name: string;
  weights: number[];
  fallback: string;
}

export interface FontStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
  textTransform?: string;
  textDecoration?: string;
}

export interface SpacingScale {
  xs: string; sm: string; md: string; lg: string; xl: string; xxl: string;
}

export interface ShadowTokens {
  sm: string; md: string; lg: string;
}

export interface BorderRadiusTokens {
  none: string; sm: string; md: string; full: string;
}

export interface BorderTokens {
  width: Record<string, string>;
  styles: Record<string, string>;
}

export interface TransitionTokens {
  duration: Record<string, string>;
  timing: Record<string, string>;
}
