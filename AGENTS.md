# TypeFigma - AI Agent Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start API server (port 3005)
cd packages/api && npm run dev

# Start Web UI (port 3000)
cd apps/web-ui && npm run dev

# Type check all packages
npx tsc --noEmit

# Run all tests
npm run test
```

## Architecture

- **Monorepo**: npm workspaces
- **Language**: TypeScript (strict, NodeNext, ES2022)
- **Pipeline**: 10-step Figma → WordPress theme generation

### Package Structure

```
typefigma/
├── packages/
│   ├── core/
│   │   ├── figma-client/     — Figma API client with rate limiting
│   │   ├── analyzer/         — Design analysis & token extraction
│   │   ├── code-generator/   — HTML/CSS/Tailwind generation
│   │   ├── elementor-mapper/ — Elementor JSON conversion
│   │   ├── theme-builder/    — WordPress theme structure
│   │   └── validator/        — PHP/CSS/JS validation
│   ├── cli/                  — Command-line interface
│   └── api/                  — Express.js REST API
├── apps/
│   └── web-ui/               — Next.js 14 frontend
└── AGENT_PROMPT.md           — Full pipeline specification
```

### Pipeline Flow

```
1. Fetch Figma File (figma-client)
2. Detect Components (analyzer)
3. Extract Design Tokens (analyzer)
4. Generate HTML/CSS (code-generator)
5. Generate Elementor JSON (elementor-mapper)
6. Create Theme Structure (theme-builder)
7. Configuration Layer (theme-builder)
8. WooCommerce Integration (theme-builder)
9. Validate Theme (validator)
10. Package & Export (archiver)
```

## Key Files

| File | Purpose |
|------|---------|
| `AGENT_PROMPT.md` | Complete 10-step pipeline specification |
| `STATUS_REPORT.md` | Project status in Farsi |
| `packages/api/src/index.ts` | All API endpoints |
| `apps/web-ui/src/app/page.tsx` | Main UI |
| `apps/web-ui/src/components/` | 13 reusable components |

## Development Conventions

- TypeScript strict mode, no `any`
- No comments in code
- Tests: vitest + @testing-library/react
- Build check: `npx tsc --noEmit`
- Dark theme UI (zinc palette)

## Component Inventory

| Component | Lines | Used | Purpose |
|-----------|-------|------|---------|
| PipelineProgress.tsx | 119 | Yes | 10-step progress bar |
| DesignTokensPanel.tsx | 222 | Yes | Design token display |
| ValidationResults.tsx | 244 | Yes | Validation scores/issues |
| ComponentPreview.tsx | 207 | Yes | Detected components |
| SectionSelector.tsx | 422 | Yes | Section selection |
| CodeViewer.tsx | 66 | Yes | Code display with tabs |
| StepRunner.tsx | 64 | Yes | Pipeline step execution |
| SettingsPanel.tsx | 210 | No | Settings accordion |
| PluginSelector.tsx | 266 | No | Plugin selection |
| EditorCanvas.tsx | 78 | No | Figma editor iframe |
| PreviewPanel.tsx | 73 | No | Theme preview |
| RolePicker.tsx | 136 | No | Component annotation |
| ThemeControls.tsx | 38 | No | Theme mode toggle |

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| POST | `/api/analyze` | Analyze Figma file (steps 1-3) |
| POST | `/api/generate` | Full generation (all steps) |
| POST | `/api/pipeline/start` | Start pipeline session |
| POST | `/api/pipeline/step` | Execute individual step (4-10) |
| GET | `/api/download/:slug` | Download ZIP |
| GET | `/api/templates` | List section templates |

## Figma API Rate Limits (Nov 2025)

- **Tier 1** (files, images): 10-20 req/min per seat
- **Tier 2** (variables): 25-100 req/min
- **Tier 3** (styles): 50-150 req/min
- Rate limit = file's plan, not token owner's plan
- Starter plan: only 6 requests/month for Tier 1!

## Testing

```bash
# Run specific package tests
cd packages/core/analyzer && npm test

# Run web-ui tests
cd apps/web-ui && npm test

# Run all tests
npm run test
```

Test coverage: 1,130+ tests across 36 files.

## Troubleshooting

- **Rate limited**: Wait 30s, check file's plan tier
- **Build fails**: Run `npx tsc --noEmit` to see errors
- **Tests fail**: Check if API server is running
- **UI blank**: Check browser console for API errors

---

*Last updated: 2026-07-12*
