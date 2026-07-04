# TypeFigma Figma Plugin

Native Figma plugin for the TypeFigma pipeline.

## Features

- **Variable Extraction** — Extract all local Figma Variables (colors, numbers, strings, booleans)
- **Style Extraction** — Extract Paint, Text, and Effect styles
- **Auto-Layout Detection** — Traverse the entire document tree, recording auto-layout properties (padding, gap, alignment, grow)
- **Frame→Page Mapping** — Select frames on canvas and map them to WordPress page types (page, single, archive, shop, cart, checkout, my-account, header, footer)
- **JSON Export** — Download a structured JSON file compatible with TypeFigma CLI (`typefigma generate`)

## Installation (Development)

1. Open Figma → Plugins → Development → Import plugin from manifest...
2. Select `apps/figma-plugin/dist/manifest.json`
3. The plugin appears in the Plugins menu as "TypeFigma"

## Usage

1. Open your Figma design file
2. Run Plugins → TypeFigma
3. Select frames on canvas you want to map to pages
4. Adjust page type mapping (auto-detected from frame names)
5. Click "Export" to extract tokens, then "Download JSON"
6. Pipe the JSON into the TypeFigma CLI:
   ```
   typefigma generate --input ./export.json --name "My Theme"
   ```

## Build

```bash
cd apps/figma-plugin
npm run build       # production build → dist/
npm run dev         # watch mode
```

## Plugin Architecture

- `src/code.ts` — Runs in Figma's sandbox. Handles all Figma API access (variables, styles, nodes).
- `src/ui.html` — Runs in an iframe. Provides the UI for selection, mapping, and export.
- Communication via `figma.ui.postMessage()` / `parent.postMessage()`.

## Output JSON Format

The exported JSON follows the [TypeFigma Pipeline Format](https://github.com/TypeFigma/TypeFigma). It can be consumed by:

```bash
typefigma generate --plugin-input ./figma-export.json --name "My Theme"
```
