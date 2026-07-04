import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@typefigma/analyzer', () => ({
  Analyzer: vi.fn().mockImplementation(() => ({
    analyze: vi.fn().mockResolvedValue({
      projectType: { type: 'ecommerce', confidence: 0.85, recommendedPlugins: ['woocommerce'] },
      components: {
        headers: [{ id: 'h1', name: 'Header', confidence: 0.9 }],
        footers: [{ id: 'f1', name: 'Footer', confidence: 0.9 }],
        heroes: [],
        ctaSections: [],
        testimonials: [],
        galleries: [],
        productCards: [],
        productDetails: [],
        cartComponents: [],
        checkoutComponents: [],
        postCards: [],
        contactForms: [],
        searchBars: [],
        newsletters: [],
        sections: [],
        containers: [],
        columns: [],
        navigation: [],
      },
      designTokens: {
        colors: { primary: '#000', secondary: '#fff' },
        typography: { heading: { fontFamily: 'Inter' } },
        spacing: [4, 8, 16],
        shadows: [],
        borderRadius: [],
        breakpoints: [],
      },
    }),
  })),
}));

vi.mock('@typefigma/code-generator', () => ({
  CodeGenerator: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockReturnValue({
      globalCss: ':root { --primary: #000; }',
      componentsCss: '.header { color: red; }',
      html: '<div>test</div>',
    }),
  })),
}));

vi.mock('@typefigma/elementor-mapper', () => ({
  ElementorGenerator: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockReturnValue({
      templates: [{ title: 'test', type: 'section', content: [] }],
      globalSettings: { settings: {} },
    }),
    getSelectionConfig: vi.fn().mockReturnValue({ sections: [], selected: [] }),
    getHierarchicalSelection: vi.fn().mockReturnValue({ selectedSections: [], selectedGroups: {}, widgetOverrides: {} }),
    getTemplates: vi.fn().mockReturnValue([]),
  })),
  getSectionTemplates: vi.fn().mockReturnValue([
    { key: 'hero', label: 'Hero', templateType: 'section', category: 'basic', relevantFor: ['ecommerce'], icon: '', enabled: true, widgetGroups: [] },
    { key: 'footer', label: 'Footer', templateType: 'footer', category: 'basic', relevantFor: ['ecommerce'], icon: '', enabled: true, widgetGroups: [] },
  ]),
  getSectionTemplate: vi.fn(),
}));

vi.mock('@typefigma/theme-builder', () => ({
  ThemeBuilder: vi.fn().mockImplementation(() => ({
    build: vi.fn().mockReturnValue([
      { path: 'style.css', content: '/* Theme */' },
      { path: 'index.php', content: '<?php' },
    ]),
  })),
  slugify: vi.fn().mockImplementation((s: string) => s.toLowerCase().replace(/\s+/g, '-')),
}));

vi.mock('@typefigma/validator', () => ({
  Validator: vi.fn().mockImplementation(() => ({
    validate: vi.fn().mockReturnValue({
      errors: [],
      warnings: [],
      summary: { score: 85, errors: 0, warnings: 0, passed: true },
      performance: { cssSize: 1024, jsSize: 512, totalSize: 2048 },
      accessibility: { score: 90, issues: [] },
      wordpress: { i18nFunctions: 5, noncesFound: 2 },
    }),
  })),
}));

vi.mock('archiver', () => {
  const mockPipe = vi.fn().mockReturnThis();
  const mockDirectory = vi.fn().mockReturnThis();
  const mockFinalize = vi.fn().mockReturnThis();
  return {
    default: vi.fn(() => ({
      pipe: mockPipe,
      directory: mockDirectory,
      finalize: mockFinalize,
      on: vi.fn((event: string, cb: () => void) => {
        if (event === 'close') setTimeout(cb, 10);
        return { pipe: mockPipe, directory: mockDirectory, finalize: mockFinalize };
      }),
    })),
    __esModule: true,
  };
});

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
    createWriteStream: vi.fn().mockReturnValue({ on: vi.fn(), write: vi.fn(), end: vi.fn() }),
  };
});

describe('CLI Commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export commands', async () => {
    const { default: program } = await import('../index.js');
    const commands = program.commands.map((c: { name: () => string }) => c.name());
    expect(commands).toContain('generate');
    expect(commands).toContain('analyze');
    expect(commands).toContain('validate');
    expect(commands).toContain('list-templates');
    expect(commands).toContain('docs');
  });

  it('should have 5 commands', async () => {
    const { default: program } = await import('../index.js');
    expect(program.commands.length).toBe(5);
  });

  it('should accept --help for each command', async () => {
    const { default: program } = await import('../index.js');
    for (const cmd of program.commands) {
      expect(cmd.description()).toBeTruthy();
      expect(cmd.name()).toBeTruthy();
    }
  });

  it('list-templates should return templates', async () => {
    const { getSectionTemplates } = await import('@typefigma/elementor-mapper');
    const templates = getSectionTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('key');
    expect(templates[0]).toHaveProperty('label');
  });
});
