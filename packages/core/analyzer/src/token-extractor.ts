import type { FigmaFile, FigmaStyles, Color } from '@typefigma/figma-client';
import type {
  ExtractedTokens,
  ColorTokens,
  TypographyTokens,
  BorderTokens,
  TransitionTokens,
} from './types.js';

export class TokenExtractor {
  extract(file: FigmaFile, styles?: FigmaStyles): ExtractedTokens {
    return {
      colors: this.extractColors(file, styles),
      typography: this.extractTypography(file, styles),
      spacing: this.generateSpacingScale(),
      sizing: this.generateSizingScale(),
      borderRadius: this.generateBorderRadii(),
      shadows: this.generateShadows(styles),
      borders: this.generateBorderTokens(),
      transitions: this.generateTransitions(),
      breakpoints: this.generateBreakpoints(),
      zIndex: this.generateZIndex(),
    };
  }

  // ── Colors ─────────────────────────────────────────────

  private rgbToHex(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private extractColors(_file: FigmaFile, styles?: FigmaStyles): ColorTokens {
    const primary: Record<string, string> = {};
    const secondary: Record<string, string> = {};
    const accent: Record<string, string> = {};
    const neutral: Record<string, string> = {};
    const success: Record<string, string> = {};
    const warning: Record<string, string> = {};
    const error: Record<string, string> = {};
    const info: Record<string, string> = {};
    const ecommerceColors: Record<string, string> = {};

    if (styles?.colors) {
      for (const style of styles.colors) {
        const hex = this.rgbToHex(style.color);
        const name = style.name.toLowerCase();
        const shade = this.extractShade(name) || '500';

        if (name.includes('primary')) primary[shade] = hex;
        else if (name.includes('secondary')) secondary[shade] = hex;
        else if (name.includes('accent')) accent[shade] = hex;
        else if (name.includes('neutral') || name.includes('gray') || name.includes('grey')) neutral[shade] = hex;
        else if (name.includes('success') || name.includes('green')) success[shade] = hex;
        else if (name.includes('warning') || name.includes('yellow') || name.includes('amber')) warning[shade] = hex;
        else if (name.includes('error') || name.includes('danger') || name.includes('red')) error[shade] = hex;
        else if (name.includes('info') || name.includes('blue')) info[shade] = hex;

        if (name.includes('sale') || name.includes('discount')) ecommerceColors['sale'] = hex;
        if (name.includes('stock') || name.includes('in-stock')) ecommerceColors['inStock'] = hex;
        if (name.includes('out-of-stock')) ecommerceColors['outOfStock'] = hex;
        if (name.includes('rating') || name.includes('star')) ecommerceColors['rating'] = hex;
      }
    }

    // Fill missing scales
    this.fillColorScale(primary, '#3b82f6');
    this.fillColorScale(secondary, '#8b5cf6');
    this.fillColorScale(accent, '#f59e0b');
    this.fillColorScale(neutral, '#6b7280');
    this.fillColorScale(success, '#10b981');
    this.fillColorScale(warning, '#f59e0b');
    this.fillColorScale(error, '#ef4444');
    this.fillColorScale(info, '#3b82f6');

    return {
      primary, secondary, accent, neutral,
      success, warning, error, info,
      background: {
        body: neutral['50'] ?? '#f9fafb',
        surface: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)',
      },
      text: {
        primary: neutral['900'] ?? '#111827',
        secondary: neutral['500'] ?? '#6b7280',
        disabled: neutral['300'] ?? '#d1d5db',
        inverse: '#ffffff',
      },
      border: {
        default: neutral['200'] ?? '#e5e7eb',
        hover: neutral['300'] ?? '#d1d5db',
        focus: primary['500'] ?? '#3b82f6',
      },
      ecommerce: {
        sale: ecommerceColors['sale'] ?? '#ef4444',
        newArrival: ecommerceColors['newArrival'] ?? '#10b981',
        outOfStock: ecommerceColors['outOfStock'] ?? '#6b7280',
        inStock: ecommerceColors['inStock'] ?? '#10b981',
        price: '#111827',
        salePrice: ecommerceColors['salePrice'] ?? '#ef4444',
        rating: ecommerceColors['rating'] ?? '#f59e0b',
      } as ColorTokens['ecommerce'],
    };
  }

  private fillColorScale(scale: Record<string, string>, baseHex: string): void {
    if (!scale['50']) scale['50'] = this.lighten(baseHex, 0.95);
    if (!scale['100']) scale['100'] = this.lighten(baseHex, 0.9);
    if (!scale['200']) scale['200'] = this.lighten(baseHex, 0.75);
    if (!scale['300']) scale['300'] = this.lighten(baseHex, 0.6);
    if (!scale['400']) scale['400'] = this.lighten(baseHex, 0.4);
    if (!scale['500']) scale['500'] = baseHex;
    if (!scale['600']) scale['600'] = this.darken(baseHex, 0.2);
    if (!scale['700']) scale['700'] = this.darken(baseHex, 0.4);
    if (!scale['800']) scale['800'] = this.darken(baseHex, 0.6);
    if (!scale['900']) scale['900'] = this.darken(baseHex, 0.8);
  }

  private lighten(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.round((num >> 16) + (255 - (num >> 16)) * amount));
    const g = Math.min(255, Math.round(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
    const b = Math.min(255, Math.round((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  private darken(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.round((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.round(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.round((num & 0x0000FF) * (1 - amount)));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  private extractShade(name: string): string | null {
    const match = name.match(/(\d{2,3})$/);
    return match?.[1] ?? null;
  }

  // ── Typography ─────────────────────────────────────────

  private extractTypography(_file: FigmaFile, styles?: FigmaStyles): TypographyTokens {
    const textStyles: TypographyTokens['textStyles'] = {
      h1: this.makeTextStyle(48, 700, '1.2', '-0.02em'),
      h2: this.makeTextStyle(36, 700, '1.25', '-0.02em'),
      h3: this.makeTextStyle(30, 600, '1.3', '-0.01em'),
      h4: this.makeTextStyle(24, 600, '1.35', '-0.01em'),
      h5: this.makeTextStyle(20, 600, '1.4', '0'),
      h6: this.makeTextStyle(16, 600, '1.5', '0'),
      body: this.makeTextStyle(16, 400, '1.6', '0'),
      bodyLarge: this.makeTextStyle(18, 400, '1.6', '0'),
      bodySmall: this.makeTextStyle(14, 400, '1.5', '0'),
      caption: this.makeTextStyle(12, 400, '1.4', '0.025em'),
      overline: this.makeTextStyle(12, 600, '1.2', '0.05em'),
      button: this.makeTextStyle(16, 600, '1', '0'),
    };

    if (styles?.textStyles) {
      for (const style of styles.textStyles) {
        const name = style.name.toLowerCase();
        const entry = {
          fontFamily: style.fontFamily || 'Inter',
          fontSize: `${style.fontSize}px`,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight ? `${style.lineHeight}px` : '1.5',
          letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : '0',
        };

        if (name.includes('h1') || name === 'heading 1') textStyles.h1 = entry;
        else if (name.includes('h2') || name === 'heading 2') textStyles.h2 = entry;
        else if (name.includes('h3') || name === 'heading 3') textStyles.h3 = entry;
        else if (name.includes('h4') || name === 'heading 4') textStyles.h4 = entry;
        else if (name.includes('h5') || name === 'heading 5') textStyles.h5 = entry;
        else if (name.includes('h6') || name === 'heading 6') textStyles.h6 = entry;
        else if (name.includes('body') || name.includes('paragraph') || name === 'p') textStyles.body = entry;
        else if (name.includes('caption') || name.includes('small')) textStyles.caption = entry;
        else if (name.includes('button') || name.includes('btn')) textStyles.button = entry;
      }
    }

    return {
      fontFamilies: {
        heading: { name: 'Inter', weights: [300, 400, 500, 600, 700], fallback: '-apple-system, system-ui, sans-serif' },
        body: { name: 'Inter', weights: [300, 400, 500, 600, 700], fallback: '-apple-system, system-ui, sans-serif' },
      },
      fontSizes: {
        xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
        xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
        '5xl': '3rem', '6xl': '3.75rem',
      },
      fontWeights: {
        thin: 100, light: 300, normal: 400, medium: 500,
        semibold: 600, bold: 700, black: 900,
      },
      lineHeights: {
        none: 1, tight: 1.25, snug: 1.375, normal: 1.5,
        relaxed: 1.625, loose: 2,
      },
      letterSpacing: {
        tighter: '-0.05em', tight: '-0.025em', normal: '0',
        wide: '0.025em', wider: '0.05em', widest: '0.1em',
      },
      textStyles,
    };
  }

  private makeTextStyle(fontSize: number, fontWeight: number, lineHeight: string, letterSpacing: string) {
    return {
      fontFamily: 'Inter',
      fontSize: `${fontSize}px`,
      fontWeight,
      lineHeight,
      letterSpacing,
    };
  }

  // ── Spacing ────────────────────────────────────────────

  private generateSpacingScale(): Record<string, string> {
    return {
      '0': '0', 'px': '1px', '0.5': '0.125rem', '1': '0.25rem',
      '1.5': '0.375rem', '2': '0.5rem', '2.5': '0.625rem', '3': '0.75rem',
      '3.5': '0.875rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem',
      '7': '1.75rem', '8': '2rem', '9': '2.25rem', '10': '2.5rem',
      '11': '2.75rem', '12': '3rem', '14': '3.5rem', '16': '4rem',
      '20': '5rem', '24': '6rem', '28': '7rem', '32': '8rem',
      '36': '9rem', '40': '10rem', '44': '11rem', '48': '12rem',
      '52': '13rem', '56': '14rem', '60': '15rem', '64': '16rem',
      '72': '18rem', '80': '20rem', '96': '24rem',
    };
  }

  private generateSizingScale(): Record<string, string> {
    const sizing = this.generateSpacingScale();
    return {
      ...sizing,
      auto: 'auto',
      full: '100%',
      screen: '100vh',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
    };
  }

  // ── Border Radius ─────────────────────────────────────

  private generateBorderRadii(): Record<string, string> {
    return {
      none: '0', sm: '0.125rem', default: '0.25rem', md: '0.375rem',
      lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem',
      full: '9999px',
    };
  }

  // ── Shadows ────────────────────────────────────────────

  private generateShadows(_styles?: FigmaStyles): Record<string, string> {
    return {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      card: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      button: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      buttonHover: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    };
  }

  // ── Borders ────────────────────────────────────────────

  private generateBorderTokens(): BorderTokens {
    return {
      width: { '0': '0', default: '1px', '2': '2px', '4': '4px', '8': '8px' },
      styles: { solid: 'solid', dashed: 'dashed', dotted: 'dotted', double: 'double', none: 'none' },
    };
  }

  // ── Transitions ────────────────────────────────────────

  private generateTransitions(): TransitionTokens {
    return {
      duration: { fast: '150ms', base: '200ms', slow: '300ms', slower: '500ms' },
      timing: {
        ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out',
        easeInOut: 'ease-in-out', linear: 'linear',
      },
    };
  }

  // ── Breakpoints ────────────────────────────────────────

  private generateBreakpoints(): Record<string, string> {
    return {
      sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
    };
  }

  // ── Z-Index ────────────────────────────────────────────

  private generateZIndex(): Record<string, number | string> {
    return { '0': 0, '10': 10, '20': 20, '30': 30, '40': 40, '50': 50, auto: 'auto' };
  }
}
