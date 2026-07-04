import type { ExtractedTokens } from '@typefigma/analyzer';
import type { ThemeJson, ThemeSettings, ThemeStyles, ColorSettings, PaletteItem, GradientItem, DuotoneItem, TypographySettings, FontFamilyItem, FontSizeItem, SpacingSettings, SpacingSizeItem, LayoutSettings, BorderSettings, BlockSettings, TemplatePart } from './types.js';

export type { ThemeJson, ThemeSettings, ThemeStyles, ColorSettings, PaletteItem, GradientItem, DuotoneItem, TypographySettings, FontFamilyItem, FontSizeItem, SpacingSettings, SpacingSizeItem, LayoutSettings, BorderSettings, BlockSettings, TemplatePart };

export function pxToRem(px: number): string {
  return `${px / 16}rem`;
}

export interface FluidConfig {
  minViewportWidth: string;
  maxViewportWidth: string;
  minFontSize: string;
}

export function clampValue(min: string, max: string, minVw: string = '375px', maxVw: string = '1440px'): string {
  const minNum = parseFloat(min);
  const maxNum = parseFloat(max);
  if (isNaN(minNum) || isNaN(maxNum)) return max;
  const minVwNum = parseFloat(minVw);
  const maxVwNum = parseFloat(maxVw);
  if (isNaN(minVwNum) || isNaN(maxVwNum)) return max;

  const slope = (maxNum - minNum) / (maxVwNum - minVwNum);
  const intercept = minNum - slope * minVwNum;
  const preferred = `${(slope * 100).toFixed(2)}vw + ${intercept.toFixed(2)}px`;

  return `clamp(${min}, ${preferred}, ${max})`;
}

export class ThemeJsonGenerator {
  private tokens: ExtractedTokens;

  constructor(tokens: ExtractedTokens) {
    this.tokens = tokens;
  }

  generate(): ThemeJson {
    return {
      $schema: 'https://schemas.wp.org/trunk/theme.json',
      version: 3,
      settings: this.generateSettings(),
      styles: this.generateStyles(),
      templateParts: this.generateTemplateParts(),
    };
  }

  private generateSettings(): ThemeSettings {
    return {
      appearanceTools: true,
      useRootPaddingAwareAlignments: true,
      color: this.generateColorSettings(),
      typography: this.generateTypographySettings(),
      spacing: this.generateSpacingSettings(),
      layout: {
        contentSize: this.tokens.sizing.container || '1200px',
        wideSize: this.tokens.sizing.wide || this.tokens.sizing.container || '1440px',
      },
      border: {
        color: true,
        radius: true,
        style: true,
        width: true,
      },
      dimensions: {
        minHeight: true,
        aspectRatio: true,
      },
      background: {
        backgroundImage: true,
        backgroundSize: true,
      },
      position: {
        sticky: true,
      },
      shadow: {
        presets: this.generateShadowPresets(),
        defaultPresets: false,
      },
      custom: {
        borderRadius: this.tokens.borderRadius,
        shadow: this.tokens.shadows,
        transitions: this.tokens.transitions,
      },
      blocks: this.generateBlockSettings(),
    };
  }

  private generateColorSettings(): ColorSettings {
    const palette: PaletteItem[] = [];
    const c = this.tokens.colors;

    const addPaletteGroup = (name: string, colors: Record<string, string>) => {
      for (const [shade, color] of Object.entries(colors)) {
        palette.push({ slug: `${name}-${shade}`, name: `${name.charAt(0).toUpperCase() + name.slice(1)} ${shade}`, color });
      }
    };

    addPaletteGroup('primary', c.primary);
    addPaletteGroup('secondary', c.secondary);
    addPaletteGroup('accent', c.accent);
    addPaletteGroup('neutral', c.neutral);
    addPaletteGroup('success', c.success);
    addPaletteGroup('warning', c.warning);
    addPaletteGroup('error', c.error);
    addPaletteGroup('info', c.info);

    palette.push(
      { slug: 'bg-body', name: 'Body Background', color: c.background.body },
      { slug: 'bg-surface', name: 'Surface Background', color: c.background.surface },
      { slug: 'bg-overlay', name: 'Overlay Background', color: c.background.overlay },
      { slug: 'text-primary', name: 'Text Primary', color: c.text.primary },
      { slug: 'text-secondary', name: 'Text Secondary', color: c.text.secondary },
      { slug: 'text-disabled', name: 'Text Disabled', color: c.text.disabled },
      { slug: 'text-inverse', name: 'Text Inverse', color: c.text.inverse },
      { slug: 'border-default', name: 'Border Default', color: c.border.default },
      { slug: 'border-hover', name: 'Border Hover', color: c.border.hover },
      { slug: 'border-focus', name: 'Border Focus', color: c.border.focus },
    );

    if (c.ecommerce) {
      for (const [key, color] of Object.entries(c.ecommerce)) {
        palette.push({ slug: `ecommerce-${key}`, name: `Ecommerce ${key}`, color });
      }
    }

    const gradients: GradientItem[] = this.generateGradients(c);
    const duotone: DuotoneItem[] = this.generateDuotones(c);

    return {
      palette,
      gradients: gradients.length > 0 ? gradients : undefined,
      duotone: duotone.length > 0 ? duotone : undefined,
      link: true,
      button: true,
      heading: true,
      caption: true,
      defaultPalette: false,
      defaultGradients: false,
      defaultDuotone: false,
    };
  }

  private generateGradients(c: ExtractedTokens['colors']): GradientItem[] {
    const gradients: GradientItem[] = [];

    if (c.primary['500'] && c.primary['700']) {
      gradients.push({
        slug: 'gradient-primary',
        name: 'Primary Gradient',
        gradient: `linear-gradient(135deg, ${c.primary['500']} 0%, ${c.primary['700']} 100%)`,
      });
    }
    if (c.secondary['500'] && c.primary['500']) {
      gradients.push({
        slug: 'gradient-primary-secondary',
        name: 'Primary to Secondary',
        gradient: `linear-gradient(135deg, ${c.primary['500']} 0%, ${c.secondary['500']} 100%)`,
      });
    }
    if (c.neutral['900'] && c.neutral['700']) {
      gradients.push({
        slug: 'gradient-dark',
        name: 'Dark Gradient',
        gradient: `linear-gradient(135deg, ${c.neutral['900']} 0%, ${c.neutral['700']} 100%)`,
      });
    }

    return gradients;
  }

  private generateDuotones(c: ExtractedTokens['colors']): DuotoneItem[] {
    return [
      { slug: 'duotone-primary', name: 'Primary Duotone', colors: [c.primary['500'] || '#000000', c.primary['900'] || '#ffffff'] },
      { slug: 'duotone-foreground-background', name: 'Foreground and Background', colors: [c.text.primary, c.background.body] },
      { slug: 'duotone-base', name: 'Base Duotone', colors: [c.neutral['900'] || '#000000', c.neutral['100'] || '#ffffff'] },
    ];
  }

  private generateShadowPresets(): Array<{ name: string; slug: string; shadow: string }> | undefined {
    const shadows = this.tokens.shadows;
    if (!shadows || Object.keys(shadows).length === 0) return undefined;

    return Object.entries(shadows).map(([slug, shadow]) => ({
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
      shadow,
    }));
  }

  private generateTypographySettings(): TypographySettings {
    const t = this.tokens.typography;

    const fontFamilies: FontFamilyItem[] = [
      {
        fontFamily: `${t.fontFamilies.heading.name}, ${t.fontFamilies.heading.fallback}`,
        name: 'Heading',
        slug: 'heading',
      },
      {
        fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
        name: 'Body',
        slug: 'body',
      },
    ];

    if (t.fontFamilies.mono) {
      fontFamilies.push({
        fontFamily: `${t.fontFamilies.mono.name}, ${t.fontFamilies.mono.fallback}`,
        name: 'Mono',
        slug: 'mono',
      });
    }

    const fontSizes: FontSizeItem[] = [];
    for (const [slug, size] of Object.entries(t.fontSizes)) {
      const fluid = this.computeFluidFontSize(size);
      fontSizes.push({
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        size,
        ...(fluid ? { fluid } : {}),
      });
    }

    const ts = t.textStyles;
    if (ts) {
      const textStyleSizes: Array<{ slug: string; name: string; size: string }> = [
        { slug: 'h1', name: 'H1', size: ts.h1?.fontSize || '2.25rem' },
        { slug: 'h2', name: 'H2', size: ts.h2?.fontSize || '1.5rem' },
        { slug: 'h3', name: 'H3', size: ts.h3?.fontSize || '1.25rem' },
        { slug: 'h4', name: 'H4', size: ts.h4?.fontSize || '1.125rem' },
        { slug: 'body-large', name: 'Body Large', size: ts.bodyLarge?.fontSize || '1.125rem' },
        { slug: 'body', name: 'Body', size: ts.body?.fontSize || '1rem' },
        { slug: 'body-small', name: 'Body Small', size: ts.bodySmall?.fontSize || '0.875rem' },
        { slug: 'caption', name: 'Caption', size: ts.caption?.fontSize || '0.75rem' },
      ];

      for (const fs of textStyleSizes) {
        if (!fontSizes.find(f => f.slug === fs.slug)) {
          const fluid = this.computeFluidFontSize(fs.size);
          fontSizes.push({ ...fs, ...(fluid ? { fluid } : {}) });
        }
      }
    }

    return {
      fontFamilies,
      fontSizes,
      customFontSize: true,
      dropCap: true,
      fluid: {
        minViewportWidth: '375px',
        maxViewportWidth: '1440px',
        minFontSize: '0.75rem',
      },
      fontStyle: true,
      fontWeight: true,
      letterSpacing: true,
      lineHeight: true,
      textDecoration: true,
      textTransform: true,
      writingMode: true,
      textColumns: true,
      defaultFontSizes: false,
    };
  }

  private computeFluidFontSize(size: string): { min: string; max: string } | undefined {
    const match = size.match(/^([\d.]+)\s*(rem|px)?$/);
    if (!match) return undefined;

    const baseSize = parseFloat(match[1]);
    const unit = match[2] || 'rem';

    if (isNaN(baseSize)) return undefined;

    const minRatio = 0.75;
    const minSize = `${(baseSize * minRatio).toFixed(3)}${unit}`;

    return { min: minSize, max: size };
  }

  private generateSpacingSettings(): SpacingSettings {
    const spacingSizes: SpacingSizeItem[] = [];
    for (const [slug, size] of Object.entries(this.tokens.spacing)) {
      const fluid = this.computeFluidSpacing(size);
      spacingSizes.push({
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        size,
        ...(fluid ? { fluid } : {}),
      });
    }

    return {
      padding: true,
      margin: true,
      blockGap: true,
      spacingScale: [
        { operator: '*', increment: 1.5, steps: 7, mediumStep: 1.5, unit: 'rem' },
      ],
      spacingSizes: spacingSizes.length > 0 ? spacingSizes : undefined,
      units: ['px', 'em', 'rem', '%', 'vh', 'vw'],
    };
  }

  private computeFluidSpacing(size: string): { min: string; max: string } | undefined {
    const match = size.match(/^([\d.]+)\s*(rem|px)?$/);
    if (!match) return undefined;

    const base = parseFloat(match[1]);
    const unit = match[2] || 'rem';

    if (isNaN(base) || base <= 0) return undefined;

    let min: string;
    if (base <= 1) {
      min = size;
    } else if (base <= 2) {
      min = `${(base * 0.667).toFixed(3)}${unit}`;
    } else {
      min = `${(base * 0.5).toFixed(3)}${unit}`;
    }

    return { min, max: size };
  }

  private generateBlockSettings(): Record<string, BlockSettings> {
    return {
      'core/paragraph': {
        color: { text: true, background: true, link: true },
        typography: { fontStyle: true, fontWeight: true, letterSpacing: true, lineHeight: true, textDecoration: true, textTransform: true, dropCap: true },
        spacing: { padding: true, margin: true },
        dimensions: { minHeight: true },
      },
      'core/heading': {
        color: { text: true, background: true },
        typography: { fontStyle: true, fontWeight: true, letterSpacing: true, lineHeight: true, textDecoration: true, textTransform: true },
        spacing: { padding: true, margin: true },
      },
      'core/group': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, lineHeight: true },
        spacing: { padding: true, margin: true, blockGap: true },
        dimensions: { minHeight: true },
        layout: { type: 'flex', orientation: 'vertical' },
        shadow: { presets: true },
      },
      'core/columns': {
        spacing: { padding: true, margin: true, blockGap: true },
        color: { text: true, background: true },
      },
      'core/column': {
        spacing: { padding: true, margin: true },
        color: { text: true, background: true },
        dimensions: { minHeight: true },
      },
      'core/button': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, fontWeight: true, letterSpacing: true, textDecoration: true, textTransform: true },
        border: { color: true, radius: true, style: true, width: true },
        spacing: { padding: true },
        shadow: { presets: true },
      },
      'core/buttons': {
        spacing: { padding: true, margin: true, blockGap: true },
        layout: { type: 'flex', orientation: 'horizontal' },
      },
      'core/image': {
        border: { color: true, radius: true, style: true, width: true },
        color: { text: true },
        dimensions: { aspectRatio: true, minHeight: true },
        shadow: { presets: true },
      },
      'core/gallery': {
        spacing: { padding: true, margin: true, blockGap: true },
        dimensions: { aspectRatio: true },
      },
      'core/cover': {
        color: { text: true, background: true },
        spacing: { padding: true, margin: true },
        dimensions: { minHeight: true },
        background: { backgroundImage: true, backgroundSize: true },
        position: { sticky: true },
        shadow: { presets: true },
      },
      'core/separator': {
        color: { text: true },
        spacing: { margin: true },
      },
      'core/post-title': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, fontWeight: true, lineHeight: true, letterSpacing: true, textDecoration: true, textTransform: true },
        spacing: { padding: true, margin: true },
      },
      'core/post-featured-image': {
        border: { color: true, radius: true, style: true, width: true },
        dimensions: { aspectRatio: true, minHeight: true },
        shadow: { presets: true },
      },
      'core/post-excerpt': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, lineHeight: true, fontWeight: true },
        spacing: { padding: true, margin: true },
      },
      'core/navigation': {
        color: { text: true, background: true, link: true },
        typography: { fontFamily: true, fontSize: true, fontWeight: true, textDecoration: true, textTransform: true, letterSpacing: true },
        spacing: { padding: true, margin: true, blockGap: true },
        border: { color: true, radius: true, style: true, width: true },
        layout: { type: 'flex', orientation: 'horizontal', flexWrap: 'wrap' },
      },
      'core/query': {
        spacing: { padding: true, margin: true, blockGap: true },
        layout: { type: 'grid' },
      },
      'core/query-pagination': {
        spacing: { padding: true, margin: true, blockGap: true },
        typography: { fontFamily: true, fontSize: true, fontWeight: true },
      },
      'core/footer': {
        color: { text: true, background: true, link: true },
        typography: { fontFamily: true, fontSize: true, lineHeight: true },
        spacing: { padding: true, margin: true },
      },
      'core/site-logo': {
        border: { color: true, radius: true, style: true, width: true },
        dimensions: { aspectRatio: true },
      },
      'core/social-links': {
        spacing: { padding: true, margin: true, blockGap: true },
        color: { link: true },
      },
      'core/search': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true },
        border: { color: true, radius: true, style: true, width: true },
        spacing: { padding: true, margin: true },
      },
      'core/code': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, lineHeight: true },
        spacing: { padding: true, margin: true },
        border: { radius: true },
      },
      'core/pullquote': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, fontWeight: true, fontStyle: true, lineHeight: true, letterSpacing: true },
        spacing: { padding: true, margin: true },
        border: { color: true, width: true, style: true },
      },
      'core/quote': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, fontWeight: true, fontStyle: true, lineHeight: true },
        spacing: { padding: true, margin: true },
        border: { color: true, width: true, style: true },
      },
      'core/list': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, lineHeight: true },
        spacing: { padding: true, margin: true },
      },
      'core/table': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, lineHeight: true },
        spacing: { padding: true, margin: true },
        border: { color: true, radius: true, style: true, width: true },
      },
      'core/media-text': {
        color: { text: true, background: true },
        typography: { fontFamily: true, fontSize: true, lineHeight: true },
        spacing: { padding: true, margin: true, blockGap: true },
        dimensions: { minHeight: true },
      },
    };
  }

  private generateStyles(): ThemeStyles {
    const c = this.tokens.colors;
    const t = this.tokens.typography;
    const tStyles = t.textStyles;

    return {
      color: {
        text: c.text.primary,
        background: c.background.body,
        link: c.primary['500'],
        caption: c.text.secondary,
        heading: c.text.primary,
        button: '#ffffff',
      },
      typography: {
        fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
        fontSize: tStyles?.body?.fontSize || '1rem',
        lineHeight: tStyles?.body?.lineHeight || '1.5',
        fontWeight: '400',
        letterSpacing: '0',
        textDecoration: 'none',
        textTransform: 'none',
      },
      spacing: {
        blockGap: this.getSpacingValue('4') || '1rem',
        padding: {
          top: this.getSpacingValue('4') || '1rem',
          right: this.getSpacingValue('4') || '1rem',
          bottom: this.getSpacingValue('4') || '1rem',
          left: this.getSpacingValue('4') || '1rem',
        },
      },
      border: {
        radius: this.tokens.borderRadius?.default || '0.375rem',
        width: this.tokens.borders?.width?.default || '1px',
        color: c.border.default,
        style: 'solid',
      },
      elements: {
        link: {
          color: { text: c.primary['500'] },
          typography: { textDecoration: 'underline' },
        },
        heading: {
          color: { text: c.text.primary },
          typography: {
            fontFamily: `${t.fontFamilies.heading.name}, ${t.fontFamilies.heading.fallback}`,
            fontWeight: '700',
            lineHeight: '1.25',
            letterSpacing: '0',
          },
          spacing: {
            margin: { top: '0', bottom: '1rem' },
          },
        },
        button: {
          color: { text: '#ffffff', background: c.primary['500'] },
          typography: {
            fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
            fontWeight: '600',
            fontSize: tStyles?.button?.fontSize || '0.875rem',
          },
          border: { radius: this.tokens.borderRadius?.default || '0.5rem', width: '0', style: 'solid' },
          spacing: {
            padding: { top: '12px', right: '24px', bottom: '12px', left: '24px' },
          },
        },
        caption: {
          color: { text: c.text.secondary },
          typography: {
            fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
            fontSize: tStyles?.caption?.fontSize || '0.75rem',
            lineHeight: '1.5',
            letterSpacing: '0.05em',
          },
        },
      },
      blocks: {
        'core/group': {
          spacing: {
            padding: {
              top: this.getSpacingValue('8') || '2rem',
              right: this.getSpacingValue('4') || '1rem',
              bottom: this.getSpacingValue('8') || '2rem',
              left: this.getSpacingValue('4') || '1rem',
            },
          },
        },
        'core/columns': {
          spacing: { blockGap: this.getSpacingValue('8') || '2rem' },
        },
        'core/post-title': {
          color: { text: c.text.primary },
          typography: {
            fontFamily: `${t.fontFamilies.heading.name}, ${t.fontFamilies.heading.fallback}`,
            fontWeight: '700',
            lineHeight: '1.25',
          },
          spacing: { margin: { bottom: '0.5rem' } },
        },
        'core/post-excerpt': {
          color: { text: c.text.secondary },
          typography: {
            fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
            lineHeight: '1.75',
          },
        },
        'core/paragraph': {
          color: { text: c.text.secondary },
          typography: {
            fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
            lineHeight: '1.75',
          },
          spacing: { margin: { bottom: '1.5rem' } },
        },
        'core/heading': {
          color: { text: c.text.primary },
          typography: {
            fontFamily: `${t.fontFamilies.heading.name}, ${t.fontFamilies.heading.fallback}`,
            fontWeight: '700',
            lineHeight: '1.25',
          },
          spacing: { margin: { top: '2rem', bottom: '1rem' } },
          elements: {
            link: { color: { text: c.primary['500'] } },
          },
        },
        'core/button': {
          color: { text: '#ffffff', background: c.primary['500'] },
          typography: {
            fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
            fontWeight: '600',
          },
          border: { radius: this.tokens.borderRadius?.default || '0.5rem' },
          spacing: { padding: { top: '12px', right: '24px', bottom: '12px', left: '24px' } },
        },
        'core/navigation': {
          typography: {
            fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
            fontWeight: '500',
          },
          spacing: { blockGap: '1.5rem' },
          color: { text: c.text.primary, background: 'transparent' },
          elements: {
            link: { color: { text: c.text.primary } },
          },
        },
        'core/image': {
          border: { radius: this.tokens.borderRadius?.lg || '0.75rem' },
        },
        'core/cover': {
          spacing: { padding: { top: '4rem', right: '2rem', bottom: '4rem', left: '2rem' } },
        },
        'core/separator': {
          color: { text: c.border.default },
          spacing: { margin: { top: '2rem', bottom: '2rem' } },
        },
        'core/quote': {
          spacing: { margin: { top: '2rem', bottom: '2rem' } },
          border: { color: c.primary['500'], width: '4px', style: 'solid' },
        },
        'core/pullquote': {
          spacing: { margin: { top: '2rem', bottom: '2rem' } },
          border: { color: c.primary['500'], width: '4px', style: 'solid' },
        },
        'core/list': {
          spacing: { padding: { left: '2rem' }, margin: { bottom: '1.5rem' } },
        },
        'core/search': {
          border: { radius: this.tokens.borderRadius?.full || '9999px' },
          color: { background: c.background.surface, text: c.text.primary },
        },
        'core/code': {
          typography: { fontFamily: t.fontFamilies.mono ? `${t.fontFamilies.mono.name}, ${t.fontFamilies.mono.fallback}` : 'monospace', fontSize: '0.875rem' },
          spacing: { padding: { top: '1rem', right: '1rem', bottom: '1rem', left: '1rem' } },
          color: { text: c.text.primary, background: c.neutral['100'] || '#f5f5f5' },
          border: { radius: this.tokens.borderRadius?.md || '0.5rem' },
        },
        'core/query': {
          spacing: { blockGap: this.getSpacingValue('8') || '2rem' },
        },
        'core/query-pagination': {
          spacing: { margin: { top: '2rem' } },
        },
      },
    };
  }

  private getSpacingValue(key: string): string | undefined {
    if (!this.tokens.spacing) return undefined;
    return this.tokens.spacing[key];
  }

  private generateTemplateParts(): TemplatePart[] {
    return [
      { name: 'header', title: 'Header', area: 'header' },
      { name: 'footer', title: 'Footer', area: 'footer' },
      { name: 'sidebar', title: 'Sidebar', area: 'sidebar' },
      { name: 'comments', title: 'Comments', area: 'uncategorized' },
      { name: 'search-results', title: 'Search Results', area: 'uncategorized' },
      { name: '404-content', title: '404 Content', area: 'uncategorized' },
      { name: 'post-meta', title: 'Post Meta', area: 'uncategorized' },
      { name: 'related-posts', title: 'Related Posts', area: 'uncategorized' },
      { name: 'breadcrumbs', title: 'Breadcrumbs', area: 'uncategorized' },
      { name: 'cta-section', title: 'Call to Action', area: 'uncategorized' },
    ];
  }

  toJSON(pretty: boolean = true): string {
    return JSON.stringify(this.generate(), null, pretty ? 2 : undefined);
  }
}
