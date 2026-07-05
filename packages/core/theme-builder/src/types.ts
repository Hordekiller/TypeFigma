export interface ThemeConfig {
  name: string;
  description: string;
  version: string;
  author: string;
  authorUri?: string;
  themeUri?: string;
  license?: string;
  licenseUri?: string;
  tags?: string[];
  textDomain: string;
  requiresPhp?: string;
  requiresWp?: string;
  isChildTheme?: boolean;
  parentThemeFolder?: string;
  includeWooCommerce?: boolean;
  woocommerceFeatures?: {
    includeVariations?: boolean;
    includeGroupedProducts?: boolean;
    includeMiniCart?: boolean;
  };
}

// Re-export existing types for backward compatibility
export type { ThemeOptions, ThemeFile, ThemeFontConfig, FontOption } from './wordpress-files.js';
