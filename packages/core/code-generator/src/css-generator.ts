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
}

/* ============================================
   Base Styles
   ============================================ */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-body);
  color: var(--color-neutral-900);
  background-color: var(--color-neutral-50);
  -webkit-font-smoothing: antialiased;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

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
  line-height: 1.2;
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
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
}

.btn-outline {
  background-color: transparent;
  border-color: var(--color-primary-500);
  color: var(--color-primary-500);
}

.btn-outline:hover {
  background-color: var(--color-primary-500);
  color: white;
}

/* ============================================
   Header
   ============================================ */

.site-header {
  padding: var(--spacing-4) 0;
  background-color: white;
  border-bottom: 1px solid var(--color-neutral-200);
}

.header--transparent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
  border: none;
  z-index: 100;
}

.header--sticky {
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
}

/* ============================================
   Hero
   ============================================ */

.hero {
  padding: var(--spacing-16) 0;
  background-color: var(--color-neutral-100);
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
  margin-bottom: var(--spacing-4);
}

.hero-description {
  margin-bottom: var(--spacing-6);
  color: var(--color-neutral-600);
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

.section-description {
  color: var(--color-neutral-600);
  margin-top: var(--spacing-3);
}

/* ============================================
   Footer
   ============================================ */

.site-footer {
  background-color: var(--color-neutral-900);
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

.footer-links li {
  margin-bottom: var(--spacing-2);
}

.footer-links a {
  color: var(--color-neutral-400);
  transition: color 0.2s;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-neutral-700);
  text-align: center;
  color: var(--color-neutral-500);
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

  .main-nav {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }
}

@media (max-width: 480px) {
  .footer-grid--4-cols,
  .footer-grid--3-cols,
  .footer-grid--2-cols {
    grid-template-columns: 1fr;
  }
}
`;
  }

  generateComponents(tokens: ExtractedTokens): string {
    return `/* ============================================
   Component Styles — Generated from Figma
   ============================================ */

/* Product Card */
.product-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s ease;
}

.product-card:hover {
  box-shadow: var(--shadow-md);
}

.product-card-image {
  aspect-ratio: 1;
  overflow: hidden;
}

.product-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-card-image img {
  transform: scale(1.05);
}

.product-card-body {
  padding: var(--spacing-4);
}

.product-card-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
}

.product-card-price {
  color: var(--color-primary-500);
  font-weight: var(--font-weight-bold);
}

/* Forms */
.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-1);
  font-weight: var(--font-weight-medium);
}

.form-input {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-8);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg);
}
`;
  }

  private generateColorVariables(colors: ColorTokens): string {
    const vars: string[] = [];
    const addColorSet = (prefix: string, set: Record<string, string>) => {
      for (const [shade, hex] of Object.entries(set)) {
        vars.push(`--color-${prefix}-${shade}: ${hex};`);
      }
    };

    addColorSet('primary', colors.primary);
    addColorSet('secondary', colors.secondary);
    addColorSet('neutral', colors.neutral);

    for (const [name, hex] of Object.entries(colors.semantic)) {
      vars.push(`--color-${name}: ${hex};`);
    }

    return vars.join('\n  ');
  }

  private generateTypographyVariables(typography: TypographyTokens): string {
    return `
  --font-heading: '${typography.h1.fontFamily}', sans-serif;
  --font-body: '${typography.body.fontFamily}', sans-serif;
  --text-h1: ${typography.h1.fontSize};
  --text-h2: ${typography.h2.fontSize};
  --text-h3: ${typography.h3.fontSize};
  --text-h4: ${typography.h4.fontSize};
  --text-base: ${typography.body.fontSize};
  --text-sm: ${typography.small.fontSize};
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --leading-body: ${typography.body.lineHeight};`;
  }

  private generateSpacingVariables(spacing: { xs: string; sm: string; md: string; lg: string; xl: string; xxl: string }): string {
    return `
  --spacing-1: ${spacing.xs};
  --spacing-2: ${spacing.sm};
  --spacing-3: ${spacing.sm};
  --spacing-4: ${spacing.md};
  --spacing-6: ${spacing.lg};
  --spacing-8: ${spacing.xl};
  --spacing-12: ${spacing.xl};
  --spacing-16: ${spacing.xxl};`;
  }

  private generateShadowVariables(shadows: { sm: string; md: string; lg: string }): string {
    return `
  --shadow-sm: ${shadows.sm};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};`;
  }

  private generateBorderVariables(borderRadius: { none: string; sm: string; md: string; full: string }): string {
    return `
  --radius-none: ${borderRadius.none};
  --radius-sm: ${borderRadius.sm};
  --radius-md: ${borderRadius.md};
  --radius-full: ${borderRadius.full};`;
  }
}
