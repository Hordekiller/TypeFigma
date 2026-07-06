## Phase B — Traceability & Auto-Annotation Results

### Task 1 — Injection Approach

**Approach:** Shared helper `buildTraceAttrs` in `HtmlGenerator`, called at the top of every component generator method. The alternative (finding a single choke point) was rejected because `HtmlGenerator.generatePage()` orchestrates 20+ individual generator methods (generateHeader, generateHero, …) that each emit their own root element via template literals — there is no centralized element creation function.

**Files:**
- `packages/core/code-generator/src/html-generator.ts` — `buildTraceAttrs` (line 63), `HtmlGeneratorOptions` (line 51), constructor (line 57)
- `packages/core/code-generator/src/index.ts` — `traceability` option in `GeneratorOptions` (line 15), passes to `HtmlGenerator` (line 28)

**Attribute escaping:** Uses the existing `escapeHtml` method which handles `&`, `<`, `>`, `"`, `'`. Figma node IDs like `1:23` — the colon is valid inside a quoted HTML attribute; the validator/CSS pipeline was audited and no regex chokes on colons inside `data-*` attribute selectors.

**`traceability: false`:** Produces byte-identical output to pre-Phase B (proven by test `should produce byte-identical output when traceability is false`).

### Task 2 — Bridge Placement Decision

**Placement:** New package `@typefigma/annotation-bridge` at `packages/core/annotation-bridge/`.

**Justification:** The bridge imports from both `@typefigma/analyzer` (for `ComponentClassification`) and `@typefigma/annotations` (for `Annotation`, `AnnotationSet`, `isAnnotationSet`). Placing it inside analyzer would require adding annotations as a dependency of analyzer, mixing concerns. A separate bridge keeps both packages pure and avoids dependency pollution. The dependency chain is: `annotation-bridge` → `analyzer` + `annotations` — no cycles.

**Confidence source:** Analyzer exposes `confidence: number` on most component types (HeaderComponent, FooterComponent, HeroComponent, CTAComponent, TestimonialComponent, ProductCardComponent, ProductDetailComponent, CartComponent, CheckoutComponent, PostCardComponent, PostDetailComponent, FormComponent, SectionComponent). Six types lack a `confidence` field (file:line evidence):
- `NavigationComponent` (types.ts:117-123) → default 0.7
- `GalleryComponent` (types.ts:161-167) → default 0.6
- `SearchComponent` (types.ts:376-382) → default 0.65
- `NewsletterComponent` (types.ts:384-389) → default 0.6
- `ContainerComponent` (types.ts:406-412) → default 0.5
- `ColumnComponent` (types.ts:414-418) → default 0.5

### ANALYZER_ROLE_MAP

```ts
export const ANALYZER_ROLE_MAP = {
  headers: 'header',
  footers: 'footer',
  navigation: 'nav-menu',
  heroes: 'hero',
  ctaSections: 'cta',
  testimonials: 'testimonial',
  galleries: 'gallery',
  productCards: 'product-card',
  productDetails: 'product-detail',
  cartComponents: 'cart',
  checkoutComponents: 'checkout',
  postCards: 'blog-list',
  postDetail: 'blog-post',
  contactForms: 'contact-form',
  searchBars: 'search-form',
  newsletters: 'newsletter',
  sections: 'section',
  containers: 'container',
  columns: 'column',
};
```

### Raw Terminal Output

#### git log --oneline (Phase B commits)

```
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

#### Full test run

| Package | Tests | Status |
|---------|-------|--------|
| analyzer | 16 | ✅ |
| annotations | 49 | ✅ |
| annotation-bridge | 14 | ✅ **(new)** |
| code-generator | 79 | ✅ (70 old + 9 new) |
| elementor-mapper | 340 | ✅ |
| figma-client | 62 | ✅ |
| theme-builder | 66 | ✅ |
| validator | 12 | ✅ |
| woocommerce-generator | 5 | ✅ |
| cli | 4 | ✅ |

**Total: 647 tests** (pre-Phase B: 624; +23 new).

### Commit List

| Hash | Message |
|------|---------|
| `9cf4e77` | feat(code-generator): add data-tf-* traceability attributes to generated HTML |
| `49aea90` | feat(annotation-bridge): create @typefigma/annotation-bridge with ANALYZER_ROLE_MAP and buildAutoAnnotations |
| `6dade67` | test(annotation-bridge): add round-trip integration test verifying HTML trace attrs, auto-annotations, and merge |

### Acceptance Criteria

- [x] Traceability attributes on every node-derived element; `traceability: false` produces byte-identical output
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
- [x] AUDIT_REPORT.md appended
