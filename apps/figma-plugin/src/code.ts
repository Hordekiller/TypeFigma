/// <reference types="@figma/plugin-typings" />

// ─── Types ────────────────────────────────────────────

interface ExtractedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ExtractedStyle {
  id: string;
  name: string;
  type: 'PAINT' | 'TEXT' | 'EFFECT';
  description: string;
  value: string | Record<string, unknown>;
}

interface ExtractedVariable {
  id: string;
  name: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  collectionId: string;
  collectionName: string;
  mode: string;
  value: string | number | boolean;
  cssName: string;
  scopes: string[];
}

interface AutoLayoutNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
  counterAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
  padding: { top: number; right: number; bottom: number; left: number };
  itemSpacing: number;
  layoutGrow: number;
  layoutAlign: 'INHERIT' | 'STRETCH';
  fills: string[];
  strokes: string[];
  effects: string[];
  cornerRadius: number;
  width: number;
  height: number;
  children: AutoLayoutNode[];
}

interface FramePageMapping {
  frameId: string;
  frameName: string;
  pageId: string;
  pageName: string;
  pageType: 'page' | 'single' | 'archive' | 'shop' | 'cart' | 'checkout' | 'my-account' | 'header' | 'footer';
}

interface TokenCount {
  variables: number;
  styles: number;
  autoLayoutNodes: number;
  colors: number;
  typography: number;
}

interface PluginExport {
  pluginVersion: string;
  documentName: string;
  exportedAt: string;
  variables: ExtractedVariable[];
  styles: ExtractedStyle[];
  autoLayoutNodes: AutoLayoutNode[];
  selectedFrames: AutoLayoutNode[];
  pageMapping: FramePageMapping[];
  tokenCount: TokenCount;
}

interface ExtractOptions {
  includeVariables: boolean;
  includeStyles: boolean;
  includeAutoLayout: boolean;
  includeHidden: boolean;
}

// ─── Color Helpers ────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorToRecord(c: RGBA | RGB): ExtractedColor {
  return {
    hex: rgbToHex(c.r, c.g, c.b),
    r: c.r, g: c.g, b: c.b,
    a: 'a' in c ? c.a : 1,
  };
}

function paintToString(p: Paint): string {
  if (p.type === 'SOLID') {
    const c = colorToRecord(p.color);
    if (p.opacity !== undefined && p.opacity < 1) {
      return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${p.opacity})`;
    }
    return c.hex;
  }
  if (p.type === 'GRADIENT_LINEAR' || p.type === 'GRADIENT_RADIAL' || p.type === 'GRADIENT_ANGULAR' || p.type === 'GRADIENT_DIAMOND') {
    const stops = p.gradientStops.map(s => {
      const c = colorToRecord(s.color);
      return `${c.hex} ${Math.round(s.position * 100)}%`;
    });
    return `${p.type}(${stops.join(', ')})`;
  }
  return p.type;
}

function weightFromStyle(style: string): number {
  const map: Record<string, number> = {
    'thin': 100, 'hairline': 100,
    'extra light': 200, 'ultra light': 200,
    'light': 300,
    'regular': 400, 'normal': 400,
    'medium': 500,
    'semi bold': 600, 'demi bold': 600,
    'bold': 700,
    'extra bold': 800, 'ultra bold': 800,
    'black': 900, 'heavy': 900,
  };
  return map[style.toLowerCase()] || 400;
}

// ─── Variable Extraction ─────────────────────────────

function extractVariables(): ExtractedVariable[] {
  const result: ExtractedVariable[] = [];
  const collections = figma.variables.getLocalVariableCollections();

  for (const coll of collections) {
    const defaultModeId = coll.defaultModeId;
    for (const varId of coll.variableIds) {
      const v = figma.variables.getVariableById(varId);
      if (!v) continue;

      const raw = v.valuesByMode[defaultModeId];
      if (raw === undefined) continue;

      let value: string | number | boolean;
      const resolvedType = v.resolvedType;

      if (resolvedType === 'COLOR' && typeof raw === 'object' && raw !== null && 'r' in raw) {
        value = colorToRecord(raw as RGBA).hex;
      } else if (resolvedType === 'COLOR' && typeof raw === 'object' && raw !== null && 'type' in raw && raw.type === 'VARIABLE_ALIAS') {
        const target = raw.id ? figma.variables.getVariableById(raw.id) : null;
        if (target) {
          const resolved = target.valuesByMode[defaultModeId];
          if (typeof resolved === 'object' && resolved !== null && 'r' in resolved) {
            value = colorToRecord(resolved as RGBA).hex;
          } else {
            value = String(resolved ?? '');
          }
        } else {
          value = `var(--${raw.id})`;
        }
      } else {
        value = raw as string | number | boolean;
      }

      result.push({
        id: v.id,
        name: v.name,
        resolvedType,
        collectionId: coll.id,
        collectionName: coll.name,
        mode: coll.modes.find(m => m.modeId === defaultModeId)?.name ?? 'default',
        value,
        cssName: `--${v.name.replace(/[/\s]+/g, '-').toLowerCase()}`,
        scopes: v.scopes ?? [],
      });
    }
  }

  return result;
}

// ─── Style Extraction ─────────────────────────────────

function extractStyles(): ExtractedStyle[] {
  const result: ExtractedStyle[] = [];

  for (const style of figma.getLocalPaintStyles()) {
    const paints = style.paints;
    const value = paints.length === 1 ? paintToString(paints[0]) : paints.map(paintToString);
    result.push({
      id: style.id,
      name: style.name,
      type: 'PAINT',
      description: style.description,
      value: typeof value === 'string' ? value : { paints: value },
    });
  }

  for (const style of figma.getLocalTextStyles()) {
    const font = style.fontName;
    result.push({
      id: style.id,
      name: style.name,
      type: 'TEXT',
      description: style.description,
      value: {
        fontFamily: font.family,
        fontStyle: font.style,
        fontSize: style.fontSize,
        fontWeight: weightFromStyle(font.style),
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        textCase: style.textCase,
        textDecoration: style.textDecoration,
      },
    });
  }

  for (const style of figma.getLocalEffectStyles()) {
    const effects = style.effects.map(e => ({
      type: e.type,
      visible: e.visible,
      radius: 'radius' in e ? e.radius : 0,
      offset: 'offset' in e ? e.offset : { x: 0, y: 0 },
      color: 'color' in e ? colorToRecord(e.color) : undefined,
      spread: 'spread' in e ? e.spread : 0,
    }));
    result.push({
      id: style.id,
      name: style.name,
      type: 'EFFECT',
      description: style.description,
      value: { effects },
    });
  }

  return result;
}

// ─── Auto-Layout Node Extraction ─────────────────────

function extractNode(node: SceneNode, includeHidden: boolean, depth = 0): AutoLayoutNode | null {
  if (depth > 50) return null;
  if (!includeHidden && !node.visible) return null;

  const children: AutoLayoutNode[] = [];
  if ('children' in node) {
    for (const child of (node as unknown as { children: SceneNode[] }).children) {
      const extracted = extractNode(child, includeHidden, depth + 1);
      if (extracted) children.push(extracted);
    }
  }

  const fills: Paint[] = 'fills' in node ? (node as unknown as { fills: Paint[] }).fills ?? [] : [];
  const strokes: Paint[] = 'strokes' in node ? (node as unknown as { strokes: Paint[] }).strokes ?? [] : [];
  const effects: Effect[] = 'effects' in node ? (node as unknown as { effects: Effect[] }).effects ?? [] : [];

  const layoutMode = 'layoutMode' in node ? (node as unknown as { layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL' }).layoutMode : 'NONE';

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    layoutMode: layoutMode ?? 'NONE',
    primaryAxisAlignItems: 'primaryAxisAlignItems' in node
      ? (node as unknown as { primaryAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN' }).primaryAxisAlignItems ?? 'MIN'
      : 'MIN',
    counterAxisAlignItems: 'counterAxisAlignItems' in node
      ? (node as unknown as { counterAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE' }).counterAxisAlignItems ?? 'MIN'
      : 'MIN',
    padding: {
      top: 'paddingTop' in node ? (node as unknown as { paddingTop: number }).paddingTop ?? 0 : 0,
      right: 'paddingRight' in node ? (node as unknown as { paddingRight: number }).paddingRight ?? 0 : 0,
      bottom: 'paddingBottom' in node ? (node as unknown as { paddingBottom: number }).paddingBottom ?? 0 : 0,
      left: 'paddingLeft' in node ? (node as unknown as { paddingLeft: number }).paddingLeft ?? 0 : 0,
    },
    itemSpacing: 'itemSpacing' in node ? (node as unknown as { itemSpacing: number }).itemSpacing ?? 0 : 0,
    layoutGrow: 'layoutGrow' in node ? (node as unknown as { layoutGrow: number }).layoutGrow ?? 0 : 0,
    layoutAlign: 'layoutAlign' in node
      ? (node as unknown as { layoutAlign: 'INHERIT' | 'STRETCH' }).layoutAlign ?? 'INHERIT'
      : 'INHERIT',
    fills: fills.filter(f => f.visible !== false).map(paintToString),
    strokes: strokes.filter(s => s.visible !== false).map(paintToString),
    effects: effects.filter(e => e.visible !== false).map(e => e.type),
    cornerRadius: 'cornerRadius' in node ? (node as unknown as { cornerRadius: number }).cornerRadius ?? 0 : 0,
    width: node.width,
    height: node.height,
    children: children.length > 0 ? children : [],
  };
}

// ─── Page & Frame Mapping ────────────────────────────

function guessPageType(name: string): FramePageMapping['pageType'] {
  const lower = name.toLowerCase();
  if (lower.includes('shop') || lower.includes('store') || lower.includes('product archive')) return 'shop';
  if (lower.includes('cart')) return 'cart';
  if (lower.includes('checkout')) return 'checkout';
  if (lower.includes('my-account') || lower.includes('account') || lower.includes('my account')) return 'my-account';
  if (lower.includes('header') || lower.includes('nav')) return 'header';
  if (lower.includes('footer')) return 'footer';
  if (lower.includes('single') || lower.includes('detail') || lower.includes('product detail')) return 'single';
  if (lower.includes('archive') || lower.includes('blog') || lower.includes('category')) return 'archive';
  if (lower.includes('404') || lower.includes('not found') || lower.includes('error')) return 'page';
  return 'page';
}

function buildPageMapping(selected: readonly SceneNode[]): FramePageMapping[] {
  return selected
    .filter(n => n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'SECTION' || n.type === 'GROUP')
    .map(n => ({
      frameId: n.id,
      frameName: n.name,
      pageId: generateId(),
      pageName: n.name.replace(/[-_]+/g, ' ').replace(/\.\w+$/, '').trim(),
      pageType: guessPageType(n.name),
    }));
}

function generateId(): string {
  return 'tf_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Main Export ──────────────────────────────────────

function buildExport(selected: readonly SceneNode[], options: ExtractOptions): PluginExport {
  const variables = options.includeVariables ? extractVariables() : [];
  const styles = options.includeStyles ? extractStyles() : [];
  const pageMapping = buildPageMapping(selected);

  const autoLayoutNodes: AutoLayoutNode[] = [];
  const selectedFrames: AutoLayoutNode[] = [];

  if (options.includeAutoLayout) {
    for (const page of figma.root.children) {
      for (const child of page.children) {
        const extracted = extractNode(child, options.includeHidden);
        if (extracted) autoLayoutNodes.push(extracted);
      }
    }

    for (const sel of selected) {
      const extracted = extractNode(sel, options.includeHidden);
      if (extracted) selectedFrames.push(extracted);
    }
  }

  const colors = new Set<string>();
  for (const v of variables) {
    if (v.resolvedType === 'COLOR' && typeof v.value === 'string') colors.add(v.value);
  }
  for (const s of styles) {
    if (s.type === 'PAINT' && typeof s.value === 'string') colors.add(s.value);
  }

  const typography = styles.filter(s => s.type === 'TEXT').length;

  return {
    pluginVersion: '1.0.0',
    documentName: figma.root.name,
    exportedAt: new Date().toISOString(),
    variables,
    styles,
    autoLayoutNodes,
    selectedFrames,
    pageMapping,
    tokenCount: {
      variables: variables.length,
      styles: styles.length,
      autoLayoutNodes: autoLayoutNodes.length,
      colors: colors.size,
      typography,
    },
  };
}

// ─── Plugin Entry ─────────────────────────────────────

function showUI() {
  figma.showUI(__html__, {
    width: 800,
    height: 700,
    title: 'TypeFigma',
  });
}

figma.on('run', () => {
  showUI();

  const selection = figma.currentPage.selection;
  const allPages = figma.root.children.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
  }));

  figma.ui.postMessage({
    type: 'init',
    selection: selection.map(n => ({ id: n.id, name: n.name, type: n.type })),
    allPages,
    currentPage: { id: figma.currentPage.id, name: figma.currentPage.name },
  });
});

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  figma.ui.postMessage({
    type: 'selection-update',
    selection: selection.map(n => ({ id: n.id, name: n.name, type: n.type })),
  });
});

figma.ui.onmessage = async (msg: Record<string, unknown>) => {
  switch (msg.type) {
    case 'extract': {
      const options: ExtractOptions = {
        includeVariables: (msg.includeVariables as boolean) ?? true,
        includeStyles: (msg.includeStyles as boolean) ?? true,
        includeAutoLayout: (msg.includeAutoLayout as boolean) ?? true,
        includeHidden: (msg.includeHidden as boolean) ?? false,
      };

      const selectedIds = (msg.selectedIds as string[]) ?? [];
      const selected = selectedIds
        .map(id => figma.getNodeById(id))
        .filter((n): n is SceneNode => n !== null);

      const data = buildExport(selected.length > 0 ? selected : figma.currentPage.selection, options);

      if (msg.download) {
        figma.ui.postMessage({ type: 'download', data, fileName: `${figma.root.name}-typefigma-export.json` });
      } else {
        figma.ui.postMessage({ type: 'extract-result', data });
      }
      break;
    }

    case 'navigate-page': {
      const page = figma.root.children.find(p => p.id === msg.pageId);
      if (page) {
        figma.currentPage = page;
      }
      break;
    }

    case 'notify': {
      figma.notify(msg.text as string, { error: msg.error as boolean ?? false });
      break;
    }

    case 'resize': {
      figma.ui.resize(msg.width as number, msg.height as number);
      break;
    }
  }
};
