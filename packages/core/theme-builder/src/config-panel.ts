import type { ExtractedTokens, ComponentClassification } from '@typefigma/analyzer';
import type { FontFamilyEntry } from './font-manager.js';

export interface AdminPanelConfig {
  themeSlug: string;
  themeName: string;
  tokens: ExtractedTokens;
  components: ComponentClassification;
  fonts?: FontFamilyEntry[];
  customizer?: boolean;
}

export class AdminPanelGenerator {
  private config: AdminPanelConfig;

  constructor(config: AdminPanelConfig) {
    this.config = config;
  }

  generateAdminPagePhp(): string {
    const { themeSlug, themeName } = this.config;
    const slug = themeSlug;

    return `<?php
/**
 * Theme Settings Page
 *
 * @package ${slug}
 */

// Prevent direct access
if (!defined('ABSPATH')) exit;

/**
 * Add theme settings menu
 */
function ${slug}_add_admin_menu() {
    add_theme_page(
        esc_html__('${this.escapePhp(themeName)} Settings', '${slug}'),
        esc_html__('Theme Settings', '${slug}'),
        'edit_theme_options',
        '${slug}-settings',
        '${slug}_render_admin_page'
    );
}
add_action('admin_menu', '${slug}_add_admin_menu');

/**
 * Register settings
 */
function ${slug}_register_settings() {
    // General
    register_setting('${slug}_settings', '${slug}_container_width', array(
        'type' => 'string',
        'default' => '1200px',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    register_setting('${slug}_settings', '${slug}_layout_style', array(
        'type' => 'string',
        'default' => 'full-width',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    // Color overrides
    ${['primary', 'secondary', 'accent', 'neutral', 'success', 'warning', 'error', 'info', 'bg_body', 'text_primary'].map(key => {
      const defaultVal = this.getColorDefault(key);
      return `register_setting('${slug}_settings', '${slug}_color_${key}', array(
        'type' => 'string',
        'default' => '${defaultVal}',
        'sanitize_callback' => 'sanitize_hex_color',
    ));`;
    }).join('\n    ')}
    register_setting('${slug}_settings', '${slug}_body_font', array(
        'type' => 'string',
        'default' => '${this.getFontFamily('body')}',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    register_setting('${slug}_settings', '${slug}_heading_font', array(
        'type' => 'string',
        'default' => '${this.getFontFamily('heading')}',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    register_setting('${slug}_settings', '${slug}_custom_css', array(
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'wp_strip_all_tags',
    ));
    register_setting('${slug}_settings', '${slug}_lazy_load', array(
        'type' => 'boolean',
        'default' => true,
        'sanitize_callback' => 'rest_sanitize_boolean',
    ));
${this.hasComponent('productCards') ? `
    // WooCommerce
    register_setting('${slug}_settings', '${slug}_products_per_page', array(
        'type' => 'integer',
        'default' => 12,
        'sanitize_callback' => 'absint',
    ));
    register_setting('${slug}_settings', '${slug}_product_columns', array(
        'type' => 'integer',
        'default' => 4,
        'sanitize_callback' => 'absint',
    ));
    register_setting('${slug}_settings', '${slug}_catalog_mode', array(
        'type' => 'boolean',
        'default' => false,
        'sanitize_callback' => 'rest_sanitize_boolean',
    ));` : ''}
${this.hasComponent('headers') ? `
    // Header
    register_setting('${slug}_settings', '${slug}_header_sticky', array(
        'type' => 'boolean',
        'default' => ${this.getHeaderType() === 'sticky' ? 'true' : 'false'},
        'sanitize_callback' => 'rest_sanitize_boolean',
    ));
    register_setting('${slug}_settings', '${slug}_header_transparent', array(
        'type' => 'boolean',
        'default' => ${this.getHeaderType() === 'transparent' ? 'true' : 'false'},
        'sanitize_callback' => 'rest_sanitize_boolean',
    ));` : ''}
${this.hasComponent('footers') ? `
    // Footer
    register_setting('${slug}_settings', '${slug}_footer_columns', array(
        'type' => 'integer',
        'default' => ${this.getFooterColumns()},
        'sanitize_callback' => 'absint',
    ));` : ''}
    register_setting('${slug}_settings', '${slug}_social_facebook', array(
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
    ));
    register_setting('${slug}_settings', '${slug}_social_twitter', array(
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
    ));
    register_setting('${slug}_settings', '${slug}_social_instagram', array(
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
    ));
    register_setting('${slug}_settings', '${slug}_social_linkedin', array(
        'type' => 'string',
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
    ));
}
add_action('admin_init', '${slug}_register_settings');

/**
 * Render the admin settings page
 */
function ${slug}_render_admin_page() {
    $active_tab = isset($_GET['tab']) ? sanitize_key($_GET['tab']) : 'general';
    ?>
    <div class="wrap ${slug}-theme-settings">
        <h1><?php esc_html_e('${this.escapePhp(themeName)} Settings', '${slug}'); ?></h1>
        <h2 class="nav-tab-wrapper">
            <a href="?page=${slug}-settings&tab=general" class="nav-tab <?php echo $active_tab === 'general' ? 'nav-tab-active' : ''; ?>">
                <span class="dashicons dashicons-admin-settings"></span> <?php esc_html_e('General', '${slug}'); ?>
            </a>
${this.hasComponent('productCards') ? `            <a href="?page=${slug}-settings&tab=shop" class="nav-tab <?php echo $active_tab === 'shop' ? 'nav-tab-active' : ''; ?>">
                <span class="dashicons dashicons-cart"></span> <?php esc_html_e('Shop', '${slug}'); ?>
            </a>` : ''}
            <a href="?page=${slug}-settings&tab=typography" class="nav-tab <?php echo $active_tab === 'typography' ? 'nav-tab-active' : ''; ?>">
                <span class="dashicons dashicons-editor-textcolor"></span> <?php esc_html_e('Typography', '${slug}'); ?>
            </a>
            <a href="?page=${slug}-settings&tab=colors" class="nav-tab <?php echo $active_tab === 'colors' ? 'nav-tab-active' : ''; ?>">
                <span class="dashicons dashicons-art"></span> <?php esc_html_e('Colors', '${slug}'); ?>
            </a>
${this.hasComponent('headers') || this.hasComponent('footers') ? `            <a href="?page=${slug}-settings&tab=layout" class="nav-tab <?php echo $active_tab === 'layout' ? 'nav-tab-active' : ''; ?>">
                <span class="dashicons dashicons-layout"></span> <?php esc_html_e('Layout', '${slug}'); ?>
            </a>` : ''}
            <a href="?page=${slug}-settings&tab=social" class="nav-tab <?php echo $active_tab === 'social' ? 'nav-tab-active' : ''; ?>">
                <span class="dashicons dashicons-share"></span> <?php esc_html_e('Social', '${slug}'); ?>
            </a>
            <a href="?page=${slug}-settings&tab=advanced" class="nav-tab <?php echo $active_tab === 'advanced' ? 'nav-tab-active' : ''; ?>">
                <span class="dashicons dashicons-admin-generic"></span> <?php esc_html_e('Advanced', '${slug}'); ?>
            </a>
        </h2>

        <form method="post" action="options.php">
            <?php settings_fields('${slug}_settings'); ?>
            <div class="tab-content">
                <?php
                switch ($active_tab) {
                    case 'general':
                        ${slug}_render_general_tab();
                        break;${this.hasComponent('productCards') ? `
                    case 'shop':
                        ${slug}_render_shop_tab();
                        break;` : ''}
                    case 'typography':
                        ${slug}_render_typography_tab();
                        break;
                    case 'colors':
                        ${slug}_render_colors_tab();
                        break;${this.hasComponent('headers') || this.hasComponent('footers') ? `
                    case 'layout':
                        ${slug}_render_layout_tab();
                        break;` : ''}
                    case 'social':
                        ${slug}_render_social_tab();
                        break;
                    case 'advanced':
                        ${slug}_render_advanced_tab();
                        break;
                }
                ?>
            </div>
            <?php submit_button(); ?>
        </form>
    </div>
    <style>
        .${slug}-theme-settings .nav-tab { display: inline-flex; align-items: center; gap: 4px; }
        .${slug}-theme-settings .tab-content { background: #fff; padding: 20px; border: 1px solid #c3c4c7; border-top: none; max-width: 800px; }
        .${slug}-theme-settings .form-table th { width: 200px; }
        .${slug}-theme-settings .color-preview { display: inline-block; width: 24px; height: 24px; border-radius: 4px; vertical-align: middle; margin-right: 8px; border: 1px solid #ddd; }
    </style>
    <?php
}

/**
 * Render General tab
 */
function ${slug}_render_general_tab() {
    ?>
    <h3><?php esc_html_e('General Settings', '${slug}'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="${slug}_container_width"><?php esc_html_e('Container Width', '${slug}'); ?></label></th>
            <td><input type="text" id="${slug}_container_width" name="${slug}_container_width" value="<?php echo esc_attr(get_option('${slug}_container_width', '1200px')); ?>" class="regular-text" /></td>
        </tr>
        <tr>
            <th scope="row"><label for="${slug}_layout_style"><?php esc_html_e('Layout Style', '${slug}'); ?></label></th>
            <td>
                <select id="${slug}_layout_style" name="${slug}_layout_style">
                    <option value="full-width" <?php selected(get_option('${slug}_layout_style'), 'full-width'); ?>><?php esc_html_e('Full Width', '${slug}'); ?></option>
                    <option value="boxed" <?php selected(get_option('${slug}_layout_style'), 'boxed'); ?>><?php esc_html_e('Boxed', '${slug}'); ?></option>
                </select>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="${slug}_lazy_load"><?php esc_html_e('Lazy Load Images', '${slug}'); ?></label></th>
            <td><input type="checkbox" id="${slug}_lazy_load" name="${slug}_lazy_load" value="1" <?php checked(get_option('${slug}_lazy_load', true)); ?> /></td>
        </tr>
    </table>
    <?php
}

/**
 * Render Typography tab
 */
function ${slug}_render_typography_tab() {
    ?>
    <h3><?php esc_html_e('Typography Settings', '${slug}'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="${slug}_body_font"><?php esc_html_e('Body Font', '${slug}'); ?></label></th>
            <td>
                <input type="text" id="${slug}_body_font" name="${slug}_body_font" value="<?php echo esc_attr(get_option('${slug}_body_font', '${this.getFontFamily('body')}')); ?>" class="regular-text" />
                <p class="description"><?php esc_html_e('Enter font family name (e.g., Inter, Roboto, Open Sans)', '${slug}'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="${slug}_heading_font"><?php esc_html_e('Heading Font', '${slug}'); ?></label></th>
            <td>
                <input type="text" id="${slug}_heading_font" name="${slug}_heading_font" value="<?php echo esc_attr(get_option('${slug}_heading_font', '${this.getFontFamily('heading')}')); ?>" class="regular-text" />
                <p class="description"><?php esc_html_e('Enter font family name for headings', '${slug}'); ?></p>
            </td>
        </tr>
    </table>
    <?php
}

/**
 * Render Colors tab
 */
function ${slug}_render_colors_tab() {
    ?>
    <h3><?php esc_html_e('Color Settings', '${slug}'); ?></h3>
    <p><?php esc_html_e('Override the Figma design colors. Leave empty to use the design defaults.', '${slug}'); ?></p>
    <table class="form-table">
        <?php
        $color_fields = array(
            array('key' => 'primary', 'label' => __('Primary', '${slug}'), 'default' => '${this.getColorDefault('primary')}'),
            array('key' => 'secondary', 'label' => __('Secondary', '${slug}'), 'default' => '${this.getColorDefault('secondary')}'),
            array('key' => 'accent', 'label' => __('Accent', '${slug}'), 'default' => '${this.getColorDefault('accent')}'),
            array('key' => 'neutral', 'label' => __('Neutral', '${slug}'), 'default' => '${this.getColorDefault('neutral')}'),
            array('key' => 'success', 'label' => __('Success', '${slug}'), 'default' => '${this.getColorDefault('success')}'),
            array('key' => 'warning', 'label' => __('Warning', '${slug}'), 'default' => '${this.getColorDefault('warning')}'),
            array('key' => 'error', 'label' => __('Error', '${slug}'), 'default' => '${this.getColorDefault('error')}'),
            array('key' => 'info', 'label' => __('Info', '${slug}'), 'default' => '${this.getColorDefault('info')}'),
            array('key' => 'bg_body', 'label' => __('Background', '${slug}'), 'default' => '${this.getColorDefault('bg_body')}'),
            array('key' => 'text_primary', 'label' => __('Text Primary', '${slug}'), 'default' => '${this.getColorDefault('text_primary')}'),
        );
        foreach ($color_fields as $field) :
            $key = $field['key'];
            $label = $field['label'];
            $default = $field['default'];
        ?>
        <tr>
            <th scope="row"><label for="${slug}_color_<?php echo esc_attr($key); ?>"><?php echo esc_html($label); ?></label></th>
            <td>
                <input type="text" id="${slug}_color_<?php echo esc_attr($key); ?>" name="${slug}_color_<?php echo esc_attr($key); ?>"
                    value="<?php echo esc_attr(get_option('${slug}_color_' . $key, $default)); ?>"
                    class="regular-text color-field" placeholder="#RRGGBB" />
                <?php if (!in_array($key, array('bg_body', 'text_primary'))) : ?>
                <span class="color-preview" style="background-color:<?php echo esc_attr(get_option('${slug}_color_' . $key, $default)); ?>"></span>
                <?php endif; ?>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
    <?php
}

${this.hasComponent('productCards') ? `
/**
 * Render Shop tab
 */
function ${slug}_render_shop_tab() {
    ?>
    <h3><?php esc_html_e('Shop Settings', '${slug}'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="${slug}_products_per_page"><?php esc_html_e('Products Per Page', '${slug}'); ?></label></th>
            <td><input type="number" id="${slug}_products_per_page" name="${slug}_products_per_page" value="<?php echo esc_attr(get_option('${slug}_products_per_page', 12)); ?>" min="1" max="100" /></td>
        </tr>
        <tr>
            <th scope="row"><label for="${slug}_product_columns"><?php esc_html_e('Product Columns', '${slug}'); ?></label></th>
            <td><input type="number" id="${slug}_product_columns" name="${slug}_product_columns" value="<?php echo esc_attr(get_option('${slug}_product_columns', 4)); ?>" min="1" max="6" /></td>
        </tr>
        <tr>
            <th scope="row"><label for="${slug}_catalog_mode"><?php esc_html_e('Catalog Mode', '${slug}'); ?></label></th>
            <td><input type="checkbox" id="${slug}_catalog_mode" name="${slug}_catalog_mode" value="1" <?php checked(get_option('${slug}_catalog_mode', false)); ?> /> <?php esc_html_e('Hide prices & add to cart', '${slug}'); ?></td>
        </tr>
    </table>
    <?php
}` : ''}

${this.hasComponent('headers') || this.hasComponent('footers') ? `
/**
 * Render Layout tab
 */
function ${slug}_render_layout_tab() {
    ?>
    <h3><?php esc_html_e('Layout Settings', '${slug}'); ?></h3>
    <table class="form-table">
        ${this.hasComponent('headers') ? `
        <tr>
            <th scope="row"><?php esc_html_e('Header Options', '${slug}'); ?></th>
            <td>
                <label><input type="checkbox" name="${slug}_header_sticky" value="1" <?php checked(get_option('${slug}_header_sticky', ${this.getHeaderType() === 'sticky' ? 'true' : 'false'})); ?> /> <?php esc_html_e('Sticky Header', '${slug}'); ?></label><br />
                <label><input type="checkbox" name="${slug}_header_transparent" value="1" <?php checked(get_option('${slug}_header_transparent', ${this.getHeaderType() === 'transparent' ? 'true' : 'false'})); ?> /> <?php esc_html_e('Transparent Header', '${slug}'); ?></label>
            </td>
        </tr>` : ''}
        ${this.hasComponent('footers') ? `
        <tr>
            <th scope="row"><label for="${slug}_footer_columns"><?php esc_html_e('Footer Columns', '${slug}'); ?></label></th>
            <td><input type="number" id="${slug}_footer_columns" name="${slug}_footer_columns" value="<?php echo esc_attr(get_option('${slug}_footer_columns', ${this.getFooterColumns()})); ?>" min="1" max="6" /></td>
        </tr>` : ''}
    </table>
    <?php
}` : ''}

/**
 * Render Social tab
 */
function ${slug}_render_social_tab() {
    ?>
    <h3><?php esc_html_e('Social Links', '${slug}'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="${slug}_social_facebook"><?php esc_html_e('Facebook URL', '${slug}'); ?></label></th>
            <td><input type="url" id="${slug}_social_facebook" name="${slug}_social_facebook" value="<?php echo esc_attr(get_option('${slug}_social_facebook', '')); ?>" class="regular-text" placeholder="https://facebook.com/your-page" /></td>
        </tr>
        <tr>
            <th scope="row"><label for="${slug}_social_twitter"><?php esc_html_e('Twitter URL', '${slug}'); ?></label></th>
            <td><input type="url" id="${slug}_social_twitter" name="${slug}_social_twitter" value="<?php echo esc_attr(get_option('${slug}_social_twitter', '')); ?>" class="regular-text" placeholder="https://twitter.com/your-handle" /></td>
        </tr>
        <tr>
            <th scope="row"><label for="${slug}_social_instagram"><?php esc_html_e('Instagram URL', '${slug}'); ?></label></th>
            <td><input type="url" id="${slug}_social_instagram" name="${slug}_social_instagram" value="<?php echo esc_attr(get_option('${slug}_social_instagram', '')); ?>" class="regular-text" placeholder="https://instagram.com/your-profile" /></td>
        </tr>
        <tr>
            <th scope="row"><label for="${slug}_social_linkedin"><?php esc_html_e('LinkedIn URL', '${slug}'); ?></label></th>
            <td><input type="url" id="${slug}_social_linkedin" name="${slug}_social_linkedin" value="<?php echo esc_attr(get_option('${slug}_social_linkedin', '')); ?>" class="regular-text" placeholder="https://linkedin.com/in/your-profile" /></td>
        </tr>
    </table>
    <?php
}

/**
 * Render Advanced tab
 */
function ${slug}_render_advanced_tab() {
    ?>
    <h3><?php esc_html_e('Advanced Settings', '${slug}'); ?></h3>
    <table class="form-table">
        <tr>
            <th scope="row"><label for="${slug}_custom_css"><?php esc_html_e('Custom CSS', '${slug}'); ?></label></th>
            <td><textarea id="${slug}_custom_css" name="${slug}_custom_css" rows="10" class="large-text code"><?php echo esc_textarea(get_option('${slug}_custom_css', '')); ?></textarea></td>
        </tr>
    </table>
    <?php
}

/**
 * Apply custom CSS from theme settings
 */
function ${slug}_apply_custom_css() {
    $custom_css = get_option('${slug}_custom_css', '');
    if (!empty($custom_css)) {
        wp_add_inline_style('${slug}-style', $custom_css);
    }
}
add_action('wp_enqueue_scripts', '${slug}_apply_custom_css', 20);

/**
 * Apply color customizations
 */
function ${slug}_apply_color_customizations() {
    $custom_css = '';
    $color_map = array(
        'primary' => '--wp--preset--color--primary-500',
        'secondary' => '--wp--preset--color--secondary-500',
        'accent' => '--wp--preset--color--accent-500',
        'neutral' => '--wp--preset--color--neutral-500',
        'success' => '--wp--preset--color--success-500',
        'warning' => '--wp--preset--color--warning-500',
        'error' => '--wp--preset--color--error-500',
        'info' => '--wp--preset--color--info-500',
        'bg_body' => '--wp--preset--color--bg-body',
        'text_primary' => '--wp--preset--color--text-primary',
    );
    foreach ($color_map as $key => $var) {
        $val = get_option('${slug}_color_' . $key, '');
        if (!empty($val)) {
            $custom_css .= ":root { {$var}: {$val}; }\\n";
        }
    }
    if (!empty($custom_css)) {
        wp_add_inline_style('${slug}-style', $custom_css);
    }
}
add_action('wp_enqueue_scripts', '${slug}_apply_color_customizations', 20);
`;
  }

  generateStyleVariations(tokens: ExtractedTokens): Array<{ slug: string; name: string; content: string }> {
    const c = tokens.colors;
    const variations: Array<{ slug: string; name: string; content: string }> = [];

    if (c.primary?.['500'] && c.primary?.['700'] && c.secondary?.['500']) {
      const base: Record<string, unknown> = {
        version: 3,
        settings: {
          color: {
            palette: [
              { slug: 'primary-500', name: 'Primary', color: c.primary['500'] },
              { slug: 'primary-700', name: 'Primary Dark', color: c.primary['700'] },
              { slug: 'secondary-500', name: 'Secondary', color: c.secondary['500'] },
              { slug: 'bg-body', name: 'Background', color: c.background?.body || '#ffffff' },
              { slug: 'text-primary', name: 'Text', color: c.text?.primary || '#111111' },
            ],
          },
        },
        styles: {
          color: { background: c.background?.body || '#ffffff', text: c.text?.primary || '#111111' },
        },
      };
      variations.push({ slug: 'default', name: 'Default', content: JSON.stringify(base, null, 2) });
    }

    if (c.neutral?.['50'] && c.neutral?.['900']) {
      const light: Record<string, unknown> = {
        version: 3,
        settings: {
          color: {
            palette: [
              { slug: 'primary-500', name: 'Primary', color: c.primary?.['500'] || '#3b82f6' },
              { slug: 'bg-body', name: 'Background', color: '#f8fafc' },
              { slug: 'text-primary', name: 'Text', color: c.text?.primary || '#0f172a' },
            ],
          },
        },
        styles: {
          color: { background: '#f8fafc', text: c.text?.primary || '#0f172a' },
        },
      };
      variations.push({ slug: 'light', name: 'Light', content: JSON.stringify(light, null, 2) });
    }

    if (c.neutral?.['900']) {
      const dark: Record<string, unknown> = {
        version: 3,
        settings: {
          color: {
            palette: [
              { slug: 'primary-500', name: 'Primary', color: c.primary?.['500'] || '#60a5fa' },
              { slug: 'bg-body', name: 'Background', color: c.neutral['900'] },
              { slug: 'text-primary', name: 'Text', color: c.neutral?.['50'] || '#fafafa' },
              { slug: 'text-secondary', name: 'Text Secondary', color: c.neutral?.['500'] || '#9ca3af' },
            ],
          },
        },
        styles: {
          color: { background: c.neutral['900'], text: c.neutral?.['50'] || '#fafafa' },
        },
      };
      variations.push({ slug: 'dark', name: 'Dark', content: JSON.stringify(dark, null, 2) });
    }

    return variations;
  }

  generateCustomizerPhp(): string {
    const { themeSlug: slug, themeName } = this.config;
    return `<?php
/**
 * Theme Customizer — Generated by TypeFigma
 *
 * @package ${slug}
 */

// Prevent direct access
if (!defined('ABSPATH')) exit;

/**
 * Register Customizer panels, sections, settings, and controls.
 */
function ${slug}_customize_register(\$wp_customize) {

    // --- Colors & Branding ---
    \$wp_customize->add_section('${slug}_colors', array(
        'title'       => esc_html__('Colors & Branding', '${slug}'),
        'priority'    => 30,
    ));

    \$color_fields = array(
        'primary'   => esc_html__('Primary', '${slug}'),
        'secondary' => esc_html__('Secondary', '${slug}'),
        'accent'    => esc_html__('Accent', '${slug}'),
        'bg_body'   => esc_html__('Background', '${slug}'),
        'text_primary' => esc_html__('Text Primary', '${slug}'),
    );

    foreach (\$color_fields as \$key => \$label) {
        \$wp_customize->add_setting('${slug}_color_' . \$key, array(
            'default'           => '${this.getColorDefault('primary')}',
            'sanitize_callback' => 'sanitize_hex_color',
            'transport'         => 'postMessage',
            'type'              => 'theme_mod',
        ));
        \$wp_customize->add_control(new WP_Customize_Color_Control(\$wp_customize, '${slug}_color_' . \$key, array(
            'label'    => \$label,
            'section'  => '${slug}_colors',
            'settings' => '${slug}_color_' . \$key,
        )));
    }

    // --- Typography ---
    \$wp_customize->add_section('${slug}_typography', array(
        'title'       => esc_html__('Typography', '${slug}'),
        'priority'    => 35,
    ));

    \$wp_customize->add_setting('${slug}_body_font', array(
        'default'           => '${this.getFontFamily('body')}',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_body_font', array(
        'label'       => esc_html__('Body Font', '${slug}'),
        'section'     => '${slug}_typography',
        'type'        => 'text',
        'input_attrs' => array('placeholder' => esc_attr__('Font family name', '${slug}')),
    ));

    \$wp_customize->add_setting('${slug}_heading_font', array(
        'default'           => '${this.getFontFamily('heading')}',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_heading_font', array(
        'label'       => esc_html__('Heading Font', '${slug}'),
        'section'     => '${slug}_typography',
        'type'        => 'text',
        'input_attrs' => array('placeholder' => esc_attr__('Font family name', '${slug}')),
    ));

    // --- Layout ---
    \$wp_customize->add_section('${slug}_layout', array(
        'title'       => esc_html__('Layout', '${slug}'),
        'priority'    => 40,
    ));

    \$wp_customize->add_setting('${slug}_container_width', array(
        'default'           => '1200px',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_container_width', array(
        'label'       => esc_html__('Container Width', '${slug}'),
        'section'     => '${slug}_layout',
        'type'        => 'text',
        'input_attrs' => array('placeholder' => '1200px'),
    ));

    \$wp_customize->add_setting('${slug}_layout_style', array(
        'default'           => 'full-width',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_layout_style', array(
        'label'       => esc_html__('Layout Style', '${slug}'),
        'section'     => '${slug}_layout',
        'type'        => 'select',
        'choices'     => array(
            'full-width' => esc_html__('Full Width', '${slug}'),
            'boxed'      => esc_html__('Boxed', '${slug}'),
        ),
    ));

    // --- Header ---
    ${this.hasComponent('headers') ? `
    \$wp_customize->add_section('${slug}_header', array(
        'title'       => esc_html__('Header', '${slug}'),
        'priority'    => 45,
    ));

    \$wp_customize->add_setting('${slug}_header_sticky', array(
        'default'           => ${this.getHeaderType() === 'sticky' ? 'true' : 'false'},
        'sanitize_callback' => 'rest_sanitize_boolean',
        'transport'         => 'refresh',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_header_sticky', array(
        'label'       => esc_html__('Sticky Header', '${slug}'),
        'section'     => '${slug}_header',
        'type'        => 'checkbox',
    ));

    \$wp_customize->add_setting('${slug}_header_transparent', array(
        'default'           => ${this.getHeaderType() === 'transparent' ? 'true' : 'false'},
        'sanitize_callback' => 'rest_sanitize_boolean',
        'transport'         => 'refresh',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_header_transparent', array(
        'label'       => esc_html__('Transparent Header', '${slug}'),
        'section'     => '${slug}_header',
        'type'        => 'checkbox',
    ));
` : ''}

    // --- WooCommerce Shop ---
    ${this.hasComponent('productCards') ? `
    \$wp_customize->add_section('${slug}_shop', array(
        'title'       => esc_html__('Shop Settings', '${slug}'),
        'priority'    => 50,
    ));

    \$wp_customize->add_setting('${slug}_products_per_page', array(
        'default'           => 12,
        'sanitize_callback' => 'absint',
        'transport'         => 'refresh',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_products_per_page', array(
        'label'       => esc_html__('Products Per Page', '${slug}'),
        'section'     => '${slug}_shop',
        'type'        => 'number',
        'input_attrs' => array('min' => 1, 'max' => 100),
    ));

    \$wp_customize->add_setting('${slug}_product_columns', array(
        'default'           => 4,
        'sanitize_callback' => 'absint',
        'transport'         => 'refresh',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_product_columns', array(
        'label'       => esc_html__('Product Columns', '${slug}'),
        'section'     => '${slug}_shop',
        'type'        => 'number',
        'input_attrs' => array('min' => 1, 'max' => 6),
    ));

    \$wp_customize->add_setting('${slug}_catalog_mode', array(
        'default'           => false,
        'sanitize_callback' => 'rest_sanitize_boolean',
        'transport'         => 'refresh',
        'type'              => 'theme_mod',
    ));
    \$wp_customize->add_control('${slug}_catalog_mode', array(
        'label'       => esc_html__('Catalog Mode', '${slug}'),
        'section'     => '${slug}_shop',
        'type'        => 'checkbox',
        'description' => esc_html__('Hide prices & add to cart buttons', '${slug}'),
    ));
` : ''}

    // --- Social Links ---
    \$wp_customize->add_section('${slug}_social', array(
        'title'       => esc_html__('Social Links', '${slug}'),
        'priority'    => 55,
    ));

    \$socials = array('facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github');
    foreach (\$socials as \$social) {
        \$wp_customize->add_setting('${slug}_social_' . \$social, array(
            'default'           => '',
            'sanitize_callback' => 'esc_url_raw',
            'transport'         => 'refresh',
            'type'              => 'theme_mod',
        ));
        \$wp_customize->add_control('${slug}_social_' . \$social, array(
            'label'       => /* translators: social platform name */ sprintf(esc_html__('%s URL', '${slug}'), ucfirst(\$social)),
            'section'     => '${slug}_social',
            'type'        => 'url',
            'input_attrs' => array('placeholder' => 'https://' . \$social . '.com/'),
        ));
    }

    // --- Selective Refresh for front-end preview ---
    \$selective_refresh = isset(\$wp_customize->selective_refresh);
    if (\$selective_refresh) {
        \$wp_customize->selective_refresh->add_partial('${slug}_color_partial', array(
            'selector'            => ':root',
            'settings'            => array_map(function(\$k) { return '${slug}_color_' . \$k; }, array_keys(\$color_fields)),
            'render_callback'     => function () {},
            'container_inclusive' => false,
            'fallback_refresh'    => true,
        ));
    }
}
add_action('customize_register', '${slug}_customize_register');

/**
 * Output Customizer theme mods as inline CSS.
 */
function ${slug}_customizer_css() {
    \$custom_css = '';

    // Color overrides
    \$color_map = array(
        'primary'   => '--wp--preset--color--primary-500',
        'secondary' => '--wp--preset--color--secondary-500',
        'accent'    => '--wp--preset--color--accent-500',
        'bg_body'   => '--wp--preset--color--bg-body',
        'text_primary' => '--wp--preset--color--text-primary',
    );
    foreach (\$color_map as \$key => \$var) {
        \$val = get_theme_mod('${slug}_color_' . \$key, '');
        if (!empty(\$val)) {
            \$custom_css .= ":root { {$var}: {$val}; }\\n";
        }
    }

    // Container width
    \$container = get_theme_mod('${slug}_container_width', '1200px');
    \$custom_css .= ":root { --container-width: {$container}; }\\n";

    // Fonts
    \$body_font = get_theme_mod('${slug}_body_font', '');
    if (!empty(\$body_font)) {
        \$custom_css .= ":root { --wp--preset--font-family--body: {$body_font}; }\\n";
    }
    \$heading_font = get_theme_mod('${slug}_heading_font', '');
    if (!empty(\$heading_font)) {
        \$custom_css .= ":root { --wp--preset--font-family--heading: {$heading_font}; }\\n";
    }

    if (!empty(\$custom_css)) {
        wp_add_inline_style('${slug}-style', \$custom_css);
    }
}
add_action('wp_enqueue_scripts', '${slug}_customizer_css', 15);

/**
 * Customizer live preview JS.
 */
function ${slug}_customizer_live_preview() {
    wp_enqueue_script(
        '${slug}-customizer',
        get_template_directory_uri() . '/inc/admin/customizer-preview.js',
        array('jquery', 'customize-preview'),
        wp_get_theme()->get('Version'),
        true
    );
}
add_action('customize_preview_init', '${slug}_customizer_live_preview');
`;
  }

  generateCustomizerPreviewJs(): string {
    const slug = this.config.themeSlug;
    return `/* ${slug} Customizer Live Preview */
(function (\$) {
  'use strict';

  // Colors
  ['primary', 'secondary', 'accent', 'bg_body', 'text_primary'].forEach(function (key) {
    wp.customize('${slug}_color_' + key, function (value) {
      value.bind(function (newval) {
        var map = {
          primary: '--wp--preset--color--primary-500',
          secondary: '--wp--preset--color--secondary-500',
          accent: '--wp--preset--color--accent-500',
          bg_body: '--wp--preset--color--bg-body',
          text_primary: '--wp--preset--color--text-primary',
        };
        document.documentElement.style.setProperty(map[key], newval);
      });
    });
  });

  // Container width
  wp.customize('${slug}_container_width', function (value) {
    value.bind(function (newval) {
      document.documentElement.style.setProperty('--container-width', newval);
    });
  });

  // Body font
  wp.customize('${slug}_body_font', function (value) {
    value.bind(function (newval) {
      document.documentElement.style.setProperty('--wp--preset--font-family--body', newval);
    });
  });

  // Heading font
  wp.customize('${slug}_heading_font', function (value) {
    value.bind(function (newval) {
      document.documentElement.style.setProperty('--wp--preset--font-family--heading', newval);
    });
  });
}(jQuery));
`;
  }

  getFileList(): Array<{ path: string; content: string }> {
    const files: Array<{ path: string; content: string }> = [
      { path: `inc/admin/settings.php`, content: this.generateAdminPagePhp() },
      { path: `inc/admin/customizer.php`, content: this.generateCustomizerPhp() },
      { path: `inc/admin/customizer-preview.js`, content: this.generateCustomizerPreviewJs() },
    ];

    const variations = this.generateStyleVariations(this.config.tokens);
    for (const v of variations) {
      if (variations.length > 1) {
        files.push({ path: `styles/${v.slug}.json`, content: v.content });
      }
    }

    return files;
  }

  private getFontFamily(type: 'heading' | 'body'): string {
    return this.config.tokens.typography.fontFamilies[type]?.name || 'Inter';
  }

  private getColorDefault(key: string): string {
    const c = this.config.tokens.colors;
    switch (key) {
      case 'primary': return c?.primary?.['500'] || '';
      case 'secondary': return c?.secondary?.['500'] || '';
      case 'accent': return c?.accent?.['500'] || '';
      case 'neutral': return c?.neutral?.['500'] || '';
      case 'success': return c?.success?.['500'] || '';
      case 'warning': return c?.warning?.['500'] || '';
      case 'error': return c?.error?.['500'] || '';
      case 'info': return c?.info?.['500'] || '';
      case 'bg_body': return c?.background?.body || '';
      case 'text_primary': return c?.text?.primary || '';
      default: return '';
    }
  }

  private hasComponent(type: string): boolean {
    return (this.config.components as any)?.[type]?.length > 0;
  }

  private getHeaderType(): string {
    return (this.config.components as any)?.headers?.[0]?.type || 'static';
  }

  private getFooterColumns(): number {
    return (this.config.components as any)?.footers?.[0]?.columns || 4;
  }

  private escapePhp(text: string): string {
    return text.replace(/'/g, "\\'");
  }
}
