// ─── Document Types ────────────────────────────────

export type ElementorDocumentType =
  | 'header' | 'footer' | 'section' | 'page'
  | 'single-post' | 'single-page' | 'archive'
  | 'product' | 'product-archive' | 'error-404'
  | 'popup';

export interface ElementorDocument {
  type: ElementorDocumentType;
  content: ElementorNode[];
  page_settings: Record<string, unknown>;
  version: string;
}

// ─── Widget Types ──────────────────────────────────

export type ElementorProWidgetType =
  // Theme Builder
  | 'post-title' | 'post-excerpt' | 'post-content'
  | 'post-featured-image' | 'author-box' | 'post-comments'
  | 'post-navigation' | 'post-info' | 'site-logo'
  | 'site-title' | 'page-title' | 'breadcrumbs'
  | 'search-form' | 'sitemap' | 'archive-title'
  | 'archive-posts' | 'archive-description'
  // WooCommerce
  | 'woocommerce-product-title' | 'woocommerce-product-images'
  | 'woocommerce-product-price' | 'woocommerce-product-add-to-cart'
  | 'woocommerce-product-rating' | 'woocommerce-product-stock'
  | 'woocommerce-product-meta' | 'woocommerce-product-content'
  | 'woocommerce-product-short-description'
  | 'woocommerce-product-data-tabs'
  | 'woocommerce-product-additional-information'
  | 'woocommerce-product-related' | 'woocommerce-upsells'
  | 'woocommerce-products' | 'woocommerce-archive-products'
  | 'woocommerce-archive-description' | 'woocommerce-archive-title'
  | 'woocommerce-categories' | 'woocommerce-menu-cart'
  | 'woocommerce-cart' | 'woocommerce-checkout'
  | 'woocommerce-my-account' | 'woocommerce-purchase-summary'
  | 'woocommerce-notices' | 'custom-add-to-cart'
  | 'woocommerce-breadcrumbs'
  // General Pro
  | 'posts' | 'portfolio' | 'slides'
  | 'animated-headline' | 'price-table' | 'price-list'
  | 'flip-box' | 'call-to-action'
  | 'media-carousel' | 'testimonial-carousel'
  | 'table-of-contents' | 'countdown' | 'blockquote'
  | 'share-buttons' | 'reviews'
  | 'facebook-page' | 'facebook-button' | 'facebook-embed'
  | 'facebook-comments' | 'paypal-button' | 'lottie'
  | 'code-highlight' | 'hotspot' | 'progress-tracker'
  | 'stripe-button' | 'mega-menu' | 'off-canvas'
  | 'loop-grid' | 'loop-carousel' | 'taxonomy-filter'
  | 'nested-carousel' | 'rating' | 'video-playlist'
  | 'gallery' | 'form' | 'login' | 'nav-menu'
  | 'image' | 'button' | 'heading' | 'text-editor'
  | 'star-rating' | 'icon-list' | 'icon'
  | 'image-gallery' | 'gallery-filter' | 'video'
  | 'counter' | 'progress' | 'testimonial'
  | 'accordion' | 'tabs' | 'wp-widget-pages'
  | 'template' | string;

export interface ElementorNode {
  id: string;
  elType: 'container' | 'section' | 'column' | 'widget';
  settings: ElementorSettings | Record<string, unknown>;
  elements?: ElementorNode[];
  widgetType?: ElementorProWidgetType;
}

export interface ElementorSettings {
  // Dynamic tags — maps control_name → Elementor dynamic tag string
  __dynamic__?: Record<string, string>;

  // Content width
  content_width?: 'full' | 'boxed';
  content_width_tablet?: 'full' | 'boxed';
  content_width_mobile?: 'full' | 'boxed';

  // Layout structure
  structure?: string;
  __flex_direction?: string;
  flex_direction?: string;
  flex_direction_tablet?: string;
  flex_direction_mobile?: string;
  flex_wrap?: string;
  flex_wrap_tablet?: string;
  flex_wrap_mobile?: string;
  justify_content?: string;
  justify_content_tablet?: string;
  justify_content_mobile?: string;
  align_items?: string;
  align_items_tablet?: string;
  align_items_mobile?: string;
  align_content?: string;
  gap?: Dimension;
  gap_tablet?: Dimension;
  gap_mobile?: Dimension;
  column_gap?: Dimension;
  column_gap_tablet?: Dimension;
  column_gap_mobile?: Dimension;
  row_gap?: Dimension;
  row_gap_tablet?: Dimension;
  row_gap_mobile?: Dimension;

  // Grid layout
  grid_template_columns?: string;
  grid_template_rows?: string;

  // Sizing
  width?: Dimension;
  width_tablet?: Dimension;
  width_mobile?: Dimension;
  min_width?: Dimension;
  max_width?: Dimension;
  height?: Dimension;
  height_tablet?: Dimension;
  height_mobile?: Dimension;
  min_height?: Dimension;
  min_height_tablet?: Dimension;
  min_height_mobile?: Dimension;
  max_height?: Dimension;

  // Spacing
  padding?: PaddingDimension;
  padding_tablet?: PaddingDimension;
  padding_mobile?: PaddingDimension;
  margin?: PaddingDimension;
  margin_tablet?: PaddingDimension;
  margin_mobile?: PaddingDimension;

  // Position
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: Dimension;
  right?: Dimension;
  bottom?: Dimension;
  left?: Dimension;
  z_index?: number;

  // Background
  background_background?: 'classic' | 'gradient' | 'video';
  background_color?: string;
  background_image?: ImageSetting;
  background_position?: string;
  background_repeat?: string;
  background_size?: string;
  background_overlay_background?: 'classic' | 'gradient';
  background_overlay_color?: string;
  background_overlay_opacity?: Dimension;

  // Gradient
  background_gradient_first_color?: string;
  background_gradient_second_color?: string;
  background_gradient_type?: string;
  background_gradient_angle?: Dimension;

  // Border
  border_border?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  border_width?: Dimension;
  border_color?: string;
  border_color_hover?: string;
  border_radius?: BorderRadius;
  border_radius_tablet?: BorderRadius;
  border_radius_mobile?: BorderRadius;

  // Box Shadow
  box_shadow_box_shadow_type?: 'preset1' | 'preset2' | 'preset3' | 'preset4' | 'outset' | 'none';
  box_shadow_box_shadow?: string;
  box_shadow_horizontal?: Dimension;
  box_shadow_vertical?: Dimension;
  box_shadow_blur?: Dimension;
  box_shadow_spread?: Dimension;
  box_shadow_color?: string;
  hover_box_shadow_box_shadow_type?: string;
  hover_box_shadow_box_shadow?: string;

  // Typography
  typography_typography?: 'custom' | 'default';
  font_family?: string;
  font_size?: Dimension;
  font_weight?: string;
  text_transform?: string;
  font_style?: string;
  line_height?: Dimension;
  letter_spacing?: Dimension;
  word_spacing?: Dimension;
  text_decoration?: string;

  // Text color
  title_color?: string;
  color?: string;

  // Widget specific: Button
  text?: string;
  link?: LinkSetting;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  button_background_color?: string;
  button_background_hover_color?: string;
  button_text_color?: string;
  button_text_hover_color?: string;
  button_border_radius?: BorderRadius;
  hover_animation?: string;
  icon?: string;
  icon_position?: 'left' | 'right' | 'top' | 'bottom';
  icon_size?: Dimension;
  icon_space?: Dimension;

  // Widget specific: Image
  image?: ImageSetting;
  image_size?: string;
  align?: string;
  align_tablet?: string;
  align_mobile?: string;
  image_border_radius?: BorderRadius;

  // Widget specific: Heading
  title?: string;
  header_size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  header_size_tablet?: string;
  header_size_mobile?: string;

  // Widget specific: Nav Menu
  menu?: string;
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  pointer?: 'underline' | 'overline' | 'double' | 'framed' | 'text';
  animation?: 'fade' | 'slide' | 'grow';
  breakpoint?: 'mobile' | 'tablet' | 'none';
  toggle_icon?: string;
  dropdown_position?: string;

  // Widget specific: Icon
  icon_name?: string;
  icon_color?: string;
  icon_size_value?: Dimension;
  icon_view?: 'default' | 'stacked' | 'framed';
  icon_primary_color?: string;
  icon_secondary_color?: string;
  icon_hover_primary_color?: string;
  icon_hover_secondary_color?: string;
  icon_padding?: Dimension;
  icon_border_radius?: BorderRadius;

  // Widget specific: Video
  video_type?: 'youtube' | 'vimeo' | 'hosted';
  youtube_url?: string;
  vimeo_url?: string;
  video_autoplay?: 'yes' | 'no';
  video_mute?: 'yes' | 'no';
  video_loop?: 'yes' | 'no';
  image_overlay?: ImageSetting;

  // Widget specific: Counter
  starting_number?: number;
  ending_number?: number;
  prefix?: string;
  suffix?: string;
  counter_title?: string;
  number_color?: string;
  number_size?: Dimension;
  counter_font_weight?: string;

  // Widget specific: Progress
  percent?: number;
  progress_title?: string;
  display_percentage?: 'yes' | 'no';
  progress_color?: string;
  progress_background_color?: string;
  progress_height?: Dimension;
  progress_title_color?: string;
  title_font_weight?: string;

  // Widget specific: Testimonial
  testimonial_content?: string;
  testimonial_name?: string;
  testimonial_job?: string;
  testimonial_image?: ImageSetting;
  testimonial_alignment?: string;

  // Widget specific: Pricing Table
  pricing_title?: string;
  pricing_subtitle?: string;
  pricing_price?: string;
  pricing_original_price?: string;
  pricing_period?: string;
  pricing_features?: string[];
  pricing_button_text?: string;
  pricing_button_link?: LinkSetting;
  pricing_style?: 'standard' | 'featured';
  pricing_badge_text?: string;
  pricing_badge_color?: string;

  // Widget specific: Star Rating
  rating_scale?: number;
  rating_size?: Dimension;
  rating_color?: string;
  rating_unmarked_color?: string;
  rating_icon?: string;

  // Widget specific: Share Buttons
  share_networks?: string[];
  share_style?: 'icon' | 'text' | 'icon-text';
  share_alignment?: string;
  share_icon_color?: string;
  share_background_color?: string;

  // Widget specific: Accordion / Tabs
  tabs?: TabItem[];
  accordion_items?: AccordionItem[];
  toggle_icon_open?: string;
  toggle_icon_close?: string;
  icon_active?: string;
  icon_inactive?: string;
  title_color_active?: string;
  title_color_inactive?: string;

  // Flexbox child properties
  flex_grow?: number;
  flex_shrink?: number;
  flex_basis?: string;
  align_self?: string;
  order?: number;

  // Animation
  entrance_animation?: string;
  animation_duration?: string;
  animation_delay?: number;
  scroll_effect?: string;

  // Overflow
  overflow?: 'hidden' | 'visible' | 'scroll' | 'auto';

  // Visibility
  hide_desktop?: 'yes' | 'no';
  hide_tablet?: 'yes' | 'no';
  hide_mobile?: 'yes' | 'no';

  // Custom CSS
  custom_css?: string;
  _element_id?: string;
  _css_classes?: string;

  // Allow any additional settings
  [key: string]: unknown;
}

export interface GlobalSettings {
  settings: {
    color: Record<string, string>;
    typography: Record<string, TypographySetting>;
    custom_colors?: ColorSchemeItem[];
    custom_fonts?: FontFamilyItem[];
  };
}

export interface ColorSchemeItem {
  _id: string;
  title: string;
  color: string;
}

export interface FontFamilyItem {
  _id: string;
  title: string;
  font_family: string;
}

export interface TypographySetting {
  font_family: string;
  font_size: { size: number; unit: string };
  font_weight: string;
  line_height: { size: number; unit: string };
  letter_spacing?: { size: number; unit: string };
  text_transform?: string;
}

export interface ElementorTemplate {
  title: string;
  type: ElementorDocumentType;
  content: ElementorNode[];
  page_settings?: Record<string, unknown>;
  condition?: TemplateCondition[];
}

export interface TemplateCondition {
  name: string;
  sub_id?: string;
  sub_name?: string;
  type?: string;
}

export interface Dimension {
  size?: number;
  unit: 'px' | '%' | 'em' | 'rem' | 'vh' | 'vw' | 'deg' | 'custom';
  sizes?: number[];
}

export interface PaddingDimension {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: 'px' | '%' | 'em';
}

export interface BorderRadius {
  size?: number;
  unit: 'px' | '%' | 'em';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ImageSetting {
  url: string;
  id?: string;
  alt?: string;
  size?: string;
  source?: 'library' | 'url';
}

export interface LinkSetting {
  url: string;
  is_external?: 'yes' | 'no';
  nofollow?: 'yes' | 'no';
  custom_attributes?: string;
}

export interface TabItem {
  tab_title: string;
  tab_content: string;
  _id: string;
}

export interface AccordionItem {
  tab_title: string;
  tab_content: string;
  _id: string;
}

// ─── Theme Builder Pro Widget Settings ─────────────

export interface ThemeBuilderPostSettings {
  html_tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: Dimension;
  link?: LinkSetting;
  word_count?: number;
  link_text?: string;
  avatar_size?: number;
  show_biography?: 'yes' | 'no';
  show_icons?: 'yes' | 'no';
  show_title?: 'yes' | 'no';
  show_arrows?: 'yes' | 'no';
  arrow_left?: string;
  arrow_right?: string;
  in_same_term?: 'yes' | 'no';
  taxonomy?: string;
  meta_list?: string[];
  separator?: string;
  home_text?: string;
  show_home?: 'yes' | 'no';
  home_link?: 'yes' | 'no';
  hide_on_404?: 'yes' | 'no';
  live_search?: 'yes' | 'no';
  min_characters?: number;
  results_per_page?: number;
  search_icon?: 'yes' | 'no';
  thumbnail_size?: string;
  caption_source?: string;
}

export interface ArchivePostsSettings {
  skin?: 'classic' | 'cards';
  columns?: number;
  columns_tablet?: number;
  columns_mobile?: number;
  posts_per_page?: number;
  image_position?: 'top' | 'left' | 'right';
  masonry?: 'yes' | '';
  image_size?: string;
  image_ratio?: Dimension;
  show_title?: 'yes' | '';
  title_html_tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  show_excerpt?: 'yes' | '';
  excerpt_length?: number;
  meta_data?: string[];
  show_read_more?: 'yes' | '';
  read_more_text?: string;
  pagination_type?: 'none' | 'numbers' | 'prev_next' | 'numbers_and_prev_next';
}

// ─── WooCommerce Pro Widget Settings ───────────────

export interface WooCommerceProductSettings {
  html_tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: Dimension;
  link?: LinkSetting;
  zoom?: 'yes' | 'no';
  lightbox?: 'yes' | 'no';
  thumbnails?: 'yes' | 'no';
  thumbnail_position?: 'left' | 'bottom' | 'right';
  thumbnail_size?: Dimension;
  quantity?: 'yes' | 'no';
  variations?: 'yes' | 'no';
  button_text?: string;
  button_size?: 'sm' | 'md' | 'lg';
  redirect?: string;
  ajax_add_to_cart?: 'yes' | 'no';
  stock_display_type?: 'text' | 'number';
  sku?: 'yes' | 'no';
  categories?: 'yes' | 'no';
  tags?: 'yes' | 'no';
  tabs?: string[];
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  show_subtotal?: 'yes' | 'no';
  icon?: string;
  icon_size?: Dimension;
  items_indicator?: 'count' | 'bubble' | 'plain' | 'none';
  items_indicator_text?: string;
  view_cart_button?: 'yes' | 'no';
  checkout_button?: 'yes' | 'no';
  auto_open_cart?: 'yes' | 'no';
  mini_cart_template?: string;
}

export interface WooCommerceProductGridSettings {
  columns?: number;
  columns_tablet?: number;
  columns_mobile?: number;
  posts_per_page?: number;
  orderby?: 'date' | 'title' | 'price' | 'popularity' | 'rating' | 'rand';
  order?: 'asc' | 'desc';
  source?: 'current_query' | 'manual' | 'categories' | 'tags' | 'featured' | 'sale' | 'best_selling' | 'top_rated';
  include_ids?: string;
  exclude_ids?: string;
  paginate?: 'yes' | 'no';
  allow_order?: 'yes' | 'no';
  show_result_count?: 'yes' | 'no';
  show_catalog_ordering?: 'yes' | 'no';
}

export interface WooCommerceCartCheckoutSettings {
  cart_layout?: 'two-column' | 'one-column';
  sticky_checkout_button?: 'yes' | 'no';
  checkout_layout?: 'two-column' | 'one-column';
  place_order_text?: string;
  show_login_form?: 'yes' | 'no';
  show_coupon_form?: 'yes' | 'no';
  show_additional_info?: 'yes' | 'no';
  show_order_review?: 'yes' | 'no';
  sticky_order_review?: 'yes' | 'no';
  show_cross_sells?: 'yes' | 'no';
  cross_sells_columns?: number;
  cross_sells_count?: number;
}

export interface WooCommerceMyAccountSettings {
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  orders_limit?: number;
  show_downloads?: 'yes' | 'no';
  show_orders?: 'yes' | 'no';
  show_edit_account?: 'yes' | 'no';
  show_subscriptions?: 'yes' | 'no';
}

export interface WooCommerceProductCategorySettings {
  columns?: number;
  categories_count?: number;
  source?: 'all' | 'manual_selection' | 'by_parent' | 'current_subcategories';
  hide_empty?: 'yes' | 'no';
  show_title?: 'yes' | 'no';
  show_count?: 'yes' | 'no';
  show_thumbnail?: 'yes' | 'no';
}

// ─── General Pro Widget Settings ───────────────────

export interface SlidesWidgetSettings {
  slides?: SlideItem[];
  navigation?: 'arrows' | 'dots' | 'both' | 'none';
  slide_animation?: 'fade' | 'slide';
  animation_speed?: number;
  slides_to_show?: number;
  slides_to_scroll?: number;
  autoplay?: 'yes' | 'no';
  autoplay_speed?: number;
  pause_on_hover?: 'yes' | 'no';
  infinite?: 'yes' | 'no';
}

export interface SlideItem {
  _id: string;
  heading?: string;
  description?: string;
  button_text?: string;
  button_link?: LinkSetting;
  background_image?: ImageSetting;
}

export interface AnimatedHeadlineSettings {
  headline_style?: 'highlight' | 'rotate' | 'loading_scale' | 'clip' | 'drop_in' | 'zoom' | 'blinds';
  animated_text?: string;
  rotating_text?: string[];
  animation_duration?: number;
  highlight_animation?: string;
}

export interface FlipBoxSettings {
  title_front?: string;
  title_back?: string;
  description_front?: string;
  description_back?: string;
  button_text?: string;
  button_link?: LinkSetting;
  background_image_front?: ImageSetting;
  background_image_back?: ImageSetting;
}

export interface CallToActionSettings {
  title?: string;
  description?: string;
  button_text?: string;
  button_link?: LinkSetting;
  graphic_element?: 'none' | 'image' | 'icon';
  image?: ImageSetting;
  icon?: string;
  ribbon_title?: string;
  cta_layout?: string;
}

export interface CountdownSettings {
  countdown_type?: 'due_date' | 'evergreen';
  due_date?: string;
  evergreen_hours?: number;
  evergreen_minutes?: number;
  label_days?: string;
  label_hours?: string;
  label_minutes?: string;
  label_seconds?: string;
  show_days?: 'yes' | 'no';
  show_hours?: 'yes' | 'no';
  show_minutes?: 'yes' | 'no';
  show_seconds?: 'yes' | 'no';
}

export interface LoopGridSettings {
  template_id?: number;
  posts_per_page?: number;
  columns?: number;
  columns_tablet?: number;
  columns_mobile?: number;
  pagination?: 'none' | 'numbers' | 'prev_next' | 'numbers_and_prev_next';
  enable_masonry?: 'yes' | 'no';
  alternate_template?: number;
}

export interface TaxonomyFilterSettings {
  taxonomy?: string;
  show_counts?: 'yes' | 'no';
  filter_type?: 'dropdown' | 'checkbox' | 'radio';
  multiple_selection?: 'yes' | 'no';
  filter_layout?: string;
}

export interface RatingWidgetSettings {
  rating_type?: 'scale' | 'star';
  scale?: number;
  rating?: number;
  star_style?: string;
  show_labels?: 'yes' | 'no';
  labels?: string[];
}

export interface VideoPlaylistSettings {
  tabs?: VideoPlaylistTab[];
  playlist_title?: string;
}

export interface VideoPlaylistTab {
  _id: string;
  type?: 'youtube' | 'vimeo' | 'hosted';
  url?: string;
  title?: string;
  duration?: string;
}

export interface HotspotSettings {
  hotspots?: HotspotItem[];
  background_image?: ImageSetting;
}

export interface HotspotItem {
  _id: string;
  x: number;
  y: number;
  title?: string;
  description?: string;
  link?: LinkSetting;
  icon?: string;
}

export interface MegaMenuSettings {
  menu?: string;
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  pointer?: string;
  animation?: string;
  dropdown_position?: string;
  toggle?: string;
  mega_menu_width?: string;
  mega_menu_content?: any[];
}

export interface OffCanvasSettings {
  canvas_position?: 'left' | 'right' | 'top' | 'bottom';
  close_button?: 'yes' | 'no';
  overlay?: 'yes' | 'no';
  close_on_overlay_click?: 'yes' | 'no';
  prevent_scroll?: 'yes' | 'no';
}

export interface PriceListSettings {
  price_list?: PriceListItem[];
}

export interface PriceListItem {
  _id: string;
  title?: string;
  price?: string;
  description?: string;
  image?: ImageSetting;
  link?: LinkSetting;
}

export interface ReviewsSettings {
  reviews?: ReviewItem[];
}

export interface ReviewItem {
  _id: string;
  name?: string;
  title?: string;
  rating?: number;
  image?: ImageSetting;
  review?: string;
  stars?: number;
}

export interface CodeHighlightSettings {
  code?: string;
  language?: string;
  theme?: string;
  line_numbers?: 'yes' | 'no';
  copy_button?: 'yes' | 'no';
  height?: Dimension;
}

export interface LottieSettings {
  animation_source?: 'file' | 'url';
  lottie_json_url?: string;
  lottie_json_file?: any;
  link?: LinkSetting;
  trigger?: 'none' | 'viewport' | 'hover' | 'click' | 'scroll';
  on_hover_out?: string;
  loop?: 'yes' | 'no';
  reverse?: 'yes' | 'no';
  speed?: number;
  renderer?: string;
}

export interface PayPalSettings {
  paypal_type?: 'buy_now' | 'cart' | 'donation' | 'subscription';
  product_name?: string;
  currency?: string;
  price?: number;
  shipping?: number;
  tax?: number;
  quantity?: number;
  sandbox_mode?: 'yes' | 'no';
}

export interface StripeSettings {
  product_name?: string;
  currency?: string;
  price?: number;
  quantity?: number;
  sandbox_mode?: 'yes' | 'no';
  publishable_key?: string;
  secret_key?: string;
}

export interface LoginSettings {
  redirect_url?: string;
  logout_redirect?: string;
  show_lost_password?: 'yes' | 'no';
  show_remember_me?: 'yes' | 'no';
  show_logged_in_message?: 'yes' | 'no';
  custom_labels?: 'yes' | 'no';
}

export interface PortfolioSettings {
  columns?: number;
  posts_per_page?: number;
  item_ratio?: string;
  title_html_tag?: string;
  show_title?: 'yes' | 'no';
  show_filter_bar?: 'yes' | 'no';
  filter_by?: string;
}

export interface TableOfContentsSettings {
  heading_selector?: string;
  exclude_headings_by_tag?: string[];
  marker_view?: 'bullets' | 'numbers';
  word_wrap?: 'yes' | 'no';
  minimize_box?: 'yes' | 'no';
  hierarchical_view?: 'yes' | 'no';
}

export interface FacebookSettings {
  url?: string;
  tabs?: string;
  height?: number;
  small_header?: 'yes' | 'no';
  adapt_container_width?: 'yes' | 'no';
  hide_cover?: 'yes' | 'no';
  show_cta?: 'yes' | 'no';
  show_facepile?: 'yes' | 'no';
  facebook_layout?: string;
  facebook_size?: string;
  facebook_type?: string;
  colorscheme?: string;
  share_button?: 'yes' | 'no';
  order?: string;
  number_of_comments?: number;
  allow_fullscreen?: 'yes' | 'no';
}

export interface ProgressTrackerSettings {
  progress_type?: 'custom' | 'circular';
  percent?: number;
  display_percentage?: 'yes' | 'no';
  percentage_text?: string;
  inner_text?: string;
}

// ─── Section Selection UI ──────────────────────────

export type WidgetCategory =
  | 'theme-builder' | 'woocommerce' | 'general-pro'
  | 'basic' | 'form' | 'media' | 'social';

export interface SectionOption {
  /** Unique key for this section type */
  key: string;
  /** Display label */
  label: string;
  /** Elementor document type */
  templateType: ElementorDocumentType;
  /** Widget category */
  category: WidgetCategory;
  /** Description shown in the UI */
  description: string;
  /** Default enabled state */
  enabled: boolean;
  /** Icon name (lucide-react icon name) */
  icon: string;
  /** Project types that this section makes sense for */
  relevantFor: string[];
}

export interface SectionSelectionConfig {
  /** Available sections to choose from */
  sections: SectionOption[];
  /** Selected section keys */
  selected: string[];
  /** Custom widget settings per section key */
  widgetOverrides?: Record<string, Partial<ElementorSettings>>;
}

// ═══════════════════════════════════════════════════════
// ─── Hierarchical Section Template System ─────────────
// ═══════════════════════════════════════════════════════

/** A single widget definition within a group */
export interface WidgetDef {
  widgetType: string;
  label: string;
  description?: string;
  defaultSettings: Record<string, unknown>;
  dynamicTags?: Record<string, string>;
  icon: string;
  required?: boolean;
  multi?: boolean;
}

/** A group of related widgets within a section (e.g., "Logo Area", "Navigation") */
export interface WidgetGroup {
  key: string;
  label: string;
  description: string;
  widgets: WidgetDef[];
  multi?: boolean;
  min?: number;
  max?: number;
}

/** A complete section template with predefined widget groups */
export interface SectionTemplate {
  key: string;
  label: string;
  description: string;
  templateType: ElementorDocumentType;
  category: WidgetCategory;
  relevantFor: string[];
  icon: string;
  enabled: boolean;
  containerSettings: Record<string, unknown>;
  widgetGroups: WidgetGroup[];
}

/** Hierarchical selection: sections → widget groups → widgets */
export interface HierarchicalSelection {
  /** Which section templates are selected */
  selectedSections: string[];
  /** Per-section: which widget group keys are active */
  selectedGroups: Record<string, string[]>;
  /** Per-section: custom widget settings overrides (keyed by widgetType) */
  widgetOverrides: Record<string, Record<string, unknown>>;
}
