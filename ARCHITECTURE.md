# Architecture: Figma → WordPress Theme (10-Step Pipeline)

یک سیستم تبدیل هوشمند که:
- لینک Figma بگیره
- تشخیص بده نوع سایت چیه (فروشگاهی/شرکتی/بلاگ/...)
- کدهای CSS/HTML رو استخراج کنه
- به قالب کامل وردپرس تبدیل کنه
- همه چیز در Elementor قابل ویرایش باشه

---

## معماری کلی سیستم

[Figma URL] 
    ↓
[Figma API Fetch]
    ↓
[10-Step Pipeline]
    ↓
[WordPress Theme .zip]
    ↓
[Import به Elementor]

---

## Pipeline ده مرحله‌ای

### مرحله 1: Fetch & Analysis 🔍
ورودی: لینک Figma  
خروجی: ساختار کامل طرح + متادیتا

```typescript
interface FigmaAnalysis {
  projectType: 'shop' | 'corporate' | 'blog' | 'portfolio' | 'landing';
  pages: Page[];
  components: {
    headers: ComponentNode[];
    footers: ComponentNode[];
    products: ComponentNode[];
    cta: ComponentNode[];
    forms: ComponentNode[];
  };
  designTokens: {
    colors: ColorToken[];
    typography: TypographyToken[];
    spacing: SpacingScale;
    breakpoints: Breakpoint[];
  };
}
```

### مرحله 2: Component Detection 🎯
ورودی: ساختار خام Figma  
خروجی: Component‌های شناسایی‌شده

```typescript
interface DetectedComponents {
  header: {
    type: 'sticky' | 'static' | 'transparent';
    hasLogo: boolean;
    hasMenu: boolean;
    hasSearch: boolean;
    hasCTA: boolean;
  };
  hero: {
    layout: 'fullwidth' | 'centered' | 'split';
    hasVideo: boolean;
    hasSlider: boolean;
  };
  sections: Section[];
  footer: {
    columns: number;
    hasSocial: boolean;
    hasNewsletter: boolean;
  };
  productCard?: {
    hasQuickView: boolean;
    hasWishlist: boolean;
    hasRating: boolean;
  };
}
```

### مرحله 3: Design Tokens Extraction 🎨
```typescript
interface ExtractedTokens {
  colors: {
    primary: { 50: string; 100: string; /* ... */ 900: string };
    secondary: { /* ... */ };
    neutral: { /* ... */ };
  };
  typography: {
    h1: { fontSize: string; fontWeight: number; lineHeight: string; };
    body: { /* ... */ };
  };
  spacing: { xs: string; sm: string; md: string; lg: string; xl: string; };
  shadows: { sm: string; md: string; lg: string; };
  borderRadius: { none: string; sm: string; md: string; full: string; };
}
```

### مرحله 4: Code Generation (HTML/CSS) 💻
تبدیل هر Component به semantic HTML + CSS Variables + Responsive

### مرحله 5: Elementor JSON Generation 📦
تبدیل HTML به Elementor Containers + Global Colors/Fonts + Theme Builder Templates

### مرحله 6: WordPress Theme Structure 📁
ساختار کامل قالب وردپرس شامل style.css, functions.php, elementor/templates/

### مرحله 7: Configuration Layer ⚙️
تنظیمات قابل ویرایش در Customizer (رنگ‌ها، فونت‌ها، layout، تنظیمات فروشگاه)

### مرحله 8: WooCommerce Integration 🛒
فقط در صورت تشخیص فروشگاه: قالب‌های WooCommerce + Product Card widget

### مرحله 9: Testing & Validation ✅
بررسی syntax, contrast, responsive, Elementor import, WooCommerce workflow

### مرحله 10: Package & Export 📦
خروجی: theme-name.zip + demo-content + docs + metadata.json

---

## Tech Stack

### Backend (Pipeline)
```
packages/
├── core/
│   ├── figma-client/       # Figma API wrapper
│   ├── analyzer/           # مراحل 1-3
│   ├── code-generator/     # مرحله 4
│   ├── elementor-mapper/   # مرحله 5
│   ├── theme-builder/      # مراحل 6-7
│   └── validator/          # مرحله 9
├── cli/                    # خط فرمان
└── api/                    # REST API برای UI
```

### Frontend (Live Preview)
```
apps/
└── web-ui/
    ├── components/
    │   ├── PipelineProgress.tsx
    │   ├── ComponentPreview.tsx
    │   └── SettingsPanel.tsx
    └── pages/
        └── generate.tsx
```

---

## نقشه راه توسعه

### فاز 1 (هفته 1-2): Core Pipeline
- [x] Figma API integration
- [ ] Component detection
- [ ] Token extraction
- [ ] تست با یک طرح ساده

### فاز 2 (هفته 3-4): Elementor Generation
- [ ] HTML/CSS generation
- [ ] Elementor JSON mapper
- [ ] Theme structure builder
- [ ] تست import در Elementor

### فاز 3 (هفته 5-6): Full Theme
- [ ] Configuration layer
- [ ] Validation
- [ ] Packaging
- [ ] تست با قالب کامل

### فاز 4 (هفته 7-8): WooCommerce + UI
- [ ] WooCommerce integration
- [ ] Live preview UI
- [ ] Documentation generator
