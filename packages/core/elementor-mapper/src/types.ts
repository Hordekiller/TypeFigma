export interface ElementorDocument {
  type: string;
  content: ElementorNode[];
  page_settings: Record<string, unknown>;
  version: string;
}

export interface ElementorNode {
  id: string;
  elType: 'container' | 'section' | 'column' | 'widget';
  settings: Record<string, unknown>;
  elements?: ElementorNode[];
  widgetType?: string;
}

export interface GlobalSettings {
  settings: {
    color: Record<string, string>;
    typography: Record<string, TypographySetting>;
  };
}

export interface TypographySetting {
  font_family: string;
  font_size: { size: number; unit: string };
  font_weight: string;
  line_height: { size: number; unit: string };
}

export interface ElementorTemplate {
  title: string;
  type: 'header' | 'footer' | 'section' | 'page' | 'product-archive' | 'single-product';
  content: ElementorNode[];
  page_settings?: Record<string, unknown>;
}
