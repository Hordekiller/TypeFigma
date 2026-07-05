'use client';

import { useMemo, useState } from 'react';

interface ColorTokens {
  primary?: Record<string, string>;
  secondary?: Record<string, string>;
  accent?: Record<string, string>;
  neutral?: Record<string, string>;
  success?: Record<string, string>;
  warning?: Record<string, string>;
  error?: Record<string, string>;
  info?: Record<string, string>;
  background?: { body?: string; surface?: string };
  text?: { primary?: string; secondary?: string };
}

interface TypographyTokens {
  fontFamilies?: Record<string, { name: string; weights?: number[] }>;
  fontSizes?: Record<string, { size: number; unit: string; lineHeight?: number }>;
}

interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing?: number[];
  borderRadius?: Array<{ radius: number; unit: string }>;
  shadows?: Array<{ x: number; y: number; blur: number; color: string }>;
}

interface DesignTokensPanelProps {
  tokens: DesignTokens;
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-900/50">
      <div
        className="w-8 h-8 rounded-md border border-zinc-700 flex-shrink-0"
        style={{ backgroundColor: value }}
      />
      <div className="min-w-0">
        <div className="text-xs font-medium text-zinc-300 truncate">{label}</div>
        <div className="text-[10px] text-zinc-500 font-mono">{value}</div>
      </div>
    </div>
  );
}

function ColorPalette({ label, colors }: { label: string; colors?: Record<string, string> }) {
  if (!colors) return null;
  const entries = Object.entries(colors);
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{label}</h4>
      <div className="space-y-1.5">
        {entries.map(([shade, value]) => (
          <ColorSwatch key={shade} label={`${label} ${shade}`} value={value} />
        ))}
      </div>
    </div>
  );
}

function FontCard({ label, font }: { label: string; font?: { name: string; weights?: number[] } }) {
  if (!font) return null;
  return (
    <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
      <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-medium text-zinc-200">{font.name}</div>
      {font.weights && font.weights.length > 0 && (
        <div className="text-xs text-zinc-500 mt-1">
          Weights: {font.weights.join(', ')}
        </div>
      )}
    </div>
  );
}

export default function DesignTokensPanel({ tokens }: DesignTokensPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections = useMemo(() => {
    const items: Array<{ key: string; label: string; count: number }> = [];

    const c = tokens.colors;
    let colorCount = 0;
    for (const key of ['primary', 'secondary', 'accent', 'neutral', 'success', 'warning', 'error', 'info'] as const) {
      if (c[key]) colorCount += Object.keys(c[key]).length;
    }
    if (colorCount > 0) items.push({ key: 'colors', label: 'Colors', count: colorCount });

    const t = tokens.typography;
    let fontCount = 0;
    if (t.fontFamilies) fontCount += Object.keys(t.fontFamilies).length;
    if (t.fontSizes) fontCount += Object.keys(t.fontSizes).length;
    if (fontCount > 0) items.push({ key: 'typography', label: 'Typography', count: fontCount });

    if (tokens.spacing && tokens.spacing.length > 0) {
      items.push({ key: 'spacing', label: 'Spacing', count: tokens.spacing.length });
    }
    if (tokens.borderRadius && tokens.borderRadius.length > 0) {
      items.push({ key: 'radius', label: 'Border Radius', count: tokens.borderRadius.length });
    }
    if (tokens.shadows && tokens.shadows.length > 0) {
      items.push({ key: 'shadows', label: 'Shadows', count: tokens.shadows.length });
    }

    return items;
  }, [tokens]);

  if (sections.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-600">
        <p className="text-sm">No design tokens available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Design Tokens</h3>
        <span className="text-xs text-zinc-500">{sections.reduce((s, i) => s + i.count, 0)} tokens</span>
      </div>

      {sections.map(section => {
        const isOpen = expanded === section.key;
        return (
          <div key={section.key} className="rounded-lg border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : section.key)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-zinc-900/50 transition"
            >
              <span className="text-sm font-medium text-zinc-300">{section.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">{section.count} items</span>
                <svg
                  className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div className="px-3 pb-3 space-y-3">
                {section.key === 'colors' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(['primary', 'secondary', 'accent', 'neutral', 'success', 'warning', 'error', 'info'] as const).map(k => (
                      <ColorPalette key={k} label={k} colors={tokens.colors[k]} />
                    ))}
                  </div>
                )}
                {section.key === 'typography' && (
                  <div className="space-y-3">
                    {tokens.typography.fontFamilies && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(tokens.typography.fontFamilies).map(([key, font]) => (
                          <FontCard key={key} label={key} font={font} />
                        ))}
                      </div>
                    )}
                    {tokens.typography.fontSizes && (
                      <div>
                        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Font Sizes</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {Object.entries(tokens.typography.fontSizes).map(([key, size]) => (
                            <div key={key} className="p-2 rounded bg-zinc-900/50">
                              <div className="text-[10px] text-zinc-600">{key}</div>
                              <div className="text-xs text-zinc-300 font-mono">{size.size}{size.unit}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {section.key === 'spacing' && (
                  <div className="flex flex-wrap gap-1.5">
                    {tokens.spacing!.map((s, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-zinc-900 rounded text-zinc-400 font-mono">
                        {s}px
                      </span>
                    ))}
                  </div>
                )}
                {section.key === 'radius' && (
                  <div className="flex flex-wrap gap-1.5">
                    {tokens.borderRadius!.map((r, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-zinc-900 rounded text-zinc-400 font-mono">
                        {r.radius}{r.unit}
                      </span>
                    ))}
                  </div>
                )}
                {section.key === 'shadows' && (
                  <div className="space-y-1.5">
                    {tokens.shadows!.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-zinc-900/50">
                        <div
                          className="w-6 h-6 rounded flex-shrink-0"
                          style={{
                            boxShadow: `${s.x}px ${s.y}px ${s.blur}px ${s.color}`,
                          }}
                        />
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {s.x}px {s.y}px {s.blur}px {s.color}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
