import type { FigmaFile, FigmaStyles, SceneNode, Color } from '@typefigma/figma-client';
import type {
  ExtractedTokens,
  ColorTokens,
  TypographyTokens,
  ShadowTokens,
  BorderRadiusTokens,
} from './types.js';

export class TokenExtractor {
  extract(file: FigmaFile, styles?: FigmaStyles): ExtractedTokens {
    const colors = this.extractColors(file, styles);
    const typography = this.extractTypography(file, styles);
    const spacing = this.extractSpacing(file);
    const shadows = this.extractShadows(file, styles);
    const borderRadius = this.extractBorderRadius(file);

    return { colors, typography, spacing, shadows, borderRadius };
  }

  private rgbToHex(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private extractColors(file: FigmaFile, styles?: FigmaStyles): ColorTokens {
    const primary: Record<string, string> = {};
    const secondary: Record<string, string> = {};
    const neutral: Record<string, string> = {};

    if (styles?.colors) {
      for (const style of styles.colors) {
        const hex = this.rgbToHex(style.color);
        const name = style.name.toLowerCase();

        if (name.includes('primary')) {
          const shade = this.extractShade(name) || '500';
          primary[shade] = hex;
        } else if (name.includes('secondary')) {
          const shade = this.extractShade(name) || '500';
          secondary[shade] = hex;
        } else if (name.includes('neutral') || name.includes('gray') || name.includes('grey')) {
          const shade = this.extractShade(name) || '500';
          neutral[shade] = hex;
        }
      }
    }

    if (Object.keys(primary).length === 0) primary['500'] = '#3b82f6';
    if (Object.keys(secondary).length === 0) secondary['500'] = '#8b5cf6';
    if (Object.keys(neutral).length === 0) {
      neutral['50'] = '#f9fafb';
      neutral['100'] = '#f3f4f6';
      neutral['200'] = '#e5e7eb';
      neutral['300'] = '#d1d5db';
      neutral['400'] = '#9ca3af';
      neutral['500'] = '#6b7280';
      neutral['600'] = '#4b5563';
      neutral['700'] = '#374151';
      neutral['800'] = '#1f2937';
      neutral['900'] = '#111827';
    }

    return {
      primary,
      secondary,
      neutral,
      semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    };
  }

  private extractShade(name: string): string | null {
    const match = name.match(/(\d{2,3})$/);
    return match?.[1] ?? null;
  }

  private extractTypography(file: FigmaFile, styles?: FigmaStyles): TypographyTokens {
    const typography: TypographyTokens = {
      h1: { fontFamily: 'Inter', fontSize: '48px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' },
      h2: { fontFamily: 'Inter', fontSize: '36px', fontWeight: 700, lineHeight: '1.25', letterSpacing: '-0.02em' },
      h3: { fontFamily: 'Inter', fontSize: '30px', fontWeight: 600, lineHeight: '1.3', letterSpacing: '-0.01em' },
      h4: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 600, lineHeight: '1.35', letterSpacing: '-0.01em' },
      body: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 400, lineHeight: '1.6', letterSpacing: '0' },
      small: { fontFamily: 'Inter', fontSize: '14px', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
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

        if (name.includes('h1') || name.includes('heading 1')) typography.h1 = entry;
        else if (name.includes('h2') || name.includes('heading 2')) typography.h2 = entry;
        else if (name.includes('h3') || name.includes('heading 3')) typography.h3 = entry;
        else if (name.includes('h4') || name.includes('heading 4')) typography.h4 = entry;
        else if (name.includes('body') || name.includes('paragraph')) typography.body = entry;
        else if (name.includes('small') || name.includes('caption')) typography.small = entry;
      }
    }

    return typography;
  }

  private extractSpacing(file: FigmaFile): { xs: string; sm: string; md: string; lg: string; xl: string; xxl: string } {
    const spacings = new Set<number>();

    const collectSpacing = (nodes: SceneNode[]) => {
      for (const node of nodes) {
        if (node.itemSpacing) spacings.add(node.itemSpacing);
        if (node.paddingTop) spacings.add(node.paddingTop);
        if (node.paddingBottom) spacings.add(node.paddingBottom);
        if (node.paddingLeft) spacings.add(node.paddingLeft);
        if (node.paddingRight) spacings.add(node.paddingRight);
        if (node.children) collectSpacing(node.children);
      }
    };

    if (file.document.children) {
      for (const page of file.document.children) {
        if (page.children) collectSpacing(page.children);
      }
    }

    const sorted = Array.from(spacings).sort((a, b) => a - b);

    return {
      xs: sorted[0] ? `${sorted[0]}px` : '4px',
      sm: sorted[1] ? `${sorted[1]}px` : '8px',
      md: sorted[2] ? `${sorted[2]}px` : '16px',
      lg: sorted[3] ? `${sorted[3]}px` : '24px',
      xl: sorted[4] ? `${sorted[4]}px` : '32px',
      xxl: sorted[5] ? `${sorted[5]}px` : '64px',
    };
  }

  private extractShadows(file: FigmaFile, styles?: FigmaStyles): ShadowTokens {
    return {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    };
  }

  private extractBorderRadius(file: FigmaFile): BorderRadiusTokens {
    return {
      none: '0',
      sm: '4px',
      md: '8px',
      full: '9999px',
    };
  }
}
