// WooCommerce Generator: Generates WooCommerce templates for WordPress themes.

import { ThemeConfig } from '@typefigma/theme-builder';


export interface WooCommerceConfig {
  includeVariations?: boolean;
  includeGroupedProducts?: boolean;
  includeMiniCart?: boolean;
}

export class WooCommerceGenerator {
  private woocommerceConfig: WooCommerceConfig;

  constructor(config: ThemeConfig, woocommerceConfig?: WooCommerceConfig) {
    const wcFeatures = woocommerceConfig ?? config.woocommerceFeatures;
    this.woocommerceConfig = {
      includeVariations: true,
      includeGroupedProducts: true,
      includeMiniCart: true,
      ...wcFeatures
    };
  }

  /**
   * Generates all WooCommerce templates.
   */
  public generateTemplates(): Record<string, string> {
    const templates: Record<string, string> = {};

    templates['single-product.php'] = this.generateSingleProductTemplate();
    templates['archive-product.php'] = this.generateArchiveProductTemplate();
    templates['cart.php'] = this.generateCartTemplate();
    templates['checkout.php'] = this.generateCheckoutTemplate();
    templates['myaccount.php'] = this.generateMyAccountTemplate();
    templates['header.php'] = this.generateHeaderTemplate();

    return templates;
  }

  /**
   * Generates single-product.php template.
   */
  private generateSingleProductTemplate(): string {
    const variationsBlock = this.woocommerceConfig.includeVariations
      ? `    if ($product->is_type('variable')) {
      woocommerce_variable_add_to_cart();
    } else {
      woocommerce_template_single_add_to_cart();
    }`
      : `    woocommerce_template_single_add_to_cart();`;

    return `<?php
/**
 * The template for displaying product content in the single-product.php template
 */

defined('ABSPATH') || exit;

get_header('shop');

/** @var WC_Product $product */
global $product;

do_action('woocommerce_before_single_product');

if (post_password_required()) {
  echo get_the_password_form();
  return;
}
?>

<div id="product-<?php the_ID(); ?>" <?php wc_product_class('', $product); ?>>
  <?php do_action('woocommerce_before_single_product_summary'); ?>

  <div class="summary entry-summary">
    <?php
    woocommerce_template_single_title();
    woocommerce_template_single_rating();
    woocommerce_template_single_price();
    woocommerce_template_single_excerpt();
    ${variationsBlock}
    woocommerce_template_single_meta();
    woocommerce_template_single_sharing();
    ?>
  </div>

  <?php do_action('woocommerce_after_single_product_summary'); ?>
</div>

<?php do_action('woocommerce_after_single_product'); ?>

<?php get_footer('shop'); ?>`;
  }

  /**
   * Generates archive-product.php template.
   */
  private generateArchiveProductTemplate(): string {
    return `<?php
/**
 * The template for displaying product archives, including the main shop page.
 */

defined('ABSPATH') || exit;

get_header('shop');

?>
<div class="woocommerce-archive">
  <?php do_action('woocommerce_before_main_content'); ?>

  <header class="woocommerce-products-header">
    <?php if (apply_filters('woocommerce_show_page_title', true)) : ?>
      <h1 class="woocommerce-products-header__title page-title"><?php woocommerce_page_title(); ?></h1>
    <?php endif; ?>

    <?php do_action('woocommerce_archive_description'); ?>
  </header>

  <?php if (woocommerce_product_loop()) : ?>
    <?php do_action('woocommerce_before_shop_loop'); ?>

    <div class="products">
      <?php while (have_posts()) : the_post(); ?>
        <?php wc_get_template_part('content', 'product'); ?>
      <?php endwhile; ?>
    </div>

    <?php do_action('woocommerce_after_shop_loop'); ?>
  <?php else : ?>
    <?php do_action('woocommerce_no_products_found'); ?>
  <?php endif; ?>

  <?php do_action('woocommerce_after_main_content'); ?>
</div>

<?php get_footer('shop'); ?>`;
  }

  /**
   * Generates cart.php template.
   */
  private generateCartTemplate(): string {
    return `<?php
/**
 * Cart Page
 */

defined('ABSPATH') || exit;

get_header('shop');

?>
<div class="woocommerce-cart">
  <?php do_action('woocommerce_before_cart'); ?>

  <form class="woocommerce-cart-form" action="<?php echo esc_url(wc_get_cart_url()); ?>" method="post">
    <?php do_action('woocommerce_before_cart_table'); ?>

    <table class="shop_table shop_table_responsive cart woocommerce-cart-form__contents" cellspacing="0">
      <thead>
        <tr>
          <th class="product-remove">&nbsp;</th>
          <th class="product-thumbnail">&nbsp;</th>
          <th class="product-name" colspan="3"><?php esc_html_e('Product', 'woocommerce'); ?></th>
          <th class="product-price"><?php esc_html_e('Price', 'woocommerce'); ?></th>
          <th class="product-quantity"><?php esc_html_e('Quantity', 'woocommerce'); ?></th>
          <th class="product-subtotal"><?php esc_html_e('Subtotal', 'woocommerce'); ?></th>
        </tr>
      </thead>
      <tbody>
        <?php do_action('woocommerce_before_cart_contents'); ?>

        <?php foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) : ?>
          <?php
          $_product = apply_filters('woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key);
          $product_id = apply_filters('woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key);

          if ($_product && $_product->exists() && $cart_item['quantity'] > 0 && apply_filters('woocommerce_cart_item_visible', true, $cart_item, $cart_item_key)) {
            $product_permalink = apply_filters('woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink($cart_item) : '', $cart_item, $cart_item_key);
          ?>
            <tr class="woocommerce-cart-form__cart-item <?php echo esc_attr(apply_filters('woocommerce_cart_item_class', 'cart_item', $cart_item, $cart_item_key)); ?>">
              <td class="product-remove">
                <?php echo apply_filters('woocommerce_cart_item_remove_link', sprintf(
                  '<a href="%s" class="remove" aria-label="%s" data-product_id="%s" data-product_sku="%s">&times;</a>',
                  esc_url(wc_get_cart_remove_url($cart_item_key)),
                  esc_html__('Remove this item', 'woocommerce'),
                  esc_attr($product_id),
                  esc_attr($_product->get_sku())
                ), $cart_item_key); ?>
              </td>

              <td class="product-thumbnail">
                <?php
                $thumbnail = apply_filters('woocommerce_cart_item_thumbnail', $_product->get_image(), $cart_item, $cart_item_key);
                if (!$product_permalink) {
                  echo $thumbnail;
                } else {
                  printf('<a href="%s">%s</a>', esc_url($product_permalink), $thumbnail);
                }
                ?>
              </td>

              <td class="product-name" data-title="<?php esc_attr_e('Product', 'woocommerce'); ?>">
                <?php
                if (!$product_permalink) {
                  echo wp_kses_post(apply_filters('woocommerce_cart_item_name', $_product->get_name(), $cart_item, $cart_item_key) . '&nbsp;');
                } else {
                  echo wp_kses_post(apply_filters('woocommerce_cart_item_name', sprintf('<a href="%s">%s</a>', esc_url($product_permalink), $_product->get_name()), $cart_item, $cart_item_key));
                }
                ?>
              </td>

              <td class="product-price" data-title="<?php esc_attr_e('Price', 'woocommerce'); ?>">
                <?php echo apply_filters('woocommerce_cart_item_price', WC()->cart->get_product_price($_product), $cart_item, $cart_item_key); ?>
              </td>

              <td class="product-quantity" data-title="<?php esc_attr_e('Quantity', 'woocommerce'); ?>">
                <?php
                if ($_product->is_sold_individually()) {
                  $product_quantity = sprintf('1 <input type="hidden" name="cart[%s][qty]" value="1" />', $cart_item_key);
                } else {
                  $product_quantity = woocommerce_quantity_input(
                    array(
                      'input_name'   => "cart[{$cart_item_key}][qty]",
                      'input_value'  => $cart_item['quantity'],
                      'max_value'    => $_product->get_max_purchase_quantity(),
                      'min_value'    => '0',
                      'product_name' => $_product->get_name(),
                    ),
                    $_product,
                    false
                  );
                }
                echo apply_filters('woocommerce_cart_item_quantity', $product_quantity, $cart_item_key, $cart_item);
                ?>
              </td>

              <td class="product-subtotal" data-title="<?php esc_attr_e('Subtotal', 'woocommerce'); ?>">
                <?php echo apply_filters('woocommerce_cart_item_subtotal', WC()->cart->get_product_subtotal($_product, $cart_item['quantity']), $cart_item, $cart_item_key); ?>
              </td>
            </tr>
          <?php }
        endforeach; ?>

        <?php do_action('woocommerce_cart_contents'); ?>

        <tr>
          <td colspan="6" class="actions">
            <?php if (wc_coupons_enabled()) { ?>
              <div class="coupon">
                <label for="coupon_code"><?php esc_html_e('Coupon:', 'woocommerce'); ?></label>
                <input type="text" name="coupon_code" class="input-text" id="coupon_code" value="" placeholder="<?php esc_attr_e('Coupon code', 'woocommerce'); ?>" />
                <button type="submit" class="button" name="apply_coupon" value="<?php esc_attr_e('Apply coupon', 'woocommerce'); ?>"><?php esc_attr_e('Apply coupon', 'woocommerce'); ?></button>
              </div>
            <?php } ?>

            <button type="submit" class="button" name="update_cart" value="<?php esc_attr_e('Update cart', 'woocommerce'); ?>"><?php esc_html_e('Update cart', 'woocommerce'); ?></button>

            <?php do_action('woocommerce_cart_actions'); ?>
            <?php wp_nonce_field('woocommerce-cart', 'woocommerce-cart-nonce'); ?>
          </td>
        </tr>

        <?php do_action('woocommerce_after_cart_contents'); ?>
      </tbody>
    </table>

    <?php do_action('woocommerce_after_cart_table'); ?>
  </form>

  <?php do_action('woocommerce_before_cart_collaterals'); ?>

  <div class="cart-collaterals">
    <?php do_action('woocommerce_cart_collaterals'); ?>
  </div>

  <?php do_action('woocommerce_after_cart'); ?>
</div>

<?php get_footer('shop'); ?>`;
  }

  /**
   * Generates checkout.php template.
   */
  private generateCheckoutTemplate(): string {
    return `<?php
/**
 * Checkout Page
 */

defined('ABSPATH') || exit;

get_header('shop');

?>
<div class="woocommerce-checkout">
  <?php do_action('woocommerce_before_checkout_form', $checkout); ?>

  <form name="checkout" method="post" class="checkout woocommerce-checkout" action="<?php echo esc_url(wc_get_checkout_url()); ?>" enctype="multipart/form-data">
    <?php if ($checkout->get_checkout_fields()) : ?>
      <?php do_action('woocommerce_checkout_before_customer_details'); ?>

      <div class="col2-set" id="customer_details">
        <div class="col-1">
          <?php do_action('woocommerce_checkout_billing'); ?>
        </div>

        <div class="col-2">
          <?php do_action('woocommerce_checkout_shipping'); ?>
        </div>
      </div>

      <?php do_action('woocommerce_checkout_after_customer_details'); ?>
    <?php endif; ?>

    <h3 id="order_review_heading"><?php esc_html_e('Your order', 'woocommerce'); ?></h3>

    <?php do_action('woocommerce_checkout_before_order_review'); ?>

    <div id="order_review" class="woocommerce-checkout-review-order">
      <?php do_action('woocommerce_checkout_order_review'); ?>
    </div>

    <?php do_action('woocommerce_checkout_after_order_review'); ?>
  </form>

  <?php do_action('woocommerce_after_checkout_form', $checkout); ?>
</div>

<?php get_footer('shop'); ?>`;
  }

  /**
   * Generates myaccount.php template.
   */
  private generateMyAccountTemplate(): string {
    return `<?php
/**
 * My Account page
 */

defined('ABSPATH') || exit;

get_header('shop');

?>
<div class="woocommerce-account">
  <?php do_action('woocommerce_before_account_navigation'); ?>
  <?php do_action('woocommerce_before_my_account'); ?>

  <div class="woocommerce-MyAccount-content">
    <?php do_action('woocommerce_account_content'); ?>
  </div>

  <?php do_action('woocommerce_after_my_account'); ?>
</div>

<?php get_footer('shop'); ?>`;
  }

  /**
   * Generates header.php with mini cart support.
   */
  private generateHeaderTemplate(): string {
    const miniCartBlock = this.woocommerceConfig.includeMiniCart
      ? `    <div class="mini-cart">
        <?php woocommerce_mini_cart(); ?>
      </div>`
      : '';

    return `<?php
/**
 * The header for our theme
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
  <?php wp_body_open(); ?>

  <header class="site-header">
    <div class="site-branding">
      <?php if (has_custom_logo()) : ?>
        <?php the_custom_logo(); ?>
      <?php else : ?>
        <h1 class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a></h1>
      <?php endif; ?>
    </div>

    <nav class="main-navigation">
      <?php wp_nav_menu(array('theme_location' => 'primary')); ?>
    </nav>

    ${miniCartBlock}
  </header>

  <main id="main" class="site-main">`;
  }
}