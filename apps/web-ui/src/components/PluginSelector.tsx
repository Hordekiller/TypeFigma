'use client';

import { useState, useMemo } from 'react';

interface PluginInfo {
  slug: string;
  name: string;
  description: string;
  required: boolean;
  category: 'woocommerce' | 'seo' | 'performance' | 'security' | 'forms' | 'social' | 'analytics' | 'other';
  WordPressURI?: string;
}

const PLUGIN_CATALOG: PluginInfo[] = [
  { slug: 'woocommerce', name: 'WooCommerce', description: 'E-commerce platform for WordPress', required: false, category: 'woocommerce', WordPressURI: 'https://wordpress.org/plugins/woocommerce/' },
  { slug: 'elementor', name: 'Elementor', description: 'Front-end page builder', required: true, category: 'other', WordPressURI: 'https://wordpress.org/plugins/elementor/' },
  { slug: 'elementor-pro', name: 'Elementor Pro', description: 'Premium theme builder and widgets', required: false, category: 'other' },
  { slug: 'yoast', name: 'Yoast SEO', description: 'Search engine optimization tools', required: false, category: 'seo', WordPressURI: 'https://wordpress.org/plugins/wordpress-seo/' },
  { slug: 'rank-math', name: 'Rank Math SEO', description: 'Advanced SEO plugin', required: false, category: 'seo', WordPressURI: 'https://wordpress.org/plugins/seo-by-rank-math/' },
  { slug: 'wp-rocket', name: 'WP Rocket', description: 'Caching and performance optimization', required: false, category: 'performance' },
  { slug: 'litespeed-cache', name: 'LiteSpeed Cache', description: 'Server-level caching', required: false, category: 'performance', WordPressURI: 'https://wordpress.org/plugins/litespeed-cache/' },
  { slug: 'wordfence', name: 'Wordfence', description: 'Security firewall and scanner', required: false, category: 'security', WordPressURI: 'https://wordpress.org/plugins/wordfence/' },
  { slug: 'contact-form-7', name: 'Contact Form 7', description: 'Simple contact forms', required: false, category: 'forms', WordPressURI: 'https://wordpress.org/plugins/contact-form-7/' },
  { slug: 'monsterinsights', name: 'MonsterInsights', description: 'Google Analytics integration', required: false, category: 'analytics', WordPressURI: 'https://wordpress.org/plugins/google-analytics-for-wordpress/' },
  { slug: 'wpforms', name: 'WPForms', description: 'Drag-and-drop form builder', required: false, category: 'forms', WordPressURI: 'https://wordpress.org/plugins/wpforms-lite/' },
];

interface PluginSelectorProps {
  recommended?: string[];
  selected?: string[];
  onChange?: (selected: string[]) => void;
  readOnly?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  woocommerce: 'E-Commerce',
  seo: 'SEO',
  performance: 'Performance',
  security: 'Security',
  forms: 'Forms',
  analytics: 'Analytics',
  other: 'Other',
};

function PluginCard({
  plugin,
  isSelected,
  isRecommended,
  onToggle,
  readOnly,
}: {
  plugin: PluginInfo;
  isSelected: boolean;
  isRecommended: boolean;
  onToggle: () => void;
  readOnly?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`rounded-lg border p-3 transition ${
        isSelected
          ? 'bg-blue-500/5 border-blue-500/30'
          : isRecommended
          ? 'bg-amber-500/5 border-amber-500/20'
          : 'bg-zinc-900/30 border-zinc-800'
      }`}
    >
      <div className="flex items-start gap-3">
        {!readOnly && (
          <button
            onClick={onToggle}
            className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-zinc-600'
            }`}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isSelected ? 'text-blue-200' : 'text-zinc-300'}`}>
              {plugin.name}
            </span>
            {plugin.required && (
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Required</span>
            )}
            {isRecommended && !plugin.required && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Recommended</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{plugin.description}</p>
          {plugin.WordPressURI && (
            <a
              href={plugin.WordPressURI}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-500 hover:text-blue-400 mt-1 inline-block"
            >
              {plugin.WordPressURI}
            </a>
          )}
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-zinc-600 hover:text-zinc-400 transition"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showDetails && (
        <div className="mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-500 space-y-1">
          <div><span className="text-zinc-600">Slug:</span> <span className="font-mono">{plugin.slug}</span></div>
          <div><span className="text-zinc-600">Category:</span> {CATEGORY_LABELS[plugin.category] || plugin.category}</div>
          {plugin.required && <div className="text-amber-400">Required for the generated theme to function</div>}
        </div>
      )}
    </div>
  );
}

export default function PluginSelector({ recommended, selected: initialSelected, onChange, readOnly }: PluginSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected || []));
  const [filter, setFilter] = useState<string | null>(null);

  const catalog = useMemo(() => {
    return recommended
      ? PLUGIN_CATALOG.filter(p => recommended.includes(p.slug) || p.required)
      : PLUGIN_CATALOG;
  }, [recommended]);

  const grouped = useMemo(() => {
    const groups: Record<string, PluginInfo[]> = {};
    const filtered = filter
      ? catalog.filter(p => p.category === filter)
      : catalog;

    for (const plugin of filtered) {
      const cat = plugin.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(plugin);
    }
    return groups;
  }, [catalog, filter]);

  const categories = Object.keys(grouped).sort();
  const recommendedSet = useMemo(() => new Set(recommended || []), [recommended]);

  const handleToggle = (slug: string) => {
    if (readOnly) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      onChange?.(Array.from(next));
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">
            {readOnly ? 'Required Plugins' : 'Plugin Selection'}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            {selected.size} of {catalog.length} selected
          </p>
        </div>
        {!readOnly && (
          <div className="flex gap-1">
            {['all', ...new Set(catalog.map(p => p.category))].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat === 'all' ? null : cat)}
                className={`px-2 py-1 text-xs rounded-full transition ${
                  filter === cat || (cat === 'all' && !filter)
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat}>
            <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">
              {CATEGORY_LABELS[cat] || cat}
            </h4>
            <div className="space-y-2">
              {grouped[cat].map(plugin => (
                <PluginCard
                  key={plugin.slug}
                  plugin={plugin}
                  isSelected={selected.has(plugin.slug)}
                  isRecommended={recommendedSet.has(plugin.slug) && !plugin.required}
                  onToggle={() => handleToggle(plugin.slug)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!readOnly && categories.length > 1 && (
        <div className="flex gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={() => {
              const all = catalog.map(p => p.slug);
              setSelected(new Set(all));
              onChange?.(all);
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            Select all
          </button>
          <button
            onClick={() => {
              const requiredOnly = catalog.filter(p => p.required).map(p => p.slug);
              setSelected(new Set(requiredOnly));
              onChange?.(requiredOnly);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition"
          >
            Required only
          </button>
          <button
            onClick={() => {
              setSelected(new Set());
              onChange?.([]);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition"
          >
            Clear
          </button>
        </div>
      )}

      {catalog.length === 0 && (
        <div className="text-center py-8 text-zinc-600">
          <p className="text-sm">No plugins available</p>
        </div>
      )}
    </div>
  );
}
