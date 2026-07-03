<?php
/**
 * Sidebar Template
 *
 * @package shopdemo
 */

if (!is_active_sidebar('sidebar-1')) {
    return;
}
?>

<aside id="secondary" class="widget-area site-sidebar" role="complementary">
    <?php dynamic_sidebar('sidebar-1'); ?>
</aside>
