<?php
/**
 * WooCommerce Single Product Template
 *
 * @package shopdemo
 */

get_header('shop');
?>

<main id="primary" class="site-main">
    <div class="container">
        <?php
        /**
         * Hook: woocommerce_before_main_content
         */
        do_action('woocommerce_before_main_content');
        ?>

        <?php
        while (have_posts()) :
            the_post();

            wc_get_template_part('content', 'single-product');
        endwhile;
        ?>

        <?php
        /**
         * Hook: woocommerce_after_main_content
         */
        do_action('woocommerce_after_main_content');
        ?>
    </div>
</main>

<?php
get_footer('shop');
