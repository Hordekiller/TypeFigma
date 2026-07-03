import type { ExtractedTokens, ColorTokens, TypographyTokens } from '@typefigma/analyzer';

export class CssGenerator {
  generateGlobal(tokens: ExtractedTokens): string {
    return `/* ============================================
   Design Tokens — Generated from Figma
   ============================================ */

:root {
  ${this.generateColorVariables(tokens.colors)}
  ${this.generateTypographyVariables(tokens.typography)}
  ${this.generateSpacingVariables(tokens.spacing)}
  ${this.generateShadowVariables(tokens.shadows)}
  ${this.generateBorderVariables(tokens.borderRadius)}
  ${this.generateTransitionVariables(tokens)}
}

/* ============================================
   Base Styles
   ============================================ */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html { font-size: 16px; scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background-color: var(--color-background-body);
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; }

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

/* ============================================
   Typography
   ============================================ */

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
}

h1 { font-size: var(--text-h1); }
h2 { font-size: var(--text-h2); }
h3 { font-size: var(--text-h3); }
h4 { font-size: var(--text-h4); }

/* ============================================
   Buttons
   ============================================ */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  border: var(--border-width-default) solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
  box-shadow: var(--shadow-button);
}
.btn-primary:hover {
  background-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-button-hover);
}

.btn-outline {
  background: transparent;
  border-color: var(--color-primary-500);
  color: var(--color-primary-500);
}
.btn-outline:hover {
  background: var(--color-primary-500);
  color: white;
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border-default);
  border-style: solid;
}
.btn-secondary:hover {
  color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

/* ============================================
   Header
   ============================================ */

.site-header {
  padding: var(--spacing-4) 0;
  background: var(--color-background-surface);
  border-bottom: var(--border-width-default) solid var(--color-border-default);
}

.header--transparent {
  position: absolute; top: 0; left: 0; right: 0;
  background: transparent; border: none; z-index: 100;
}

.header--sticky {
  position: sticky; top: 0; z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
}

.main-nav .nav-menu {
  display: flex;
  gap: var(--spacing-6);
}

.main-nav .menu-item a {
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.main-nav .menu-item a:hover {
  color: var(--color-primary-500);
}

/* ============================================
   Hero
   ============================================ */

.hero {
  padding: var(--spacing-16) 0;
  background: var(--color-neutral-100);
}

.hero--fullwidth .hero-content {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.hero--centered .hero-content {
  text-align: center;
  max-width: 640px;
  margin: 0 auto;
}

.hero--split .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-8);
  align-items: center;
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: 800;
  line-height: var(--leading-tight);
  margin-bottom: var(--spacing-4);
}

.hero-description {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

/* ============================================
   Sections
   ============================================ */

.section {
  padding: var(--spacing-16) 0;
}

.section-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto var(--spacing-12);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
}

.section-description {
  color: var(--color-text-secondary);
  font-size: var(--text-lg);
}

/* ============================================
   Product Card
   ============================================ */

.product-card {
  background: var(--color-background-surface);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-4px);
}

.product-card__image-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--color-neutral-100);
}

.product-card__image {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.product-card:hover .product-card__image {
  transform: scale(1.05);
}

.product-card__badge {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.product-card__badge--sale {
  background: var(--color-sale, #ef4444);
  color: white;
}

.product-card__badge--new {
  background: var(--color-ecommerce-new-arrival, #10b981);
  color: white;
}

.product-card__actions {
  position: absolute;
  top: var(--spacing-3);
  left: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  opacity: 0;
  transform: translateX(-10px);
  transition: var(--transition-base);
}

.product-card:hover .product-card__actions {
  opacity: 1;
  transform: translateX(0);
}

.product-card__wishlist,
.product-card__quick-view {
  width: 40px; height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: var(--transition-base);
}

.product-card__wishlist:hover,
.product-card__quick-view:hover {
  background: var(--color-primary-500);
  color: white;
  transform: scale(1.1);
}

.product-card__content {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  flex: 1;
}

.product-card__rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.product-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  margin: 0;
}

.product-card__title a {
  color: var(--color-text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.product-card__title a:hover {
  color: var(--color-primary-500);
}

.product-card__excerpt {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: var(--spacing-3);
  border-top: var(--border-width-default) solid var(--color-border-default);
}

.product-card__price {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.product-card__price-regular {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.product-card__price-sale {
  color: var(--color-ecommerce-sale-price, #ef4444);
  font-weight: var(--font-weight-bold);
  margin-left: var(--spacing-1);
}

.product-card__add-to-cart {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: var(--radius-default);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
}

.product-card__add-to-cart:hover {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-button-hover);
}

/* ============================================
   Product Detail - Gallery
   ============================================ */

.product-detail__gallery {
  position: sticky;
  top: var(--spacing-8);
}

.product-gallery {
  display: flex;
  gap: var(--spacing-4);
}

.product-gallery__main {
  position: relative;
  flex: 1;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: zoom-in;
}

.product-gallery__main img {
  width: 100%; height: 100%;
  object-fit: cover;
}

.product-gallery__thumbnails {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.product-gallery__thumb {
  width: 80px; height: 80px;
  border: 2px solid transparent;
  border-radius: var(--radius-default);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition-base);
  background: none;
  padding: 0;
}

.product-gallery__thumb:hover,
.product-gallery__thumb.active {
  border-color: var(--color-primary-500);
}

.product-gallery__thumb img {
  width: 100%; height: 100%;
  object-fit: cover;
}

/* ============================================
   Product Detail - Meta
   ============================================ */

.product-detail__meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.product-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  margin: 0;
  color: var(--color-text-primary);
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.price-regular {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
}

.price-sale {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-ecommerce-sale-price, #ef4444);
}

.price-regular + .price-sale {
  color: var(--color-text-secondary);
  text-decoration: line-through;
  font-size: var(--text-xl);
}

.price-savings {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-success-100);
  color: var(--color-success-700);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-default);
}

.product-meta-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-default);
}

.product-meta-item {
  display: flex;
  gap: var(--spacing-2);
  font-size: var(--text-sm);
}

.product-meta-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  min-width: 100px;
}

.product-meta-value--in-stock { color: var(--color-ecommerce-in-stock, #10b981); }
.product-meta-value--out-of-stock { color: var(--color-ecommerce-out-of-stock, #6b7280); }

/* ============================================
   Add to Cart
   ============================================ */

.product-add-to-cart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  background: var(--color-background-surface);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-lg);
}

.product-quantity {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.product-quantity__input {
  display: flex;
  align-items: center;
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-default);
  overflow: hidden;
}

.qty-btn {
  width: 40px; height: 40px;
  border: none;
  background: var(--color-neutral-100);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: var(--transition-base);
}

.qty-input {
  width: 60px; height: 40px;
  border: none;
  border-left: var(--border-width-default) solid var(--color-border-default);
  border-right: var(--border-width-default) solid var(--color-border-default);
  text-align: center;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
}

.qty-input:focus { outline: none; }

.product-actions {
  display: flex;
  gap: var(--spacing-3);
}

.btn-add-to-cart {
  flex: 1;
  background: var(--color-primary-500);
  color: white;
  padding: var(--spacing-4) var(--spacing-6);
}

.btn-add-to-cart:hover {
  background: var(--color-primary-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-button-hover);
}

.btn-buy-now {
  flex: 1;
  background: var(--color-secondary-500);
  color: white;
  padding: var(--spacing-4) var(--spacing-6);
}

/* ============================================
   Product Tabs
   ============================================ */

.product-tabs-wrapper {
  margin-top: var(--spacing-12);
}

.product-tabs {
  display: flex;
  gap: var(--spacing-2);
  border-bottom: 2px solid var(--color-border-default);
  margin-bottom: var(--spacing-6);
}

.product-tab {
  padding: var(--spacing-3) var(--spacing-6);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-base);
}

.product-tab.active,
.product-tab:hover {
  color: var(--color-primary-500);
  border-bottom-color: var(--color-primary-500);
}

/* ============================================
   Reviews
   ============================================ */

.review {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4) 0;
  border-bottom: var(--border-width-default) solid var(--color-border-default);
}

.review__avatar img {
  width: 48px; height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.review__content { flex: 1; }

.review__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
}

.review__author {
  font-weight: var(--font-weight-semibold);
}

.review__verified {
  font-size: var(--text-xs);
  color: var(--color-ecommerce-in-stock, #10b981);
}

.review__date {
  margin-left: auto;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* ============================================
   Footer
   ============================================ */

.site-footer {
  background: var(--color-neutral-900);
  color: white;
  padding: var(--spacing-16) 0 var(--spacing-8);
}

.footer-grid {
  display: grid;
  gap: var(--spacing-8);
}

.footer-grid--4-cols { grid-template-columns: repeat(4, 1fr); }
.footer-grid--3-cols { grid-template-columns: repeat(3, 1fr); }
.footer-grid--2-cols { grid-template-columns: repeat(2, 1fr); }

.footer-heading {
  margin-bottom: var(--spacing-4);
  color: white;
}

.footer-links a {
  color: var(--color-neutral-400);
  transition: color var(--transition-fast);
}

.footer-links a:hover { color: white; }

.footer-bottom {
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-6);
  border-top: var(--border-width-default) solid var(--color-neutral-700);
  text-align: center;
  color: var(--color-neutral-500);
}

/* ============================================
   Forms
   ============================================ */

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-1);
  font-weight: var(--font-weight-medium);
}

.form-control,
.form-input {
  width: 100%;
  padding: var(--spacing-3);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  transition: var(--transition-base);
}

.form-control:focus,
.form-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

/* ============================================
   Responsive
   ============================================ */

@media (max-width: 768px) {
  .hero--split .container {
    grid-template-columns: 1fr;
  }

  .footer-grid--4-cols,
  .footer-grid--3-cols {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-nav { display: none; }
  .mobile-menu-toggle { display: flex; }

  .product-gallery {
    flex-direction: column;
  }

  .product-gallery__thumbnails {
    flex-direction: row;
  }
}

@media (max-width: 480px) {
  .footer-grid--4-cols,
  .footer-grid--3-cols,
  .footer-grid--2-cols {
    grid-template-columns: 1fr;
  }

  .product-actions {
    flex-direction: column;
  }
}
`;
  }

  // ── Variable Generators ────────────────────────────────

  private generateColorVariables(colors: ColorTokens): string {
    const vars: string[] = [];

    const addScale = (prefix: string, set: Record<string, string>) => {
      for (const [shade, hex] of Object.entries(set)) {
        vars.push(`--color-${prefix}-${shade}: ${hex};`);
      }
    };

    addScale('primary', colors.primary);
    addScale('secondary', colors.secondary);
    addScale('accent', colors.accent);
    addScale('neutral', colors.neutral);
    addScale('success', colors.success);
    addScale('warning', colors.warning);
    addScale('error', colors.error);
    addScale('info', colors.info);

    vars.push(`--color-background-body: ${colors.background.body};`);
    vars.push(`--color-background-surface: ${colors.background.surface};`);
    vars.push(`--color-background-overlay: ${colors.background.overlay};`);
    vars.push(`--color-text-primary: ${colors.text.primary};`);
    vars.push(`--color-text-secondary: ${colors.text.secondary};`);
    vars.push(`--color-text-disabled: ${colors.text.disabled};`);
    vars.push(`--color-text-inverse: ${colors.text.inverse};`);
    vars.push(`--color-border-default: ${colors.border.default};`);
    vars.push(`--color-border-hover: ${colors.border.hover};`);
    vars.push(`--color-border-focus: ${colors.border.focus};`);

    if (colors.ecommerce) {
      for (const [key, hex] of Object.entries(colors.ecommerce)) {
        vars.push(`--color-ecommerce-${key}: ${hex};`);
      }
    }

    return vars.join('\n  ');
  }

  private generateTypographyVariables(typography: TypographyTokens): string {
    const vars: string[] = [];

    vars.push(`--font-heading: '${typography.fontFamilies.heading.name}', ${typography.fontFamilies.heading.fallback};`);
    vars.push(`--font-body: '${typography.fontFamilies.body.name}', ${typography.fontFamilies.body.fallback};`);
    if (typography.fontFamilies.mono) {
      vars.push(`--font-mono: '${typography.fontFamilies.mono.name}', ${typography.fontFamilies.mono.fallback};`);
    }

    for (const [size, val] of Object.entries(typography.fontSizes)) {
      vars.push(`--text-${size}: ${val};`);
    }

    for (const [weight, val] of Object.entries(typography.fontWeights)) {
      vars.push(`--font-weight-${weight}: ${val};`);
    }

    for (const [lh, val] of Object.entries(typography.lineHeights)) {
      vars.push(`--leading-${lh}: ${val};`);
    }

    for (const [ls, val] of Object.entries(typography.letterSpacing)) {
      vars.push(`--tracking-${ls}: ${val};`);
    }

    const ts = typography.textStyles;
    vars.push(`--text-h1: ${ts.h1.fontSize};`);
    vars.push(`--text-h2: ${ts.h2.fontSize};`);
    vars.push(`--text-h3: ${ts.h3.fontSize};`);
    vars.push(`--text-h4: ${ts.h4.fontSize};`);
    vars.push(`--text-base: ${ts.body.fontSize};`);
    vars.push(`--text-sm: ${ts.bodySmall.fontSize};`);

    return vars.join('\n  ');
  }

  private generateSpacingVariables(spacing: Record<string, string>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(spacing)) {
      vars.push(`--spacing-${key}: ${val};`);
    }
    return vars.join('\n  ');
  }

  private generateShadowVariables(shadows: Record<string, string>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(shadows)) {
      vars.push(`--shadow-${key}: ${val};`);
    }
    return vars.join('\n  ');
  }

  private generateBorderVariables(borderRadius: Record<string, string>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(borderRadius)) {
      vars.push(`--radius-${key}: ${val};`);
    }
    return vars.join('\n  ');
  }

  private generateTransitionVariables(tokens: Pick<ExtractedTokens, 'transitions'>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(tokens.transitions.duration)) {
      vars.push(`--duration-${key}: ${val};`);
    }
    for (const [key, val] of Object.entries(tokens.transitions.timing)) {
      vars.push(`--timing-${key}: ${val};`);
    }
    vars.push(`--transition-base: all var(--duration-base) var(--timing-ease);`);
    vars.push(`--transition-fast: all var(--duration-fast) var(--timing-ease);`);
    vars.push(`--transition-slow: all var(--duration-slow) var(--timing-ease);`);
    return vars.join('\n  ');
  }

  generateComponents(_tokens: ExtractedTokens): string {
    return `/* ============================================
   Component Styles — Additional Components
   ============================================ */

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.breadcrumbs a:hover {
  color: var(--color-primary-500);
}

.breadcrumbs .separator {
  color: var(--color-text-disabled);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-8) 0;
}

.pagination .page-numbers {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-default);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-base);
}

.pagination .page-numbers:hover,
.pagination .page-numbers.current {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

/* Rating Stars */
.stars {
  color: var(--color-ecommerce-rating, #f59e0b);
  letter-spacing: 2px;
}

/* Notification / Alert */
.alert {
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-4);
}

.alert--success { background: var(--color-success-100); color: var(--color-success-800); }
.alert--error { background: var(--color-error-100); color: var(--color-error-800); }
.alert--warning { background: var(--color-warning-100); color: var(--color-warning-800); }
.alert--info { background: var(--color-info-100); color: var(--color-info-800); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-background-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-50);
}

.modal-content {
  background: var(--color-background-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}

/* ============================================
   CSS Grid Utilities (from layout engine)
   ============================================ */

.grid {
  display: grid;
}

.grid--auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.grid--auto-fill {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.grid--2 { grid-template-columns: repeat(2, 1fr); }
.grid--3 { grid-template-columns: repeat(3, 1fr); }
.grid--4 { grid-template-columns: repeat(4, 1fr); }
.grid--5 { grid-template-columns: repeat(5, 1fr); }
.grid--6 { grid-template-columns: repeat(6, 1fr); }

.grid--gap-sm { gap: var(--spacing-4); }
.grid--gap-md { gap: var(--spacing-6); }
.grid--gap-lg { gap: var(--spacing-8); }

@media (max-width: 768px) {
  .grid--2,
  .grid--3,
  .grid--4,
  .grid--5,
  .grid--6 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid--2,
  .grid--3,
  .grid--4,
  .grid--5,
  .grid--6 {
    grid-template-columns: 1fr;
  }
}

/* Tooltip */
.tooltip {
  position: relative;
}

.tooltip__content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-neutral-800);
  color: white;
  font-size: var(--text-sm);
  border-radius: var(--radius-default);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: var(--transition-fast);
}

.tooltip:hover .tooltip__content {
  opacity: 1;
}
`;
  }
}
