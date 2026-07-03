import { describe, it, expect, beforeEach } from 'vitest';
import { FontManager } from '../font-manager.js';
import type { FontFamilyEntry } from '../font-manager.js';
import type { ExtractedTokens } from '@typefigma/analyzer';

describe('FontManager', () => {
  let fm: FontManager;

  beforeEach(() => {
    fm = new FontManager();
  });

  describe('getBuiltinFonts', () => {
    it('should return all popular fonts when no query', () => {
      const fonts = fm.getBuiltinFonts('');
      expect(fonts.length).toBe(10);
      expect(fonts[0].family).toBe('Inter');
      expect(fonts[0].downloadUrl).toBeDefined();
      expect(fonts[0].category).toBe('sans-serif');
    });

    it('should filter fonts by query', () => {
      const fonts = fm.getBuiltinFonts('roboto');
      expect(fonts.length).toBe(1);
      expect(fonts[0].family).toBe('Roboto');
    });

    it('should return empty array for no match', () => {
      const fonts = fm.getBuiltinFonts('xyznonexistent');
      expect(fonts.length).toBe(0);
    });

    it('should be case insensitive', () => {
      const fonts = fm.getBuiltinFonts('INTER');
      expect(fonts.length).toBe(1);
      expect(fonts[0].family).toBe('Inter');
    });
  });

  describe('importLocalFont', () => {
    it('should parse regular font weight', () => {
      const buffer = Buffer.from('fake-font-data');
      const entry = fm.importLocalFont('/path/to/OpenSans-Regular.woff2', buffer);
      expect(entry.name).toBe('Open Sans');
      expect(entry.slug).toBe('open-sans');
      expect(entry.fontFace[0].fontWeight).toBe('400');
      expect(entry.fontFace[0].fontStyle).toBe('normal');
      expect(entry.fontFace[0].fontDisplay).toBe('swap');
      expect(entry.fontFace[0].src[0]).toContain('open-sans.woff2');
    });

    it('should detect bold weight', () => {
      const entry = fm.importLocalFont('Roboto-Bold.ttf', Buffer.from('x'));
      expect(entry.fontFace[0].fontWeight).toBe('700');
    });

    it('should detect italic style', () => {
      const entry = fm.importLocalFont('Roboto-Italic.woff2', Buffer.from('x'));
      expect(entry.fontFace[0].fontStyle).toBe('italic');
    });

    it('should use custom family name', () => {
      const entry = fm.importLocalFont('custom.woff2', Buffer.from('x'), 'My Font');
      expect(entry.name).toBe('My Font');
      expect(entry.slug).toBe('my-font');
    });

    it('should handle various weight keywords', () => {
      const weights: Array<{ name: string; expected: number }> = [
        { name: 'Thin', expected: 100 },
        { name: 'ExtraLight', expected: 200 },
        { name: 'Light', expected: 300 },
        { name: 'Regular', expected: 400 },
        { name: 'Medium', expected: 500 },
        { name: 'SemiBold', expected: 600 },
        { name: 'Bold', expected: 700 },
        { name: 'ExtraBold', expected: 800 },
        { name: 'Black', expected: 900 },
      ];
      for (const w of weights) {
        const entry = fm.importLocalFont(`Font-${w.name}.woff2`, Buffer.from('x'));
        expect(entry.fontFace[0].fontWeight).toBe(`${w.expected}`);
      }
    });

    it('should generate fallback for sans-serif fonts', () => {
      const entry = fm.importLocalFont('Inter-Regular.woff2', Buffer.from('x'));
      expect(entry.fallback).toContain('sans-serif');
    });

    it('should generate serif fallback for serif fonts', () => {
      const entry = fm.importLocalFont('PlayfairDisplay-Regular.woff2', Buffer.from('x'));
      expect(entry.fallback).toContain('serif');
    });

    it('should generate monospace fallback for mono fonts', () => {
      const entry = fm.importLocalFont('FiraCode-Regular.woff2', Buffer.from('x'));
      expect(entry.fallback).toContain('monospace');
    });
  });

  describe('generateFontFaceCss', () => {
    it('should generate @font-face CSS', () => {
      const entry: FontFamilyEntry = {
        fontFamily: 'Inter, sans-serif',
        name: 'Inter',
        slug: 'inter',
        fallback: 'sans-serif',
        fontFace: [{
          fontFamily: 'Inter',
          fontWeight: '400',
          fontStyle: 'normal',
          fontDisplay: 'swap',
          src: ['file:./assets/fonts/inter-regular.woff2'],
        }],
      };
      const css = fm.generateFontFaceCss(entry);
      expect(css).toContain('@font-face');
      expect(css).toContain("font-family: 'Inter'");
      expect(css).toContain('font-weight: 400');
      expect(css).toContain('font-display: swap');
      expect(css).toContain("url('file:./assets/fonts/inter-regular.woff2')");
    });

    it('should handle multiple font faces', () => {
      const entry: FontFamilyEntry = {
        fontFamily: 'Inter, sans-serif',
        name: 'Inter',
        slug: 'inter',
        fallback: 'sans-serif',
        fontFace: [
          { fontFamily: 'Inter', fontWeight: '400', fontStyle: 'normal', fontDisplay: 'swap', src: ['file:./regular.woff2'] },
          { fontFamily: 'Inter', fontWeight: '700', fontStyle: 'normal', fontDisplay: 'swap', src: ['file:./bold.woff2'] },
        ],
      };
      const css = fm.generateFontFaceCss(entry);
      expect(css.match(/@font-face/g)?.length).toBe(2);
    });
  });

  describe('generateFontsPhp', () => {
    it('should generate PHP enqueue code for Google Fonts', () => {
      const entries: FontFamilyEntry[] = [{
        fontFamily: 'Inter, sans-serif',
        name: 'Inter',
        slug: 'inter',
        fallback: 'sans-serif',
        fontFace: [{ fontFamily: 'Inter', fontWeight: '400', fontStyle: 'normal', fontDisplay: 'swap', src: [] }],
      }];
      const php = fm.generateFontsPhp(entries, 'test-theme');
      expect(php).toContain('<?php');
      expect(php).toContain('test_theme_enqueue_fonts');
      expect(php).toContain('fonts.googleapis.com');
      expect(php).toContain('add_action');
    });

    it('should generate variable font URLs for italic fonts', () => {
      const entries: FontFamilyEntry[] = [{
        fontFamily: 'Roboto, sans-serif',
        name: 'Roboto',
        slug: 'roboto',
        fallback: 'sans-serif',
        fontFace: [
          { fontFamily: 'Roboto', fontWeight: '400', fontStyle: 'normal', fontDisplay: 'swap', src: [] },
          { fontFamily: 'Roboto', fontWeight: '400', fontStyle: 'italic', fontDisplay: 'swap', src: [] },
        ],
      }];
      const php = fm.generateFontsPhp(entries, 'test');
      expect(php).toContain('ital,wght');
      expect(php).toContain('0,400');
      expect(php).toContain('1,400');
    });

    it('should generate multiple enqueue calls for multiple fonts', () => {
      const entries: FontFamilyEntry[] = [
        { fontFamily: 'Inter, sans-serif', name: 'Inter', slug: 'inter', fallback: 'sans-serif', fontFace: [{ fontFamily: 'Inter', fontWeight: '400', fontStyle: 'normal', fontDisplay: 'swap', src: [] }] },
        { fontFamily: 'Roboto, sans-serif', name: 'Roboto', slug: 'roboto', fallback: 'sans-serif', fontFace: [{ fontFamily: 'Roboto', fontWeight: '400', fontStyle: 'normal', fontDisplay: 'swap', src: [] }] },
      ];
      const php = fm.generateFontsPhp(entries, 'test');
      const matches = php.match(/wp_enqueue_style/g);
      expect(matches?.length).toBe(2);
    });
  });

  describe('mergeWithTokens', () => {
    const baseTokens: ExtractedTokens = {
      colors: {} as any,
      typography: {
        fontFamilies: {
          heading: { name: 'Inter', weights: [400], fallback: 'sans-serif' },
          body: { name: 'Inter', weights: [400], fallback: 'sans-serif' },
        },
        fontSizes: {},
        fontWeights: {},
        lineHeights: {},
        letterSpacing: {},
        textStyles: null as unknown as ExtractedTokens['typography']['textStyles'],
      },
      spacing: {}, sizing: {}, borderRadius: {}, shadows: {},
      borders: { width: {}, styles: {} },
      transitions: { duration: {}, timing: {} },
      breakpoints: {}, zIndex: {},
    };

    it('should merge heading font into tokens', () => {
      const entry: FontFamilyEntry = {
        fontFamily: 'Roboto, sans-serif',
        name: 'Roboto',
        slug: 'heading',
        fallback: 'sans-serif',
        fontFace: [{ fontFamily: 'Roboto', fontWeight: '400', fontStyle: 'normal', fontDisplay: 'swap', src: [] }],
      };
      const merged = fm.mergeWithTokens([entry], baseTokens);
      expect(merged.typography.fontFamilies.heading.name).toBe('Roboto');
      expect(merged.typography.fontFamilies.heading.weights).toEqual([400]);
    });

    it('should merge body font into tokens', () => {
      const entry: FontFamilyEntry = {
        fontFamily: 'Open Sans, sans-serif',
        name: 'Open Sans',
        slug: 'body',
        fallback: 'sans-serif',
        fontFace: [{ fontFamily: 'Open Sans', fontWeight: '400', fontStyle: 'normal', fontDisplay: 'swap', src: [] }],
      };
      const merged = fm.mergeWithTokens([entry], baseTokens);
      expect(merged.typography.fontFamilies.body.name).toBe('Open Sans');
    });

    it('should handle custom font slugs', () => {
      const entry: FontFamilyEntry = {
        fontFamily: 'Playfair Display, serif',
        name: 'Playfair Display',
        slug: 'display-font',
        fallback: 'serif',
        fontFace: [{ fontFamily: 'Playfair Display', fontWeight: '700', fontStyle: 'normal', fontDisplay: 'swap', src: [] }],
      };
      const merged = fm.mergeWithTokens([entry], baseTokens);
      expect((merged.typography.fontFamilies as any)['display-font']).toBeDefined();
    });

    it('should not mutate the original tokens', () => {
      const entry: FontFamilyEntry = {
        fontFamily: 'Roboto, sans-serif',
        name: 'Roboto',
        slug: 'heading',
        fallback: 'sans-serif',
        fontFace: [{ fontFamily: 'Roboto', fontWeight: '400', fontStyle: 'normal', fontDisplay: 'swap', src: [] }],
      };
      const merged = fm.mergeWithTokens([entry], baseTokens);
      expect(merged).not.toBe(baseTokens);
      expect(merged.typography).not.toBe(baseTokens.typography);
      expect(merged.typography.fontFamilies).not.toBe(baseTokens.typography.fontFamilies);
      expect(baseTokens.typography.fontFamilies.heading.name).toBe('Inter');
    });
  });

  describe('slugify', () => {
    it('should convert font name to slug', () => {
      expect((fm as any).slugify('Open Sans')).toBe('open-sans');
      expect((fm as any).slugify('Source Code Pro')).toBe('source-code-pro');
    });
  });

  describe('parseGoogleFontCssVariants', () => {
    it('should parse weights from CSS', () => {
      const css = `@font-face { font-family: 'Inter'; font-weight: 400; src: url(...); } @font-face { font-family: 'Inter'; font-weight: 700; src: url(...); }`;
      const variants = (fm as any).parseGoogleFontCssVariants(css);
      expect(variants).toContain('400');
      expect(variants).toContain('700');
    });

    it('should return fallback variants when no weights found', () => {
      const variants = (fm as any).parseGoogleFontCssVariants('');
      expect(variants).toEqual(['regular', '700']);
    });
  });

  describe('getFallbackForFont', () => {
    it('should return serif for serif fonts', () => {
      const fb = (fm as any).getFallbackForFont('Playfair Display');
      expect(fb).toContain('serif');
    });

    it('should return monospace for mono fonts', () => {
      const fb = (fm as any).getFallbackForFont('Fira Code');
      expect(fb).toContain('monospace');
    });

    it('should return sans-serif system stack by default', () => {
      const fb = (fm as any).getFallbackForFont('Inter');
      expect(fb).toContain('Segoe UI');
    });
  });

  describe('getExtension', () => {
    it('should extract extension from path', () => {
      expect((fm as any).getExtension('/path/to/font.woff2')).toBe('woff2');
      expect((fm as any).getExtension('font.ttf')).toBe('ttf');
    });

    it('should default to woff2', () => {
      expect((fm as any).getExtension('font')).toBe('woff2');
    });
  });

  describe('guessFontName', () => {
    it('should derive name from filename', () => {
      const name = (fm as any).guessFontName('OpenSans-Regular.woff2');
      expect(name).toBe('Open Sans');
    });

    it('should strip weight/style suffixes', () => {
      const name = (fm as any).guessFontName('Roboto-BoldItalic.woff2');
      expect(name).toBe('Roboto');
    });
  });

  describe('guessWeightFromFilename', () => {
    it('should detect all weight keywords', () => {
      const cases: Array<[string, number]> = [
        ['thin', 100], ['extralight', 200], ['light', 300],
        ['regular', 400], ['medium', 500], ['semibold', 600],
        ['bold', 700], ['extrabold', 800], ['black', 900],
      ];
      for (const [keyword, expected] of cases) {
        expect((fm as any).guessWeightFromFilename(`Font-${keyword}.woff2`)).toBe(expected);
      }
    });

    it('should default to 400', () => {
      expect((fm as any).guessWeightFromFilename('Font.woff2')).toBe(400);
    });
  });

  describe('downloadGoogleFont', () => {
    it('should return entry with font metadata even when network fails', async () => {
      const entry = await fm.downloadGoogleFont('NonExistentFont123', [400]);
      expect(entry.name).toBe('NonExistentFont123');
      expect(entry.slug).toBe('non-existent-font123');
      expect(entry.fontFace.length).toBe(0);
    }, 10000);
  });
});
