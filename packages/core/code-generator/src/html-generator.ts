import type {
  ComponentClassification,
  HeaderComponent,
  HeroComponent,
  FooterComponent,
  SectionComponent,
  ProductCardComponent,
  ExtractedTokens,
} from '@typefigma/analyzer';
import type { ExtractedContent, TextContent } from '@typefigma/analyzer';

export class HtmlGenerator {
  generateHeader(header: HeaderComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, header.figmaNodeId);

    const logoHtml = header.hasLogo
      ? '<div class="logo"><a href="/"><img src="{{site_logo}}" alt="{{site_name}}" /></a></div>'
      : '';

    const navItems = texts.filter(t => t.role === 'link').slice(0, 5);
    const menuHtml = header.hasMenu
      ? `<nav class="main-nav">
        <ul class="nav-menu">
          ${navItems.length > 0
            ? navItems.map(t => `<li class="menu-item"><a href="#">${this.escapeHtml(t.text)}</a></li>`).join('\n          ')
            : `<li class="menu-item"><a href="#">Home</a></li>
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
<header class="site-header header--${header.type}">
  <div class="container">
    <div class="header-inner" style="display:flex;align-items:center;justify-content:space-between;gap:var(--spacing-8)">
      ${logoHtml}
      ${menuHtml}
      <div class="header-actions" style="display:flex;align-items:center;gap:var(--spacing-4)">
        ${header.hasSearch ? '<button class="search-toggle" aria-label="Search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button>' : ''}
        ${ctaHtml}
        <button class="mobile-menu-toggle" aria-label="Menu">
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

    return `<!-- Hero: ${hero.name} -->
<section class="hero hero--${hero.layout}">
  <div class="container">
    <div class="hero-content" style="max-width:720px;${hero.layout === 'centered' || hero.layout === 'fullwidth' ? 'text-align:center;margin:0 auto;' : ''}">
      <h1 class="hero-title">${heading ? this.escapeHtml(heading.text) : 'Your Main Headline'}</h1>
      ${body.length > 0
        ? body.map(t => `<p class="hero-description">${this.escapeHtml(t.text)}</p>`).join('\n      ')
        : '<p class="hero-description">Your compelling subtext goes here</p>'}
      <div class="hero-actions" style="display:flex;gap:var(--spacing-3);flex-wrap:wrap">
        ${buttons.length > 0
          ? buttons.map((t, i) => `<a href="#" class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'}">${this.escapeHtml(t.text)}</a>`).join('\n        ')
          : `<a href="#" class="btn btn-primary">Get Started</a>
        <a href="#" class="btn btn-outline">Learn More</a>`}
      </div>
    </div>
    ${hero.layout === 'split' ? '<div class="hero-media" style="flex:1"><img src="{{hero_image}}" alt="Hero" style="width:100%;height:auto;border-radius:var(--radius-lg)" /></div>' : ''}
  </div>
  ${hero.hasSlider ? '<div class="hero-slider-controls" style="position:absolute;bottom:var(--spacing-8);left:50%;transform:translateX(-50%);display:flex;gap:var(--spacing-2)"><button class="slider-dot active"></button><button class="slider-dot"></button><button class="slider-dot"></button></div>' : ''}
</section>`;
  }

  generateSection(section: SectionComponent, _tokens?: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, section.figmaNodeId);
    const heading = texts.find(t => t.role === 'heading');
    const body = texts.filter(t => t.role === 'body');
    const buttons = texts.filter(t => t.role === 'button');

    return `<!-- ${section.name} -->
<section class="section section--${section.type}">
  <div class="container">
    <div class="section-header" style="text-align:center;max-width:640px;margin:0 auto var(--spacing-12)">
      <h2 class="section-title">${heading ? this.escapeHtml(heading.text) : section.name}</h2>
      ${body.length > 0
        ? body.map(t => `<p class="section-description">${this.escapeHtml(t.text)}</p>`).join('\n      ')
        : '<p class="section-description">Description for ' + section.name + '</p>'}
    </div>
    <div class="section-content">
      ${buttons.length > 0
        ? buttons.map(t => `<a href="#" class="btn btn-primary">${this.escapeHtml(t.text)}</a>`).join('\n      ')
        : `<!-- ${section.type} content goes here -->`}
    </div>
  </div>
</section>`;
  }

  generateFooter(footer: FooterComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, footer.figmaNodeId);
    const links = texts.filter(t => t.role === 'link');
    const headings = texts.filter(t => t.role === 'heading');
    const buttons = texts.filter(t => t.role === 'button');

    const columns = Array.from({ length: footer.columns }, (_, i) => i + 1);
    const linksPerCol = links.length > 0 ? Math.ceil(links.length / columns.length) : 3;

    return `<!-- Footer: ${footer.name} -->
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid footer-grid--${footer.columns}-cols" style="display:grid;gap:var(--spacing-8);grid-template-columns:repeat(${footer.columns},1fr)">
      ${columns.map((col, i) => {
        const colLinks = links.slice(i * linksPerCol, (i + 1) * linksPerCol);
        const colHeading = headings[i] ? headings[i].text : `Column ${col}`;
        return `
      <div class="footer-column footer-column--${col}">
        <h4 class="footer-heading">${this.escapeHtml(colHeading)}</h4>
        <ul class="footer-links">
          ${colLinks.length > 0
            ? colLinks.map(l => `<li><a href="#">${this.escapeHtml(l.text)}</a></li>`).join('\n          ')
            : `<li><a href="#">Link ${col}.1</a></li>
            <li><a href="#">Link ${col}.2</a></li>
            <li><a href="#">Link ${col}.3</a></li>`}
        </ul>
      </div>`;
      }).join('')}
    </div>
    ${footer.hasSocial ? `<div class="footer-social" style="display:flex;justify-content:center;gap:var(--spacing-4);margin-top:var(--spacing-8)">
      <a href="#" aria-label="Facebook" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:var(--radius-full);background:var(--color-neutral-700);transition:var(--transition-base)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
      <a href="#" aria-label="Twitter" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:var(--radius-full);background:var(--color-neutral-700);transition:var(--transition-base)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
      <a href="#" aria-label="Instagram" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:var(--radius-full);background:var(--color-neutral-700);transition:var(--transition-base)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
      <a href="#" aria-label="LinkedIn" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:var(--radius-full);background:var(--color-neutral-700);transition:var(--transition-base)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
    </div>` : ''}
    ${footer.hasNewsletter ? `<div class="footer-newsletter" style="max-width:480px;margin:var(--spacing-8) auto 0;text-align:center">
      <h4 style="color:white;margin-bottom:var(--spacing-4)">${buttons.find(t => t.role === 'button')?.text || 'Subscribe to our newsletter'}</h4>
      <form class="newsletter-form" style="display:flex;gap:var(--spacing-3)">
        <input type="email" placeholder="Your email" style="flex:1;padding:var(--spacing-3);border-radius:var(--radius-md);border:none" />
        <button type="submit" style="padding:var(--spacing-3) var(--spacing-6);background:var(--color-primary-500);color:white;border:none;border-radius:var(--radius-md);cursor:pointer;font-weight:var(--font-weight-semibold)">Subscribe</button>
      </form>
    </div>` : ''}
    <div class="footer-bottom" style="margin-top:var(--spacing-8);padding-top:var(--spacing-6);border-top:1px solid var(--color-neutral-700);text-align:center;color:var(--color-neutral-500)">
      <p>&copy; ${new Date().getFullYear()} {{site_name}}. All rights reserved.</p>
    </div>
  </div>
</footer>`;
  }

  generateProductCard(card: ProductCardComponent, _tokens: ExtractedTokens, content?: ExtractedContent): string {
    const texts = this.findTextsForNode(content, card.figmaNodeId);
    const title = texts.find(t => t.role === 'heading');
    const prices = texts.filter(t => t.role === 'badge');
    const buttons = texts.filter(t => t.role === 'button');
    const descriptions = texts.filter(t => t.role === 'body');

    return `<!-- Product Card: ${card.name} -->
<article class="product-card" data-product-id="{{product_id}}">
  <div class="product-card__image-wrapper" style="position:relative;aspect-ratio:1/1;overflow:hidden;background:var(--color-neutral-100)">
    <img
      src="{{featured_image}}"
      alt="{{post_title}}"
      class="product-card__image"
      style="width:100%;height:100%;object-fit:cover;transition:transform var(--duration-slow) var(--timing-ease)"
      loading="lazy"
    >
    ${card.structure.productBadge
      ? `<span class="product-card__badge product-card__badge--sale" style="position:absolute;top:var(--spacing-3);right:var(--spacing-3);padding:var(--spacing-1) var(--spacing-2);border-radius:var(--radius-sm);font-size:var(--text-xs);font-weight:var(--font-weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-wider);background:var(--color-sale,#ef4444);color:white">
          ${prices[0]?.text || card.structure.productBadge.text}
        </span>`
      : ''}
    <div class="product-card__actions" style="position:absolute;top:var(--spacing-3);left:var(--spacing-3);display:flex;flex-direction:column;gap:var(--spacing-2);opacity:0;transform:translateX(-10px);transition:var(--transition-base)">
      ${card.structure.wishlistButton ? `<button class="product-card__wishlist" aria-label="Add to wishlist" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:white;border:none;border-radius:var(--radius-full);box-shadow:var(--shadow-sm);cursor:pointer;transition:var(--transition-base)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>` : ''}
      ${card.structure.quickViewButton ? `<button class="product-card__quick-view" aria-label="Quick view" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:white;border:none;border-radius:var(--radius-full);box-shadow:var(--shadow-sm);cursor:pointer;transition:var(--transition-base)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>` : ''}
    </div>
  </div>
  <div class="product-card__content" style="padding:var(--spacing-4);display:flex;flex-direction:column;gap:var(--spacing-2);flex:1">
    ${card.structure.productRating
      ? `<div class="product-card__rating" style="display:flex;align-items:center;gap:var(--spacing-1);font-size:var(--text-sm);color:var(--color-text-secondary)">
        <span class="stars" style="color:var(--color-ecommerce-rating,#f59e0b)">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <span class="product-card__rating-count">({{rating_count}})</span>
      </div>`
      : ''}
    <h3 class="product-card__title" style="font-size:var(--text-lg);font-weight:var(--font-weight-semibold);line-height:var(--leading-tight);margin:0">
      <a href="{{permalink}}" style="color:var(--color-text-primary);text-decoration:none;transition:color var(--duration-fast) var(--timing-ease)">${title ? this.escapeHtml(title.text) : '{{post_title}}'}</a>
    </h3>
    ${card.structure.shortDescription || descriptions.length > 0
      ? `<p class="product-card__excerpt" style="font-size:var(--text-sm);color:var(--color-text-secondary);line-height:var(--leading-relaxed);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
          ${descriptions[0]?.text || '{{short_description}}'}
        </p>`
      : ''}
    <div class="product-card__footer" style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:var(--spacing-3);border-top:1px solid var(--color-border-default)">
      <div class="product-card__price" style="display:flex;align-items:center;gap:var(--spacing-2)">
        <span class="product-card__price-regular" style="font-size:var(--text-xl);font-weight:var(--font-weight-bold);color:var(--color-text-primary)">{{price}}</span>
        ${card.structure.productPrice.format === 'sale' ? '<ins class="product-card__price-sale" style="color:var(--color-ecommerce-sale-price,#ef4444);font-weight:var(--font-weight-bold);margin-left:var(--spacing-1)">{{sale_price}}</ins>' : ''}
      </div>
      <button class="product-card__add-to-cart" style="display:flex;align-items:center;gap:var(--spacing-2);padding:var(--spacing-2) var(--spacing-4);background:var(--color-primary-500);color:white;border:none;border-radius:var(--radius-default);font-weight:var(--font-weight-semibold);cursor:pointer;transition:var(--transition-base)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span>${buttons[0]?.text || '{{add_to_cart_text}}'}</span>
      </button>
    </div>
  </div>
</article>`;
  }

  generatePage(components: ComponentClassification, tokens: ExtractedTokens, content?: ExtractedContent): string {
    const parts: string[] = [
      '<div class="page-wrapper">',
      '  <!-- ===== Page generated by TypeFigma ===== -->',
    ];

    if (components.headers.length > 0) {
      parts.push(this.generateHeader(components.headers[0], tokens, content));
    }

    if (components.heroes.length > 0) {
      parts.push(this.generateHero(components.heroes[0], tokens, content));
    }

    for (const section of components.sections) {
      if (section.confidence > 0.5) {
        parts.push(this.generateSection(section, tokens, content));
      }
    }

    if (components.productCards.length > 0) {
      for (const card of components.productCards) {
        parts.push(this.generateProductCard(card, tokens, content));
      }
    }

    if (components.footers.length > 0) {
      parts.push(this.generateFooter(components.footers[0], tokens, content));
    }

    if (components.newsletters.length > 0) {
      parts.push(this.generateNewsletter(components.newsletters[0]));
    }

    if (components.contactForms.length > 0) {
      parts.push(this.generateContactForm(components.contactForms[0]));
    }

    parts.push('</div>');
    return parts.join('\n\n');
  }

  private generateNewsletter(newsletter: any): string {
    return `<!-- Newsletter -->
<section class="section section--newsletter">
  <div class="container">
    <div class="newsletter-wrapper" style="max-width:480px;margin:0 auto;text-align:center">
      <h2 class="section-title">Stay Updated</h2>
      <p class="section-description" style="margin-bottom:var(--spacing-6)">Subscribe to our newsletter for the latest updates</p>
      <form class="newsletter-form" style="display:flex;gap:var(--spacing-3);max-width:400px;margin:0 auto">
        ${newsletter.hasName ? '<input type="text" placeholder="Your name" style="flex:1;padding:var(--spacing-3);border:1px solid var(--color-border-default);border-radius:var(--radius-md)" />' : ''}
        <input type="email" placeholder="Your email" required style="flex:2;padding:var(--spacing-3);border:1px solid var(--color-border-default);border-radius:var(--radius-md)" />
        <button type="submit" class="btn btn-primary" style="white-space:nowrap">Subscribe</button>
      </form>
      ${newsletter.hasConsentCheckbox ? '<label style="display:flex;align-items:center;gap:var(--spacing-2);margin-top:var(--spacing-3);font-size:var(--text-sm);color:var(--color-text-secondary);justify-content:center"><input type="checkbox" required /> I agree to the privacy policy</label>' : ''}
    </div>
  </div>
</section>`;
  }

  private generateContactForm(form: any): string {
    const fields = form.fields?.inputs || [];
    return `<!-- Contact Form: ${form.name} -->
<section class="section section--contact">
  <div class="container">
    <div class="form-wrapper" style="max-width:600px;margin:0 auto">
      <form class="contact-form">
        <div class="form-row" style="display:grid;gap:var(--spacing-4);${form.layout.columns > 1 ? `grid-template-columns:repeat(${form.layout.columns},1fr)` : ''}">
          ${fields.map((f: any) => `
          <div class="form-group">
            ${f.label ? `<label class="form-label" style="display:block;margin-bottom:var(--spacing-1);font-weight:var(--font-weight-medium)">${f.label}</label>` : ''}
            <input type="${f.type || 'text'}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} style="width:100%;padding:var(--spacing-3);border:1px solid var(--color-border-default);border-radius:var(--radius-md);font-family:var(--font-body);transition:var(--transition-base)" />
          </div>`).join('\n          ')}
        </div>
        ${form.fields?.textareas ? form.fields.textareas.map((ta: any) => `
        <div class="form-group">
          ${ta.label ? `<label class="form-label">${ta.label}</label>` : ''}
          <textarea placeholder="${ta.placeholder || ''}" ${ta.required ? 'required' : ''} rows="${ta.rows || 4}" style="width:100%;padding:var(--spacing-3);border:1px solid var(--color-border-default);border-radius:var(--radius-md);font-family:var(--font-body);resize:vertical;min-height:120px"></textarea>
        </div>`).join('\n        ') : ''}
        <button type="submit" class="btn btn-primary" style="width:100%;padding:var(--spacing-4) var(--spacing-6);margin-top:var(--spacing-4)">${form.submitButton?.text || 'Send Message'}</button>
      </form>
    </div>
  </div>
</section>`;
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
