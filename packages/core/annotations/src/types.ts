export type ComponentRole =
  | 'header' | 'footer' | 'nav-menu' | 'hero' | 'cta'
  | 'button' | 'login-form' | 'search-form'
  | 'slider' | 'carousel'
  | 'product-card' | 'product-detail' | 'product-grid'
  | 'cart' | 'checkout'
  | 'blog-list' | 'blog-post'
  | 'user-profile' | 'sidebar'
  | 'gallery' | 'testimonial' | 'pricing-table'
  | 'contact-form' | 'newsletter' | 'breadcrumb'
  | 'social-icons' | 'container' | 'section' | 'column'
  | 'text' | 'image'
  | 'unknown';

export type AnnotationSource = 'auto' | 'user';

export interface Annotation {
  figmaNodeId: string;
  domSelector: string;
  role: ComponentRole;
  source: AnnotationSource;
  confidence: number;
  props?: Record<string, string | number | boolean>;
  updatedAt: string;
}

export interface AnnotationSet {
  schemaVersion: 1;
  figmaFileKey: string;
  annotations: Annotation[];
  createdAt: string;
  updatedAt: string;
}
