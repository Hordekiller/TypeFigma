import type {
  ComponentClassification,
  HeaderComponent,
  HeroComponent,
  FooterComponent,
  SectionComponent,
  ProductCardComponent,
  TestimonialComponent,
  GalleryComponent,
  FormComponent,
  NewsletterComponent,
  ExtractedTokens,
} from '@typefigma/analyzer';

import type { BlockPattern, BlockTemplate } from './types.js';

export type { BlockPattern, BlockTemplate };

export interface BlockOutput {
  patterns: BlockPattern[];
  templates: BlockTemplate[];
}

function escAttr(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function groupBlock(inner: string, attrs: Record<string, unknown> = {}): string {
  const json = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
  return `<!-- wp:group${json} -->\n${indent(inner)}\n<!-- /wp:group -->`;
}

function columnsBlock(inner: string, attrs: Record<string, unknown> = {}): string {
  const json = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
  return `<!-- wp:columns${json} -->\n${indent(inner)}\n<!-- /wp:columns -->`;
}

function columnBlock(inner: string, width?: string): string {
  const attrs = width ? { width } : {};
  const json = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
  return `<!-- wp:column${json} -->\n${indent(inner)}\n<!-- /wp:column -->`;
}

function headingBlock(text: string, level: number = 2, attrs: Record<string, unknown> = {}): string {
  const merged = { level, ...attrs };
  return `<!-- wp:heading ${JSON.stringify(merged)} -->\n<h${level} class="wp-block-heading">${escAttr(text)}</h${level}>\n<!-- /wp:heading -->`;
}

function paragraphBlock(text: string, attrs: Record<string, unknown> = {}): string {
  const json = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
  return `<!-- wp:paragraph${json} -->\n<p>${escAttr(text)}</p>\n<!-- /wp:paragraph -->`;
}

function buttonBlock(text: string, url: string = '#', attrs: Record<string, unknown> = {}): string {
  return `<!-- wp:buttons -->
<!-- wp:button ${JSON.stringify(attrs)} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${escAttr(url)}">${escAttr(text)}</a></div>
<!-- /wp:button -->
<!-- /wp:buttons -->`;
}

function imageBlock(alt: string = '', attrs: Record<string, unknown> = {}): string {
  const json = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
  return `<!-- wp:image${json} -->\n<figure class="wp-block-image"><img src="{{featured_image}}" alt="${escAttr(alt)}" /></figure>\n<!-- /wp:image -->`;
}

function coverBlock(inner: string, attrs: Record<string, unknown> = {}): string {
  const json = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
  return `<!-- wp:cover${json} -->\n${indent(inner)}\n<!-- /wp:cover -->`;
}

function indent(text: string): string {
  return text.split('\n').map(line => line ? `  ${line}` : line).join('\n');
}

function queryLoopBlock(inner: string, attrs: Record<string, unknown> = {}): string {
  const json = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
  return `<!-- wp:query${json} -->\n<!-- wp:post-template -->\n${indent(inner)}\n<!-- /wp:post-template -->\n<!-- wp:query-pagination -->\n<!-- wp:query-pagination-previous /-->\n<!-- wp:query-pagination-numbers /-->\n<!-- wp:query-pagination-next /-->\n<!-- /wp:query-pagination -->\n<!-- /wp:query -->`;
}

function wooProductsBlock(attrs: Record<string, unknown> = {}): string {
  const json = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
  return `<!-- wp:woocommerce/product-query${json} -->\n<!-- wp:post-template -->\n<!-- wp:woocommerce/product-image {"imageSizing":"thumbnail"} /-->\n<!-- wp:woocommerce/product-price /-->\n<!-- wp:woocommerce/product-title /-->\n<!-- wp:woocommerce/product-button /-->\n<!-- /wp:post-template -->\n<!-- wp:query-pagination -->\n<!-- wp:query-pagination-previous /-->\n<!-- wp:query-pagination-numbers /-->\n<!-- wp:query-pagination-next /-->\n<!-- /wp:query-pagination -->\n<!-- /wp:woocommerce/product-query -->`;
}

export class WpBlockGenerator {
  private tokens: ExtractedTokens;
  private components: ComponentClassification;

  constructor(components: ComponentClassification, tokens: ExtractedTokens) {
    this.components = components;
    this.tokens = tokens;
  }

  generatePatterns(): BlockPattern[] {
    const patterns: BlockPattern[] = [];

    if (this.components.heroes.length > 0) {
      patterns.push(this.patternFromHero(this.components.heroes[0]));
    }
    if (this.components.headers.length > 0) {
      patterns.push(this.patternFromHeader(this.components.headers[0]));
    }
    if (this.components.footers.length > 0) {
      patterns.push(this.patternFromFooter(this.components.footers[0]));
    }
    for (const section of this.components.sections) {
      if (section.confidence > 0.5) {
        patterns.push(this.patternFromSection(section));
      }
    }
    if (this.components.productCards.length > 0) {
      patterns.push(this.patternFromProductGrid(this.components.productCards));
      patterns.push(this.patternFromWooCommerceProducts());
    }
    if (this.components.testimonials.length > 0) {
      patterns.push(this.patternFromTestimonials(this.components.testimonials));
    }
    if (this.components.galleries.length > 0) {
      patterns.push(this.patternFromGallery(this.components.galleries[0]));
    }
    if (this.components.contactForms.length > 0) {
      patterns.push(this.patternFromContactForm(this.components.contactForms[0]));
    }
    if (this.components.newsletters.length > 0) {
      patterns.push(this.patternFromNewsletter(this.components.newsletters[0]));
    }
    if (this.components.navigation.length > 0) {
      patterns.push(this.patternFromNavigation());
    }

    patterns.push(this.patternFromBlogQuery());
    patterns.push(this.patternFromCallToAction());

    return patterns;
  }

  generateTemplates(): BlockTemplate[] {
    const templates: BlockTemplate[] = [
      this.templateFromPage(),
      this.templateFromFrontPage(),
      this.templateFromSingle(),
      this.templateFromArchive(),
    ];

    if (this.isEcommerce()) {
      templates.push(this.templateFromProductArchive());
      templates.push(this.templateFromSingleProduct());
      templates.push(this.templateFromCart());
      templates.push(this.templateFromCheckout());
    }

    return templates;
  }

  private isEcommerce(): boolean {
    return this.components.productCards.length > 0
      || this.components.productDetails.length > 0
      || this.components.cartComponents.length > 0
      || this.components.checkoutComponents.length > 0;
  }

  private patternFromHeader(header: HeaderComponent): BlockPattern {
    const logoBlock = header.hasLogo
      ? `<!-- wp:site-logo {"width":180} /-->`
      : `<!-- wp:site-title /-->`;
    const navBlock = header.hasMenu
      ? `<!-- wp:navigation {"overlayMenu":"mobile","layout":{"type":"flex","justifyContent":"center"}} -->\n<!-- wp:page-list /-->\n<!-- /wp:navigation -->`
      : '';
    const searchBlock = header.hasSearch
      ? `<!-- wp:search {"label":"","buttonText":"Search","placeholder":"Search...","buttonPosition":"button-inside","style":{"border":{"radius":"9999px"}}} /-->`
      : '';

    const inner = [
      logoBlock,
      navBlock,
      searchBlock,
    ].filter(Boolean).join('\n');

    const content = groupBlock(inner, {
      layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' },
      style: {
        color: { background: header.type === 'transparent' ? 'transparent' : '#ffffff' },
        spacing: { padding: { top: '16px', bottom: '16px', left: '40px', right: '40px' } },
        position: header.type === 'sticky' ? { type: 'sticky' } : undefined,
      },
    });

    return {
      title: 'Header',
      slug: 'header',
      description: 'Site header with logo, navigation and search',
      categories: ['header'],
      content,
      inserter: false,
      keywords: ['nav', 'menu', 'topbar'],
    };
  }

  private patternFromHero(hero: HeroComponent): BlockPattern {
    const heading = headingBlock('Your Main Headline', 1, {
      style: { color: { text: '#ffffff' } },
      fontSize: 'clamp(2rem, 5vw, 3rem)',
    });

    const subtext = paragraphBlock('Your compelling subtext goes here', {
      style: { color: { text: 'rgba(255,255,255,0.8)' } },
      fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    });

    const cta = buttonBlock('Get Started');

    const textColumn = columnBlock(
      groupBlock([heading, subtext, cta].join('\n'), {
        layout: { type: 'constrained' },
        style: {
          spacing: { padding: { top: '100px', bottom: '100px' } },
        },
      }),
    );

    let content: string;
    if (hero.layout === 'split') {
      const mediaColumn = columnBlock(
        imageBlock('Hero image', { sizeSlug: 'large' }),
        '50%',
      );
      content = columnsBlock(`${textColumn}\n${mediaColumn}`);
    } else {
      content = columnsBlock(textColumn);
    }

    const cover = coverBlock(content, {
      url: '{{featured_image}}',
      dimRatio: 50,
      overlayColor: '#000000',
      minHeight: 600,
      align: 'full',
      style: { color: { background: this.tokens.colors.primary?.['700'] || '#1d4ed8' } },
    });

    return {
      title: 'Hero Section',
      slug: 'hero-section',
      description: 'Full-width hero section with headline and call to action',
      categories: ['hero', 'call-to-action'],
      content: cover,
    };
  }

  private patternFromSection(section: SectionComponent): BlockPattern {
    const heading = headingBlock(section.name, 2, { align: 'center' });
    const body = paragraphBlock('Add your content here', { align: 'center' });
    const inner = groupBlock([heading, body].join('\n'), {
      layout: { type: 'constrained' },
      align: 'wide',
      style: {
        spacing: { padding: { top: '80px', bottom: '80px' } },
      },
    });

    return {
      title: section.name,
      slug: `section-${section.type}`,
      description: `${section.name} content section`,
      categories: ['section', section.type],
      content: inner,
    };
  }

  private patternFromFooter(footer: FooterComponent): BlockPattern {
    const columns: string[] = [];
    for (let i = 0; i < footer.columns; i++) {
      const colContent = [
        headingBlock(`Column ${i + 1}`, 4, { style: { color: { text: '#ffffff' } } }),
        `<!-- wp:page-list /-->`,
      ].join('\n');
      columns.push(columnBlock(colContent));
    }

    let content = columnsBlock(columns.join('\n'));

    if (footer.hasSocial) {
      content += '\n\n<!-- wp:social-links {"iconColor":"#ffffff","iconColorValue":"#ffffff","style":{"color":{"background":"#374151"}}} -->\n<ul class="wp-block-social-links has-icon-color">\n  <li class="wp-social-link wp-social-link-facebook"><a href="#">Facebook</a></li>\n  <li class="wp-social-link wp-social-link-twitter"><a href="#">Twitter</a></li>\n  <li class="wp-social-link wp-social-link-instagram"><a href="#">Instagram</a></li>\n</ul>\n<!-- /wp:social-links -->';
    }

    if (footer.hasNewsletter) {
      content += '\n\n<!-- wp:jetpack/subscriptions /-->';
    }

    content += '\n\n' + paragraphBlock(`&copy; ${new Date().getFullYear()} {{site_name}}. All rights reserved.`, {
      align: 'center',
      style: { color: { text: 'rgba(255,255,255,0.6)' } },
      fontSize: '14px',
    });

    const wrapped = groupBlock(content, {
      align: 'full',
      style: {
        color: { background: '#111827' },
        spacing: { padding: { top: '80px', bottom: '40px', left: '40px', right: '40px' } },
      },
    });

    return {
      title: 'Footer',
      slug: 'footer',
      description: 'Site footer with columns, social links and copyright',
      categories: ['footer'],
      content: wrapped,
      inserter: false,
    };
  }

  private patternFromProductGrid(cards: ProductCardComponent[]): BlockPattern {
    const cardBlocks = cards.slice(0, 4).map(card => {
      const image = imageBlock(card.name, {
        style: { border: { radius: '8px' } },
        sizeSlug: 'medium',
      });

      const title = headingBlock(card.name, 3);
      const price = paragraphBlock('{{price}}', {
        style: { color: { text: this.tokens.colors.text?.primary || '#171717' } },
        fontSize: '20px',
        fontWeight: '700',
      });
      const btn = buttonBlock(card.structure?.addToCartButton?.text || 'Add to Cart');

      const inner = groupBlock([image, title, price, btn].join('\n'), {
        layout: { type: 'flex', orientation: 'vertical' },
        style: {
          spacing: { padding: '16px' },
          border: { radius: '12px', width: '1px', color: this.tokens.colors.border?.default || '#e5e5e5' },
          color: { background: '#ffffff' },
        },
      });

      return columnBlock(inner);
    }).join('\n');

    const content = groupBlock(
      columnsBlock(cardBlocks, { isStackedOnMobile: true }),
      { align: 'wide' },
    );

    return {
      title: 'Product Grid',
      slug: 'product-grid',
      description: 'Grid of product cards',
      categories: ['products', 'ecommerce'],
      content,
      keywords: ['shop', 'products', 'grid', 'woocommerce'],
    };
  }

  private patternFromWooCommerceProducts(): BlockPattern {
    const content = groupBlock(
      [
        headingBlock('Featured Products', 2, { align: 'center' }),
        paragraphBlock('Browse our selection of high-quality products', { align: 'center' }),
        wooProductsBlock({
          columns: 3,
          rows: 2,
          align: 'wide',
        }),
      ].join('\n'),
      {
        align: 'full',
        style: { spacing: { padding: { top: '80px', bottom: '80px' } } },
      },
    );

    return {
      title: 'WooCommerce Products',
      slug: 'woocommerce-products',
      description: 'WooCommerce product grid with query loop',
      categories: ['products', 'ecommerce', 'woocommerce'],
      content,
      keywords: ['shop', 'woocommerce', 'products'],
    };
  }

  private patternFromBlogQuery(): BlockPattern {
    const postTemplate = `<!-- wp:post-template -->
<!-- wp:columns -->
<!-- wp:column {"width":"33.33%"} -->
<!-- wp:post-featured-image /-->
<!-- /wp:column -->
<!-- wp:column {"width":"66.66%"} -->
<!-- wp:group -->
<!-- wp:post-title {"level":2} /-->
<!-- wp:post-excerpt /-->
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<!-- wp:post-date /-->
<!-- wp:post-author /-->
<!-- /wp:group -->
<!-- /wp:group -->
<!-- /wp:column -->
<!-- /wp:columns -->
<!-- /wp:post-template -->`;

    const queryBlock = queryLoopBlock(postTemplate, {
      queryId: 1,
      query: { perPage: 6, pages: 0, offset: 0, postType: 'post', order: 'desc', orderBy: 'date', author: '', search: '', sticky: '', inherit: false },
      layout: { type: 'constrained' },
      align: 'wide',
    });

    const content = groupBlock(
      [headingBlock('Latest Posts', 2, { align: 'center' }), queryBlock].join('\n'),
      {
        align: 'full',
        style: { spacing: { padding: { top: '80px', bottom: '80px' } } },
      },
    );

    return {
      title: 'Blog Posts Query',
      slug: 'blog-posts',
      description: 'Query loop for blog posts with featured image, title, and excerpt',
      categories: ['blog', 'posts'],
      content,
      keywords: ['blog', 'posts', 'query', 'archive'],
    };
  }

  private patternFromCallToAction(): BlockPattern {
    const content = groupBlock(
      [
        headingBlock('Ready to Get Started?', 2, { align: 'center', style: { color: { text: '#ffffff' } } }),
        paragraphBlock('Join thousands of satisfied customers today', { align: 'center', style: { color: { text: 'rgba(255,255,255,0.8)' } } }),
        '<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->\n<!-- wp:button {"backgroundColor":"white","textColor":"primary-500"} -->\n<div class="wp-block-button"><a class="wp-block-button__link has-primary-500-color has-white-background-color has-text-color has-background wp-element-button" href="#">Get Started Now</a></div>\n<!-- /wp:button -->\n<!-- wp:button {"className":"is-style-outline"} -->\n<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-white-color has-text-color wp-element-button" href="#">Learn More</a></div>\n<!-- /wp:button -->\n<!-- /wp:buttons -->',
      ].join('\n'),
      {
        align: 'full',
        style: {
          color: { background: this.tokens.colors.primary?.['600'] || '#2563eb' },
          spacing: { padding: { top: '100px', bottom: '100px' } },
        },
      },
    );

    return {
      title: 'Call to Action',
      slug: 'call-to-action',
      description: 'Full-width call to action section',
      categories: ['call-to-action', 'conversion'],
      content,
      keywords: ['cta', 'call to action', 'conversion'],
    };
  }

  private patternFromTestimonials(testimonials: TestimonialComponent[]): BlockPattern {
    const items = testimonials.slice(0, 3).map(t => {
      const avatar = t.hasAvatar
        ? `<!-- wp:avatar {"size":60,"style":{"border":{"radius":"9999px"}}} /-->`
        : '';
      const rating = t.hasRating
        ? `<p style="color:#f59e0b;text-align:center">&#9733;&#9733;&#9733;&#9733;&#9733;</p>`
        : '';
      const text = paragraphBlock('Amazing product! This completely transformed our workflow.', { align: 'center', fontStyle: 'italic' });
      const author = headingBlock('John Doe', 4, { align: 'center', style: { color: { text: this.tokens.colors.text?.primary || '#171717' } } });

      return columnBlock([avatar, rating, text, author].filter(Boolean).join('\n'));
    }).join('\n');

    const content = groupBlock(
      [
        headingBlock('What Our Customers Say', 2, { align: 'center' }),
        paragraphBlock('Real reviews from real customers', { align: 'center' }),
        columnsBlock(items, { isStackedOnMobile: true }),
      ].join('\n'),
      { align: 'wide', style: { spacing: { padding: { top: '80px', bottom: '80px' } } } },
    );

    return {
      title: 'Testimonials',
      slug: 'testimonials',
      description: 'Customer testimonial cards',
      categories: ['testimonials', 'social-proof'],
      content,
      keywords: ['reviews', 'testimonials', 'social proof'],
    };
  }

  private patternFromGallery(gallery: GalleryComponent): BlockPattern {
    const { imageCount } = gallery;
    const columns = Math.min(imageCount, 3);
    const items = Array.from({ length: columns }, (_, i) =>
      columnBlock(imageBlock(`Gallery image ${i + 1}`, { sizeSlug: 'large', style: { border: { radius: '8px' } } }))
    ).join('\n');

    const content = groupBlock(columnsBlock(items, { isStackedOnMobile: true }), {
      align: 'wide',
      style: {
        spacing: { padding: { top: '80px', bottom: '80px' } },
      },
    });

    return {
      title: 'Gallery',
      slug: 'gallery',
      description: 'Image gallery grid',
      categories: ['gallery', 'media'],
      content,
      keywords: ['gallery', 'images', 'media'],
    };
  }

  private patternFromContactForm(form: FormComponent): BlockPattern {
    const fields = form.fields?.inputs || [];
    const fieldBlocks = fields.map(f =>
      paragraphBlock(`${f.label || f.placeholder || 'Field'}: [${f.type || 'text'}]`)
    ).join('\n');

    const content = groupBlock(
      [
        headingBlock('Contact Us', 2, { align: 'center' }),
        paragraphBlock('Get in touch with us. We would love to hear from you.', { align: 'center' }),
        fieldBlocks,
        buttonBlock(form.submitButton?.text || 'Send Message'),
      ].join('\n'),
      {
        layout: { type: 'constrained' },
        align: 'wide',
        style: {
          spacing: { padding: '40px' },
          border: { radius: '16px' },
          color: { background: '#ffffff' },
          shadow: { preset: 'md' },
        },
      },
    );

    return {
      title: 'Contact Form',
      slug: 'contact-form',
      description: 'Contact form with input fields',
      categories: ['forms', 'contact'],
      content,
      keywords: ['contact', 'form', 'enquiry'],
    };
  }

  private patternFromNewsletter(_newsletter: NewsletterComponent): BlockPattern {
    const content = groupBlock(
      [
      headingBlock('Stay Updated', 2, { align: 'center' }),
      paragraphBlock('Subscribe to our newsletter for the latest updates', { align: 'center' }),
        '<!-- wp:jetpack/subscriptions /-->',
      ].join('\n'),
      {
        align: 'wide',
        style: {
          spacing: { padding: '60px' },
          color: { background: '#f9fafb' },
          border: { radius: '16px' },
        },
      },
    );

    return {
      title: 'Newsletter Signup',
      slug: 'newsletter',
      description: 'Email newsletter subscription form',
      categories: ['newsletter', 'email'],
      content,
      keywords: ['newsletter', 'subscribe', 'email'],
    };
  }

  private patternFromNavigation(): BlockPattern {
    const content = `<!-- wp:navigation {"overlayMenu":"mobile","layout":{"type":"flex","justifyContent":"center","orientation":"horizontal"}} -->
<!-- wp:page-list /-->
<!-- wp:search {"label":"","buttonText":"Search"} /-->
<!-- /wp:navigation -->`;

    return {
      title: 'Navigation',
      slug: 'navigation',
      description: 'Primary navigation with menu items and search',
      categories: ['navigation', 'header'],
      content,
      inserter: false,
    };
  }

  private templateFromPage(): BlockTemplate {
    return {
      title: 'Page',
      slug: 'page',
      content: [
        `<!-- wp:template-part {"slug":"header","area":"header"} /-->`,
        `<!-- wp:group {"layout":{"type":"constrained"}} -->`,
        `<!-- wp:post-title {"level":1} /-->`,
        `<!-- wp:post-content /-->`,
        `<!-- /wp:group -->`,
        `<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`,
      ].join('\n'),
      postTypes: ['page'],
    };
  }

  private templateFromFrontPage(): BlockTemplate {
    const parts: string[] = [];

    parts.push(`<!-- wp:template-part {"slug":"header","area":"header"} /-->`);

    if (this.components.heroes.length > 0) {
      parts.push(this.patternFromHero(this.components.heroes[0]).content);
    }

    for (const section of this.components.sections) {
      if (section.confidence > 0.5) {
        parts.push(this.patternFromSection(section).content);
      }
    }

    if (this.components.productCards.length > 0) {
      parts.push(this.patternFromProductGrid(this.components.productCards).content);
      parts.push(this.patternFromWooCommerceProducts().content);
    }

    if (this.components.testimonials.length > 0) {
      parts.push(this.patternFromTestimonials(this.components.testimonials).content);
    }

    parts.push(this.patternFromCallToAction().content);

    parts.push(`<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`);

    return {
      title: 'Front Page',
      slug: 'front-page',
      content: parts.join('\n\n'),
      postTypes: ['page'],
    };
  }

  private templateFromSingle(): BlockTemplate {
    const content = [
      `<!-- wp:template-part {"slug":"header","area":"header"} /-->`,
      `<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}}} -->`,
      `<!-- wp:post-featured-image /-->`,
      `<!-- wp:post-title {"level":1} /-->`,
      `<!-- wp:post-date /-->`,
      `<!-- wp:post-author /-->`,
      `<!-- wp:post-content /-->`,
      `<!-- wp:post-terms {"term":"category"} /-->`,
      `<!-- wp:post-terms {"term":"post_tag"} /-->`,
      `<!-- wp:post-navigation-link /-->`,
      `<!-- /wp:group -->`,
      `<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`,
    ].join('\n');

    return {
      title: 'Single Post',
      slug: 'single',
      content,
      postTypes: ['post'],
    };
  }

  private templateFromArchive(): BlockTemplate {
    const postTemplate = `<!-- wp:post-template -->
<!-- wp:columns -->
<!-- wp:column {"width":"33.33%"} -->
<!-- wp:post-featured-image /-->
<!-- /wp:column -->
<!-- wp:column {"width":"66.66%"} -->
<!-- wp:post-title {"level":2} /-->
<!-- wp:post-excerpt /-->
<!-- wp:post-date /-->
<!-- /wp:column -->
<!-- /wp:columns -->
<!-- /wp:post-template -->`;

    const content = [
      `<!-- wp:template-part {"slug":"header","area":"header"} /-->`,
      `<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}}} -->`,
      `<!-- wp:query-title {"type":"archive"} /-->`,
      queryLoopBlock(postTemplate, { query: { perPage: 10, postType: 'post' } }),
      `<!-- /wp:group -->`,
      `<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`,
    ].join('\n');

    return {
      title: 'Archive',
      slug: 'archive',
      content,
      postTypes: ['post'],
    };
  }

  private templateFromProductArchive(): BlockTemplate {
    const content = [
      `<!-- wp:template-part {"slug":"header","area":"header"} /-->`,
      `<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}}} -->`,
      `<!-- wp:query-title {"type":"archive"} /-->`,
      `<!-- wp:woocommerce/store-notices /-->`,
      `<!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap"},"style":{"spacing":{"margin":{"bottom":"2rem"}}}} -->`,
      `<!-- wp:woocommerce/product-filter /-->`,
      `<!-- wp:woocommerce/catalog-sorting /-->`,
      `<!-- wp:woocommerce/active-filters /-->`,
      `<!-- /wp:group -->`,
      wooProductsBlock({ columns: 3, rows: 4 }),
      `<!-- /wp:group -->`,
      `<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`,
    ].join('\n');

    return {
      title: 'Product Archive',
      slug: 'product-archive',
      content,
      postTypes: ['product'],
    };
  }

  private templateFromSingleProduct(): BlockTemplate {
    const content = [
      `<!-- wp:template-part {"slug":"header","area":"header"} /-->`,
      `<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}}} -->`,
      `<!-- wp:woocommerce/notices /-->`,
      `<!-- wp:columns {"style":{"spacing":{"blockGap":"4rem"}}} -->`,
      `<!-- wp:column {"width":"50%"} -->`,
      `<!-- wp:woocommerce/product-image-gallery /-->`,
      `<!-- /wp:column -->`,
      `<!-- wp:column {"width":"50%"} -->`,
      `<!-- wp:woocommerce/product-title /-->`,
      `<!-- wp:woocommerce/product-rating /-->`,
      `<!-- wp:woocommerce/product-price /-->`,
      `<!-- wp:woocommerce/product-excerpt /-->`,
      `<!-- wp:woocommerce/add-to-cart-form /-->`,
      `<!-- wp:woocommerce/product-meta /-->`,
      `<!-- wp:woocommerce/product-details /-->`,
      `<!-- /wp:column -->`,
      `<!-- /wp:columns -->`,
      `<!-- wp:woocommerce/related-products -->`,
      `<!-- wp:woocommerce/product-query -->`,
      `<!-- wp:post-template -->`,
      `<!-- wp:woocommerce/product-image /-->`,
      `<!-- wp:woocommerce/product-title /-->`,
      `<!-- wp:woocommerce/product-price /-->`,
      `<!-- /wp:post-template -->`,
      `<!-- /wp:woocommerce/product-query -->`,
      `<!-- /wp:woocommerce/related-products -->`,
      `<!-- /wp:group -->`,
      `<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`,
    ].join('\n');

    return {
      title: 'Single Product',
      slug: 'single-product',
      content,
      postTypes: ['product'],
    };
  }

  private templateFromCart(): BlockTemplate {
    const content = [
      `<!-- wp:template-part {"slug":"header","area":"header"} /-->`,
      `<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}}} -->`,
      `<!-- wp:woocommerce/cart -->`,
      `<!-- wp:columns -->`,
      `<!-- wp:column {"width":"70%"} -->`,
      `<!-- wp:woocommerce/cart-table /-->`,
      `<!-- wp:woocommerce/cart-cross-sells /-->`,
      `<!-- /wp:column -->`,
      `<!-- wp:column {"width":"30%"} -->`,
      `<!-- wp:woocommerce/cart-totals /-->`,
      `<!-- /wp:column -->`,
      `<!-- /wp:columns -->`,
      `<!-- /wp:woocommerce/cart -->`,
      `<!-- /wp:group -->`,
      `<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`,
    ].join('\n');

    return {
      title: 'Cart',
      slug: 'cart',
      content,
      postTypes: ['page'],
    };
  }

  private templateFromCheckout(): BlockTemplate {
    const content = [
      `<!-- wp:template-part {"slug":"header","area":"header"} /-->`,
      `<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}}} -->`,
      `<!-- wp:woocommerce/checkout -->`,
      `<!-- wp:columns -->`,
      `<!-- wp:column {"width":"60%"} -->`,
      `<!-- wp:woocommerce/checkout-order-summary-block /-->`,
      `<!-- wp:woocommerce/checkout-actions-block /-->`,
      `<!-- /wp:column -->`,
      `<!-- wp:column {"width":"40%"} -->`,
      `<!-- wp:woocommerce/checkout-totals-block /-->`,
      `<!-- wp:woocommerce/checkout-shipping-methods-block /-->`,
      `<!-- wp:woocommerce/checkout-payment-block /-->`,
      `<!-- /wp:column -->`,
      `<!-- /wp:columns -->`,
      `<!-- /wp:woocommerce/checkout -->`,
      `<!-- /wp:group -->`,
      `<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`,
    ].join('\n');

    return {
      title: 'Checkout',
      slug: 'checkout',
      content,
      postTypes: ['page'],
    };
  }
}
