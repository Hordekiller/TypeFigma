import type { SceneNode } from '@typefigma/figma-client';

export interface LayoutCSS {
  display?: string;
  flexDirection?: string;
  flexWrap?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  aspectRatio?: string;
  overflow?: string;
  flex?: string;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  alignSelf?: string;
  justifySelf?: string;
  objectFit?: string;
  borderRadius?: string;
  opacity?: number;
}

export interface FrameLayout {
  self: LayoutCSS;
  children: LayoutCSS[];
}

export interface ResponsiveVariant {
  breakpoint: string;
  minWidth: number;
  maxWidth?: number;
  self: LayoutCSS;
  children: LayoutCSS[];
}

export interface ResponsiveInfo {
  isResponsive: boolean;
  constraints: ConstraintAnalysis;
  variants: ResponsiveVariant[];
}

export interface ConstraintAnalysis {
  horizontal: 'fixed' | 'stretch' | 'scale' | 'center';
  vertical: 'fixed' | 'stretch' | 'scale' | 'center';
  hasResponsiveIntent: boolean;
}

export interface GridChildPosition {
  nodeId: string;
  col: number;
  row: number;
  columnSpan: number;
  rowSpan: number;
}

export interface GridInfo {
  isGrid: boolean;
  columns: number;
  rows: number;
  templateColumns: string[];
  templateRows: string[];
  gap: { column: number; row: number };
  childPositions: GridChildPosition[];
  confidence: number;
}

export class LayoutEngine {
  computeLayout(node: SceneNode, parent?: SceneNode): FrameLayout {
    const self = this.computeSelfLayout(node, parent);
    const children = this.computeChildrenLayout(node);

    // Try grid inference for absolute-positioned children without auto-layout
    if ((!node.layoutMode || node.layoutMode === 'NONE') && node.children && node.children.length >= 3) {
      const gridInfo = this.detectGrid(node);
      if (gridInfo && gridInfo.isGrid && gridInfo.confidence >= 0.6) {
        self.display = 'grid';
        self.gridTemplateColumns = gridInfo.templateColumns.join(' ');
        self.gridTemplateRows = gridInfo.templateRows.join(' ');
        self.position = undefined;
        if (gridInfo.gap.column > 0 || gridInfo.gap.row > 0) {
          self.gap = gridInfo.gap.row > 0
            ? `${gridInfo.gap.row}px ${gridInfo.gap.column}px`
            : `${gridInfo.gap.column}px`;
        }
        for (const pos of gridInfo.childPositions) {
          const childIndex = node.children?.findIndex(c => c.id === pos.nodeId);
          if (childIndex !== undefined && childIndex >= 0 && childIndex < children.length) {
            const childCSS = children[childIndex];
            childCSS.position = undefined;
            childCSS.left = undefined;
            childCSS.top = undefined;
            childCSS.width = undefined;
            childCSS.height = undefined;
            if (pos.columnSpan > 1) {
              childCSS.gridColumn = `${pos.col + 1} / span ${pos.columnSpan}`;
            } else {
              childCSS.gridColumn = `${pos.col + 1}`;
            }
            if (pos.rowSpan > 1) {
              childCSS.gridRow = `${pos.row + 1} / span ${pos.rowSpan}`;
            } else {
              childCSS.gridRow = `${pos.row + 1}`;
            }
          }
        }
      }
    }

    // Handle Figma's layoutGrids property (column/row grids)
    if (node.layoutGrids && node.layoutGrids.length > 0 && self.display !== 'grid') {
      const layoutGrid = node.layoutGrids[0];
      if (layoutGrid.pattern === 'COLUMNS' || layoutGrid.pattern === 'ROWS') {
        const count = layoutGrid.count ?? 12;
        const gutter = layoutGrid.gutterSize ?? 0;
        if (layoutGrid.pattern === 'COLUMNS') {
          self.display = 'grid';
          self.gridTemplateColumns = `repeat(${count}, 1fr)`;
          if (gutter > 0) {
            self.gap = `${gutter}px`;
          }
          if (layoutGrid.alignment === 'CENTER') {
            self.justifyContent = 'center';
          }
        }
      }
    }

    return { self, children };
  }

  private computeSelfLayout(node: SceneNode, parent?: SceneNode): LayoutCSS {
    const css: LayoutCSS = {};
    const box = node.absoluteBoundingBox;

    if (node.opacity !== undefined && node.opacity < 1) {
      css.opacity = node.opacity;
    }

    if (node.layoutPositioning === 'ABSOLUTE' || this.isAbsoluteChild(node, parent)) {
      css.position = 'absolute';
      if (box) {
        if (parent?.absoluteBoundingBox) {
          const parentBox = parent.absoluteBoundingBox;
          css.left = `${box.x - parentBox.x}px`;
          css.top = `${box.y - parentBox.y}px`;
        } else {
          css.left = `${box.x}px`;
          css.top = `${box.y}px`;
        }
      }
    } else if (node.type === 'TEXT') {
      css.position = 'relative';
    }

    if (!node.layoutMode || node.layoutMode === 'NONE') {
      if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'GROUP') {
        if (css.position !== 'absolute') {
          if (node.clipsContent) {
            css.overflow = 'hidden';
          }
        }
      }
    }

    if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
      css.display = 'flex';
      css.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';

      if (node.primaryAxisAlignItems && node.primaryAxisAlignItems !== 'MIN') {
        css.justifyContent = this.mapPrimaryAlign(node.primaryAxisAlignItems);
      }
      if (node.counterAxisAlignItems && node.counterAxisAlignItems !== 'MIN') {
        css.alignItems = this.mapCounterAlign(node.counterAxisAlignItems);
      }
      if (node.itemSpacing != null && node.itemSpacing > 0) {
        css.gap = `${node.itemSpacing}px`;
      }
      if (node.paddingTop != null || node.paddingRight != null || node.paddingBottom != null || node.paddingLeft != null) {
        css.padding = [
          node.paddingTop ?? 0,
          node.paddingRight ?? 0,
          node.paddingBottom ?? 0,
          node.paddingLeft ?? 0,
        ].map(v => `${v}px`).join(' ');
      }
      if (node.primaryAxisSizingMode === 'AUTO') {
        if (node.layoutMode === 'HORIZONTAL') css.width = 'fit-content';
        else css.height = 'fit-content';
      }
      if (node.counterAxisSizingMode === 'AUTO') {
        if (node.layoutMode === 'HORIZONTAL') css.height = 'fit-content';
        else css.width = 'fit-content';
      }
      if (node.counterAxisSpacing && node.counterAxisSpacing > 0 && node.layoutMode === 'HORIZONTAL') {
        css.rowGap = `${node.counterAxisSpacing}px`;
      }
      if (node.counterAxisSpacing && node.counterAxisSpacing > 0 && node.layoutMode === 'VERTICAL') {
        css.columnGap = `${node.counterAxisSpacing}px`;
      }
    }

    if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      if (node.cornerRadius !== undefined && node.cornerRadius !== 0 && typeof node.cornerRadius === 'number') {
        css.borderRadius = `${node.cornerRadius}px`;
      }
      if (node.clipsContent) {
        css.overflow = 'hidden';
      }
    }

    if (node.minWidth) css.minWidth = `${node.minWidth}px`;
    if (node.maxWidth) css.maxWidth = `${node.maxWidth}px`;
    if (node.minHeight) css.minHeight = `${node.minHeight}px`;
    if (node.maxHeight) css.maxHeight = `${node.maxHeight}px`;

    if (node.type === 'RECTANGLE') {
      if (node.cornerRadius !== undefined && node.cornerRadius !== 0 && typeof node.cornerRadius === 'number') {
        css.borderRadius = `${node.cornerRadius}px`;
      }
    }

    if (node.type === 'RECTANGLE') {
      if (node.fills?.some(f => f.type === 'IMAGE')) {
        css.objectFit = 'cover';
        if (box) {
          css.aspectRatio = `${box.width} / ${box.height}`;
        }
      }
    }

    // Handle blur effects
    if (node.effects) {
      for (const effect of node.effects) {
        if (effect.visible === false) continue;
        if (effect.type === 'LAYER_BLUR' && effect.radius && effect.radius > 0) {
          // Layer blur is handled via CSS filter
        } else if (effect.type === 'BACKGROUND_BLUR' && effect.radius && effect.radius > 0) {
          // Backdrop blur
        }
      }
    }

    return css;
  }

  private computeChildrenLayout(node: SceneNode): LayoutCSS[] {
    if (!node.children) return [];
    return node.children.map(child => this.computeChildItemLayout(child, node));
  }

  private computeChildItemLayout(child: SceneNode, parent: SceneNode): LayoutCSS {
    const css: LayoutCSS = {};

    if (child.layoutPositioning === 'ABSOLUTE') {
      css.position = 'absolute';
      const cBox = child.absoluteBoundingBox;
      const pBox = parent.absoluteBoundingBox;
      if (cBox && pBox) {
        css.left = `${cBox.x - pBox.x}px`;
        css.top = `${cBox.y - pBox.y}px`;
        css.width = `${cBox.width}px`;
        css.height = `${cBox.height}px`;
      }
      return css;
    }

    if (child.layoutAlign === 'STRETCH') {
      css.alignSelf = 'stretch';
    }
    if (child.layoutGrow && child.layoutGrow > 0) {
      css.flex = `${child.layoutGrow} 1 0%`;
    }

    if (child.type === 'TEXT') {
      if (child.style?.textAutoResize === 'WIDTH_AND_HEIGHT' || child.style?.textAutoResize === 'HEIGHT') {
        // text nodes auto-size; no fixed sizing needed
      }
    }

    const box = child.absoluteBoundingBox;
    const parentBox = parent.absoluteBoundingBox;

    if (box && parentBox && parent.layoutMode && parent.layoutMode !== 'NONE') {
      if (parent.layoutMode === 'HORIZONTAL') {
        if (child.layoutGrow === 0 || child.layoutGrow === undefined) {
          if (box.width > 0) {
            css.flexBasis = `${box.width}px`;
          }
        }
      } else if (parent.layoutMode === 'VERTICAL') {
        if (child.layoutGrow === 0 || child.layoutGrow === undefined) {
          if (box.height > 0) {
            css.flexBasis = `${box.height}px`;
          }
        }
      }
    }

    return css;
  }

  private isAbsoluteChild(node: SceneNode, parent?: SceneNode): boolean {
    if (!parent || !node.absoluteBoundingBox || !parent.absoluteBoundingBox) return false;
    if (parent.layoutMode === 'NONE' || !parent.layoutMode) return false;
    if (node.layoutPositioning === 'ABSOLUTE') return true;
    const pBox = parent.absoluteBoundingBox;
    const cBox = node.absoluteBoundingBox;
    return (
      cBox.x < pBox.x - 5 ||
      cBox.y < pBox.y - 5 ||
      cBox.x + cBox.width > pBox.x + pBox.width + 5 ||
      cBox.y + cBox.height > pBox.y + pBox.height + 5
    );
  }


  analyzeResponsive(node: SceneNode): ResponsiveInfo {
    const constraints = this.analyzeConstraints(node);
    const variants = this.generateResponsiveVariants(node, constraints);
    return {
      isResponsive: constraints.hasResponsiveIntent || variants.length > 0,
      constraints,
      variants,
    };
  }

  private analyzeConstraints(node: SceneNode): ConstraintAnalysis {
    const c = node.constraints;
    if (!c) {
      return { horizontal: 'fixed', vertical: 'fixed', hasResponsiveIntent: false };
    }

    const horizontal = this.mapConstraintType(c.horizontal ?? 'LEFT');
    const vertical = c.vertical ? this.mapConstraintType(c.vertical) : horizontal;

    const hasResponsiveIntent =
      horizontal === 'stretch' ||
      horizontal === 'scale' ||
      vertical === 'stretch' ||
      vertical === 'scale';

    return { horizontal, vertical, hasResponsiveIntent };
  }

  private mapConstraintType(type: string): 'fixed' | 'stretch' | 'scale' | 'center' {
    switch (type) {
      case 'LEFT_RIGHT': return 'stretch';
      case 'TOP_BOTTOM': return 'stretch';
      case 'SCALE': return 'scale';
      case 'CENTER': return 'center';
      default: return 'fixed';
    }
  }

  private generateResponsiveVariants(node: SceneNode, _constraints: ConstraintAnalysis): ResponsiveVariant[] {
    const variants: ResponsiveVariant[] = [];
    const box = node.absoluteBoundingBox;
    if (!box) return variants;

    const baseWidth = box.width;

    if (node.layoutMode && node.layoutMode !== 'NONE') {
      const childCount = node.children?.filter(c => c.visible !== false).length ?? 0;

      // Detect if horizontal layout would need to wrap on smaller screens
      if (node.layoutMode === 'HORIZONTAL' && node.itemSpacing != null && childCount > 1) {
        const totalChildWidth = this.estimateTotalChildWidth(node);
        if (totalChildWidth > baseWidth * 0.7) {
          variants.push({
            breakpoint: 'tablet',
            minWidth: 0,
            maxWidth: 768,
            self: {
              flexWrap: 'wrap',
              justifyContent: node.primaryAxisAlignItems === 'CENTER' ? 'center' : 'flex-start',
            },
            children: [],
          });
        }
      }

      // Suggest mobile: stack vertically
      if (node.layoutMode === 'HORIZONTAL') {
        variants.push({
          breakpoint: 'mobile',
          minWidth: 0,
          maxWidth: 480,
          self: {
            flexDirection: 'column',
            gap: node.itemSpacing ? `${node.itemSpacing}px` : '8px',
          },
          children: [],
        });
      }
    }

    // Padding reduction variants
    const hasLargePadding =
      (node.paddingLeft != null && node.paddingLeft > 40) ||
      (node.paddingRight != null && node.paddingRight > 40);

    if (hasLargePadding) {
      const reducePadding = (factor: number) => ({
        top: Math.round((node.paddingTop ?? 0) * factor),
        right: Math.round((node.paddingRight ?? 0) * factor),
        bottom: Math.round((node.paddingBottom ?? 0) * factor),
        left: Math.round((node.paddingLeft ?? 0) * factor),
      });

      variants.push({
        breakpoint: 'tablet',
        minWidth: 481,
        maxWidth: 1024,
        self: {
          padding: Object.values(reducePadding(0.75)).map(v => `${v}px`).join(' '),
        },
        children: [],
      });

      variants.push({
        breakpoint: 'mobile',
        minWidth: 0,
        maxWidth: 480,
        self: {
          padding: Object.values(reducePadding(0.5)).map(v => `${v}px`).join(' '),
        },
        children: [],
      });
    }

    return variants;
  }


  detectGrid(node: SceneNode): GridInfo | null {
    if (!node.children || node.children.length < 3) return null;
    if (node.layoutMode && node.layoutMode !== 'NONE') return null;

    const parentBox = node.absoluteBoundingBox;
    if (!parentBox) return null;

    const visible = node.children.filter(c =>
      c.visible !== false && c.absoluteBoundingBox
    );
    if (visible.length < 3) return null;

    const boxes = visible.map(c => c.absoluteBoundingBox!);

    const xPositions = boxes.map(b => Math.round((b.x - parentBox.x) * 10) / 10);
    const yPositions = boxes.map(b => Math.round((b.y - parentBox.y) * 10) / 10);
    const widths = boxes.map(b => Math.round(b.width * 10) / 10);
    const heights = boxes.map(b => Math.round(b.height * 10) / 10);

    const rowClusters = this.clusterValues(yPositions, Math.max(5, Math.min(...heights) * 0.3));
    if (rowClusters.length < 2) return null;

    const colSets: number[][] = [];
    for (const row of rowClusters) {
      const rowX = row.indices.map(i => xPositions[i]);
      const rowCols = this.clusterValues(rowX, Math.max(5, Math.min(...widths) * 0.3));
      const colPositions = rowCols.map(c => c.value);
      colSets.push(colPositions);
    }

    const colCounts = colSets.map(s => s.length);
    const medianColCount = this.median(colCounts);
    const consistentRows = colCounts.filter(c => Math.abs(c - medianColCount) <= 1).length;
    const consistencyRatio = consistentRows / colCounts.length;

    if (consistencyRatio < 0.5 || medianColCount < 2) return null;

    const allColPositions = [...new Set(colSets.flat().map(v => Math.round(v)))].sort((a, b) => a - b);

    const finalColClusters = this.clusterValues(allColPositions, Math.max(5, Math.min(...widths) * 0.3));
    if (finalColClusters.length < 2) return null;

    const finalColPositions = finalColClusters.map(c => c.value);
    const finalRowPositions = rowClusters.map(r => r.value);

    const templateColumns = finalColPositions.map((cx, ci) => {
      const nextX = finalColPositions[ci + 1] ?? (parentBox.width);
      const colWidth = nextX - cx;
      const columnChildren = visible.filter((_, vi) => {
        const childX = Math.round((boxes[vi].x - parentBox.x) * 10) / 10;
        return Math.abs(childX - cx) < 5;
      });
      const avgWidth = columnChildren.length > 0
        ? columnChildren.reduce((s, c) => s + c.absoluteBoundingBox!.width, 0) / columnChildren.length
        : colWidth;
      return `${Math.round(avgWidth)}px`;
    });

    const templateRows = finalRowPositions.map((ry, ri) => {
      const nextY = finalRowPositions[ri + 1] ?? parentBox.height;
      const rowHeight = nextY - ry;
      return `${Math.round(rowHeight)}px`;
    });

    let gapCol = 0;
    if (finalColPositions.length >= 2) {
      const colGaps: number[] = [];
      for (const row of rowClusters) {
        const rowChildren = row.indices
          .map(i => ({ x: xPositions[i], w: widths[i] }))
          .sort((a, b) => a.x - b.x);
        for (let i = 1; i < rowChildren.length; i++) {
          const gap = rowChildren[i].x - (rowChildren[i - 1].x + rowChildren[i - 1].w);
          if (gap > 0 && gap < 50) colGaps.push(gap);
        }
      }
      gapCol = colGaps.length > 0 ? Math.round(colGaps.reduce((s, g) => s + g, 0) / colGaps.length) : 0;
    }

    let gapRow = 0;
    if (finalRowPositions.length >= 2) {
      const rowGaps: number[] = [];
      for (let ri = 0; ri < finalRowPositions.length; ri++) {
        const rowChildren = visible
          .map((_c, vi) => ({ y: yPositions[vi], h: heights[vi], i: vi }))
          .filter(({ y }) => Math.abs(y - finalRowPositions[ri]) < 5)
          .sort((a, b) => a.y - b.y);
        for (let i = 1; i < rowChildren.length; i++) {
          const gap = rowChildren[i].y - (rowChildren[i - 1].y + rowChildren[i - 1].h);
          if (gap > 0 && gap < 50) rowGaps.push(gap);
        }
      }
      gapRow = rowGaps.length > 0 ? Math.round(rowGaps.reduce((s, g) => s + g, 0) / rowGaps.length) : 0;
    }

    const childPositions: GridChildPosition[] = visible.map((child, vi) => {
      const cx = xPositions[vi];
      const cy = yPositions[vi];
      const cw = widths[vi];
      const ch = heights[vi];

      let col = finalColPositions.findIndex((_, fi) => {
        const nextX = finalColPositions[fi + 1] ?? parentBox.width;
        return cx >= finalColPositions[fi] && cx + cw <= nextX + 5;
      });
      if (col < 0) {
        col = finalColPositions.reduce((best, _, fi) => {
          const dist = Math.abs(cx - finalColPositions[fi]);
          return dist < best.dist ? { fi, dist } : best;
        }, { fi: 0, dist: Infinity }).fi;
      }

      let row = finalRowPositions.findIndex((_, fi) => {
        const nextY = finalRowPositions[fi + 1] ?? parentBox.height;
        return cy >= finalRowPositions[fi] && cy + ch <= nextY + 5;
      });
      if (row < 0) {
        row = finalRowPositions.reduce((best, _, fi) => {
          const dist = Math.abs(cy - finalRowPositions[fi]);
          return dist < best.dist ? { fi, dist } : best;
        }, { fi: 0, dist: Infinity }).fi;
      }

      let columnSpan = 1;
      for (let s = 1; s < finalColPositions.length - col; s++) {
        const colEnd = col + s < finalColPositions.length
          ? finalColPositions[col + s]
          : parentBox.width;
        if (cx + cw > colEnd - 5) {
          columnSpan = s + 1;
        }
      }

      let rowSpan = 1;
      for (let s = 1; s < finalRowPositions.length - row; s++) {
        const rowEnd = row + s < finalRowPositions.length
          ? finalRowPositions[row + s]
          : parentBox.height;
        if (cy + ch > rowEnd - 5) {
          rowSpan = s + 1;
        }
      }

      return { nodeId: child.id, col, row, columnSpan, rowSpan };
    });

    return {
      isGrid: true,
      columns: finalColPositions.length,
      rows: finalRowPositions.length,
      templateColumns,
      templateRows,
      gap: { column: gapCol, row: gapRow },
      childPositions,
      confidence: consistencyRatio,
    };
  }

  private clusterValues(values: number[], tolerance: number): { value: number; indices: number[] }[] {
    const indexed = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const clusters: { value: number; indices: number[] }[] = [];

    for (const { v, i } of indexed) {
      let found = false;
      for (const cluster of clusters) {
        if (Math.abs(cluster.value - v) <= tolerance) {
          cluster.indices.push(i);
          found = true;
          break;
        }
      }
      if (!found) {
        clusters.push({ value: v, indices: [i] });
      }
    }

    return clusters;
  }

  private median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private estimateTotalChildWidth(node: SceneNode): number {
    if (!node.children) return 0;
    let total = 0;
    for (const child of node.children) {
      if (child.visible === false) continue;
      const box = child.absoluteBoundingBox;
      if (box) total += box.width;
    }
    return total;
  }

  private mapPrimaryAlign(align: string): string {
    const map: Record<string, string> = {
      'MIN': 'flex-start',
      'CENTER': 'center',
      'MAX': 'flex-end',
      'SPACE_BETWEEN': 'space-between',
    };
    return map[align] || 'flex-start';
  }

  private mapCounterAlign(align: string): string {
    const map: Record<string, string> = {
      'MIN': 'flex-start',
      'CENTER': 'center',
      'MAX': 'flex-end',
      'BASELINE': 'baseline',
      'STRETCH': 'stretch',
    };
    return map[align] || 'flex-start';
  }

  generateResponsiveCSS(variants: ResponsiveVariant[], selector: string = '.el-responsive'): string {
    const breakpointMap: Record<string, string> = {
      mobile: '(max-width: 480px)',
      tablet: '(min-width: 481px) and (max-width: 1024px)',
      desktop: '(min-width: 1025px)',
    };

    const grouped = new Map<string, ResponsiveVariant[]>();
    for (const v of variants) {
      const existing = grouped.get(v.breakpoint) || [];
      existing.push(v);
      grouped.set(v.breakpoint, existing);
    }

    const blocks: string[] = [];
    for (const [bp, bpVariants] of grouped) {
      const mediaQuery = breakpointMap[bp];
      if (!mediaQuery) continue;

      const cssLines: string[] = [];
      for (const variant of bpVariants) {
        cssLines.push(this.layoutToCSS(variant.self));
      }

      blocks.push(`@media ${mediaQuery} {\n${selector} {\n${cssLines.join('\n')}\n}\n}`);
    }

    return blocks.join('\n');
  }

  layoutToCSS(css: LayoutCSS): string {
    const lines: string[] = [];
    const map: Record<string, string> = {
      display: 'display',
      flexDirection: 'flex-direction',
      flexWrap: 'flex-wrap',
      justifyContent: 'justify-content',
      alignItems: 'align-items',
      alignContent: 'align-content',
      gap: 'gap',
      rowGap: 'row-gap',
      columnGap: 'column-gap',
      padding: 'padding',
      paddingTop: 'padding-top',
      paddingRight: 'padding-right',
      paddingBottom: 'padding-bottom',
      paddingLeft: 'padding-left',
      width: 'width',
      height: 'height',
      minWidth: 'min-width',
      maxWidth: 'max-width',
      minHeight: 'min-height',
      maxHeight: 'max-height',
      position: 'position',
      top: 'top',
      right: 'right',
      bottom: 'bottom',
      left: 'left',
      gridTemplateColumns: 'grid-template-columns',
      gridTemplateRows: 'grid-template-rows',
      gridColumn: 'grid-column',
      gridRow: 'grid-row',
      aspectRatio: 'aspect-ratio',
      overflow: 'overflow',
      flex: 'flex',
      flexGrow: 'flex-grow',
      flexShrink: 'flex-shrink',
      flexBasis: 'flex-basis',
      alignSelf: 'align-self',
      justifySelf: 'justify-self',
      objectFit: 'object-fit',
      borderRadius: 'border-radius',
      opacity: 'opacity',
    };

    for (const [key, value] of Object.entries(css)) {
      if (value !== undefined && value !== null && value !== '') {
        const prop = map[key] || key;
        lines.push(`  ${prop}: ${value};`);
      }
    }

    return lines.join('\n');
  }
}
