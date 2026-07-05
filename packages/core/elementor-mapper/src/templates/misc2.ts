import type { SectionTemplate } from '../types.js';

// ─── TABLE OF CONTENTS ──────────────────────────
export const TABLE_OF_CONTENTS_TEMPLATE: SectionTemplate = {
  key: 'table-of-contents',
  label: 'Table of Contents',
  description: 'Auto-generated table of contents for content pages',
  templateType: 'section',
  category: 'basic',
  relevantFor: ['blog', 'business', 'news'],
  icon: 'list-ordered',
  enabled: true,
  containerSettings: {
    content_width: { size: 800, unit: 'px' },
    gap: 'no',
    padding: { top: 40, right: 20, bottom: 40, left: 20, unit: 'px' },
  },
  widgetGroups: [
    {
      key: 'toc',
      label: 'Table of Contents',
      description: 'Heading-based navigation',
      max: 1,
      widgets: [
        {
          widgetType: 'table-of-contents',
          label: 'Table of Contents',
          description: 'Auto-generated heading index',
          icon: 'list-ordered',
          required: true,
          defaultSettings: {
            heading_selector: 'h2, h3, h4',
            exclude_headings_by_tag: [],
            marker_view: 'bullets',
            word_wrap: 'yes',
            minimize_box: 'yes',
            hierarchical_view: 'yes',
            title: 'Table of Contents',
            icon: 'fas fa-list-ul',
            box_background_color: '#F8F9FA',
            box_border_color: '#E0E0E0',
          },
        },
      ],
    },
  ],
};

// ─── SOCIAL MEDIA ───────────────────────────────
export const SOCIAL_MEDIA_TEMPLATE: SectionTemplate = {
  key: 'social-media',
  label: 'Social Media Section',
  description: 'Facebook page, buttons, comments embed',
  templateType: 'section',
  category: 'social',
  relevantFor: ['ecommerce', 'blog', 'business', 'portfolio', 'landing', 'news'],
  icon: 'share-2',
  enabled: true,
  containerSettings: {
    content_width: { size: 800, unit: 'px' },
    gap: 'yes',
    padding: { top: 60, right: 20, bottom: 60, left: 20, unit: 'px' },
    columns: 2,
  },
  widgetGroups: [
    {
      key: 'social-content',
      label: 'Social Widgets',
      description: 'Facebook and social embeds',
      widgets: [
        {
          widgetType: 'facebook-page',
          label: 'Facebook Page',
          description: 'Embedded Facebook page plugin',
          icon: 'facebook',
          required: true,
          defaultSettings: {
            url: 'https://www.facebook.com/YourPage',
            tabs: 'timeline, events, messages',
            height: 500,
            small_header: 'no',
            adapt_container_width: 'yes',
            hide_cover: 'no',
            show_cta: 'yes',
            show_facepile: 'yes',
          },
        },
        {
          widgetType: 'facebook-button',
          label: 'Facebook Like Button',
          description: 'Facebook like/share button',
          icon: 'thumbs-up',
          required: false,
          defaultSettings: {
            url: 'https://www.facebook.com/YourPage',
            facebook_layout: 'button_count',
            facebook_size: 'large',
            facebook_type: 'like',
            colorscheme: 'light',
            share_button: 'yes',
          },
        },
        {
          widgetType: 'facebook-embed',
          label: 'Facebook Embed',
          description: 'Embedded Facebook post/video',
          icon: 'facebook',
          required: false,
          defaultSettings: {
            url: '',
            allow_fullscreen: 'yes',
            facebook_type: 'post',
          },
        },
        {
          widgetType: 'facebook-comments',
          label: 'Facebook Comments',
          description: 'Facebook comments plugin',
          icon: 'message-square',
          required: false,
          defaultSettings: {
            url: '',
            order: 'social',
            number_of_comments: 10,
            colorscheme: 'light',
          },
        },
        {
          widgetType: 'share-buttons',
          label: 'Share Buttons',
          description: 'Social share buttons',
          icon: 'share-2',
          required: false,
          defaultSettings: {
            share_buttons: [
              { _id: 'sb1', button: 'facebook', text: 'Share', icon: { value: 'fab fa-facebook-f', library: 'fa-brands' } },
              { _id: 'sb2', button: 'twitter', text: 'Tweet', icon: { value: 'fab fa-twitter', library: 'fa-brands' } },
              { _id: 'sb3', button: 'linkedin', text: 'Share', icon: { value: 'fab fa-linkedin-in', library: 'fa-brands' } },
              { _id: 'sb4', button: 'email', text: 'Email', icon: { value: 'fas fa-envelope', library: 'fa-solid' } },
            ],
            skin: 'flat',
            icons_position: 'before_text',
            alignment: 'center',
            share_url_type: 'current',
            share_title: '',
            share_description: '',
          },
        },
      ],
    },
  ],
};

// ─── TABS SECTION ───────────────────────────────
export const TABS_SECTION_TEMPLATE: SectionTemplate = {
  key: 'tabs-section',
  label: 'Tabs Section',
  description: 'Tabbed content panel',
  templateType: 'section',
  category: 'basic',
  relevantFor: ['ecommerce', 'blog', 'business', 'portfolio', 'landing'],
  icon: 'columns',
  enabled: true,
  containerSettings: {
    content_width: { size: 900, unit: 'px' },
    gap: 'no',
    padding: { top: 60, right: 20, bottom: 60, left: 20, unit: 'px' },
  },
  widgetGroups: [
    {
      key: 'tabs',
      label: 'Tabs',
      description: 'Tabbed content',
      max: 1,
      widgets: [
        {
          widgetType: 'tabs',
          label: 'Tabs Widget',
          description: 'Horizontal/vertical tabbed content',
          icon: 'columns',
          required: true,
          defaultSettings: {
            tabs: [
              { _id: 'tb1', tab_title: 'Tab 1', tab_content: '<p>Content for tab 1.</p>' },
              { _id: 'tb2', tab_title: 'Tab 2', tab_content: '<p>Content for tab 2.</p>' },
              { _id: 'tb3', tab_title: 'Tab 3', tab_content: '<p>Content for tab 3.</p>' },
            ],
            type: 'horizontal',
            title_html_tag: 'div',
            icon: '',
            icon_active: '',
            icon_position: 'left',
            align: 'center',
            tab_title_color: '#333333',
            tab_title_active_color: '#4A90D9',
            tab_content_color: '#666666',
            tab_border_color: '#E0E0E0',
            tab_border_active_color: '#4A90D9',
          },
        },
      ],
    },
  ],
};

// ─── GOOGLE MAPS ────────────────────────────────
export const MAPS_TEMPLATE: SectionTemplate = {
  key: 'maps',
  label: 'Maps Section',
  description: 'Google Maps embed',
  templateType: 'section',
  category: 'basic',
  relevantFor: ['ecommerce', 'business', 'landing'],
  icon: 'map',
  enabled: true,
  containerSettings: {
    content_width: { size: 1140, unit: 'px' },
    gap: 'no',
    padding: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
  },
  widgetGroups: [
    {
      key: 'map',
      label: 'Map',
      description: 'Google Maps widget',
      max: 1,
      widgets: [
        {
          widgetType: 'google-maps',
          label: 'Google Maps',
          description: 'Embedded Google Map',
          icon: 'map-pinned',
          required: true,
          defaultSettings: {
            address: 'Times Square, New York, NY',
            zoom: 14,
            height: { size: 450, unit: 'px' },
            prevent_scroll: 'no',
            enable_lazyload: 'yes',
          },
        },
      ],
    },
  ],
};

// ─── 404 PAGE ────────────────────────────────────
export const ERROR_404_TEMPLATE: SectionTemplate = {
  key: 'error-404',
  label: '404 Error Page',
  description: 'Custom 404 not found page',
  templateType: 'error-404',
  category: 'theme-builder',
  relevantFor: ['ecommerce', 'blog', 'business', 'portfolio', 'landing', 'news'],
  icon: 'file-x',
  enabled: true,
  containerSettings: {
    content_width: { size: 600, unit: 'px' },
    gap: 'no',
    padding: { top: 100, right: 20, bottom: 100, left: 20, unit: 'px' },
    align_items: 'center',
    justify_content: 'center',
    flex_direction: 'column',
    min_height: { size: 500, unit: 'px' },
  },
  widgetGroups: [
    {
      key: 'error-content',
      label: 'Error Content',
      description: '404 message, search, home link',
      min: 2,
      widgets: [
        {
          widgetType: 'heading',
          label: '404 Title',
          icon: 'type',
          required: true,
          defaultSettings: {
            title: 'Page Not Found',
            html_tag: 'h1',
            size: { size: 72, unit: 'px' },
            align: 'center',
            color: '#1a1a2e',
            weight: '700',
          },
        },
        {
          widgetType: 'text-editor',
          label: '404 Message',
          icon: 'align-left',
          required: true,
          defaultSettings: {
            editor: '<p>Sorry, the page you are looking for does not exist. It might have been moved or deleted.</p>',
            align: 'center',
            color: '#666666',
            size: { size: 18, unit: 'px' },
          },
        },
        {
          widgetType: 'search-form',
          label: 'Search Form',
          description: 'Search for content',
          icon: 'search',
          required: false,
          defaultSettings: {
            skin: 'classic',
            live_search: 'no',
            placeholder: 'Search...',
            search_icon: 'yes',
            button_text: 'Search',
            button_size: 'md',
            button_type: 'default',
          },
        },
        {
          widgetType: 'button',
          label: 'Back to Home',
          icon: 'home',
          required: true,
          defaultSettings: {
            text: 'Back to Homepage',
            link: { url: '{{home_url}}', is_external: 'no', nofollow: 'no' },
            button_size: 'lg',
            button_type: 'default',
            hover_animation: 'grow',
          },
        },
      ],
    },
  ],
};

// ─── SITEMAP ────────────────────────────────────
export const SITEMAP_TEMPLATE: SectionTemplate = {
  key: 'sitemap',
  label: 'Sitemap Page',
  description: 'HTML sitemap with pages, posts, categories',
  templateType: 'page',
  category: 'theme-builder',
  relevantFor: ['ecommerce', 'blog', 'business', 'portfolio', 'news'],
  icon: 'sitemap',
  enabled: true,
  containerSettings: {
    content_width: { size: 800, unit: 'px' },
    gap: 'no',
    padding: { top: 60, right: 20, bottom: 60, left: 20, unit: 'px' },
    columns: 2,
  },
  widgetGroups: [
    {
      key: 'sitemap-content',
      label: 'Sitemap',
      description: 'HTML sitemap widget',
      max: 1,
      widgets: [
        {
          widgetType: 'sitemap',
          label: 'Sitemap Widget',
          description: 'HTML sitemap with all content types',
          icon: 'sitemap',
          required: true,
          defaultSettings: {
            sitemap_types: ['page', 'post', 'category', 'archive'],
            sitemap_pages_count: 20,
            sitemap_posts_count: 20,
            show_title: 'yes',
            title_tag: 'h2',
            title_color: '#1a1a2e',
            link_color: '#4A90D9',
            link_hover_color: '#1a1a2e',
          },
        },
      ],
    },
  ],
};
