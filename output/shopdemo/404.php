<?php
/**
 * 404 Template
 *
 * @package shopdemo
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container">
        <section class="error-404 not-found">
            <header class="page-header">
                <h1 class="page-title"><?php esc_html_e('Page Not Found', 'shopdemo'); ?></h1>
            </header>

            <div class="page-content">
                <p><?php esc_html_e('The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.', 'shopdemo'); ?></p>

                <div class="search-form-wrapper">
                    <?php get_search_form(); ?>
                </div>

                <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary">
                    <?php esc_html_e('Back to Home', 'shopdemo'); ?>
                </a>
            </div>
        </section>
    </div>
</main>

<?php
get_footer();
