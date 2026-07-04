import type { ExtractedTokens, ComponentClassification } from '@typefigma/analyzer';

interface DocConfig {
  themeSlug: string;
  themeName: string;
  tokens: ExtractedTokens;
  components: ComponentClassification;
  projectType: string;
  generatedFiles: Array<{ path: string; content: string }>;
  plugins?: string[];
}

interface DocSection {
  title: string;
  content: string;
}

export class DocGenerator {
  private config: DocConfig;

  constructor(config: DocConfig) {
    this.config = config;
  }

  generateReadmeMd(): string {
    const { themeSlug, themeName, projectType, plugins } = this.config;
    const isEcom = projectType === 'ecommerce';
    const comp = this.config.components;
    const tokens = this.config.tokens;
    const features: string[] = [];

    features.push('Responsive design (mobile-first)');
    features.push('Full Site Editing (FSE) support with `theme.json`');
    features.push('Elementor integration with custom widgets');
    features.push('Customizer settings for colors, typography, layout, and social links');
    features.push('Accessibility ready (WCAG AA compliant)');
    features.push('SEO-friendly semantic HTML5 markup');
    features.push('Cross-browser compatible');
    features.push('Translation ready');

    if (isEcom) features.push('WooCommerce integration with shop, cart, checkout, and my-account templates');
    if (comp.headers?.length) features.push('Customizable header with sticky/transparent options');
    if (comp.footers?.length) features.push('Multi-column footer with widget areas');
    if (comp.heroes?.length) features.push('Hero section with call-to-action');
    if (comp.testimonials?.length) features.push('Testimonials section');
    if (comp.galleries?.length) features.push('Gallery/portfolio section');
    if (comp.productCards?.length) features.push('Product grid with card layout');
    if (comp.ctaSections?.length) features.push('Call-to-action banners');
    if (comp.contactForms?.length) features.push('Contact form integration');

    const colorCount = Object.values(tokens.colors).reduce((s, v) => {
      if (v && typeof v === 'object') return s + Object.keys(v).length;
      return s;
    }, 0);

    const section = (s: DocSection) => `## ${s.title}\n\n${s.content}`;

    const sections: DocSection[] = [
      {
        title: 'Overview',
        content: [
          `${themeName} is a WordPress theme automatically generated from Figma designs using [TypeFigma](https://typefigma.app).`,
          '',
          `**Project Type:** ${projectType}`,
          `**Generated:** ${new Date().toISOString().split('T')[0]}`,
          `**Slug:** \`${themeSlug}\``,
          `**Design Tokens:** ${colorCount} colors, ${Object.keys(tokens.typography.fontFamilies || {}).length} font families`,
          `**Detected Components:** ${this.countComponents()} total`,
        ].join('\n'),
      },
      {
        title: 'Features',
        content: features.map(f => `- ${f}`).join('\n'),
      },
      {
        title: 'Installation',
        content: [
          '### Manual Installation',
          '',
          `1. Upload the \`${themeSlug}\` folder to \`/wp-content/themes/\``,
          '2. Activate the theme via **Appearance → Themes**',
          '3. Go to **Appearance → Customize** to configure colors, typography, and layout',
          '4. (Optional) Import `demo-content.xml` using **Tools → Import → WordPress**',
          '',
          '### Required Plugins',
          '',
          ...(plugins?.length ? plugins.map(p => `- **${this.pluginName(p)}** - ${this.pluginDesc(p)}`) : ['- Elementor (free)']),
          ...(isEcom ? ['- WooCommerce'] : []),
        ].join('\n'),
      },
      {
        title: 'Customizer Settings',
        content: [
          'The following sections are available in **Appearance → Customize**:',
          '',
          '| Section | Options |',
          '|---------|--------|',
          '| Colors & Branding | Primary, Secondary, Accent, Background, Text colors |',
          '| Typography | Body font, Heading font |',
          '| Layout | Container width, Layout style (full-width/boxed) |',
          ...(comp.headers?.length ? ['| Header | Sticky header, Transparent header |'] : []),
          ...(isEcom ? ['| Shop Settings | Products per page, Product columns, Catalog mode |'] : []),
          '| Social Links | Facebook, Twitter, Instagram, LinkedIn, YouTube, GitHub |',
        ].join('\n'),
      },
      {
        title: 'Theme Structure',
        content: [
          '```',
          `${themeSlug}/`,
          '├── style.css',
          '├── theme.json',
          '├── index.php',
          '├── header.php',
          '├── footer.php',
          '├── functions.php',
          '├── page.php',
          '├── single.php',
          '├── archive.php',
          '├── 404.php',
          '├── search.php',
          '├── sidebar.php',
          '├── screenshot.png',
          '├── readme.txt',
          '├── robots.txt',
          '├── demo-content.xml',
          '├── assets/',
          '│   ├── css/',
          '│   │   ├── global.css',
          '│   │   ├── components.css',
          '│   │   └── woocommerce.css',
          '│   └── js/',
          '│       └── theme.js',
          '├── inc/',
          '│   ├── admin/',
          '│   │   ├── settings.php',
          '│   │   ├── customizer.php',
          '│   │   └── customizer-preview.js',
          '│   └── elementor-widgets.php',
          '├── templates/',
          '│   └── page.html',
          '├── patterns/',
          '│   ├── header.php',
          '│   ├── footer.php',
          '│   ├── hero-section.php',
          '│   ├── product-grid.php',
          '│   └── testimonials.php',
          '├── styles/',
          '│   ├── default.json',
          '│   ├── light.json',
          '│   └── dark.json',
          '├── elementor/',
          '│   └── templates/',
          '│       ├── header.json',
          '│       ├── footer.json',
          '│       └── product-archive.json',
          ...(isEcom ? [
            '└── woocommerce/',
            '    ├── archive-product.php',
            '    ├── single-product.php',
            '    ├── content-product.php',
            '    ├── cart.php',
            '    ├── checkout.php',
            '    └── myaccount.php',
          ] : []),
          '```',
        ].join('\n'),
      },
      {
        title: 'Development',
        content: [
          'This theme was generated by TypeFigma. To regenerate with updated Figma designs:',
          '',
          '```bash',
          'npx typefigma generate \\',
          '  --token YOUR_FIGMA_TOKEN \\',
          '  --url https://figma.com/file/YOUR_FILE_KEY \\',
          '  --name "' + themeName + '" \\',
          '  --output ./output',
          '```',
        ].join('\n'),
      },
    ];

    return `# ${themeName}\n\n${sections.map(section).join('\n\n---\n\n')}\n\n---\n\n*Generated by TypeFigma on ${new Date().toISOString().split('T')[0]}*`;
  }

  generatePhpDocBlock(description: string, params?: Array<{ name: string; type: string; desc: string }>, returns?: string, since?: string): string {
    const lines: string[] = [
      '/**',
      ` * ${description}`,
      ' *',
    ];
    if (params) {
      for (const p of params) {
        lines.push(` * @param ${p.type} $${p.name} ${p.desc}`);
      }
    }
    if (returns) {
      lines.push(` * @return ${returns}`);
    }
    if (since) {
      lines.push(` * @since ${since}`);
    }
    lines.push(' */');
    return lines.join('\n');
  }

  generateFileHeader(description: string, packageName?: string): string {
    const lines: string[] = [
      '<?php',
      '/**',
      ` * ${description}`,
      ' *',
      ` * @package ${this.config.themeSlug}`,
    ];
    if (packageName) {
      lines.push(` * @subpackage ${packageName}`);
    }
    lines.push(' */');
    return lines.join('\n');
  }

  generateFunctionDoc(name: string, description: string, params?: Array<{ name: string; type: string; desc: string }>, returns?: string): string {
    return [
      '/**',
      ` * ${description}`,
      ' *',
      ...(params?.map(p => ` * @param ${p.type} $${p.name} ${p.desc}`) || []),
      ...(returns ? [` * @return ${returns}`] : []),
      ` * @since ${this.config.themeSlug} 1.0.0`,
      ' */',
      `function ${name}() {`,
    ].join('\n');
  }

  generateAgentsUpdate(): string {
    const { themeSlug, projectType, plugins } = this.config;
    const isEcom = projectType === 'ecommerce';

    return `## Recent Updates (${new Date().toISOString().split('T')[0]})

### Theme: ${this.config.themeName} (\`${themeSlug}\`)

This theme was generated with:
- **Project type:** ${projectType}
- **Generated files:** ${this.config.generatedFiles.length}
- **Design tokens:** Extracted from Figma (colors, typography, spacing)
- **Components:** ${this.countComponents()} detected across ${this.countComponentTypes()} categories
- **Customizer:** Complete with ${isEcom ? 7 : 5} sections
- **WooCommerce:** ${isEcom ? 'Full integration (cart, checkout, my-account)' : 'N/A'}

### Architecture Notes
- PHP template files use WordPress coding standards
- CSS uses CSS custom properties with fallbacks
- JavaScript is vanilla (no framework dependency)
- Elementor templates are JSON-based
- All strings are escaped and i18n-ready`;
  }

  private countComponents(): number {
    return Object.values(this.config.components).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  }

  private countComponentTypes(): number {
    return Object.keys(this.config.components).filter(k => Array.isArray(this.config.components[k]) && this.config.components[k].length > 0).length;
  }

  private pluginName(slug: string): string {
    const names: Record<string, string> = {
      woocommerce: 'WooCommerce',
      elementor: 'Elementor',
      'elementor-pro': 'Elementor Pro',
      yoast: 'Yoast SEO',
      'rank-math': 'Rank Math SEO',
      'wp-rocket': 'WP Rocket',
      'litespeed-cache': 'LiteSpeed Cache',
      wordfence: 'Wordfence Security',
      'contact-form-7': 'Contact Form 7',
      monsterinsights: 'MonsterInsights',
      wpforms: 'WPForms',
    };
    return names[slug] || slug;
  }

  private pluginDesc(slug: string): string {
    const descs: Record<string, string> = {
      woocommerce: 'E-commerce platform',
      elementor: 'Front-end page builder',
      'elementor-pro': 'Premium theme builder and widgets',
      yoast: 'Search engine optimization',
      'rank-math': 'Advanced SEO plugin',
      'wp-rocket': 'Caching and performance',
      'litespeed-cache': 'Server-level caching',
      wordfence: 'Security firewall and scanner',
      'contact-form-7': 'Contact forms',
      monsterinsights: 'Google Analytics',
      wpforms: 'Drag-and-drop form builder',
    };
    return descs[slug] || '';
  }
}
