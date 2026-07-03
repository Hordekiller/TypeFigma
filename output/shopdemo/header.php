<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php
if (function_exists('wp_body_open')) {
    wp_body_open();
}
?>

<div id="page" class="site">
    <a class="skip-link screen-reader-text" href="#primary">
        <?php esc_html_e('Skip to content', 'shopdemo'); ?>
    </a>

    <?php if (has_custom_logo() || has_nav_menu('primary')) : ?>
    <header id="masthead" class="site-header">
        <div class="container">
            <div class="header-inner">
                <div class="site-branding">
                    <?php
                    if (has_custom_logo()) {
                        the_custom_logo();
                    } else {
                        ?>
                        <a href="<?php echo esc_url(home_url('/')); ?>" rel="home">
                            <?php bloginfo('name'); ?>
                        </a>
                        <?php
                    }
                    ?>
                </div>

                <?php if (has_nav_menu('primary')) : ?>
                    <nav id="site-navigation" class="main-nav">
                        <?php
                        wp_nav_menu([
                            'theme_location' => 'primary',
                            'menu_class'     => 'nav-menu',
                            'container'      => false,
                            'fallback_cb'    => false,
                        ]);
                        ?>
                    </nav>
                <?php endif; ?>
            </div>
        </div>
    </header>
    <?php endif; ?>
