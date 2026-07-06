import { describe, it, expect } from 'vitest';
import { CodeGenerator } from '../../index.js';
import { buildEditorHtml } from '@typefigma/editor-protocol';
import { simpleComponents, nestedComponents, wcComponents, mockTokens } from './fixtures.js';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURES_DIR = join(__dirname, '..', '..', '..', 'src', '__fixtures__');

interface GoldenFixture {
  name: string;
  components: typeof simpleComponents;
}

const FIXTURES: GoldenFixture[] = [
  { name: 'simple-header-footer-hero', components: simpleComponents },
  { name: 'nested-sections-containers-columns', components: nestedComponents },
  { name: 'woocommerce-product-cart-checkout', components: wcComponents },
];

describe('E1-2: Golden-file tests — 3 component trees', () => {
  for (const fixture of FIXTURES) {
    it(`${fixture.name} produces deterministic HTML (diff-clean on second run)`, () => {
      const gen = new CodeGenerator({ traceability: true });
      const { html } = gen.generate(fixture.components, mockTokens);
      const editorHtml = buildEditorHtml(html);

      const htmlPath = join(FIXTURES_DIR, `${fixture.name}.html`);
      const editorHtmlPath = join(FIXTURES_DIR, `${fixture.name}.editor.html`);

      if (!existsSync(htmlPath) || !existsSync(editorHtmlPath)) {
        writeFileSync(htmlPath, html, 'utf-8');
        writeFileSync(editorHtmlPath, editorHtml, 'utf-8');
        return;
      }

      const savedHtml = readFileSync(htmlPath, 'utf-8');
      const savedEditorHtml = readFileSync(editorHtmlPath, 'utf-8');

      expect(html).toBe(savedHtml);
      expect(editorHtml).toBe(savedEditorHtml);
    });
  }
});
