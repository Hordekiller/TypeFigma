# TypeFigma

> **Figma to WordPress Theme Converter** — Turn any Figma design into a fully functional WordPress theme with Elementor support, WooCommerce compatibility, and production-ready code.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-GPLv2-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-504%20passing-brightgreen)](https://github.com/Hordekiller/TypeFigma)
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

---

## Features

- **🔌 Figma API Integration** — Full REST API client with rate limiting, retry logic, caching, and webhook support
- **🎯 Automatic Component Detection** — Identifies 20+ component types (header, hero, product cards, testimonials, forms, galleries, etc.)
- **🎨 Design Token Extraction** — Extracts colors (50–900 shade scale), typography, spacing, shadows, border-radius, breakpoints, and transitions from Figma variables and styles
- **💻 Multi-Format Code Generation** — HTML/CSS, Tailwind v4 `@theme`, WordPress `theme.json`, DTCG tokens, WP block patterns/templates
- **📦 Elementor Mapper** — Generates complete Elementor JSON (containers, global settings, 50+ section templates)
- **🏗️ WordPress Theme Builder** — Produces 58+ theme files: `style.css`, `functions.php`, templates, patterns, WooCommerce templates, Customizer settings
- **⚙️ Configuration Layer** — WordPress Customizer with sections for colors, typography, layout, social links, and WooCommerce shop settings
- **🛒 WooCommerce Integration** — Auto-detects e-commerce projects, generates Cart/Checkout/My Account templates, product cards with gallery/badge/rating/wishlist
- **✅ Built-in Validator** — Checks PHP syntax, WordPress coding standards, WCAG AA contrast ratios, CSS quality, Elementor structure, accessibility
- **📦 Package & Export** — Generates `screenshot.png` (880×660), `demo-content.xml` (WXR), `readme.txt`, `robots.txt`, and ZIP archive
- **🖥️ REST API** — Express server with 5 endpoints for headless integration
- **🌐 CLI Tool** — Single `generate` command for CI/CD pipelines

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Figma Design URL                      │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  1. Fetch & Analysis    (figma-client)                   │
│     └→ JSON + Metadata + Variables + Styles              │
├─────────────────────────────────────────────────────────┤
│  2. Component Detection  (analyzer)                      │
│     └→ 20+ component types, project type classification  │
├─────────────────────────────────────────────────────────┤
│  3. Token Extraction     (analyzer)                      │
│     └→ Colors, Typography, Spacing, Shadows, Breakpoints │
├─────────────────────────────────────────────────────────┤
│  4. Code Generation      (code-generator)                │
│     └→ HTML/CSS + Tailwind + theme.json + DTCG + Blocks  │
├─────────────────────────────────────────────────────────┤
│  5. Elementor Mapping    (elementor-mapper)              │
│     └→ JSON containers + global settings + templates     │
├─────────────────────────────────────────────────────────┤
│  6. Theme Structure      (theme-builder)                 │
│     └→ 58+ WP theme files + Customizer + Admin panel     │
├─────────────────────────────────────────────────────────┤
│  7. Validation           (validator)                     │
│     └→ PHP syntax / WCAG / CSS / Elementor / WP stds     │
├─────────────────────────────────────────────────────────┤
│  8. Package & Export     (CLI / API)                     │
│     └→ ZIP + screenshot.png + demo-content.xml + README  │
└─────────────────────┬───────────────────────────────────┘
                      ▼
        ┌─────────────────────────────┐
        │  WordPress Theme (.zip)     │
        │  + Elementor Import Ready   │
        └─────────────────────────────┘
```

### Package Overview

| Package | Description | Status |
|---------|-------------|--------|
| `@typefigma/figma-client` | Figma REST API client with rate limiting & caching | ✅ 85% |
| `@typefigma/analyzer` | Component detection, token extraction, layout engine | ✅ 90% |
| `@typefigma/code-generator` | HTML/CSS, Tailwind, theme.json, DTCG, WP blocks | ✅ 85% |
| `@typefigma/elementor-mapper` | Elementor JSON containers & 50+ templates | ✅ 80% |
| `@typefigma/theme-builder` | WordPress file builder, Customizer, Admin panel | ✅ 90% |
| `@typefigma/validator` | PHP syntax, WCAG, CSS, Elementor, WP standards | ✅ 90% |
| `@typefigma/cli` | Command-line interface | ✅ 70% |
| `@typefigma/api` | Express REST API | ✅ 70% |

---

## Tech Stack

- **Runtime:** Node.js ≥ 18, TypeScript 5.x (strict mode, NodeNext modules)
- **Pipeline:** 8 monorepo packages (npm workspaces)
- **Build:** TypeScript compiler (`tsc`), Vitest for testing
- **Key Libraries:** `archiver` (ZIP), `zlib` (PNG), Express (API), Commander (CLI)
- **Output Formats:** HTML5, CSS3, Tailwind v4 `@theme`, `theme.json` (FSE), DTCG tokens, WXR (WordPress eXtended RSS), Elementor JSON
- **Testing:** 504 tests across 5 packages

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- A [Figma access token](https://www.figma.com/developers/api#access-tokens)

### Installation

```bash
git clone https://github.com/Hordekiller/TypeFigma.git
cd TypeFigma
npm install
npm run build
```

### CLI Usage

```bash
# Generate a theme from a Figma URL
npx typefigma generate "https://www.figma.com/file/abc123/design" \
  --token "figd_xxxxx" \
  --name "My Theme" \
  --output "./my-theme" \
  --zip
```

### API Usage

```bash
# Start the API server
npx tsx packages/api/src/index.ts

# Analyze a Figma design
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "figmaUrl": "https://www.figma.com/file/abc123/design",
    "figmaToken": "figd_xxxxx"
  }'

# Generate a full theme
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "figmaUrl": "https://www.figma.com/file/abc123/design",
    "figmaToken": "figd_xxxxx",
    "themeName": "My Theme",
    "createZip": true
  }'

# Download the generated ZIP
curl -o theme.zip http://localhost:3001/api/download/my-theme
```

### Run the Demo (No Figma Token Required)

```bash
node scripts/demo.mjs
```

Generates a complete e-commerce WordPress theme at `./output/shopdemo/` with 58 files, Elementor templates, WooCommerce support, and validation report.

---

## Generated Theme Structure

```
theme-name/
├── style.css                  # Theme metadata + WordPress header
├── functions.php              # Theme setup, enqueue, Elementor integration
├── index.php                  # WordPress entry point
├── screenshot.png             # 880×660 theme screenshot
├── readme.txt                 # WordPress.org-compatible readme
├── robots.txt                 # SEO crawl rules
├── demo-content.xml           # WXR import file (pages, products, menus)
├── theme.json                 # Full Site Editing configuration
├── header.php / footer.php    # Site chrome
├── page.php / single.php      # Content templates
├── archive.php / search.php   # List templates
├── 404.php / sidebar.php      # Utility templates
├── inc/
│   ├── customizer.php         # Color, typography, layout, WooCommerce settings
│   ├── elementor-widgets.php  # Custom Elementor widget registration
│   ├── fonts.php              # Google Fonts enqueue
│   └── admin/settings.php     # Theme admin panel
├── assets/
│   ├── css/global.css         # CSS custom properties + base styles
│   ├── css/components.css     # Component-specific styles
│   ├── css/woocommerce.css    # Shop styles
│   └── js/theme.js            # Theme JavaScript
├── elementor/
│   ├── global-settings.json   # Elementor global colors, fonts, breakpoints
│   └── templates/             # Header, Footer, Product Archive JSON
├── patterns/                  # Block patterns (hero, products, testimonials)
├── templates/                 # Block templates (page, archive, cart)
├── woocommerce/               # Cart, Checkout, My Account, Archive, Single
└── styles/                    # Style variations (default, light, dark)
```

---

## Development

```bash
# Setup
npm install
npm run build

# Run all tests (504 tests across 5 packages)
npm test

# Type-check all packages
npm run typecheck

# Development (watch mode)
npm run dev

# Clean build artifacts
npm run clean
```

### Package Development

```bash
# Work on a specific package
cd packages/core/theme-builder
npx vitest run                  # Run tests
npx tsc --noEmit --watch        # Type-check in watch mode
```

---

## Project Classification

TypeFigma automatically detects the project type using 13 indicators:

| Indicator | Description |
|-----------|-------------|
| `hasProductCards` | Product grid/list with add-to-cart |
| `hasAddToCart` | Individual add-to-cart buttons |
| `hasCheckout` | Checkout forms/sections |
| `hasWishlist` | Wishlist/bookmark functionality |
| `hasProductGallery` | Image galleries with thumbnails |
| `hasReviews` | Customer review sections |
| `hasPricing` | Pricing tables/cards |
| `hasBlogPosts` | Blog post listings |
| `hasPortfolioItems` | Portfolio/project grids |
| `hasContactForms` | Contact form sections |
| `hasTeamSection` | Team member grids |
| `hasServicesSection` | Service/feature cards |

**Detected types:** `ecommerce` | `corporate` | `blog` | `portfolio` | `landing` | `saas`

---

## Validation

Every generated theme runs through a comprehensive validation suite:

| Check | What It Validates |
|-------|-------------------|
| **Structure** | 11 required WordPress theme files present |
| **PHP Syntax** | Tag balance, curly brace matching, function declaration correctness |
| **WP Standards** | Escaping functions, i18n, nonces, hooks, superglobal sanitization |
| **Accessibility** | Alt text on images, form labels, ARIA roles, heading hierarchy, WCAG AA contrast (4.5:1) |
| **CSS Quality** | Specificity, duplicate selectors, vendor prefixes, `!important` usage |
| **Elementor** | Widget registration, global settings, template JSON validity |
| **Performance** | File sizes, CSS/JS/PHP totals, image count, largest file |

---

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

### Areas for Contribution

- WooCommerce Cart/Checkout/My Account template improvements
- Web UI (Next.js) — live preview, component selection, progress display
- Additional Elementor Pro widget support (slides, forms, price lists)
- End-to-end testing with WordPress/Elementor
- CSS Module / CSS-in-JS output formats

---

## License

[GPLv2 or later](LICENSE) — Free to use, modify, and distribute.

---

<p align="center">
  Built with ❤️ for the WordPress community
</p>
