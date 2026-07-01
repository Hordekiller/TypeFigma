import type {
  ComponentClassification,
  HeaderComponent,
  HeroComponent,
  FooterComponent,
  SectionComponent,
  ProductCardComponent,
  ExtractedTokens,
} from '@typefigma/analyzer';
import type { ElementorNode, ElementorTemplate, GlobalSettings } from './types.js';

let idCounter = 0;
function generateId(prefix: string = 'el'): string {
  return `${prefix}_${++idCounter}_${Date.now().toString(36)}`;
}

export class ElementorMapper {
  private tokens: ExtractedTokens;

  constructor(tokens: ExtractedTokens) {
    this.tokens = tokens;
  }

  mapHeader(header: HeaderComponent): ElementorNode {
    const elements: ElementorNode[] = [];

    const logo: ElementorNode = {
      id: generateId('logo'),
      elType: 'widget',
      widgetType: 'image',
      settings: {
        image: { url: '{{site_logo}}' },
        width: { size: 150, unit: 'px' },
        align: 'left',
      },
    };

    const navWidget: ElementorNode = {
      id: generateId('nav'),
      elType: 'widget',
      widgetType: 'nav-menu',
      settings: {
        menu: 'primary',
        layout: 'horizontal',
        align: 'center',
        pointer: 'underline',
        animation: 'fade',
        breakpoint: 'tablet',
      },
    };

    const ctaBtn: ElementorNode = {
      id: generateId('cta'),
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text: 'Get Started',
        link: { url: '#' },
        size: 'sm',
        button_background_color: this.tokens.colors.primary['500'],
        button_text_color: '#FFFFFF',
        border_radius: { size: 8, unit: 'px' },
      },
    };

    if (header.hasLogo) elements.push(logo);
    if (header.hasMenu) elements.push(navWidget);
    if (header.hasCTA) elements.push(ctaBtn);

    return {
      id: generateId('header'),
      elType: 'container',
      settings: {
        content_width: 'full',
        flex_direction: 'row',
        justify_content: 'space-between',
        align_items: 'center',
        padding: { top: 20, right: 40, bottom: 20, left: 40, unit: 'px' },
        background_background: 'classic',
        background_color: header.type === 'transparent' ? '' : '#FFFFFF',
        position: header.type === 'sticky' ? 'fixed' : header.type === 'transparent' ? 'absolute' : 'relative',
        top: 0,
        z_index: 100,
      },
      elements,
    };
  }

  mapHero(hero: HeroComponent): ElementorNode {
    const elements: ElementorNode[] = [
      {
        id: generateId('hero-content'),
        elType: 'container',
        settings: {
          flex_direction: 'column',
          justify_content: 'center',
          content_width: 'boxed',
        },
        elements: [
          {
            id: generateId('hero-title'),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'Your Main Headline',
              header_size: 'h1',
              align: hero.layout === 'centered' ? 'center' : 'left',
              title_color: '#FFFFFF',
              typography_typography: 'custom',
              font_size: { size: 56, unit: 'px' },
              font_weight: '700',
            },
          },
          {
            id: generateId('hero-btn'),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: 'Get Started',
              button_background_color: this.tokens.colors.primary['500'],
              button_text_color: '#FFFFFF',
              border_radius: { size: 8, unit: 'px' },
            },
          },
        ],
      },
    ];

    if (hero.layout === 'split') {
      elements.push({
        id: generateId('hero-media'),
        elType: 'container',
        settings: { flex_direction: 'column', justify_content: 'center' },
        elements: [{
          id: generateId('hero-img'),
          elType: 'widget',
          widgetType: 'image',
          settings: { image: { url: '' } },
        }],
      });
    }

    return {
      id: generateId('hero'),
      elType: 'container',
      settings: {
        content_width: 'full',
        min_height: { size: 600, unit: 'px' },
        flex_direction: hero.layout === 'split' ? 'row' : 'column',
        align_items: 'center',
        justify_content: 'center',
        padding: { top: 100, right: 40, bottom: 100, left: 40, unit: 'px' },
        background_background: 'gradient',
        background_gradient_first_color: this.tokens.colors.primary['700'],
        background_gradient_second_color: this.tokens.colors.primary['900'],
      },
      elements,
    };
  }

  mapSection(section: SectionComponent): ElementorNode {
    return {
      id: generateId(`section-${section.type}`),
      elType: 'container',
      settings: {
        content_width: 'boxed',
        padding: { top: 80, right: 40, bottom: 80, left: 40, unit: 'px' },
      },
      elements: [
        {
          id: generateId(`${section.type}-inner`),
          elType: 'container',
          settings: { flex_direction: 'column', align_items: 'center' },
          elements: [
            {
              id: generateId(`${section.type}-title`),
              elType: 'widget',
              widgetType: 'heading',
              settings: { title: section.name, header_size: 'h2', align: 'center' },
            },
            {
              id: generateId(`${section.type}-desc`),
              elType: 'widget',
              widgetType: 'text-editor',
              settings: { editor: '<p>Add your content here</p>', align: 'center' },
            },
          ],
        },
      ],
    };
  }

  mapFooter(footer: FooterComponent): ElementorNode {
    const columns: ElementorNode[] = Array.from({ length: footer.columns }, (_, i) => ({
      id: generateId(`footer-col-${i + 1}`),
      elType: 'container',
      settings: { flex_direction: 'column', gap: { size: 16, unit: 'px' } },
      elements: [
        {
          id: generateId(`footer-heading-${i + 1}`),
          elType: 'widget',
          widgetType: 'heading',
          settings: { title: `Column ${i + 1}`, header_size: 'h4', title_color: '#FFFFFF' },
        },
        {
          id: generateId(`footer-menu-${i + 1}`),
          elType: 'widget',
          widgetType: 'wp-widget-pages',
          settings: {},
        },
      ],
    }));

    const elements: ElementorNode[] = [{
      id: generateId('footer-grid'),
      elType: 'container',
      settings: { flex_direction: 'row', gap: { size: 40, unit: 'px' } },
      elements: columns,
    }];

    if (footer.hasSocial) {
      elements.push({
        id: generateId('footer-social'),
        elType: 'widget',
        widgetType: 'social-icons',
        settings: {
          icon_list: [
            { icon: 'fab fa-facebook', link: { url: '#' } },
            { icon: 'fab fa-twitter', link: { url: '#' } },
            { icon: 'fab fa-instagram', link: { url: '#' } },
          ],
        },
      });
    }

    return {
      id: generateId('footer'),
      elType: 'container',
      settings: {
        content_width: 'full',
        padding: { top: 80, right: 40, bottom: 40, left: 40, unit: 'px' },
        background_background: 'classic',
        background_color: '#111827',
      },
      elements,
    };
  }

  mapProductCard(card: ProductCardComponent): ElementorNode {
    const imageElements: ElementorNode[] = [
      {
        id: generateId('pc-image'),
        elType: 'widget',
        widgetType: 'image',
        settings: {
          image: { url: '{{featured_image}}' },
          hover_animation: 'zoom',
          border_radius: { size: 8, unit: 'px', top: 8, right: 8, bottom: 0, left: 0 },
        },
      },
    ];

    if (card.structure.productBadge) {
      imageElements.push({
        id: generateId('pc-badge'),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: `<span style="background:#ef4444;color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600">${card.structure.productBadge.text}</span>`,
          position: 'absolute',
          top: 8,
          right: 8,
        },
      });
    }

    const contentElements: ElementorNode[] = [
      {
        id: generateId('pc-title'),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: '{{post_title}}',
          header_size: 'h3',
          link: { url: '{{permalink}}' },
        },
      },
      {
        id: generateId('pc-price'),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<span style="font-size:1.25rem;font-weight:700">{{price}}</span>',
        },
      },
      {
        id: generateId('pc-atc'),
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: 'Add to Cart',
          button_background_color: this.tokens.colors.primary['500'],
          button_text_color: '#FFFFFF',
          border_radius: { size: 4, unit: 'px' },
          align: 'center',
        },
      },
    ];

    return {
      id: generateId(`pc-${card.id}`),
      elType: 'container',
      settings: {
        content_width: 'boxed',
        background_background: 'classic',
        background_color: '#FFFFFF',
        border_radius: { size: 8, unit: 'px' },
        box_shadow_box_shadow_type: 'preset1',
        box_shadow_box_shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        hover_box_shadow_box_shadow_type: 'preset3',
        hover_box_shadow_box_shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        margin: { bottom: 20, unit: 'px' },
      },
      elements: [
        {
          id: generateId('pc-image-wrap'),
          elType: 'container',
          settings: { flex_direction: 'column' },
          elements: imageElements,
        },
        {
          id: generateId('pc-content'),
          elType: 'container',
          settings: { flex_direction: 'column', padding: { top: 16, right: 16, bottom: 16, left: 16, unit: 'px' } },
          elements: contentElements,
        },
      ],
    };
  }

  mapToTemplates(components: ComponentClassification): ElementorTemplate[] {
    const templates: ElementorTemplate[] = [];

    if (components.headers.length > 0) {
      templates.push({ title: 'Generated Header', type: 'header', content: [this.mapHeader(components.headers[0])] });
    }

    if (components.heroes.length > 0) {
      templates.push({ title: 'Generated Hero', type: 'section', content: [this.mapHero(components.heroes[0])] });
    }

    for (const section of components.sections) {
      if (section.confidence > 0.5) {
        templates.push({ title: `Generated ${section.name}`, type: 'section', content: [this.mapSection(section)] });
      }
    }

    if (components.productCards.length > 0) {
      templates.push({
        title: 'Generated Product Card',
        type: 'section',
        content: [this.mapProductCard(components.productCards[0])],
      });
    }

    if (components.footers.length > 0) {
      templates.push({ title: 'Generated Footer', type: 'footer', content: [this.mapFooter(components.footers[0])] });
    }

    return templates;
  }

  generateGlobalSettings(): GlobalSettings {
    const colors = this.tokens.colors;
    const typography = this.tokens.typography;

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
            font_size: { size: parseInt(typography.textStyles.h1.fontSize), unit: 'px' },
            font_weight: String(typography.textStyles.h1.fontWeight),
            line_height: { size: parseFloat(typography.textStyles.h1.lineHeight), unit: 'em' },
          },
          body: {
            font_family: typography.textStyles.body.fontFamily,
            font_size: { size: parseInt(typography.textStyles.body.fontSize), unit: 'px' },
            font_weight: String(typography.textStyles.body.fontWeight),
            line_height: { size: parseFloat(typography.textStyles.body.lineHeight), unit: 'em' },
          },
        },
      },
    };
  }
}
