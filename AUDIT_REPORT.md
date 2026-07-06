## Phase A — Annotations Package Results

### Task 0 — Root Cause of 2 WooCommerce Test Failures

**Root cause:** The `WooCommerceGenerator` emitted PHP `$this->woocommerceConfig.*` conditionals as literal strings into templates instead of evaluating config values at TypeScript generation time. Two tests depended on compile-time interpolation:

| Test | Expectation | Actual (before fix) |
|------|-------------|---------------------|
| `should include product variations in single-product.php:38` | Template contains `if ($product->is_type('variable'))` | Template contained `if ($this->woocommerceConfig.includeVariations && $product->is_type('variable'))` |
| `should not include mini cart in header.php when disabled:57` | Template does NOT contain `woocommerce_mini_cart` | Template always contained the mini-cart block wrapped in a PHP `if ($this->woocommerceConfig.includeMiniCart)` |

**Fix** (`packages/core/woocommerce-generator/src/index.ts`):

1. **`generateSingleProductTemplate()` (line 80):** Changed the role from emitting a PHP conditional to evaluating `this.woocommerceConfig.includeVariations` at generation time via a template literal `${variationsBlock}`. When `includeVariations` is true, the emitted PHP checks `if ($product->is_type('variable'))` directly; when false, only `woocommerce_template_single_add_to_cart()` is emitted.

2. **`generateHeaderTemplate()` (line 373):** Changed from emitting `<?php if ($this->woocommerceConfig.includeMiniCart) : ?>...<?php endif; ?>` to evaluating `this.woocommerceConfig.includeMiniCart` at generation time. When true, the mini-cart div is emitted; when false, an empty string is interpolated.

3. **Constructor (line 16):** Fallback `woocommerceConfig ?? config.woocommerceFeatures` so the second arg is optional — callers passing config via `ThemeConfig.woocommerceFeatures` (like the tests) no longer need to pass it twice. Removed unused `private config` field since the `ThemeConfig` is no longer stored after extracting `woocommerceFeatures`. Removed stale `void this.woocommerceConfig` suppression since the field is now actually read.

### Final ComponentRole List

| Analyzer Component Type | Mapped ComponentRole | Source |
|-------------------------|---------------------|--------|
| `headers` | `header` | Proposed list |
| `footers` | `footer` | Proposed list |
| `navigation` | `nav-menu` | Proposed list |
| `heroes` | `hero` | Proposed list |
| `ctaSections` | `cta` | **Added** — CTA components are a distinct detected type |
| `testimonials` | `testimonial` | Proposed list |
| `galleries` | `gallery` | Proposed list |
| `productCards` | `product-card` | Proposed list |
| `productDetails` | `product-detail` | **Added** — distinct from product-card (full product page) |
| `cartComponents` | `cart` | **Added** — cart is a distinct detected type |
| `checkoutComponents` | `checkout` | **Added** — checkout is a distinct detected type |
| `postCards` | `blog-list` | Proposed list |
| `postDetail` | `blog-post` | Proposed list |
| `contactForms` | `contact-form` | Proposed list |
| `searchBars` | `search-form` | Proposed list |
| `newsletters` | `newsletter` | **Added** — newsletter signup is a distinct detected type |
| `sections` | `section` | Proposed list |
| `containers` | `container` | Proposed list |
| `columns` | `column` | **Added** — column layout primitive |

**Roles added (6):** `cta`, `product-detail`, `cart`, `checkout`, `newsletter`, `column` — all required to losslessly represent the analyzer's 19 detected component types in `ComponentClassification`.

Additional roles kept for user annotations (no analyzer equivalent): `button`, `slider`, `carousel`, `product-grid`, `user-profile`, `sidebar`, `pricing-table`, `breadcrumb`, `social-icons`, `text`, `image`, `unknown`.

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

| Hash | Message |
|------|---------|
| `e388318` | fix(woocommerce-generator): interpolate config values at generation time instead of emitting $this->woocommerceConfig.* PHP conditionals |
| `787bcad` | feat(annotations): create @typefigma/annotations package with types, guards, merge logic |
| `77321ee` | test(annotations): add 49 tests covering guards, parse, merge, upsert |
