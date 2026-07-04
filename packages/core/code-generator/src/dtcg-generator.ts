import type { ExtractedTokens } from '@typefigma/analyzer';

export interface DtcgTokenGroup {
  [key: string]: DtcgTokenGroup | DtcgToken;
}

export interface DtcgToken {
  $value: unknown;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

export interface DtcgDocument {
  $schema?: string;
  $version?: string;
  $description?: string;
  [key: string]: unknown;
}

export interface StyleDictionaryOutput {
  [key: string]: unknown;
}

export function pxToRem(px: number, base: number = 16): string {
  return `${px / base}rem`;
}

export function parseUnitValue(val: string): { value: number; unit: string } | null {
  const match = val.trim().match(/^(-?\d+(?:\.\d+)?)\s*(px|rem|em|%|vh|vw|cm|mm|in|pt|pc|ch|ex)?$/);
  if (!match) return null;
  return { value: parseFloat(match[1]), unit: match[2] || 'px' };
}

export function toDtcgDimension(val: string): { value: number; unit: string } | string {
  const parsed = parseUnitValue(val);
  if (parsed) return parsed;
  return val;
}

export function hexToRgba(hex: string): string {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = (parseInt(hex.slice(6, 8), 16) / 255).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `#${hex}`;
}

export function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return rgba;
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  if (match[4] && parseFloat(match[4]) < 1) {
    const a = Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}${a}`;
  }
  return `#${r}${g}${b}`;
}

export class DtcgGenerator {
  private tokens: ExtractedTokens;

  constructor(tokens: ExtractedTokens) {
    this.tokens = tokens;
  }

  generateDtcg(): DtcgDocument {
    const doc: DtcgDocument = {
      $schema: 'https://design-tokens.org/format/2025-10',
      $version: '2025-10',
      $description: `Design tokens generated from Figma analysis`,
      color: { ...this.generateColorTokens(), ...this.generateBackgroundTokens(), ...this.generateTextTokens(), ...this.generateBorderColorTokens() },
      dimension: this.generateDimensionTokens(),
      fontFamily: this.generateFontFamilyTokens(),
      fontWeight: this.generateFontWeightTokens(),
      fontSize: this.generateFontSizeTokens(),
      lineHeight: this.generateLineHeightTokens(),
      letterSpacing: this.generateLetterSpacingTokens(),
      borderRadius: this.generateBorderRadiusTokens(),
      shadow: this.generateShadowTokens(),
      border: this.generateBorderTokens(),
      transition: this.generateTransitionTokens(),
      duration: this.generateDurationTokens(),
      cubicBezier: this.generateCubicBezierTokens(),
    };

    if (this.tokens.colors.ecommerce) {
      (doc as Record<string, unknown>).ecommerce = this.generateEcommerceTokens();
    }

    const typographyTokens = this.generateDtcgsWithTypography(this.tokens);
    if (Object.keys(typographyTokens).length > 0) {
      (doc as Record<string, unknown>).typography = typographyTokens;
    }

    return doc;
  }

  generateStyleDictionary(): StyleDictionaryOutput {
    const dtcg = this.generateDtcg();
    return this.transformDtcgToStyleDictionary(dtcg);
  }

  toJSON(pretty: boolean = true): string {
    return JSON.stringify(this.generateDtcg(), null, pretty ? 2 : undefined);
  }

  private generateColorTokens(): Record<string, unknown> {
    const c = this.tokens.colors;
    const result: Record<string, DtcgTokenGroup> = {};

    for (const [groupName, shades] of Object.entries({ primary: c.primary, secondary: c.secondary, accent: c.accent, neutral: c.neutral, success: c.success, warning: c.warning, error: c.error, info: c.info })) {
      if (!shades || Object.keys(shades).length === 0) continue;
      const group: Record<string, DtcgToken> = {};
      for (const [shade, hex] of Object.entries(shades)) {
        group[shade] = { $value: hex, $type: 'color', $description: `${groupName} ${shade}` };
      }
      result[groupName] = group;
    }

    return result;
  }

  private generateBackgroundTokens(): Record<string, unknown> {
    const bg = this.tokens.colors.background;
    return {
      background: {
        body: { $value: bg.body, $type: 'color' },
        surface: { $value: bg.surface, $type: 'color' },
        overlay: { $value: bg.overlay, $type: 'color' },
      },
    };
  }

  private generateTextTokens(): Record<string, unknown> {
    const t = this.tokens.colors.text;
    return {
      text: {
        primary: { $value: t.primary, $type: 'color' },
        secondary: { $value: t.secondary, $type: 'color' },
        disabled: { $value: t.disabled, $type: 'color' },
        inverse: { $value: t.inverse, $type: 'color' },
      },
    };
  }

  private generateBorderColorTokens(): Record<string, unknown> {
    const b = this.tokens.colors.border;
    return {
      border: {
        default: { $value: b.default, $type: 'color' },
        hover: { $value: b.hover, $type: 'color' },
        focus: { $value: b.focus, $type: 'color' },
      },
    };
  }

  private generateDimensionTokens(): Record<string, unknown> {
    const result: Record<string, DtcgToken | DtcgTokenGroup> = {};

    for (const [key, val] of Object.entries(this.tokens.spacing)) {
      result[`spacing-${key}`] = { $value: toDtcgDimension(val), $type: 'dimension' };
    }

    for (const [key, val] of Object.entries(this.tokens.sizing)) {
      if (typeof val === 'string') {
        result[`size-${key}`] = { $value: toDtcgDimension(val), $type: 'dimension' };
      }
    }

    if (this.tokens.breakpoints) {
      const bpGroup: Record<string, DtcgToken> = {};
      for (const [bp, val] of Object.entries(this.tokens.breakpoints)) {
        bpGroup[bp] = { $value: typeof val === 'string' ? toDtcgDimension(val) : val, $type: 'dimension' };
      }
      result.breakpoint = bpGroup;
    }

    return result;
  }

  private generateFontFamilyTokens(): Record<string, unknown> {
    const tf = this.tokens.typography.fontFamilies;
    const result: Record<string, DtcgToken> = {};

    for (const [key, ff] of Object.entries(tf)) {
      const fonts = ff.fallback ? [ff.name, ...ff.fallback.split(',').map(f => f.trim())] : [ff.name];
      result[key] = { $value: fonts, $type: 'fontFamily' };
    }

    return result;
  }

  private generateFontWeightTokens(): Record<string, unknown> {
    const result: Record<string, DtcgToken> = {};
    for (const [key, val] of Object.entries(this.tokens.typography.fontWeights)) {
      result[key] = { $value: typeof val === 'number' ? val : parseInt(val), $type: 'fontWeight' };
    }
    return result;
  }

  private generateFontSizeTokens(): Record<string, unknown> {
    const result: Record<string, DtcgToken> = {};

    for (const [key, val] of Object.entries(this.tokens.typography.fontSizes)) {
      result[key] = { $value: toDtcgDimension(val), $type: 'dimension' };
    }

    const ts = this.tokens.typography.textStyles;
    if (ts) {
      for (const [styleName, style] of Object.entries(ts)) {
        if (style?.fontSize) {
          result[styleName] = { $value: toDtcgDimension(style.fontSize), $type: 'dimension' };
        }
      }
    }

    return result;
  }

  private generateLineHeightTokens(): Record<string, unknown> {
    const result: Record<string, DtcgToken> = {};
    for (const [key, val] of Object.entries(this.tokens.typography.lineHeights)) {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      result[key] = { $value: isNaN(num) ? val : num, $type: 'number' };
    }
    return result;
  }

  private generateLetterSpacingTokens(): Record<string, unknown> {
    const result: Record<string, DtcgToken> = {};
    for (const [key, val] of Object.entries(this.tokens.typography.letterSpacing)) {
      result[key] = { $value: toDtcgDimension(val), $type: 'dimension' };
    }
    return result;
  }

  private generateBorderRadiusTokens(): Record<string, unknown> {
    const result: Record<string, DtcgToken> = {};
    for (const [key, val] of Object.entries(this.tokens.borderRadius)) {
      result[key] = { $value: toDtcgDimension(val), $type: 'dimension' };
    }
    return result;
  }

  private generateShadowTokens(): Record<string, unknown> {
    const result: Record<string, DtcgToken> = {};
    const shadows = this.tokens.shadows;
    if (!shadows) return result;

    for (const [key, val] of Object.entries(shadows)) {
      if (val === 'none') {
        result[key] = {
          $value: [{ offsetX: '0', offsetY: '0', blur: '0', spread: '0', color: '#000000', type: 'dropShadow' as const }],
          $type: 'shadow',
        };
      } else {
        const parsed = this.parseCssShadow(val);
        result[key] = { $value: parsed, $type: 'shadow', $description: val };
      }
    }

    return result;
  }

  private parseCssShadow(shadow: string): Array<{
    offsetX: string; offsetY: string; blur: string; spread?: string; color: string; type: 'dropShadow' | 'innerShadow';
  }> {
    const shadows = shadow.split(',').map(s => s.trim());
    return shadows.map(s => {
      const parts = s.split(/\s+/);
      let offsetX = '0', offsetY = '0', blur = '0', spread: string | undefined;
      let color = '#000000';
      let type: 'dropShadow' | 'innerShadow' = 'dropShadow';

      if (s.includes('inset')) {
        type = 'innerShadow';
        const withoutInset = s.replace('inset', '').trim();
        return this.parseCssShadow(withoutInset)[0];
      }

      const colorIdx = parts.findIndex(p => p.startsWith('#') || p.startsWith('rgb') || p.startsWith('hsl'));
      if (colorIdx >= 0) {
        color = parts.slice(colorIdx).join(' ');
        const dims = parts.slice(0, colorIdx);
        offsetX = dims[0] || '0';
        offsetY = dims[1] || '0';
        blur = dims[2] || '0';
        spread = dims[3];
      } else if (parts.length >= 2) {
        offsetX = parts[0];
        offsetY = parts[1];
        if (parts.length >= 3) blur = parts[2];
        if (parts.length >= 4) spread = parts[3];
      }

      return { offsetX, offsetY, blur, spread, color, type };
    });
  }

  private generateBorderTokens(): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    const borderWidths = this.tokens.borders?.width;
    if (borderWidths) {
      const widthGroup: Record<string, DtcgToken> = {};
      for (const [key, val] of Object.entries(borderWidths)) {
        widthGroup[key] = { $value: toDtcgDimension(val), $type: 'dimension' };
      }
      result.width = { ...this.toTokenGroup(widthGroup) };
    }

    const borderStyles = this.tokens.borders?.styles;
    if (borderStyles) {
      const styleGroup: Record<string, DtcgToken> = {};
      for (const [key, val] of Object.entries(borderStyles)) {
        styleGroup[key] = { $value: val, $type: 'string' };
      }
      result.style = { ...this.toTokenGroup(styleGroup) };
    }

    return result;
  }

  private toTokenGroup(tokens: Record<string, DtcgToken>): Record<string, DtcgToken> {
    return tokens;
  }

  private generateTransitionTokens(): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    const durations = this.tokens.transitions?.duration;
    if (durations) {
      const durationGroup: Record<string, DtcgToken> = {};
      for (const [key, val] of Object.entries(durations)) {
        const parsed = this.parseDuration(val);
        durationGroup[key] = { $value: parsed, $type: 'duration' };
      }
      result.duration = durationGroup as unknown as Record<string, unknown>;
    }

    return result;
  }

  private generateDurationTokens(): Record<string, DtcgToken> {
    const result: Record<string, DtcgToken> = {};
    const durations = this.tokens.transitions?.duration;
    if (durations) {
      for (const [key, val] of Object.entries(durations)) {
        result[key] = { $value: this.parseDuration(val), $type: 'duration' };
      }
    }
    return result;
  }

  private generateCubicBezierTokens(): Record<string, DtcgToken> {
    const result: Record<string, DtcgToken> = {};
    const timings = this.tokens.transitions?.timing;
    if (timings) {
      for (const [key, val] of Object.entries(timings)) {
        if (val.startsWith('cubic-bezier(')) {
          const nums = val.match(/[\d.]+/g)?.map(Number);
          if (nums && nums.length === 4) {
            result[key] = { $value: nums, $type: 'cubicBezier' };
          }
        }
      }
    }
    return result;
  }

  private generateEcommerceTokens(): Record<string, DtcgTokenGroup> {
    const ecom = this.tokens.colors.ecommerce;
    if (!ecom) return {};

    const result: Record<string, DtcgToken> = {};
    for (const [key, val] of Object.entries(ecom)) {
      result[key] = { $value: val, $type: 'color' };
    }

    return { color: result };
  }

  private parseDuration(val: string): { value: number; unit: string } {
    const match = val.trim().match(/^(-?\d+(?:\.\d+)?)\s*(ms|s)?$/);
    if (!match) return { value: 250, unit: 'ms' };
    return { value: parseFloat(match[1]), unit: match[2] || 'ms' };
  }

  private transformDtcgToStyleDictionary(dtcg: DtcgDocument): StyleDictionaryOutput {
    const sd: StyleDictionaryOutput = {};

    if (dtcg.color) {
      sd.color = this.flattenDtcgGroup(dtcg.color as DtcgTokenGroup, 'color');
    }
    if (dtcg.dimension) {
      const dim = dtcg.dimension as DtcgTokenGroup;
      for (const [key, val] of Object.entries(dim)) {
        if (typeof val === 'object' && val !== null && '$value' in val) {
          const v = val as DtcgToken;
          if (v.$type === 'dimension' && typeof v.$value === 'object' && v.$value !== null && 'value' in (v.$value as Record<string, unknown>)) {
            const dv = v.$value as { value: number; unit: string };
            (sd as Record<string, unknown>)[key] = `${dv.value}${dv.unit}`;
          }
        } else if (typeof val === 'object' && val !== null) {
          (sd as Record<string, unknown>)[key] = this.flattenDtcgGroup(val as DtcgTokenGroup);
        }
      }
    }
    if (dtcg.fontFamily) {
      const ff = dtcg.fontFamily as DtcgTokenGroup;
      for (const [key, val] of Object.entries(ff)) {
        if (typeof val === 'object' && val !== null && '$value' in val) {
          const v = val as DtcgToken;
          (sd as Record<string, unknown>)[`fontFamily-${key}`] = Array.isArray(v.$value) ? v.$value.join(', ') : v.$value;
        }
      }
    }

    return sd;
  }

  private flattenDtcgGroup(group: DtcgTokenGroup, prefix?: string): StyleDictionaryOutput {
    const result: StyleDictionaryOutput = {};

    for (const [key, val] of Object.entries(group)) {
      const fullKey = prefix ? `${prefix}-${key}` : key;
      if (typeof val === 'object' && val !== null && !('$value' in val)) {
        const nested = this.flattenDtcgGroup(val as DtcgTokenGroup, fullKey);
        Object.assign(result, nested);
      } else if (typeof val === 'object' && val !== null && '$value' in val) {
        const token = val as DtcgToken;
        if (token.$type === 'color') {
          result[fullKey] = { value: token.$value, type: 'color' };
        } else if (token.$type === 'dimension') {
          const dv = token.$value as { value: number; unit: string };
          const strVal = typeof dv === 'object' && dv !== null && 'value' in dv ? `${dv.value}${dv.unit}` : String(token.$value);
          result[fullKey] = { value: strVal, type: 'dimension' };
        } else {
          result[fullKey] = { value: token.$value, type: token.$type || 'string' };
        }
      }
    }

    return result;
  }

  generateDtcgsWithTypography(tokens: ExtractedTokens): Record<string, unknown> {
    const t = tokens.typography;
    const result: Record<string, unknown> = {};

    for (const [styleName, style] of Object.entries(t.textStyles || {})) {
      if (!style) continue;
      result[styleName] = {
        $value: {
          fontFamily: style.fontFamily,
          fontSize: toDtcgDimension(style.fontSize),
          fontWeight: style.fontWeight || 400,
          lineHeight: typeof style.lineHeight === 'string' ? parseFloat(style.lineHeight) || style.lineHeight : style.lineHeight,
          letterSpacing: style.letterSpacing ? toDtcgDimension(style.letterSpacing) : undefined,
        },
        $type: 'typography',
      };
    }

    return result;
  }
}
