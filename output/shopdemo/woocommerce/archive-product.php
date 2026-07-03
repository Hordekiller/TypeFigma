<?php
/**
 * WooCommerce Archive Product Template
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

        <header class="woocommerce-products-header">
            <?php if (apply_filters('woocommerce_show_page_title', true)) : ?>
                <h1 class="woocommerce-products-header__title page-title">
                    <?php woocommerce_page_title(); ?>
                </h1>
            <?php endif; ?>

            <?php
            /**
             * Hook: woocommerce_archive_description
             */
            do_action('woocommerce_archive_description');
            ?>
        </header>

        <?php
        if (woocommerce_product_loop()) {
            /**
             * Hook: woocommerce_before_shop_loop
             */
            do_action('woocommerce_before_shop_loop');

            woocommerce_product_loop_start();

            if (wc_get_loop_prop('total')) {
                while (have_posts()) {
                    the_post();
                    /**
                     * Hook: woocommerce_shop_loop
                     */
                    do_action('woocommerce_shop_loop');

                    wc_get_template_part('content', 'product');
                }
            }

            woocommerce_product_loop_end();

            /**
             * Hook: woocommerce_after_shop_loop
             */
            do_action('woocommerce_after_shop_loop');
        } else {
            /**
             * Hook: woocommerce_no_products_found
             */
            do_action('woocommerce_no_products_found');
        }

        /**
         * Hook: woocommerce_after_main_content
         */
        do_action('woocommerce_after_main_content');
        ?>
    </div>
</main>

<?php
get_footer('shop');
