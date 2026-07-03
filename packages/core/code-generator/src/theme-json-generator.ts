import type { ExtractedTokens } from '@typefigma/analyzer';

export interface ThemeJson {
  $schema: string;
  version: number;
  settings: ThemeSettings;
  styles: ThemeStyles;
  templateParts: TemplatePart[];
}

export interface ThemeSettings {
  color: ColorSettings;
  typography: TypographySettings;
  spacing: SpacingSettings;
  layout: LayoutSettings;
  border: BorderSettings;
  custom?: Record<string, unknown>;
}

export interface ColorSettings {
  palette: PaletteItem[];
  gradients?: GradientItem[];
  duotone?: DuotoneItem[];
  link: boolean;
  button: boolean;
  defaultPalette: boolean;
}

export interface PaletteItem {
  slug: string;
  name: string;
  color: string;
}

export interface GradientItem {
  slug: string;
  name: string;
  gradient: string;
}

export interface DuotoneItem {
  slug: string;
  name: string;
  colors: [string, string];
}

export interface TypographySettings {
  fontFamilies: FontFamilyItem[];
  fontSizes: FontSizeItem[];
  customFontSize: boolean;
  dropCap: boolean;
}

export interface FontFamilyItem {
  fontFamily: string;
  name: string;
  slug: string;
  fontFace?: FontFaceDeclaration[];
}

export interface FontFaceDeclaration {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  src: string[];
}

export interface FontSizeItem {
  name: string;
  slug: string;
  size: string;
}

export interface SpacingSettings {
  padding: boolean;
  margin: boolean;
  spacingScale: SpacingScaleItem[];
  spacingSizes: SpacingSizeItem[];
  units: string[];
}

export interface SpacingScaleItem {
  operator: string;
  increment: number;
  steps: number;
  mediumStep: number;
  unit: string;
}

export interface SpacingSizeItem {
  name: string;
  slug: string;
  size: string;
}

export interface LayoutSettings {
  contentSize: string;
  wideSize: string;
}

export interface BorderSettings {
  color: boolean;
  radius: boolean;
  style: boolean;
  width: boolean;
}

export interface ThemeStyles {
  color: {
    text: string;
    background: string;
    link?: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
  spacing?: {
    padding?: Record<string, string>;
    margin?: Record<string, string>;
    blockGap?: string;
  };
  blocks?: Record<string, BlockStyle>;
  elements?: {
    link?: { color: { text: string } };
    heading?: ElementHeadingStyle;
    button?: ElementButtonStyle;
  };
}

export interface BlockStyle {
  color?: { text?: string; background?: string };
  typography?: { fontFamily?: string; fontSize?: string };
  spacing?: {
    padding?: Record<string, string>;
    margin?: Record<string, string>;
    blockGap?: string;
  };
  border?: { radius?: string; width?: string; color?: string; style?: string };
}

export interface ElementHeadingStyle {
  color: { text: string };
  typography: { fontFamily: string; fontWeight: string; lineHeight: string };
}

export interface ElementButtonStyle {
  color: { text: string; background: string };
  typography: { fontFamily: string; fontWeight: string };
  border: { radius: string };
}

export interface TemplatePart {
  name: string;
  title: string;
  area: string;
}

export class ThemeJsonGenerator {
  private tokens: ExtractedTokens;

  constructor(tokens: ExtractedTokens) {
    this.tokens = tokens;
  }

  generate(): ThemeJson {
    return {
      $schema: 'https://schemas.wp.org/trunk/theme.json',
      version: 2,
      settings: this.generateSettings(),
      styles: this.generateStyles(),
      templateParts: this.generateTemplateParts(),
    };
  }

  private generateSettings(): ThemeSettings {
    const t = this.tokens;
    return {
      color: this.generateColorSettings(),
      typography: this.generateTypographySettings(),
      spacing: this.generateSpacingSettings(),
      layout: {
        contentSize: t.sizing.container || '1200px',
        wideSize: t.sizing.wide || t.sizing.container || '1440px',
      },
      border: {
        color: true,
        radius: true,
        style: true,
        width: true,
      },
      custom: {
        borderRadius: t.borderRadius,
        shadow: t.shadows,
      },
    };
  }

  private generateColorSettings(): ColorSettings {
    const palette: PaletteItem[] = [];
    const c = this.tokens.colors;

    for (const [shade, color] of Object.entries(c.primary)) {
      palette.push({ slug: `primary-${shade}`, name: `Primary ${shade}`, color });
    }
    for (const [shade, color] of Object.entries(c.secondary)) {
      palette.push({ slug: `secondary-${shade}`, name: `Secondary ${shade}`, color });
    }
    for (const [shade, color] of Object.entries(c.accent)) {
      palette.push({ slug: `accent-${shade}`, name: `Accent ${shade}`, color });
    }
    for (const [shade, color] of Object.entries(c.neutral)) {
      palette.push({ slug: `neutral-${shade}`, name: `Neutral ${shade}`, color });
    }
    for (const [shade, color] of Object.entries(c.success)) {
      palette.push({ slug: `success-${shade}`, name: `Success ${shade}`, color });
    }
    for (const [shade, color] of Object.entries(c.warning)) {
      palette.push({ slug: `warning-${shade}`, name: `Warning ${shade}`, color });
    }
    for (const [shade, color] of Object.entries(c.error)) {
      palette.push({ slug: `error-${shade}`, name: `Error ${shade}`, color });
    }
    for (const [shade, color] of Object.entries(c.info)) {
      palette.push({ slug: `info-${shade}`, name: `Info ${shade}`, color });
    }

    palette.push(
      { slug: 'bg-body', name: 'Body Background', color: c.background.body },
      { slug: 'bg-surface', name: 'Surface Background', color: c.background.surface },
      { slug: 'text-primary', name: 'Text Primary', color: c.text.primary },
      { slug: 'text-secondary', name: 'Text Secondary', color: c.text.secondary },
      { slug: 'border-default', name: 'Border Default', color: c.border.default },
    );

    if (c.ecommerce) {
      for (const [key, color] of Object.entries(c.ecommerce)) {
        palette.push({ slug: `ecommerce-${key}`, name: `Ecommerce ${key}`, color });
      }
    }

    return {
      palette,
      link: true,
      button: true,
      defaultPalette: false,
    };
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
      fontSizes.push({
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        size,
      });
    }

    const ts = t.textStyles;
    fontSizes.push(
      { name: 'H1', slug: 'h1', size: ts.h1.fontSize },
      { name: 'H2', slug: 'h2', size: ts.h2.fontSize },
      { name: 'H3', slug: 'h3', size: ts.h3.fontSize },
      { name: 'H4', slug: 'h4', size: ts.h4.fontSize },
      { name: 'Body Large', slug: 'body-large', size: ts.bodyLarge.fontSize },
      { name: 'Body Small', slug: 'body-small', size: ts.bodySmall.fontSize },
      { name: 'Caption', slug: 'caption', size: ts.caption.fontSize },
    );

    return {
      fontFamilies,
      fontSizes,
      customFontSize: true,
      dropCap: true,
    };
  }

  private generateSpacingSettings(): SpacingSettings {
    const spacingSizes: SpacingSizeItem[] = [];
    for (const [slug, size] of Object.entries(this.tokens.spacing)) {
      spacingSizes.push({
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        size,
      });
    }

    return {
      padding: true,
      margin: true,
      spacingScale: [
        { operator: '*', increment: 1.5, steps: 7, mediumStep: 1.5, unit: 'rem' },
      ],
      spacingSizes,
      units: ['px', 'em', 'rem', '%', 'vh', 'vw'],
    };
  }

  private generateStyles(): ThemeStyles {
    const c = this.tokens.colors;
    const t = this.tokens.typography;

    return {
      color: {
        text: c.text.primary,
        background: c.background.body,
        link: c.primary['500'],
      },
      typography: {
        fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
        fontSize: t.textStyles.body.fontSize,
        lineHeight: t.textStyles.body.lineHeight,
      },
      spacing: {
        blockGap: this.tokens.spacing['4'] || '1rem',
      },
      elements: {
        link: {
          color: { text: c.primary['500'] },
        },
        heading: {
          color: { text: c.text.primary },
          typography: {
            fontFamily: `${t.fontFamilies.heading.name}, ${t.fontFamilies.heading.fallback}`,
            fontWeight: '700',
            lineHeight: '1.25',
          },
        },
        button: {
          color: { text: '#ffffff', background: c.primary['500'] },
          typography: {
            fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
            fontWeight: '600',
          },
          border: { radius: '8px' },
        },
      },
      blocks: {
        'core/group': {
          spacing: {
            padding: {
              top: 'var(--spacing-8)',
              right: 'var(--spacing-4)',
              bottom: 'var(--spacing-8)',
              left: 'var(--spacing-4)',
            },
          },
        },
        'core/columns': {
          spacing: {
            blockGap: 'var(--spacing-8)',
          },
        },
        'core/post-title': {
          color: { text: c.text.primary },
          typography: {
            fontFamily: `${t.fontFamilies.heading.name}, ${t.fontFamilies.heading.fallback}`,
          },
        },
        'core/paragraph': {
          color: { text: c.text.secondary },
          typography: {
            fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}`,
          },
        },
        'core/button': {
          color: { text: '#ffffff', background: c.primary['500'] },
          typography: { fontFamily: `${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback}` },
          border: { radius: '8px' },
        },
      },
    };
  }

  private generateTemplateParts(): TemplatePart[] {
    return [
      { name: 'header', title: 'Header', area: 'header' },
      { name: 'footer', title: 'Footer', area: 'footer' },
      { name: 'sidebar', title: 'Sidebar', area: 'sidebar' },
    ];
  }

  toJSON(pretty: boolean = true): string {
    return JSON.stringify(this.generate(), null, pretty ? 2 : undefined);
  }
}
