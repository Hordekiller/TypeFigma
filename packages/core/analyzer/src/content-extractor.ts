import type { SceneNode, Paint } from '@typefigma/figma-client';

export interface ExtractedContent {
  textNodes: TextContent[];
  imageNodes: ImageContent[];
  sectionContent: Record<string, SectionContent>;
}

export interface TextContent {
  nodeId: string;
  text: string;
  parentId: string;
  parentName: string;
  depth: number;
  role: TextRole;
}

export type TextRole = 'heading' | 'body' | 'caption' | 'label' | 'button' | 'link' | 'badge' | 'unknown';

export interface ImageContent {
  nodeId: string;
  parentId: string;
  parentName: string;
  fills: ImageFill[];
  aspectRatio: number;
}

export interface ImageFill {
  type: string;
  imageRef?: string;
  scaleMode?: string;
}

export interface SectionContent {
  sectionId: string;
  sectionName: string;
  texts: TextContent[];
  images: ImageContent[];
}

export class ContentExtractor {
  extract(nodes: SceneNode[]): ExtractedContent {
    const textNodes: TextContent[] = [];
    const imageNodes: ImageContent[] = [];
    const sectionContent: Record<string, SectionContent> = {};

    const walk = (node: SceneNode, parentId: string, parentName: string, depth: number) => {
      if (node.visible === false) return;

      if (node.type === 'TEXT' && node.characters) {
        const text = node.characters.trim();
        if (text) {
          const entry: TextContent = {
            nodeId: node.id,
            text,
            parentId,
            parentName,
            depth,
            role: this.detectTextRole(node, parentName),
          };
          textNodes.push(entry);

          const sectionKey = this.findSectionKey(sectionContent, parentId, parentName);
          if (sectionKey) {
            sectionContent[sectionKey].texts.push(entry);
          }
        }
      }

      const imageFills = this.getImageFills(node);
      if (imageFills.length > 0) {
        const box = node.absoluteBoundingBox;
        const entry: ImageContent = {
          nodeId: node.id,
          parentId,
          parentName,
          fills: imageFills,
          aspectRatio: box && box.height > 0 ? box.width / box.height : 1,
        };
        imageNodes.push(entry);

        const sectionKey = this.findSectionKey(sectionContent, parentId, parentName);
        if (sectionKey) {
          sectionContent[sectionKey].images.push(entry);
        }
      }

      if (node.type === 'SECTION' || node.type === 'FRAME' || node.type === 'COMPONENT') {
        const key = node.id;
        if (!sectionContent[key]) {
          sectionContent[key] = {
            sectionId: node.id,
            sectionName: node.name,
            texts: [],
            images: [],
          };
        }
      }

      if (node.children) {
        for (const child of node.children) {
          walk(child, node.id, node.name, depth + 1);
        }
      }
    };

    for (const node of nodes) {
      walk(node, node.id, node.name, 0);
    }

    return { textNodes, imageNodes, sectionContent };
  }

  private detectTextRole(node: SceneNode, parentName: string): TextRole {
    const name = node.name.toLowerCase();
    const parent = parentName.toLowerCase();

    if (name.includes('button') || name.includes('btn') || parent.includes('button') || parent.includes('btn')) {
      return 'button';
    }
    if (name.includes('heading') || name.includes('h1') || name.includes('h2') || name.includes('h3') ||
        name.includes('title') || name.includes('headline')) {
      return 'heading';
    }
    if (name.includes('caption') || name.includes('small') || name.includes('footnote')) {
      return 'caption';
    }
    if (name.includes('label') || name.includes('tag')) {
      return 'label';
    }
    if (name.includes('link') || name.includes('nav') || name.includes('menu')) {
      return 'link';
    }
    if (name.includes('badge') || name.includes('sale') || name.includes('discount')) {
      return 'badge';
    }

    if (node.style) {
      const fs = node.style.fontSize || 0;
      const fw = node.style.fontWeight || 400;
      if (fw >= 600 && fs >= 18) return 'heading';
      if (fs <= 12) return 'caption';
    }

    return 'body';
  }

  private getImageFills(node: SceneNode): ImageFill[] {
    if (!node.fills) return [];
    return node.fills
      .filter((f: Paint) => f.type === 'IMAGE' && f.visible !== false)
      .map((f: Paint) => ({
        type: f.type,
        imageRef: f.imageRef,
        scaleMode: f.scaleMode,
      }));
  }

  private findSectionKey(
    sections: Record<string, SectionContent>,
    parentId: string,
    _parentName: string,
  ): string | null {
    if (sections[parentId]) return parentId;
    return null;
  }

  getTextForNode(nodes: SceneNode[], nodeId: string): string | null {
    const walk = (node: SceneNode): string | null => {
      if (node.id === nodeId && node.type === 'TEXT' && node.characters) {
        return node.characters.trim();
      }
      if (node.children) {
        for (const child of node.children) {
          const result = walk(child);
          if (result) return result;
        }
      }
      return null;
    };
    for (const node of nodes) {
      const result = walk(node);
      if (result) return result;
    }
    return null;
  }

  getAllText(nodes: SceneNode[]): Record<string, string> {
    const result: Record<string, string> = {};

    const walk = (node: SceneNode) => {
      if (node.type === 'TEXT' && node.characters) {
        const text = node.characters.trim();
        if (text) {
          result[node.name] = text;
        }
      }
      if (node.children) {
        for (const child of node.children) {
          walk(child);
        }
      }
    };

    for (const node of nodes) {
      walk(node);
    }

    return result;
  }
}
