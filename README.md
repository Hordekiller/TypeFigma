<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Maddyrampant/TypeFigma/main/.github/brand/logo-dark.svg">
    <img alt="TypeFigma" src="https://raw.githubusercontent.com/Maddyrampant/TypeFigma/main/.github/brand/logo-light.svg" width="480">
  </picture>
</p>

<p align="center">
  <strong>From Figma Design to WordPress Theme — Zero Friction, Maximum Fidelity.</strong>
</p>

<p align="center">
  <a href="#-features"><strong>Features</strong></a> ·
  <a href="#-architecture"><strong>Architecture</strong></a> ·
  <a href="#-getting-started"><strong>Getting Started</strong></a> ·
  <a href="#-pipeline"><strong>Pipeline</strong></a> ·
  <a href="#-cli"><strong>CLI</strong></a> ·
  <a href="#-api"><strong>API</strong></a> ·
  <a href="#-output"><strong>Output</strong></a> ·
  <a href="#-development"><strong>Development</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/WordPress-6.4-21759B?logo=wordpress&logoColor=white" alt="WordPress">
  <img src="https://img.shields.io/badge/Elementor-3.19-92003B?logo=elementor&logoColor=white" alt="Elementor">
  <img src="https://img.shields.io/badge/WooCommerce-8.5-96588A?logo=woocommerce&logoColor=white" alt="WooCommerce">
  <img src="https://img.shields.io/badge/status-beta-yellow" alt="Status">
</p>

<hr>

## Overview

**TypeFigma** is a 10-stage automated pipeline that transforms Figma design files into fully functional, production-ready WordPress themes with native Elementor compatibility. It bridges the chasm between design and development — eliminating manual handoff, preserving pixel-perfect fidelity, and generating a complete theme package including PHP templates, Elementor JSON configurations, WooCommerce overrides, and block theme support.

Built as a TypeScript monorepo with npm workspaces, TypeFigma is engineered for extensibility, strict type safety, and modular composition.

---

## Features

- **🎨 Figma-to-Theme Automation** — Ingest any Figma file (via URL or file key) and output a complete WordPress theme.
- **🧩 Elementor Native** — Every design node is mapped to Elementor widgets (60+ Pro widget types, dynamic tags, containers).
- **🛒 WooCommerce Ready** — Full e-commerce theme output: `single-product.php`, `archive-product.php`, `content-product.php`, cart, checkout, and more.
- **🧠 10-Stage Pipeline** — Modular architecture where each stage (analysis, mapping, codegen, validation) is an independent, testable package.
- **✅ Built-in Validator** — 30+ quality gates covering required files, escaping/i18n, accessibility (contrast, ARIA, alt text), and performance budgets.
- **🌐 Dual Interface** — Use via CLI or the included Next.js web dashboard with Express API backend.
- **📦 Zero Config Demo** — `scripts/demo.mjs` runs a full pipeline without a Figma API token using built-in mock data.
- **🔒 Strict TypeScript** — Fully typed with `strict: true`, ES2022 target, ESM modules.

---

## Architecture

```
typefigma/
├── apps/
│   └── web-ui/                  # Next.js 14 dashboard (Tailwind CSS 3)
│
├── packages/
│   ├── core/
│   │   ├── analyzer/            # Figma design analysis & structure extraction
│   │   ├── code-generator/      # PHP / JS / CSS code generation
│   │   ├── elementor-mapper/    # Figma node → Elementor widget mapping
│   │   ├── figma-client/        # Figma REST API client
│   │   ├── theme-builder/       # WordPress theme structure assembly
│   │   └── validator/           # Quality validation (30+ checks)
│   │
│   ├── cli/                     # Command-line interface
│   └── api/                     # Express REST API (port 3001)
│
├── scripts/
│   └── demo.mjs                 # Offline demo runner
│
├── output/                      # Generated theme artifacts
│
├── tsconfig.base.json           # Shared TypeScript configuration
└── package.json                 # Monorepo root (npm workspaces)
```

### Package Dependency Flow

```
figma-client → analyzer → elementor-mapper → code-generator → theme-builder → validator
                                                      ↕
                                                    cli / api / web-ui
```

Each core package is independently versioned, tested, and published as ESM modules with output to `dist/`.

---

## Pipeline

The 10-stage pipeline governs the entire Figma-to-theme transformation:

| Stage | Package | Responsibility |
|-------|---------|---------------|
| **01** | `figma-client` | Fetch file data from Figma REST API (supports `figma.com/file/` and `figma.com/design/` URL formats) |
| **02** | `analyzer` | Parse and extract structural hierarchy, layers, styles, and component instances |
| **03** | `analyzer` | Identify reusable components, patterns, and design system primitives |
| **04** | `elementor-mapper` | Map analyzed nodes to Elementor widgets — sections, columns, headings, images, buttons, WooCommerce widgets, dynamic tags (site-logo, post-title, etc.) |
| **05** | `code-generator` | Generate PHP template code (loops, conditionals, template tags) |
| **06** | `code-generator` | Generate CSS (Tailwind utility classes, custom properties, responsive variants) |
| **07** | `code-generator` | Generate JavaScript (navigation, interactions, WooCommerce enhancements) |
| **08** | `theme-builder` | Assemble full WordPress theme: `style.css`, `functions.php`, `theme.json`, `index.php`, block templates, WooCommerce overrides |
| **09** | `theme-builder` | Produce Elementor JSON template files (section-level, ready to import) |
| **10** | `validator` | Validate against 30+ quality rules, score the theme, export ZIP archive |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9 (uses npm workspaces)

### Installation

```bash
# Clone the repository
git clone https://github.com/Maddyrampant/TypeFigma.git
cd TypeFigma

# Install all dependencies (monorepo)
npm install

# Build all packages
npm run build --workspaces
```

### Run the Demo

The demo script uses pre-baked mock Figma data — no API token required:

```bash
node scripts/demo.mjs
```

This generates a complete e-commerce WordPress theme at `output/shopdemo/` with:
- 36+ theme files (PHP, CSS, JS)
- 8 Elementor JSON templates
- WooCommerce override templates
- Block theme templates (`templates/index.html`, `templates/single-page.html`)
- Production-ready ZIP archive
- Full validation report

---

## CLI

```bash
node packages/cli/dist/index.js [command] [options]
```

### Commands

| Command | Description |
|---------|-------------|
| `generate` | Run the full pipeline from a Figma URL to a WordPress theme |
| `validate` | Validate an existing generated theme |
| `--help` | Show help information |

### Generate Options

```
node packages/cli/dist/index.js generate --help
```

All flags and options are documented inline.

---

## API

Start the Express API server:

```bash
node packages/api/dist/index.js
```

The server listens on `PORT` (default `3001`) with CORS enabled and a 50 MB JSON body limit.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check — returns `{"status": "ok"}` |
| `GET` | `/api/templates` | List all available section templates |
| `POST` | `/api/analyze` | Submit a Figma URL for analysis — returns analysis result, selection config, and section templates |

---

## Output

Generated themes reside in `output/`. Each theme directory contains:

```
output/{theme-name}/
├── style.css                  # Theme metadata & WordPress header
├── functions.php              # Theme setup, scripts, supports
├── theme.json                 # Global styles (block editor)
├── index.php                  # Main template
├── header.php                 # Site header
├── footer.php                 # Site footer
├── sidebar.php                # Sidebar
├── woocommerce/
│   ├── single-product.php     # Product detail
│   ├── archive-product.php    # Product archive
│   └── content-product.php    # Product card loop
├── templates/
│   ├── index.html             # Block template (fallback)
│   └── single-page.html       # Page block template
├── elementor/
│   └── *.json                 # Elementor importable templates
└── theme.zip                  # Ready-to-upload ZIP
```

---

## Development

### Workspace Scripts

```bash
npm run build        # Build all packages
npm run dev          # Watch mode for all packages
npm run lint         # Lint all packages
npm run typecheck    # Type-check all packages
npm run test         # Run all tests
npm run clean        # Clean all build artifacts
```

### Testing

The project has **680+ passing tests** covering:
- Elementor mapper templates (317 template tests + 23 hierarchical structure tests in both `src/` and `dist/`)
- All 60+ Elementor widget types
- Hierarchical component resolution
- Validity mode switching (valid → invalid nodes)

```bash
# Run all tests
npm run test --workspaces

# Run elementor-mapper tests specifically
npm run test -w packages/core/elementor-mapper
```

### Architecture Guidelines

- **ESM Only**: All packages use `"type": "module"` — no CommonJS `require()`.
- **Strict TypeScript**: `strict: true`, `noUnusedLocals`, `noUnusedParameters` enabled.
- **Output**: Each package compiles to `dist/` with `.js` extensions.
- **Workspaces**: Add new packages under `packages/` and register in root `package.json#workspaces`.

---

## Quality Assurance

The **Validator** package enforces:

| Category | Checks |
|----------|--------|
| **Required Files** | `style.css`, `functions.php`, `index.php` presence |
| **Security** | Proper escaping (`esc_attr`, `esc_html`, `esc_url`), direct `echo` detection |
| **i18n** | Translation-ready text domains, `__()`, `_e()` usage |
| **Accessibility** | Color contrast ratios, ARIA landmarks/labels, image alt text, semantic headings (`<h1>` presence) |
| **Performance** | CSS budget (< 50 KB), JS budget (< 50 KB), total budget (< 300 KB) |
| **SEO** | Missing `</title>`, missing `<h1>`, broken template tags |

**Scoring**: Base 100 — **−25 per error**, **−5 per warning** (clamped to [0, 100]).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript 5.5 (`strict`, ES2022, `nodenext`) |
| **Monorepo** | npm workspaces |
| **Web UI** | Next.js 14, Tailwind CSS 3, PostCSS |
| **API** | Express (ESM) |
| **Target CMS** | WordPress 6.4+ |
| **Page Builder** | Elementor 3.19+ (Pro widgets, dynamic tags) |
| **E-Commerce** | WooCommerce 8.5+ |
| **Module System** | ESM (`"type": "module"`) |

---

## Roadmap

- [x] Core pipeline (10 stages)
- [x] Elementor Pro widget mapping
- [x] WooCommerce theme overrides
- [x] Web dashboard (Next.js)
- [x] Validation engine
- [ ] Figma plugin integration
- [ ] Live preview (Figma → WordPress)
- [ ] Multi-theme output (block themes, classic themes)
- [ ] CI/CD pipeline for automated testing

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <sub>Built with TypeScript — because design should flow, not stall.</sub>
  <br>
  <sub>Maintained by <a href="https://github.com/Maddyrampant">@Maddyrampant</a></sub>
</p>
