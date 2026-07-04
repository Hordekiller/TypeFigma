import type { ExtractedTokens, FigmaAnalysis, LayoutCSS } from '@typefigma/analyzer';
import type { TailwindOutput } from './types.js';

export { TailwindOutput };

export class TailwindV4Generator {
  private tokens: ExtractedTokens;

  constructor(tokens: ExtractedTokens) {
    this.tokens = tokens;
  }

  generate(_analysis?: FigmaAnalysis): TailwindOutput {
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

    lines.push(`  --color-background-body: ${c.background?.body || '#ffffff'};`);
    lines.push(`  --color-background-surface: ${c.background?.surface || '#fafafa'};`);
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
    lines.push('    background-color: var(--color-background-body);');
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
.btn-primary:hover { background-color: var(--color-primary-700); }
.btn-outline { background: transparent; border-color: var(--color-primary-500); color: var(--color-primary-500); }
.btn-outline:hover { background-color: var(--color-primary-50, #eff6ff); }
.btn-lg { padding: var(--spacing-4) var(--spacing-8); font-size: var(--font-size-lg, 1.125rem); }
.btn-sm { padding: var(--spacing-2) var(--spacing-4); font-size: var(--font-size-sm, 0.875rem); }
.btn-block { width: 100%; }
`,
      'product-card': `.product-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--duration-base) var(--timing-ease);
  height: 100%;
  background-color: white;
  box-shadow: var(--shadow-sm);
}
.product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.product-card__image-wrapper { position: relative; aspect-ratio: 1 / 1; overflow: hidden; }
.product-card__image { width: 100%; height: 100%; object-fit: cover; transition: transform var(--duration-base) var(--timing-ease); }
.product-card:hover .product-card__image { transform: scale(1.05); }
.product-card__content { padding: var(--spacing-4); }
.product-card__title { font-size: var(--font-size-base, 1rem); font-weight: 600; margin-bottom: var(--spacing-2); }
.product-card__price { display: flex; align-items: center; gap: var(--spacing-2); }
.product-card__price-regular { font-weight: 600; color: var(--color-text-primary); }
.product-card__price-sale { color: var(--color-ecommerce-sale, #ef4444); font-weight: 600; }
.product-card__rating { margin-bottom: var(--spacing-2); }
.product-card__badge { position: absolute; padding: var(--spacing-1) var(--spacing-2); font-size: var(--font-size-xs, 0.75rem); font-weight: 700; text-transform: uppercase; border-radius: var(--radius-sm); z-index: 1; }
.product-card__badge--top-right { top: var(--spacing-2); right: var(--spacing-2); }
.product-card__badge--top-left { top: var(--spacing-2); left: var(--spacing-2); }
.product-card__badge--sale { background-color: var(--color-ecommerce-sale, #ef4444); color: white; }
.product-card__badge--new { background-color: var(--color-ecommerce-newArrival, #10b981); color: white; }
.product-card__actions { position: absolute; top: var(--spacing-2); left: var(--spacing-2); display: flex; flex-direction: column; gap: var(--spacing-1); opacity: 0; transition: opacity var(--duration-base) var(--timing-ease); }
.product-card:hover .product-card__actions { opacity: 1; }
.product-card__add-to-cart { width: 100%; margin-top: var(--spacing-3); }
`,
      'product-detail': `.product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-8); padding: var(--spacing-8); }
.product-detail--fullwidth { grid-template-columns: 1fr; }
.product-detail--sidebar-right { grid-template-columns: 1fr 360px; }
.product-detail--sidebar-left { grid-template-columns: 360px 1fr; }
.product-gallery__main { border-radius: var(--radius-lg); overflow: hidden; margin-bottom: var(--spacing-4); }
.product-gallery__thumbnails { display: flex; gap: var(--spacing-2); }
.product-gallery__thumb { width: 80px; height: 80px; border-radius: var(--radius-md); overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color var(--duration-base) var(--timing-ease); }
.product-gallery__thumb.active { border-color: var(--color-primary-500); }
.product-price { display: flex; align-items: baseline; gap: var(--spacing-3); margin: var(--spacing-4) 0; }
.price-regular { font-size: var(--font-size-3xl, 1.875rem); font-weight: 700; }
.price-sale { font-size: var(--font-size-3xl, 1.875rem); font-weight: 700; color: var(--color-ecommerce-sale, #ef4444); }
.price-savings { font-size: var(--font-size-sm, 0.875rem); color: var(--color-ecommerce-sale, #ef4444); }
`,
      'header': `.site-header { position: relative; z-index: 50; background: white; border-bottom: 1px solid var(--color-border-default); }
.header-inner { display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-4) 0; gap: var(--spacing-4); }
.header--sticky { position: sticky; top: 0; }
.header--transparent { background: transparent; border-bottom: none; position: absolute; width: 100%; }
.header-actions { display: flex; align-items: center; gap: var(--spacing-3); }
`,
      'hero': `.hero { position: relative; padding: var(--spacing-16) 0; }
.hero--fullwidth { min-height: 70vh; display: flex; align-items: center; }
.hero--centered { text-align: center; }
.hero--split { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-8); align-items: center; }
.hero--overlay { color: white; }
.hero-title { font-size: var(--font-size-5xl, 3rem); font-weight: 700; line-height: 1.1; margin-bottom: var(--spacing-4); }
.hero-description { font-size: var(--font-size-xl, 1.25rem); color: inherit; opacity: 0.9; margin-bottom: var(--spacing-6); max-width: 600px; }
.hero-actions { display: flex; gap: var(--spacing-3); flex-wrap: wrap; }
`,
      'footer': `.site-footer { background: var(--color-neutral-900); color: white; padding: var(--spacing-16) 0; }
.footer-grid { display: grid; gap: var(--spacing-8); margin-bottom: var(--spacing-8); }
.footer-grid--2-cols { grid-template-columns: repeat(2, 1fr); }
.footer-grid--3-cols { grid-template-columns: repeat(3, 1fr); }
.footer-grid--4-cols { grid-template-columns: repeat(4, 1fr); }
.footer-heading { font-size: var(--font-size-sm, 0.875rem); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--spacing-4); color: var(--color-neutral-300); }
.footer-links li { margin-bottom: var(--spacing-2); }
.footer-links a { color: var(--color-neutral-400); transition: color var(--duration-base) var(--timing-ease); }
.footer-links a:hover { color: white; }
.footer-social { display: flex; gap: var(--spacing-4); margin-bottom: var(--spacing-8); }
.footer-bottom { border-top: 1px solid var(--color-neutral-700); padding-top: var(--spacing-6); text-align: center; font-size: var(--font-size-sm, 0.875rem); color: var(--color-neutral-400); }
`,
      'section': `.section { padding: var(--spacing-16) 0; }
.section--muted { background-color: var(--color-background-surface, #fafafa); }
.section-header { text-align: center; max-width: 720px; margin: 0 auto var(--spacing-10); }
.section-title { font-size: var(--font-size-3xl, 1.875rem); font-weight: 700; margin-bottom: var(--spacing-4); }
.section-description { font-size: var(--font-size-lg, 1.125rem); color: var(--color-text-secondary); }
`,
      'form': `.contact-form { max-width: 600px; margin: 0 auto; }
.form-group { margin-bottom: var(--spacing-4); }
.form-label { display: block; font-size: var(--font-size-sm, 0.875rem); font-weight: 500; margin-bottom: var(--spacing-1); color: var(--color-text-primary); }
.form-control { width: 100%; padding: var(--spacing-3) var(--spacing-4); border: 1px solid var(--color-border-default); border-radius: var(--radius-md); font-size: var(--font-size-base, 1rem); transition: border-color var(--duration-base) var(--timing-ease); }
.form-control:focus { outline: none; border-color: var(--color-border-focus); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-border-focus) 20%, transparent); }
textarea.form-control { min-height: 120px; resize: vertical; }
.newsletter-form { display: flex; gap: var(--spacing-3); max-width: 480px; margin: 0 auto; }
.newsletter-form .form-control { flex: 1; }
`,
      'post-card': `.post-card { border-radius: var(--radius-lg); overflow: hidden; background: white; box-shadow: var(--shadow-sm); transition: all var(--duration-base) var(--timing-ease); }
.post-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.post-card__image { aspect-ratio: 16 / 9; overflow: hidden; }
.post-card__image img { width: 100%; height: 100%; object-fit: cover; }
.post-card__content { padding: var(--spacing-4); }
.post-card__category { font-size: var(--font-size-xs, 0.75rem); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
.post-card__title { font-size: var(--font-size-lg, 1.125rem); font-weight: 700; margin: var(--spacing-2) 0; }
.post-card__excerpt { color: var(--color-text-secondary); font-size: var(--font-size-sm, 0.875rem); margin-bottom: var(--spacing-3); }
.post-card__meta { display: flex; gap: var(--spacing-4); font-size: var(--font-size-xs, 0.75rem); color: var(--color-neutral-400); }
`,
      'cart': `.cart-table { width: 100%; border-collapse: collapse; }
.cart-table th, .cart-table td { padding: var(--spacing-4); text-align: left; border-bottom: 1px solid var(--color-border-default); }
.cart-table th { font-weight: 600; background: var(--color-background-surface); }
.cart-item img { border-radius: var(--radius-default); }
.cart-quantity input { width: 60px; padding: var(--spacing-2); border: 1px solid var(--color-border-default); border-radius: var(--radius-default); text-align: center; }
.cart-remove button { background: none; border: none; cursor: pointer; font-size: 1.25rem; color: var(--color-text-secondary); }
.cart-remove button:hover { color: var(--color-error-500); }
.cart-totals td { padding-top: var(--spacing-6); }
.coupon-form { display: flex; gap: var(--spacing-2); }
.coupon-form input { padding: var(--spacing-2) var(--spacing-3); border: 1px solid var(--color-border-default); border-radius: var(--radius-default); }
.cart-actions { display: flex; justify-content: space-between; margin-top: var(--spacing-4); }
`,
      'checkout': `.checkout-wrapper { display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--spacing-8); align-items: start; }
.checkout-section { margin-bottom: var(--spacing-6); padding: var(--spacing-6); background: var(--color-background-surface); border-radius: var(--radius-lg); }
.checkout-heading { font-size: var(--font-size-lg, 1.125rem); font-weight: 700; margin-bottom: var(--spacing-4); padding-bottom: var(--spacing-3); border-bottom: 1px solid var(--color-border-default); }
.form-row { margin-bottom: var(--spacing-4); }
.form-row label { display: block; font-weight: 500; margin-bottom: var(--spacing-1); font-size: var(--font-size-sm, 0.875rem); }
.form-row input, .form-row select, .form-row textarea { width: 100%; padding: var(--spacing-3); border: 1px solid var(--color-border-default); border-radius: var(--radius-default); font-size: var(--font-size-base, 1rem); transition: all var(--duration-fast) var(--timing-ease); }
.form-row input:focus, .form-row select:focus, .form-row textarea:focus { outline: none; border-color: var(--color-border-focus); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-border-focus) 20%, transparent); }
.form-row--half { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-4); }
.payment-methods { border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); overflow: hidden; }
.payment-method { padding: var(--spacing-4); border-bottom: 1px solid var(--color-border-default); display: flex; align-items: center; gap: var(--spacing-3); }
.payment-method:last-child { border-bottom: none; }
.checkout-summary { background: var(--color-background-surface); padding: var(--spacing-6); border-radius: var(--radius-lg); position: sticky; top: var(--spacing-4); }
.order-review-row { display: flex; justify-content: space-between; padding: var(--spacing-3) 0; }
.order-review-total { font-weight: 700; font-size: var(--font-size-lg, 1.125rem); border-top: 1px solid var(--color-border-default); padding-top: var(--spacing-4); margin-top: var(--spacing-2); }
@media (max-width: 768px) { .checkout-wrapper { grid-template-columns: 1fr; } .form-row--half { grid-template-columns: 1fr; } }
`,
      'testimonial': `.testimonial-card { padding: var(--spacing-6); border-radius: var(--radius-lg); background: white; box-shadow: var(--shadow-sm); }
.testimonial-card__avatar { width: 64px; height: 64px; border-radius: 9999px; margin-bottom: var(--spacing-4); }
.testimonial-card__text { font-size: var(--font-size-base, 1rem); line-height: 1.7; color: var(--color-text-primary); margin-bottom: var(--spacing-4); font-style: italic; }
.testimonial-card__author { font-weight: 600; display: block; }
.testimonial-card__role { font-size: var(--font-size-sm, 0.875rem); color: var(--color-text-secondary); }
`,
      'gallery': `.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-4); }
.gallery-item { position: relative; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 4 / 3; cursor: pointer; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--duration-slow, 300ms) var(--timing-ease); }
.gallery-item:hover img { transform: scale(1.1); }
.gallery-item__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity var(--duration-base) var(--timing-ease); }
.gallery-item:hover .gallery-item__overlay { opacity: 1; }
`,
    };
  }

  private generateUtilities(): string[] {
    return [
      '.flex-center { display: flex; align-items: center; justify-content: center; }',
      '.text-balance { text-wrap: balance; }',
      '.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }',
      '.scrollbar-hide::-webkit-scrollbar { display: none; }',
      '.container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 var(--spacing-4); }',
      '.grid--auto-fit { grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }',
      '.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }',
      '.stars { color: var(--color-ecommerce-rating, #f59e0b); font-size: var(--font-size-sm, 0.875rem); letter-spacing: 2px; }',
      '.page-wrapper { min-height: 100vh; display: flex; flex-direction: column; }',
      '.page-wrapper .site-footer { margin-top: auto; }',
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
