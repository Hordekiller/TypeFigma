import type {
  SceneNode,
  FigmaFile,
} from '@typefigma/figma-client';
import type {
  DetectedComponents,
  HeaderInfo,
  HeroInfo,
  FooterInfo,
  ProductCardInfo,
  SectionInfo,
  FormInfo,
  ProjectType,
} from './types.js';

export interface DetectionResult {
  projectType: ProjectType;
  confidence: number;
  components: DetectedComponents;
}

export class ComponentDetector {
  detect(file: FigmaFile): DetectionResult {
    const pages = file.document.children ?? [];
    let allNodes: SceneNode[] = [];

    for (const page of pages) {
      if (page.children) {
        allNodes = allNodes.concat(page.children);
      }
    }

    const header = this.detectHeader(allNodes);
    const hero = this.detectHero(allNodes);
    const sections = this.detectSections(allNodes);
    const footer = this.detectFooter(allNodes);
    const productCard = this.detectProductCard(allNodes);
    const forms = this.detectForms(allNodes);
    const projectType = this.detectProjectType(allNodes);

    const components: DetectedComponents = {
      header,
      hero,
      sections,
      footer,
      productCard,
      forms,
    };

    const confidence = this.calculateConfidence(components, projectType);

    return { projectType, confidence, components };
  }

  private detectHeader(nodes: SceneNode[]): HeaderInfo | null {
    for (const node of nodes) {
      const name = node.name.toLowerCase();
      const isTop = node.absoluteBoundingBox && node.absoluteBoundingBox.y < 100;
      const hasNavLike = /header|nav|menu|navbar/i.test(name);

      if (isTop && (hasNavLike || node.type === 'FRAME' || node.type === 'COMPONENT')) {
        const hasLogo = /logo/i.test(name);
        const hasMenu = /menu|nav/i.test(name);
        const hasSearch = /search/i.test(name);
        const hasCTA = /cta|button|sign/i.test(name);

        return {
          type: name.includes('sticky') ? 'sticky' : name.includes('transparent') ? 'transparent' : 'static',
          hasLogo,
          hasMenu: hasMenu || hasNavLike,
          hasSearch,
          hasCTA,
          confidence: 0.9,
          figmaNodeId: node.id,
        };
      }
    }
    return null;
  }

  private detectHero(nodes: SceneNode[]): HeroInfo | null {
    const sorted = [...nodes]
      .filter(n => n.absoluteBoundingBox)
      .sort((a, b) => (b.absoluteBoundingBox?.height ?? 0) - (a.absoluteBoundingBox?.height ?? 0));

    for (const node of sorted) {
      const name = node.name.toLowerCase();
      const isLarge = (node.absoluteBoundingBox?.height ?? 0) > 300;
      const isHero = /hero|banner|slider|cover|main/i.test(name);

      if (isLarge && (isHero || node.type === 'FRAME')) {
        return {
          layout: name.includes('split') ? 'split' : name.includes('centered') ? 'centered' : 'fullwidth',
          hasVideo: /video|vimeo|youtube/i.test(name),
          hasSlider: /slider|carousel/i.test(name),
          confidence: 0.85,
          figmaNodeId: node.id,
        };
      }
    }
    return null;
  }

  private detectSections(nodes: SceneNode[]): SectionInfo[] {
    const sections: SectionInfo[] = [];
    const knownSections = ['about', 'services', 'features', 'testimonials', 'team', 'pricing', 'faq', 'contact', 'blog', 'gallery', 'portfolio', 'stats', 'clients', 'partners'];

    for (const node of nodes) {
      if (!node.absoluteBoundingBox) continue;

      const name = node.name.toLowerCase();
      for (const sectionType of knownSections) {
        if (name.includes(sectionType)) {
          sections.push({
            type: sectionType,
            confidence: 0.8,
            figmaNodeId: node.id,
            name: node.name,
          });
          break;
        }
      }
    }

    return sections;
  }

  private detectFooter(nodes: SceneNode[]): FooterInfo | null {
    const sorted = [...nodes]
      .filter(n => n.absoluteBoundingBox)
      .sort((a, b) => (b.absoluteBoundingBox?.y ?? 0) - (a.absoluteBoundingBox?.y ?? 0));

    for (const node of sorted) {
      const name = node.name.toLowerCase();
      const isFooter = /footer|bottom/i.test(name);

      if (isFooter || (node.absoluteBoundingBox && node.absoluteBoundingBox.y > 1000)) {
        const hasSocial = /social/i.test(name);
        const hasNewsletter = /newsletter|subscribe/i.test(name);

        return {
          columns: name.includes('4-col') ? 4 : name.includes('3-col') ? 3 : name.includes('2-col') ? 2 : 4,
          hasSocial,
          hasNewsletter,
          confidence: 0.85,
          figmaNodeId: node.id,
        };
      }
    }
    return null;
  }

  private detectProductCard(nodes: SceneNode[]): ProductCardInfo | null {
    for (const node of nodes) {
      const name = node.name.toLowerCase();
      const isProduct = /product|card|item|shop/i.test(name);
      const isRepeated = this.hasRepeatedChildren(node);

      if (isProduct && isRepeated) {
        return {
          hasQuickView: /quick.?view/i.test(name),
          hasWishlist: /wishlist|favorite|heart/i.test(name),
          hasRating: /rating|star/i.test(name),
          confidence: 0.75,
          figmaNodeId: node.id,
        };
      }
    }
    return null;
  }

  private detectForms(nodes: SceneNode[]): FormInfo[] {
    const forms: FormInfo[] = [];

    for (const node of nodes) {
      const name = node.name.toLowerCase();
      if (!/form|input|field|newsletter|subscribe|contact/i.test(name)) continue;

      let fieldCount = 0;
      if (node.children) {
        fieldCount = node.children.filter(c =>
          /input|field|textarea|select/i.test(c.name)
        ).length;
      }

      forms.push({
        fields: fieldCount || 1,
        type: /newsletter|subscribe/i.test(name) ? 'newsletter' :
              /search/i.test(name) ? 'search' :
              /login|sign.?in/i.test(name) ? 'login' : 'contact',
        figmaNodeId: node.id,
      });
    }

    return forms;
  }

  private detectProjectType(nodes: SceneNode[]): ProjectType {
    const names = nodes.map(n => n.name.toLowerCase()).join(' ');

    if (/product|shop|cart|buy|price|add.?to.?cart/i.test(names)) {
      return 'shop';
    }
    if (/team|service|about.?us|client/i.test(names)) {
      return 'corporate';
    }
    if (/post|article|blog|author/i.test(names)) {
      return 'blog';
    }
    if (/portfolio|work|project|gallery/i.test(names)) {
      return 'portfolio';
    }

    return 'landing';
  }

  private hasRepeatedChildren(node: SceneNode): boolean {
    if (!node.children || node.children.length < 2) return false;
    return node.children.length >= 3;
  }

  private calculateConfidence(components: DetectedComponents, projectType: ProjectType): number {
    let score = 0;
    if (components.header) score += 0.2;
    if (components.hero) score += 0.2;
    if (components.sections.length > 0) score += 0.15;
    if (components.footer) score += 0.15;

    if (projectType === 'shop' && components.productCard) score += 0.2;
    if (projectType !== 'shop') score += 0.1;

    if (components.forms.length > 0) score += 0.1;
    score += Math.min(components.sections.length * 0.05, 0.1);

    return Math.min(score, 0.99);
  }
}
