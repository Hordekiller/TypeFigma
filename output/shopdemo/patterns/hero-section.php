<?php
/**
 * Title: Hero Section
 * Slug: shopdemo/hero-section
 * Description: Full-width hero section with headline and call to action
 * Categories: hero, call-to-action
 */
?>
<!-- wp:cover {"url":"{{featured_image}}","dimRatio":50,"overlColor":"#000000","minHeight":600,"align":"full","style":{"color":{"background":"#1d4ed8"}}} -->
  <!-- wp:columns -->
    <!-- wp:column -->
      <!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"100px","bottom":"100px"}}}} -->
        <!-- wp:heading {"level":1,"style":{"color":{"text":"#ffffff"}},"fontSize":"48px"} -->
        <h1 class="wp-block-heading">Your Main Headline</h1>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"rgba(255,255,255,0.8)"}},"fontSize":"20px"} -->
        <p>Your compelling subtext goes here</p>
        <!-- /wp:paragraph -->
        <!-- wp:buttons -->
        <!-- wp:button {} -->
        <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#">Get Started</a></div>
        <!-- /wp:button -->
        <!-- /wp:buttons -->
      <!-- /wp:group -->
    <!-- /wp:column -->
  <!-- /wp:columns -->
<!-- /wp:cover -->
