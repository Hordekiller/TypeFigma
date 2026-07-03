<?php
/**
 * WooCommerce Content Product (Product Card)
 *
 * @package shopdemo
 */

defined('ABSPATH') || exit;

global $product;
?>
<li <?php wc_product_class('product-card', $product); ?>>
    <?php do_action('woocommerce_before_shop_loop_item'); ?>

    <div class="product-card__image-wrapper">
        <?php
        if ($product->is_on_sale()) {
            echo '<span class="product-card__badge product-card__badge--sale">'
                . esc_html__('Sale!', 'shopdemo')
                . '</span>';
        }
        ?>

        <a href="<?php the_permalink(); ?>" class="product-card__link">
            <?php woocommerce_template_loop_product_thumbnail(); ?>
        </a>

        <div class="product-card__actions">
            <?php
            if (shortcode_exists('yith_wcwl_add_to_wishlist')) {
                echo do_shortcode('[yith_wcwl_add_to_wishlist]');
            }
            ?>
        </div>
    </div>

    <div class="product-card__content">
        <?php woocommerce_template_loop_rating(); ?>

        <h3 class="product-card__title">
            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
        </h3>

        <?php if ($post->post_excerpt) : ?>
            <p class="product-card__excerpt"><?php echo wp_trim_words(get_the_excerpt(), 15); ?></p>
        <?php endif; ?>

        <div class="product-card__footer">
            <div class="product-card__price">
                <?php woocommerce_template_loop_price(); ?>
            </div>

            <?php woocommerce_template_loop_add_to_cart(); ?>
        </div>
    </div>

    <?php do_action('woocommerce_after_shop_loop_item'); ?>
</li>