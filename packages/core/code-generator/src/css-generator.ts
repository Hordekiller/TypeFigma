import type { ExtractedTokens } from '@typefigma/analyzer';

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

export class CssGenerator {
  generateGlobal(tokens: ExtractedTokens, minVw: string = '375px', maxVw: string = '1440px'): string {
    const c = tokens.colors;
    const t = tokens.typography;
    return `/* ============================================
   Design Tokens — Generated from Figma
   ============================================ */

:root {
  ${this.generateColorVariables(c)}
  ${this.generateTypographyVariables(t)}
  ${this.generateSpacingVariables(tokens.spacing)}
  ${this.generateSizingVariables(tokens.sizing)}
  ${this.generateShadowVariables(tokens.shadows)}
  ${this.generateBorderVariables(tokens.borderRadius)}
  ${this.generateTransitionVariables(tokens)}
  ${this.generateBorderCSSVars(tokens.borders)}
  ${this.generateZIndexVariables(tokens.zIndex)}
  ${this.generateOpacityVariables(tokens)}
  ${this.generateBlendModeVariables(tokens)}
}

${this.generateFluidTokens(tokens, minVw, maxVw)}

/* ============================================
   Base Styles
   ============================================ */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html { font-size: 16px; scroll-behavior: smooth; }
html:focus-within { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background-color: var(--color-background-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

img { height: auto; }

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }

.container {
  width: 100%;
  max-width: ${tokens.sizing.container || '1200px'};
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

/* ============================================
   Accessibility
   ============================================ */

.skip-link {
  position: absolute;
  top: -100%;
  left: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--color-primary-500);
  color: white;
  z-index: var(--z-50);
  border-radius: var(--radius-default);
  transition: top var(--duration-fast) var(--timing-ease);
}

.skip-link:focus {
  top: var(--spacing-4);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
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

::selection {
  background: var(--color-primary-200, #bfdbfe);
  color: var(--color-text-primary);
}

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
  text-align: center;
  white-space: nowrap;
}

.btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
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

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}
.btn-ghost:hover {
  background: var(--color-neutral-100);
  color: var(--color-text-primary);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--text-lg);
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

.header--static {
  position: relative;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.main-nav .nav-menu {
  display: flex;
  gap: var(--spacing-6);
}

.main-nav .menu-item a {
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
  padding: var(--spacing-2) 0;
}

.main-nav .menu-item a:hover {
  color: var(--color-primary-500);
}

.main-nav .menu-item.current-menu-item a {
  color: var(--color-primary-500);
  font-weight: var(--font-weight-semibold);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-2);
}

.mobile-menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: currentColor;
  transition: var(--transition-base);
  border-radius: 1px;
}

/* ============================================
   Hero
   ============================================ */

.hero {
  padding: var(--spacing-16) 0;
  background: var(--color-neutral-100);
  position: relative;
  overflow: hidden;
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

.hero--dark {
  background: var(--color-neutral-900);
  color: white;
}

.hero--dark .hero-description {
  color: var(--color-neutral-400);
}

.hero--overlay {
  color: white;
}

.hero--overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

.hero--overlay .container {
  position: relative;
  z-index: 1;
}

.hero-slider-controls {
  position: absolute;
  bottom: var(--spacing-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-2);
}

.slider-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  transition: var(--transition-base);
}

.slider-dot.active,
.slider-dot:hover {
  background: white;
}

/* ============================================
   Sections
   ============================================ */

.section {
  padding: var(--spacing-16) 0;
}

.section--dark {
  background: var(--color-neutral-900);
  color: white;
}

.section--dark .section-description {
  color: var(--color-neutral-400);
}

.section--muted {
  background: var(--color-neutral-50);
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

.section-content {
  max-width: ${tokens.sizing.container || '1200px'};
  margin: 0 auto;
}

/* ============================================
   Navigation Dropdown
   ============================================ */

.nav-item--has-dropdown {
  position: relative;
}

.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  background: var(--color-background-surface);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: var(--transition-base);
  z-index: var(--z-50);
}

.nav-item--has-dropdown:hover .nav-dropdown,
.nav-item--has-dropdown:focus-within .nav-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.nav-dropdown a {
  display: block;
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--color-text-primary);
  transition: background var(--transition-fast);
}

.nav-dropdown a:hover {
  background: var(--color-neutral-100);
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
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  z-index: 2;
}

.product-card__badge--top-right { top: var(--spacing-3); right: var(--spacing-3); }
.product-card__badge--top-left { top: var(--spacing-3); left: var(--spacing-3); }

.product-card__badge--sale {
  background: var(--color-sale, #ef4444);
  color: white;
}

.product-card__badge--new {
  background: var(--color-ecommerce-new-arrival, #10b981);
  color: white;
}

.product-card__badge--sold-out {
  background: var(--color-ecommerce-out-of-stock, #6b7280);
  color: white;
}

.product-card__actions {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  opacity: 0;
  transform: translateX(10px);
  transition: var(--transition-base);
}

.product-card:hover .product-card__actions {
  opacity: 1;
  transform: translateX(0);
}

.product-card__wishlist,
.product-card__quick-view,
.product-card__compare {
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
  color: var(--color-text-secondary);
}

.product-card__wishlist:hover,
.product-card__quick-view:hover,
.product-card__compare:hover {
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

.product-card--list {
  flex-direction: row;
}

.product-card--list .product-card__image-wrapper {
  width: 280px;
  min-height: 100%;
  aspect-ratio: auto;
}

.product-card--compact .product-card__content {
  padding: var(--spacing-3);
}

.product-card--compact .product-card__title {
  font-size: var(--text-base);
}

.product-card--compact .product-card__price-regular {
  font-size: var(--text-lg);
}

/* ============================================
   Product Detail
   ============================================ */

.product-detail {
  display: grid;
  gap: var(--spacing-8);
}

.product-detail--sidebar-left {
  grid-template-columns: 1fr 1fr;
}

.product-detail--sidebar-right {
  grid-template-columns: 1fr 1fr;
}

.product-detail--fullwidth {
  grid-template-columns: 1fr;
}

.product-detail--centered {
  grid-template-columns: 1fr;
  max-width: 800px;
  margin: 0 auto;
}

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
.product-meta-value--on-backorder { color: var(--color-warning-500, #eab308); }

/* Add to Cart */
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

.qty-btn:hover {
  background: var(--color-neutral-200);
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

.btn-buy-now:hover {
  background: var(--color-secondary-600);
}

/* Product Tabs */
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
  margin-bottom: -2px;
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

.product-tab-panel {
  display: none;
}

.product-tab-panel.active {
  display: block;
}

/* Reviews */
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
  flex-wrap: wrap;
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

.footer-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.footer-links a {
  color: var(--color-neutral-400);
  transition: color var(--transition-fast);
}

.footer-links a:hover { color: white; }

.footer-social {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  margin-top: var(--spacing-8);
}

.footer-social a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-neutral-700);
  transition: var(--transition-base);
  color: white;
}

.footer-social a:hover {
  background: var(--color-primary-500);
  transform: translateY(-2px);
}

.footer-bottom {
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-6);
  border-top: var(--border-width-default) solid var(--color-neutral-700);
  text-align: center;
  color: var(--color-neutral-500);
}

/* ============================================
   Testimonials
   ============================================ */

.testimonial-card {
  background: var(--color-background-surface);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
}

.testimonial-card__avatar {
  width: 64px; height: 64px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.testimonial-card__text {
  font-style: italic;
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.testimonial-card__author {
  font-weight: var(--font-weight-semibold);
}

.testimonial-card__role {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* ============================================
   Gallery
   ============================================ */

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.gallery-item {
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 1;
  position: relative;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-item__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition-base);
}

.gallery-item:hover .gallery-item__overlay {
  opacity: 1;
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

.form-control {
  width: 100%;
  padding: var(--spacing-3);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  transition: var(--transition-base);
  background: var(--color-background-surface);
  color: var(--color-text-primary);
}

.form-control::placeholder {
  color: var(--color-text-disabled);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-control--error {
  border-color: var(--color-error-500);
}

.form-control--error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

/* ============================================
   Newsletter
   ============================================ */

.newsletter-form {
  display: flex;
  gap: var(--spacing-3);
}

.newsletter-form input {
  flex: 1;
  padding: var(--spacing-3);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
}

.newsletter-form input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* ============================================
   Breadcrumbs
   ============================================ */

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.breadcrumbs a:hover {
  color: var(--color-primary-500);
}

.breadcrumbs .separator {
  color: var(--color-text-disabled);
}

/* ============================================
   Pagination
   ============================================ */

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
  min-width: 40px;
  height: 40px;
  padding: 0 var(--spacing-2);
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

/* ============================================
   Rating Stars
   ============================================ */

.stars {
  color: var(--color-ecommerce-rating, #f59e0b);
  letter-spacing: 2px;
  display: inline-flex;
  gap: 2px;
}

/* ============================================
   Notification / Alert
   ============================================ */

.alert {
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.alert--success { background: var(--color-success-100); color: var(--color-success-800); }
.alert--error { background: var(--color-error-100); color: var(--color-error-800); }
.alert--warning { background: var(--color-warning-100); color: var(--color-warning-800); }
.alert--info { background: var(--color-info-100); color: var(--color-info-800); }

/* ============================================
   Modal
   ============================================ */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-background-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-50);
  padding: var(--spacing-4);
}

.modal-content {
  background: var(--color-background-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
}

/* ============================================
   Search
   ============================================ */

.search-form {
  display: flex;
  position: relative;
}

.search-form input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
}

.search-form input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.search-form button {
  position: absolute;
  right: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-base);
}

.search-form button:hover {
  background: var(--color-primary-600);
}

/* ============================================
   CSS Grid Utilities
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

/* ============================================
   Tooltip
   ============================================ */

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
  z-index: var(--z-50);
}

.tooltip:hover .tooltip__content {
  opacity: 1;
}

/* ============================================
   Animation Keyframes
   ============================================ */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}

@keyframes pulse {
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}

/* ============================================
   Responsive
   ============================================ */

@media (max-width: 1024px) {
  .hero--split .container {
    grid-template-columns: 1fr;
  }

  .product-detail--sidebar-left,
  .product-detail--sidebar-right {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
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

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-title {
    font-size: var(--text-4xl);
  }

  .newsletter-form {
    flex-direction: column;
  }

  .search-form {
    max-width: 100%;
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

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .grid--2,
  .grid--3,
  .grid--4,
  .grid--5,
  .grid--6 {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: var(--text-3xl);
  }

  .section {
    padding: var(--spacing-8) 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    ${c.neutral['900'] ? `--color-border-default: ${c.neutral['700']};` : ''}
  }
}
`;
  }

  private generateFluidTokens(tokens: ExtractedTokens, minVw: string, maxVw: string): string {
    const lines: string[] = ['/* ============================================'];
    lines.push('   Fluid Tokens (clamp-based)');
    lines.push('   ============================================ */');
    lines.push('');

    const t = tokens.typography;
    const hasFluid = Object.keys(t.fontSizes).length > 0 || Object.keys(t.textStyles || {}).length > 0;

    if (!hasFluid) {
      lines.push('/* No fluid typography tokens available */');
      return lines.join('\n');
    }

    lines.push(':root {');
    for (const [slug, size] of Object.entries(t.fontSizes)) {
      const clamped = this.clampToken(size, minVw, maxVw);
      lines.push(`  --fluid-text-${slug}: ${clamped};`);
    }

    const ts = t.textStyles;
    if (ts) {
      const textStyles: Array<{ slug: string; prop: string }> = [
        { slug: 'h1', prop: ts.h1?.fontSize || '2.25rem' },
        { slug: 'h2', prop: ts.h2?.fontSize || '1.5rem' },
        { slug: 'h3', prop: ts.h3?.fontSize || '1.25rem' },
        { slug: 'h4', prop: ts.h4?.fontSize || '1.125rem' },
        { slug: 'h5', prop: ts.h5?.fontSize || '1rem' },
        { slug: 'h6', prop: ts.h6?.fontSize || '0.875rem' },
        { slug: 'body', prop: ts.body?.fontSize || '1rem' },
      ];
      for (const { slug, prop } of textStyles) {
        if (!t.fontSizes[slug]) {
          const clamped = this.clampToken(prop, minVw, maxVw);
          lines.push(`  --fluid-text-${slug}: ${clamped};`);
        }
      }
    }

    lines.push('}');
    lines.push('');

    return lines.join('\n');
  }

  private clampToken(val: string, minVw: string, maxVw: string): string {
    const match = val.match(/^([\d.]+)\s*(rem|px)?$/);
    if (!match) return val;

    const baseSize = parseFloat(match[1]);
    const unit = match[2] || 'rem';

    if (isNaN(baseSize)) return val;

    const minSize = `${(baseSize * 0.75).toFixed(3)}${unit}`;
    try {
      return clampValue(minSize, val, minVw, maxVw);
    } catch {
      return val;
    }
  }

  private generateColorVariables(c: ExtractedTokens['colors']): string {
    const vars: string[] = [];

    const addScale = (prefix: string, set: Record<string, string>) => {
      if (!set) return;
      for (const [shade, hex] of Object.entries(set)) {
        vars.push(`--color-${prefix}-${shade}: ${hex};`);
      }
    };

    addScale('primary', c.primary);
    addScale('secondary', c.secondary);
    addScale('accent', c.accent);
    addScale('neutral', c.neutral);
    addScale('success', c.success);
    addScale('warning', c.warning);
    addScale('error', c.error);
    addScale('info', c.info);

    if (c.background) {
      vars.push(`--color-background-body: ${c.background.body || '#ffffff'};`);
      vars.push(`--color-background-surface: ${c.background.surface || '#fafafa'};`);
      vars.push(`--color-background-overlay: ${c.background.overlay || 'rgba(0,0,0,0.3)'};`);
    }

    if (c.text) {
      vars.push(`--color-text-primary: ${c.text.primary || '#171717'};`);
      vars.push(`--color-text-secondary: ${c.text.secondary || '#737373'};`);
      vars.push(`--color-text-disabled: ${c.text.disabled || '#a3a3a3'};`);
      vars.push(`--color-text-inverse: ${c.text.inverse || '#ffffff'};`);
    }

    if (c.border) {
      vars.push(`--color-border-default: ${c.border.default || '#e5e5e5'};`);
      vars.push(`--color-border-hover: ${c.border.hover || '#d4d4d4'};`);
      vars.push(`--color-border-focus: ${c.border.focus || '#3b82f6'};`);
    }

    if (c.ecommerce) {
      for (const [key, hex] of Object.entries(c.ecommerce)) {
        vars.push(`--color-ecommerce-${key}: ${hex};`);
      }
    }

    return vars.join('\n  ');
  }

  private generateOpacityVariables(tokens: ExtractedTokens): string {
    if (!tokens.opacity || Object.keys(tokens.opacity).length === 0) return '';
    return Object.entries(tokens.opacity)
      .map(([key, val]) => `--opacity-${key}: ${val};`)
      .join('\n  ');
  }

  private generateBlendModeVariables(tokens: ExtractedTokens): string {
    if (!tokens.blendModes || tokens.blendModes.length === 0) return '';
    return tokens.blendModes
      .map((mode, i) => `--blend-mode-${i}: ${mode};`)
      .join('\n  ');
  }

  private generateTypographyVariables(t: ExtractedTokens['typography']): string {
    const vars: string[] = [];

    if (t.fontFamilies) {
      const ff = t.fontFamilies;
      vars.push(`--font-heading: '${ff.heading?.name || 'Inter'}', ${ff.heading?.fallback || 'system-ui, sans-serif'};`);
      vars.push(`--font-body: '${ff.body?.name || 'Inter'}', ${ff.body?.fallback || 'system-ui, sans-serif'};`);
      if (ff.mono) {
        vars.push(`--font-mono: '${ff.mono.name}', ${ff.mono.fallback};`);
      }
    }

    for (const [size, val] of Object.entries(t.fontSizes || {})) {
      vars.push(`--text-${size}: ${val};`);
    }

    for (const [weight, val] of Object.entries(t.fontWeights || {})) {
      vars.push(`--font-weight-${weight}: ${typeof val === 'number' ? val : val};`);
    }

    for (const [lh, val] of Object.entries(t.lineHeights || {})) {
      vars.push(`--leading-${lh}: ${val};`);
    }

    for (const [ls, val] of Object.entries(t.letterSpacing || {})) {
      vars.push(`--tracking-${ls}: ${val};`);
    }

    const ts = t.textStyles;
    if (ts) {
      if (ts.h1) vars.push(`--text-h1: ${ts.h1.fontSize};`);
      if (ts.h2) vars.push(`--text-h2: ${ts.h2.fontSize};`);
      if (ts.h3) vars.push(`--text-h3: ${ts.h3.fontSize};`);
      if (ts.h4) vars.push(`--text-h4: ${ts.h4.fontSize};`);
      if (ts.h5) vars.push(`--text-h5: ${ts.h5.fontSize};`);
      if (ts.h6) vars.push(`--text-h6: ${ts.h6.fontSize};`);
      if (ts.body) vars.push(`--text-base: ${ts.body.fontSize};`);
      if (ts.bodySmall) vars.push(`--text-sm: ${ts.bodySmall.fontSize};`);
      if (ts.bodyLarge) vars.push(`--text-lg: ${ts.bodyLarge.fontSize};`);
    }

    return vars.join('\n  ');
  }

  private generateSpacingVariables(spacing: Record<string, string>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(spacing || {})) {
      vars.push(`--spacing-${key}: ${val};`);
    }
    return vars.join('\n  ');
  }

  private generateSizingVariables(sizing: Record<string, string>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(sizing || {})) {
      vars.push(`--size-${key}: ${val};`);
    }
    return vars.join('\n  ');
  }

  private generateShadowVariables(shadows: Record<string, string>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(shadows || {})) {
      vars.push(`--shadow-${key}: ${val};`);
    }
    return vars.join('\n  ');
  }

  private generateBorderVariables(borderRadius: Record<string, string>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(borderRadius || {})) {
      vars.push(`--radius-${key}: ${val};`);
    }
    return vars.join('\n  ');
  }

  private generateTransitionVariables(tokens: Pick<ExtractedTokens, 'transitions'>): string {
    const vars: string[] = [];

    if (tokens.transitions?.duration) {
      for (const [key, val] of Object.entries(tokens.transitions.duration)) {
        vars.push(`--duration-${key}: ${val};`);
      }
    }

    if (tokens.transitions?.timing) {
      for (const [key, val] of Object.entries(tokens.transitions.timing)) {
        vars.push(`--timing-${key}: ${val};`);
      }
    }

    vars.push(`--transition-base: all var(--duration-base) var(--timing-ease);`);
    vars.push(`--transition-fast: all var(--duration-fast) var(--timing-ease);`);
    vars.push(`--transition-slow: all var(--duration-slow) var(--timing-ease);`);

    return vars.join('\n  ');
  }

  private generateBorderCSSVars(borders: ExtractedTokens['borders']): string {
    const vars: string[] = [];

    if (borders?.width) {
      for (const [key, val] of Object.entries(borders.width)) {
        vars.push(`--border-width-${key}: ${val};`);
      }
    }

    if (borders?.styles) {
      for (const [key, val] of Object.entries(borders.styles)) {
        vars.push(`--border-style-${key}: ${val};`);
      }
    }

    return vars.join('\n  ');
  }

  private generateZIndexVariables(zIndex: Record<string, string | number>): string {
    const vars: string[] = [];
    for (const [key, val] of Object.entries(zIndex || {})) {
      vars.push(`--z-${key}: ${val};`);
    }
    return vars.join('\n  ');
  }

  generateComponents(_tokens: ExtractedTokens): string {
    return `/* ============================================
   Component Styles — Additional
   ============================================ */

/* ============================================
   Breadcrumbs
   ============================================ */

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.breadcrumbs a:hover {
  color: var(--color-primary-500);
}

.breadcrumbs .separator {
  color: var(--color-text-disabled);
}

/* ============================================
   Pagination
   ============================================ */

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
  min-width: 40px;
  height: 40px;
  padding: 0 var(--spacing-2);
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

/* ============================================
   Rating Stars
   ============================================ */

.stars {
  color: var(--color-ecommerce-rating, #f59e0b);
  letter-spacing: 2px;
  display: inline-flex;
  gap: 2px;
}

/* ============================================
   Alert / Notification
   ============================================ */

.alert {
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.alert--success { background: var(--color-success-100); color: var(--color-success-800); }
.alert--error { background: var(--color-error-100); color: var(--color-error-800); }
.alert--warning { background: var(--color-warning-100); color: var(--color-warning-800); }
.alert--info { background: var(--color-info-100); color: var(--color-info-800); }

/* ============================================
   Modal
   ============================================ */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-background-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-50);
  padding: var(--spacing-4);
}

.modal-content {
  background: var(--color-background-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
}

/* ============================================
   Grid Utilities
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

/* ============================================
   Post Card
   ============================================ */

.post-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-surface);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-base) var(--timing-ease);
}

.post-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.post-card__image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.post-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-card__content {
  padding: var(--spacing-4);
}

.post-card__category {
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary-500);
}

.post-card__title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin: var(--spacing-2) 0;
}

.post-card__excerpt {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-3);
}

.post-card__meta {
  display: flex;
  gap: var(--spacing-4);
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
}

.post-card__read-more {
  display: inline-block;
  margin-top: var(--spacing-3);
  font-weight: 600;
  color: var(--color-primary-500);
}

/* ============================================
   Cart
   ============================================ */

.cart-table {
  width: 100%;
  border-collapse: collapse;
}

.cart-table th,
.cart-table td {
  padding: var(--spacing-4);
  text-align: left;
  border-bottom: var(--border-width-default) solid var(--color-border-default);
}

.cart-table th {
  font-weight: var(--font-weight-semibold);
  background: var(--color-background-surface);
}

.cart-item img {
  border-radius: var(--radius-default);
}

.cart-quantity input {
  width: 60px;
  padding: var(--spacing-2);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-default);
  text-align: center;
}

.cart-remove button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--color-text-secondary);
}

.cart-remove button:hover {
  color: var(--color-error-500);
}

.cart-totals td {
  padding-top: var(--spacing-6);
}

.coupon-form {
  display: flex;
  gap: var(--spacing-2);
}

.coupon-form input {
  padding: var(--spacing-2) var(--spacing-3);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-default);
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-4);
}

/* ============================================
   Checkout
   ============================================ */

.checkout-wrapper {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--spacing-8);
  align-items: start;
}

.checkout-section {
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-6);
  background: var(--color-background-surface);
  border-radius: var(--radius-lg);
}

.checkout-heading {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: var(--border-width-default) solid var(--color-border-default);
}

.form-row {
  margin-bottom: var(--spacing-4);
}

.form-row label {
  display: block;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-1);
  font-size: var(--text-sm);
}

.form-row input,
.form-row select,
.form-row textarea {
  width: 100%;
  padding: var(--spacing-3);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-default);
  font-size: var(--text-base);
  transition: var(--transition-fast);
}

.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-row--half {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

.payment-methods {
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.payment-method {
  padding: var(--spacing-4);
  border-bottom: var(--border-width-default) solid var(--color-border-default);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.payment-method:last-child {
  border-bottom: none;
}

.payment-method input[type="radio"] {
  width: auto;
}

.checkout-summary {
  background: var(--color-background-surface);
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  position: sticky;
  top: var(--spacing-4);
}

.order-review-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-3) 0;
}

.order-review-total {
  font-weight: 700;
  font-size: var(--text-lg);
  border-top: var(--border-width-default) solid var(--color-border-default);
  padding-top: var(--spacing-4);
  margin-top: var(--spacing-2);
}

@media (max-width: 768px) {
  .checkout-wrapper {
    grid-template-columns: 1fr;
  }
  .form-row--half {
    grid-template-columns: 1fr;
  }
}

/* ============================================
   Tooltip
   ============================================ */

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
  z-index: var(--z-50);
}

.tooltip:hover .tooltip__content {
  opacity: 1;
}
`;
  }
}
