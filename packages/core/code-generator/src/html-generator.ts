import type {
  DetectedComponents,
  HeaderInfo,
  HeroInfo,
  FooterInfo,
  SectionInfo,
  ExtractedTokens,
} from '@typefigma/analyzer';

export class HtmlGenerator {
  generateHeader(header: HeaderInfo, tokens: ExtractedTokens): string {
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

  generateHero(hero: HeroInfo, tokens: ExtractedTokens): string {
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

  generateSection(section: SectionInfo): string {
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

  generateFooter(footer: FooterInfo, tokens: ExtractedTokens): string {
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

  generatePage(components: DetectedComponents, tokens: ExtractedTokens): string {
    const parts: string[] = ['<div class="page-wrapper">'];

    if (components.header) parts.push(this.generateHeader(components.header, tokens));
    if (components.hero) parts.push(this.generateHero(components.hero, tokens));
    for (const section of components.sections) {
      parts.push(this.generateSection(section));
    }
    if (components.footer) parts.push(this.generateFooter(components.footer, tokens));

    parts.push('</div>');
    return parts.join('\n\n');
  }
}
