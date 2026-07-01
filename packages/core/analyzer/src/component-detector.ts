import type {
  SceneNode,
  FigmaFile,
} from '@typefigma/figma-client';
import type {
  ComponentClassification,
  ProjectTypeDetection,
  ProjectType,
  HeaderComponent,
  FooterComponent,
  NavigationComponent,
  HeroComponent,
  CTAComponent,
  TestimonialComponent,
  GalleryComponent,
  ProductCardComponent,
  ProductDetailComponent,
  CartComponent,
  CheckoutComponent,
  PostCardComponent,
  PostDetailComponent,
  FormComponent,

  SectionComponent,
  ContainerComponent,
} from './types.js';

export class ComponentDetector {
  detect(file: FigmaFile): {
    projectType: ProjectTypeDetection;
    components: ComponentClassification;
  } {
    const allPages = file.document.children ?? [];
    let allNodes: SceneNode[] = [];

    for (const page of allPages) {
      if (page.children) {
        allNodes = allNodes.concat(page.children);
      }
    }

    const components = this.classifyAll(allNodes);
    const projectType = this.detectProjectType(allNodes, components);

    return { projectType, components };
  }

  private classifyAll(nodes: SceneNode[]): ComponentClassification {
    const all: ComponentClassification = {
      headers: [], footers: [], navigation: [],
      heroes: [], ctaSections: [], testimonials: [], galleries: [],
      productCards: [], productDetails: [], cartComponents: [], checkoutComponents: [],
      postCards: [], postDetail: [], contactForms: [], searchBars: [], newsletters: [],
      sections: [], containers: [], columns: [],
    };

    for (const node of nodes) {
      if (!node.absoluteBoundingBox) continue;
      const name = node.name.toLowerCase();

      // Detect by type & position
      if (this.isHeader(node, name)) {
        all.headers.push(this.buildHeader(node, name));
      }
      if (this.isFooter(node, name)) {
        all.footers.push(this.buildFooter(node, name));
      }
      if (this.isNavigation(node, name)) {
        all.navigation.push(this.buildNavigation(node, name));
      }
      if (this.isHero(node, name)) {
        all.heroes.push(this.buildHero(node, name));
      }
      if (this.isCTA(node, name)) {
        all.ctaSections.push(this.buildCTA(node, name));
      }
      if (this.isTestimonial(node, name)) {
        all.testimonials.push(this.buildTestimonial(node, name));
      }
      if (this.isGallery(node, name)) {
        all.galleries.push(this.buildGallery(node, name));
      }
      if (this.isProductCard(node, name)) {
        all.productCards.push(this.buildProductCard(node, name));
      }
      if (this.isProductDetail(node, name)) {
        all.productDetails.push(this.buildProductDetail(node, name));
      }
      if (this.isCart(node, name)) {
        all.cartComponents.push(this.buildCart(node, name));
      }
      if (this.isCheckout(node, name)) {
        all.checkoutComponents.push(this.buildCheckout(node, name));
      }
      if (this.isPostCard(node, name)) {
        all.postCards.push(this.buildPostCard(node, name));
      }
      if (this.isPostDetail(node, name)) {
        all.postDetail.push(this.buildPostDetail(node, name));
      }
      if (this.isForm(node, name)) {
        const form = this.buildForm(node, name);
        if (form.type === 'search') {
          all.searchBars.push({
            id: form.id, figmaNodeId: form.figmaNodeId,
            type: 'inline', hasDropdown: false, hasCategories: false,
          });
        } else if (form.type === 'newsletter') {
          all.newsletters.push({
            id: form.id, figmaNodeId: form.figmaNodeId,
            hasName: false, hasEmail: true, hasConsentCheckbox: false,
          });
        } else {
          all.contactForms.push(form);
        }
      }
      if (this.isContainer(node, name)) {
        all.containers.push(this.buildContainer(node, name));
      }

      // Everything is a section if it's a frame
      if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        all.sections.push(this.buildSection(node, name));
      }
    }

    return all;
  }

  // ── Detection Helpers ──────────────────────────────────

  private isHeader(_node: SceneNode, name: string): boolean {
    const y = _node.absoluteBoundingBox?.y ?? 0;
    return y < 100 && (/header|nav|menu|navbar|topbar/i.test(name) || name.includes('header'));
  }

  private isFooter(_node: SceneNode, name: string): boolean {
    return /footer|bottom/i.test(name);
  }

  private isNavigation(node: SceneNode, name: string): boolean {
    return /nav|menu/i.test(name) && !this.isHeader(node, name);
  }

  private isHero(node: SceneNode, name: string): boolean {
    const h = node.absoluteBoundingBox?.height ?? 0;
    return h > 300 && (/hero|banner|slider|cover|main|master/i.test(name) || h > 500);
  }

  private isCTA(_node: SceneNode, name: string): boolean {
    return /cta|call.?to.?action|signup|register|get.?started/i.test(name);
  }

  private isTestimonial(_node: SceneNode, name: string): boolean {
    return /testimonial|review|quote|feedback|client.?say/i.test(name);
  }

  private isGallery(_node: SceneNode, name: string): boolean {
    return /gallery|portfolio|works|projects?/i.test(name);
  }

  private isProductCard(node: SceneNode, name: string): boolean {
    const n = name;
    const hasPrice = /price|\$|€|£|تومان/i.test(n);
    const hasAddToCart = /cart|buy|add.?to.?cart|shop/i.test(n);
    const repeated = Boolean(node.children && node.children.length >= 2);
    return /product|card|item/i.test(n) || (repeated && (hasPrice || hasAddToCart));
  }

  private isProductDetail(_node: SceneNode, name: string): boolean {
    return /product.?detail|single.?product|product.?page/i.test(name);
  }

  private isCart(_node: SceneNode, name: string): boolean {
    return /cart|basket|shopping.?bag/i.test(name);
  }

  private isCheckout(_node: SceneNode, name: string): boolean {
    return /checkout|payment|order/i.test(name);
  }

  private isPostCard(_node: SceneNode, name: string): boolean {
    return /post|article|blog|card.*(date|author)/i.test(name);
  }

  private isPostDetail(_node: SceneNode, name: string): boolean {
    return /single.?post|article.?detail|blog.?detail/i.test(name);
  }

  private isForm(_node: SceneNode, name: string): boolean {
    return /form|input|field|contact|newsletter|subscribe|search/i.test(name);
  }

  private isContainer(node: SceneNode, name: string): boolean {
    if (node.type === 'GROUP') return true;
    if (node.layoutMode && node.layoutMode !== 'NONE') return true;
    if (name.includes('container') || name.includes('wrapper')) return true;
    return false;
  }

  // ── Builder Methods ────────────────────────────────────

  private buildHeader(node: SceneNode, name: string): HeaderComponent {
    return {
      id: `header_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      confidence: 0.9,
      type: name.includes('sticky') ? 'sticky' : name.includes('transparent') ? 'transparent' : 'static',
      hasLogo: /logo|brand/i.test(name),
      hasMenu: /menu|nav/i.test(name),
      hasSearch: /search/i.test(name),
      hasCTA: /cta|button/i.test(name),
      layout: {
        alignment: 'space-between',
        height: `${node.absoluteBoundingBox?.height ?? 80}px`,
        padding: { top: '16px', right: '40px', bottom: '16px', left: '40px' },
      },
    };
  }

  private buildFooter(node: SceneNode, name: string): FooterComponent {
    const cols = name.includes('4-col') ? 4 : name.includes('3-col') ? 3 : name.includes('2-col') ? 2 : 4;
    return {
      id: `footer_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.85,
      columns: cols,
      hasSocial: /social/i.test(name),
      hasNewsletter: /newsletter|subscribe/i.test(name),
      hasMenu: /menu|link/i.test(name),
    };
  }

  private buildNavigation(node: SceneNode, name: string): NavigationComponent {
    const items = node.children?.length ?? 3;
    return {
      id: `nav_${node.id}`,
      figmaNodeId: node.id,
      type: /mega/i.test(name) ? 'mega-menu' : /vertical|sidebar/i.test(name) ? 'vertical' : 'horizontal',
      items,
      hasDropdown: /dropdown|submenu|mega/i.test(name),
    };
  }

  private buildHero(node: SceneNode, name: string): HeroComponent {
    return {
      id: `hero_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.85,
      layout: name.includes('split') ? 'split' : name.includes('centered') ? 'centered' : 'fullwidth',
      hasVideo: /video|vimeo|youtube/i.test(name),
      hasSlider: /slider|carousel/i.test(name),
      hasOverlay: /overlay|gradient/i.test(name),
      content: {
        hasHeadline: true,
        hasSubtext: true,
        hasButtons: true,
        hasImage: /image|photo|hero.?img/i.test(name),
      },
    };
  }

  private buildCTA(node: SceneNode, name: string): CTAComponent {
    return {
      id: `cta_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.8,
      type: /popup|modal/i.test(name) ? 'popup' : /inline/i.test(name) ? 'inline' : 'section',
      hasButton: true,
      hasImage: /image|photo|bg/i.test(name),
    };
  }

  private buildTestimonial(node: SceneNode, name: string): TestimonialComponent {
    return {
      id: `testimonial_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.8,
      layout: name.includes('grid') ? 'grid' : name.includes('slider') ? 'slider' : 'single',
      hasAvatar: /avatar|photo|face|image/i.test(name),
      hasRating: /rating|star/i.test(name),
      hasCompanyLogo: /logo|company|brand/i.test(name),
    };
  }

  private buildGallery(node: SceneNode, name: string): GalleryComponent {
    const images = node.children?.filter(c => /image|photo|img/i.test(c.name)).length ?? 4;
    return {
      id: `gallery_${node.id}`,
      figmaNodeId: node.id,
      layout: name.includes('masonry') ? 'masonry' : name.includes('slider') ? 'slider' : 'grid',
      imageCount: images,
      hasLightbox: /lightbox|zoom|expand/i.test(name),
      hasFilter: /filter|category|tab/i.test(name),
    };
  }

  private buildProductCard(node: SceneNode, name: string): ProductCardComponent {
    const n = name;
    const childrenText = node.children?.map(c => c.name.toLowerCase()).join(' ') ?? '';
    const allText = n + ' ' + childrenText;

    return {
      id: `product-card_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      confidence: 0.75,
      structure: {
        productImage: {
          nodeId: this.findChildByPattern(node, /image|photo|img/i)?.id ?? `${node.id}_img`,
          aspectRatio: '1 / 1',
          hasBorderRadius: true,
          hasHoverEffect: true,
        },
        productBadge: /sale|new|badge|offer/i.test(allText) ? {
          nodeId: this.findChildByPattern(node, /badge|sale|tag|offer/i)?.id ?? `${node.id}_badge`,
          position: 'top-right',
          text: 'Sale',
        } : undefined,
        productTitle: {
          nodeId: this.findChildByPattern(node, /title|name|heading/i)?.id ?? `${node.id}_title`,
          maxLines: 2,
        },
        productPrice: {
          nodeId: this.findChildByPattern(node, /price|\$|€|£/i)?.id ?? `${node.id}_price`,
          format: /sale|off|discount/i.test(allText) ? 'sale' : 'regular',
          hasCurrency: /\$|€|£|تومان/i.test(allText),
        },
        productRating: /rating|star/i.test(allText) ? {
          nodeId: this.findChildByPattern(node, /rating|star/i)?.id ?? `${node.id}_rating`,
          style: 'stars',
        } : undefined,
        shortDescription: /desc|excerpt|text|p>/i.test(allText) ? {
          nodeId: this.findChildByPattern(node, /desc|excerpt|text/i)?.id ?? `${node.id}_desc`,
          maxLength: 100,
        } : undefined,
        addToCartButton: {
          nodeId: this.findChildByPattern(node, /cart|buy|add/i)?.id ?? `${node.id}_atc`,
          text: 'Add to Cart',
        },
        quickViewButton: /quick.?view|eye/i.test(allText) ? {
          nodeId: this.findChildByPattern(node, /quick.?view|eye/i)?.id ?? `${node.id}_qv`,
        } : undefined,
        wishlistButton: /wishlist|heart|favorite/i.test(allText) ? {
          nodeId: this.findChildByPattern(node, /wishlist|heart/i)?.id ?? `${node.id}_wl`,
          position: { x: 8, y: 8 },
        } : undefined,
        compareButton: /compare/i.test(allText) ? {
          nodeId: this.findChildByPattern(node, /compare/i)?.id ?? `${node.id}_cmp`,
        } : undefined,
      },
      layout: {
        type: 'card',
        alignment: 'left',
        spacing: { top: '12px', right: '12px', bottom: '12px', left: '12px' },
        containerPadding: { top: '16px', right: '16px', bottom: '16px', left: '16px' },
      },
    };
  }

  private buildProductDetail(node: SceneNode, name: string): ProductDetailComponent {
    return {
      id: `product-detail_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.8,
      layout: name.includes('sidebar') ? 'sidebar-right' : 'fullwidth',
      sections: {
        productGallery: {
          nodeId: this.findChildByPattern(node, /gallery|image|photo|slider/i)?.id ?? `${node.id}_gallery`,
          type: 'thumbnails-bottom',
          hasZoom: true,
          hasLightbox: true,
        },
        productMeta: {
          title: { nodeId: `${node.id}_title`, tag: 'h1' },
          price: { nodeId: `${node.id}_price`, showSalePrice: true, showSavings: true },
          rating: { nodeId: `${node.id}_rating`, showCount: true, linkToReviews: true },
          availability: { nodeId: `${node.id}_avail` },
        },
        shortDescription: { nodeId: `${node.id}_shortdesc` },
        addToCart: {
          quantitySelector: { nodeId: `${node.id}_qty`, style: 'stepper' },
          addToCartButton: { nodeId: `${node.id}_atc`, text: 'Add to Cart' },
        },
        productActions: {},
        productTabs: {
          nodeId: `${node.id}_tabs`,
          type: 'tabs',
          hasDescription: true,
          hasAdditionalInfo: true,
          hasReviews: true,
        },
        relatedProducts: { nodeId: `${node.id}_related`, count: 4, columns: 4 },
      },
    };
  }

  private buildCart(node: SceneNode, name: string): CartComponent {
    return {
      id: `cart_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.7,
      type: name.includes('mini') || name.includes('slide') ? 'mini-cart' : 'full-cart',
      hasQuantityControl: true,
      hasRemoveButton: true,
      hasCouponInput: /coupon|code|discount/i.test(name),
      hasProceedToCheckout: true,
    };
  }

  private buildCheckout(node: SceneNode, name: string): CheckoutComponent {
    return {
      id: `checkout_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.7,
      layout: name.includes('two') || name.includes('2') ? 'two-column' : 'single-column',
      hasBillingForm: true,
      hasShippingForm: /ship/i.test(name),
      hasOrderSummary: true,
      hasPaymentMethods: true,
    };
  }

  private buildPostCard(node: SceneNode, name: string): PostCardComponent {
    return {
      id: `post-card_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.7,
      hasImage: /image|photo|thumbnail/i.test(name),
      hasCategory: /category|tag|label/i.test(name),
      hasDate: /date|time|calendar/i.test(name),
      hasAuthor: /author|by/i.test(name),
      hasExcerpt: /excerpt|text|desc/i.test(name),
      hasReadMore: /read.?more|continue/i.test(name),
      layout: name.includes('horizontal') ? 'horizontal' : 'vertical',
    };
  }

  private buildPostDetail(node: SceneNode, name: string): PostDetailComponent {
    return {
      id: `post-detail_${node.id}`,
      figmaNodeId: node.id,
      confidence: 0.7,
      hasFeaturedImage: true,
      hasAuthorBio: /author|bio|about/i.test(name),
      hasRelatedPosts: /related|similar/i.test(name),
      hasComments: /comment|reply/i.test(name),
      hasShareButtons: /share|social/i.test(name),
    };
  }

  private buildForm(node: SceneNode, name: string): FormComponent {
    const inputs = (node.children ?? []).filter(c => /input|field|text/i.test(c.name));
    const textareas = (node.children ?? []).filter(c => /textarea|message|comment/i.test(c.name));

    const getInputs = () => inputs.map(c => ({
      nodeId: c.id,
      placeholder: '',
      type: 'text' as const,
      required: true,
    }));

    const getTextareas = () => textareas.map(c => ({
      nodeId: c.id,
      placeholder: '',
      rows: 5,
      required: false,
    }));

    return {
      id: `form_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      confidence: 0.8,
      type: /newsletter|subscribe/i.test(name) ? 'newsletter' :
            /login|sign.?in/i.test(name) ? 'login' :
            /register|sign.?up/i.test(name) ? 'register' :
            /search/i.test(name) ? 'search' : 'contact',
      fields: {
        inputs: getInputs().length > 0 ? getInputs() : undefined,
        textareas: getTextareas().length > 0 ? getTextareas() : undefined,
      },
      submitButton: {
        nodeId: `${node.id}_submit`,
        text: 'Submit',
      },
      layout: {
        columns: 1,
        fieldSpacing: 16,
        labelPosition: 'top',
      },
    };
  }

  private buildContainer(node: SceneNode, _name: string): ContainerComponent {
    return {
      id: `container_${node.id}`,
      figmaNodeId: node.id,
      type: node.layoutMode === 'HORIZONTAL' ? 'flex' : node.layoutMode === 'VERTICAL' ? 'flex' : 'single',
      direction: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
      gap: node.itemSpacing ? `${node.itemSpacing}px` : undefined,
    };
  }

  private buildSection(node: SceneNode, name: string): SectionComponent {
    return {
      id: `section_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      type: this.detectSectionType(name),
      confidence: 0.6,
      layout: {
        fullWidth: !name.includes('container'),
        hasContainer: true,
        padding: {
          top: node.paddingTop ? `${node.paddingTop}px` : '0',
          right: node.paddingRight ? `${node.paddingRight}px` : '0',
          bottom: node.paddingBottom ? `${node.paddingBottom}px` : '0',
          left: node.paddingLeft ? `${node.paddingLeft}px` : '0',
        },
      },
    };
  }

  private detectSectionType(name: string): string {
    const types = [
      'about', 'services', 'features', 'testimonials', 'team', 'pricing',
      'faq', 'contact', 'blog', 'gallery', 'portfolio', 'stats', 'clients',
      'partners', 'hero', 'cta', 'footer', 'products', 'shop',
    ];
    const lower = name.toLowerCase();
    for (const t of types) {
      if (lower.includes(t)) return t;
    }
    return 'generic';
  }

  private findChildByPattern(node: SceneNode, pattern: RegExp): SceneNode | undefined {
    return node.children?.find(c => pattern.test(c.name));
  }

  detectProjectType(nodes: SceneNode[], components: ComponentClassification): ProjectTypeDetection {
    const names = nodes.map(n => n.name.toLowerCase()).join(' ');
    const allNames = names;

    const hasProductCards = components.productCards.length > 0 || /product|shop/i.test(allNames);
    const hasAddToCart = /add.?to.?cart|buy|cart/i.test(allNames);
    const hasCheckout = /checkout|payment/i.test(allNames);
    const hasWishlist = /wishlist|favorite|heart/i.test(allNames);
    const hasProductGallery = /gallery|image|photo/i.test(allNames) && hasProductCards;
    const hasReviews = /review|rating|star/i.test(allNames);
    const hasPricing = /pricing|plan|price|\$|€/i.test(allNames);
    const hasBlogPosts = components.postCards.length > 0 || /blog|post|article/i.test(allNames);
    const hasPortfolioItems = /portfolio|project|work/i.test(allNames);
    const hasContactForms = components.contactForms.length > 0 || /contact/i.test(allNames);
    const hasTeamSection = /team|member|staff|people/i.test(allNames);
    const hasServicesSection = /service|offer|solution/i.test(allNames);

    let type: ProjectType;
    let confidence = 0;

    if (hasProductCards && hasAddToCart) {
      type = 'ecommerce';
      confidence += 0.4;
      if (hasCheckout) confidence += 0.2;
      if (hasReviews) confidence += 0.1;
      if (hasWishlist) confidence += 0.1;
    } else if (hasServicesSection && hasTeamSection) {
      type = 'corporate';
      confidence += 0.5;
      if (hasContactForms) confidence += 0.2;
    } else if (hasBlogPosts) {
      type = 'blog';
      confidence += 0.5;
      if (hasReviews) confidence += 0.2;
    } else if (hasPortfolioItems) {
      type = 'portfolio';
      confidence += 0.6;
    } else if (hasPricing) {
      type = 'saas';
      confidence += 0.5;
      if (hasContactForms) confidence += 0.2;
    } else {
      type = 'landing';
      confidence += 0.4;
      if (hasContactForms) confidence += 0.2;
    }

    const indicators = {
      hasProductCards, hasAddToCart, hasCheckout, hasWishlist, hasProductGallery,
      hasReviews, hasPricing, hasBlogPosts, hasPortfolioItems, hasContactForms,
      hasTeamSection, hasServicesSection,
    };

    const recommendedPlugins = this.getRecommendedPlugins(type, indicators);

    return {
      type,
      confidence: Math.min(confidence, 0.99),
      indicators,
      recommendedPlugins,
    };
  }

  private getRecommendedPlugins(type: ProjectType, indicators: Partial<ProjectTypeDetection['indicators']>): string[] {
    const plugins: string[] = ['Elementor Pro'];

    if (type === 'ecommerce') {
      plugins.push('WooCommerce');
      if (indicators.hasWishlist) plugins.push('YITH WooCommerce Wishlist');
      if (indicators.hasReviews) plugins.push('YITH WooCommerce Advanced Reviews');
    } else {
      plugins.push('Contact Form 7');
    }

    if (indicators.hasBlogPosts) {
      plugins.push('Elementor Pro Posts Widget');
    }

    return plugins;
  }
}
