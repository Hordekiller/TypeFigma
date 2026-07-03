<?php
/**
 * Title: Product Grid
 * Slug: shopdemo/product-grid
 * Description: Grid of product cards
 * Categories: products, ecommerce
 */
?>
<!-- wp:group {"align":"wide"} -->
  <!-- wp:columns {"isStackedOnMobile":true} -->
    <!-- wp:column -->
      <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"padding":"16px"},"border":{"radius":"12px","width":"1px","color":"#e5e5e5"},"color":{"background":"#ffffff"}}} -->
        <!-- wp:image {"style":{"border":{"radius":"8px"}},"sizeSlug":"medium"} -->
        <figure class="wp-block-image"><img src="{{featured_image}}" alt="Product Card" /></figure>
        <!-- /wp:image -->
        <!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">Product Card</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"#171717"}},"fontSize":"20px","fontWeight":"700"} -->
        <p>{{price}}</p>
        <!-- /wp:paragraph -->
        <!-- wp:buttons -->
        <!-- wp:button {} -->
        <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#">Add to Cart</a></div>
        <!-- /wp:button -->
        <!-- /wp:buttons -->
      <!-- /wp:group -->
    <!-- /wp:column -->
  <!-- /wp:columns -->
<!-- /wp:group -->
