## Phase A — Annotations Package Results

### Task 0 — Root Cause of 2 WooCommerce Test Failures

**Root cause:** The `WooCommerceGenerator` emitted PHP `$this->woocommerceConfig.*` conditionals as literal strings into templates instead of evaluating config values at TypeScript generation time. Two tests depended on compile-time interpolation.

**Fix** (`packages/core/woocommerce-generator/src/index.ts`):

1. **`generateSingleProductTemplate()` (line 80):** Changed from emitting a PHP conditional to evaluating `this.woocommerceConfig.includeVariations` at generation time via a template literal `${variationsBlock}`. When `includeVariations` is true, the emitted PHP checks `if ($product->is_type('variable'))` directly; when false, only `woocommerce_template_single_add_to_cart()` is emitted.

2. **`generateHeaderTemplate()` (line 373):** Changed from emitting `<?php if ($this->woocommerceConfig.includeMiniCart) : ?>...<?php endif; ?>` to evaluating `this.woocommerceConfig.includeMiniCart` at generation time. When true, the mini-cart div is emitted; when false, an empty string is interpolated.

3. **Constructor (line 16):** Fallback `woocommerceConfig ?? config.woocommerceFeatures` so the second arg is optional — callers passing config via `ThemeConfig.woocommerceFeatures` (like the tests) no longer need to pass it twice. Removed unused `private config` field since the `ThemeConfig` is no longer stored after extracting `woocommerceFeatures`. Removed stale `void this.woocommerceConfig` suppression.

### Final ComponentRole List

| Analyzer Component Type | Mapped ComponentRole |
|-------------------------|---------------------|
| `headers` | `header` |
| `footers` | `footer` |
| `navigation` | `nav-menu` |
| `heroes` | `hero` |
| `ctaSections` | `cta` |
| `testimonials` | `testimonial` |
| `galleries` | `gallery` |
| `productCards` | `product-card` |
| `productDetails` | `product-detail` |
| `cartComponents` | `cart` |
| `checkoutComponents` | `checkout` |
| `postCards` | `blog-list` |
| `postDetail` | `blog-post` |
| `contactForms` | `contact-form` |
| `searchBars` | `search-form` |
| `newsletters` | `newsletter` |
| `sections` | `section` |
| `containers` | `container` |
| `columns` | `column` |

Roles added (6): `cta`, `product-detail`, `cart`, `checkout`, `newsletter`, `column`.

### File Tree — packages/core/annotations

```
packages/core/annotations/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── index.ts
    ├── types.ts
    ├── guards.ts
    ├── merge.ts
    └── __tests__/
        └── annotations.test.ts
```

### Raw Terminal Output

#### git log (phase commits)

```
77321ee test(annotations): add 49 tests covering guards, parse, merge, upsert
787bcad feat(annotations): create @typefigma/annotations package with types, guards, merge logic
e388318 fix(woocommerce-generator): interpolate config values at generation time instead of emitting $this->woocommerceConfig.* PHP conditionals
```

#### Typecheck — all 13 workspaces (0 errors)

```
> @typefigma/analyzer@0.1.0 typecheck
> tsc --noEmit
> @typefigma/annotations@0.1.0 typecheck
> tsc --noEmit
> @typefigma/code-generator@0.1.0 typecheck
> tsc --noEmit
> docs-generator@1.0.0 typecheck
> tsc --noEmit
> @typefigma/elementor-mapper@0.1.0 typecheck
> tsc --noEmit
> @typefigma/figma-client@0.1.0 typecheck
> tsc --noEmit
> @typefigma/theme-builder@0.1.0 typecheck
> tsc --noEmit
> @typefigma/validator@0.1.0 typecheck
> tsc --noEmit
> @typefigma/woocommerce-generator@1.0.0 typecheck
> tsc --noEmit
> @typefigma/cli@0.1.0 typecheck
> tsc --noEmit
> @typefigma/api@0.1.0 typecheck
> tsc --noEmit
> @typefigma/figma-plugin@1.0.0 typecheck
> tsc --noEmit
> @typefigma/web-ui@0.1.0 typecheck
> tsc --noEmit
EXIT_CODE=0
```

#### Full test run — per-package counts

```
=== packages/core/analyzer ===
 Tests:  16 passed
=== packages/core/annotations ===
 Tests:  49 passed
=== packages/core/code-generator ===
 Tests:  70 passed
=== packages/core/elementor-mapper ===
 Tests:  340 passed
=== packages/core/figma-client ===
 Tests:  62 passed
=== packages/core/theme-builder ===
 Tests:  66 passed
=== packages/core/validator ===
 Tests:  12 passed
=== packages/core/woocommerce-generator ===
 Tests:  5 passed
=== packages/cli ===
 Tests:  4 passed
```

**Total: 624 tests passed** (pre-Phase A: 573; +49 new annotations tests + 2 woocommerce tests flipped from fail→pass).

### Commit List

```
e388318 fix(woocommerce-generator): interpolate config values at generation time
787bcad feat(annotations): create @typefigma/annotations package with types, guards, merge logic
77321ee test(annotations): add 49 tests covering guards, parse, merge, upsert
```

---

## Phase B — Traceability & Auto-Annotation Results

### Task 1 — Injection Approach

**Approach:** Shared helper `buildTraceAttrs` in `HtmlGenerator`, called at the top of every component generator method. The alternative (finding a single choke point) was rejected because `HtmlGenerator.generatePage()` orchestrates 20+ individual generator methods (generateHeader, generateHero, ...) that each emit their own root element via template literals.

**Files:**
- `packages/core/code-generator/src/html-generator.ts` — `buildTraceAttrs` (line 63), `HtmlGeneratorOptions` (line 51), constructor (line 57)
- `packages/core/code-generator/src/index.ts` — `traceability` option in `GeneratorOptions` (line 15), passes to `HtmlGenerator` (line 28)

**Attribute escaping:** Uses existing `escapeHtml` handling `&`, `<`, `>`, `"`, `'`.

**`traceability: false`:** Produces byte-identical output to pre-Phase B.

### Task 2 — Bridge Placement Decision

**Placement:** New package `@typefigma/annotation-bridge` at `packages/core/annotation-bridge/`.

**Justification:** Bridge imports from both `@typefigma/analyzer` (for `ComponentClassification`) and `@typefigma/annotations` (for `Annotation`, `AnnotationSet`, `isAnnotationSet`). A separate bridge keeps both packages pure and avoids dependency pollution. Dependency chain: `annotation-bridge` -> `analyzer` + `annotations` (no cycles).

**Confidence source:** Analyzer exposes `confidence: number` on most component types. Six types lack a `confidence` field (file:line from `packages/core/analyzer/src/types.ts`):
- `NavigationComponent` (117-123) -> default 0.7
- `GalleryComponent` (161-167) -> default 0.6
- `SearchComponent` (376-382) -> default 0.65
- `NewsletterComponent` (384-389) -> default 0.6
- `ContainerComponent` (406-412) -> default 0.5
- `ColumnComponent` (414-418) -> default 0.5

### ANALYZER_ROLE_MAP

```
headers: 'header',       footers: 'footer',        navigation: 'nav-menu',
heroes: 'hero',          ctaSections: 'cta',        testimonials: 'testimonial',
galleries: 'gallery',    productCards: 'product-card',  productDetails: 'product-detail',
cartComponents: 'cart',  checkoutComponents: 'checkout', postCards: 'blog-list',
postDetail: 'blog-post', contactForms: 'contact-form',   searchBars: 'search-form',
newsletters: 'newsletter', sections: 'section',     containers: 'container',
columns: 'column',
```

### Raw Terminal Output

#### git log --oneline (Phase B commits)

```
cad3ed5 docs: add Phase B report to AUDIT_REPORT.md
6dade67 test(annotation-bridge): add round-trip integration test verifying HTML trace attrs, auto-annotations, and merge
49aea90 feat(annotation-bridge): create @typefigma/annotation-bridge with ANALYZER_ROLE_MAP and buildAutoAnnotations
9cf4e77 feat(code-generator): add data-tf-* traceability attributes to generated HTML
```

#### Typecheck — 14 workspaces, 0 errors

```
> @typefigma/analyzer@0.1.0 typecheck
> tsc --noEmit
> @typefigma/annotation-bridge@0.1.0 typecheck
> tsc --noEmit
> @typefigma/annotations@0.1.0 typecheck
> tsc --noEmit
> @typefigma/code-generator@0.1.0 typecheck
> tsc --noEmit
> docs-generator@1.0.0 typecheck
> tsc --noEmit
> @typefigma/elementor-mapper@0.1.0 typecheck
> tsc --noEmit
> @typefigma/figma-client@0.1.0 typecheck
> tsc --noEmit
> @typefigma/theme-builder@0.1.0 typecheck
> tsc --noEmit
> @typefigma/validator@0.1.0 typecheck
> tsc --noEmit
> @typefigma/woocommerce-generator@1.0.0 typecheck
> tsc --noEmit
> @typefigma/cli@0.1.0 typecheck
> tsc --noEmit
> @typefigma/api@0.1.0 typecheck
> tsc --noEmit
> @typefigma/figma-plugin@1.0.0 typecheck
> tsc --noEmit
> @typefigma/web-ui@0.1.0 typecheck
> tsc --noEmit
EXIT_CODE=0
```

#### Full test run — per-package raw output

```
$ for pkg in packages/core/analyzer packages/core/annotations packages/core/annotation-bridge packages/core/code-generator packages/core/elementor-mapper packages/core/figma-client packages/core/theme-builder packages/core/validator packages/core/woocommerce-generator packages/cli; do cd "$pkg" && npx vitest run 2>&1 && cd - >/dev/null; done

=== packages/core/analyzer ===
✓ src/__tests__/layout-engine.test.ts (8 tests)
✓ src/__tests__/token-extractor.test.ts (5 tests)
✓ src/__tests__/component-detector.test.ts (3 tests)
  Tests  16 passed

=== packages/core/annotations ===
✓ src/__tests__/annotations.test.ts (49 tests)
  Tests  49 passed

=== packages/core/annotation-bridge ===
✓ src/__tests__/bridge.test.ts (11 tests)
✓ src/__tests__/roundtrip.test.ts (3 tests)
  Tests  14 passed

=== packages/core/code-generator ===
✓ src/__tests__/theme-json-generator.test.ts (10 tests)
✓ src/__tests__/dtcg-generator.test.ts (20 tests)
✓ src/__tests__/html-generator.test.ts (14 tests)
✓ src/__tests__/tailwind-generator.test.ts (7 tests)
✓ src/__tests__/wp-block-generator.test.ts (11 tests)
✓ src/__tests__/css-generator.test.ts (8 tests)
✓ src/__tests__/code-generator.test.ts (9 tests)
  Tests  79 passed

=== packages/core/elementor-mapper ===
✓ src/__tests__/mapper-hierarchical.test.ts (23 tests)
✓ src/__tests__/templates.test.ts (317 tests)
  Tests  340 passed

=== packages/core/figma-client ===
✓ tests/transitions-zindex.test.ts (5 tests)
✓ src/__tests__/client.test.ts (57 tests)
  Tests  62 passed

=== packages/core/theme-builder ===
✓ src/__tests__/config-panel.test.ts (15 tests)
✓ src/__tests__/wordpress-files.test.ts (17 tests)
✓ src/__tests__/font-manager.test.ts (34 tests)
  Tests  66 passed

=== packages/core/validator ===
✓ src/__tests__/validator.test.ts (12 tests)
  Tests  12 passed

=== packages/core/woocommerce-generator ===
✓ src/__tests__/woocommerce-generator.test.ts (5 tests)
  Tests  5 passed

=== packages/cli ===
✓ src/__tests__/cli.test.ts (4 tests)
  Tests  4 passed
```

**Grand total: 16+49+14+79+340+62+66+12+5+4 = 647 tests passed** (pre-Phase B: 624; +23 new: 9 traceability + 14 bridge).

### Commit List

```
cad3ed5 docs: add Phase B report to AUDIT_REPORT.md
6dade67 test(annotation-bridge): add round-trip integration test
49aea90 feat(annotation-bridge): create @typefigma/annotation-bridge
9cf4e77 feat(code-generator): add data-tf-* traceability attributes
```

### Acceptance Criteria

- [x] Traceability attributes on every component root element; `traceability: false` produces byte-identical output
- [x] Attribute values properly escaped (test: `should escape special characters in data-tf-name`)
- [x] All 79 code-generator tests green (70 old + 9 new)
- [x] Bridge placement justified (separate package, no import cycle)
- [x] ANALYZER_ROLE_MAP exported, 19 entries, covered by tests
- [x] buildAutoAnnotations deterministic (sorted, injected clock, guarded by isAnnotationSet)
- [x] Round-trip test: every domSelector matches exactly one element; merge override flips exactly one role
- [x] Typecheck: 0 errors across 14 workspaces
- [x] Full test suite: 647 green
- [x] Zero `any` / `as any` in new/modified code
- [x] One local commit per task, conventional messages, no push
- [x] A combined Phase A+Phase B report appended to AUDIT_REPORT.md
