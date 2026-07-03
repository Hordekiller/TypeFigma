import type { ExtractedTokens, FigmaAnalysis, LayoutCSS } from '@typefigma/analyzer';
import type { TailwindOutput } from './types.js';

export { TailwindOutput };

export class TailwindV4Generator {
  private tokens: ExtractedTokens;

  constructor(tokens: ExtractedTokens) {
    this.tokens = tokens;
  }

  generate(_analysis: FigmaAnalysis): TailwindOutput {
    return {
      css: this.generateThemeCSS(),
      components: this.generateComponentsCSS(),
      utilities: this.generateUtilities(),
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

    for (const [shade, hex] of Object.entries(c.primary || {})) {
      lines.push(`  --color-primary-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.secondary || {})) {
      lines.push(`  --color-secondary-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.accent || {})) {
      lines.push(`  --color-accent-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.neutral || {})) {
      lines.push(`  --color-neutral-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.success || {})) {
      lines.push(`  --color-success-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.warning || {})) {
      lines.push(`  --color-warning-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.error || {})) {
      lines.push(`  --color-error-${shade}: ${hex};`);
    }
    for (const [shade, hex] of Object.entries(c.info || {})) {
      lines.push(`  --color-info-${shade}: ${hex};`);
    }

    lines.push(`  --color-body-bg: ${c.background?.body || '#ffffff'};`);
    lines.push(`  --color-surface-bg: ${c.background?.surface || '#fafafa'};`);
    lines.push(`  --color-text-primary: ${c.text?.primary || '#171717'};`);
    lines.push(`  --color-text-secondary: ${c.text?.secondary || '#737373'};`);
    lines.push(`  --color-text-disabled: ${c.text?.disabled || '#a3a3a3'};`);
    lines.push(`  --color-text-inverse: ${c.text?.inverse || '#ffffff'};`);
    lines.push(`  --color-border-default: ${c.border?.default || '#e5e5e5'};`);
    lines.push(`  --color-border-hover: ${c.border?.hover || '#d4d4d4'};`);
    lines.push(`  --color-border-focus: ${c.border?.focus || '#3b82f6'};`);

    if (c.ecommerce) {
      for (const [key, hex] of Object.entries(c.ecommerce)) {
        lines.push(`  --color-ecommerce-${key}: ${hex};`);
      }
    }

    lines.push('');
    lines.push(`  --font-heading: ${t.fontFamilies?.heading?.name || 'Inter'}, ${t.fontFamilies?.heading?.fallback || 'system-ui, sans-serif'};`);
    lines.push(`  --font-body: ${t.fontFamilies?.body?.name || 'Inter'}, ${t.fontFamilies?.body?.fallback || 'system-ui, sans-serif'};`);
    if (t.fontFamilies?.mono) {
      lines.push(`  --font-mono: ${t.fontFamilies.mono.name}, ${t.fontFamilies.mono.fallback};`);
    }

    lines.push('');
    for (const [key, val] of Object.entries(t.fontSizes || {})) {
      lines.push(`  --font-size-${key}: ${val};`);
    }

    lines.push('');
    for (const [key, val] of Object.entries(this.tokens.spacing || {})) {
      lines.push(`  --spacing-${key}: ${val};`);
    }

    lines.push('');
    for (const [key, val] of Object.entries(this.tokens.borderRadius || {})) {
      if (key === 'none') {
        lines.push(`  --radius-none: ${val};`);
      } else {
        lines.push(`  --radius-${key}: ${val};`);
      }
    }

    lines.push('');
    for (const [key, val] of Object.entries(this.tokens.shadows || {})) {
      if (val !== 'none') {
        lines.push(`  --shadow-${key}: ${val};`);
      }
    }

    for (const [bp, val] of Object.entries(this.tokens.breakpoints || {})) {
      lines.push(`  --breakpoint-${bp}: ${val};`);
    }

    lines.push('}');
    lines.push('');
    lines.push('@layer base {');
    lines.push('  *, *::before, *::after { box-sizing: border-box; }');
    lines.push('  body {');
    lines.push('    font-family: var(--font-body);');
    lines.push('    color: var(--color-text-primary);');
    lines.push('    background-color: var(--color-body-bg);');
    lines.push('    -webkit-font-smoothing: antialiased;');
    lines.push('    -moz-osx-font-smoothing: grayscale;');
    lines.push('  }');
    lines.push('  img, picture, video, canvas, svg { display: block; max-width: 100%; }');
    lines.push('  img { height: auto; }');
    lines.push('  input, button, textarea, select { font: inherit; }');
    lines.push('  :focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }');
    lines.push('  a { color: inherit; text-decoration: none; }');
    lines.push('  ul, ol { list-style: none; }');
    lines.push('}');
    lines.push('');

    return lines.join('\n');
  }

  private generateComponentsCSS(): Record<string, string> {
    return {
      'btn': `.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-family: var(--font-body);
  font-size: var(--font-size-base, 1rem);
  font-weight: 600;
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-base) var(--timing-ease);
  text-align: center;
  white-space: nowrap;
}
.btn-primary { background-color: var(--color-primary-500); color: white; }
.btn-outline { background: transparent; border-color: var(--color-primary-500); color: var(--color-primary-500); }
`,
      'product-card': `.product-card { border-radius: var(--radius-lg); overflow: hidden; transition: all var(--duration-base) var(--timing-ease); height: 100%; }
.product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
`,
    };
  }

  private generateUtilities(): string[] {
    return [
      '.flex-center { display: flex; align-items: center; justify-content: center; }',
      '.text-balance { text-wrap: balance; }',
      '.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }',
      '.scrollbar-hide::-webkit-scrollbar { display: none; }',
    ];
  }

  layoutToTailwind(layout: LayoutCSS): string[] {
    const classes: string[] = [];

    if (!layout || Object.keys(layout).length === 0) return classes;

    if (layout.display === 'flex') {
      classes.push('flex');
      if (layout.flexDirection === 'column') classes.push('flex-col');
      if (layout.flexDirection === 'row-reverse') classes.push('flex-row-reverse');
      if (layout.flexDirection === 'column-reverse') classes.push('flex-col-reverse');
      if (layout.flexWrap === 'wrap') classes.push('flex-wrap');
      if (layout.flexWrap === 'nowrap') classes.push('flex-nowrap');
      if (layout.justifyContent === 'center') classes.push('justify-center');
      if (layout.justifyContent === 'space-between') classes.push('justify-between');
      if (layout.justifyContent === 'space-around') classes.push('justify-around');
      if (layout.justifyContent === 'space-evenly') classes.push('justify-evenly');
      if (layout.justifyContent === 'flex-end') classes.push('justify-end');
      if (layout.justifyContent === 'flex-start') classes.push('justify-start');
      if (layout.alignItems === 'center') classes.push('items-center');
      if (layout.alignItems === 'stretch') classes.push('items-stretch');
      if (layout.alignItems === 'flex-end') classes.push('items-end');
      if (layout.alignItems === 'flex-start') classes.push('items-start');
      if (layout.alignItems === 'baseline') classes.push('items-baseline');
      if (layout.alignContent === 'center') classes.push('content-center');
      if (layout.alignContent === 'space-between') classes.push('content-between');
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
    if (layout.position === 'relative') classes.push('relative');
    if (layout.position === 'fixed') classes.push('fixed');
    if (layout.position === 'sticky') classes.push('sticky');

    if (layout.width === 'fit-content') classes.push('w-fit');
    if (layout.width === '100%') classes.push('w-full');
    if (layout.width && layout.width !== 'fit-content' && layout.width !== '100%' && !layout.width.includes('var(')) {
      classes.push(`w-[${layout.width}]`);
    }
    if (layout.height === 'fit-content') classes.push('h-fit');
    if (layout.height === '100%') classes.push('h-full');
    if (layout.height && layout.height !== 'fit-content' && layout.height !== '100%' && !layout.height.includes('var(')) {
      classes.push(`h-[${layout.height}]`);
    }
    if (layout.minWidth) classes.push(`min-w-[${layout.minWidth}]`);
    if (layout.maxWidth) classes.push(`max-w-[${layout.maxWidth}]`);
    if (layout.minHeight) classes.push(`min-h-[${layout.minHeight}]`);
    if (layout.maxHeight) classes.push(`max-h-[${layout.maxHeight}]`);

    if (layout.padding && !layout.padding.includes(' ')) {
      const pClass = this.pxToTailwindSpacing(layout.padding, 'p');
      if (pClass) classes.push(pClass);
    }

    if (layout.paddingTop) { const c = this.pxToTailwindSpacing(layout.paddingTop, 'pt'); if (c) classes.push(c); }
    if (layout.paddingRight) { const c = this.pxToTailwindSpacing(layout.paddingRight, 'pr'); if (c) classes.push(c); }
    if (layout.paddingBottom) { const c = this.pxToTailwindSpacing(layout.paddingBottom, 'pb'); if (c) classes.push(c); }
    if (layout.paddingLeft) { const c = this.pxToTailwindSpacing(layout.paddingLeft, 'pl'); if (c) classes.push(c); }

    if (layout.gap) {
      const gapClass = this.pxToTailwindSpacing(layout.gap, 'gap');
      if (gapClass) classes.push(gapClass);
    }

    if (layout.rowGap) { const c = this.pxToTailwindSpacing(layout.rowGap, 'gap-y'); if (c) classes.push(c); }
    if (layout.columnGap) { const c = this.pxToTailwindSpacing(layout.columnGap, 'gap-x'); if (c) classes.push(c); }

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

    if (layout.flexGrow !== undefined) {
      classes.push(`flex-grow-${layout.flexGrow}`);
    }

    if (layout.flexShrink !== undefined) {
      classes.push(`flex-shrink-${layout.flexShrink}`);
    }

    if (layout.alignSelf === 'center') classes.push('self-center');
    if (layout.alignSelf === 'flex-end') classes.push('self-end');
    if (layout.alignSelf === 'flex-start') classes.push('self-start');
    if (layout.alignSelf === 'stretch') classes.push('self-stretch');

    if (layout.justifySelf === 'center') classes.push('justify-self-center');
    if (layout.justifySelf === 'end') classes.push('justify-self-end');
    if (layout.justifySelf === 'start') classes.push('justify-self-start');

    if (layout.aspectRatio === '1/1') classes.push('aspect-square');
    if (layout.aspectRatio === '16/9') classes.push('aspect-video');
    if (layout.aspectRatio === '4/3') classes.push('aspect-[4/3]');

    if (layout.overflow === 'hidden') classes.push('overflow-hidden');
    if (layout.overflow === 'scroll') classes.push('overflow-scroll');
    if (layout.overflow === 'auto') classes.push('overflow-auto');

    if (layout.objectFit === 'cover') classes.push('object-cover');
    if (layout.objectFit === 'contain') classes.push('object-contain');

    if (layout.opacity !== undefined && layout.opacity < 1) {
      classes.push(`opacity-${Math.round(layout.opacity * 100)}`);
    }

    return classes;
  }

  private pxToTailwindSpacing(val: string, prefix: string): string | null {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return null;

    if (val.endsWith('px')) {
      if (parsed === 0) return `${prefix}-0`;
      if (parsed % 4 === 0 && parsed <= 96) {
        return `${prefix}-${parsed / 4}`;
      }
      return `${prefix}-[${val}]`;
    }

    if (val.endsWith('rem')) {
      if (parsed === 0) return `${prefix}-0`;
      const px = parsed * 16;
      if (px % 4 === 0 && px <= 96) {
        return `${prefix}-${px / 4}`;
      }
      return `${prefix}-[${val}]`;
    }

    return null;
  }

  componentToTailwind(componentType: string, _tokens: ExtractedTokens): string[] {
    const classes: string[] = [];

    switch (componentType) {
      case 'hero':
        classes.push('py-16', 'bg-neutral-100', 'relative', 'overflow-hidden');
        break;
      case 'header':
        classes.push('py-4', 'bg-white', 'border-b', 'border-gray-200');
        break;
      case 'footer':
        classes.push('py-16', 'bg-neutral-900', 'text-white');
        break;
      case 'product-card':
        classes.push('bg-white', 'rounded-lg', 'shadow-sm', 'overflow-hidden', 'hover:shadow-md', 'transition-shadow', 'h-full');
        break;
      case 'section':
        classes.push('py-16');
        break;
      case 'button-primary':
        classes.push('inline-flex', 'items-center', 'px-6', 'py-3', 'bg-primary-500', 'text-white', 'rounded-md', 'font-semibold', 'hover:bg-primary-600', 'transition-colors');
        break;
    }

    return classes;
  }
}
