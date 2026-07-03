<?php
/**
 * Single Post Template
 *
 * @package shopdemo
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container">
        <?php
        while (have_posts()) :
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <?php if (has_post_thumbnail()) : ?>
                    <div class="post-thumbnail">
                        <?php the_post_thumbnail('large'); ?>
                    </div>
                <?php endif; ?>

                <header class="entry-header">
                    <h1 class="entry-title"><?php the_title(); ?></h1>
                    <div class="entry-meta">
                        <span class="posted-by"><?php esc_html_e('By', 'shopdemo'); ?> <?php the_author_posts_link(); ?></span>
                        <span class="posted-on"><?php echo get_the_date(); ?></span>
                        <span class="post-categories"><?php the_category(', '); ?></span>
                    </div>
                </header>

                <div class="entry-content">
                    <?php the_content(); ?>
                    <?php
                    wp_link_pages([
                        'before' => '<div class="page-links">' . esc_html__('Pages:', 'shopdemo'),
                        'after'  => '</div>',
                    ]);
                    ?>
                </div>

                <footer class="entry-footer">
                    <?php the_tags('<span class="tags-links">' . esc_html__('Tagged:', 'shopdemo') . ' ', ', ', '</span>'); ?>
                </footer>

                <?php
                if (comments_open() || get_comments_number()) {
                    comments_template();
                }
                ?>
            </article>
            <?php
        endwhile;
        ?>
    </div>
</main>

<?php
get_sidebar();
get_footer();
