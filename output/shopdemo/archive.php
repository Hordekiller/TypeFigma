<?php
/**
 * Archive Template
 *
 * @package shopdemo
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container">
        <header class="archive-header">
            <h1 class="archive-title">
                <?php
                if (is_category()) {
                    single_cat_title();
                } elseif (is_tag()) {
                    single_tag_title();
                } elseif (is_author()) {
                    the_archive_title();
                } elseif (is_date()) {
                    the_archive_title();
                } else {
                    the_archive_title();
                }
                ?>
            </h1>
            <?php the_archive_description('<div class="archive-description">', '</div>'); ?>
        </header>

        <?php if (have_posts()) : ?>
            <div class="archive-posts">
                <?php
                while (have_posts()) :
                    the_post();
                    ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class('archive-post'); ?>>
                        <?php if (has_post_thumbnail()) : ?>
                            <a href="<?php the_permalink(); ?>" class="post-thumbnail-link">
                                <?php the_post_thumbnail('medium'); ?>
                            </a>
                        <?php endif; ?>

                        <h2 class="entry-title">
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </h2>

                        <div class="entry-meta">
                            <span><?php echo get_the_date(); ?></span>
                            <span><?php the_author_posts_link(); ?></span>
                        </div>

                        <div class="entry-excerpt">
                            <?php the_excerpt(); ?>
                        </div>

                        <a href="<?php the_permalink(); ?>" class="read-more">
                            <?php esc_html_e('Read More', 'shopdemo'); ?>
                        </a>
                    </article>
                    <?php
                endwhile;
                ?>
            </div>

            <div class="pagination">
                <?php the_posts_pagination(); ?>
            </div>
        <?php else : ?>
            <p><?php esc_html_e('No posts found.', 'shopdemo'); ?></p>
        <?php endif; ?>
    </div>
</main>

<?php
get_sidebar();
get_footer();
