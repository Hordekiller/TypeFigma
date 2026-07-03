import type { ExtractedTokens, FigmaAnalysis, LayoutCSS } from '@typefigma/analyzer';

export interface TailwindOutput {
  css: string;
  components: Record<string, string>;
  utilities: string[];
}

export class TailwindV4Generator {
  private tokens: ExtractedTokens;

  constructor(tokens: ExtractedTokens) {
    this.tokens = tokens;
  }

  generate(_analysis: FigmaAnalysis): TailwindOutput {
    return {
      css: this.generateThemeCSS(),
      components: {},
      utilities: [],
    };
  }

  generateThemeCSS(): string {
    const c = this.tokens.colors;
    const t = this.tokens.typography;
    const lines: string[] = [
      '@import "tailwindcss";',
      '',
      '@theme {',
    ];

    for (const [shade, hex] of Object.entries(c.primary)) {
      lines.push(`  --color-primary-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.secondary)) {
      lines.push(`  --color-secondary-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.accent)) {
      lines.push(`  --color-accent-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.neutral)) {
      lines.push(`  --color-neutral-${shade}: ${hex};`);
    }

    lines.push(`  --color-body-bg: ${c.background.body};`);
    lines.push(`  --color-surface-bg: ${c.background.surface};`);
    lines.push(`  --color-text-primary: ${c.text.primary};`);
    lines.push(`  --color-text-secondary: ${c.text.secondary};`);

    lines.push('');
    lines.push(`  --font-heading: ${t.fontFamilies.heading.name}, ${t.fontFamilies.heading.fallback};`);
    lines.push(`  --font-body: ${t.fontFamilies.body.name}, ${t.fontFamilies.body.fallback};`);

    lines.push('');
    for (const [key, val] of Object.entries(t.fontSizes)) {
      lines.push(`  --font-size-${key}: ${val};`);
    }

    lines.push('');
    for (const [key, val] of Object.entries(this.tokens.spacing)) {
      lines.push(`  --spacing-${key}: ${val};`);
    }

    lines.push('');
    for (const [key, val] of Object.entries(this.tokens.borderRadius)) {
      if (key === 'none') {
        lines.push(`  --radius-none: ${val};`);
      } else {
        lines.push(`  --radius-${key}: ${val};`);
      }
    }

    lines.push('');
    for (const [key, val] of Object.entries(this.tokens.shadows)) {
      if (val !== 'none') {
        lines.push(`  --shadow-${key}: ${val};`);
      }
    }

    for (const [bp, val] of Object.entries(this.tokens.breakpoints)) {
      lines.push(`  --breakpoint-${bp}: ${val};`);
    }

    lines.push('}');
    lines.push('');
    lines.push('@layer base {');
    lines.push('  body {');
    lines.push('    font-family: var(--font-body);');
    lines.push('    color: var(--color-text-primary);');
    lines.push('    background-color: var(--color-body-bg);');
    lines.push('  }');
    lines.push('}');

    return lines.join('\n');
  }

  layoutToTailwind(layout: LayoutCSS): string[] {
    const classes: string[] = [];

    if (layout.display === 'flex') {
      classes.push('flex');
      if (layout.flexDirection === 'column') classes.push('flex-col');
      if (layout.flexWrap === 'wrap') classes.push('flex-wrap');
      if (layout.justifyContent === 'center') classes.push('justify-center');
      if (layout.justifyContent === 'space-between') classes.push('justify-between');
      if (layout.justifyContent === 'flex-end') classes.push('justify-end');
      if (layout.alignItems === 'center') classes.push('items-center');
      if (layout.alignItems === 'stretch') classes.push('items-stretch');
      if (layout.alignItems === 'flex-end') classes.push('items-end');
    }

    if (layout.display === 'grid') {
      classes.push('grid');
    }

    if (layout.position === 'absolute') {
      classes.push('absolute');
      if (layout.top) classes.push(`top-[${layout.top}]`);
      if (layout.right) classes.push(`right-[${layout.right}]`);
      if (layout.bottom) classes.push(`bottom-[${layout.bottom}]`);
      if (layout.left) classes.push(`left-[${layout.left}]`);
    }

    if (layout.width === 'fit-content') classes.push('w-fit');
    if (layout.height === 'fit-content') classes.push('h-fit');
    if (layout.minWidth) classes.push(`min-w-[${layout.minWidth}]`);
    if (layout.maxWidth) classes.push(`max-w-[${layout.maxWidth}]`);

    if (layout.padding && !layout.padding.includes(' ')) {
      classes.push(`p-[${layout.padding}]`);
    }
    if (layout.gap) {
      const gapVal = parseInt(layout.gap);
      if (!isNaN(gapVal) && gapVal <= 64 && gapVal % 4 === 0) {
        classes.push(`gap-${gapVal / 4}`);
      } else {
        classes.push(`gap-[${layout.gap}]`);
      }
    }

    if (layout.borderRadius) {
      if (layout.borderRadius === '9999px') {
        classes.push('rounded-full');
      } else {
        classes.push(`rounded-[${layout.borderRadius}]`);
      }
    }

    if (layout.flex) {
      classes.push(`flex-[${layout.flex}]`);
    }

    if (layout.opacity !== undefined && layout.opacity < 1) {
      classes.push(`opacity-${Math.round(layout.opacity * 100)}`);
    }

    return classes;
  }
}
