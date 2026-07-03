<?php
/**
 * ShopDemo - Functions & Setup
 *
 * @package shopdemo
 */

// === Constants ===
define('SHOPDEMO_VERSION', '1.0.0');
define('SHOPDEMO_THEME_DIR', get_template_directory());
define('SHOPDEMO_THEME_URI', get_template_directory_uri());

// === Theme Setup ===
add_action('after_setup_theme', function () {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', [
        'height'      => 60,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ]);
    add_theme_support('html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ]);
    add_theme_support('align-wide');
    add_theme_support('responsive-embeds');

    // Register nav menus
    register_nav_menus([
        'primary' => esc_html__('Primary Menu', 'shopdemo'),
        'footer'  => esc_html__('Footer Menu', 'shopdemo'),
    ]);

    
    // WooCommerce support
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
    
});

// === Enqueue Scripts & Styles ===
add_action('wp_enqueue_scripts', function () {
    // Theme stylesheet
    wp_enqueue_style(
        'shopdemo-global',
        SHOPDEMO_THEME_URI . '/assets/css/global.css',
        [],
        SHOPDEMO_VERSION
    );

    wp_enqueue_style(
        'shopdemo-components',
        SHOPDEMO_THEME_URI . '/assets/css/components.css',
        ['shopdemo-global'],
        SHOPDEMO_VERSION
    );

    // Theme JavaScript
    wp_enqueue_script(
        'shopdemo-theme',
        SHOPDEMO_THEME_URI . '/assets/js/theme.js',
        [],
        SHOPDEMO_VERSION,
        true
    );
});

// === Elementor Support ===
if (!class_exists('\\Elementor\\Plugin')) {
    add_action('admin_notices', function () {
        ?>
        <div class="notice notice-warning is-dismissible">
            <p><?php esc_html_e('This theme requires Elementor to be installed and activated.', 'shopdemo'); ?></p>
        </div>
        <?php
    });
}

add_action('plugins_loaded', function () {
    if (did_action('elementor/loaded')) {
        // Import saved templates on theme activation
        add_action('after_switch_theme', function () {
            shopdemo_import_elementor_templates();
        });
    }
});

function shopdemo_import_elementor_templates() {
    $templates_dir = SHOPDEMO_THEME_DIR . '/elementor/templates/';
    if (!is_dir($templates_dir)) return;

    $templates = glob($templates_dir . '*.json');
    if (!class_exists('\\Elementor\\TemplateLibrary\\Source_Local')) return;

    foreach ($templates as $template_file) {
        $template_data = json_decode(file_get_contents($template_file), true);
        if (!$template_data || !isset($template_data['title'])) continue;

        $existing = get_posts([
            'post_type'      => 'elementor_library',
            'title'          => $template_data['title'],
            'post_status'    => 'any',
            'posts_per_page' => 1,
        ]);

        if (!empty($existing)) continue;

        $post_id = wp_insert_post([
            'post_title'  => $template_data['title'],
            'post_type'   => 'elementor_library',
            'post_status' => 'publish',
            'meta_input'  => [
                '_elementor_template_type' => $template_data['type'] ?? 'page',
                '_elementor_edit_mode'     => 'builder',
                '_elementor_data'          => wp_json_encode($template_data['content']),
            ],
        ]);

        if ($post_id && isset($template_data['page_settings'])) {
            update_post_meta($post_id, '_elementor_page_settings', $template_data['page_settings']);
        }
    }
}

// === Register Sidebars ===
add_action('widgets_init', function () {
    register_sidebar([
        'name'          => esc_html__('Sidebar', 'shopdemo'),
        'id'            => 'sidebar-1',
        'description'   => esc_html__('Main sidebar widget area', 'shopdemo'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ]);

    for ($i = 1; $i <= 4; $i++) {
        register_sidebar([
            'name'          => sprintf(esc_html__('Footer %d', 'shopdemo'), $i),
            'id'            => "footer-{$i}",
            'description'   => sprintf(esc_html__('Footer widget area %d', 'shopdemo'), $i),
            'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
            'after_widget'  => '</div>',
            'before_title'  => '<h4 class="footer-widget-title">',
            'after_title'   => '</h4>',
        ]);
    }
});

// === Customizer Settings ===
    require_once SHOPDEMO_THEME_DIR . '/inc/customizer.php';

// === Elementor Widgets ===
if (did_action('elementor/loaded')) {
    require_once SHOPDEMO_THEME_DIR . '/inc/elementor-widgets.php';
}


// === WooCommerce Customizations ===
add_filter('loop_shop_columns', function () {
    return get_theme_mod('shopdemo_products_per_row', 4);
});

add_filter('loop_shop_per_page', function () {
    return get_theme_mod('shopdemo_products_per_page', 12);
});

