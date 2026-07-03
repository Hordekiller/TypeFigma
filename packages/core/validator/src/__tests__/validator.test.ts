import { describe, it, expect } from 'vitest';
import { Validator } from '../index.js';
import type { ThemeFile } from '@typefigma/theme-builder';

describe('Validator', () => {
  const validator = new Validator();

  const createValidTheme = (): ThemeFile[] => [
    { path: 'style.css', content: '/* Theme Name: Test */' },
    { path: 'index.php', content: '<?php get_header(); the_content(); get_footer();' },
    { path: 'single.php', content: '<?php /* single */' },
    { path: 'page.php', content: '<?php /* page */' },
    { path: 'archive.php', content: '<?php /* archive */' },
    { path: 'sidebar.php', content: '<?php /* sidebar */' },
    { path: '404.php', content: '<?php /* 404 */' },
    { path: 'search.php', content: '<?php /* search */' },
    { path: 'header.php', content: '<?php wp_head(); ?><html>' },
    { path: 'footer.php', content: '<?php wp_footer(); ?></html>' },
    { path: 'functions.php', content: '<?php add_action("init", function() { __("hello", "txt"); });' },
  ];

  it('should pass a complete valid theme', () => {
    const report = validator.validate(createValidTheme());
    expect(report.errors.length).toBe(0);
    expect(report.summary.passed).toBe(true);
  });

  it('should detect missing required files', () => {
    const files: ThemeFile[] = [{ path: 'style.css', content: '/* Theme Name: Test */' }];
    const report = validator.validate(files);
    expect(report.errors.length).toBeGreaterThan(0);
    expect(report.structure.missingRequired.length).toBeGreaterThan(0);
  });

  it('should calculate a performance summary', () => {
    const report = validator.validate(createValidTheme());
    expect(report.summary.score).toBeGreaterThanOrEqual(0);
    expect(report.summary.score).toBeLessThanOrEqual(100);
    expect(report.performance.totalSize).toBeGreaterThan(0);
  });

  it('should check for WordPress escaping functions', () => {
    const files: ThemeFile[] = [
      { path: 'functions.php', content: '<?php echo esc_html($var); echo esc_attr($x);' },
      ...createValidTheme().slice(1),
      { path: 'style.css', content: '/* Theme Name: Test */' },
    ];
    const report = validator.validate(files);
    expect(report.wordpress.escapingFunctions).toBeGreaterThanOrEqual(2);
  });

  it('should check for i18n functions', () => {
    const report = validator.validate(createValidTheme());
    expect(report.wordpress.i18nFunctions).toBeGreaterThanOrEqual(1);
  });

  it('should check for wp_head and wp_footer in header/footer', () => {
    const files: ThemeFile[] = [
      ...createValidTheme().filter(f => f.path !== 'header.php' && f.path !== 'footer.php'),
      { path: 'header.php', content: '<html>' },
      { path: 'footer.php', content: '</html>' },
      { path: 'style.css', content: '/* Theme Name: Test */' },
    ];
    const report = validator.validate(files);
    expect(report.errors.some(e => e.message.toLowerCase().includes('wp_head'))).toBe(true);
  });

  it('should detect PHP syntax issues (unclosed braces)', () => {
    const files: ThemeFile[] = [
      ...createValidTheme().filter(f => f.path !== 'functions.php'),
      { path: 'functions.php', content: '<?php function test() { if (true) { echo "hi"; }' },
      { path: 'style.css', content: '/* Theme Name: Test */' },
    ];
    const report = validator.validate(files);
    expect(report.errors.some(e => e.message.toLowerCase().includes('brace') || e.message.toLowerCase().includes('syntax'))).toBe(true);
  });

  it('should handle empty file list', () => {
    const report = validator.validate([]);
    expect(report.errors.length).toBeGreaterThan(0);
    expect(report.summary.passed).toBe(false);
  });

  it('should handle files with empty string content', () => {
    const files: ThemeFile[] = [
      { path: 'style.css', content: '' },
      { path: 'index.php', content: '' },
      { path: 'header.php', content: '' },
      { path: 'footer.php', content: '' },
      { path: 'functions.php', content: '' },
    ];
    const report = validator.validate(files);
    expect(report.summary.passed).toBe(false);
    expect(report.performance.totalSize).toBeGreaterThanOrEqual(0);
  });

  it('should detect missing style.css header', () => {
    const files: ThemeFile[] = [
      ...createValidTheme().filter(f => f.path !== 'style.css'),
      { path: 'style.css', content: 'body { color: red; }' },
    ];
    const report = validator.validate(files);
    const hasThemeName = report.errors.some(e => e.message.toLowerCase().includes('theme name'));
    expect(hasThemeName || !report.summary.passed).toBe(true);
  });

  it('should detect Elementor configuration issues', () => {
    const files: ThemeFile[] = [
      ...createValidTheme(),
    ];
    const report = validator.validate(files);
    expect(report.info.some(i => i.file === 'inc/elementor-widgets.php')).toBe(true);
  });

  it('should handle files with Buffer content', () => {
    const files: ThemeFile[] = [
      ...createValidTheme(),
      { path: 'screenshot.png', content: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) },
      { path: 'favicon.ico', content: Buffer.from([0, 0, 1, 0]) },
    ];
    const report = validator.validate(files);
    expect(report.errors.length).toBe(0);
    expect(report.performance.totalSize).toBeGreaterThan(0);
  });
});
