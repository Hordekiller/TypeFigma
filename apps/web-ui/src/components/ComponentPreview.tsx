'use client';

import { useMemo, useState } from 'react';

interface ComponentData {
  id: string;
  name: string;
  confidence: number;
  figmaNodeId: string;
  [key: string]: unknown;
}

interface ComponentPreviewProps {
  components: Record<string, ComponentData[]>;
  onSelect?: (type: string, componentId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  headers: 'Headers',
  footers: 'Footers',
  heroes: 'Hero Sections',
  ctaSections: 'CTA Sections',
  testimonials: 'Testimonials',
  galleries: 'Galleries',
  productCards: 'Product Cards',
  productDetails: 'Product Details',
  cartComponents: 'Cart Components',
  checkoutComponents: 'Checkout Components',
  postCards: 'Post Cards',
  contactForms: 'Contact Forms',
  searchBars: 'Search Bars',
  newsletters: 'Newsletters',
  sections: 'Sections',
  containers: 'Containers',
  navigation: 'Navigation',
};

const TYPE_ORDER = [
  'headers', 'navigation', 'heroes', 'ctaSections', 'testimonials',
  'galleries', 'sections', 'containers',
  'productCards', 'productDetails', 'cartComponents', 'checkoutComponents',
  'postCards', 'contactForms', 'searchBars', 'newsletters',
  'footers',
];

function ComponentCard({ component }: { component: ComponentData }) {
  const confidence = component.confidence ?? 1;
  const confidenceColor =
    confidence >= 0.8 ? 'text-green-400' :
    confidence >= 0.5 ? 'text-amber-400' :
    'text-red-400';
  const confidenceBg =
    confidence >= 0.8 ? 'bg-green-500/10 border-green-500/20' :
    confidence >= 0.5 ? 'bg-amber-500/10 border-amber-500/20' :
    'bg-red-500/10 border-red-500/20';

  const details = useMemo(() => {
    const entries: { key: string; value: string }[] = [];
    for (const [key, val] of Object.entries(component)) {
      if (['id', 'name', 'confidence', 'figmaNodeId', 'node'].includes(key)) continue;
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        entries.push({ key, value: String(val) });
      } else if (typeof val === 'object' && val !== null) {
        entries.push({ key, value: `{ ${Object.keys(val as object).join(', ') } }` });
      }
    }
    return entries.slice(0, 6);
  }, [component]);

  return (
    <div className={`rounded-lg border p-3 transition ${confidenceBg}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-200 truncate">{component.name}</div>
          <div className="text-[10px] text-zinc-600 font-mono truncate mt-0.5">{component.figmaNodeId}</div>
        </div>
        <span className={`text-xs font-semibold tabular-nums ml-2 flex-shrink-0 ${confidenceColor}`}>
          {Math.round(confidence * 100)}%
        </span>
      </div>
      {details.length > 0 && (
        <div className="space-y-0.5">
          {details.map(d => (
            <div key={d.key} className="flex items-center gap-2 text-[11px]">
              <span className="text-zinc-600 font-mono flex-shrink-0">{d.key}:</span>
              <span className="text-zinc-400 truncate">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComponentPreview({ components, onSelect }: ComponentPreviewProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const entries = Object.entries(components).filter(([type]) => {
      if (selectedType && type !== selectedType) return false;
      return true;
    });

    const result: Record<string, ComponentData[]> = {};
    for (const [type, comps] of entries) {
      const filtered = search
        ? comps.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        : comps;
      if (filtered.length > 0) {
        result[type] = filtered;
      }
    }
    return result;
  }, [components, search, selectedType]);

  const totalCount = useMemo(
    () => Object.values(components).reduce((sum, arr) => sum + arr.length, 0),
    [components],
  );

  const orderedTypes = TYPE_ORDER.filter(t => filtered[t]?.length > 0);
  const remainingTypes = Object.keys(filtered)
    .filter(t => !TYPE_ORDER.includes(t))
    .sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">Detected Components</h3>
          <p className="text-xs text-zinc-500 mt-1">{totalCount} components in {Object.keys(components).length} categories</p>
        </div>
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-48 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {Object.keys(filtered).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-2.5 py-1 text-xs rounded-full border transition ${
              !selectedType
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All
          </button>
          {[...orderedTypes, ...remainingTypes].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 text-xs rounded-full border transition ${
                selectedType === type
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              onDoubleClick={() => onSelect?.(type, filtered[type][0]?.id ?? '')}
            >
              {TYPE_LABELS[type] || type} ({filtered[type].length})
            </button>
          ))}
        </div>
      )}

      {orderedTypes.length === 0 && remainingTypes.length === 0 && (
        <div className="text-center py-12 text-zinc-600">
          <p className="text-sm">
            {search ? 'No components match your search' : 'No components detected'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-blue-500 mt-2 hover:text-blue-400">
              Clear search
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {[...orderedTypes, ...remainingTypes].map(type => (
          <div key={type}>
            <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">
              {TYPE_LABELS[type] || type} ({filtered[type].length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filtered[type].map(comp => (
                <button
                  key={comp.id}
                  onClick={() => onSelect?.(type, comp.id)}
                  className="text-left w-full"
                >
                  <ComponentCard component={comp} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
