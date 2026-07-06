import { describe, it, expect } from 'vitest';
import { WooCommerceGenerator } from '../index.js';
import { ThemeConfig } from '@typefigma/theme-builder';

describe('WooCommerceGenerator', () => {
  const mockThemeConfig: ThemeConfig = {
    name: 'Test Theme',
    description: 'A test theme',
    version: '1.0.0',
    author: 'Test Author',
    textDomain: 'test-theme',
    includeWooCommerce: true,
    woocommerceFeatures: {
      includeVariations: true,
      includeGroupedProducts: true,
      includeMiniCart: true
    }
  };

  it('should generate all WooCommerce templates', () => {
    const generator = new WooCommerceGenerator(mockThemeConfig);
    const templates = generator.generateTemplates();

    // Check if all templates are generated
    expect(templates['single-product.php']).toBeDefined();
    expect(templates['archive-product.php']).toBeDefined();
    expect(templates['cart.php']).toBeDefined();
    expect(templates['checkout.php']).toBeDefined();
    expect(templates['myaccount.php']).toBeDefined();
    expect(templates['header.php']).toBeDefined();
  });

  it('should include product variations in single-product.php', () => {
    const generator = new WooCommerceGenerator(mockThemeConfig);
    const template = generator.generateTemplates()['single-product.php'];

    expect(template).toContain('woocommerce_variable_add_to_cart');
    expect(template).toContain('if ($product->is_type(\'variable\'))');
  });

  it('should include mini cart in header.php when enabled', () => {
    const generator = new WooCommerceGenerator(mockThemeConfig);
    const template = generator.generateTemplates()['header.php'];

    expect(template).toContain('woocommerce_mini_cart');
    expect(template).toContain('mini-cart');
  });

  it('should not include mini cart in header.php when disabled', () => {
    const config = {
      ...mockThemeConfig,
      woocommerceFeatures: { includeMiniCart: false }
    };
    const generator = new WooCommerceGenerator(config);
    const template = generator.generateTemplates()['header.php'];

    expect(template).not.toContain('woocommerce_mini_cart');
  });

  it('should generate valid PHP syntax for all templates', () => {
    const generator = new WooCommerceGenerator(mockThemeConfig);
    const templates = generator.generateTemplates();

    Object.values(templates).forEach(template => {
      // Check for PHP opening tag
      expect(template).toContain('<?php');
      // Check for basic WooCommerce functions
      expect(template).toMatch(/woocommerce_/);
    });
  });
});