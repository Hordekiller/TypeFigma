<?php
/**
 * Search Results Template
 *
 * @package shopdemo
 */

get_header();
?>

<main id="primary" class="site-main">
    <div class="container">
        <header class="search-header">
            <h1 class="search-title">
                <?php
                printf(
                    esc_html__('Search Results for: %s', 'shopdemo'),
                    '<span>' . get_search_query() . '</span>'
                );
                ?>
            </h1>
        </header>

        <?php if (have_posts()) : ?>
            <div class="search-results">
                <?php
                while (have_posts()) :
                    the_post();
                    ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class('search-result'); ?>>
                        <h2 class="entry-title">
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </h2>

                        <div class="entry-excerpt">
                            <?php the_excerpt(); ?>
                        </div>

                        <div class="entry-meta">
                            <span><?php echo get_the_date(); ?></span>
                            <span><?php the_category(', '); ?></span>
                        </div>
                    </article>
                    <?php
                endwhile;
                ?>
            </div>

            <div class="pagination">
                <?php the_posts_pagination(); ?>
            </div>
        <?php else : ?>
            <div class="no-results">
                <p><?php esc_html_e('No results found for your search.', 'shopdemo'); ?></p>
                <?php get_search_form(); ?>
            </div>
        <?php endif; ?>
    </div>
</main>

<?php
get_sidebar();
get_footer();
