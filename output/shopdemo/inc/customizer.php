<?php
/**
 * Customizer Settings for ShopDemo
 *
 * @package shopdemo
 */

add_action('customize_register', function ($wp_customize) {
    // === Colors Section ===
    $wp_customize->add_section('shopdemo_colors', [
        'title'    => esc_html__('Theme Colors', 'shopdemo'),
        'priority' => 30,
    ]);

    $colors = [
        'primary_color'   => ['label' => 'Primary Color', 'default' => '#3b82f6'],
        'secondary_color' => ['label' => 'Secondary Color', 'default' => '#22c55e'],
    ];

    foreach ($colors as $setting_key => $color) {
        $wp_customize->add_setting($setting_key, [
            'default'           => $color['default'],
            'sanitize_callback' => 'sanitize_hex_color',
        ]);

        $wp_customize->add_control(new WP_Customize_Color_Control(
            $wp_customize,
            $setting_key,
            [
                'label'   => esc_html__($color['label'], 'shopdemo'),
                'section' => 'shopdemo_colors',
            ]
        ));
    }

    // === Typography Section ===
    $wp_customize->add_section('shopdemo_typography', [
        'title'    => esc_html__('Typography', 'shopdemo'),
        'priority' => 35,
    ]);

    $wp_customize->add_setting('heading_font', [
        'default' => 'Inter',
    ]);

    $wp_customize->add_control('heading_font', [
        'label'   => esc_html__('Heading Font', 'shopdemo'),
        'section' => 'shopdemo_typography',
        'type'    => 'select',
        'choices' => [
            'Inter'    => 'Inter',
            'Roboto'   => 'Roboto',
            'Open Sans' => 'Open Sans',
            'Lato'     => 'Lato',
            'Montserrat' => 'Montserrat',
        ],
    ]);

    $wp_customize->add_setting('body_font', [
        'default' => 'Inter',
    ]);

    $wp_customize->add_control('body_font', [
        'label'   => esc_html__('Body Font', 'shopdemo'),
        'section' => 'shopdemo_typography',
        'type'    => 'select',
        'choices' => [
            'Inter'    => 'Inter',
            'Roboto'   => 'Roboto',
            'Open Sans' => 'Open Sans',
            'Lato'     => 'Lato',
            'Montserrat' => 'Montserrat',
        ],
    ]);

    
    // === Shop Layout Section ===
    if (class_exists('WooCommerce')) {
        $wp_customize->add_section('shopdemo_shop', [
            'title'    => esc_html__('Shop Layout', 'shopdemo'),
            'priority' => 40,
        ]);

        $wp_customize->add_setting('shopdemo_products_per_row', [
            'default' => 4,
        ]);

        $wp_customize->add_control('shopdemo_products_per_row', [
            'label'   => esc_html__('Products per row', 'shopdemo'),
            'section' => 'shopdemo_shop',
            'type'    => 'number',
            'input_attrs' => [
                'min' => 2,
                'max' => 6,
            ],
        ]);

        $wp_customize->add_setting('shopdemo_products_per_page', [
            'default' => 12,
        ]);

        $wp_customize->add_control('shopdemo_products_per_page', [
            'label'   => esc_html__('Products per page', 'shopdemo'),
            'section' => 'shopdemo_shop',
            'type'    => 'number',
        ]);
    }
    
});
