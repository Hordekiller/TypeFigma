import type { FigmaFile, FigmaStyles, Color, SceneNode } from '@typefigma/figma-client';
import type {
  ExtractedTokens,
  ColorTokens,
  TypographyTokens,
  FontStyle,
  BorderTokens,
  TransitionTokens,
} from './types.js';

interface ColorUsage {
  hex: string;
  count: number;
  contexts: string[];
}

interface FontUsage {
  family: string;
  weight: number;
  size: number;
  count: number;
}

export class TokenExtractor {
  extract(file: FigmaFile, styles?: FigmaStyles): ExtractedTokens {
    const allNodes = this.flattenTree(file.document);

    const colorUsages = this.scanColorUsage(allNodes, styles);
    const fontUsages = this.scanFontUsage(allNodes, styles);
    const spacingValues = this.scanSpacingValues(allNodes);
    const borderRadiusValues = this.scanBorderRadii(allNodes);

    return {
      colors: this.buildColorTokens(colorUsages, styles),
      typography: this.buildTypographyTokens(fontUsages, styles),
      spacing: this.buildSpacingScale(spacingValues),
      sizing: this.buildSizingScale(),
      borderRadius: this.buildBorderRadii(borderRadiusValues),
      shadows: this.generateShadows(allNodes, styles),
      borders: this.generateBorderTokens(),
      transitions: this.generateTransitions(),
      breakpoints: this.generateBreakpoints(),
      zIndex: this.generateZIndex(),
    };
  }

  private flattenTree(node: { children?: SceneNode[] }): SceneNode[] {
    const result: SceneNode[] = [];
    const walk = (n: { children?: SceneNode[] }) => {
      if (n.children) {
        for (const child of n.children) {
          result.push(child);
          walk(child);
        }
      }
    };
    walk(node);
    return result;
  }


  private scanColorUsage(nodes: SceneNode[], styles?: FigmaStyles): ColorUsage[] {
    const usageMap = new Map<string, ColorUsage>();

    const record = (hex: string, context: string) => {
      const existing = usageMap.get(hex);
      if (existing) {
        existing.count++;
        if (!existing.contexts.includes(context)) existing.contexts.push(context);
      } else {
        usageMap.set(hex, { hex, count: 1, contexts: [context] });
      }
    };

    for (const node of nodes) {
      if (!node.visible) continue;

      if (node.fills) {
        for (const fill of node.fills) {
          if (fill.visible === false) continue;
          if (fill.type === 'SOLID' && fill.color) {
            const hex = this.rgbToHex(fill.color);
            const alpha = fill.color.a;
            if (alpha >= 0.01) {
              record(hex, alpha < 1 ? 'fill-transparent' : 'fill');
            }
          } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL'
            || fill.type === 'GRADIENT_ANGULAR' || fill.type === 'GRADIENT_DIAMOND') {
            if (fill.gradientStops) {
              for (const stop of fill.gradientStops) {
                if (stop.color) {
                  const hex = this.rgbToHex(stop.color);
                  if (stop.color.a >= 0.01) {
                    record(hex, `gradient-${fill.type.toLowerCase()}`);
                  }
                }
              }
            }
          }
        }
      }

      if (node.strokes) {
        for (const stroke of node.strokes) {
          if (stroke.visible !== false && stroke.type === 'SOLID' && stroke.color) {
            const hex = this.rgbToHex(stroke.color);
            record(hex, 'stroke');
          }
        }
      }

      if (node.style?.fills) {
        for (const fill of node.style.fills) {
          if (fill.type === 'SOLID' && fill.color) {
            const hex = this.rgbToHex(fill.color);
            record(hex, 'text');
          }
        }
      }

      if (node.backgroundColor) {
        const hex = this.rgbToHex(node.backgroundColor);
        if (node.backgroundColor.a > 0) {
          record(hex, 'background');
        }
      }
    }

    if (styles?.colors) {
      for (const style of styles.colors) {
        const hex = this.rgbToHex(style.color);
        record(hex, `style:${style.name}`);
      }
    }

    return [...usageMap.values()].sort((a, b) => b.count - a.count);
  }

  private buildColorTokens(usages: ColorUsage[], styles?: FigmaStyles): ColorTokens {
    const primary: Record<string, string> = {};
    const secondary: Record<string, string> = {};
    const accent: Record<string, string> = {};
    const neutral: Record<string, string> = {};
    const success: Record<string, string> = {};
    const warning: Record<string, string> = {};
    const error: Record<string, string> = {};
    const info: Record<string, string> = {};

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
      }
    }

    const sortedByUsage = usages.filter(u => u.count > 0);

    if (!primary['500'] && sortedByUsage.length > 0) {
      const mostUsed = sortedByUsage[0].hex;
      this.fillColorScale(primary, mostUsed);
    } else {
      this.fillColorScale(primary, primary['500'] || '#3b82f6');
    }

    if (!secondary['500'] && sortedByUsage.length > 1) {
      this.fillColorScale(secondary, sortedByUsage[1].hex);
    } else {
      this.fillColorScale(secondary, secondary['500'] || '#8b5cf6');
    }

    if (!accent['500'] && sortedByUsage.length > 2) {
      this.fillColorScale(accent, sortedByUsage[2].hex);
    } else {
      this.fillColorScale(accent, accent['500'] || '#f59e0b');
    }

    this.fillColorScale(neutral, neutral['500'] || '#6b7280');
    this.fillColorScale(success, success['500'] || '#10b981');
    this.fillColorScale(warning, warning['500'] || '#f59e0b');
    this.fillColorScale(error, error['500'] || '#ef4444');
    this.fillColorScale(info, info['500'] || '#3b82f6');

    const textPrimaryColor = usages.find(u =>
      u.contexts.includes('text') && u.hex !== '#ffffff' && u.hex !== '#000000')?.hex
      ?? neutral['900'] ?? '#111827';
    const textSecondaryColor = usages.find(u =>
      u.contexts.includes('text') && u.hex !== textPrimaryColor)?.hex
      ?? neutral['500'] ?? '#6b7280';
    const bgColor = usages.find(u =>
      u.contexts.includes('background') || u.contexts.includes('fill'))?.hex
      ?? neutral['50'] ?? '#f9fafb';

    return {
      primary, secondary, accent, neutral,
      success, warning, error, info,
      background: {
        body: bgColor,
        surface: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)',
      },
      text: {
        primary: textPrimaryColor,
        secondary: textSecondaryColor,
        disabled: neutral['300'] ?? '#d1d5db',
        inverse: '#ffffff',
      },
      border: {
        default: neutral['200'] ?? '#e5e7eb',
        hover: neutral['300'] ?? '#d1d5db',
        focus: primary['500'] ?? '#3b82f6',
      },
      ecommerce: {
        sale: '#ef4444',
        newArrival: '#10b981',
        outOfStock: '#6b7280',
        inStock: '#10b981',
        price: '#111827',
        salePrice: '#ef4444',
        rating: '#f59e0b',
      },
    };
  }


  private scanFontUsage(nodes: SceneNode[], styles?: FigmaStyles): FontUsage[] {
    const usageMap = new Map<string, FontUsage>();

    const record = (family: string, weight: number, size: number) => {
      const key = `${family}:${weight}:${Math.round(size)}`;
      const existing = usageMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        usageMap.set(key, { family, weight, size, count: 1 });
      }
    };

    for (const node of nodes) {
      if (node.type === 'TEXT' && node.style) {
        const s = node.style;
        record(
          s.fontFamily || 'Inter',
          s.fontWeight || 400,
          s.fontSize || 16,
        );
      }
    }

    if (styles?.textStyles) {
      for (const style of styles.textStyles) {
        record(
          style.fontFamily || 'Inter',
          style.fontWeight || 400,
          style.fontSize || 16,
        );
      }
    }

    return [...usageMap.values()].sort((a, b) => b.count - a.count);
  }

  private buildTypographyTokens(fontUsages: FontUsage[], styles?: FigmaStyles): TypographyTokens {
    const mainFont = fontUsages.length > 0 ? fontUsages[0].family : 'Inter';

    const textStyles = {} as TypographyTokens['textStyles'];

    if (styles?.textStyles) {
      for (const style of styles.textStyles) {
        const name = style.name.toLowerCase();
        const entry: FontStyle = {
          fontFamily: style.fontFamily || mainFont,
          fontSize: `${style.fontSize}px`,
          fontWeight: style.fontWeight,
          lineHeight: typeof style.lineHeight === 'number'
            ? `${style.lineHeight}px`
            : style.lineHeight?.value ? `${style.lineHeight.value}${style.lineHeight.unit === 'PIXELS' ? 'px' : '%'}` : '1.5',
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

    textStyles.h1 ??= this.makeTextStyle(mainFont, 48, 700, '1.2', '-0.02em');
    textStyles.h2 ??= this.makeTextStyle(mainFont, 36, 700, '1.25', '-0.02em');
    textStyles.h3 ??= this.makeTextStyle(mainFont, 30, 600, '1.3', '-0.01em');
    textStyles.h4 ??= this.makeTextStyle(mainFont, 24, 600, '1.35', '-0.01em');
    textStyles.h5 ??= this.makeTextStyle(mainFont, 20, 600, '1.4', '0');
    textStyles.h6 ??= this.makeTextStyle(mainFont, 16, 600, '1.5', '0');
    textStyles.body ??= this.makeTextStyle(mainFont, 16, 400, '1.6', '0');
    textStyles.bodyLarge ??= this.makeTextStyle(mainFont, 18, 400, '1.6', '0');
    textStyles.bodySmall ??= this.makeTextStyle(mainFont, 14, 400, '1.5', '0');
    textStyles.caption ??= this.makeTextStyle(mainFont, 12, 400, '1.4', '0.025em');
    textStyles.overline ??= this.makeTextStyle(mainFont, 12, 600, '1.2', '0.05em');
    textStyles.button ??= this.makeTextStyle(mainFont, 16, 600, '1', '0');

    if (!textStyles.h1 && fontUsages.length > 0) {
      const largest = fontUsages[0];
      const h1Size = largest.size >= 36 ? largest.size : Math.min(largest.size * 2, 72);
      textStyles.h1 = this.makeTextStyle(mainFont, h1Size, largest.weight, '1.2', '-0.02em');
      textStyles.body = this.makeTextStyle(mainFont,
        this.getMostCommonSize(fontUsages.flatMap(f => [f.size])),
        this.getMostCommonWeight(fontUsages.flatMap(f => [f.weight])),
        '1.6', '0',
      );
    }

    return {
      fontFamilies: {
        heading: { name: mainFont, weights: [300, 400, 500, 600, 700], fallback: '-apple-system, system-ui, sans-serif' },
        body: { name: mainFont, weights: [300, 400, 500, 600, 700], fallback: '-apple-system, system-ui, sans-serif' },
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


  private scanSpacingValues(nodes: SceneNode[]): number[] {
    const values: number[] = [];
    for (const node of nodes) {
      if (node.paddingTop != null) values.push(node.paddingTop);
      if (node.paddingRight != null) values.push(node.paddingRight);
      if (node.paddingBottom != null) values.push(node.paddingBottom);
      if (node.paddingLeft != null) values.push(node.paddingLeft);
      if (node.itemSpacing != null) values.push(node.itemSpacing);
    }
    return [...new Set(values)].sort((a, b) => a - b);
  }

  private buildSpacingScale(figmaValues: number[]): Record<string, string> {
    const scale: Record<string, string> = {
      '0': '0', 'px': '1px', '0.5': '0.125rem', '1': '0.25rem',
    };

    if (figmaValues.length > 0) {
      for (const val of figmaValues) {
        const rem = val / 16;
        const key = rem <= 1 ? `${rem}` : `${Math.round(rem * 4) / 4}`;
        scale[key] = `${rem}rem`;
      }
    }

    return {
      ...scale,
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


  private scanBorderRadii(nodes: SceneNode[]): number[] {
    const values: number[] = [];
    for (const node of nodes) {
      if (node.cornerRadius && typeof node.cornerRadius === 'number') {
        values.push(node.cornerRadius);
      }
    }
    return [...new Set(values)].sort((a, b) => a - b);
  }

  private buildBorderRadii(figmaValues: number[]): Record<string, string> {
    const radii: Record<string, string> = {
      none: '0', sm: '0.125rem', default: '0.25rem',
    };

    if (figmaValues.length > 0) {
      for (const val of figmaValues) {
        const rem = val / 16;
        const key = rem <= 0.5 ? 'sm' : rem <= 1 ? 'md' : rem <= 1.5 ? 'lg' : rem <= 2 ? 'xl' : `${val}px`;
        if (!radii[key]) radii[key] = `${rem}rem`;
      }
    }

    return {
      ...radii,
      md: radii['md'] || '0.375rem',
      lg: radii['lg'] || '0.5rem',
      xl: radii['xl'] || '0.75rem',
      '2xl': '1rem', '3xl': '1.5rem', full: '9999px',
    };
  }


  private generateShadows(nodes: SceneNode[], _styles?: FigmaStyles): Record<string, string> {
    const shadows: Record<string, string> = { none: 'none' };
    const dedup = new Set<string>();

    for (const node of nodes) {
      if (node.effects) {
        for (const effect of node.effects) {
          if (effect.visible !== false && (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW')) {
            const offsetX = effect.offset?.x ?? 0;
            const offsetY = effect.offset?.y ?? 0;
            const blur = effect.radius ?? 0;
            const color = effect.color ? this.rgbaToString(effect.color) : 'rgba(0,0,0,0.1)';
            const spread = effect.spread ?? 0;
            const prefix = effect.type === 'INNER_SHADOW' ? 'inset ' : '';
            const cssShadow = `${prefix}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;

            if (dedup.has(cssShadow)) continue;
            dedup.add(cssShadow);

            if (!shadows['from-figma']) {
              shadows['from-figma'] = cssShadow;
            } else {
              shadows[`shadow-${node.id.slice(-4)}`] = cssShadow;
            }
          }
        }
      }
    }

    return {
      ...shadows,
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


  private rgbToHex(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private rgbaToString(color: Color): string {
    return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;
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
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  private darken(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.round((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.round(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.round((num & 0x0000FF) * (1 - amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  private extractShade(name: string): string | null {
    const match = name.match(/(\d{2,3})$/);
    return match?.[1] ?? null;
  }

  private makeTextStyle(fontFamily: string, fontSize: number, fontWeight: number, lineHeight: string, letterSpacing: string) {
    return {
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      lineHeight,
      letterSpacing,
    };
  }

  private getMostCommonSize(sizes: number[]): number {
    if (sizes.length === 0) return 16;
    const freq = new Map<number, number>();
    for (const s of sizes) freq.set(s, (freq.get(s) ?? 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  private getMostCommonWeight(weights: number[]): number {
    if (weights.length === 0) return 400;
    const freq = new Map<number, number>();
    for (const w of weights) freq.set(w, (freq.get(w) ?? 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  private buildSizingScale(): Record<string, string> {
    return {
      '0': '0', 'px': '1px', '0.5': '0.125rem', '1': '0.25rem',
      '2': '0.5rem', '3': '0.75rem', '4': '1rem', '5': '1.25rem',
      '6': '1.5rem', '8': '2rem', '10': '2.5rem', '12': '3rem',
      '14': '3.5rem', '16': '4rem', '20': '5rem', '24': '6rem',
      auto: 'auto', full: '100%', screen: '100vh', min: 'min-content',
      max: 'max-content', fit: 'fit-content',
    };
  }

  private generateBorderTokens(): BorderTokens {
    return {
      width: { '0': '0', default: '1px', '2': '2px', '4': '4px', '8': '8px' },
      styles: { solid: 'solid', dashed: 'dashed', dotted: 'dotted', double: 'double', none: 'none' },
    };
  }

  private generateTransitions(): TransitionTokens {
    return {
      duration: { fast: '150ms', base: '200ms', slow: '300ms', slower: '500ms' },
      timing: {
        ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out',
        easeInOut: 'ease-in-out', linear: 'linear',
      },
    };
  }

  private generateBreakpoints(): Record<string, string> {
    return {
      sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
    };
  }

  private generateZIndex(): Record<string, number | string> {
    return { '0': 0, '10': 10, '20': 20, '30': 30, '40': 40, '50': 50, auto: 'auto' };
  }
}
