import type {
  ComponentClassification,
  HeaderComponent,
  HeroComponent,
  FooterComponent,
  SectionComponent,
  ProductCardComponent,
  ExtractedTokens,
} from '@typefigma/analyzer';

export class HtmlGenerator {
  generateHeader(header: HeaderComponent, _tokens: ExtractedTokens): string {
    return `<!-- Header -->
<header class="site-header header--${header.type}">
  <div class="container">
    <div class="header-inner">
      ${header.hasLogo ? '<div class="logo"><a href="/"><img src="{{site_logo}}" alt="{{site_name}}" /></a></div>' : ''}
      ${header.hasMenu ? `<nav class="main-nav">
        <ul class="nav-menu">
          <li class="menu-item"><a href="#">Home</a></li>
          <li class="menu-item"><a href="#">About</a></li>
          <li class="menu-item"><a href="#">Services</a></li>
          <li class="menu-item"><a href="#">Contact</a></li>
        </ul>
      </nav>` : ''}
      <div class="header-actions">
        ${header.hasSearch ? '<button class="search-toggle" aria-label="Search"><svg><!-- search icon --></svg></button>' : ''}
        ${header.hasCTA ? '<a href="#" class="btn btn-primary">Get Started</a>' : ''}
        <button class="mobile-menu-toggle" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </div>
</header>`;
  }

  generateHero(hero: HeroComponent, _tokens: ExtractedTokens): string {
    return `<!-- Hero Section -->
<section class="hero hero--${hero.layout}">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">Your Main Headline</h1>
      <p class="hero-description">Your compelling subtext goes here</p>
      <div class="hero-actions">
        <a href="#" class="btn btn-primary">Get Started</a>
        <a href="#" class="btn btn-outline">Learn More</a>
      </div>
    </div>
    ${hero.layout === 'split' ? '<div class="hero-media">{{hero_image}}</div>' : ''}
  </div>
  ${hero.hasSlider ? '<!-- Slider controls -->' : ''}
</section>`;
  }

  generateSection(section: SectionComponent): string {
    const sectionClass = section.type;
    return `<!-- ${section.name} Section -->
<section class="section section--${sectionClass}">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">${section.name}</h2>
      <p class="section-description">Description for ${section.name}</p>
    </div>
    <div class="section-content">
      <!-- ${section.type} content goes here -->
    </div>
  </div>
</section>`;
  }

  generateFooter(footer: FooterComponent, _tokens: ExtractedTokens): string {
    const columns = Array.from({ length: footer.columns }, (_, i) => i + 1);

    return `<!-- Footer -->
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid footer-grid--${footer.columns}-cols">
      ${columns.map(col => `
      <div class="footer-column footer-column--${col}">
        <h4 class="footer-heading">Column ${col}</h4>
        <ul class="footer-links">
          <li><a href="#">Link ${col}.1</a></li>
          <li><a href="#">Link ${col}.2</a></li>
          <li><a href="#">Link ${col}.3</a></li>
        </ul>
      </div>`).join('')}
    </div>
    ${footer.hasSocial ? `<div class="footer-social">
      <a href="#" aria-label="Facebook">FB</a>
      <a href="#" aria-label="Twitter">TW</a>
      <a href="#" aria-label="Instagram">IG</a>
      <a href="#" aria-label="LinkedIn">LN</a>
    </div>` : ''}
    ${footer.hasNewsletter ? `<div class="footer-newsletter">
      <h4>Subscribe to our newsletter</h4>
      <form class="newsletter-form">
        <input type="email" placeholder="Your email" />
        <button type="submit">Subscribe</button>
      </form>
    </div>` : ''}
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} {{site_name}}. All rights reserved.</p>
    </div>
  </div>
</footer>`;
  }

  generateProductCard(card: ProductCardComponent, _tokens: ExtractedTokens): string {
    return `<!-- Product Card -->
<article class="product-card" data-product-id="{{product_id}}">
  <div class="product-card__image-wrapper">
    <img
      src="{{featured_image}}"
      alt="{{post_title}}"
      class="product-card__image"
      loading="lazy"
    >
    ${card.structure.productBadge ? `<span class="product-card__badge product-card__badge--sale">${card.structure.productBadge.text}</span>` : ''}
    <div class="product-card__actions">
      ${card.structure.wishlistButton ? `<button class="product-card__wishlist" aria-label="Add to wishlist">
        <svg class="icon icon-heart"><!-- heart icon --></svg>
      </button>` : ''}
      ${card.structure.quickViewButton ? `<button class="product-card__quick-view" aria-label="Quick view">
        <svg class="icon icon-eye"><!-- eye icon --></svg>
      </button>` : ''}
    </div>
  </div>
  <div class="product-card__content">
    ${card.structure.productRating ? `<div class="product-card__rating">
      <span class="stars">{{rating_stars}}</span>
      <span class="product-card__rating-count">({{rating_count}})</span>
    </div>` : ''}
    <h3 class="product-card__title">
      <a href="{{permalink}}">{{post_title}}</a>
    </h3>
    ${card.structure.shortDescription ? `<p class="product-card__excerpt">{{short_description}}</p>` : ''}
    <div class="product-card__footer">
      <div class="product-card__price">
        <span class="product-card__price-regular">{{price}}</span>
        ${card.structure.productPrice.format === 'sale' ? '<ins class="product-card__price-sale">{{sale_price}}</ins>' : ''}
      </div>
      <button class="product-card__add-to-cart">
        <svg class="icon icon-cart"><!-- cart icon --></svg>
        <span>{{add_to_cart_text}}</span>
      </button>
    </div>
  </div>
</article>`;
  }

  generatePage(components: ComponentClassification, tokens: ExtractedTokens): string {
    const parts: string[] = ['<div class="page-wrapper">'];

    if (components.headers.length > 0) parts.push(this.generateHeader(components.headers[0], tokens));
    if (components.heroes.length > 0) parts.push(this.generateHero(components.heroes[0], tokens));
    for (const section of components.sections) {
      if (section.confidence > 0.5) {
        parts.push(this.generateSection(section));
      }
    }
    for (const card of components.productCards) {
      parts.push(this.generateProductCard(card, tokens));
    }
    if (components.footers.length > 0) parts.push(this.generateFooter(components.footers[0], tokens));

    parts.push('</div>');
    return parts.join('\n\n');
  }
}
