<?php
/**
 * Custom Elementor Widgets for ShopDemo
 *
 * @package shopdemo
 */

if (!defined('ABSPATH')) exit;

/**
 * Register Custom Elementor Widgets
 */
add_action('elementor/widgets/register', function ($widgets_manager) {
    // Only register if Elementor is active
    if (!class_exists('\\Elementor\\Widget_Base')) return;

    class shopdemo_Product_Card extends \\Elementor\\Widget_Base {
        public function get_name() {
            return 'shopdemo_product_card';
        }

        public function get_title() {
            return esc_html__('Product Card', 'shopdemo');
        }

        public function get_icon() {
            return 'eicon-product-image';
        }

        public function get_categories() {
            return ['shopdemo'];
        }

        protected function register_controls() {
            $this->start_controls_section('content_section', [
                'label' => esc_html__('Product Settings', 'shopdemo'),
                'tab' => \\Elementor\\Controls_Manager::TAB_CONTENT,
            ]);

            $this->add_control('product_id', [
                'label' => esc_html__('Product ID', 'shopdemo'),
                'type' => \\Elementor\\Controls_Manager::NUMBER,
                'placeholder' => 'Auto (current)',
            ]);

            $this->add_control('show_rating', [
                'label' => esc_html__('Show Rating', 'shopdemo'),
                'type' => \\Elementor\\Controls_Manager::SWITCHER,
                'default' => 'yes',
            ]);

            $this->add_control('show_excerpt', [
                'label' => esc_html__('Show Excerpt', 'shopdemo'),
                'type' => \\Elementor\\Controls_Manager::SWITCHER,
                'default' => 'yes',
            ]);

            $this->end_controls_section();
        }

        protected function render() {
            $settings = $this->get_settings_for_display();
            $product_id = $settings['product_id'] ? intval($settings['product_id']) : get_the_ID();
            $product = wc_get_product($product_id);

            if (!$product) {
                echo '<p>' . esc_html__('Product not found.', 'shopdemo') . '</p>';
                return;
            }

            ?>
            <article class="product-card">
                <div class="product-card__image-wrapper">
                    <?php if ($product->is_on_sale()) : ?>
                        <span class="product-card__badge product-card__badge--sale">
                            <?php esc_html_e('Sale!', 'shopdemo'); ?>
                        </span>
                    <?php endif; ?>

                    <a href="<?php echo esc_url(get_permalink($product_id)); ?>">
                        <?php echo $product->get_image('woocommerce_thumbnail'); ?>
                    </a>
                </div>

                <div class="product-card__content">
                    <?php if ('yes' === $settings['show_rating']) : ?>
                        <?php echo wc_get_rating_html($product->get_average_rating()); ?>
                    <?php endif; ?>

                    <h3 class="product-card__title">
                        <a href="<?php echo esc_url(get_permalink($product_id)); ?>">
                            <?php echo esc_html($product->get_name()); ?>
                        </a>
                    </h3>

                    <?php if ('yes' === $settings['show_excerpt'] && $product->get_short_description()) : ?>
                        <p class="product-card__excerpt">
                            <?php echo esc_html(wp_trim_words($product->get_short_description(), 15)); ?>
                        </p>
                    <?php endif; ?>

                    <div class="product-card__footer">
                        <div class="product-card__price">
                            <?php echo $product->get_price_html(); ?>
                        </div>
                        <?php woocommerce_template_loop_add_to_cart(['product_id' => $product_id]); ?>
                    </div>
                </div>
            </article>
            <?php
        }
    }

    $widgets_manager->register(new shopdemo_Product_Card());
});

/**
 * Register Elementor Category
 */
add_action('elementor/elements/categories_registered', function ($elements_manager) {
    $elements_manager->add_category('shopdemo', [
        'title' => esc_html__('ShopDemo', 'shopdemo'),
        'icon' => 'fa fa-plug',
    ]);
});
