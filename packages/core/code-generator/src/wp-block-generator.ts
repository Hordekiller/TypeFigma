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
  ExtractedTokens,
} from '@typefigma/analyzer';

export interface BlockOutput {
  patterns: BlockPattern[];
  templates: BlockTemplate[];
}

export interface BlockPattern {
  title: string;
  slug: string;
  description?: string;
  categories: string[];
  content: string;
  viewportWidth?: number;
  inserter?: boolean;
}

export interface BlockTemplate {
  title: string;
  slug: string;
  content: string;
  postTypes: string[];
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

    return patterns;
  }

  generateTemplates(): BlockTemplate[] {
    return [
      this.templateFromComponents(),
    ];
  }

  private patternFromHeader(header: HeaderComponent): BlockPattern {
    const logoBlock = header.hasLogo
      ? `<!-- wp:site-logo /-->`
      : '';
    const navBlock = header.hasMenu
      ? `<!-- wp:navigation {"overlayMenu":"mobile"} -->\n<!-- wp:page-list /-->\n<!-- /wp:navigation -->`
      : '';
    const searchBlock = header.hasSearch
      ? `<!-- wp:search {"label":"","buttonText":"Search"} /-->`
      : '';

    const inner = [
      logoBlock,
      navBlock,
      searchBlock,
    ].filter(Boolean).join('\n');

    const content = groupBlock(inner, {
      layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' },
      style: {
        color: { background: header.type === 'transparent' ? '' : '#ffffff' },
        spacing: { padding: { top: '16px', bottom: '16px', left: '40px', right: '40px' } },
      },
    });

    return {
      title: 'Header',
      slug: 'header',
      description: 'Site header with logo, navigation and search',
      categories: ['header'],
      content,
      inserter: false,
    };
  }

  private patternFromHero(hero: HeroComponent): BlockPattern {
    const heading = headingBlock('Your Main Headline', 1, {
      style: { color: { text: '#ffffff' } },
      fontSize: '48px',
    });

    const subtext = paragraphBlock('Your compelling subtext goes here', {
      style: { color: { text: 'rgba(255,255,255,0.8)' } },
      fontSize: '20px',
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
      textColumn.replace('width', '50%');
      content = columnsBlock(`${textColumn}\n${mediaColumn}`);
    } else {
      content = columnsBlock(textColumn);
    }

    const cover = coverBlock(content, {
      url: '{{featured_image}}',
      dimRatio: 50,
      overlColor: '#000000',
      minHeight: 600,
      align: 'full',
      style: { color: { background: this.tokens.colors.primary['700'] } },
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
      content += '\n\n<!-- wp:social-links -->\n<ul class="wp-block-social-links">\n  <li class="wp-social-link wp-social-link-facebook"><a href="#">Facebook</a></li>\n  <li class="wp-social-link wp-social-link-twitter"><a href="#">Twitter</a></li>\n  <li class="wp-social-link wp-social-link-instagram"><a href="#">Instagram</a></li>\n</ul>\n<!-- /wp:social-links -->';
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
    const cardBlocks = cards.map(card => {
      const image = imageBlock(card.name, {
        style: { border: { radius: '8px' } },
        sizeSlug: 'medium',
      });

      const title = headingBlock(card.name, 3);
      const price = paragraphBlock('{{price}}', {
        style: { color: { text: this.tokens.colors.text.primary } },
        fontSize: '20px',
        fontWeight: '700',
      });
      const btn = buttonBlock(card.structure.addToCartButton.text || 'Add to Cart');

      const inner = groupBlock([image, title, price, btn].join('\n'), {
        layout: { type: 'flex', orientation: 'vertical' },
        style: {
          spacing: { padding: '16px' },
          border: { radius: '12px', width: '1px', color: this.tokens.colors.border.default },
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
    };
  }

  private patternFromTestimonials(testimonials: TestimonialComponent[]): BlockPattern {
    const items = testimonials.map(t => {
      const avatar = t.hasAvatar
        ? `<!-- wp:avatar {"size":60} /-->`
        : '';
      const rating = t.hasRating
        ? `<!-- wp:group --><p style="color:#f59e0b">&#9733;&#9733;&#9733;&#9733;&#9733;</p><!-- /wp:group -->`
        : '';
      const text = paragraphBlock('Amazing product! This completely transformed our workflow.', { fontStyle: 'italic' });
      const author = headingBlock('John Doe', 4);
      return columnBlock([avatar, rating, text, author].filter(Boolean).join('\n'));
    }).join('\n');

    const content = groupBlock(
      columnsBlock(items, { isStackedOnMobile: true }),
      { align: 'wide' },
    );

    return {
      title: 'Testimonials',
      slug: 'testimonials',
      description: 'Customer testimonial cards',
      categories: ['testimonials', 'social-proof'],
      content,
    };
  }

  private patternFromGallery(gallery: GalleryComponent): BlockPattern {
    const { imageCount } = gallery;
    const columns = Math.min(imageCount, 3);
    const items = Array.from({ length: columns }, (_, i) =>
      columnBlock(imageBlock(`Gallery image ${i + 1}`, { sizeSlug: 'medium' }))
    ).join('\n');

    const content = groupBlock(columnsBlock(items, { isStackedOnMobile: true }), {
      align: 'wide',
    });

    return {
      title: 'Gallery',
      slug: 'gallery',
      description: 'Image gallery grid',
      categories: ['gallery', 'media'],
      content,
    };
  }

  private patternFromContactForm(form: FormComponent): BlockPattern {
    const fields = form.fields?.inputs || [];
    const fieldBlocks = fields.map(f =>
      paragraphBlock(`${f.label || f.placeholder}: [${f.type || 'text'}]`)
    ).join('\n');

    const content = groupBlock(
      [
        headingBlock('Contact Us', 2, { align: 'center' }),
        paragraphBlock('Get in touch with us', { align: 'center' }),
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
        },
      },
    );

    return {
      title: 'Contact Form',
      slug: 'contact-form',
      description: 'Contact form with input fields',
      categories: ['forms', 'contact'],
      content,
    };
  }

  private templateFromComponents(): BlockTemplate {
    const parts: string[] = [];

    parts.push(`<!-- wp:template-part {"slug":"header","area":"header"} /-->`);

    if (this.components.heroes.length > 0) {
      const heroPattern = this.patternFromHero(this.components.heroes[0]);
      parts.push(heroPattern.content);
    }

    for (const section of this.components.sections) {
      if (section.confidence > 0.5) {
        parts.push(this.patternFromSection(section).content);
      }
    }

    if (this.components.productCards.length > 0) {
      parts.push(this.patternFromProductGrid(this.components.productCards).content);
    }

    if (this.components.testimonials.length > 0) {
      parts.push(this.patternFromTestimonials(this.components.testimonials).content);
    }

    if (this.components.contactForms.length > 0) {
      parts.push(this.patternFromContactForm(this.components.contactForms[0]).content);
    }

    parts.push(`<!-- wp:template-part {"slug":"footer","area":"footer"} /-->`);

    return {
      title: 'Page',
      slug: 'page',
      content: parts.join('\n\n'),
      postTypes: ['page', 'post'],
    };
  }
}
