    <footer id="colophon" class="site-footer">
        <div class="container">
            <div class="footer-widgets">
                <?php
                for ($i = 1; $i <= 4; $i++) {
                    if (is_active_sidebar("footer-{$i}")) {
                        dynamic_sidebar("footer-{$i}");
                    }
                }
                ?>
            </div>

            <div class="footer-bottom">
                <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>.
                    <?php esc_html_e('All rights reserved.', 'shopdemo'); ?>
                </p>
            </div>
        </div>
    </footer>
</div>

<?php wp_footer(); ?>
</body>
</html>
