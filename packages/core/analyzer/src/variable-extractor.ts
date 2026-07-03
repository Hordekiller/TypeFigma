import type { FigmaVariable, VariableCollection, FigmaVariablesResponse, Color } from '@typefigma/figma-client';
import type { ExtractedTokens, ColorTokens, TypographyTokens } from './types.js';

export interface DesignSystem {
  tokens: ExtractedTokens;
  collections: DesignCollection[];
  cssCustomProperties: string;
  dtcgJson: Record<string, unknown>;
  styleDictionary: Record<string, unknown>;
}

export interface DesignCollection {
  id: string;
  name: string;
  modes: string[];
  defaultMode: string;
  variables: DesignVariable[];
}

export interface DesignVariable {
  id: string;
  name: string;
  resolvedType: string;
  valuesByMode: Record<string, string | number | boolean>;
  resolvedValues: Record<string, string | number | boolean>;
  scopes: string[];
  cssName: string;
  isAlias: boolean;
}

export class VariableExtractor {
  extract(response: FigmaVariablesResponse): DesignSystem {
    const collections = this.parseCollections(response.meta.variableCollections, response.meta.variables);
    const tokens = this.buildTokens(collections);
    const cssVars = this.generateCSS(collections);
    const dtcg = this.generateDTCG(collections);
    const styleDict = this.generateStyleDictionary(collections);

    return {
      tokens,
      collections,
      cssCustomProperties: cssVars,
      dtcgJson: dtcg,
      styleDictionary: styleDict,
    };
  }

  private parseCollections(
    collections: Record<string, VariableCollection>,
    variables: Record<string, FigmaVariable>,
  ): DesignCollection[] {
    const result: DesignCollection[] = [];

    for (const coll of Object.values(collections)) {
      const modeNames = coll.modes.map(m => m.name);
      const defaultMode = coll.modes.find(m => m.modeId === coll.defaultModeId)?.name || 'default';

      const designVars: DesignVariable[] = [];
      for (const varId of coll.variableIds) {
        const v = variables[varId];
        if (!v) continue;

        const valuesByMode: Record<string, string | number | boolean> = {};
        const resolvedValues: Record<string, string | number | boolean> = {};
        let hasAlias = false;

        for (const mode of coll.modes) {
          const raw = v.valuesByMode[mode.modeId];
          if (raw === undefined) continue;
          if (typeof raw === 'object' && 'type' in raw && raw.type === 'VARIABLE_ALIAS') {
            hasAlias = true;
            const aliasTarget = variables[raw.id];
            const resolved = this.resolveAliasChain(raw.id, mode.modeId, variables);
            valuesByMode[mode.name] = `var(${this.toCSSName(aliasTarget?.name || raw.id)})`;
            resolvedValues[mode.name] = resolved;
          } else if (v.resolvedType === 'COLOR' && typeof raw === 'object' && 'r' in raw) {
            const colorStr = this.colorToString(raw as Color);
            valuesByMode[mode.name] = colorStr;
            resolvedValues[mode.name] = colorStr;
          } else {
            const value = raw as string | number | boolean;
            valuesByMode[mode.name] = value;
            resolvedValues[mode.name] = value;
          }
        }

        designVars.push({
          id: v.id,
          name: v.name,
          resolvedType: v.resolvedType,
          valuesByMode,
          resolvedValues,
          scopes: v.scopes,
          cssName: this.toCSSName(v.name),
          isAlias: hasAlias,
        });
      }

      result.push({
        id: coll.id,
        name: coll.name,
        modes: modeNames,
        defaultMode,
        variables: designVars,
      });
    }

    return result;
  }

  private resolveAliasChain(
    variableId: string,
    modeId: string,
    variables: Record<string, FigmaVariable>,
    visited: Set<string> = new Set(),
    depth: number = 0,
  ): string | number | boolean {
    if (depth > 10) return 'MISSING';
    if (visited.has(variableId)) return 'CIRCULAR';
    visited.add(variableId);

    const v = variables[variableId];
    if (!v) return 'MISSING';

    const raw = v.valuesByMode[modeId];
    if (raw === undefined) return 'MISSING';

    if (typeof raw === 'object' && 'type' in raw && raw.type === 'VARIABLE_ALIAS') {
      return this.resolveAliasChain(raw.id, modeId, variables, visited, depth + 1);
    }

    if (v.resolvedType === 'COLOR' && typeof raw === 'object' && 'r' in raw) {
      return this.colorToString(raw as Color);
    }

    return raw as string | number | boolean;
  }

  private buildTokens(collections: DesignCollection[]): ExtractedTokens {
    const colors: ColorTokens = this.buildColorTokens(collections);
    const typography: TypographyTokens = this.buildTypographyTokens();

    const spacing: Record<string, string> = {};
    const sizing: Record<string, string> = {};
    const borderRadius: Record<string, string> = {};
    const shadows: Record<string, string> = {};
    const breakpoints: Record<string, string> = {};

    for (const coll of collections) {
      const isSize = coll.name.toLowerCase().includes('size') || coll.name.toLowerCase().includes('spacing');
      const isRadius = coll.name.toLowerCase().includes('radius') || coll.name.toLowerCase().includes('corner');
      const isShadow = coll.name.toLowerCase().includes('shadow') || coll.name.toLowerCase().includes('effect');
      const isBreakpoint = coll.name.toLowerCase().includes('breakpoint') || coll.name.toLowerCase().includes('viewport');

      for (const v of coll.variables) {
        const rawVal = v.valuesByMode[coll.defaultMode];
        const resolvedVal = v.resolvedValues[coll.defaultMode];
        if (rawVal === undefined) continue;

        if (isSize && v.resolvedType === 'FLOAT' && typeof resolvedVal === 'number') {
          const key = v.name.replace(/[./]/g, '-').toLowerCase();
          spacing[key] = `${resolvedVal}px`;
          sizing[key] = `${resolvedVal}px`;
        } else if (isRadius && v.resolvedType === 'FLOAT' && typeof resolvedVal === 'number') {
          const key = v.name.split('/').pop()?.toLowerCase() || v.cssName;
          borderRadius[key] = `${resolvedVal}px`;
        } else if (isShadow) {
          // handled below
        } else if (isBreakpoint && v.resolvedType === 'FLOAT' && typeof resolvedVal === 'number') {
          const key = v.name.split('/').pop()?.toLowerCase() || v.cssName;
          breakpoints[key] = `${resolvedVal}px`;
        }
      }
    }

    return {
      colors,
      typography,
      spacing: Object.keys(spacing).length > 0 ? spacing : { '0': '0', '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem' },
      sizing: Object.keys(sizing).length > 0 ? sizing : { full: '100%', auto: 'auto' },
      borderRadius: Object.keys(borderRadius).length > 0 ? borderRadius : { none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', full: '9999px' },
      shadows: Object.keys(shadows).length > 0 ? shadows : { none: 'none', sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
      borders: { width: { default: '1px' }, styles: { solid: 'solid' } },
      transitions: { duration: { fast: '150ms', base: '200ms' }, timing: { ease: 'ease' } },
      breakpoints: Object.keys(breakpoints).length > 0 ? breakpoints : { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
      zIndex: { '0': 0, '10': 10, '20': 20, '30': 30, '40': 40, '50': 50, auto: 'auto' },
    };
  }

  private buildColorTokens(collections: DesignCollection[]): ColorTokens {
    const tokens: ColorTokens = {
      primary: {}, secondary: {}, accent: {}, neutral: {},
      success: {}, warning: {}, error: {}, info: {},
      background: { body: '#ffffff', surface: '#ffffff', overlay: 'rgba(0,0,0,0.5)' },
      text: { primary: '#111827', secondary: '#6b7280', disabled: '#d1d5db', inverse: '#ffffff' },
      border: { default: '#e5e7eb', hover: '#d1d5db', focus: '#3b82f6' },
    };

    for (const coll of collections) {
      for (const v of coll.variables) {
        if (v.resolvedType !== 'COLOR') continue;
        const val = v.isAlias
          ? v.resolvedValues[coll.defaultMode]
          : v.valuesByMode[coll.defaultMode];
        if (typeof val !== 'string') continue;

        const path = v.name.split('/');
        const category = path[0]?.toLowerCase() || '';
        const shade = path[1] || v.name;

        if (category.includes('primary')) tokens.primary[shade] = val;
        else if (category.includes('secondary')) tokens.secondary[shade] = val;
        else if (category.includes('accent')) tokens.accent[shade] = val;
        else if (category.includes('neutral') || category.includes('gray') || category.includes('grey')) tokens.neutral[shade] = val;
        else if (category.includes('success')) tokens.success[shade] = val;
        else if (category.includes('warning')) tokens.warning[shade] = val;
        else if (category.includes('error') || category.includes('danger')) tokens.error[shade] = val;
        else if (category.includes('info')) tokens.info[shade] = val;
        else if (category.includes('background') || category.includes('bg')) {
          const key = path[1]?.toLowerCase() || 'body';
          if (key in tokens.background) {
            (tokens.background as Record<string, string>)[key] = val;
          }
        } else if (category.includes('text')) {
          const key = path[1]?.toLowerCase() || 'primary';
          if (key in tokens.text) {
            (tokens.text as Record<string, string>)[key] = val;
          }
        } else if (category.includes('border')) {
          const key = path[1]?.toLowerCase() || 'default';
          if (key in tokens.border) {
            (tokens.border as Record<string, string>)[key] = val;
          }
        } else if (category.includes('ecommerce') || category.includes('sale') || category.includes('price')) {
          if (!tokens.ecommerce) tokens.ecommerce = { sale: '#ef4444', newArrival: '#10b981', outOfStock: '#6b7280', inStock: '#10b981', price: '#111827', salePrice: '#ef4444', rating: '#f59e0b' };
          (tokens.ecommerce as Record<string, string>)[shade] = val;
        } else {
          // Store as neutral variants
          tokens.neutral[`variable-${shade}`] = val;
        }
      }
    }

    return tokens;
  }

  private buildTypographyTokens(): TypographyTokens {
    return {
      fontFamilies: {
        heading: { name: 'Inter', weights: [300, 400, 500, 600, 700], fallback: 'system-ui, sans-serif' },
        body: { name: 'Inter', weights: [300, 400, 500, 600, 700], fallback: 'system-ui, sans-serif' },
      },
      fontSizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem' },
      fontWeights: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeights: { none: 1, tight: 1.25, normal: 1.5, relaxed: 1.625 },
      letterSpacing: { normal: '0', tight: '-0.025em', wide: '0.025em' },
      textStyles: {
        h1: { fontFamily: 'Inter', fontSize: '48px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' },
        h2: { fontFamily: 'Inter', fontSize: '36px', fontWeight: 700, lineHeight: '1.25', letterSpacing: '-0.02em' },
        h3: { fontFamily: 'Inter', fontSize: '30px', fontWeight: 600, lineHeight: '1.3', letterSpacing: '-0.01em' },
        h4: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 600, lineHeight: '1.35', letterSpacing: '-0.01em' },
        h5: { fontFamily: 'Inter', fontSize: '20px', fontWeight: 600, lineHeight: '1.4', letterSpacing: '0' },
        h6: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, lineHeight: '1.5', letterSpacing: '0' },
        body: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 400, lineHeight: '1.6', letterSpacing: '0' },
        bodyLarge: { fontFamily: 'Inter', fontSize: '18px', fontWeight: 400, lineHeight: '1.6', letterSpacing: '0' },
        bodySmall: { fontFamily: 'Inter', fontSize: '14px', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
        caption: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 400, lineHeight: '1.4', letterSpacing: '0.025em' },
        overline: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, lineHeight: '1.2', letterSpacing: '0.05em' },
        button: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, lineHeight: '1', letterSpacing: '0' },
      },
    };
  }

  private generateCSS(collections: DesignCollection[]): string {
    const lines: string[] = [':root {'];
    const modeGroups = new Map<string, string[]>();

    for (const coll of collections) {
      for (const v of coll.variables) {
        const cssVar = `--${v.cssName}`;
        for (const [modeName, val] of Object.entries(v.valuesByMode)) {
          const group = modeName === coll.defaultMode ? ':root' : `[data-mode="${modeName}"]`;
          const existing = modeGroups.get(group) || [];
          existing.push(`  ${cssVar}: ${val};`);
          modeGroups.set(group, existing);
        }
      }
    }

    for (const [selector, vars] of modeGroups) {
      if (selector === ':root') {
        lines.push(...vars);
      }
    }
    lines.push('}');

    for (const [selector, vars] of modeGroups) {
      if (selector !== ':root') {
        lines.push(`\n${selector} {`);
        lines.push(...vars);
        lines.push('}');
      }
    }

    return lines.join('\n');
  }

  private generateDTCG(collections: DesignCollection[]): Record<string, unknown> {
    const dtcg: Record<string, unknown> = {};

    for (const coll of collections) {
      const collTokens: Record<string, unknown> = {};

      for (const v of coll.variables) {
        const path = v.name.split('/');
        let current = collTokens;

        for (let i = 0; i < path.length; i++) {
          const part = path[i];
          if (i === path.length - 1) {
            current[part] = {
              $value: v.valuesByMode[coll.defaultMode],
              $type: v.resolvedType.toLowerCase(),
              ...(v.scopes.length > 0 ? { $extensions: { scopes: v.scopes } } : {}),
            };
          } else {
            current[part] = current[part] || {};
            current = current[part] as Record<string, unknown>;
          }
        }
      }

      if (Object.keys(collTokens).length > 0) {
        dtcg[coll.name] = collTokens;
      }
    }

    return dtcg;
  }

  generateStyleDictionary(collections: DesignCollection[]): Record<string, unknown> {
    const dict: Record<string, unknown> = {};

    for (const coll of collections) {
      const collProps: Record<string, unknown> = {};

      for (const v of coll.variables) {
        const path = v.name.split('/');
        let current = collProps;

        for (let i = 0; i < path.length; i++) {
          const part = path[i];
          if (i === path.length - 1) {
            const value = v.resolvedValues[coll.defaultMode];
            const type = this.mapStyleDictionaryType(v.resolvedType);
            current[part] = {
              value,
              type,
              ...(v.scopes.length > 0 ? { scopes: v.scopes } : {}),
            };
          } else {
            current[part] = (current[part] as Record<string, unknown>) || {};
            current = current[part] as Record<string, unknown>;
          }
        }
      }

      if (Object.keys(collProps).length > 0) {
        dict[coll.name] = collProps;
      }
    }

    return dict;
  }

  private mapStyleDictionaryType(resolvedType: string): string {
    switch (resolvedType) {
      case 'COLOR': return 'color';
      case 'FLOAT': return 'dimension';
      case 'STRING': return 'content';
      case 'BOOLEAN': return 'boolean';
      default: return resolvedType.toLowerCase();
    }
  }

  private toCSSName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\//g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  private colorToString(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = typeof color.a === 'number' ? color.a : 1;
    if (a >= 1) return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}
