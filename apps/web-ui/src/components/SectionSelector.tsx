'use client';

import { useState, useMemo } from 'react';

interface SectionOption {
  key: string;
  label: string;
  templateType: string;
  category: string;
  description: string;
  enabled: boolean;
  icon: string;
  relevantFor: string[];
}

interface SectionSelectionConfig {
  sections: SectionOption[];
  selected: string[];
  widgetOverrides?: Record<string, Record<string, unknown>>;
}

interface WidgetDef {
  widgetType: string;
  label: string;
  description?: string;
  icon: string;
  required?: boolean;
}

interface WidgetGroup {
  key: string;
  label: string;
  description: string;
  widgets: WidgetDef[];
}

interface SectionTemplate {
  key: string;
  label: string;
  description: string;
  templateType: string;
  category: string;
  relevantFor: string[];
  icon: string;
  enabled: boolean;
  widgetGroups: WidgetGroup[];
}

interface HierarchicalSelection {
  selectedSections: string[];
  selectedGroups: Record<string, string[]>;
  widgetOverrides: Record<string, Record<string, unknown>>;
}

const PROJECT_TYPE_MAP: Record<string, string[]> = {
  corporate: ['business'],
  saas: ['business'],
  news: ['blog'],
};

function normalizeProjectType(pt: string): string[] {
  return [pt, ...(PROJECT_TYPE_MAP[pt] || [])];
}

const CATEGORY_LABELS: Record<string, string> = {
  'basic': 'Essential',
  'theme-builder': 'Theme Builder',
  'woocommerce': 'WooCommerce',
  'general-pro': 'Advanced',
  'form': 'Forms',
  'media': 'Media',
  'social': 'Social',
};

const CATEGORY_ORDER = ['basic', 'woocommerce', 'theme-builder', 'general-pro', 'form', 'media', 'social'];

// ─── Flat Section Selector (original) ───────────────

export default function SectionSelector({
  config,
  projectType,
  onChange,
}: {
  config: SectionSelectionConfig;
  projectType?: string;
  onChange: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(config.selected));
  const [showAll, setShowAll] = useState(false);

  const handleToggle = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      onChange(Array.from(next));
      return next;
    });
  };

  const grouped = useMemo(() => {
    const groups: Record<string, SectionOption[]> = {};
    const filtered = showAll
      ? config.sections
      : config.sections.filter(s => !projectType || s.relevantFor.some(r => normalizeProjectType(projectType).includes(r)) || s.relevantFor.length === 0);

    for (const section of filtered) {
      const cat = section.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(section);
    }
    return groups;
  }, [config.sections, showAll, projectType]);

  const orderedCategories = CATEGORY_ORDER.filter(c => grouped[c]?.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">Theme Sections</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {selected.size} of {config.sections.length} sections selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
            <input
              type="checkbox"
              checked={showAll}
              onChange={e => setShowAll(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
            />
            Show all
          </label>
          <button
            onClick={() => {
              const allKeys = config.sections.map(s => s.key);
              setSelected(new Set(allKeys));
              onChange(allKeys);
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            Select all
          </button>
          <button
            onClick={() => {
              setSelected(new Set());
            }}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {orderedCategories.map(category => (
        <div key={category}>
          <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2.5">
            {CATEGORY_LABELS[category] || category}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(grouped[category] || []).map(section => {
              const isSelected = selected.has(section.key);
              return (
                <button
                  key={section.key}
                  onClick={() => handleToggle(section.key)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition text-sm ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/30 text-blue-300'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-4 h-4 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-zinc-600'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-medium ${isSelected ? 'text-blue-200' : 'text-zinc-300'}`}>
                      {section.label}
                    </div>
                    {isSelected && section.description && (
                      <div className="text-xs text-blue-400/70 mt-0.5 truncate">
                        {section.description}
                      </div>
                    )}
                    <div className="text-xs text-zinc-600 mt-0.5">
                      {section.templateType}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {orderedCategories.length === 0 && (
        <div className="text-center py-12 text-zinc-600">
          <p className="text-sm">No sections available for this project type</p>
        </div>
      )}
    </div>
  );
}

// ─── Hierarchical Section Selector (drill-down) ──────

export function HierarchicalSectionSelector({
  templates,
  initialSelection,
  projectType,
  onChange,
}: {
  templates: SectionTemplate[];
  initialSelection?: HierarchicalSelection;
  projectType?: string;
  onChange: (selection: HierarchicalSelection) => void;
}) {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(initialSelection?.selectedSections || []),
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const filteredTemplates = useMemo(() => {
   return showAll
       ? templates
       : templates.filter(t => !projectType || t.relevantFor.some(r => normalizeProjectType(projectType).includes(r)) || t.relevantFor.length === 0);
  }, [templates, showAll, projectType]);

  const grouped = useMemo(() => {
    const groups: Record<string, SectionTemplate[]> = {};
    for (const t of filteredTemplates) {
      const cat = t.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    }
    return groups;
  }, [filteredTemplates]);

  const orderedCategories = CATEGORY_ORDER.filter(c => grouped[c]?.length > 0);

  const emitChange = (sections: Set<string>) => {
    onChange({
      selectedSections: Array.from(sections),
      selectedGroups: {},
      widgetOverrides: {},
    });
  };

  const toggleSection = (key: string) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      emitChange(next);
      return next;
    });
  };

  const toggleExpand = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalCount = filteredTemplates.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">Theme Sections (Hierarchical)</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {selectedSections.size} of {totalCount} sections selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
            <input
              type="checkbox"
              checked={showAll}
              onChange={e => setShowAll(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
            />
            Show all
          </label>
          <button
            onClick={() => {
              const allKeys = filteredTemplates.map(t => t.key);
              setSelectedSections(new Set(allKeys));
              emitChange(new Set(allKeys));
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            Select all
          </button>
          <button
            onClick={() => {
              setSelectedSections(new Set());
              emitChange(new Set());
            }}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {orderedCategories.map(category => (
        <div key={category}>
          <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2.5">
            {CATEGORY_LABELS[category] || category}
          </h4>
          <div className="space-y-2">
            {(grouped[category] || []).map(template => {
              const isSelected = selectedSections.has(template.key);
              const isExpanded = expandedSections.has(template.key);
              const widgetCount = template.widgetGroups.reduce((sum, g) => sum + g.widgets.length, 0);

              return (
                <div key={template.key} className="rounded-lg border border-zinc-800 overflow-hidden">
                  {/* Section header row */}
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => toggleSection(template.key)}
                      className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition ${
                        isSelected ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => toggleExpand(template.key)}
                      className={`flex-1 flex items-center justify-between text-left ${
                        isSelected ? 'text-blue-200' : 'text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{template.label}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {widgetCount} widgets in {template.widgetGroups.length} groups
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded widget group detail */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-zinc-800/50 pt-2 space-y-2">
                      {template.widgetGroups.map(group => (
                        <div key={group.key} className="bg-zinc-900/50 rounded p-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-zinc-400">{group.label}</span>
                            <span className="text-xs text-zinc-600">{group.widgets.length} widgets</span>
                          </div>
                          <div className="space-y-1">
                            {group.widgets.map((widget, wi) => (
                              <div
                                key={`${group.key}-${wi}`}
                                className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                                  isSelected ? 'text-zinc-300' : 'text-zinc-600'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  isSelected ? 'bg-blue-500' : 'bg-zinc-700'
                                }`} />
                                <span className="font-mono text-[11px] opacity-70">{widget.widgetType}</span>
                                <span className="truncate">{widget.label}</span>
                                {widget.required && (
                                  <span className="text-[10px] text-amber-500/70 ml-auto">required</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {orderedCategories.length === 0 && (
        <div className="text-center py-12 text-zinc-600">
          <p className="text-sm">No templates available</p>
        </div>
      )}
    </div>
  );
}
