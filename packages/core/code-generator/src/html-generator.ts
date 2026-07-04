import type {
  ComponentClassification,
  HeaderComponent,
  HeroComponent,
  FooterComponent,
  SectionComponent,
  ProductCardComponent,
  NavigationComponent,
  TestimonialComponent,
  GalleryComponent,
  NewsletterComponent,
  FormComponent,
  SearchComponent,
  ProductDetailComponent,
  PostCardComponent,
  CTAComponent,
  CartComponent,
  CheckoutComponent,
  PostDetailComponent,
  ContainerComponent,
  ColumnComponent,
  ExtractedTokens,
  ExtractedContent,
  TextContent,
} from '@typefigma/analyzer';

export interface PageOptions {
  includeHeader?: boolean;
  includeNavigation?: boolean;
  includeHero?: boolean;
  includeSections?: boolean;
  includeTestimonials?: boolean;
  includeGalleries?: boolean;
  includeProductGrid?: boolean;
  includeProductDetails?: boolean;
  includeCTA?: boolean;
  includeCart?: boolean;
  includeCheckout?: boolean;
  includePostDetail?: boolean;
  includeSearch?: boolean;
  includeNewsletter?: boolean;
  includeContactForms?: boolean;
  includeContainers?: boolean;
  includeFooter?: boolean;
}

export class HtmlGenerator {
  generateHeader(header: HeaderComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, header.figmaNodeId);

    const logoHtml = header.hasLogo
      ? '<div class="logo"><a href="/" aria-label="{{site_name}} - Home"><img src="{{site_logo}}" alt="{{site_name}}" width="180" height="40" /></a></div>'
      : '';

    const navItems = texts.filter(t => t.role === 'link').slice(0, 6);
    const menuHtml = header.hasMenu
      ? `<nav class="main-nav" aria-label="Primary Navigation">
        <ul class="nav-menu">
          ${navItems.length > 0
            ? navItems.map(t => `<li class="menu-item"><a href="${t.hyperlink || '#'}">${this.escapeHtml(t.text)}</a></li>`).join('\n          ')
            : `<li class="menu-item current-menu-item"><a href="#">Home</a></li>
            <li class="menu-item"><a href="#">About</a></li>
            <li class="menu-item"><a href="#">Services</a></li>
            <li class="menu-item"><a href="#">Contact</a></li>`}
        </ul>
      </nav>`
      : '';

    const ctaBtn = texts.find(t => t.role === 'button');
    const ctaHtml = header.hasCTA
      ? `<a href="#" class="btn btn-primary">${ctaBtn ? this.escapeHtml(ctaBtn.text) : 'Get Started'}</a>`
      : '';

    return `<!-- Header: ${header.name} -->
<header class="site-header header--${header.type}" role="banner">
  <div class="container">
    <div class="header-inner">
      ${logoHtml}
      ${menuHtml}
      <div class="header-actions">
        ${header.hasSearch ? '<button class="search-toggle" aria-label="Toggle Search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button>' : ''}
        ${ctaHtml}
        <button class="mobile-menu-toggle" aria-label="Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </div>
</header>`;
  }

  generateHero(hero: HeroComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, hero.figmaNodeId);
    const heading = texts.find(t => t.role === 'heading');
    const body = texts.filter(t => t.role === 'body');
    const buttons = texts.filter(t => t.role === 'button');
    const hasImage = hero.content.hasImage || content?.imageNodes?.some(i => i.nodeId === hero.figmaNodeId || i.parentId === hero.figmaNodeId);
    const imageContent = hasImage ? content?.imageNodes?.find(i => i.parentId === hero.figmaNodeId) : undefined;

    const heroClass = `hero hero--${hero.layout}${hero.layout === 'fullwidth' ? ' hero--overlay' : ''}`;

    const imageHtml = hasImage
      ? `<div class="hero-media">
          <img src="${imageContent?.fills?.[0]?.imageRef || '{{hero_image}}'}" alt="" width="600" height="500" loading="lazy" />
        </div>`
      : '';

    const alignmentStyle = hero.layout === 'centered' || hero.layout === 'fullwidth'
      ? 'max-width:720px;text-align:center;margin:0 auto;'
      : '';

    return `<!-- Hero: ${hero.name} -->
<section class="${heroClass}" aria-label="${heading ? this.escapeHtml(heading.text) : 'Hero section'}">
  <div class="container">
    <div class="hero-content" style="${alignmentStyle}">
      <h1 class="hero-title">${heading ? this.escapeHtml(heading.text) : 'Your Main Headline'}</h1>
      ${body.length > 0
        ? body.map(t => `<p class="hero-description">${this.escapeHtml(t.text)}</p>`).join('\n      ')
        : '<p class="hero-description">Your compelling subtext goes here</p>'}
      <div class="hero-actions">
        ${buttons.length > 0
          ? buttons.map((t, i) => `<a href="${t.hyperlink || '#'}" class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'}">${this.escapeHtml(t.text)}</a>`).join('\n        ')
          : `<a href="#" class="btn btn-primary">Get Started</a>
        <a href="#" class="btn btn-outline">Learn More</a>`}
      </div>
    </div>
    ${hero.layout === 'split' ? imageHtml : ''}
  </div>
  ${hero.hasSlider ? `<div class="hero-slider-controls" role="tablist" aria-label="Slider navigation">
    <button class="slider-dot active" role="tab" aria-selected="true" aria-label="Slide 1"></button>
    <button class="slider-dot" role="tab" aria-selected="false" aria-label="Slide 2"></button>
    <button class="slider-dot" role="tab" aria-selected="false" aria-label="Slide 3"></button>
  </div>` : ''}
</section>`;
  }

  generateNavigation(nav: NavigationComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, nav.figmaNodeId);
    const items = texts.filter(t => t.role === 'link');

    return `<!-- Navigation -->
<nav class="main-nav main-nav--${nav.type || 'horizontal'}" aria-label="Navigation">
  <ul class="nav-menu">
    ${items.length > 0
      ? items.map(t => `<li class="menu-item"><a href="${t.hyperlink || '#'}">${this.escapeHtml(t.text)}</a></li>`).join('\n    ')
      : `<li class="menu-item current-menu-item"><a href="#">Home</a></li>
    <li class="menu-item"><a href="#">About</a></li>
    <li class="menu-item"><a href="#">Services</a></li>
    <li class="menu-item"><a href="#">Blog</a></li>
    <li class="menu-item"><a href="#">Contact</a></li>`}
  </ul>
</nav>`;
  }

  generateSection(section: SectionComponent, _tokens?: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, section.figmaNodeId);
    const heading = texts.find(t => t.role === 'heading');
    const body = texts.filter(t => t.role === 'body');
    const buttons = texts.filter(t => t.role === 'button');
    const hasGrid = section.hasGrid;

    return `<!-- ${section.name} -->
<section class="section" aria-label="${this.escapeHtml(section.name)}">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">${heading ? this.escapeHtml(heading.text) : this.escapeHtml(section.name)}</h2>
      ${body.length > 0
        ? body.map(t => `<p class="section-description">${this.escapeHtml(t.text)}</p>`).join('\n      ')
        : '<p class="section-description">Description for ' + this.escapeHtml(section.name) + '</p>'}
    </div>
    <div class="section-content${hasGrid ? ' grid grid--auto-fit' : ''}">
      ${buttons.length > 0
        ? buttons.map(t => `<a href="${t.hyperlink || '#'}" class="btn btn-primary">${this.escapeHtml(t.text)}</a>`).join('\n      ')
        : `<!-- ${section.type} content here -->`}
    </div>
  </div>
</section>`;
  }

  generateFooter(footer: FooterComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, footer.figmaNodeId);
    const links = texts.filter(t => t.role === 'link');
    const headings = texts.filter(t => t.role === 'heading');

    const columns = Array.from({ length: footer.columns }, (_, i) => i + 1);
    const linksPerCol = links.length > 0 ? Math.ceil(links.length / columns.length) : 3;

    return `<!-- Footer: ${footer.name} -->
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid footer-grid--${footer.columns}-cols">
      ${columns.map((col, i) => {
        const colLinks = links.slice(i * linksPerCol, (i + 1) * linksPerCol);
        const colHeading = headings[i] ? headings[i].text : `Column ${col}`;
        return `
      <div class="footer-column">
        <h4 class="footer-heading">${this.escapeHtml(colHeading)}</h4>
        <ul class="footer-links">
          ${colLinks.length > 0
            ? colLinks.map(l => `<li><a href="${l.hyperlink || '#'}">${this.escapeHtml(l.text)}</a></li>`).join('\n          ')
            : `<li><a href="#">Link ${col}.1</a></li>
            <li><a href="#">Link ${col}.2</a></li>
            <li><a href="#">Link ${col}.3</a></li>`}
        </ul>
      </div>`;
      }).join('')}
    </div>
    ${footer.hasSocial ? `<div class="footer-social">
      <a href="#" aria-label="Facebook" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
      <a href="#" aria-label="Twitter" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
      <a href="#" aria-label="Instagram" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
      <a href="#" aria-label="LinkedIn" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
    </div>` : ''}
    ${footer.hasNewsletter ? `<div class="footer-newsletter">
      <form class="newsletter-form" action="#" method="post">
        <label for="footer-email" class="sr-only">Email address</label>
        <input id="footer-email" type="email" placeholder="Your email address" required />
        <button type="submit" class="btn btn-primary">Subscribe</button>
      </form>
    </div>` : ''}
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} <a href="/">{{site_name}}</a>. All rights reserved.</p>
    </div>
  </div>
</footer>`;
  }

  generateProductCard(card: ProductCardComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, card.figmaNodeId);
    const title = texts.find(t => t.role === 'heading');
    const buttons = texts.filter(t => t.role === 'button');
    const descriptions = texts.filter(t => t.role === 'body');

    const badgePosition = card.structure.productBadge?.position === 'top-left' ? 'top-left' : 'top-right';

    return `<!-- Product Card: ${card.name} -->
<article class="product-card product-card--${card.layout.type}" data-product-id="{{product_id}}" itemscope itemtype="https://schema.org/Product">
  <div class="product-card__image-wrapper">
    <img
      src="{{featured_image}}"
      alt="{{post_title}}"
      class="product-card__image"
      loading="lazy"
      itemprop="image"
    >
    ${card.structure.productBadge
      ? `<span class="product-card__badge product-card__badge--${badgePosition} product-card__badge--${card.structure.productBadge.text?.toLowerCase().includes('sale') ? 'sale' : card.structure.productBadge.text?.toLowerCase().includes('new') ? 'new' : 'sale'}" itemprop="badge">
          ${card.structure.productBadge.text || 'Sale'}
        </span>`
      : ''}
    <div class="product-card__actions">
      ${card.structure.wishlistButton ? `<button class="product-card__wishlist" aria-label="Add to wishlist" data-action="wishlist">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>` : ''}
      ${card.structure.quickViewButton ? `<button class="product-card__quick-view" aria-label="Quick view" data-action="quick-view">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>` : ''}
      ${card.structure.compareButton ? `<button class="product-card__compare" aria-label="Compare" data-action="compare">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3h5v5M8 3H3v5"/><path d="M21 3l-7 7M3 3l7 7"/></svg>
      </button>` : ''}
    </div>
  </div>
  <div class="product-card__content" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    ${card.structure.productRating
      ? `<div class="product-card__rating" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
        <span class="stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <span itemprop="ratingValue" class="sr-only">5</span>
        <span itemprop="reviewCount" class="product-card__rating-count">({{rating_count}})</span>
      </div>`
      : ''}
    <h3 class="product-card__title" itemprop="name">
      <a href="{{permalink}}" itemprop="url">${title ? this.escapeHtml(title.text) : '{{post_title}}'}</a>
    </h3>
    ${card.structure.shortDescription || descriptions.length > 0
      ? `<p class="product-card__excerpt" itemprop="description">
          ${descriptions.find(d => d.role === 'body')?.text || '{{short_description}}'}
        </p>`
      : ''}
    <div class="product-card__footer">
      <div class="product-card__price">
        <span class="product-card__price-regular" itemprop="price" content="{{price}}">{{price}}</span>
        ${card.structure.productPrice.format === 'sale' ? '<ins class="product-card__price-sale" itemprop="price" content="{{sale_price}}">{{sale_price}}</ins>' : ''}
      </div>
      <button class="product-card__add-to-cart" aria-label="${buttons[0]?.text || 'Add to cart'}" data-action="add-to-cart">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span>${buttons[0]?.text || '{{add_to_cart_text}}'}</span>
      </button>
    </div>
  </div>
</article>`;
  }

  generateProductDetail(detail: ProductDetailComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, detail.figmaNodeId);
    const title = texts.find(t => t.role === 'heading');
    const body = texts.filter(t => t.role === 'body');
    const buttons = texts.filter(t => t.role === 'button');
    const galleryCount = 4;

    return `<!-- Product Detail -->
<div class="product-detail product-detail--${detail.layout}" itemscope itemtype="https://schema.org/Product">
  <div class="product-detail__gallery">
    ${detail.sections?.productGallery ? `
    <div class="product-gallery">
      <div class="product-gallery__main">
        <img src="{{featured_image}}" alt="{{post_title}}" itemprop="image" />
      </div>
      <div class="product-gallery__thumbnails" role="tablist" aria-label="Product images">
        ${Array.from({ length: Math.min(galleryCount, 4) }, (_, i) =>
          `<button class="product-gallery__thumb${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0}" aria-label="Image ${i + 1}">
            <img src="{{gallery_image_${i + 1}}}" alt="" loading="lazy" />
          </button>`
        ).join('\n        ')}
      </div>
    </div>` : ''}
  </div>

  <div class="product-detail__meta">
    <h1 class="product-title" itemprop="name">${title ? this.escapeHtml(title.text) : '{{post_title}}'}</h1>

    ${detail.sections?.productMeta ? `
    <div class="product-meta-info">
      <div class="product-meta-item">
        <span class="product-meta-label">SKU</span>
        <span itemprop="sku">{{sku}}</span>
      </div>
      <div class="product-meta-item">
        <span class="product-meta-label">Category</span>
        <span itemprop="category">{{category}}</span>
      </div>
      <div class="product-meta-item">
        <span class="product-meta-label">Availability</span>
        <span class="product-meta-value--in-stock" itemprop="availability" href="https://schema.org/InStock">{{availability}}</span>
      </div>
    </div>` : ''}

    <div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
      <span class="price-regular" itemprop="price" content="{{price}}">{{price}}</span>
      ${detail.sections?.productMeta?.price?.showSalePrice ? `
      <span class="price-sale" itemprop="price" content="{{sale_price}}">{{sale_price}}</span>
      <span class="price-savings">Save {{savings}}</span>` : ''}
    </div>

    ${body.length > 0 ? body.map(t => `<p itemprop="description">${this.escapeHtml(t.text)}</p>`).join('\n    ') : ''}

    ${detail.sections?.addToCart ? `
    <div class="product-add-to-cart">
      <div class="product-quantity">
        <label for="quantity" class="sr-only">Quantity</label>
        <div class="product-quantity__input">
          <button type="button" class="qty-btn" aria-label="Decrease quantity">-</button>
          <input id="quantity" type="number" class="qty-input" value="1" min="1" max="99" />
          <button type="button" class="qty-btn" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary btn-add-to-cart">${buttons[0]?.text || 'Add to Cart'}</button>
        <button class="btn btn-secondary btn-buy-now">Buy Now</button>
      </div>
    </div>` : ''}
  </div>
</div>

${detail.sections?.productTabs ? `
<div class="product-tabs-wrapper">
  <div class="product-tabs" role="tablist">
    <button class="product-tab active" role="tab" aria-selected="true">Description</button>
    <button class="product-tab" role="tab" aria-selected="false">Additional Information</button>
    <button class="product-tab" role="tab" aria-selected="false">Reviews ({{review_count}})</button>
  </div>
  <div class="product-tab-panel active" role="tabpanel">
    <p>{{product_description}}</p>
  </div>
</div>` : ''}`;
  }

  generateTestimonials(items: TestimonialComponent[], _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const cards = items.map(t => {
      const texts = this.findTextsForNode(content, t.figmaNodeId);
      const author = texts.find(tx => tx.role === 'heading' || tx.role === 'body');
      const body = texts.filter(tx => tx.role === 'body');

      return `
    <div class="testimonial-card">
      ${t.hasAvatar ? '<img src="{{avatar}}" alt="" class="testimonial-card__avatar" loading="lazy" width="64" height="64" />' : ''}
      ${t.hasRating ? '<div class="stars" aria-label="5 out of 5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' : ''}
      <blockquote class="testimonial-card__text">${body[0]?.text || 'Amazing product! This completely transformed our workflow.'}</blockquote>
      <cite class="testimonial-card__author">${author ? this.escapeHtml(author.text) : 'John Doe'}</cite>
      <span class="testimonial-card__role">CEO, Company</span>
    </div>`;
    }).join('');

    return `<!-- Testimonials -->
<section class="section" aria-label="Testimonials">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">What Our Customers Say</h2>
      <p class="section-description">Testimonials from our valued customers</p>
    </div>
    <div class="grid grid--auto-fit">
      ${cards}
    </div>
  </div>
</section>`;
  }

  generateGallery(gallery: GalleryComponent, _tokens?: ExtractedTokens, _content?: ExtractedContent): string {
    const imageCount = gallery.imageCount || 6;

    return `<!-- Gallery -->
<section class="section" aria-label="Gallery">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Gallery</h2>
    </div>
    <div class="gallery-grid">
      ${Array.from({ length: imageCount }, (_, i) => `
      <div class="gallery-item">
        <img src="{{gallery_image_${i + 1}}}" alt="Gallery image ${i + 1}" loading="lazy" />
        <div class="gallery-item__overlay">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  }

  generateNewsletter(_newsletter: NewsletterComponent): string {
    return `<!-- Newsletter -->
<section class="section section--muted" aria-label="Newsletter">
  <div class="container">
    <div class="newsletter-wrapper" style="max-width:480px;margin:0 auto;text-align:center">
      <h2 class="section-title">Stay Updated</h2>
      <p class="section-description" style="margin-bottom:var(--spacing-6)">Subscribe to our newsletter for the latest updates and offers.</p>
      <form class="newsletter-form" action="#" method="post">
        <label for="newsletter-email" class="sr-only">Email address</label>
        <input id="newsletter-email" type="email" placeholder="Your email address" required />
        <button type="submit" class="btn btn-primary" style="white-space:nowrap">Subscribe</button>
      </form>
      <label class="consent-checkbox" style="display:flex;align-items:center;gap:var(--spacing-2);margin-top:var(--spacing-3);font-size:var(--text-sm);color:var(--color-text-secondary);justify-content:center">
        <input type="checkbox" required /> I agree to the privacy policy and terms of service.
      </label>
    </div>
  </div>
</section>`;
  }

  generateContactForm(form: FormComponent): string {
    const fields = form.fields?.inputs || [];
    const textareas = form.fields?.textareas || [];

    return `<!-- Contact Form: ${form.name} -->
<section class="section section--muted" aria-label="Contact form">
  <div class="container">
    <div class="form-wrapper" style="max-width:600px;margin:0 auto">
      <div class="section-header">
        <h2 class="section-title">${form.name || 'Contact Us'}</h2>
        <p class="section-description">Get in touch with us. We'd love to hear from you.</p>
      </div>
      <form class="contact-form" action="#" method="post">
        <div class="form-row" style="display:grid;gap:var(--spacing-4);${form.layout?.columns && form.layout.columns > 1 ? `grid-template-columns:repeat(${form.layout.columns},1fr)` : ''}">
          ${fields.map((f: any) => `
          <div class="form-group">
            ${f.label ? `<label class="form-label" for="field-${f.label?.toLowerCase().replace(/\s+/g, '-') || f.type}">${f.label}</label>` : ''}
            <input id="field-${f.label?.toLowerCase().replace(/\s+/g, '-') || f.type}" type="${f.type || 'text'}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} class="form-control" />
          </div>`).join('\n          ')}
        </div>
        ${textareas.map((ta: any) => `
        <div class="form-group">
          ${ta.label ? `<label class="form-label" for="field-${ta.label?.toLowerCase().replace(/\s+/g, '-')}">${ta.label}</label>` : ''}
          <textarea id="field-${ta.label?.toLowerCase().replace(/\s+/g, '-')}" placeholder="${ta.placeholder || ''}" ${ta.required ? 'required' : ''} class="form-control" rows="${ta.rows || 5}"></textarea>
        </div>`).join('\n        ')}
        <button type="submit" class="btn btn-primary" style="width:100%;padding:var(--spacing-4) var(--spacing-6);margin-top:var(--spacing-4)">${form.submitButton?.text || 'Send Message'}</button>
      </form>
    </div>
  </div>
</section>`;
  }

  generateSearch(_search: SearchComponent): string {
    return `<!-- Search -->
<div class="search-form">
  <form role="search" method="get" action="{{search_url}}">
    <label for="search-input" class="sr-only">Search for:</label>
    <input id="search-input" type="search" placeholder="Search..." value="{{search_query}}" name="s" />
    <button type="submit" aria-label="Search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    </button>
  </form>
</div>`;
  }

  generateCTA(cta: CTAComponent, _tokens?: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, cta.figmaNodeId);
    const heading = texts.find(t => t.role === 'heading');
    const body = texts.filter(t => t.role === 'body');
    const buttons = texts.filter(t => t.role === 'button');

    const ctaClass = `cta cta--${cta.type}`;
    return `<!-- CTA: ${cta.type} -->
<section class="${ctaClass} section section--muted" aria-label="${heading ? this.escapeHtml(heading.text) : 'Call to action'}">
  <div class="container">
    <div class="cta-wrapper" style="text-align:center;max-width:640px;margin:0 auto">
      <h2 class="section-title">${heading ? this.escapeHtml(heading.text) : 'Ready to Get Started?'}</h2>
      ${body.map(t => `<p class="section-description">${this.escapeHtml(t.text)}</p>`).join('\n      ')}
      <div class="cta-actions" style="display:flex;gap:var(--spacing-3);justify-content:center;margin-top:var(--spacing-6)">
        ${buttons.length > 0
          ? buttons.map((t, i) => `<a href="${t.hyperlink || '#'}" class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'}">${this.escapeHtml(t.text)}</a>`).join('\n        ')
          : `<a href="#" class="btn btn-primary">Get Started</a>
        <a href="#" class="btn btn-outline">Learn More</a>`}
      </div>
    </div>
    ${cta.hasImage ? `<div class="cta-image" style="margin-top:var(--spacing-8)">
      <img src="{{cta_image}}" alt="" loading="lazy" />
    </div>` : ''}
  </div>
</section>`;
  }

  generateCart(cart: CartComponent): string {
    const cartClass = `cart cart--${cart.type}`;
    return `<!-- Cart: ${cart.type} -->
<div class="${cartClass}">
  <table class="cart-table">
    <thead>
      <tr>
        <th class="cart-thumbnail">&nbsp;</th>
        <th>Product</th>
        <th>Price</th>
        ${cart.hasQuantityControl ? '<th>Quantity</th>' : ''}
        <th>Subtotal</th>
        ${cart.hasRemoveButton ? '<th>&nbsp;</th>' : ''}
      </tr>
    </thead>
    <tbody>
      <tr class="cart-item">
        <td class="cart-thumbnail"><img src="{{cart_image}}" alt="{{product_name}}" width="80" height="80" /></td>
        <td class="cart-name">{{product_name}}</td>
        <td class="cart-price">{{price}}</td>
        ${cart.hasQuantityControl ? `<td class="cart-quantity">
          <div class="product-quantity__input" style="display:flex;align-items:center;gap:var(--spacing-1)">
            <button type="button" class="qty-btn" aria-label="Decrease">-</button>
            <input type="number" class="qty-input" value="1" min="0" style="width:50px;text-align:center" />
            <button type="button" class="qty-btn" aria-label="Increase">+</button>
          </div>
        </td>` : ''}
        <td class="cart-subtotal">{{subtotal}}</td>
        ${cart.hasRemoveButton ? '<td class="cart-remove"><button class="btn btn-sm" aria-label="Remove item">&times;</button></td>' : ''}
      </tr>
    </tbody>
    <tfoot>
      <tr class="cart-totals">
        <td colspan="${2 + (cart.hasQuantityControl ? 1 : 0) + (cart.hasRemoveButton ? 1 : 0)}" class="cart-coupon">
          ${cart.hasCouponInput ? `<form class="coupon-form" style="display:flex;gap:var(--spacing-2)">
            <label for="coupon-code" class="sr-only">Coupon code</label>
            <input id="coupon-code" type="text" placeholder="Coupon code" class="form-control" style="width:auto" />
            <button type="submit" class="btn btn-outline btn-sm">Apply</button>
          </form>` : ''}
        </td>
        <td class="cart-total"><strong>{{total}}</strong></td>
      </tr>
    </tfoot>
  </table>
  ${cart.hasProceedToCheckout ? `<div class="cart-actions" style="display:flex;justify-content:space-between;margin-top:var(--spacing-4)">
    <a href="#" class="btn btn-outline">Continue Shopping</a>
    <a href="#" class="btn btn-primary">Proceed to Checkout</a>
  </div>` : ''}
</div>`;
  }

  generateCheckout(checkout: CheckoutComponent): string {
    const layoutClass = `checkout checkout--${checkout.layout}`;
    return `<!-- Checkout: ${checkout.layout} -->
<div class="${layoutClass}">
  <div class="checkout-wrapper" style="display:grid;grid-template-columns:${checkout.layout === 'two-column' ? '1.5fr 1fr' : '1fr'};gap:var(--spacing-8);align-items:start">
    <div class="checkout-fields">
      ${checkout.hasBillingForm ? `
      <div class="checkout-section">
        <h3 class="checkout-heading">Billing Details</h3>
        <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-4)">
          <div class="form-group"><label class="form-label">First Name</label><input type="text" class="form-control" required /></div>
          <div class="form-group"><label class="form-label">Last Name</label><input type="text" class="form-control" required /></div>
        </div>
        <div class="form-group"><label class="form-label">Email Address</label><input type="email" class="form-control" required /></div>
        <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-control" /></div>
        <div class="form-group"><label class="form-label">Street Address</label><input type="text" class="form-control" required /></div>
        <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--spacing-4)">
          <div class="form-group"><label class="form-label">City</label><input type="text" class="form-control" required /></div>
          <div class="form-group"><label class="form-label">State</label><input type="text" class="form-control" /></div>
          <div class="form-group"><label class="form-label">ZIP</label><input type="text" class="form-control" required /></div>
        </div>
      </div>` : ''}
      ${checkout.hasShippingForm ? `
      <div class="checkout-section">
        <h3 class="checkout-heading">Shipping Details</h3>
        <label style="display:flex;align-items:center;gap:var(--spacing-2);margin-bottom:var(--spacing-4)">
          <input type="checkbox" checked /> Ship to different address?
        </label>
        <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-4)">
          <div class="form-group"><label class="form-label">First Name</label><input type="text" class="form-control" /></div>
          <div class="form-group"><label class="form-label">Last Name</label><input type="text" class="form-control" /></div>
        </div>
        <div class="form-group"><label class="form-label">Street Address</label><input type="text" class="form-control" /></div>
      </div>` : ''}
      ${checkout.hasPaymentMethods ? `
      <div class="checkout-section">
        <h3 class="checkout-heading">Payment Method</h3>
        <div class="payment-methods" style="display:flex;flex-direction:column;gap:var(--spacing-3)">
          <label class="payment-option" style="display:flex;align-items:center;gap:var(--spacing-3);padding:var(--spacing-3);border:1px solid var(--color-border-default);border-radius:var(--radius-md)">
            <input type="radio" name="payment" value="card" checked />
            <span>Credit / Debit Card</span>
          </label>
          <label class="payment-option" style="display:flex;align-items:center;gap:var(--spacing-3);padding:var(--spacing-3);border:1px solid var(--color-border-default);border-radius:var(--radius-md)">
            <input type="radio" name="payment" value="paypal" />
            <span>PayPal</span>
          </label>
        </div>
      </div>` : ''}
      <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:var(--spacing-6)">Place Order</button>
    </div>
    ${checkout.hasOrderSummary ? `
    <div class="checkout-summary" style="background:var(--color-background-surface);padding:var(--spacing-6);border-radius:var(--radius-lg);position:sticky;top:var(--spacing-4)">
      <h3 class="checkout-heading">Order Summary</h3>
      <div class="order-items" style="display:flex;flex-direction:column;gap:var(--spacing-3);margin:var(--spacing-4) 0">
        <div class="order-item" style="display:flex;justify-content:space-between"><span>{{product_name}} &times; 1</span><span>{{price}}</span></div>
      </div>
      <div class="order-totals" style="border-top:1px solid var(--color-border-default);padding-top:var(--spacing-4);margin-top:var(--spacing-4)">
        <div class="order-total" style="display:flex;justify-content:space-between;font-weight:700;font-size:var(--font-size-lg)"><span>Total</span><span>{{total}}</span></div>
      </div>
    </div>` : ''}
  </div>
</div>`;
  }

  generatePostDetail(detail: PostDetailComponent, _tokens?: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, detail.figmaNodeId);
    const title = texts.find(t => t.role === 'heading');

    return `<!-- Post Detail -->
<article class="post-detail" itemscope itemtype="https://schema.org/Article">
  ${detail.hasFeaturedImage ? `<div class="post-detail__image">
    <img src="{{featured_image}}" alt="${title ? this.escapeHtml(title.text) : '{{post_title}}'}" itemprop="image" loading="lazy" />
  </div>` : ''}
  <div class="post-detail__content">
    <h1 class="post-detail__title" itemprop="headline">${title ? this.escapeHtml(title.text) : '{{post_title}}'}</h1>
    <div class="post-detail__meta" style="display:flex;gap:var(--spacing-4);color:var(--color-text-secondary);font-size:var(--text-sm);margin-bottom:var(--spacing-6)">
      <span class="post-detail__date">{{post_date}}</span>
      <span class="post-detail__author">{{post_author}}</span>
      <span class="post-detail__category">{{category}}</span>
    </div>
    ${detail.hasShareButtons ? `<div class="post-detail__share" style="display:flex;gap:var(--spacing-2);margin-bottom:var(--spacing-6)">
      <span style="font-size:var(--text-sm);color:var(--color-text-secondary)">Share:</span>
      <a href="#" aria-label="Share on Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
      <a href="#" aria-label="Share on Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
      <a href="#" aria-label="Share on LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
    </div>` : ''}
    <div class="post-detail__body" itemprop="articleBody" style="line-height:1.8">
      {{post_content}}
    </div>
    ${detail.hasAuthorBio ? `<div class="post-detail__author-bio" style="display:flex;gap:var(--spacing-4);padding:var(--spacing-6);background:var(--color-background-surface);border-radius:var(--radius-lg);margin-top:var(--spacing-8)">
      <img src="{{author_avatar}}" alt="{{post_author}}" width="64" height="64" style="border-radius:50%;flex-shrink:0" />
      <div>
        <strong>{{post_author}}</strong>
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:var(--spacing-2)">{{author_bio}}</p>
      </div>
    </div>` : ''}
    ${detail.hasRelatedPosts ? `<div class="post-detail__related" style="margin-top:var(--spacing-8)">
      <h3 class="section-title" style="text-align:left">Related Posts</h3>
      <div class="grid grid--auto-fit">
        {{related_posts}}
      </div>
    </div>` : ''}
    ${detail.hasComments ? `<div class="post-detail__comments" style="margin-top:var(--spacing-8)">
      <h3 class="section-title" style="text-align:left">Comments</h3>
      {{comments}}
    </div>` : ''}
  </div>
</article>`;
  }

  generateContainer(container: ContainerComponent): string {
    const dirClass = container.direction === 'column' ? 'flex-col' : '';
    const gapStyle = container.gap ? `style="gap:${container.gap}"` : '';
    return `<!-- Container: ${container.type} -->
<div class="container-component container-component--${container.type} ${dirClass}" ${gapStyle}>
  {{container_content}}
</div>`;
  }

  generatePostCard(card: PostCardComponent, _tokens?: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, card.figmaNodeId);
    const title = texts.find(t => t.role === 'heading');
    const body = texts.filter(t => t.role === 'body');

    return `<!-- Post Card -->
<article class="post-card">
  ${card.hasImage ? `<div class="post-card__image">
    <a href="{{permalink}}"><img src="{{featured_image}}" alt="${title ? this.escapeHtml(title.text) : '{{post_title}}'}" loading="lazy" /></a>
  </div>` : ''}
  <div class="post-card__content">
    ${card.hasCategory ? `<span class="post-card__category">{{category}}</span>` : ''}
    <h3 class="post-card__title"><a href="{{permalink}}">${title ? this.escapeHtml(title.text) : '{{post_title}}'}</a></h3>
    ${card.hasExcerpt ? `<p class="post-card__excerpt">${body[0]?.text || '{{post_excerpt}}'}</p>` : ''}
    <div class="post-card__meta">
      <span class="post-card__date">{{post_date}}</span>
      <span class="post-card__author">{{post_author}}</span>
    </div>
    <a href="{{permalink}}" class="post-card__read-more">Read More</a>
  </div>
</article>`;
  }

  generateProductGrid(cards: ProductCardComponent[], tokens: ExtractedTokens, content?: ExtractedContent): string {
    if (cards.length === 0) return '';
    const items = cards.map(c => this.generateProductCard(c, tokens, content)).join('\n');
    return `<div class="product-grid grid grid--auto-fit" role="list" aria-label="Products">\n${indent(items)}\n</div>`;
  }

  generatePostGrid(cards: PostCardComponent[], tokens?: ExtractedTokens, content?: ExtractedContent): string {
    if (cards.length === 0) return '';
    const items = cards.map(c => this.generatePostCard(c, tokens, content)).join('\n');
    return `<div class="post-grid grid grid--auto-fit" role="list" aria-label="Posts">\n${indent(items)}\n</div>`;
  }

  generatePage(
    components: ComponentClassification,
    tokens: ExtractedTokens,
    content?: ExtractedContent,
    options?: PageOptions,
  ): string {
    const opts: PageOptions = {
      includeHeader: true, includeNavigation: true, includeHero: true,
      includeSections: true, includeTestimonials: true, includeGalleries: true,
      includeProductGrid: true, includeProductDetails: true, includeCTA: true,
      includeCart: true, includeCheckout: true, includePostDetail: true,
      includeSearch: true, includeNewsletter: true, includeContactForms: true,
      includeContainers: true, includeFooter: true,
      ...options,
    };
    const parts: string[] = [
      '<div class="page-wrapper">',
      '  <!-- ===== Page generated by TypeFigma ===== -->',
    ];

    if (opts.includeHeader && components.headers.length > 0) {
      parts.push(this.generateHeader(components.headers[0], tokens, content));
    }

    if (opts.includeNavigation && components.navigation.length > 0) {
      parts.push(this.generateNavigation(components.navigation[0], tokens, content));
    }

    if (opts.includeHero && components.heroes.length > 0) {
      parts.push(this.generateHero(components.heroes[0], tokens, content));
    }

    if (opts.includeSearch && components.searchBars.length > 0) {
      parts.push(this.generateSearch(components.searchBars[0]));
    }

    if (opts.includeSections) {
      for (const section of components.sections) {
        if (section.confidence > 0.5) {
          parts.push(this.generateSection(section, tokens, content));
        }
      }
    }

    if (opts.includeTestimonials && components.testimonials.length > 0) {
      parts.push(this.generateTestimonials(components.testimonials, tokens, content));
    }

    if (opts.includeCTA && components.ctaSections.length > 0) {
      parts.push(this.generateCTA(components.ctaSections[0], tokens, content));
    }

    if (opts.includeGalleries && components.galleries.length > 0) {
      parts.push(this.generateGallery(components.galleries[0], tokens, content));
    }

    if (opts.includeProductGrid && components.productCards.length > 0) {
      parts.push(this.generateProductGrid(components.productCards, tokens, content));
    }

    if (opts.includeProductDetails && components.productDetails.length > 0) {
      for (const detail of components.productDetails) {
        parts.push(this.generateProductDetail(detail, tokens, content));
      }
    }

    if (opts.includeCart && components.cartComponents.length > 0) {
      parts.push(this.generateCart(components.cartComponents[0]));
    }

    if (opts.includeCheckout && components.checkoutComponents.length > 0) {
      parts.push(this.generateCheckout(components.checkoutComponents[0]));
    }

    if (opts.includeNewsletter && components.newsletters.length > 0) {
      parts.push(this.generateNewsletter(components.newsletters[0]));
    }

    if (opts.includeContactForms && components.contactForms.length > 0) {
      parts.push(this.generateContactForm(components.contactForms[0]));
    }

    if (opts.includePostDetail && components.postDetail.length > 0) {
      parts.push(this.generatePostDetail(components.postDetail[0], tokens, content));
    }

    if (opts.includeContainers && components.containers.length > 0) {
      for (const container of components.containers) {
        parts.push(this.generateContainer(container));
      }
    }

    if (opts.includeFooter && components.footers.length > 0) {
      parts.push(this.generateFooter(components.footers[0], tokens, content));
    }

    if (components.postCards.length > 0) {
      parts.push(this.generatePostGrid(components.postCards, tokens, content));
    }

    parts.push('</div>');
    return parts.join('\n\n');
  }

  private findTextsForNode(content: ExtractedContent | undefined, nodeId: string): TextContent[] {
    if (!content) return [];
    const section = content.sectionContent[nodeId];
    if (section) return section.texts;
    return content.textNodes.filter(t => t.parentId === nodeId || t.nodeId === nodeId);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

function indent(text: string, level: number = 1): string {
  const pad = '  '.repeat(level);
  return text.split('\n').map(line => line ? `${pad}${line}` : line).join('\n');
}
