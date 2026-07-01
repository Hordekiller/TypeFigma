import type { DetectedComponents, ExtractedTokens, HeaderInfo, HeroInfo, SectionInfo, FooterInfo } from '@typefigma/analyzer';
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

  mapHeader(header: HeaderInfo): ElementorNode {
    const elements: ElementorNode[] = [];

    const logoWidget: ElementorNode = {
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
        dropdown: 'none',
      },
    };

    const ctaWidget: ElementorNode = {
      id: generateId('cta'),
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text: 'Get Started',
        link: { url: '#' },
        button_type: 'default',
        size: 'sm',
        hover_animation: 'grow',
        button_background_color: this.tokens.colors.primary['500'],
        button_text_color: '#FFFFFF',
        border_radius: { size: 8, unit: 'px' },
      },
    };

    const actionsContainer: ElementorNode = {
      id: generateId('actions'),
      elType: 'container',
      settings: {
        flex_direction: 'row',
        justify_content: 'flex-end',
        align_items: 'center',
        gap: { size: 16, unit: 'px' },
      },
      elements: [ctaWidget],
    };

    if (header.hasLogo || header.hasMenu) {
      if (header.hasLogo) elements.push(logoWidget);
      if (header.hasMenu) elements.push(navWidget);
      if (header.hasCTA) elements.push(actionsContainer);
    }

    const headerContainer: ElementorNode = {
      id: generateId('header'),
      elType: 'container',
      settings: {
        content_width: 'full',
        flex_direction: 'row',
        justify_content: 'space-between',
        align_items: 'center',
        padding: { top: 20, right: 40, bottom: 20, left: 40, unit: 'px' },
        background_background: header.type === 'transparent' ? 'classic' : 'classic',
        background_color: header.type === 'transparent' ? '' : '#FFFFFF',
        border_border: header.type === 'transparent' ? 'none' : 'solid',
        border_bottom: { size: 1, unit: 'px' },
        border_color: '#E5E7EB',
        position: header.type === 'sticky' ? 'fixed' : header.type === 'transparent' ? 'absolute' : 'relative',
        top: 0,
        z_index: 100,
      },
      elements,
    };

    return headerContainer;
  }

  mapHero(hero: HeroInfo): ElementorNode {
    const contentElements: ElementorNode[] = [
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
        id: generateId('hero-desc'),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<p>Your compelling subtext goes here</p>',
          align: hero.layout === 'centered' ? 'center' : 'left',
          text_color: '#D1D5DB',
          typography_typography: 'custom',
          font_size: { size: 18, unit: 'px' },
        },
      },
      {
        id: generateId('hero-buttons'),
        elType: 'container',
        settings: {
          flex_direction: 'row',
          justify_content: hero.layout === 'centered' ? 'center' : 'flex-start',
          gap: { size: 16, unit: 'px' },
        },
        elements: [
          {
            id: generateId('btn-primary'),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: 'Get Started',
              link: { url: '#' },
              button_background_color: this.tokens.colors.primary['500'],
              button_text_color: '#FFFFFF',
              border_radius: { size: 8, unit: 'px' },
              padding: { top: 16, right: 32, bottom: 16, left: 32, unit: 'px' },
            },
          },
        ],
      },
    ];

    const elements: ElementorNode[] = [
      {
        id: generateId('hero-content'),
        elType: 'container',
        settings: {
          flex_direction: 'column',
          justify_content: 'center',
          content_width: hero.layout === 'fullwidth' ? 'boxed' : 'boxed',
          max_width: hero.layout === 'centered' ? '640px' : '720px',
        },
        elements: contentElements,
      },
    ];

    if (hero.layout === 'split') {
      elements.push({
        id: generateId('hero-media'),
        elType: 'container',
        settings: {
          flex_direction: 'column',
          justify_content: 'center',
        },
        elements: [
          {
            id: generateId('hero-image'),
            elType: 'widget',
            widgetType: 'image',
            settings: {
              image: { url: '' },
            },
          },
        ],
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
        background_gradient_type: 'linear',
        background_gradient_angle: { size: 135, unit: 'deg' },
      },
      elements,
    };
  }

  mapSection(section: SectionInfo): ElementorNode {
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
          settings: {
            flex_direction: 'column',
            align_items: 'center',
          },
          elements: [
            {
              id: generateId(`${section.type}-title`),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: section.name,
                header_size: 'h2',
                align: 'center',
              },
            },
            {
              id: generateId(`${section.type}-desc`),
              elType: 'widget',
              widgetType: 'text-editor',
              settings: {
                editor: '<p>Add your content here</p>',
                align: 'center',
              },
            },
          ],
        },
      ],
    };
  }

  mapFooter(footer: FooterInfo): ElementorNode {
    const columns: ElementorNode[] = Array.from({ length: footer.columns }, (_, i) => ({
      id: generateId(`footer-col-${i + 1}`),
      elType: 'container',
      settings: {
        flex_direction: 'column',
        gap: { size: 16, unit: 'px' },
      },
      elements: [
        {
          id: generateId(`footer-heading-${i + 1}`),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: `Column ${i + 1}`,
            header_size: 'h4',
            title_color: '#FFFFFF',
          },
        },
        {
          id: generateId(`footer-menu-${i + 1}`),
          elType: 'widget',
          widgetType: 'wp-widget-pages',
          settings: {},
        },
      ],
    }));

    const elements: ElementorNode[] = [
      {
        id: generateId('footer-grid'),
        elType: 'container',
        settings: {
          flex_direction: 'row',
          gap: { size: 40, unit: 'px' },
        },
        elements: columns,
      },
    ];

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

  mapToTemplates(components: DetectedComponents): ElementorTemplate[] {
    const templates: ElementorTemplate[] = [];

    if (components.header) {
      templates.push({
        title: 'Generated Header',
        type: 'header',
        content: [this.mapHeader(components.header)],
      });
    }

    if (components.hero) {
      templates.push({
        title: 'Generated Hero Section',
        type: 'section',
        content: [this.mapHero(components.hero)],
      });
    }

    for (const section of components.sections) {
      templates.push({
        title: `Generated ${section.name}`,
        type: 'section',
        content: [this.mapSection(section)],
      });
    }

    if (components.footer) {
      templates.push({
        title: 'Generated Footer',
        type: 'footer',
        content: [this.mapFooter(components.footer)],
      });
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
          text: colors.neutral['900'],
          accent: colors.primary['500'],
          ...Object.fromEntries(
            Object.entries(colors.neutral).map(([k, v]) => [`neutral_${k}`, v])
          ),
        },
        typography: {
          h1: {
            font_family: typography.h1.fontFamily,
            font_size: { size: parseInt(typography.h1.fontSize), unit: 'px' },
            font_weight: String(typography.h1.fontWeight),
            line_height: { size: parseFloat(typography.h1.lineHeight), unit: 'em' },
          },
          body: {
            font_family: typography.body.fontFamily,
            font_size: { size: parseInt(typography.body.fontSize), unit: 'px' },
            font_weight: String(typography.body.fontWeight),
            line_height: { size: parseFloat(typography.body.lineHeight), unit: 'em' },
          },
        },
      },
    };
  }
}
