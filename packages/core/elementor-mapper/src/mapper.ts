import type {
  ComponentClassification,
  HeaderComponent,
  HeroComponent,
  FooterComponent,
  SectionComponent,
  ProductCardComponent,
  ProductDetailComponent,
  CartComponent,
  CheckoutComponent,
  PostCardComponent,
  PostDetailComponent,
  TestimonialComponent,
  FormComponent,
  GalleryComponent,
  SearchComponent,
  NewsletterComponent,
  NavigationComponent,
  ExtractedTokens,
} from '@typefigma/analyzer';
import type {
  ElementorNode,
  ElementorSettings,
  ElementorTemplate,
  GlobalSettings,
  ColorSchemeItem,
  FontFamilyItem,
  ImageSetting,
  LinkSetting,
  SectionOption,
  SectionSelectionConfig,
  HierarchicalSelection,
  SectionTemplate,
  Dimension,
} from './types.js';
import { getSectionTemplates } from './templates.js';

function generateId(prefix: string = 'el'): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function elTag(name: string): string {
  return `[elementor-tag id="" name="${name}" settings=""]`;
}

function imgDynamic(url: string, tagName: string): { image: ImageSetting; __dynamic__?: Record<string, string> } {
  return {
    image: { url, id: '' },
    __dynamic__: { image: elTag(tagName) },
  };
}

function textDynamic(text: string, tagName: string): { text?: string; editor?: string; title?: string; __dynamic__?: Record<string, string> } {
  const key = tagName === 'post-title' || tagName === 'site-name' || tagName === 'archive-title' ? 'title' : 'editor';
  return {
    [key]: text,
    __dynamic__: { [key]: elTag(tagName) },
  };
}

function linkDynamic(url: string, tagName: string): { link: LinkSetting; __dynamic__?: Record<string, string> } {
  return {
    link: { url },
    __dynamic__: { link: elTag(tagName) },
  };
}

export class ElementorMapper {
  private tokens: ExtractedTokens;

  constructor(tokens: ExtractedTokens) {
    this.tokens = tokens;
  }

  // ── Container Builder ─────────────────────────────

  private createContainer(
    overrides: Partial<ElementorSettings> = {},
    children: ElementorNode[] = [],
    id = generateId('container'),
  ): ElementorNode {
    return {
      id,
      elType: 'container',
      settings: {
        content_width: 'boxed',
        flex_direction: 'column',
        ...overrides,
      } as ElementorSettings,
      elements: children,
    };
  }

  private createWidget(
    widgetType: string,
    settings: ElementorSettings = {},
    id = generateId(widgetType === 'button' ? 'btn' : widgetType),
  ): ElementorNode {
    return { id, elType: 'widget', widgetType, settings };
  }

  // ── Header ────────────────────────────────────────

  mapHeader(header: HeaderComponent): ElementorNode {
    const elements: ElementorNode[] = [];

    if (header.hasLogo) {
      elements.push(this.createWidget('image', {
        ...imgDynamic('', 'site-logo'),
        width: { size: 150, unit: 'px' },
        align: 'left',
      }));
    }

    if (header.hasMenu) {
      elements.push(this.createWidget('nav-menu', {
        menu: 'primary',
        layout: 'horizontal',
        align: 'center',
        pointer: 'underline',
        animation: 'fade',
        breakpoint: 'tablet',
      }));
    }

    if (header.hasSearch) {
      elements.push(this.createWidget('search-form', {
        skin: 'classic',
        input_size: 'sm',
        button_type: 'icon',
        placeholder: 'Search...',
      }));
    }

    if (header.hasCTA) {
      const ctaSettings: ElementorSettings = {
        text: 'Get Started',
        link: { url: '#' },
        size: 'sm',
        button_background_color: this.tokens.colors.primary['500'],
        button_background_hover_color: this.tokens.colors.primary['600'],
        button_text_color: '#FFFFFF',
        button_border_radius: { size: 8, unit: 'px' },
        hover_animation: 'grow',
      };
      elements.push(this.createWidget('button', ctaSettings));
    }

    const bgColor = header.type === 'transparent' ? '' : '#FFFFFF';

    return this.createContainer({
      content_width: 'full',
      flex_direction: 'row',
      justify_content: 'space-between',
      align_items: 'center',
      padding: { top: 16, right: 40, bottom: 16, left: 40, unit: 'px' },
      padding_tablet: { top: 12, right: 20, bottom: 12, left: 20, unit: 'px' },
      padding_mobile: { top: 10, right: 16, bottom: 10, left: 16, unit: 'px' },
      background_background: header.type === 'transparent' ? undefined : 'classic',
      background_color: bgColor || undefined,
      position: header.type === 'sticky' ? 'sticky' : header.type === 'transparent' ? 'absolute' : 'relative',
      top: { size: 0, unit: 'px' },
      z_index: 100,
      entrance_animation: header.type === 'sticky' ? 'fadeInDown' : undefined,
    }, elements, generateId('header'));
  }

  // ── Hero ──────────────────────────────────────────

  mapHero(hero: HeroComponent): ElementorNode {
    const contentElements: ElementorNode[] = [
      this.createWidget('heading', {
        title: 'Your Main Headline',
        header_size: 'h1',
        align: hero.layout === 'centered' ? 'center' : 'left',
        title_color: '#FFFFFF',
        typography_typography: 'custom',
        font_size: { size: 56, unit: 'px' },
        font_size_tablet: { size: 40, unit: 'px' },
        font_size_mobile: { size: 32, unit: 'px' },
        font_weight: '700',
        line_height: { size: 1.2, unit: 'em' },
        letter_spacing: { size: -1, unit: 'px' },
      }),
      this.createWidget('text-editor', {
        editor: '<p>Your compelling subtext goes here</p>',
        align: hero.layout === 'centered' ? 'center' : 'left',
        title_color: 'rgba(255,255,255,0.8)',
        typography_typography: 'custom',
        font_size: { size: 20, unit: 'px' },
        font_weight: '400',
      }),
      this.createContainer({
        flex_direction: 'row',
        gap: { size: 16, unit: 'px' },
        justify_content: hero.layout === 'centered' ? 'center' : 'flex-start',
        flex_wrap: 'wrap',
      }, [
        this.createWidget('button', {
          text: 'Get Started',
          link: { url: '#' },
          size: 'lg',
          button_background_color: this.tokens.colors.primary['500'],
          button_background_hover_color: this.tokens.colors.primary['600'],
          button_text_color: '#FFFFFF',
          button_border_radius: { size: 8, unit: 'px' },
          hover_animation: 'grow',
        }),
        this.createWidget('button', {
          text: 'Learn More',
          link: { url: '#' },
          size: 'lg',
          button_background_color: 'rgba(0,0,0,0.1)',
          button_background_hover_color: 'rgba(0,0,0,0.2)',
          button_text_color: '#FFFFFF',
          button_border_radius: { size: 8, unit: 'px' },
          border_border: 'solid',
          border_width: { size: 2, unit: 'px' },
          border_color: '#FFFFFF',
          hover_animation: 'grow',
        }),
      ]),
    ];

    const children: ElementorNode[] = [
      this.createContainer({
        flex_direction: 'column',
        justify_content: 'center',
        gap: { size: 24, unit: 'px' },
        content_width: hero.layout === 'split' ? 'boxed' : 'boxed',
      }, contentElements, generateId('hero-text')),
    ];

    if (hero.layout === 'split') {
      children.push(this.createContainer({
        flex_direction: 'column',
        justify_content: 'center',
        align_items: 'center',
      }, [
        this.createWidget('image', {
          ...imgDynamic('', 'featured-image'),
          border_radius: { size: 24, unit: 'px', top: 24, right: 24, bottom: 24, left: 24 },
        }),
      ], generateId('hero-media')));
    }

    return this.createContainer({
      content_width: 'full',
      min_height: { size: 600, unit: 'px' },
      min_height_tablet: { size: 450, unit: 'px' },
      min_height_mobile: { size: 350, unit: 'px' },
      flex_direction: hero.layout === 'split' ? 'row' : 'column',
      align_items: 'center',
      justify_content: 'center',
      padding: { top: 100, right: 40, bottom: 100, left: 40, unit: 'px' },
      padding_tablet: { top: 60, right: 20, bottom: 60, left: 20, unit: 'px' },
      padding_mobile: { top: 40, right: 16, bottom: 40, left: 16, unit: 'px' },
      gap: { size: 40, unit: 'px' },
      background_background: 'gradient',
      background_gradient_first_color: this.tokens.colors.primary['700'],
      background_gradient_second_color: this.tokens.colors.primary['900'],
      background_gradient_type: 'linear',
      background_gradient_angle: { size: 135, unit: 'deg' },
      border_radius: { size: 0, unit: 'px' },
      overflow: 'hidden',
      position: 'relative',
    }, children, generateId('hero'));
  }

  // ── Section ───────────────────────────────────────

  mapSection(section: SectionComponent): ElementorNode {
    return this.createContainer({
      content_width: 'boxed',
      padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' },
      padding_tablet: { top: 60, right: 20, bottom: 60, left: 20, unit: 'px' },
      padding_mobile: { top: 40, right: 16, bottom: 40, left: 16, unit: 'px' },
    }, [
      this.createContainer({
        flex_direction: 'column',
        align_items: 'center',
        gap: { size: 16, unit: 'px' },
      }, [
        this.createWidget('heading', {
          title: section.name,
          header_size: 'h2',
          align: 'center',
          title_color: this.tokens.colors.text.primary,
          typography_typography: 'custom',
          font_size: { size: 36, unit: 'px' },
          font_weight: '700',
        }),
        this.createWidget('text-editor', {
          editor: '<p>Add your content here</p>',
          align: 'center',
          title_color: this.tokens.colors.text.secondary,
        }),
      ], generateId(`${section.type}-inner`)),
    ], generateId(`section-${section.id}`));
  }

  // ── Footer ────────────────────────────────────────

  mapFooter(footer: FooterComponent): ElementorNode {
    const columns: ElementorNode[] = Array.from({ length: footer.columns }, (_, i) =>
      this.createContainer({
        flex_direction: 'column',
        gap: { size: 12, unit: 'px' },
      }, [
        this.createWidget('heading', {
          title: `Column ${i + 1}`,
          header_size: 'h4',
          title_color: '#FFFFFF',
          typography_typography: 'custom',
          font_weight: '600',
        }),
        this.createWidget('wp-widget-pages', {
          title: '',
        }),
      ], generateId(`footer-col-${i + 1}`))
    );

    const elements: ElementorNode[] = [
      this.createContainer({
        flex_direction: 'row',
        gap: { size: 40, unit: 'px' },
        flex_wrap: 'wrap',
      }, columns, generateId('footer-grid')),
    ];

    if (footer.hasSocial) {
      elements.push({
        id: generateId('footer-social'),
        elType: 'container',
        settings: {}
      });
    }

    if (footer.hasNewsletter) {
      elements.push(this.createContainer({
        flex_direction: 'row',
        justify_content: 'center',
        margin: { top: 32, right: 0, bottom: 0, left: 0, unit: 'px' },
      }, [
        this.createWidget('form', {
          form_name: 'newsletter',
          button_text: 'Subscribe',
          button_background_color: this.tokens.colors.primary['500'],
          fields: [
            { type: 'email', placeholder: 'Your email', required: true },
          ],
        }),
      ], generateId('footer-newsletter')));
    }

    // Copyright bar
    elements.push(this.createContainer({
      flex_direction: 'row',
      justify_content: 'center',
      margin: { top: 40, right: 0, bottom: 0, left: 0, unit: 'px' },
      padding: { top: 24, right: 0, bottom: 0, left: 0, unit: 'px' },
      border_border: 'solid',
      border_width: { size: 1, unit: 'px' },
      border_color: 'rgba(255,255,255,0.1)',
    }, [
      this.createWidget('text-editor', {
        ...textDynamic(`<p>&copy; ${new Date().getFullYear()} <span></span>. All rights reserved.</p>`, 'site-name'),
        align: 'center',
        title_color: 'rgba(255,255,255,0.6)',
        typography_typography: 'custom',
        font_size: { size: 14, unit: 'px' },
      }),
    ], generateId('footer-bottom')));

    return this.createContainer({
      content_width: 'full',
      padding: { top: 80, right: 40, bottom: 40, left: 40, unit: 'px' },
      padding_tablet: { top: 60, right: 20, bottom: 30, left: 20, unit: 'px' },
      padding_mobile: { top: 40, right: 16, bottom: 20, left: 16, unit: 'px' },
      background_background: 'classic',
      background_color: '#111827',
    }, elements, generateId('footer'));
  }

  // ── Product Card ──────────────────────────────────

  mapProductCard(card: ProductCardComponent): ElementorNode {
    const imageElements: ElementorNode[] = [
      this.createWidget('image', {
        ...imgDynamic('', 'featured-image'),
        hover_animation: 'zoom',
        image_border_radius: { size: 8, unit: 'px', top: 8, right: 8, bottom: 0, left: 0 },
      }),
    ];

    if (card.structure.productBadge) {
      imageElements.push(this.createWidget('text-editor', {
        editor: `<span style="background:${this.tokens.colors.ecommerce?.sale || '#ef4444'};color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600">${card.structure.productBadge.text}</span>`,
        position: 'absolute',
        top: { size: 8, unit: 'px' },
        right: { size: 8, unit: 'px' },
        z_index: 10,
      }));
    }

    const contentElements: ElementorNode[] = [
      this.createWidget('heading', {
        ...textDynamic('', 'post-title'),
        ...linkDynamic('', 'internal-url'),
        header_size: 'h3',
        title_color: this.tokens.colors.text.primary,
        typography_typography: 'custom',
        font_weight: '600',
        font_size: { size: 20, unit: 'px' },
      }),
    ];

    if (card.structure.productRating) {
      contentElements.push(
        this.createWidget('star-rating', {
          rating_scale: 5,
          rating_size: { size: 16, unit: 'px' },
          rating_color: '#f59e0b',
          rating_unmarked_color: '#d1d5db',
        }),
      );
    }

    if (card.structure.shortDescription) {
      contentElements.push(this.createWidget('text-editor', {
        ...textDynamic('', 'post-excerpt'),
        title_color: this.tokens.colors.text.secondary,
        typography_typography: 'custom',
        font_size: { size: 14, unit: 'px' },
      }));
    }

    contentElements.push(
      this.createWidget('text-editor', {
        ...textDynamic(`<span style="font-size:1.25rem;font-weight:700;color:${this.tokens.colors.text.primary}"></span>`, 'product-price'),
      }),
      this.createWidget('button', {
        text: card.structure.addToCartButton.text || 'Add to Cart',
        icon: 'fa fa-shopping-cart',
        icon_position: 'left',
        button_background_color: this.tokens.colors.primary['500'],
        button_background_hover_color: this.tokens.colors.primary['600'],
        button_text_color: '#FFFFFF',
        button_border_radius: { size: 4, unit: 'px' },
        align: 'center',
        hover_animation: 'grow',
      }),
    );

    return this.createContainer({
      content_width: 'boxed',
      background_background: 'classic',
      background_color: '#FFFFFF',
      border_radius: { size: 12, unit: 'px' },
      border_border: 'solid',
      border_width: { size: 1, unit: 'px' },
      border_color: this.tokens.colors.border.default,
      box_shadow_box_shadow_type: 'preset1',
      box_shadow_box_shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      hover_box_shadow_box_shadow_type: 'preset3',
      hover_box_shadow_box_shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      margin: { top: 0, right: 0, bottom: 20, left: 0, unit: 'px' },
      overflow: 'hidden',
    }, [
      this.createContainer({
        position: 'relative',
        flex_direction: 'column',
        overflow: 'hidden',
      }, imageElements, generateId('pc-image-wrap')),
      this.createContainer({
        flex_direction: 'column',
        gap: { size: 8, unit: 'px' },
        padding: { top: 16, right: 16, bottom: 16, left: 16, unit: 'px' },
      }, contentElements, generateId('pc-content')),
    ], generateId(`pc-${card.id}`));
  }

  // ── Testimonials ──────────────────────────────────

  mapTestimonial(testimonial: TestimonialComponent): ElementorNode {
    const elements: ElementorNode[] = [
      this.createWidget('star-rating', {
        rating_scale: 5,
        rating_size: { size: 20, unit: 'px' },
        rating_color: '#f59e0b',
        rating_unmarked_color: '#d1d5db',
        testimonial_alignment: testimonial.layout === 'single' ? 'center' : 'left',
      }),
      this.createWidget('text-editor', {
        editor: '<p>Amazing product! This completely transformed our workflow and saved us hours of manual work every week. Highly recommend to anyone looking to scale their business.</p>',
        align: testimonial.layout === 'single' ? 'center' : 'left',
        typography_typography: 'custom',
        font_size: { size: 16, unit: 'px' },
        font_style: 'italic',
        line_height: { size: 1.7, unit: 'em' },
        title_color: this.tokens.colors.text.secondary,
      }),
    ];

    if (testimonial.hasAvatar) {
      elements.push(this.createWidget('image', {
        image: { url: '' },
        image_size: 'thumbnail',
        align: testimonial.layout === 'single' ? 'center' : 'left',
        width: { size: 60, unit: 'px' },
        image_border_radius: { size: 50, unit: '%' },
      }));
    }

    elements.push(this.createWidget('heading', {
      title: 'John Doe',
      header_size: 'h4',
      align: testimonial.layout === 'single' ? 'center' : 'left',
      title_color: this.tokens.colors.text.primary,
      typography_typography: 'custom',
      font_weight: '600',
    }));

    if (testimonial.hasCompanyLogo) {
      elements.push(this.createWidget('text-editor', {
        editor: '<p style="font-size:14px;color:#6b7280">CEO, Company Name</p>',
        align: testimonial.layout === 'single' ? 'center' : 'left',
      }));
    }

    const layoutMap: Record<string, string> = {
      grid: 'row',
      slider: 'row',
      single: 'column',
    };

    return this.createContainer({
      flex_direction: layoutMap[testimonial.layout] || 'column',
      align_items: testimonial.layout === 'single' ? 'center' : 'flex-start',
      gap: { size: 16, unit: 'px' },
      padding: { top: 32, right: 32, bottom: 32, left: 32, unit: 'px' },
      background_background: 'classic',
      background_color: '#FFFFFF',
      border_radius: { size: 16, unit: 'px' },
      border_border: 'solid',
      border_width: { size: 1, unit: 'px' },
      border_color: this.tokens.colors.border.default,
      box_shadow_box_shadow_type: 'preset2',
      box_shadow_box_shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    }, elements, generateId('testimonial'));
  }

  // ── Contact Form ──────────────────────────────────

  mapContactForm(form: FormComponent): ElementorNode {
    const fields = form.fields?.inputs || [];

    const fieldConfigs = fields.map(f => ({
      field_type: f.type === 'email' ? 'email' : 'text',
      field_label: f.label || '',
      placeholder: f.placeholder || '',
      required: f.required,
      width: form.layout.columns > 1 ? `${100 / form.layout.columns}%` : '100%',
      _id: generateId('field'),
    }));

    return this.createContainer({
      content_width: 'boxed',
      padding: { top: 40, right: 40, bottom: 40, left: 40, unit: 'px' },
      background_background: 'classic',
      background_color: '#FFFFFF',
      border_radius: { size: 16, unit: 'px' },
      box_shadow_box_shadow_type: 'preset2',
      box_shadow_box_shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    }, [
      this.createWidget('form', {
        form_name: form.name,
        button_text: form.submitButton.text || 'Send Message',
        button_background_color: this.tokens.colors.primary['500'],
        button_background_hover_color: this.tokens.colors.primary['600'],
        button_text_color: '#FFFFFF',
        button_border_radius: { size: 8, unit: 'px' },
        fields: fieldConfigs,
        label_position: form.layout.labelPosition || 'top',
        column_gap: { size: 16, unit: 'px' },
        row_gap: { size: 16, unit: 'px' },
      }),
    ], generateId(`form-${form.id}`));
  }

  // ── Gallery ───────────────────────────────────────

  mapGallery(gallery: GalleryComponent): ElementorNode {
    const layoutStyle: Record<string, string> = {
      grid: 'grid',
      masonry: 'masonry',
      slider: 'slider',
      carousel: 'carousel',
    };

    return this.createContainer({
      flex_direction: 'column',
      gap: { size: 24, unit: 'px' },
    }, [
      gallery.hasFilter ? this.createWidget('gallery-filter', {
        active_color: this.tokens.colors.primary['500'],
      }) : null,
      this.createWidget('image-gallery', {
        gallery_type: layoutStyle[gallery.layout] || 'grid',
        columns: { size: 3, unit: 'px' },
        columns_tablet: { size: 2, unit: 'px' },
        columns_mobile: { size: 1, unit: 'px' },
        thumbnail_ratio: '1',
        image_border_radius: { size: 8, unit: 'px' },
        gallery_link: gallery.hasLightbox ? 'file' : 'none',
        grid_gallery_spacing: { size: 16, unit: 'px' },
        grid_gallery_spacing_tablet: { size: 12, unit: 'px' },
        grid_gallery_spacing_mobile: { size: 8, unit: 'px' },
      }),
    ].filter(Boolean) as ElementorNode[], generateId('gallery'));
  }

  // ── Pricing Table ─────────────────────────────────

  mapPricingTable(): ElementorNode {
    return this.createContainer({
      flex_direction: 'row',
      gap: { size: 24, unit: 'px' },
      flex_wrap: 'wrap',
      justify_content: 'center',
      align_items: 'stretch',
    }, [
      this.createPricingCard('Basic', '$19', '/month', ['1 Website', '5 GB Storage', 'Basic Support']),
      this.createPricingCard('Pro', '$49', '/month', ['10 Websites', '50 GB Storage', 'Priority Support', 'Analytics'], true),
      this.createPricingCard('Enterprise', '$99', '/month', ['Unlimited Websites', '500 GB Storage', '24/7 Support', 'Custom Solutions', 'API Access']),
    ], generateId('pricing'));
  }

  private createPricingCard(
    title: string,
    price: string,
    period: string,
    features: string[],
    featured: boolean = false,
  ): ElementorNode {
    return this.createContainer({
      flex_direction: 'column',
      gap: { size: 16, unit: 'px' },
      padding: { top: 40, right: 32, bottom: 40, left: 32, unit: 'px' },
      background_background: 'classic',
      background_color: featured ? this.tokens.colors.primary['50'] : '#FFFFFF',
      border_radius: { size: 16, unit: 'px' },
      border_border: 'solid',
      border_width: featured ? { size: 2, unit: 'px' } : { size: 1, unit: 'px' },
      border_color: featured ? this.tokens.colors.primary['500'] : this.tokens.colors.border.default,
      box_shadow_box_shadow_type: featured ? 'preset3' : 'preset1',
      flex_grow: 1,
      flex_basis: '300px',
    }, [
      this.createWidget('heading', {
        title,
        header_size: 'h3',
        align: 'center',
        title_color: this.tokens.colors.text.primary,
      }),
      this.createWidget('text-editor', {
        editor: `<span style="font-size:48px;font-weight:800;color:${this.tokens.colors.primary['500']}">${price}</span><span style="color:${this.tokens.colors.text.secondary}">${period}</span>`,
        align: 'center',
      }),
      this.createWidget('icon-list', {
        icon_list: features.map(f => ({
          text: f,
          icon: featured ? 'fa fa-check-circle' : 'fa fa-circle',
          icon_color: featured ? this.tokens.colors.success['500'] : this.tokens.colors.neutral['400'],
        })),
        icon_position: 'left',
        space_between: { size: 12, unit: 'px' },
      }),
      this.createWidget('button', {
        text: featured ? 'Start Free Trial' : 'Get Started',
        align: 'center',
        button_background_color: featured ? this.tokens.colors.primary['500'] : 'transparent',
        button_background_hover_color: this.tokens.colors.primary['600'],
        button_text_color: featured ? '#FFFFFF' : this.tokens.colors.primary['500'],
        button_text_hover_color: '#FFFFFF',
        border_border: featured ? 'none' : 'solid',
        border_width: featured ? undefined : { size: 2, unit: 'px' },
        border_color: featured ? undefined : this.tokens.colors.primary['500'],
        button_border_radius: { size: 8, unit: 'px' },
        hover_animation: 'grow',
        margin: { top: 16, right: 0, bottom: 0, left: 0, unit: 'px' },
      }),
    ], generateId(`pricing-${title.toLowerCase()}`));
  }

  // ── Navigation ────────────────────────────────────

  mapNavigation(): ElementorNode {
    return this.createContainer({
      flex_direction: 'row',
      justify_content: 'center',
      gap: { size: 0, unit: 'px' },
    }, [
      this.createWidget('nav-menu', {
        menu: 'primary',
        layout: 'horizontal',
        align: 'center',
        pointer: 'underline',
        animation: 'fade',
        breakpoint: 'tablet',
        dropdown_position: 'below',
      }),
    ], generateId('navigation'));
  }

  // ── News & Blog Posts Grid ─────────────────────────

  mapBlogPosts(): ElementorNode {
    return this.createContainer({
      flex_direction: 'column',
      gap: { size: 32, unit: 'px' },
    }, [
      this.createContainer({
        flex_direction: 'row',
        justify_content: 'space-between',
        align_items: 'center',
      }, [
        this.createWidget('heading', {
          title: 'Latest Posts',
          header_size: 'h2',
          title_color: this.tokens.colors.text.primary,
        }),
        this.createWidget('button', {
          text: 'View All',
          size: 'sm',
          button_background_color: 'transparent',
          button_text_color: this.tokens.colors.primary['500'],
          button_text_hover_color: this.tokens.colors.primary['600'],
          border_border: 'solid',
          border_width: { size: 1, unit: 'px' },
          border_color: this.tokens.colors.primary['500'],
          button_border_radius: { size: 4, unit: 'px' },
          hover_animation: 'grow',
        }),
      ], generateId('posts-header')),
      this.createWidget('posts', {
        posts_per_page: 6,
        columns: 3,
        columns_tablet: 2,
        columns_mobile: 1,
        thumbnail_size: 'large',
        show_title: 'yes',
        title_tag: 'h3',
        show_excerpt: 'yes',
        excerpt_length: 20,
        show_meta: 'yes',
        show_read_more: 'yes',
        read_more_text: 'Read More »',
        meta_data: ['date', 'author', 'categories'],
        pagination: 'numbers',
      }),
    ], generateId('blog-posts'));
  }

  // ── CTA Section ───────────────────────────────────

  mapCTA(): ElementorNode {
    return this.createContainer({
      content_width: 'full',
      padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' },
      padding_tablet: { top: 60, right: 20, bottom: 60, left: 20, unit: 'px' },
      padding_mobile: { top: 40, right: 16, bottom: 40, left: 16, unit: 'px' },
      background_background: 'gradient',
      background_gradient_first_color: this.tokens.colors.primary['600'],
      background_gradient_second_color: this.tokens.colors.secondary['600'],
      background_gradient_type: 'linear',
      background_gradient_angle: { size: 45, unit: 'deg' },
    }, [
      this.createContainer({
        flex_direction: 'column',
        align_items: 'center',
        gap: { size: 24, unit: 'px' },
      }, [
        this.createWidget('heading', {
          title: 'Ready to Get Started?',
          header_size: 'h2',
          align: 'center',
          title_color: '#FFFFFF',
          typography_typography: 'custom',
          font_size: { size: 40, unit: 'px' },
          font_weight: '700',
        }),
        this.createWidget('text-editor', {
          editor: '<p style="font-size:18px;color:rgba(255,255,255,0.8)">Join thousands of satisfied customers today. Start your free trial now.</p>',
          align: 'center',
        }),
        this.createContainer({
          flex_direction: 'row',
          gap: { size: 16, unit: 'px' },
          justify_content: 'center',
          flex_wrap: 'wrap',
        }, [
          this.createWidget('button', {
            text: 'Start Free Trial',
            size: 'lg',
            button_background_color: '#FFFFFF',
            button_background_hover_color: 'rgba(255,255,255,0.9)',
            button_text_color: this.tokens.colors.primary['600'],
            button_text_hover_color: this.tokens.colors.primary['700'],
            button_border_radius: { size: 8, unit: 'px' },
            hover_animation: 'grow',
          }),
          this.createWidget('button', {
            text: 'Contact Sales',
            size: 'lg',
            button_background_color: 'transparent',
            button_background_hover_color: 'rgba(255,255,255,0.1)',
            button_text_color: '#FFFFFF',
            button_text_hover_color: '#FFFFFF',
            border_border: 'solid',
            border_width: { size: 2, unit: 'px' },
            border_color: '#FFFFFF',
            button_border_radius: { size: 8, unit: 'px' },
            hover_animation: 'grow',
          }),
        ], generateId('cta-buttons')),
      ], generateId('cta-inner')),
    ], generateId('cta-section'));
  }

  // ═══════════════════════════════════════════════════
  // ── Theme Builder Widgets ─────────────────────────
  // ═══════════════════════════════════════════════════

  mapPostTitle(htmlTag: string = 'h1'): ElementorNode {
    return this.createWidget('post-title', {
      ...textDynamic('', 'post-title'),
      html_tag: htmlTag,
      typography_typography: 'custom',
      font_weight: '700',
      title_color: this.tokens.colors.text.primary,
    });
  }

  mapPostExcerpt(): ElementorNode {
    return this.createWidget('post-excerpt', {
      ...textDynamic('', 'post-excerpt'),
      word_count: 55,
      link_text: 'Read More',
      typography_typography: 'custom',
      font_size: { size: 16, unit: 'px' },
      title_color: this.tokens.colors.text.secondary,
    });
  }

  mapPostContent(): ElementorNode {
    return this.createWidget('post-content', {
      typography_typography: 'custom',
      font_size: { size: 16, unit: 'px' },
      line_height: { size: 1.8, unit: 'em' },
      title_color: this.tokens.colors.text.primary,
    });
  }

  mapFeaturedImage(): ElementorNode {
    return this.createWidget('post-featured-image', {
      ...imgDynamic('', 'post-featured-image'),
      image_size: 'large',
      caption_source: 'attachment',
      border_radius: { size: 12, unit: 'px' },
    });
  }

  mapAuthorBox(): ElementorNode {
    return this.createWidget('author-box', {
      avatar_size: 100,
      show_biography: 'yes',
      show_icons: 'yes',
      author_name: '',
    });
  }

  mapPostComments(): ElementorNode {
    return this.createWidget('post-comments', {});
  }

  mapPostNavigation(): ElementorNode {
    return this.createWidget('post-navigation', {
      show_title: 'yes',
      show_arrows: 'yes',
      in_same_term: 'no',
    });
  }

  mapPostInfo(): ElementorNode {
    return this.createWidget('post-info', {
      meta_list: ['author', 'date', 'comments', 'categories'],
      separator: ' / ',
    });
  }

  mapSiteLogo(): ElementorNode {
    return this.createWidget('site-logo', {
      ...imgDynamic('', 'site-logo'),
      width: { size: 150, unit: 'px' },
      align: 'left',
      caption_source: 'none',
    });
  }

  mapSiteTitle(): ElementorNode {
    return this.createWidget('site-title', {
      ...textDynamic('', 'site-name'),
      html_tag: 'h1',
      font_size: { size: 24, unit: 'px' },
      title_color: this.tokens.colors.text.primary,
    });
  }

  mapPageTitle(): ElementorNode {
    return this.createWidget('page-title', {
      ...textDynamic('', 'page-title'),
      html_tag: 'h1',
      font_size: { size: 48, unit: 'px' },
      align: 'center',
      title_color: this.tokens.colors.text.primary,
    });
  }

  mapBreadcrumbs(): ElementorNode {
    return this.createWidget('breadcrumbs', {
      home_text: 'Home',
      separator: '/',
      show_home: 'yes',
      home_link: 'yes',
    });
  }

  mapSearchForm(search?: SearchComponent): ElementorNode {
    return this.createWidget('search-form', {
      placeholder: search?.hasDropdown ? 'Search categories...' : 'Search...',
      skin: 'classic',
      button_type: 'icon',
      search_icon: 'yes',
      live_search: 'yes',
      min_characters: 3,
      results_per_page: 10,
    });
  }

  mapSitemap(): ElementorNode {
    return this.createWidget('sitemap', {
      sitemap_type: 'page',
      depth: 3,
      orderby: 'menu_order',
      sitemap_order: 'asc',
    } as ElementorSettings);
  }

  mapArchiveTitle(): ElementorNode {
    return this.createWidget('archive-title', {
      ...textDynamic('', 'archive-title'),
      html_tag: 'h1',
      font_size: { size: 48, unit: 'px' },
      align: 'center',
      title_color: this.tokens.colors.text.primary,
    });
  }

  mapArchivePosts(postCard?: PostCardComponent): ElementorNode {
    return this.createWidget('archive-posts', {
      skin: 'classic',
      columns: 3,
      columns_tablet: 2,
      columns_mobile: 1,
      posts_per_page: 9,
      image_position: 'top',
      image_size: 'full',
      masonry: postCard?.layout === 'overlay' ? '' : 'yes',
      show_title: 'yes',
      title_html_tag: 'h3',
      show_excerpt: postCard?.hasExcerpt ? 'yes' : 'yes',
      excerpt_length: 25,
      meta_data: ['author', 'date'],
      show_read_more: postCard?.hasReadMore ? 'yes' : 'yes',
      read_more_text: 'Read More »',
      pagination_type: 'numbers_and_prev_next',
    });
  }

  mapArchiveDescription(): ElementorNode {
    return this.createWidget('archive-description', {
      typography_typography: 'custom',
      font_size: { size: 18, unit: 'px' },
      title_color: this.tokens.colors.text.secondary,
    });
  }

  // ═══════════════════════════════════════════════════
  // ── WooCommerce Widgets ───────────────────────────
  // ═══════════════════════════════════════════════════

  mapProductTitle(): ElementorNode {
    return this.createWidget('woocommerce-product-title', {
      ...textDynamic('', 'product-title'),
      html_tag: 'h1',
      font_size: { size: 36, unit: 'px' },
      title_color: this.tokens.colors.text.primary,
    });
  }

  mapProductPrice(): ElementorNode {
    return this.createWidget('woocommerce-product-price', {
      typography_typography: 'custom',
      font_size: { size: 28, unit: 'px' },
      font_weight: '700',
      title_color: this.tokens.colors.ecommerce?.price || this.tokens.colors.primary['600'],
    });
  }

  mapAddToCart(detail?: ProductDetailComponent): ElementorNode {
    return this.createWidget('woocommerce-product-add-to-cart', {
      quantity: 'yes',
      variations: detail?.sections.addToCart.variations ? 'yes' : 'no',
      button_text: detail?.sections.addToCart.addToCartButton.text || 'Add to Cart',
      button_size: 'lg',
      ajax_add_to_cart: 'yes',
      button_background_color: this.tokens.colors.primary['500'],
      button_background_hover_color: this.tokens.colors.primary['600'],
      button_text_color: '#FFFFFF',
      button_border_radius: { size: 8, unit: 'px' },
    });
  }

  mapProductRating(): ElementorNode {
    return this.createWidget('woocommerce-product-rating', {
      rating_type: 'star',
      rating_color: '#f59e0b',
      rating_unmarked_color: '#d1d5db',
    });
  }

  mapProductImages(detail?: ProductDetailComponent): ElementorNode {
    return this.createWidget('woocommerce-product-images', {
      zoom: detail?.sections.productGallery.hasZoom ? 'yes' : 'no',
      lightbox: detail?.sections.productGallery.hasLightbox ? 'yes' : 'no',
      thumbnails: 'yes',
      thumbnail_position: detail?.sections.productGallery.type === 'thumbnails-left' ? 'left' : 'bottom',
      border_radius: { size: 12, unit: 'px' },
    });
  }

  mapProductMeta(): ElementorNode {
    return this.createWidget('woocommerce-product-meta', {
      sku: 'yes',
      categories: 'yes',
      tags: 'yes',
    });
  }

  mapProductContent(): ElementorNode {
    return this.createWidget('woocommerce-product-content', {
      typography_typography: 'custom',
      font_size: { size: 16, unit: 'px' },
      line_height: { size: 1.8, unit: 'em' },
    });
  }

  mapProductShortDescription(): ElementorNode {
    return this.createWidget('woocommerce-product-short-description', {
      typography_typography: 'custom',
      font_size: { size: 16, unit: 'px' },
      title_color: this.tokens.colors.text.secondary,
    });
  }

  mapProductDataTabs(detail?: ProductDetailComponent): ElementorNode {
    const tabs = [];
    if (detail?.sections.productTabs.hasDescription) tabs.push('description');
    if (detail?.sections.productTabs.hasAdditionalInfo) tabs.push('additional_information');
    if (detail?.sections.productTabs.hasReviews) tabs.push('reviews');
    return this.createWidget('woocommerce-product-data-tabs', {
      product_tabs: tabs.length > 0 ? tabs : ['description', 'additional_information', 'reviews'],
      layout: detail?.sections.productTabs.type === 'accordion' ? 'vertical' : 'horizontal',
    } as ElementorSettings);
  }

  mapRelatedProducts(detail?: ProductDetailComponent): ElementorNode {
    return this.createWidget('woocommerce-product-related', {
      posts_per_page: detail?.sections.relatedProducts?.count || 4,
      columns: detail?.sections.relatedProducts?.columns || 4,
      columns_tablet: 2,
      columns_mobile: 1,
      orderby: 'rand',
    });
  }

  mapUpsells(detail?: ProductDetailComponent): ElementorNode {
    return this.createWidget('woocommerce-upsells', {
      posts_per_page: detail?.sections.upsellProducts?.count || 4,
      columns: 4,
      columns_tablet: 2,
      columns_mobile: 1,
      orderby: 'rand',
    });
  }

  mapProductsGrid(): ElementorNode {
    return this.createWidget('woocommerce-products', {
      columns: 4,
      columns_tablet: 2,
      columns_mobile: 1,
      posts_per_page: 12,
      orderby: 'date',
      sort_order: 'desc',
      source: 'current_query',
      paginate: 'yes',
    } as ElementorSettings);
  }

  mapCart(cart?: CartComponent): ElementorNode {
    return this.createContainer({
      content_width: 'boxed',
      padding: { top: 40, right: 40, bottom: 40, left: 40, unit: 'px' },
    }, [
      this.createWidget('woocommerce-cart', {
        cart_layout: 'two-column',
        show_cross_sells: 'yes',
        cross_sells_columns: 4,
        cross_sells_count: 4,
        sticky_checkout_button: cart?.hasProceedToCheckout ? 'yes' : 'no',
      }),
    ], generateId('woo-cart'));
  }

  mapCheckout(checkout?: CheckoutComponent): ElementorNode {
    return this.createContainer({
      content_width: 'boxed',
      padding: { top: 40, right: 40, bottom: 40, left: 40, unit: 'px' },
    }, [
      this.createWidget('woocommerce-checkout', {
        checkout_layout: checkout?.layout === 'single-column' ? 'one-column' : 'two-column',
        place_order_text: 'Place Order',
        show_login_form: 'yes',
        show_coupon_form: 'yes',
        show_additional_info: 'yes',
        show_order_review: 'yes',
        sticky_order_review: 'yes',
      }),
    ], generateId('woo-checkout'));
  }

  mapMyAccount(): ElementorNode {
    return this.createContainer({
      content_width: 'boxed',
      padding: { top: 40, right: 40, bottom: 40, left: 40, unit: 'px' },
    }, [
      this.createWidget('woocommerce-my-account', {
        layout: 'horizontal',
        orders_limit: 15,
        show_downloads: 'yes',
        show_orders: 'yes',
        show_edit_account: 'yes',
      }),
    ], generateId('woo-my-account'));
  }

  mapMenuCart(): ElementorNode {
    return this.createWidget('woocommerce-menu-cart', {
      show_subtotal: 'yes',
      icon: 'fa fa-shopping-cart',
      icon_size: { size: 20, unit: 'px' },
      items_indicator: 'bubble',
      items_indicator_text: '',
      view_cart_button: 'yes',
      checkout_button: 'yes',
      auto_open_cart: 'no',
      mini_cart_template: '',
    });
  }

  mapProductCategories(): ElementorNode {
    return this.createWidget('woocommerce-categories', {
      columns: 4,
      columns_tablet: 2,
      columns_mobile: 1,
      categories_count: 8,
      source: 'all',
      hide_empty: 'yes',
      show_title: 'yes',
      show_count: 'yes',
      show_thumbnail: 'yes',
    });
  }

  mapProductArchive(): ElementorNode {
    return this.createWidget('woocommerce-archive-products', {
      columns: 4,
      columns_tablet: 2,
      columns_mobile: 1,
      posts_per_page: 12,
      orderby: 'date',
      sort_order: 'desc',
      paginate: 'yes',
      allow_order: 'yes',
      show_result_count: 'yes',
      show_catalog_ordering: 'yes',
    } as ElementorSettings);
  }

  mapWooBreadcrumbs(): ElementorNode {
    return this.createWidget('woocommerce-breadcrumbs', {
      home_text: 'Home',
      separator: '/',
      show_home: 'yes',
      home_link: 'yes',
    });
  }

  mapWooNotices(): ElementorNode {
    return this.createWidget('woocommerce-notices', {});
  }

  // ═══════════════════════════════════════════════════
  // ── Single Product Layout ─────────────────────────
  // ═══════════════════════════════════════════════════

  mapSingleProduct(detail: ProductDetailComponent): ElementorNode {
    const imageCol = this.createContainer({
      flex_direction: 'column',
      gap: { size: 16, unit: 'px' },
    }, [
      this.mapProductImages(detail),
    ], generateId('sp-images'));

    const metaCol = this.createContainer({
      flex_direction: 'column',
      gap: { size: 20, unit: 'px' },
    }, [
      this.mapProductTitle(),
      this.mapProductRating(),
      this.mapProductPrice(),
      this.mapProductShortDescription(),
      this.mapAddToCart(detail),
      this.mapProductMeta(),
    ], generateId('sp-meta'));

    const isSidebar = detail.layout === 'sidebar-left' || detail.layout === 'sidebar-right';
    const leftFirst = detail.layout === 'sidebar-left';

    const mainRow = this.createContainer({
      flex_direction: isSidebar ? 'row' : 'column',
      gap: { size: 48, unit: 'px' },
      flex_wrap: 'wrap',
    }, leftFirst ? [imageCol, metaCol] : isSidebar ? [metaCol, imageCol] : [imageCol, metaCol]);

    const children: ElementorNode[] = [
      mainRow,
      this.mapProductDataTabs(detail),
    ];

    if (detail.sections.relatedProducts) {
      children.push(this.createContainer({
        flex_direction: 'column',
        margin: { top: 40, right: 0, bottom: 0, left: 0, unit: 'px' },
      }, [this.mapRelatedProducts(detail)], generateId('sp-related')));
    }

    if (detail.sections.upsellProducts) {
      children.push(this.createContainer({
        flex_direction: 'column',
        margin: { top: 40, right: 0, bottom: 0, left: 0, unit: 'px' },
      }, [this.mapUpsells(detail)], generateId('sp-upsells')));
    }

    return this.createContainer({
      content_width: 'boxed',
      padding: { top: 40, right: 40, bottom: 80, left: 40, unit: 'px' },
      padding_tablet: { top: 30, right: 20, bottom: 60, left: 20, unit: 'px' },
      padding_mobile: { top: 20, right: 16, bottom: 40, left: 16, unit: 'px' },
    }, children, generateId('single-product'));
  }

  // ═══════════════════════════════════════════════════
  // ── Blog Single Post Layout ───────────────────────
  // ═══════════════════════════════════════════════════

  mapSinglePost(post: PostDetailComponent): ElementorNode {
    const children: ElementorNode[] = [];

    if (post.hasFeaturedImage) {
      children.push(this.mapFeaturedImage());
    }

    children.push(this.createContainer({
      flex_direction: 'row',
      gap: { size: 8, unit: 'px' },
    }, [
      this.mapPostInfo(),
    ], generateId('post-meta')));

    children.push(this.mapPostContent());

    children.push(this.createContainer({
      flex_direction: 'row',
      justify_content: 'space-between',
      gap: { size: 16, unit: 'px' },
    }, [
      this.mapPostNavigation(),
    ], generateId('post-nav')));

    if (post.hasAuthorBio) {
      children.push(this.createContainer({
        margin: { top: 32, right: 0, bottom: 0, left: 0, unit: 'px' },
      }, [
        this.mapAuthorBox(),
      ], generateId('post-author')));
    }

    if (post.hasComments) {
      children.push(this.createContainer({
        margin: { top: 40, right: 0, bottom: 0, left: 0, unit: 'px' },
      }, [
        this.mapPostComments(),
      ], generateId('post-comments')));
    }

    return this.createContainer({
      content_width: 'boxed',
      padding: { top: 40, right: 40, bottom: 80, left: 40, unit: 'px' },
    }, children, generateId('single-post'));
  }

  // ═══════════════════════════════════════════════════
  // ── General Pro Widgets ───────────────────────────
  // ═══════════════════════════════════════════════════

  mapSlides(): ElementorNode {
    return this.createWidget('slides', {
      slides: [
        { _id: generateId('slide'), heading: 'Slide 1', description: 'First slide description', button_text: 'Learn More', button_link: { url: '#' } },
        { _id: generateId('slide'), heading: 'Slide 2', description: 'Second slide description', button_text: 'Get Started', button_link: { url: '#' } },
        { _id: generateId('slide'), heading: 'Slide 3', description: 'Third slide description', button_text: 'Contact Us', button_link: { url: '#' } },
      ],
      navigation: 'both',
      slide_animation: 'fade',
      animation_speed: 700,
      autoplay: 'yes',
      autoplay_speed: 5000,
      pause_on_hover: 'yes',
      infinite: 'yes',
    });
  }

  mapAnimatedHeadline(): ElementorNode {
    return this.createWidget('animated-headline', {
      headline_style: 'rotate',
      animated_text: 'Amazing',
      rotating_text: ['Innovative', 'Powerful', 'Reliable'],
      animation_duration: '1500',
      highlight_animation: 'none',
      typography_typography: 'custom',
      font_size: { size: 48, unit: 'px' },
      font_weight: '700',
      title_color: this.tokens.colors.text.primary,
    });
  }

  mapFlipBox(): ElementorNode {
    return this.createWidget('flip-box', {
      title_front: 'Front Title',
      title_back: 'Back Title',
      description_front: 'Front description text',
      description_back: 'Back description text',
      button_text: 'Learn More',
      button_link: { url: '#' },
      button_background_color: this.tokens.colors.primary['500'],
      button_text_color: '#FFFFFF',
    });
  }

  mapCallToAction(): ElementorNode {
    return this.createWidget('call-to-action', {
      title: 'Ready to Start?',
      description: 'Join thousands of satisfied customers',
      button_text: 'Get Started',
      button_link: { url: '#' },
      graphic_element: 'none',
      ribbon_title: '',
      button_background_color: this.tokens.colors.primary['500'],
      button_background_hover_color: this.tokens.colors.primary['600'],
      button_text_color: '#FFFFFF',
      button_border_radius: { size: 8, unit: 'px' },
    });
  }

  mapMediaCarousel(): ElementorNode {
    return this.createWidget('media-carousel', {
      slides_to_show: 4,
      slides_to_scroll: 1,
      autoplay: 'yes',
      autoplay_speed: 3000,
      pause_on_hover: 'yes',
      infinite: 'yes',
      arrows: 'yes',
      dots: 'no',
      image_border_radius: { size: 8, unit: 'px' },
    });
  }

  mapTestimonialCarousel(): ElementorNode {
    return this.createWidget('testimonial-carousel', {
      slides_to_show: 3,
      slides_to_scroll: 1,
      autoplay: 'yes',
      autoplay_speed: 4000,
      pause_on_hover: 'yes',
      infinite: 'yes',
      arrows: 'yes',
      dots: 'yes',
    });
  }

  mapTableOfContents(): ElementorNode {
    return this.createWidget('table-of-contents', {
      heading_selector: 'h2, h3, h4',
      exclude_headings_by_tag: [],
      marker_view: 'bullets',
      word_wrap: 'yes',
      minimize_box: 'yes',
      hierarchical_view: 'yes',
    });
  }

  mapCountdown(): ElementorNode {
    return this.createWidget('countdown', {
      countdown_type: 'due_date',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      label_days: 'Days',
      label_hours: 'Hours',
      label_minutes: 'Minutes',
      label_seconds: 'Seconds',
      show_days: 'yes',
      show_hours: 'yes',
      show_minutes: 'yes',
      show_seconds: 'yes',
      number_color: this.tokens.colors.primary['500'],
    });
  }

  mapBlockquote(): ElementorNode {
    return this.createWidget('blockquote', {
      blockquote_content: 'The best way to predict the future is to create it.',
      author_name: 'Peter Drucker',
      author_title: 'Management Consultant',
      tweet_button: 'yes',
      typography_typography: 'custom',
      font_size: { size: 24, unit: 'px' },
      font_style: 'italic',
      title_color: this.tokens.colors.text.primary,
    });
  }

  mapReviews(): ElementorNode {
    return this.createWidget('reviews', {
      reviews: [
        { _id: generateId('review'), name: 'Jane Doe', title: 'Excellent!', rating: 5, review: 'Absolutely love this product!', stars: 5 },
        { _id: generateId('review'), name: 'John Smith', title: 'Great Value', rating: 4, review: 'Great product for the price', stars: 4 },
        { _id: generateId('review'), name: 'Alice Brown', title: 'Best Purchase', rating: 5, review: 'Exceeded my expectations', stars: 5 },
      ],
    });
  }

  mapPriceList(): ElementorNode {
    return this.createWidget('price-list', {
      price_list: [
        { _id: generateId('pl'), title: 'Item 1', price: '$19', description: 'Description for item 1' },
        { _id: generateId('pl'), title: 'Item 2', price: '$29', description: 'Description for item 2' },
        { _id: generateId('pl'), title: 'Item 3', price: '$39', description: 'Description for item 3' },
      ],
    });
  }

  mapPortfolio(): ElementorNode {
    return this.createWidget('portfolio', {
      columns: 3,
      posts_per_page: 9,
      show_title: 'yes',
      show_filter_bar: 'yes',
      filter_by: 'category',
      title_html_tag: 'h3',
      item_ratio: '0.66',
    });
  }

  mapLoopGrid(): ElementorNode {
    return this.createWidget('loop-grid', {
      posts_per_page: 6,
      columns: 3,
      columns_tablet: 2,
      columns_mobile: 1,
      pagination: 'numbers',
      enable_masonry: 'yes',
    });
  }

  mapLoopCarousel(): ElementorNode {
    return this.createWidget('loop-carousel', {
      slides_to_show: 3,
      slides_to_scroll: 1,
      autoplay: 'yes',
      autoplay_speed: 3000,
      arrows: 'yes',
      dots: 'no',
    });
  }

  mapTaxonomyFilter(): ElementorNode {
    return this.createWidget('taxonomy-filter', {
      taxonomy: 'category',
      show_counts: 'yes',
      filter_type: 'dropdown',
      multiple_selection: 'no',
    });
  }

  mapNestedCarousel(): ElementorNode {
    return this.createWidget('nested-carousel', {
      slides_to_show: 3,
      slides_to_scroll: 1,
      autoplay: 'yes',
      autoplay_speed: 3000,
      arrows: 'yes',
      dots: 'yes',
      center_mode: 'no',
    });
  }

  mapRating(): ElementorNode {
    return this.createWidget('rating', {
      rating_type: 'star',
      scale: 5,
      rating: 4.5,
      star_style: 'star',
      show_labels: 'yes',
      rating_color: '#f59e0b',
      rating_unmarked_color: '#d1d5db',
    });
  }

  mapVideoPlaylist(): ElementorNode {
    return this.createWidget('video-playlist', {
      video_tabs: [
        { _id: generateId('vpt'), type: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Video 1', duration: '3:30' },
        { _id: generateId('vpt'), type: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Video 2', duration: '4:15' },
      ],
      playlist_title: 'Playlist',
    } as ElementorSettings);
  }

  mapHotspot(): ElementorNode {
    return this.createWidget('hotspot', {
      hotspots: [
        { _id: generateId('hs'), x: 25, y: 30, title: 'Feature 1', description: 'Description of feature 1' },
        { _id: generateId('hs'), x: 60, y: 50, title: 'Feature 2', description: 'Description of feature 2' },
        { _id: generateId('hs'), x: 40, y: 70, title: 'Feature 3', description: 'Description of feature 3' },
      ],
    });
  }

  mapProgressTracker(): ElementorNode {
    return this.createWidget('progress-tracker', {
      progress_type: 'custom',
      percent: 75,
      display_percentage: 'yes',
      percentage_text: '75%',
      title: 'Progress',
      inner_text: 'Almost there',
      progress_color: this.tokens.colors.primary['500'],
      progress_background_color: this.tokens.colors.neutral['200'],
    });
  }

  mapMegaMenu(nav?: NavigationComponent): ElementorNode {
    return this.createWidget('mega-menu', {
      menu: 'primary',
      layout: 'horizontal',
      pointer: 'underline',
      animation: 'fade',
      dropdown_position: 'below',
      mega_menu_width: 'full_width',
      toggle: nav?.type === 'hamburger' ? 'icon' : '',
    });
  }

  mapOffCanvas(): ElementorNode {
    return this.createWidget('off-canvas', {
      canvas_position: 'right',
      close_button: 'yes',
      overlay: 'yes',
      close_on_overlay_click: 'yes',
      prevent_scroll: 'yes',
    });
  }

  mapLottie(): ElementorNode {
    return this.createWidget('lottie', {
      animation_source: 'url',
      lottie_json_url: '',
      trigger: 'viewport',
      loop: 'yes',
      reverse: 'no',
      speed: 1,
    });
  }

  mapCodeHighlight(): ElementorNode {
    return this.createWidget('code-highlight', {
      code: '// Your code here\nconsole.log("Hello World!");',
      language: 'javascript',
      theme: 'monokai',
      line_numbers: 'yes',
      copy_button: 'yes',
      height: { size: 400, unit: 'px' },
    });
  }

  mapFacebookPage(): ElementorNode {
    return this.createWidget('facebook-page', {
      url: 'https://www.facebook.com/yourpage',
      page_tabs: 'timeline',
      page_height: 500,
      small_header: 'no',
      adapt_container_width: 'yes',
      hide_cover: 'no',
      show_cta: 'yes',
      show_facepile: 'yes',
    } as ElementorSettings);
  }

  mapPayPalButton(): ElementorNode {
    return this.createWidget('paypal-button', {
      paypal_type: 'buy_now',
      product_name: 'Product',
      currency: 'USD',
      price: 29.99,
      quantity: 1,
      sandbox_mode: 'yes',
    });
  }

  mapLogin(): ElementorNode {
    return this.createWidget('login', {
      show_lost_password: 'yes',
      show_remember_me: 'yes',
      show_logged_in_message: 'yes',
      redirect_url: '',
      custom_labels: 'no',
    });
  }

  mapNewsletterForm(newsletter?: NewsletterComponent): ElementorNode {
    const fields = [];
    if (newsletter?.hasName) {
      fields.push({ field_type: 'text', field_label: 'Name', placeholder: 'Your Name', required: false, _id: generateId('field') });
    }
    fields.push({ field_type: 'email', field_label: 'Email', placeholder: 'Your Email', required: true, _id: generateId('field') });
    if (newsletter?.hasConsentCheckbox) {
      fields.push({ field_type: 'checkbox', field_label: 'I agree to the terms', required: true, _id: generateId('field') });
    }
    return this.createContainer({
      flex_direction: 'column',
      gap: { size: 16, unit: 'px' },
    }, [
      this.createWidget('form', {
        form_name: 'newsletter',
        button_text: 'Subscribe',
        button_background_color: this.tokens.colors.primary['500'],
        button_background_hover_color: this.tokens.colors.primary['600'],
        button_text_color: '#FFFFFF',
        button_border_radius: { size: 8, unit: 'px' },
        form_fields: fields,
        submit_actions: ['email'],
        email_to: '',
        email_subject: 'New Newsletter Subscriber',
        redirect_url: '',
        label_position: 'top',
      }),
    ], generateId('newsletter'));
  }

  mapLoginForm(_form: FormComponent): ElementorNode {
    return this.createContainer({
      content_width: 'boxed',
      padding: { top: 60, right: 40, bottom: 60, left: 40, unit: 'px' },
    }, [
      this.createWidget('login', {
        redirect_url: '',
        show_lost_password: 'yes',
        show_remember_me: 'yes',
        show_logged_in_message: 'yes',
        custom_labels: 'no',
      }),
    ], generateId('login-form'));
  }

  // ═══════════════════════════════════════════════════
  // ── Section Selection Config ──────────────────────
  // ═══════════════════════════════════════════════════

  getSectionOptions(): SectionOption[] {
    const templates = getSectionTemplates();
    return templates.map(t => ({
      key: t.key,
      label: t.label,
      templateType: t.templateType,
      category: t.category,
      description: t.description,
      enabled: t.enabled,
      icon: t.icon,
      relevantFor: t.relevantFor,
    }));
  }

  generateSelectionConfig(components: ComponentClassification): SectionSelectionConfig {
    const allSections = this.getSectionOptions();
    const selected: string[] = [];

    if (components.headers.length > 0) selected.push('header');
    if (components.navigation.length > 0) selected.push('navigation');
    if (components.heroes.length > 0) selected.push('hero');
    if (components.sections.length > 0) selected.push('sections');
    if (components.ctaSections.length > 0) selected.push('cta');
    if (components.testimonials.length > 0) selected.push('testimonials');
    if (components.galleries.length > 0) selected.push('gallery');
    if (components.productCards.length > 0) selected.push('product-cards');
    if (components.productDetails.length > 0) selected.push('single-product');
    if (components.cartComponents.length > 0) selected.push('cart');
    if (components.checkoutComponents.length > 0) selected.push('checkout');
    if (components.contactForms.length > 0) selected.push('contact-form');
    if (components.newsletters.length > 0) selected.push('newsletter');
    if (components.postCards.length > 0) selected.push('archive-posts', 'blog-posts');
    if (components.postDetail.length > 0) selected.push('single-post');
    if (components.footers.length > 0) selected.push('footer');

    return {
      sections: allSections,
      selected,
    };
  }

  mapFilteredTemplates(
    components: ComponentClassification,
    selectedKeys: string[],
    overrides?: Record<string, Partial<ElementorSettings>>,
  ): ElementorTemplate[] {
    const templates: ElementorTemplate[] = [];
    const selected = new Set(selectedKeys);

    if (selected.has('header') && components.headers.length > 0) {
      const node = this.mapHeader(components.headers[0]);
      if (overrides?.header) Object.assign(node.settings, overrides.header);
      templates.push({
        title: 'Generated Header',
        type: 'header',
        content: [node],
        condition: [{ name: 'include', sub_name: 'entire_site' }],
      });
    }

    if (selected.has('navigation') && components.navigation.length > 0) {
      const nav = components.navigation[0];
      const node = nav.type === 'mega-menu' ? this.mapMegaMenu(nav) : this.mapNavigation();
      templates.push({
        title: 'Generated Navigation',
        type: 'section',
        content: [this.createContainer({ content_width: 'full' }, [node])],
      });
    }

    if (selected.has('hero') && components.heroes.length > 0) {
      templates.push({
        title: 'Generated Hero',
        type: 'section',
        content: [this.mapHero(components.heroes[0])],
      });
    }

    if (selected.has('slides')) {
      templates.push({
        title: 'Slideshow',
        type: 'section',
        content: [this.createContainer({ content_width: 'full' }, [this.mapSlides()])],
      });
    }

    if (selected.has('animated-headline')) {
      templates.push({
        title: 'Animated Headline',
        type: 'section',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.createContainer({ flex_direction: 'column', align_items: 'center' }, [this.mapAnimatedHeadline()]),
        ])],
      });
    }

    if (selected.has('sections') && components.sections.length > 0) {
      for (const section of components.sections) {
        if (section.confidence > 0.5) {
          templates.push({
            title: `Generated ${section.name}`,
            type: 'section',
            content: [this.mapSection(section)],
          });
        }
      }
    }

    if (selected.has('cta') && components.ctaSections.length > 0) {
      templates.push({
        title: 'Generated CTA Section',
        type: 'section',
        content: [this.mapCTA()],
      });
    }

    if (selected.has('pricing')) {
      templates.push({
        title: 'Generated Pricing Table',
        type: 'section',
        content: [this.mapPricingTable()],
      });
    }

    if (selected.has('testimonials') && components.testimonials.length > 0) {
      for (const testimonial of components.testimonials) {
        templates.push({
          title: 'Generated Testimonial',
          type: 'section',
          content: [this.mapTestimonial(testimonial)],
        });
      }
    }

    if (selected.has('testimonial-carousel')) {
      templates.push({
        title: 'Testimonial Carousel',
        type: 'section',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.mapTestimonialCarousel(),
        ])],
      });
    }

    if (selected.has('gallery') && components.galleries.length > 0) {
      templates.push({
        title: 'Generated Gallery',
        type: 'section',
        content: [this.mapGallery(components.galleries[0])],
      });
    }

    if (selected.has('portfolio')) {
      templates.push({
        title: 'Portfolio',
        type: 'section',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.mapPortfolio(),
        ])],
      });
    }

    if (selected.has('product-cards') && components.productCards.length > 0) {
      templates.push({
        title: 'Shop',
        type: 'product-archive',
        content: components.productCards.map(card => this.mapProductCard(card)),
      });
    }

    if (selected.has('single-product') && components.productDetails.length > 0) {
      for (const detail of components.productDetails) {
        templates.push({
          title: 'Single Product',
          type: 'product',
          content: [this.mapSingleProduct(detail)],
        });
      }
    }

    if (selected.has('cart') && components.cartComponents.length > 0) {
      templates.push({
        title: 'Cart',
        type: 'section',
        content: [this.mapCart(components.cartComponents[0])],
      });
    }

    if (selected.has('checkout') && components.checkoutComponents.length > 0) {
      templates.push({
        title: 'Checkout',
        type: 'section',
        content: [this.mapCheckout(components.checkoutComponents[0])],
      });
    }

    if (selected.has('my-account')) {
      templates.push({
        title: 'My Account',
        type: 'section',
        content: [this.mapMyAccount()],
      });
    }

    if (selected.has('product-categories')) {
      templates.push({
        title: 'Product Categories',
        type: 'section',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.mapProductCategories(),
        ])],
      });
    }

    if (selected.has('contact-form') && components.contactForms.length > 0) {
      for (const form of components.contactForms) {
        templates.push({
          title: `Generated Contact Form - ${form.name}`,
          type: 'section',
          content: [this.mapContactForm(form)],
        });
      }
    }

    if (selected.has('newsletter') && components.newsletters.length > 0) {
      templates.push({
        title: 'Newsletter Signup',
        type: 'section',
        content: [this.mapNewsletterForm(components.newsletters[0])],
      });
    }

    if (selected.has('login-form') && components.contactForms.some(f => f.type === 'login')) {
      const loginForm = components.contactForms.find(f => f.type === 'login');
      if (loginForm) {
        templates.push({
          title: 'Login Form',
          type: 'section',
          content: [this.mapLoginForm(loginForm)],
        });
      }
    }

    if (selected.has('blog-posts')) {
      templates.push({
        title: 'Latest Blog Posts',
        type: 'section',
        content: [this.mapBlogPosts()],
      });
    }

    if (selected.has('single-post') && components.postDetail.length > 0) {
      for (const post of components.postDetail) {
        templates.push({
          title: 'Single Post',
          type: 'single-post',
          content: [this.mapSinglePost(post)],
          condition: [{ name: 'include', sub_name: 'single_post' }],
        });
      }
    }

    if (selected.has('archive-posts') && components.postCards.length > 0) {
      templates.push({
        title: 'Archive Posts',
        type: 'archive',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.mapArchivePosts(components.postCards[0]),
        ])],
        condition: [{ name: 'include', sub_name: 'archive' }],
      });
    }

    if (selected.has('countdown')) {
      templates.push({
        title: 'Countdown Timer',
        type: 'section',
        content: [this.createContainer({
          padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' },
          background_background: 'classic',
          background_color: this.tokens.colors.neutral['100'],
        }, [this.mapCountdown()])],
      });
    }

    if (selected.has('flip-box')) {
      templates.push({
        title: 'Flip Box',
        type: 'section',
        content: [this.createContainer({
          flex_direction: 'row',
          gap: { size: 24, unit: 'px' },
          padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' },
        }, [this.mapFlipBox(), this.mapFlipBox(), this.mapFlipBox()])],
      });
    }

    if (selected.has('call-to-action-widget')) {
      templates.push({
        title: 'Call to Action',
        type: 'section',
        content: [this.createContainer({
          padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' },
          background_background: 'gradient',
          background_gradient_first_color: this.tokens.colors.primary['500'],
          background_gradient_second_color: this.tokens.colors.secondary['500'],
        }, [this.mapCallToAction()])],
      });
    }

    if (selected.has('media-carousel')) {
      templates.push({
        title: 'Media Carousel',
        type: 'section',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.mapMediaCarousel(),
        ])],
      });
    }

    if (selected.has('table-of-contents')) {
      templates.push({
        title: 'Table of Contents',
        type: 'section',
        content: [this.createContainer({ padding: { top: 40, right: 40, bottom: 40, left: 40, unit: 'px' } }, [
          this.mapTableOfContents(),
        ])],
      });
    }

    if (selected.has('blockquote')) {
      templates.push({
        title: 'Blockquote',
        type: 'section',
        content: [this.createContainer({
          padding: { top: 60, right: 40, bottom: 60, left: 40, unit: 'px' },
          background_background: 'classic',
          background_color: this.tokens.colors.neutral['50'],
        }, [this.mapBlockquote()])],
      });
    }

    if (selected.has('reviews')) {
      templates.push({
        title: 'Reviews',
        type: 'section',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.mapReviews(),
        ])],
      });
    }

    if (selected.has('price-list')) {
      templates.push({
        title: 'Price List',
        type: 'section',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.mapPriceList(),
        ])],
      });
    }

    if (selected.has('loop-grid')) {
      templates.push({
        title: 'Loop Grid',
        type: 'section',
        content: [this.createContainer({ padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' } }, [
          this.mapLoopGrid(),
        ])],
      });
    }

    if (selected.has('footer') && components.footers.length > 0) {
      templates.push({
        title: 'Generated Footer',
        type: 'footer',
        content: [this.mapFooter(components.footers[0])],
        condition: [{ name: 'include', sub_name: 'entire_site' }],
      });
    }

    return templates;
  }

  // ── Hierarchical Template Generation ─────────────

  /**
   * Build an ElementorNode from a SectionTemplate's widget groups.
   * Each widget group becomes an inner container with its widgets as children.
   */
  private buildTemplateNode(template: SectionTemplate): ElementorNode {
    const children: ElementorNode[] = [];

    for (const group of template.widgetGroups) {
      const groupChildren: ElementorNode[] = [];

      for (const widget of group.widgets) {
        const widgetSettings: Record<string, unknown> = {
          ...widget.defaultSettings,
        };
        if (widget.dynamicTags) {
          (widgetSettings as { __dynamic__?: Record<string, string> }).__dynamic__ = widget.dynamicTags;
        }
        groupChildren.push(
          this.createWidget(widget.widgetType, widgetSettings as ElementorSettings),
        );
      }

      if (groupChildren.length > 0) {
        children.push(
          this.createContainer(
            {
              gap: { size: 10, unit: 'px' } as Dimension,
              flex_direction: 'column',
              padding: { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' },
            },
            groupChildren,
            generateId(`group-${group.key}`),
          ),
        );
      }
    }

    return this.createContainer(
      {
        ...template.containerSettings,
        flex_direction: 'column',
        content_width: 'boxed',
      },
      children,
      generateId(`section-${template.key}`),
    );
  }

  /**
   * Build ElementorTemplate entries from hierarchical selection config.
   * Unlike mapFilteredTemplates which uses individual mapping methods,
   * this generates from the SectionTemplate definitions with preset widget groups.
   */
  generateFromTemplates(
    selection: HierarchicalSelection,
    projectTypes?: string[],
  ): ElementorTemplate[] {
    const templates: ElementorTemplate[] = [];
    const selectedSet = new Set(selection.selectedSections);
    const available = getSectionTemplates(projectTypes);

    for (const template of available) {
      if (!selectedSet.has(template.key)) continue;

      const templateNode = this.buildTemplateNode(template);
      const overrides = selection.widgetOverrides[template.key];
      if (overrides) {
        Object.assign(templateNode.settings, overrides);
      }

      const entry: ElementorTemplate = {
        title: template.label,
        type: template.templateType,
        content: [templateNode],
      };

      if (template.templateType === 'header') {
        entry.condition = [{ name: 'include', sub_name: 'entire_site' }];
      } else if (template.templateType === 'footer') {
        entry.condition = [{ name: 'include', sub_name: 'entire_site' }];
      } else if (template.templateType === 'single-post') {
        entry.condition = [{ name: 'include', sub_name: 'single_post' }];
      } else if (template.templateType === 'archive') {
        entry.condition = [{ name: 'include', sub_name: 'archive' }];
      } else if (template.templateType === 'product-archive') {
        entry.condition = [{ name: 'include', sub_name: 'archive' }];
      }

      templates.push(entry);
    }

    return templates;
  }

  /**
   * Generate hierarchical selection config from component classification.
   * Maps detected components to relevant section templates.
   */
  generateHierarchicalSelection(components: ComponentClassification): HierarchicalSelection {
    const selectedSections: string[] = [];

    if (components.headers.length > 0) selectedSections.push('header');
    if (components.heroes.length > 0) selectedSections.push('hero');
    if (components.sections.length > 0) selectedSections.push('hero', 'about', 'services', 'features');
    if (components.testimonials.length > 0) selectedSections.push('testimonials');
    if (components.galleries.length > 0) selectedSections.push('portfolio', 'media-carousel');
    if (components.productCards.length > 0) selectedSections.push('product-grid', 'product-categories');
    if (components.productDetails.length > 0) selectedSections.push('product-single');
    if (components.cartComponents.length > 0) selectedSections.push('cart-page');
    if (components.checkoutComponents.length > 0) selectedSections.push('checkout-page', 'purchase-summary');
    if (components.contactForms.length > 0) selectedSections.push('contact', 'login-page');
    if (components.newsletters.length > 0) selectedSections.push('countdown', 'cta-banner');
    if (components.postCards.length > 0) selectedSections.push('blog-posts', 'table-of-contents');
    if (components.postDetail.length > 0) selectedSections.push('single-post', 'single-page');
    if (components.navigation.length > 0) selectedSections.push('header');
    if (components.footers.length > 0) selectedSections.push('footer');
    if (components.searchBars.length > 0) selectedSections.push('header', 'blog-posts');
    selectedSections.push('error-404');

    return {
      selectedSections: [...new Set(selectedSections)],
      selectedGroups: {},
      widgetOverrides: {},
    };
  }

  // ── Full Page Mapping ─────────────────────────────

  mapToTemplates(components: ComponentClassification, selection?: SectionSelectionConfig): ElementorTemplate[] {
    if (selection) {
      return this.mapFilteredTemplates(components, selection.selected, selection.widgetOverrides);
    }

    const autoSelected: string[] = [];
    if (components.headers.length > 0) autoSelected.push('header');
    if (components.navigation.length > 0) autoSelected.push('navigation');
    if (components.heroes.length > 0) autoSelected.push('hero');
    if (components.sections.length > 0) autoSelected.push('sections');
    if (components.ctaSections.length > 0) autoSelected.push('cta');
    autoSelected.push('pricing');
    if (components.testimonials.length > 0) autoSelected.push('testimonials');
    if (components.galleries.length > 0) autoSelected.push('gallery');
    if (components.productCards.length > 0) autoSelected.push('product-cards');
    if (components.productDetails.length > 0) autoSelected.push('single-product');
    if (components.cartComponents.length > 0) autoSelected.push('cart');
    if (components.checkoutComponents.length > 0) autoSelected.push('checkout');
    if (components.contactForms.length > 0) autoSelected.push('contact-form');
    if (components.newsletters.length > 0) autoSelected.push('newsletter');
    if (components.postCards.length > 0) autoSelected.push('archive-posts', 'blog-posts');
    if (components.postDetail.length > 0) autoSelected.push('single-post');
    autoSelected.push('blog-posts');
    if (components.footers.length > 0) autoSelected.push('footer');

    return this.mapFilteredTemplates(components, autoSelected);
  }

  // ── Global Settings ───────────────────────────────

  generateGlobalSettings(): GlobalSettings {
    const colors = this.tokens.colors;
    const typography = this.tokens.typography;

    const customColors: ColorSchemeItem[] = [
      { _id: 'primary', title: 'Primary', color: colors.primary['500'] },
      { _id: 'secondary', title: 'Secondary', color: colors.secondary['500'] },
      { _id: 'accent', title: 'Accent', color: colors.accent['500'] ?? colors.primary['500'] },
      { _id: 'text-primary', title: 'Text Primary', color: colors.text.primary },
      { _id: 'text-secondary', title: 'Text Secondary', color: colors.text.secondary },
      { _id: 'body-bg', title: 'Body Background', color: colors.background.body },
      { _id: 'surface-bg', title: 'Surface Background', color: colors.background.surface },
    ];

    const customFonts: FontFamilyItem[] = [
      { _id: 'heading', title: 'Heading', font_family: typography.fontFamilies.heading.name },
      { _id: 'body', title: 'Body', font_family: typography.fontFamilies.body.name },
    ];

    return {
      settings: {
        color: {
          primary: colors.primary['500'],
          secondary: colors.secondary['500'],
          text: colors.text.primary,
          accent: colors.accent['500'] ?? colors.primary['500'],
        },
        typography: {
          h1: {
            font_family: typography.textStyles.h1.fontFamily,
            font_size: { size: parseInt(typography.textStyles.h1.fontSize) || 48, unit: 'px' },
            font_weight: String(typography.textStyles.h1.fontWeight || '700'),
            line_height: { size: parseFloat(typography.textStyles.h1.lineHeight) || 1.2, unit: 'em' },
            letter_spacing: { size: -1, unit: 'px' },
          },
          h2: {
            font_family: typography.textStyles.h2.fontFamily,
            font_size: { size: parseInt(typography.textStyles.h2.fontSize) || 36, unit: 'px' },
            font_weight: String(typography.textStyles.h2.fontWeight || '700'),
            line_height: { size: parseFloat(typography.textStyles.h2.lineHeight) || 1.25, unit: 'em' },
          },
          h3: {
            font_family: typography.textStyles.h3.fontFamily,
            font_size: { size: parseInt(typography.textStyles.h3.fontSize) || 28, unit: 'px' },
            font_weight: String(typography.textStyles.h3.fontWeight || '600'),
            line_height: { size: parseFloat(typography.textStyles.h3.lineHeight) || 1.3, unit: 'em' },
          },
          body: {
            font_family: typography.textStyles.body.fontFamily,
            font_size: { size: parseInt(typography.textStyles.body.fontSize) || 16, unit: 'px' },
            font_weight: String(typography.textStyles.body.fontWeight || '400'),
            line_height: { size: parseFloat(typography.textStyles.body.lineHeight) || 1.6, unit: 'em' },
          },
        },
        custom_colors: customColors,
        custom_fonts: customFonts,
      },
    };
  }
}
