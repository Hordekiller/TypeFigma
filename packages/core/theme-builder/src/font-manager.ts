import type { ExtractedTokens } from '@typefigma/analyzer';

export interface FontVariant {
  weight: number;
  style: 'normal' | 'italic';
  file: Buffer;
  format: 'woff2' | 'woff' | 'ttf' | 'otf';
  filename: string;
}

export interface FontFamilyEntry {
  fontFamily: string;
  name: string;
  slug: string;
  fallback: string;
  fontFace: FontFaceDeclaration[];
}

export interface FontFaceDeclaration {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  fontDisplay: string;
  fontStretch?: string;
  src: string[];
}

export interface GoogleFontMetadata {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
  downloadUrl: string;
}

export interface FontManagerOptions {
  cacheDir?: string;
  googleFontsKey?: string;
}

const GOOGLE_FONTS_CSS_API = 'https://fonts.googleapis.com/css2';

export class FontManager {
  private options: FontManagerOptions;

  constructor(options: FontManagerOptions = {}) {
    this.options = options;
  }

  async searchGoogleFonts(query: string): Promise<GoogleFontMetadata[]> {
    try {
      const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${this.options.googleFontsKey || ''}&sort=popularity`;
      const res = await fetch(url);
      if (!res.ok) return this.getBuiltinFonts(query);

      const data = await res.json() as { items: Array<{ family: string; variants: string[]; subsets: string[]; category: string }> };
      const items = data.items || [];

      return items
        .filter(f => f.family.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 20)
        .map(f => ({
          family: f.family,
          variants: f.variants,
          subsets: f.subsets,
          category: f.category,
          downloadUrl: `https://fonts.google.com/download?family=${encodeURIComponent(f.family)}`,
        }));
    } catch {
      return this.getBuiltinFonts(query);
    }
  }

  async getGoogleFontVariants(family: string): Promise<GoogleFontMetadata | null> {
    try {
      const cssUrl = `${GOOGLE_FONTS_CSS_API}?family=${encodeURIComponent(family)}&display=swap`;
      const res = await fetch(cssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
      });
      if (!res.ok) return null;

      const css = await res.text();
      const variants = this.parseGoogleFontCssVariants(css);

      return {
        family,
        variants,
        subsets: [],
        category: 'sans-serif',
        downloadUrl: `https://fonts.google.com/download?family=${encodeURIComponent(family)}`,
      };
    } catch {
      return null;
    }
  }

  async downloadGoogleFont(family: string, weights: number[], styles: ('normal' | 'italic')[] = ['normal']): Promise<FontFamilyEntry> {
    const slug = this.slugify(family);
    const fontFace: FontFaceDeclaration[] = [];
    const fontAssets: FontVariant[] = [];

    for (const weight of weights) {
      for (const style of styles) {
        const cssUrl = `${GOOGLE_FONTS_CSS_API}?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
        try {
          const res = await fetch(cssUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
          });
          if (!res.ok) continue;

          const css = await res.text();
          const urlMatch = css.match(/url\(([^)]+)\)/);
          if (!urlMatch) continue;

          const fileUrl = urlMatch[1].replace(/["']/g, '');
          const fileRes = await fetch(fileUrl);
          if (!fileRes.ok) continue;

          const buffer = Buffer.from(await fileRes.arrayBuffer());
          const ext = fileUrl.endsWith('.woff2') ? 'woff2' : fileUrl.endsWith('.woff') ? 'woff' : 'ttf';
          const filename = `${slug}-${weight}${style === 'italic' ? 'i' : ''}.${ext}`;

          fontFace.push({
            fontFamily: family,
            fontWeight: `${weight}`,
            fontStyle: style,
            fontDisplay: 'swap',
            src: [`file:./assets/fonts/${slug}/${filename}`],
          });

          fontAssets.push({
            weight,
            style,
            file: buffer,
            format: ext as 'woff2' | 'woff' | 'ttf',
            filename,
          });
        } catch {
          continue;
        }
      }
    }

    return {
      fontFamily: `${family}, ${this.getFallbackForFont(family)}`,
      name: family,
      slug,
      fallback: this.getFallbackForFont(family),
      fontFace,
    };
  }

  importLocalFont(filePath: string, _buffer: Buffer, family?: string): FontFamilyEntry {
    const ext = this.getExtension(filePath);
    const fontName = family || this.guessFontName(filePath);
    const slug = this.slugify(fontName);
    const filename = `${slug}.${ext}`;

    const weight = this.guessWeightFromFilename(filePath);
    const style = filePath.toLowerCase().includes('italic') ? 'italic' : 'normal';

    return {
      fontFamily: `${fontName}, ${this.getFallbackForFont(fontName)}`,
      name: fontName,
      slug,
      fallback: this.getFallbackForFont(fontName),
      fontFace: [{
        fontFamily: fontName,
        fontWeight: `${weight}`,
        fontStyle: style,
        fontDisplay: 'swap',
        src: [`file:./assets/fonts/${filename}`],
      }],
    };
  }

  generateFontFaceCss(entry: FontFamilyEntry): string {
    const lines: string[] = [];
    for (const face of entry.fontFace) {
      lines.push('@font-face {');
      lines.push(`  font-family: '${face.fontFamily}';`);
      lines.push(`  font-weight: ${face.fontWeight};`);
      lines.push(`  font-style: ${face.fontStyle};`);
      lines.push(`  font-display: ${face.fontDisplay};`);
      lines.push(`  src: ${face.src.map(s => `url('${s}')`).join(', ')};`);
      lines.push('}');
    }
    return lines.join('\n');
  }

  generateFontsPhp(entries: FontFamilyEntry[], textDomain: string): string {
    const funcPrefix = this.slugify(textDomain).replace(/-/g, '_');
    return `<?php
/**
 * Google Fonts & Custom Fonts Enqueue
 *
 * @package ${textDomain}
 */

function ${funcPrefix}_enqueue_fonts() {
    ${entries.map(entry => {
      const family = entry.fontFace[0]?.fontFamily || entry.name;
      const weights = [...new Set(entry.fontFace.map(f => f.fontWeight))].join(',');
      const italic = entry.fontFace.some(f => f.fontStyle === 'italic');
      const italicParam = italic ? ':ital,wght@0,' + weights.split(',').map(w => `0,${w};1,${w}`).join(';') : `:wght@${weights}`;
      return `wp_enqueue_style( '${entry.slug}-fonts', 'https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}${italicParam}&display=swap', array(), null );`;
    }).join('\n    ')}
}
add_action( 'wp_enqueue_scripts', '${funcPrefix}_enqueue_fonts' );
`;
  }

  mergeWithTokens(entries: FontFamilyEntry[], tokens: ExtractedTokens): ExtractedTokens {
    const merged = { ...tokens };
    merged.typography = { ...merged.typography };
    merged.typography.fontFamilies = { ...merged.typography.fontFamilies };

    for (const entry of entries) {
      const slug = entry.slug;
      if (slug === 'heading' || slug === 'body') {
        const key = slug as 'heading' | 'body';
        merged.typography.fontFamilies[key] = {
          name: entry.fontFace[0]?.fontFamily || entry.name,
          weights: entry.fontFace.map(f => parseInt(f.fontWeight)).filter(n => !isNaN(n)),
          fallback: entry.fallback,
        };
      } else {
        merged.typography.fontFamilies[slug as keyof typeof merged.typography.fontFamilies] = {
          name: entry.fontFace[0]?.fontFamily || entry.name,
          weights: entry.fontFace.map(f => parseInt(f.fontWeight)).filter(n => !isNaN(n)),
          fallback: entry.fallback,
        } as any;
      }
    }

    return merged;
  }

  getBuiltinFonts(query: string): GoogleFontMetadata[] {
    const popular = [
      { family: 'Inter', variants: ['regular', '500', '600', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
      { family: 'Roboto', variants: ['regular', '500', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
      { family: 'Open Sans', variants: ['regular', '600', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
      { family: 'Lato', variants: ['regular', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
      { family: 'Montserrat', variants: ['regular', '500', '600', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
      { family: 'Poppins', variants: ['regular', '500', '600', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
      { family: 'Nunito', variants: ['regular', '600', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
      { family: 'Playfair Display', variants: ['regular', '700'], subsets: ['latin'], category: 'serif', downloadUrl: '' },
      { family: 'Source Sans 3', variants: ['regular', '600', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
      { family: 'DM Sans', variants: ['regular', '500', '700'], subsets: ['latin'], category: 'sans-serif', downloadUrl: '' },
    ];

    if (!query) return popular;

    return popular.filter(f =>
      f.family.toLowerCase().includes(query.toLowerCase()),
    );
  }

  private parseGoogleFontCssVariants(css: string): string[] {
    const variants: string[] = [];
    const weightMatch = css.match(/font-weight:\s*([0-9]+)/g);
    if (weightMatch) {
      for (const m of weightMatch) {
        const w = m.replace('font-weight:', '').trim();
        if (!variants.includes(w)) variants.push(w);
      }
    }
    if (variants.length === 0) variants.push('regular', '700');
    return variants;
  }

  private getFallbackForFont(family: string): string {
    const serifKeywords = ['serif', 'slab', 'display', 'merriweather', 'playfair', 'lora', 'georgia', 'garamond', 'times'];
    const monoKeywords = ['mono', 'monospace', 'code', 'jetbrains', 'fira code', 'cascadia', 'source code pro'];
    const handwritingKeywords = ['handwriting', 'cursive', 'dancing script', 'pacifico', 'satisfy'];
    const displayKeywords = ['display', 'impact', 'bebas', 'oswald', 'anton', 'luckiest guy'];
    const lower = family.toLowerCase();

    if (monoKeywords.some(k => lower.includes(k))) return `monospace`;
    if (serifKeywords.some(k => lower.includes(k))) return `Georgia, serif`;
    if (handwritingKeywords.some(k => lower.includes(k))) return `cursive`;
    if (displayKeywords.some(k => lower.includes(k))) return `system-ui, sans-serif`;
    return `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  }

  private slugify(name: string): string {
    return name
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getExtension(path: string): string {
    const match = path.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : 'woff2';
  }

  private guessFontName(path: string): string {
    const base = path.split('/').pop()?.split('\\').pop() || 'Custom Font';
    return base
      .replace(/\.[^.]+$/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace(/Regular|Bold|Italic|Light|Medium|Semibold|Thin|Black/gi, '')
      .trim() || 'Custom Font';
  }

  private guessWeightFromFilename(path: string): number {
    const lower = path.toLowerCase();
    if (lower.includes('thin') || lower.includes('hairline')) return 100;
    if (lower.includes('extralight') || lower.includes('extra-light')) return 200;
    if (lower.includes('light')) return 300;
    if (lower.includes('medium')) return 500;
    if (lower.includes('semibold') || lower.includes('semi-bold') || lower.includes('demibold')) return 600;
    if (lower.includes('extrabold') || lower.includes('extra-bold') || lower.includes('ultrabold')) return 800;
    if (lower.includes('bold')) return 700;
    if (lower.includes('black') || lower.includes('heavy')) return 900;
    return 400;
  }
}
