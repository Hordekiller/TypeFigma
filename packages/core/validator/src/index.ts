import type { ThemeFile } from '@typefigma/theme-builder';

export interface ValidationReport {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  performance: {
    totalSize: number;
    cssSize: number;
    jsSize: number;
    phpSize: number;
    imageCount: number;
    largestFile: { path: string; size: number } | null;
  };
  accessibility: {
    score: number;
    missingAltText: string[];
    missingLabels: string[];
    contrastIssues: string[];
    ariaIssues: string[];
    semanticIssues: string[];
  };
  wordpress: {
    escapingFunctions: number;
    noncesFound: number;
    i18nFunctions: number;
    fileHeadersValid: boolean;
    themeModsFound: string[];
    hooksUsed: string[];
  };
  structure: {
    requiredFiles: string[];
    missingRequired: string[];
    extraFiles: string[];
  };
  summary: {
    passed: boolean;
    score: number;
    totalChecks: number;
    failedChecks: number;
  };
}

export interface ValidationIssue {
  file: string;
  line?: number;
  message: string;
  type: 'error' | 'warning' | 'info';
}

const REQUIRED_THEME_FILES = [
  'style.css', 'index.php', 'single.php', 'page.php', 'archive.php',
  'sidebar.php', '404.php', 'search.php', 'header.php', 'footer.php', 'functions.php',
];

const ESCAPING_FUNCTIONS = [
  'esc_html', 'esc_attr', 'esc_url', 'esc_js', 'esc_textarea',
  'esc_html__', 'esc_attr__', 'esc_html_e', 'esc_attr_e',
  'esc_html_x', 'esc_attr_x',
];

const I18N_FUNCTIONS = [
  '__', '_e', '_x', '_n', '_nx', 'esc_html__', 'esc_attr__',
  'esc_html_e', 'esc_attr_e', 'esc_html_x', 'esc_attr_x',
];

const WORDPRESS_HOOKS = [
  'add_action', 'add_filter', 'do_action', 'apply_filters',
  'register_activation_hook', 'register_deactivation_hook',
];

const NONCE_FUNCTIONS = ['wp_nonce_field', 'wp_nonce_url', 'wp_create_nonce', 'check_admin_referer', 'check_ajax_referer', 'verify_nonce'];

export class Validator {
  validate(files: ThemeFile[]): ValidationReport {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const info: ValidationIssue[] = [];

    const fileMap = new Map<string, string>();
    for (const f of files) fileMap.set(f.path, typeof f.content === 'string' ? f.content : '');

    this.checkStructure(fileMap, errors, warnings, info);
    this.checkPhpSyntax(files, errors, warnings);
    this.checkWordPressStd(files, errors, warnings, info);
    this.checkAccessibility(files, warnings, info);
    this.checkCssQuality(files, warnings, info);
    this.checkElementor(files, warnings, info);

    const perf = this.measurePerformance(files);
    const a11y = this.buildAccessibilityReport(files, warnings);
    const wp = this.buildWordPressReport(files, errors, warnings, info);

    const totalChecks = errors.length + warnings.length + info.length;
    const failedChecks = errors.length + warnings.length;
    const score = this.calculateScore(errors.length, warnings.length, totalChecks);

    const missingRequired = REQUIRED_THEME_FILES.filter(f => !fileMap.has(f));
    const actualFiles = files.map(f => f.path);

    return {
      errors,
      warnings,
      info,
      performance: perf,
      accessibility: a11y,
      wordpress: wp,
      structure: {
        requiredFiles: [...REQUIRED_THEME_FILES],
        missingRequired,
        extraFiles: actualFiles.filter(f => !REQUIRED_THEME_FILES.includes(f) && f !== 'theme.json' && !f.startsWith('assets/') && !f.startsWith('inc/') && !f.startsWith('elementor/') && !f.startsWith('woocommerce/') && !f.startsWith('patterns/') && !f.startsWith('templates/')),
      },
      summary: {
        passed: errors.length === 0,
        score,
        totalChecks,
        failedChecks,
      },
    };
  }

  private checkStructure(
    fileMap: Map<string, string>,
    errors: ValidationIssue[],
    warnings: ValidationIssue[],
    info: ValidationIssue[],
  ): void {
    const present = (p: string) => fileMap.has(p);

    for (const required of REQUIRED_THEME_FILES) {
      if (!present(required)) {
        errors.push({ file: required, message: `Missing required theme file: ${required}`, type: 'error' });
      }
    }

    if (fileMap.has('style.css')) {
      const css = fileMap.get('style.css')!;
      if (!css.includes('Theme Name:')) errors.push({ file: 'style.css', message: 'Missing Theme Name header in style.css', type: 'error' });
      if (!css.includes('Text Domain:')) warnings.push({ file: 'style.css', message: 'Missing Text Domain in style.css', type: 'warning' });
      if (!css.includes('License:')) warnings.push({ file: 'style.css', message: 'Missing License in style.css', type: 'warning' });
    }

    if (fileMap.has('index.php') && fileMap.get('index.php')!.trim().length === 0) {
      errors.push({ file: 'index.php', message: 'index.php is empty', type: 'error' });
    }

    if (present('inc/elementor-widgets.php') && !present('elementor/global-settings.json')) {
      info.push({ file: 'elementor/global-settings.json', message: 'Elementor widgets registered but no global-settings.json found', type: 'info' });
    }
  }

  private checkPhpSyntax(
    files: ThemeFile[],
    errors: ValidationIssue[],
    warnings: ValidationIssue[],
  ): void {
    for (const file of files) {
      if (!file.path.endsWith('.php')) continue;
      if (typeof file.content !== 'string') continue;

      const lines = file.content.split('\n');

      const openTags = (file.content.match(/<\?php/g) || []).length;
      const closeTags = (file.content.match(/\?>/g) || []).length;

      if (openTags === 0) {
        errors.push({ file: file.path, message: 'PHP file missing opening tag (<?php)', type: 'error' });
      }

      if (openTags > 0 && openTags !== closeTags && openTags !== closeTags + 1) {
        warnings.push({ file: file.path, message: `Unbalanced PHP tags: ${openTags} opens, ${closeTags} closes`, type: 'warning' });
      }

      let braceStack = 0;
      let inString = false;
      let stringChar = '';
      let escaped = false;
      let lineComment = false;
      let blockComment = false;

      for (let i = 0; i < file.content.length; i++) {
        const ch = file.content[i];
        const prev = i > 0 ? file.content[i - 1] : '';

        if (blockComment) {
          if (ch === '/' && prev === '*') blockComment = false;
          continue;
        }
        if (lineComment) {
          if (ch === '\n') lineComment = false;
          continue;
        }
        if (inString) {
          if (escaped) { escaped = false; continue; }
          if (ch === '\\') { escaped = true; continue; }
          if (ch === stringChar) inString = false;
          continue;
        }
        if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
        if (ch === '/' && prev === '/') { lineComment = true; continue; }
        if (ch === '*' && prev === '/') { blockComment = true; continue; }
        if (ch === '{') braceStack++;
        if (ch === '}') braceStack--;
      }

      if (braceStack !== 0) {
        errors.push({
          file: file.path,
          message: `Unbalanced curly braces: ${braceStack > 0 ? `${braceStack} excess opening braces` : `${Math.abs(braceStack)} excess closing braces`}`,
          type: 'error',
        });
      }

      for (let ln = 0; ln < lines.length; ln++) {
        const line = lines[ln];
        const trimmed = line.trim();
        if (trimmed.startsWith('function ')) {
          const parenOpen = trimmed.indexOf('(');
          const afterClose = trimmed.lastIndexOf(')');
          if (parenOpen === -1) warnings.push({ file: file.path, line: ln + 1, message: 'Function declaration missing opening parenthesis', type: 'warning' });
          if (afterClose === -1) warnings.push({ file: file.path, line: ln + 1, message: 'Function declaration missing closing parenthesis', type: 'warning' });
          if (trimmed.endsWith(',)')) warnings.push({ file: file.path, line: ln + 1, message: 'Trailing comma in function parameters', type: 'info' });
        }

        if (trimmed.startsWith('echo ') || trimmed.startsWith('print ')) {
          if (!trimmed.includes('esc_') && !trimmed.includes('__(') && !trimmed.includes('_e(') && !trimmed.includes('_x(')) {
            warnings.push({ file: file.path, line: ln + 1, message: 'Direct echo/print without escaping function', type: 'warning' });
          }
        }
      }
    }
  }

  private checkWordPressStd(
    files: ThemeFile[],
    errors: ValidationIssue[],
    warnings: ValidationIssue[],
    info: ValidationIssue[],
  ): void {
    for (const file of files) {
      if (!file.path.endsWith('.php')) continue;
      if (typeof file.content !== 'string') continue;

      const content = file.content;
      const lines = content.split('\n');

      let hasI18n = false;

      for (const fn of I18N_FUNCTIONS) {
        if (content.includes(fn + '(')) { hasI18n = true; break; }
      }

      if (!hasI18n && file.path !== 'style.css' && (content.includes('esc_html') || content.includes('__('))) {
        info.push({ file: file.path, message: 'Consider using WordPress i18n functions for user-facing strings', type: 'info' });
      }

      let hasThePost = false;
      let hasWpHead = false;
      let hasWpFooter = false;

      if (content.includes('the_post()') || content.includes('the_content()') || content.includes('the_title()')) hasThePost = true;
      if (content.includes('wp_head()')) hasWpHead = true;
      if (content.includes('wp_footer()')) hasWpFooter = true;

      if (file.path === 'header.php') {
        if (!hasWpHead) errors.push({ file: file.path, message: 'header.php must call wp_head()', type: 'error' });
        if (!content.includes('language_attributes')) warnings.push({ file: file.path, message: 'header.php should use language_attributes() in <html> tag', type: 'warning' });
        if (!content.includes('body_class')) warnings.push({ file: file.path, message: 'header.php should call body_class() in <body> tag', type: 'warning' });
      }

      if (file.path === 'footer.php') {
        if (!hasWpFooter) errors.push({ file: file.path, message: 'footer.php must call wp_footer()', type: 'error' });
      }

      if (file.path === 'sidebar.php' && !hasThePost) {
        warnings.push({ file: file.path, message: 'sidebar.php should typically include the_post() for proper loop handling', type: 'info' });
      }

      if (file.path === 'functions.php') {
        if (!content.includes('after_setup_theme') && !content.includes('init')) {
          warnings.push({ file: file.path, message: 'functions.php missing theme setup hook (after_setup_theme or init)', type: 'warning' });
        }
        if (!content.includes('wp_enqueue_scripts')) {
          warnings.push({ file: file.path, message: 'functions.php should enqueue scripts/styles via wp_enqueue_scripts', type: 'warning' });
        }
        if (content.includes('var_dump') || content.includes('print_r') || content.includes('error_reporting')) {
          errors.push({ file: file.path, message: 'functions.php contains debug functions (var_dump/print_r/error_reporting)', type: 'error' });
        }
      }

      for (let ln = 0; ln < lines.length; ln++) {
        const line = lines[ln];
        const trimmed = line.trim();

        if (trimmed.includes('$_GET') || trimmed.includes('$_POST') || trimmed.includes('$_REQUEST')) {
          if (!trimmed.includes('esc_') && !trimmed.includes('intval') && !trimmed.includes('sanitize_') && !trimmed.includes('absint')) {
            warnings.push({ file: file.path, line: ln + 1, message: 'Direct superglobal access without sanitization', type: 'warning' });
          }
        }

        if (trimmed.includes('mysql_') || trimmed.includes('mysqli_')) {
          if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
            errors.push({ file: file.path, line: ln + 1, message: 'Direct MySQL functions used instead of $wpdb', type: 'error' });
          }
        }
      }
    }
  }

  private checkAccessibility(
    files: ThemeFile[],
    warnings: ValidationIssue[],
    info: ValidationIssue[],
  ): void {
    for (const file of files) {
      if (!file.path.endsWith('.php') && !file.path.endsWith('.html')) continue;
      if (typeof file.content !== 'string') continue;

      const content = file.content;
      const lines = content.split('\n');

      const imgTags = content.match(/<img[^>]+>/g) || [];
      for (const img of imgTags) {
        if (!img.includes('alt=') && !img.includes('alt =')) {
          warnings.push({ file: file.path, message: 'Image missing alt attribute', type: 'warning' });
        }
        if (img.includes('alt=""') || img.includes("alt=''")) {
          info.push({ file: file.path, message: 'Image has empty alt text (OK for decorative images, verify intent)', type: 'info' });
        }
      }

      const inputTags = content.match(/<(input|select|textarea)[^>]*>/gi) || [];
      for (const input of inputTags) {
        if (!input.includes('aria-label') && !input.includes('aria-labelledby') && !input.includes('placeholder=') && !input.includes('id=')) {
          const match = input.match(/type\s*=\s*["']([^"']+)["']/i);
          const type = match ? match[1].toLowerCase() : 'text';
          if (type !== 'hidden' && type !== 'submit' && type !== 'button' && type !== 'checkbox' && type !== 'radio') {
            warnings.push({ file: file.path, message: `Form input missing accessible label (aria-label/placeholder/id): <${input.slice(0, 60)}...>`, type: 'warning' });
          }
        }
      }

      if (!content.includes('role=') && (content.includes('<nav') || content.includes('<header') || content.includes('<footer') || content.includes('<main'))) {
        info.push({ file: file.path, message: 'Consider adding ARIA roles to semantic HTML5 elements for older browsers', type: 'info' });
      }

      if (content.includes('aria-hidden="true"') || content.includes("aria-hidden='true'")) {
        info.push({ file: file.path, message: 'aria-hidden elements may hide content from screen readers', type: 'info' });
      }

      if (content.includes('tabindex="0"') || content.includes("tabindex='0'")) {
        info.push({ file: file.path, message: 'tabindex="0" found (verify interactive elements are keyboard-accessible)', type: 'info' });
      }

      const headings = content.match(/<h[1-6][^>]*>/gi) || [];
      if (headings.length > 0 && !content.includes('<h1')) {
        warnings.push({ file: file.path, message: 'Page has headings but no <h1> - consider adding one', type: 'warning' });
      }

      const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
      if (h1Count > 1) {
        info.push({ file: file.path, message: `Multiple <h1> elements found (${h1Count}). Consider using only one per page.`, type: 'info' });
      }

      for (let ln = 0; ln < lines.length; ln++) {
        const line = lines[ln];
        if (line.includes('color:') && line.includes('background')) {
          info.push({ file: file.path, line: ln + 1, message: 'Inline color+background combination found - verify contrast ratio meets WCAG AA (4.5:1)', type: 'info' });
        }
      }
    }
  }

  private checkCssQuality(
    files: ThemeFile[],
    warnings: ValidationIssue[],
    info: ValidationIssue[],
  ): void {
    for (const file of files) {
      if (!file.path.endsWith('.css')) continue;
      if (typeof file.content !== 'string') continue;

      const lines = file.content.split('\n');
      const content = file.content;

      if (content.includes('!important')) {
        warnings.push({ file: file.path, message: 'CSS uses !important - consider specificity improvements', type: 'warning' });
      }

      const emptyRules = content.match(/\.[a-zA-Z][^{]*\{\s*\}/g);
      if (emptyRules) {
        for (const rule of emptyRules) {
          warnings.push({ file: file.path, message: `Empty CSS rule: ${rule.trim().slice(0, 80)}`, type: 'warning' });
        }
      }

      const rgbaFallback = content.match(/rgba\([^)]+\)/g);
      const hexColors = content.match(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g);
      if (rgbaFallback && hexColors) {
        info.push({ file: file.path, message: 'Mixing rgba() and hex colors - consider using CSS custom properties for consistency', type: 'info' });
      }

      const vendorPrefixes = content.match(/-(webkit|moz|ms|o)-/g);
      if (vendorPrefixes) {
        info.push({ file: file.path, message: `Found ${vendorPrefixes.length} vendor-prefixed properties (may need Autoprefixer)`, type: 'info' });
      }

      let maxSpecificity = 0;
      for (const line of lines) {
        if (line.includes('{') && !line.trim().startsWith('@') && !line.trim().startsWith('/*')) {
          const selector = line.trim().split('{')[0].trim();
          const idCount = (selector.match(/#[a-zA-Z]/g) || []).length;
          const classCount = (selector.match(/\.[a-zA-Z]/g) || []).length;
          const elementCount = (selector.match(/(^|[ ,>+~])[a-z][a-zA-Z]*/g) || []).length;
          const specificity = idCount * 100 + classCount * 10 + elementCount;
          if (specificity > maxSpecificity) maxSpecificity = specificity;
        }
      }
      if (maxSpecificity > 100) {
        info.push({ file: file.path, message: `High CSS specificity detected (${maxSpecificity}). Consider BEM or other naming convention.`, type: 'info' });
      }

      if (content.includes('px') && !content.includes('rem') && !content.includes('em')) {
        info.push({ file: file.path, message: 'Only px units found - consider using rem/em for better accessibility scaling', type: 'info' });
      }

      const duplicateSelector = this.findDuplicateSelectors(content);
      for (const [selector, locations] of duplicateSelector) {
        warnings.push({ file: file.path, message: `Duplicate CSS selector "${selector}" at lines ${locations.join(', ')}`, type: 'warning' });
      }
    }
  }

  private findDuplicateSelectors(css: string): Map<string, number[]> {
    const selectorMap = new Map<string, number[]>();
    const lines = css.split('\n');
    let currentSelector = '';
    let currentLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('/*') || line.startsWith('*') || line.startsWith('@') || line.startsWith('}')) continue;

      if (line.includes('{') && !line.includes('@')) {
        currentSelector = line.split('{')[0].trim();
        currentLine = i + 1;

        if (currentSelector.startsWith('.') || currentSelector.startsWith('#') || currentSelector.startsWith('[') || /^[a-zA-Z]/.test(currentSelector)) {
          if (!selectorMap.has(currentSelector)) {
            selectorMap.set(currentSelector, []);
          }
          selectorMap.get(currentSelector)!.push(currentLine);
        }
      }
    }

    const duplicates = new Map<string, number[]>();
    for (const [selector, lines] of selectorMap) {
      if (lines.length > 1) {
        duplicates.set(selector, lines);
      }
    }
    return duplicates;
  }

  private checkElementor(
    files: ThemeFile[],
    warnings: ValidationIssue[],
    info: ValidationIssue[],
  ): void {
    const hasWidgets = files.some(f => f.path === 'inc/elementor-widgets.php');
    const hasGlobalSettings = files.some(f => f.path === 'elementor/global-settings.json');
    const hasTemplates = files.some(f => f.path.startsWith('elementor/templates/'));

    if (!hasWidgets) {
      info.push({ file: 'inc/elementor-widgets.php', message: 'No Elementor widget registration found', type: 'info' });
    }
    if (!hasGlobalSettings) {
      info.push({ file: 'elementor/global-settings.json', message: 'No Elementor global settings file found', type: 'info' });
    }
    if (hasWidgets && !hasTemplates) {
      info.push({ file: 'elementor/templates/', message: 'Elementor widgets registered but no template files found', type: 'info' });
    }

    for (const file of files) {
      if (!file.path.endsWith('.json')) continue;

      try {
        if (typeof file.content === 'string') JSON.parse(file.content);
      } catch (e) {
        warnings.push({ file: file.path, message: `Invalid JSON in ${file.path}: ${(e as Error).message}`, type: 'warning' });
      }
    }
  }

  private measurePerformance(files: ThemeFile[]): ValidationReport['performance'] {
    let totalSize = 0;
    let cssSize = 0;
    let jsSize = 0;
    let phpSize = 0;
    let imageCount = 0;
    let largestFile: { path: string; size: number } | null = null;

    for (const file of files) {
      const size = new Blob([file.content]).size;
      totalSize += size;

      if (file.path.endsWith('.css')) cssSize += size;
      else if (file.path.endsWith('.js')) jsSize += size;
      else if (file.path.endsWith('.php')) phpSize += size;
      if (file.path.startsWith('assets/images/')) imageCount++;

      if (!largestFile || size > largestFile.size) {
        largestFile = { path: file.path, size };
      }
    }

    return { totalSize, cssSize, jsSize, phpSize, imageCount, largestFile };
  }

  private buildAccessibilityReport(files: ThemeFile[], warnings: ValidationIssue[]): ValidationReport['accessibility'] {
    const missingAltText: string[] = [];
    const missingLabels: string[] = [];
    const contrastIssues: string[] = [];
    const ariaIssues: string[] = [];
    const semanticIssues: string[] = [];

    for (const w of warnings) {
      if (w.message.includes('alt attribute')) {
        if (!missingAltText.includes(w.file)) missingAltText.push(w.file);
      }
      if (w.message.includes('accessible label')) {
        if (!missingLabels.includes(w.file)) missingLabels.push(w.file);
      }
    }

    for (const file of files) {
      if (!file.path.endsWith('.php') && !file.path.endsWith('.html') && !file.path.endsWith('.css')) continue;
      if (typeof file.content !== 'string') continue;

      // Real WCAG contrast ratio calculation
      const colorPairs = this.extractColorPairs(file.content);
      for (const { foreground, background, line } of colorPairs) {
        const ratio = this.calculateContrastRatio(foreground, background);
        if (ratio < 3) {
          contrastIssues.push(`${file.path}:${line} - ${foreground}/${background} AA text:fail(${ratio.toFixed(2)}:1), large:fail`);
        } else if (ratio < 4.5) {
          const largePass = ratio >= 3 ? 'pass' : 'fail';
          contrastIssues.push(`${file.path}:${line} - ${foreground}/${background} AA text:fail(${ratio.toFixed(2)}:1), large:${largePass}`);
        }
      }

      if (file.content.includes('aria-hidden') && !file.content.includes('aria-describedby')) {
        ariaIssues.push(file.path);
      }
    }

    const totalAccessibilityIssues = missingAltText.length + missingLabels.length + contrastIssues.length + ariaIssues.length;
    const score = Math.max(0, Math.min(100, 100 - totalAccessibilityIssues * 10));

    return { score, missingAltText, missingLabels, contrastIssues, ariaIssues, semanticIssues };
  }

  /**
   * WCAG contrast ratio calculation using relative luminance.
   * Ratio is (L1 + 0.05) / (L2 + 0.05) where L1 > L2.
   * AA text requires 4.5:1, AA large requires 3:1.
   */
  private calculateContrastRatio(hex1: string, hex2: string): number {
    const l1 = this.relativeLuminance(this.parseHex(hex1));
    const l2 = this.relativeLuminance(this.parseHex(hex2));
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private relativeLuminance([r, g, b]: [number, number, number]): number {
    const toLinear = (c: number): number => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  private parseHex(hex: string): [number, number, number] {
    const clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16);
      const g = parseInt(clean[1] + clean[1], 16);
      const b = parseInt(clean[2] + clean[2], 16);
      return [r, g, b];
    }
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b];
  }

  /**
   * Extract foreground/background color pairs from CSS and inline styles.
   * Looks for "color: #xxx; background: #xxx" patterns and CSS custom property usage.
   */
  private extractColorPairs(content: string): { foreground: string; background: string; line: number }[] {
    const pairs: { foreground: string; background: string; line: number }[] = [];
    const lines = content.split('\n');

    // Pattern 1: CSS rules with color + background in same rule
    let currentRule: { startLine: number; text: string } | null = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('{') && !line.trim().startsWith('@') && !line.trim().startsWith('/*')) {
        currentRule = { startLine: i + 1, text: '' };
      }

      if (currentRule) {
        currentRule.text += line;
      }

      if (line.includes('}') && currentRule) {
        // Process the complete rule
        const colorMatch = currentRule.text.match(/color:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
        const bgMatch = currentRule.text.match(/background(?:-color)?:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
        if (colorMatch && bgMatch) {
          const fg = this.normalizeColor(colorMatch[1]);
          const bg = this.normalizeColor(bgMatch[1]);
          if (fg && bg) {
            pairs.push({ foreground: fg, background: bg, line: currentRule.startLine });
          }
        }
        currentRule = null;
      }
    }

    // Pattern 2: Inline style="color:...;background:..."
    const inlineStyles = content.match(/style="[^"]*color:[^"]*background:[^"]*"/g) || [];
    for (const style of inlineStyles) {
      const colorMatch = style.match(/color:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
      const bgMatch = style.match(/background(?:-color)?:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
      if (colorMatch && bgMatch) {
        const fg = this.normalizeColor(colorMatch[1]);
        const bg = this.normalizeColor(bgMatch[1]);
        if (fg && bg) {
          pairs.push({ foreground: fg, background: bg, line: 0 });
        }
      }
    }

    return pairs;
  }

  /**
   * Normalize color value to hex string. Returns null for vars or complex values.
   */
  private normalizeColor(value: string): string | null {
    const trimmed = value.trim();

    // Already hex
    const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3,6})$/);
    if (hexMatch) return trimmed;

    // rgb/rgba to hex approximation
    const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // CSS var -- can't resolve statically
    if (trimmed.startsWith('var(')) return null;

    return null;
  }

  private buildWordPressReport(
    files: ThemeFile[],
    _errors: ValidationIssue[],
    _warnings: ValidationIssue[],
    _info: ValidationIssue[],
  ): ValidationReport['wordpress'] {
    let escapingFunctions = 0;
    let noncesFound = 0;
    let i18nFunctions = 0;
    let fileHeadersValid = true;
    const themeModsFound: string[] = [];
    const hooksSet = new Set<string>();

    for (const file of files) {
      if (typeof file.content !== 'string') continue;
      const content = file.content;

      for (const fn of ESCAPING_FUNCTIONS) {
        const matches = content.match(new RegExp(`${fn}\\s*\\(`, 'g'));
        if (matches) escapingFunctions += matches.length;
      }

      for (const fn of NONCE_FUNCTIONS) {
        const matches = content.match(new RegExp(`${fn}\\s*\\(`, 'g'));
        if (matches) noncesFound += matches.length;
      }

      for (const fn of I18N_FUNCTIONS) {
        const matches = content.match(new RegExp(`${fn}\\s*\\(`, 'g'));
        if (matches) i18nFunctions += matches.length;
      }

      const getThemeMods = content.match(/get_theme_mod\s*\(\s*['"](\w+)['"]/g);
      if (getThemeMods) {
        for (const m of getThemeMods) {
          const name = m.match(/['"](\w+)['"]/)?.[1];
          if (name) themeModsFound.push(name);
        }
      }

      for (const hook of WORDPRESS_HOOKS) {
        if (content.includes(hook + '(')) hooksSet.add(hook);
      }

      if (file.path === 'style.css') {
        fileHeadersValid = content.includes('Theme Name:') && content.includes('Text Domain:') && content.includes('Version:');
      }
    }

    return {
      escapingFunctions,
      noncesFound,
      i18nFunctions,
      fileHeadersValid,
      themeModsFound: [...new Set(themeModsFound)],
      hooksUsed: [...hooksSet],
    };
  }

  private calculateScore(errors: number, warnings: number, _total: number): number {
    const errorPenalty = errors * 25;
    const warningPenalty = warnings * 5;
    return Math.max(0, Math.min(100, 100 - errorPenalty - warningPenalty));
  }
}
