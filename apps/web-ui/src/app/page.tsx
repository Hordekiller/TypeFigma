'use client';

import { useState, useCallback } from 'react';
import SectionSelector, { HierarchicalSectionSelector } from '../components/SectionSelector';
import PreviewPanel from '../components/PreviewPanel';
import PipelineProgress from '../components/PipelineProgress';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
const PREVIEW_BASE = process.env.NEXT_PUBLIC_PREVIEW_URL || 'http://localhost:3002';

const STEPS = [
  { num: 1, name: 'Fetch & Analysis', icon: '🔍' },
  { num: 2, name: 'Component Detection', icon: '🎯' },
  { num: 3, name: 'Design Tokens', icon: '🎨' },
  { num: 4, name: 'Code Generation', icon: '💻' },
  { num: 5, name: 'Elementor JSON', icon: '📦' },
  { num: 6, name: 'Theme Structure', icon: '📁' },
  { num: 7, name: 'Configuration', icon: '⚙️' },
  { num: 8, name: 'WooCommerce', icon: '🛒' },
  { num: 9, name: 'Validation', icon: '✅' },
  { num: 10, name: 'Package & Export', icon: '📦' },
];

interface SelectionConfig {
  sections: Array<{
    key: string;
    label: string;
    templateType: string;
    category: string;
    description: string;
    enabled: boolean;
    icon: string;
    relevantFor: string[];
  }>;
  selected: string[];
  widgetOverrides?: Record<string, Record<string, unknown>>;
}

interface WidgetGroup {
  key: string;
  label: string;
  description: string;
  widgets: Array<{ widgetType: string; label: string; description?: string; icon: string; required?: boolean }>;
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

interface AnalysisData {
  projectType: string;
  confidence: number;
  selectionConfig: SelectionConfig;
  hierarchicalSelection?: HierarchicalSelection;
  templates?: SectionTemplate[];
  recommendedPlugins: string[];
}

interface GenerateResult {
  themeSlug?: string;
  themePath?: string;
  zipPath?: string;
  validation?: { score: number; errors: number; warnings: number; accessibilityScore: number };
}

export default function Home() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<{ step: number; message: string }[]>([]);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [hierarchicalSelection, setHierarchicalSelection] = useState<HierarchicalSelection | null>(null);
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
  const [themeUrl, setThemeUrl] = useState('');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [darkMode, setDarkMode] = useState(false);

  const handleAnalyze = async () => {
    const trimmedUrl = figmaUrl.trim();
    if (!trimmedUrl) return;
    if (!trimmedUrl.startsWith('https://figma.com/file/') && !trimmedUrl.startsWith('https://www.figma.com/file/') && !trimmedUrl.startsWith('https://www.figma.com/design/')) {
      setLogs([{ step: 0, message: 'ERROR: Invalid Figma URL. Must start with https://figma.com/file/... or https://www.figma.com/design/...' }]);
      return;
    }
    if (!figmaToken.trim()) {
      setLogs([{ step: 0, message: 'ERROR: Figma API token is required' }]);
      return;
    }

    setIsGenerating(true);
    setCurrentStep(1);
    setResult(null);
    setAnalysis(null);
    setThemeUrl('');
    setLogs([{ step: 1, message: 'DONE: Analyzing Figma design...' }]);

    try {
      setCurrentStep(2);
      setLogs(prev => [...prev, { step: 2, message: 'Detecting components and design tokens...' }]);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figmaUrl: trimmedUrl,
          figmaToken: figmaToken.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLogs(prev => [...prev, { step: 2, message: `ERROR: ${data.error || 'Analysis failed'}` }]);
        setCurrentStep(0);
        setIsGenerating(false);
        return;
      }

      setLogs(prev => [
        ...prev,
        { step: 2, message: `DONE: Project type: ${data.projectType || 'unknown'} (${Math.round((data.confidence || 0) * 100)}% confidence)` },
        { step: 2, message: `DONE: Recommended plugins: ${(data.recommendedPlugins || []).join(', ') || 'none'}` },
        { step: 2, message: `DONE: Detected ${data.selectionConfig?.sections?.length || 0} possible sections` },
        { step: 2, message: 'DONE: Analysis complete! Review and select sections below, then generate your theme.' },
      ]);

      const initialSelected = data.selectionConfig?.selected || [];
      setAnalysis(data);
      setSelectedSections(initialSelected);
      if (data.hierarchicalSelection) {
        setHierarchicalSelection(data.hierarchicalSelection);
      }
      setCurrentStep(3);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const display = err instanceof DOMException && err.name === 'AbortError'
        ? 'Request timed out. The Figma file may be too large or the server is slow. Please try again or use a smaller file.'
        : `Connection error: ${message}`;
      setLogs(prev => [...prev, { step: 2, message: `ERROR: ${display}` }]);
      setCurrentStep(0);
      setIsGenerating(false);
    }

    setIsGenerating(false);
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setLogs(prev => [...prev, { step: 3, message: 'DONE: Generating theme with selected sections...' }]);
    setThemeUrl('');

    const body: Record<string, unknown> = {
      figmaUrl: figmaUrl.trim(),
      figmaToken: figmaToken.trim(),
      themeName: 'Generated Theme',
      createZip: true,
    };

    if (useAdvancedMode && hierarchicalSelection) {
      body.hierarchicalSelection = hierarchicalSelection;
    } else {
      body.selectedSections = selectedSections;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLogs(prev => [...prev, { step: 10, message: `ERROR: ${data.error || 'Generation failed'}` }]);
        setIsGenerating(false);
        return;
      }

      setCurrentStep(10);
      setLogs(prev => [
        ...prev,
        { step: 10, message: `DONE: Files created: ${data.files || 0}` },
        { step: 10, message: `DONE: Validation score: ${data.validation?.score || 0}/100` },
        { step: 10, message: `DONE: Errors: ${data.validation?.errors || 0}, Warnings: ${data.validation?.warnings || 0}` },
        { step: 10, message: `DONE: a11y score: ${data.validation?.accessibilityScore || 0}/100` },
        { step: 10, message: `DONE: Duration: ${(data.duration / 1000).toFixed(1)}s` },
        { step: 10, message: 'DONE: Theme generated successfully!' },
        ...(data.zipPath ? [{ step: 10, message: `DONE: ZIP: ${data.zipPath}` }] : []),
      ]);

      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const display = err instanceof DOMException && err.name === 'AbortError'
        ? 'Request timed out. The Figma file may be too large or the server is slow. Please try again or use a smaller file.'
        : `Connection error: ${message}`;
      setLogs(prev => [...prev, { step: 3, message: `ERROR: ${display}` }]);
      setCurrentStep(0);
    }

    setIsGenerating(false);
  }, [figmaUrl, figmaToken, selectedSections, useAdvancedMode, hierarchicalSelection]);

  const handleReset = () => {
    setResult(null);
    setAnalysis(null);
    setFigmaUrl('');
    setFigmaToken('');
    setCurrentStep(0);
    setLogs([]);
    setSelectedSections([]);
    setThemeUrl('');
  };

  return (
    <main className="min-h-screen">
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <h1 className="text-xl font-bold text-white">TypeFigma</h1>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Beta</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-white transition">Docs</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Figma Design →{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              WordPress Theme
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Paste a Figma URL and get a complete, Elementor-compatible WordPress theme
          </p>
        </div>

        {!result && !analysis && (
          <div className="max-w-2xl mx-auto mb-12 space-y-3">
            <input
              type="text"
              placeholder="https://figma.com/file/..."
              value={figmaUrl}
              onChange={e => setFigmaUrl(e.target.value)}
              className="w-full px-5 py-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
            />
            <input
              type="password"
              placeholder="Figma API Token"
              value={figmaToken}
              onChange={e => setFigmaToken(e.target.value)}
              className="w-full px-5 py-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
            />
            <button
              onClick={handleAnalyze}
              disabled={!figmaUrl || !figmaToken || isGenerating}
              className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-medium transition text-sm"
            >
              {isGenerating ? 'Analyzing...' : 'Analyze Design'}
            </button>
          </div>
        )}

        {analysis && !result && (
          <div className="max-w-4xl mx-auto mb-12 space-y-4">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-zinc-300 text-sm">
                  Project: <span className="font-medium text-white">{analysis.projectType}</span>
                  {' '}({Math.round(analysis.confidence * 100)}% confidence)
                </p>
                {analysis.recommendedPlugins && analysis.recommendedPlugins.length > 0 && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Recommended: {analysis.recommendedPlugins.join(', ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAdvancedMode}
                    onChange={e => setUseAdvancedMode(e.target.checked)}
                    className="rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500"
                  />
                  Advanced mode
                </label>
                <button
                  onClick={() => { setResult(null); setAnalysis(null); setCurrentStep(0); }}
                  className="text-xs text-zinc-500 hover:text-zinc-400 transition"
                >
                  Change URL
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5">
              {useAdvancedMode && analysis.templates ? (
                <HierarchicalSectionSelector
                  templates={analysis.templates}
                  initialSelection={analysis.hierarchicalSelection}
                  projectType={analysis.projectType}
                  onChange={setHierarchicalSelection}
                />
              ) : (
                <SectionSelector
                  config={analysis.selectionConfig}
                  projectType={analysis.projectType}
                  onChange={setSelectedSections}
                />
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || (useAdvancedMode ? !hierarchicalSelection?.selectedSections?.length : selectedSections.length === 0)}
              className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-medium transition text-sm"
            >
              {isGenerating
                ? 'Generating...'
                : `Generate Theme (${useAdvancedMode && hierarchicalSelection ? hierarchicalSelection.selectedSections.length : selectedSections.length} sections)`}
            </button>
          </div>
        )}

        {result && (
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-6">
              <p className="text-emerald-400 text-lg font-medium mb-3">Theme generated!</p>
              <p className="text-zinc-400 text-sm mb-2">Slug: {result.themeSlug}</p>
              {result.zipPath && (
                <p className="text-zinc-500 text-xs mb-4">ZIP: {result.zipPath}</p>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Pipeline</h3>
            <div className="space-y-1.5">
              {STEPS.map((step) => {
                const isActive = currentStep === step.num;
                const isDone = currentStep > step.num;

                return (
                  <div
                    key={step.num}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${
                      isActive
                        ? 'bg-blue-600/10 border border-blue-500/30 text-blue-300'
                        : isDone
                        ? 'text-emerald-400'
                        : 'text-zinc-600'
                    }`}
                  >
                    <span>{isDone ? '✓' : step.icon}</span>
                    <span className={isActive ? 'font-medium' : ''}>
                      Step {step.num}: {step.name}
                    </span>
                    {isActive && (
                      <span className="ml-auto">
                        <span className="animate-pulse">●</span>
                      </span>
                    )}
                    {isDone && (
                      <span className="ml-auto text-emerald-400">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Logs</h3>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 h-[500px] overflow-y-auto font-mono text-xs leading-relaxed">
              {logs.length === 0 ? (
                <div className="text-zinc-600 text-center mt-32">
                  <p className="text-4xl mb-4">🎨</p>
                  <p className="text-sm font-sans">Enter a Figma URL and API token</p>
                  <p className="text-xs mt-2">Then click Generate to run the pipeline</p>
                </div>
              ) : (
                logs.map((log, i) => {
                  const msg = log.message;
                  return (
                    <div key={i} className={msg.startsWith('   ') ? 'text-zinc-500 pl-4' : 'text-zinc-300'}>
                      {msg}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Elementor Compatible', desc: 'All templates use Elementor JSON format, fully editable in the builder' },
            { title: 'WooCommerce Ready', desc: 'Auto-detects shop designs and generates full WooCommerce templates' },
            { title: 'Design Token System', desc: 'Colors, typography, spacing extracted as CSS variables and Elementor globals' },
          ].map(f => (
            <div key={f.title} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5">
              <h4 className="text-white font-medium mb-2">{f.title}</h4>
              <p className="text-zinc-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
