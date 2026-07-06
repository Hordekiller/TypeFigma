import type {
  SceneNode,
  FigmaFile,
} from '@typefigma/figma-client';
import { LayoutEngine, type LayoutCSS } from './layout-engine.js';
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
  ResponsiveBreakpoint,
  InteractionState,
} from './types.js';

interface NodeAnalysis {
  node: SceneNode;
  textCount: number;
  imageCount: number;
  shapeCount: number;
  frameCount: number;
  buttonCount: number;
  inputCount: number;
  linkCount: number;
  iconCount: number;
  totalChildren: number;
  depth: number;
  hasAutoLayout: boolean;
  isHorizontal: boolean;
  isVertical: boolean;
  hasGrid: boolean;
  avgChildWidth: number;
  avgChildHeight: number;
  childTypes: Map<string, number>;
  childNameWords: string[];
  box?: { x: number; y: number; width: number; height: number };
  layoutCss: LayoutCSS;
}

export class ComponentDetector {
  private layoutEngine = new LayoutEngine();

  detect(file: FigmaFile): {
    projectType: ProjectTypeDetection;
    components: ComponentClassification;
  } {
    const allPages = file.document.children ?? [];
    const allNodes: SceneNode[] = [];
    const nodeParentMap = new Map<string, SceneNode | null>();

    for (const page of allPages) {
      if (page.children) {
        for (const child of page.children) {
          allNodes.push(child);
          nodeParentMap.set(child.id, null);
          this.collectDescendants(child, allNodes, nodeParentMap);
        }
      }
    }

    const analyzed = allNodes.map(n => this.analyzeNode(n, nodeParentMap.get(n.id) ?? undefined));
    const components = this.classifyAll(allNodes, analyzed);
    const projectType = this.detectProjectType(allNodes, components);

    components.responsiveBreakpoints = this.detectResponsiveBreakpoints(allNodes, components);
    components.interactionStates = this.detectInteractionStates(allNodes);

    return { projectType, components };
  }

  private collectDescendants(
    node: SceneNode,
    allNodes: SceneNode[],
    parentMap: Map<string, SceneNode | null>,
  ): void {
    if (!node.children) return;
    for (const child of node.children) {
      allNodes.push(child);
      parentMap.set(child.id, node);
      this.collectDescendants(child, allNodes, parentMap);
    }
  }

  private analyzeNode(node: SceneNode, parent?: SceneNode, depth: number = 0): NodeAnalysis {
    const children = node.children ?? [];
    const box = node.absoluteBoundingBox;

    let textCount = 0;
    let imageCount = 0;
    let shapeCount = 0;
    let frameCount = 0;
    let buttonCount = 0;
    let inputCount = 0;
    let linkCount = 0;
    let iconCount = 0;
    const childTypes = new Map<string, number>();
    const childNameWords: string[] = [];

    for (const child of children) {
      childTypes.set(child.type, (childTypes.get(child.type) ?? 0) + 1);

      const name = child.name.toLowerCase();
      childNameWords.push(...name.split(/[\s_-]+/));

      switch (child.type) {
        case 'TEXT': textCount++; break;
        case 'RECTANGLE':
          if (child.fills?.some(f => f.type === 'IMAGE')) imageCount++;
          else if (typeof child.cornerRadius === 'number' && child.cornerRadius > 0) buttonCount++;
          else shapeCount++;
          break;
        case 'ELLIPSE':
        case 'LINE':
        case 'POLYGON':
        case 'STAR':
        case 'REGULAR_POLYGON':
          shapeCount++;
          break;
        case 'VECTOR': iconCount++; break;
        case 'BOOLEAN_OPERATION': shapeCount++; break;
        case 'COMPONENT_SET':
          frameCount++;
          if (name.includes('icon') || name.includes('svg')) iconCount++;
          break;
        case 'MEDIA':
          imageCount++;
          break;
        case 'FRAME':
        case 'COMPONENT':
        case 'INSTANCE':
          frameCount++;
          if (name.includes('button') || name.includes('btn') || name.includes('cta')) buttonCount++;
          if (name.includes('icon') || name.includes('svg')) iconCount++;
          if (name.includes('image') || name.includes('photo') || name.includes('img')) imageCount++;
          if (name.includes('input') || name.includes('field') || name.includes('search')) inputCount++;
          if (name.includes('link') || name.includes('nav')) linkCount++;
          break;
        case 'SECTION': frameCount++; break;
        case 'TABLE': frameCount++; break;
        case 'STICKY':
        case 'SHAPE_WITH_TEXT':
        case 'CONNECTOR':
        case 'WASHI_TAPE':
        case 'EMBED':
        case 'LINK_UNFURL':
          shapeCount++;
          break;
      }
    }

    const avgChildWidth = children.length > 0 && box
      ? children.reduce((s, c) => s + (c.absoluteBoundingBox?.width ?? 0), 0) / children.length
      : 0;
    const avgChildHeight = children.length > 0 && box
      ? children.reduce((s, c) => s + (c.absoluteBoundingBox?.height ?? 0), 0) / children.length
      : 0;

    const layoutCss = this.layoutEngine.computeLayout(node, parent).self;

    const gridInfo = (node.layoutMode === 'NONE' || !node.layoutMode) && node.children && node.children.length >= 4
      ? this.layoutEngine.detectGrid(node)
      : null;

    return {
      node,
      textCount, imageCount, shapeCount, frameCount,
      buttonCount, inputCount, linkCount, iconCount,
      totalChildren: children.length,
      depth,
      hasAutoLayout: node.layoutMode !== undefined && node.layoutMode !== 'NONE',
      isHorizontal: node.layoutMode === 'HORIZONTAL',
      isVertical: node.layoutMode === 'VERTICAL',
      hasGrid: gridInfo !== null && gridInfo.isGrid && gridInfo.confidence >= 0.5,
      avgChildWidth, avgChildHeight,
      childTypes,
      childNameWords,
      box: box ?? undefined,
      layoutCss,
    };
  }

  private classifyAll(nodes: SceneNode[], analyzed: NodeAnalysis[]): ComponentClassification {
    const all: ComponentClassification = {
      headers: [], footers: [], navigation: [],
      heroes: [], ctaSections: [], testimonials: [], galleries: [],
      productCards: [], productDetails: [], cartComponents: [], checkoutComponents: [],
      postCards: [], postDetail: [], contactForms: [], searchBars: [], newsletters: [],
      sections: [], containers: [], columns: [],
    };

    const processedIds = new Set<string>();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const analysis = analyzed[i];
      if (!analysis.box) continue;
      if (processedIds.has(node.id)) continue;

      const name = node.name.toLowerCase();

      const headerCheck = this.detectHeader(node, analysis, name);
      if (headerCheck) { all.headers.push(headerCheck); processedIds.add(node.id); continue; }

      const footerCheck = this.detectFooter(node, analysis, name);
      if (footerCheck) { all.footers.push(footerCheck); processedIds.add(node.id); continue; }

      const navCheck = this.detectNavigation(node, analysis, name);
      if (navCheck) { all.navigation.push(navCheck); processedIds.add(node.id); continue; }

      const heroCheck = this.detectHero(node, analysis, name);
      if (heroCheck) { all.heroes.push(heroCheck); processedIds.add(node.id); continue; }

      const productCardCheck = this.detectProductCard(node, analysis, name);
      if (productCardCheck) { all.productCards.push(productCardCheck); processedIds.add(node.id); continue; }

      const productDetailCheck = this.detectProductDetail(node, analysis, name);
      if (productDetailCheck) { all.productDetails.push(productDetailCheck); processedIds.add(node.id); continue; }

      const ctaCheck = this.detectCTA(node, analysis, name);
      if (ctaCheck) { all.ctaSections.push(ctaCheck); processedIds.add(node.id); continue; }

      const testimonialCheck = this.detectTestimonial(node, analysis, name);
      if (testimonialCheck) { all.testimonials.push(testimonialCheck); processedIds.add(node.id); continue; }

      const galleryCheck = this.detectGallery(node, analysis, name);
      if (galleryCheck) { all.galleries.push(galleryCheck); processedIds.add(node.id); continue; }

      const cartCheck = this.detectCart(node, analysis, name);
      if (cartCheck) { all.cartComponents.push(cartCheck); processedIds.add(node.id); continue; }

      const checkoutCheck = this.detectCheckout(node, analysis, name);
      if (checkoutCheck) { all.checkoutComponents.push(checkoutCheck); processedIds.add(node.id); continue; }

      const postCardCheck = this.detectPostCard(node, analysis, name);
      if (postCardCheck) { all.postCards.push(postCardCheck); processedIds.add(node.id); continue; }

      const postDetailCheck = this.detectPostDetail(node, analysis, name);
      if (postDetailCheck) { all.postDetail.push(postDetailCheck); processedIds.add(node.id); continue; }

      const formCheck = this.detectForm(node, analysis, name);
      if (formCheck) {
        if (formCheck.type === 'search') {
          all.searchBars.push({
            id: formCheck.id, figmaNodeId: formCheck.figmaNodeId,
            type: 'inline', hasDropdown: false, hasCategories: false,
          });
        } else if (formCheck.type === 'newsletter') {
          all.newsletters.push({
            id: formCheck.id, figmaNodeId: formCheck.figmaNodeId,
            hasName: false, hasEmail: true, hasConsentCheckbox: false,
          });
        } else {
          all.contactForms.push(formCheck);
        }
        processedIds.add(node.id);
        continue;
      }

      const containerCheck = this.detectContainer(node, analysis, name);
      if (containerCheck) {
        all.containers.push(containerCheck);
        processedIds.add(node.id);
        continue;
      }

      if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'SECTION') {
        all.sections.push(this.buildSection(node, name, analysis));
        processedIds.add(node.id);
      }
    }

    return all;
  }


  private detectHeader(node: SceneNode, analysis: NodeAnalysis, name: string): HeaderComponent | null {
    const box = analysis.box!;
    const isAtTop = box.y < 100;
    const hasLogo = analysis.childNameWords.some(w => w.includes('logo') || w.includes('brand'));
    const hasNav = analysis.childNameWords.some(w => w.includes('nav') || w.includes('menu'));
    const hasCTA = analysis.childNameWords.some(w => w.includes('cta') || w.includes('button') || w.includes('btn'));
    const hasSearch = analysis.childNameWords.some(w => w.includes('search'));

    const nameMatch = /header|nav|menu|navbar|topbar/i.test(name);
    const structuralMatch = isAtTop && (hasLogo || hasNav || hasSearch);
    const height = box.height;

    if (!nameMatch && !structuralMatch) return null;

    const confidence = nameMatch && structuralMatch ? 0.95
      : nameMatch ? 0.85
      : structuralMatch ? 0.7
      : 0.5;

    return {
      id: `header_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      confidence,
      type: name.includes('sticky') ? 'sticky' : name.includes('transparent') ? 'transparent' : 'static',
      hasLogo, hasMenu: hasNav, hasSearch, hasCTA,
      layout: {
        alignment: analysis.isHorizontal
          ? (analysis.layoutCss.justifyContent === 'center' ? 'center' : 'space-between')
          : 'space-between',
        height: `${height}px`,
        padding: { top: '16px', right: '40px', bottom: '16px', left: '40px' },
      },
    };
  }

  private detectFooter(node: SceneNode, analysis: NodeAnalysis, name: string): FooterComponent | null {
    const box = analysis.box!;
    const isAtBottom = box.y > 500;
    const hasLinks = analysis.childNameWords.some(w => w.includes('link') || w.includes('menu'));
    const hasSocial = analysis.childNameWords.some(w => w.includes('social'));
    const hasNewsletter = analysis.childNameWords.some(w => w.includes('newsletter') || w.includes('subscribe'));
    const hasMultiColumn = analysis.totalChildren >= 2 && analysis.totalChildren <= 6;
    const hasCopyright = analysis.childNameWords.some(w => w.includes('copy') || w.includes('right') || w.includes('©'));

    const nameMatch = /footer|bottom/i.test(name);
    const structuralMatch = (isAtBottom && (hasLinks || hasCopyright || hasMultiColumn)) || hasCopyright;

    if (!nameMatch && !structuralMatch) return null;

    const confidence = nameMatch && structuralMatch ? 0.9
      : nameMatch ? 0.8
      : structuralMatch ? 0.7
      : 0.5;

    const cols = name.includes('4-col') ? 4 : name.includes('3-col') ? 3 : name.includes('2-col') ? 2
      : analysis.totalChildren >= 2 && analysis.totalChildren <= 4 ? analysis.totalChildren : 4;

    return {
      id: `footer_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      confidence,
      columns: cols,
      hasSocial, hasNewsletter,
      hasMenu: hasLinks,
    };
  }

  private detectNavigation(node: SceneNode, analysis: NodeAnalysis, name: string): NavigationComponent | null {
    const hasMultipleItems = analysis.totalChildren >= 2 && analysis.totalChildren <= 12;
    const allTextChildren = analysis.textCount === analysis.totalChildren || analysis.frameCount === analysis.totalChildren;
    const itemsAreSmall = analysis.avgChildWidth < 200 && analysis.avgChildHeight < 60;

    const nameMatch = /nav|menu/i.test(name);
    const structuralMatch = hasMultipleItems && allTextChildren && itemsAreSmall;

    if (!nameMatch && !structuralMatch) return null;

    const isMega = analysis.totalChildren > 6 || /mega/i.test(name);
    const isVertical = node.layoutMode === 'VERTICAL' || /vertical|sidebar/i.test(name);

    return {
      id: `nav_${node.id}`,
      figmaNodeId: node.id,
      type: isMega ? 'mega-menu' : isVertical ? 'vertical' : 'horizontal',
      items: analysis.totalChildren || node.children?.length || 3,
      hasDropdown: /dropdown|submenu|mega/i.test(name),
    };
  }

  private detectHero(node: SceneNode, analysis: NodeAnalysis, name: string): HeroComponent | null {
    const box = analysis.box!;
    const isLarge = box.height > 300;
    const hasBigHeading = analysis.textCount > 0 && analysis.avgChildHeight > 30;
    const hasButtons = analysis.buttonCount > 0;
    const hasImage = analysis.imageCount > 0 || analysis.childNameWords.some(w => w.includes('image') || w.includes('hero'));
    const textToTotal = analysis.totalChildren > 0 ? analysis.textCount / analysis.totalChildren : 0;

    const nameMatch = /hero|banner|slider|cover|main|master/i.test(name);
    const structuralMatch = isLarge && ((hasBigHeading && hasButtons) || (isLarge && box.height > 500));

    if (!nameMatch && !structuralMatch) return null;

    const confidence = nameMatch && box.height > 500 ? 0.95
      : nameMatch ? 0.85
      : structuralMatch && hasButtons ? 0.75
      : 0.6;

    const layout = name.includes('split') ? 'split'
      : name.includes('centered') ? 'centered'
      : (analysis.isHorizontal && analysis.imageCount > 0) ? 'split'
      : 'fullwidth';

    return {
      id: `hero_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      confidence,
      layout,
      hasVideo: /video|vimeo|youtube/i.test(name),
      hasSlider: /slider|carousel/i.test(name) || (analysis.totalChildren > 3 && analysis.imageCount > 1),
      hasOverlay: /overlay|gradient/i.test(name),
      content: {
        hasHeadline: hasBigHeading,
        hasSubtext: textToTotal > 0.3 || analysis.textCount > 1,
        hasButtons,
        hasImage,
      },
    };
  }

  private detectProductCard(node: SceneNode, analysis: NodeAnalysis, name: string): ProductCardComponent | null {
    const box = analysis.box!;
    const isCardSized = box.width > 150 && box.width < 600 && box.height > 200 && box.height < 800;
    const hasImage = analysis.imageCount > 0;
    const hasText = analysis.textCount > 0;
    const hasButton = analysis.buttonCount > 0;
    const hasPrice = analysis.childNameWords.some(w =>
      w.includes('price') || w.includes('$') || w.includes('€') || w.includes('£'));
    const hasRating = analysis.childNameWords.some(w => w.includes('rating') || w.includes('star'));
    const hasAddToCart = analysis.childNameWords.some(w => w.includes('cart') || w.includes('buy') || w.includes('add'));

    const nameMatch = /product|card|item/i.test(name);
    const structuralMatch = isCardSized && hasImage && hasText && (hasPrice || hasAddToCart || hasButton);

    if (!nameMatch && !structuralMatch) return null;
    if (!isCardSized && !nameMatch) return null;

    const confidence = nameMatch && hasPrice && hasImage ? 0.9
      : nameMatch && hasButton ? 0.8
      : structuralMatch ? 0.75
      : nameMatch ? 0.65
      : 0.5;

    const allText = name + ' ' + analysis.childNameWords.join(' ');

    return {
      id: `product-card_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      confidence,
      structure: {
        productImage: {
          nodeId: this.findDescendant(node, /image|photo|img/i)?.id ?? `${node.id}_img`,
          aspectRatio: '1 / 1',
          hasBorderRadius: true,
          hasHoverEffect: true,
        },
        productBadge: /sale|new|badge|offer/i.test(allText) ? {
          nodeId: this.findDescendant(node, /badge|sale|tag|offer/i)?.id ?? `${node.id}_badge`,
          position: 'top-right',
          text: 'Sale',
        } : undefined,
        productTitle: {
          nodeId: this.findDescendant(node, /title|name|heading/i)?.id ?? `${node.id}_title`,
          maxLines: 2,
        },
        productPrice: {
          nodeId: this.findDescendant(node, /price|\$|€|£/i)?.id ?? `${node.id}_price`,
          format: /sale|off|discount/i.test(allText) ? 'sale' : 'regular',
          hasCurrency: /\$|€|£|تومان/i.test(allText),
        },
        productRating: hasRating ? {
          nodeId: this.findDescendant(node, /rating|star/i)?.id ?? `${node.id}_rating`,
          style: 'stars',
        } : undefined,
        shortDescription: analysis.textCount > 2 ? {
          nodeId: this.findDescendant(node, /desc|excerpt|text/i)?.id ?? `${node.id}_desc`,
          maxLength: 100,
        } : undefined,
        addToCartButton: {
          nodeId: this.findDescendant(node, /cart|buy|add/i)?.id ?? `${node.id}_atc`,
          text: 'Add to Cart',
        },
        quickViewButton: /quick.?view|eye/i.test(allText) ? {
          nodeId: this.findDescendant(node, /quick.?view|eye/i)?.id ?? `${node.id}_qv`,
        } : undefined,
        wishlistButton: /wishlist|heart|favorite/i.test(allText) ? {
          nodeId: this.findDescendant(node, /wishlist|heart/i)?.id ?? `${node.id}_wl`,
          position: { x: 8, y: 8 },
        } : undefined,
        compareButton: /compare/i.test(allText) ? {
          nodeId: this.findDescendant(node, /compare/i)?.id ?? `${node.id}_cmp`,
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

  private detectProductDetail(node: SceneNode, analysis: NodeAnalysis, name: string): ProductDetailComponent | null {
    const isLarge = analysis.box ? analysis.box.height > 600 : false;
    const hasGallery = analysis.imageCount >= 2;
    const hasTitle = analysis.childNameWords.some(w => w.includes('title') || w.includes('name'));
    const hasPrice = analysis.childNameWords.some(w => w.includes('price'));
    const hasAddToCart = analysis.buttonCount > 0;

    const nameMatch = /product.?detail|single.?product|product.?page/i.test(name);
    const structuralMatch = isLarge && hasGallery && hasPrice && (hasAddToCart || hasTitle);

    if (!nameMatch && !structuralMatch) return null;

    return {
      id: `product-detail_${node.id}`,
      figmaNodeId: node.id,
      confidence: nameMatch ? 0.85 : 0.7,
      layout: name.includes('sidebar') ? 'sidebar-right' : 'fullwidth',
      sections: {
        productGallery: {
          nodeId: this.findDescendant(node, /gallery|image|photo|slider/i)?.id ?? `${node.id}_gallery`,
          type: 'thumbnails-bottom',
          hasZoom: true, hasLightbox: true,
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
          hasDescription: true, hasAdditionalInfo: true, hasReviews: true,
        },
        relatedProducts: { nodeId: `${node.id}_related`, count: 4, columns: 4 },
      },
    };
  }

  private detectCTA(node: SceneNode, analysis: NodeAnalysis, name: string): CTAComponent | null {
    const hasButton = analysis.buttonCount > 0 || analysis.childNameWords.some(w =>
      w.includes('cta') || w.includes('button') || w.includes('btn') || w.includes('start') || w.includes('signup'));
    const hasHeading = analysis.textCount > 0;
    const isCompact = analysis.box ? analysis.box.height < 300 : false;

    const nameMatch = /cta|call.?to.?action|signup|register|get.?started/i.test(name);
    const structuralMatch = hasButton && hasHeading && isCompact;

    if (!nameMatch && !structuralMatch) return null;

    return {
      id: `cta_${node.id}`,
      figmaNodeId: node.id,
      confidence: nameMatch ? 0.85 : 0.65,
      type: /popup|modal/i.test(name) ? 'popup' : /inline/i.test(name) ? 'inline' : 'section',
      hasButton,
      hasImage: analysis.imageCount > 0,
    };
  }

  private detectTestimonial(node: SceneNode, analysis: NodeAnalysis, name: string): TestimonialComponent | null {
    const hasAvatar = analysis.childNameWords.some(w =>
      w.includes('avatar') || w.includes('face') || w.includes('profile'));
    const hasQuote = analysis.childNameWords.some(w =>
      w.includes('quote') || w.includes('testimonial') || w.includes('review') || w.includes('feedback'));
    const hasRating = analysis.childNameWords.some(w => w.includes('rating') || w.includes('star'));
    const hasText = analysis.textCount > 1;
    const hasName = analysis.childNameWords.some(w => w.includes('name') || w.includes('author'));

    const nameMatch = /testimonial|review|quote|feedback|client.?say/i.test(name);
    const structuralMatch = (hasQuote || (hasAvatar && hasText && hasName));

    if (!nameMatch && !structuralMatch) return null;

    return {
      id: `testimonial_${node.id}`,
      figmaNodeId: node.id,
      confidence: nameMatch && structuralMatch ? 0.9
        : nameMatch ? 0.8
        : structuralMatch ? 0.7
        : 0.5,
      layout: name.includes('grid') ? 'grid' : name.includes('slider') ? 'slider'
        : analysis.totalChildren > 3 ? 'grid' : 'single',
      hasAvatar, hasRating,
      hasCompanyLogo: analysis.childNameWords.some(w => w.includes('logo') || w.includes('company')),
    };
  }

  private detectGallery(node: SceneNode, analysis: NodeAnalysis, name: string): GalleryComponent | null {
    const hasManyChildren = analysis.totalChildren >= 3;
    const hasImages = analysis.imageCount >= 2 || analysis.frameCount >= 3;

    const nameMatch = /gallery|portfolio|works|projects?/i.test(name);
    const structuralMatch = hasManyChildren && hasImages;

    if (!nameMatch && !structuralMatch) return null;

    return {
      id: `gallery_${node.id}`,
      figmaNodeId: node.id,
      layout: name.includes('masonry') ? 'masonry' : name.includes('slider') ? 'slider' : 'grid',
      imageCount: analysis.imageCount || analysis.totalChildren || 4,
      hasLightbox: /lightbox|zoom|expand/i.test(name),
      hasFilter: /filter|category|tab/i.test(name),
    };
  }

  private detectCart(node: SceneNode, analysis: NodeAnalysis, name: string): CartComponent | null {
    const hasItems = analysis.totalChildren >= 2;
    const hasPrices = analysis.childNameWords.some(w => w.includes('price') || w.includes('$'));
    const hasQuantity = analysis.childNameWords.some(w => w.includes('qty') || w.includes('quantity'));
    const hasRemove = analysis.childNameWords.some(w => w.includes('remove') || w.includes('delete') || w.includes('x'));

    const nameMatch = /cart|basket|shopping.?bag/i.test(name);
    const structuralMatch = hasItems && hasPrices && hasQuantity;

    if (!nameMatch && !structuralMatch) return null;

    return {
      id: `cart_${node.id}`,
      figmaNodeId: node.id,
      confidence: nameMatch ? 0.8 : 0.65,
      type: name.includes('mini') || name.includes('slide') ? 'mini-cart' : 'full-cart',
      hasQuantityControl: hasQuantity,
      hasRemoveButton: hasRemove,
      hasCouponInput: /coupon|code|discount/i.test(name),
      hasProceedToCheckout: true,
    };
  }

  private detectCheckout(node: SceneNode, analysis: NodeAnalysis, name: string): CheckoutComponent | null {
    const hasFormFields = analysis.inputCount > 0 || analysis.childNameWords.some(w =>
      w.includes('input') || w.includes('field') || w.includes('form'));
    const hasSummary = analysis.childNameWords.some(w => w.includes('summary') || w.includes('total') || w.includes('order'));
    const hasPayment = analysis.childNameWords.some(w =>
      w.includes('payment') || w.includes('card') || w.includes('paypal'));
    const hasTwoColumn = analysis.totalChildren >= 2 && analysis.isHorizontal;

    const nameMatch = /checkout|payment|order/i.test(name);
    const structuralMatch = hasFormFields && (hasSummary || hasPayment);

    if (!nameMatch && !structuralMatch) return null;

    return {
      id: `checkout_${node.id}`,
      figmaNodeId: node.id,
      confidence: nameMatch ? 0.85 : 0.65,
      layout: hasTwoColumn ? 'two-column' : 'single-column',
      hasBillingForm: hasFormFields,
      hasShippingForm: /ship/i.test(name) || analysis.childNameWords.some(w => w.includes('ship')),
      hasOrderSummary: hasSummary,
      hasPaymentMethods: hasPayment,
    };
  }

  private detectPostCard(node: SceneNode, analysis: NodeAnalysis, name: string): PostCardComponent | null {
    const isCardSized = analysis.box ? (analysis.box.width > 200 && analysis.box.width < 600) : false;
    const hasImage = analysis.imageCount > 0;
    const hasTitle = analysis.childNameWords.some(w => w.includes('title') || w.includes('heading'));
    const hasDate = analysis.childNameWords.some(w => w.includes('date') || w.includes('time'));
    const hasAuthor = analysis.childNameWords.some(w => w.includes('author') || w.includes('by'));
    const hasExcerpt = analysis.textCount > 1;

    const nameMatch = /post|article|blog|card/i.test(name);
    const structuralMatch = isCardSized && hasTitle && (hasImage || hasExcerpt);

    if (!nameMatch && !structuralMatch) return null;

    return {
      id: `post-card_${node.id}`,
      figmaNodeId: node.id,
      confidence: nameMatch && structuralMatch ? 0.85
        : nameMatch ? 0.7 : 0.6,
      hasImage,
      hasCategory: analysis.childNameWords.some(w => w.includes('category') || w.includes('tag')),
      hasDate,
      hasAuthor,
      hasExcerpt,
      hasReadMore: analysis.buttonCount > 0 || analysis.childNameWords.some(w => w.includes('read') || w.includes('more')),
      layout: name.includes('horizontal') || analysis.isHorizontal ? 'horizontal' : 'vertical',
    };
  }

  private detectPostDetail(node: SceneNode, analysis: NodeAnalysis, name: string): PostDetailComponent | null {
    const isLarge = analysis.box ? analysis.box.height > 500 : false;
    const hasTitle = analysis.childNameWords.some(w => w.includes('title'));
    const hasText = analysis.textCount > 2;

    const nameMatch = /single.?post|article.?detail|blog.?detail/i.test(name);
    const structuralMatch = isLarge && hasTitle && hasText;

    if (!nameMatch && !structuralMatch) return null;

    return {
      id: `post-detail_${node.id}`,
      figmaNodeId: node.id,
      confidence: nameMatch ? 0.8 : 0.65,
      hasFeaturedImage: analysis.imageCount > 0,
      hasAuthorBio: /author|bio|about/i.test(name),
      hasRelatedPosts: /related|similar/i.test(name),
      hasComments: /comment|reply/i.test(name) || analysis.childNameWords.some(w => w.includes('comment')),
      hasShareButtons: /share|social/i.test(name),
    };
  }

  private detectForm(node: SceneNode, analysis: NodeAnalysis, name: string): FormComponent | null {
    const hasInputs = analysis.inputCount > 0 || analysis.childNameWords.some(w =>
      w.includes('input') || w.includes('field') || w.includes('form'));
    const hasTextareas = analysis.childNameWords.some(w =>
      w.includes('textarea') || w.includes('message') || w.includes('comment'));
    const hasSubmit = analysis.buttonCount > 0 || analysis.childNameWords.some(w =>
      w.includes('submit') || w.includes('send') || w.includes('subscribe'));

    const nameMatch = /form|input|field|contact|newsletter|subscribe|search/i.test(name);
    const structuralMatch = (hasInputs || hasTextareas) && hasSubmit;

    if (!nameMatch && !structuralMatch) return null;

    const inputs = (node.children ?? []).filter(c => /input|field|text/i.test(c.name));
    const textareas = (node.children ?? []).filter(c => /textarea|message|comment/i.test(c.name));

    return {
      id: `form_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      confidence: nameMatch && structuralMatch ? 0.9
        : structuralMatch ? 0.75 : 0.6,
      type: /newsletter|subscribe/i.test(name) ? 'newsletter'
        : /login|sign.?in/i.test(name) ? 'login'
        : /register|sign.?up/i.test(name) ? 'register'
        : /search/i.test(name) ? 'search' : 'contact',
      fields: {
        inputs: inputs.length > 0 ? inputs.map(c => ({
          nodeId: c.id,
          placeholder: '',
          type: 'text' as const,
          required: true,
        })) : undefined,
        textareas: textareas.length > 0 ? textareas.map(c => ({
          nodeId: c.id,
          placeholder: '',
          rows: 5,
          required: false,
        })) : undefined,
      },
      submitButton: {
        nodeId: `${node.id}_submit`,
        text: 'Submit',
      },
      layout: {
        columns: analysis.isHorizontal && analysis.totalChildren <= 2 ? 2 : 1,
        fieldSpacing: 16,
        labelPosition: 'top',
      },
    };
  }

  private detectContainer(node: SceneNode, analysis: NodeAnalysis, _name: string): ContainerComponent | null {
    if (node.type === 'GROUP') {
      return {
        id: `container_${node.id}`,
        figmaNodeId: node.id,
        type: 'flex',
        direction: 'column',
        gap: undefined,
      };
    }
    if (analysis.hasAutoLayout) {
      return {
        id: `container_${node.id}`,
        figmaNodeId: node.id,
        type: 'flex',
        direction: analysis.isHorizontal ? 'row' : 'column',
        gap: node.itemSpacing != null ? `${node.itemSpacing}px` : undefined,
      };
    }
    return null;
  }

  private buildSection(node: SceneNode, name: string, analysis: NodeAnalysis): SectionComponent {
    return {
      id: `section_${node.id}`,
      figmaNodeId: node.id,
      name: node.name,
      type: this.detectSectionType(name),
      confidence: analysis.hasAutoLayout ? 0.75 : 0.5,
      hasGrid: analysis.hasGrid,
      layout: {
        fullWidth: !name.includes('container'),
        hasContainer: true,
        padding: {
          top: node.paddingTop != null ? `${node.paddingTop}px` : '0',
          right: node.paddingRight != null ? `${node.paddingRight}px` : '0',
          bottom: node.paddingBottom != null ? `${node.paddingBottom}px` : '0',
          left: node.paddingLeft != null ? `${node.paddingLeft}px` : '0',
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

  private findDescendant(node: SceneNode, pattern: RegExp): SceneNode | undefined {
    if (pattern.test(node.name)) return node;
    if (!node.children) return undefined;
    for (const child of node.children) {
      const found = this.findDescendant(child, pattern);
      if (found) return found;
    }
    return undefined;
  }

  detectProjectType(nodes: SceneNode[], components: ComponentClassification): ProjectTypeDetection {
    const allNames = nodes.map(n => n.name.toLowerCase()).join(' ');

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

  private detectResponsiveBreakpoints(nodes: SceneNode[], _components: ComponentClassification): ResponsiveBreakpoint[] {
    const breakpoints: ResponsiveBreakpoint[] = [];
    const groups = new Map<string, SceneNode[]>();

    for (const node of nodes) {
      if (!node.absoluteBoundingBox) continue;
      const name = node.name.replace(/\s*-\s*(desktop|tablet|mobile|phone|sm|md|lg|xl)\s*$/i, '').toLowerCase();
      if (!name) continue;
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push(node);
    }

    for (const [, group] of groups) {
      if (group.length < 2) continue;
      const widths = [...new Set(group.map(n => n.absoluteBoundingBox!.width))];
      if (widths.length < 2) continue;
      widths.sort((a, b) => b - a);
      for (const node of group) {
        const w = node.absoluteBoundingBox!.width;
        const match = node.name.match(/-\s*(desktop|tablet|mobile|phone|sm|md|lg|xl)\s*$/i);
        const label = match ? match[1].toLowerCase() : `${w}px`;
        breakpoints.push({ name: label, width: w, componentId: node.id });
      }
    }

    return breakpoints;
  }

  private detectInteractionStates(nodes: SceneNode[]): InteractionState[] {
    const result: InteractionState[] = [];
    const componentSetIds = new Set<string>();

    for (const node of nodes) {
      if (node.type === 'COMPONENT_SET') {
        const children = node.children ?? [];
        const states: InteractionState['states'] = [];
        for (const child of children) {
          const name = child.name.toLowerCase();
          let stateType: InteractionState['states'][0]['type'] | null = null;
          if (name.includes('hover') || name.includes(':hover')) stateType = 'hover';
          else if (name.includes('active') || name.includes(':active')) stateType = 'active';
          else if (name.includes('disabled') || name.includes(':disabled')) stateType = 'disabled';
          else if (name.includes('focus') || name.includes(':focus')) stateType = 'focus';
          else if (name.includes('selected') || name.includes(':selected')) stateType = 'selected';
          if (stateType) {
            states.push({ type: stateType, variantNodeId: child.id, name: child.name });
          }
        }
        if (states.length > 0) {
          result.push({ figmaNodeId: node.id, componentName: node.name, states });
        }
        continue;
      }

      if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
        if (node.variantProperties) {
          componentSetIds.add(node.id);
        }
      }
    }

    for (const node of nodes) {
      if (node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'INSTANCE') continue;
      const hasInteractiveChildren = (node.children ?? []).some(c => {
        const cn = c.name.toLowerCase();
        return cn.includes('hover') || cn.includes('active') || cn.includes('disabled') || cn.includes('focus');
      });
      if (!hasInteractiveChildren) continue;
      const states: InteractionState['states'] = [];
      for (const child of node.children ?? []) {
        const cn = child.name.toLowerCase();
        if (cn.includes('hover') || cn.includes(':hover')) {
          states.push({ type: 'hover', variantNodeId: child.id, name: child.name });
        } else if (cn.includes('active') || cn.includes(':active')) {
          states.push({ type: 'active', variantNodeId: child.id, name: child.name });
        } else if (cn.includes('disabled') || cn.includes(':disabled')) {
          states.push({ type: 'disabled', variantNodeId: child.id, name: child.name });
        } else if (cn.includes('focus') || cn.includes(':focus')) {
          states.push({ type: 'focus', variantNodeId: child.id, name: child.name });
        } else if (cn.includes('selected') || cn.includes(':selected')) {
          states.push({ type: 'selected', variantNodeId: child.id, name: child.name });
        }
      }
      if (states.length > 0) {
        result.push({ figmaNodeId: node.id, componentName: node.name, states });
      }
    }

    return result;
  }
}
