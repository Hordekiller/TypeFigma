'use client';

import { useState, useCallback } from 'react';
import PipelineProgress from '../components/PipelineProgress';
import SectionSelector, { HierarchicalSectionSelector } from '../components/SectionSelector';
import ComponentPreview from '../components/ComponentPreview';
import DesignTokensPanel from '../components/DesignTokensPanel';
import CodeViewer from '../components/CodeViewer';
import StepRunner from '../components/StepRunner';
import ValidationResults from '../components/ValidationResults';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

const ALL_STEPS = [
  { num: 1, name: 'Fetch File', icon: '📥' },
  { num: 2, name: 'Detect Components', icon: '🔍' },
  { num: 3, name: 'Extract Tokens', icon: '🎨' },
  { num: 4, name: 'Code Generation', icon: '💻' },
  { num: 5, name: 'Elementor JSON', icon: '📦' },
  { num: 6, name: 'Theme Structure', icon: '📁' },
  { num: 7, name: 'Configuration', icon: '⚙️' },
  { num: 8, name: 'WooCommerce', icon: '🛒' },
  { num: 9, name: 'Validation', icon: '✅' },
  { num: 10, name: 'Package & Export', icon: '📦' },
];

const PIPELINE_STEPS = [
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
  components?: Array<{
    name: string;
    type: string;
    confidence: number;
    nodeId: string;
    role?: string;
    extras?: Record<string, unknown>;
  }>;
  designTokens?: {
    colors: Record<string, Record<string, string>>;
    typography: {
      fontFamilies?: Record<string, { name: string; weights?: number[] }>;
      fontSizes?: Record<string, { size: number; unit: string; lineHeight?: number }>;
    };
    spacing?: number[];
    borderRadius?: Array<{ radius: number; unit: string }>;
    shadows?: Array<{ x: number; y: number; blur: number; color: string }>;
  };
}

interface Step4Data {
  html: string;
  globalCss: string;
  componentsCss: string;
}

interface Step5Data {
  templates: Array<{ title: string; type: string; content: unknown[] }>;
  globalSettings: unknown;
  templateCount: number;
}

interface Step6Data {
  files: Array<{ path: string; size: number }>;
  fileCount: number;
}

interface Step9Data {
  score: number;
  errors: Array<{ file: string; message: string; severity: string; line?: number; rule?: string }>;
  warnings: Array<{ file: string; message: string; severity: string; line?: number; rule?: string }>;
  accessibility: { score: number; issues: Array<{ message: string; severity: string; rule?: string }> };
  performance: { cssSize: number; jsSize: number; totalSize: number };
}

interface Step10Data {
  zipPath: string;
  themeDir: string;
  fileCount: number;
}

type LogEntry = { step: number; message: string };

function LogBox({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 h-[300px] overflow-y-auto font-mono text-xs leading-relaxed">
      {logs.length === 0 && (
        <div className="text-zinc-600 text-center py-8">No logs yet. Enter your Figma URL and click Analyze.</div>
      )}
      {logs.map((log, i) => (
        <div key={i} className={
          log.message.startsWith('ERROR') ? 'text-red-400' :
          log.message.startsWith('DONE') ? 'text-emerald-400' :
          log.message.startsWith('RUNNING') ? 'text-blue-400' :
          'text-zinc-400'
        }>
          <span className="text-zinc-600">[{log.step}]</span> {log.message}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [hierarchicalSelection, setHierarchicalSelection] = useState<HierarchicalSelection | null>(null);
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState(4);
  const [runningStep, setRunningStep] = useState<number | null>(null);

  const [step4Data, setStep4Data] = useState<Step4Data | null>(null);
  const [step5Data, setStep5Data] = useState<Step5Data | null>(null);
  const [step6Data, setStep6Data] = useState<Step6Data | null>(null);
  const [step9Data, setStep9Data] = useState<Step9Data | null>(null);
  const [step10Data, setStep10Data] = useState<Step10Data | null>(null);

  const addLog = (step: number, message: string) => {
    setLogs(prev => [...prev, { step, message }]);
  };

  const handleAnalyze = async () => {
    const trimmedUrl = figmaUrl.trim();
    if (!trimmedUrl) return;
    if (!trimmedUrl.startsWith('https://figma.com/file/') && !trimmedUrl.startsWith('https://www.figma.com/file/') && !trimmedUrl.startsWith('https://www.figma.com/design/')) {
      setLogs([{ step: 0, message: 'ERROR: Invalid Figma URL.' }]);
      return;
    }
    if (!figmaToken.trim()) {
      setLogs([{ step: 0, message: 'ERROR: Figma API token is required' }]);
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(1);
    setLogs([{ step: 1, message: 'RUNNING: Fetching Figma file...' }]);

    try {
      addLog(2, 'RUNNING: Detecting components...');

      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figmaUrl: trimmedUrl, figmaToken: figmaToken.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        let hint = '';
        const err = (data.error || '').toLowerCase();
        if (err.includes('429') || err.includes('rate limit') || err.includes('too many requests')) {
          hint = ' — Rate limited. Wait 30s and try again.';
        } else if (err.includes('403') || err.includes('forbidden')) {
          hint = ' — Check your token permissions for this file.';
        } else if (err.includes('404') || err.includes('not found')) {
          hint = ' — File not found. Check the URL.';
        }
        addLog(2, `ERROR: ${data.error || 'Analysis failed'}${hint}`);
        setCurrentStep(0);
        setIsAnalyzing(false);
        return;
      }

      addLog(1, 'DONE: Figma file fetched');
      addLog(2, `DONE: Project: ${data.projectType} (${Math.round((data.confidence || 0) * 100)}%)`);
      addLog(3, 'DONE: Design tokens extracted');
      addLog(3, 'DONE: Analysis complete! Select sections and start pipeline.');

      const initialSelected = data.selectionConfig?.selected || [];
      setAnalysis(data);
      setSelectedSections(initialSelected);
      if (data.hierarchicalSelection) {
        setHierarchicalSelection(data.hierarchicalSelection);
      }
      setCurrentStep(3);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addLog(2, `ERROR: ${message}`);
      setCurrentStep(0);
    }

    setIsAnalyzing(false);
  };

  const handleStartPipeline = useCallback(async () => {
    if (!analysis) return;

    setIsAnalyzing(true);
    addLog(4, 'RUNNING: Starting pipeline session...');

    try {
      const body: Record<string, unknown> = {
        figmaUrl: figmaUrl.trim(),
        figmaToken: figmaToken.trim(),
        themeName: 'Generated Theme',
      };

      if (useAdvancedMode && hierarchicalSelection) {
        body.hierarchicalSelection = hierarchicalSelection;
      } else {
        body.selectedSections = selectedSections;
      }

      const res = await fetch(`${API_BASE}/api/pipeline/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        addLog(4, `ERROR: ${data.error || 'Failed to start pipeline'}`);
        setIsAnalyzing(false);
        return;
      }

      setSessionId(data.sessionId);
      setActiveStep(4);
      addLog(4, `DONE: Pipeline session created (${data.sessionId})`);
      addLog(4, 'Ready! Click "Run" on Step 4 to generate HTML/CSS code.');
    } catch (err) {
      addLog(4, `ERROR: ${err instanceof Error ? err.message : 'Connection error'}`);
    }

    setIsAnalyzing(false);
  }, [analysis, figmaUrl, figmaToken, selectedSections, useAdvancedMode, hierarchicalSelection]);

  const handleRunStep = useCallback(async (step: number) => {
    if (!sessionId) return;

    setRunningStep(step);
    addLog(step, `RUNNING: Step ${step} executing...`);

    try {
      const res = await fetch(`${API_BASE}/api/pipeline/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, step }),
      });

      const data = await res.json();

      if (!data.success) {
        addLog(step, `ERROR: ${data.error || 'Step failed'}`);
        setRunningStep(null);
        return;
      }

      setCompletedSteps(prev => new Set([...prev, step]));
      setActiveStep(step + 1);

      if (step === 4) {
        setStep4Data(data.data);
        addLog(4, `DONE: HTML generated (${data.data.html.split('\n').length} lines)`);
        addLog(4, `DONE: Global CSS (${data.data.globalCss.split('\n').length} lines)`);
        addLog(4, `DONE: Components CSS (${data.data.componentsCss.split('\n').length} lines)`);
        addLog(4, 'Review the code below, then click "Run" on Step 5.');
      } else if (step === 5) {
        setStep5Data(data.data);
        addLog(5, `DONE: ${data.data.templateCount} Elementor templates generated`);
        addLog(5, 'Review templates, then click "Run" on Step 6.');
      } else if (step === 6) {
        setStep6Data(data.data);
        addLog(6, `DONE: ${data.data.fileCount} theme files created`);
        addLog(6, 'Review file list, then click "Run" on Step 7.');
      } else if (step === 7) {
        addLog(7, `DONE: Configuration layer applied (${data.data.fileCount} files)`);
        addLog(7, data.data.note);
        addLog(7, 'Click "Run" on Step 8 for WooCommerce integration.');
      } else if (step === 8) {
        addLog(8, data.data.note);
        addLog(8, 'Click "Run" on Step 9 for validation.');
      } else if (step === 9) {
        setStep9Data(data.data);
        addLog(9, `DONE: Validation score: ${data.data.score}/100`);
        addLog(9, `DONE: Errors: ${data.data.errors.length} | Warnings: ${data.data.warnings.length}`);
        addLog(9, `DONE: Accessibility: ${data.data.accessibility.score}/100`);
        addLog(9, 'Click "Run" on Step 10 to package the theme.');
      } else if (step === 10) {
        setStep10Data(data.data);
        addLog(10, `DONE: Theme packaged at ${data.data.themeDir}`);
        addLog(10, `DONE: ZIP: ${data.data.zipPath}`);
        addLog(10, 'DONE: Pipeline complete!');
      }
    } catch (err) {
      addLog(step, `ERROR: ${err instanceof Error ? err.message : 'Connection error'}`);
    }

    setRunningStep(null);
  }, [sessionId]);

  const handleReset = () => {
    setAnalysis(null);
    setFigmaUrl('');
    setFigmaToken('');
    setCurrentStep(0);
    setLogs([]);
    setSelectedSections([]);
    setSessionId(null);
    setCompletedSteps(new Set());
    setActiveStep(4);
    setStep4Data(null);
    setStep5Data(null);
    setStep6Data(null);
    setStep9Data(null);
    setStep10Data(null);
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
            Step-by-step theme generation with full control at each stage
          </p>
        </div>

        {/* Pipeline Progress - ALL 10 steps visible from start */}
        <div className="mb-8">
          <PipelineProgress
            steps={ALL_STEPS}
            currentStep={currentStep}
            logs={logs}
            isRunning={isAnalyzing || runningStep !== null}
          />
        </div>

        {/* Phase 1: URL Input */}
        {!analysis && (
          <div className="max-w-2xl mx-auto mb-8 space-y-3">
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
              disabled={!figmaUrl || !figmaToken || isAnalyzing}
              className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-medium transition text-sm"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Design'}
            </button>
          </div>
        )}

        {/* Step 2 Output: Detected Components */}
        {analysis?.components && analysis.components.length > 0 && currentStep >= 2 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Detected Components</h3>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5">
              <ComponentPreview
                components={analysis.components}
                onSelect={(component) => {
                  addLog(2, `Selected: ${component.name} (${component.type})`);
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3 Output: Design Tokens */}
        {analysis?.designTokens && currentStep >= 3 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Design Tokens</h3>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5">
              <DesignTokensPanel tokens={analysis.designTokens} />
            </div>
          </div>
        )}

        {/* Phase 2: Section Selection + Start Pipeline */}
        {analysis && !sessionId && (
          <div className="max-w-4xl mx-auto mb-8 space-y-4">
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
                  onClick={handleReset}
                  className="text-xs text-zinc-500 hover:text-zinc-400 transition"
                >
                  Change URL
                </button>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-blue-400 text-lg">📋</span>
              <p className="text-blue-300 text-sm">
                Steps 1-3 complete. Select your sections below, then start the pipeline.
              </p>
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
              onClick={handleStartPipeline}
              disabled={isAnalyzing || (useAdvancedMode ? !hierarchicalSelection?.selectedSections?.length : selectedSections.length === 0)}
              className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-medium transition text-sm"
            >
              {isAnalyzing ? 'Starting...' : `Start Pipeline (${useAdvancedMode && hierarchicalSelection ? hierarchicalSelection.selectedSections.length : selectedSections.length} sections)`}
            </button>
          </div>
        )}

        {/* Phase 3: Step-by-step pipeline */}
        {sessionId && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Step Runner */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Pipeline Steps</h3>
              <StepRunner
                steps={PIPELINE_STEPS}
                completedSteps={completedSteps}
                activeStep={activeStep}
                runningStep={runningStep}
                onRunStep={handleRunStep}
              />
            </div>

            {/* Right: Step Output */}
            <div className="lg:col-span-3">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Step Output</h3>

              {/* Step 4: HTML/CSS Code */}
              {step4Data && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <p className="text-emerald-300 text-sm font-medium">Step 4 Complete — Generated Code</p>
                    <p className="text-zinc-500 text-xs mt-1">Review the HTML and CSS below. Click &quot;Run&quot; on Step 5 when ready.</p>
                  </div>
                  <CodeViewer
                    tabs={[
                      { label: 'HTML', content: step4Data.html },
                      { label: 'Global CSS', content: step4Data.globalCss },
                      { label: 'Components CSS', content: step4Data.componentsCss },
                    ]}
                    maxHeight="600px"
                  />
                </div>
              )}

              {/* Step 5: Elementor Templates */}
              {step5Data && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <p className="text-emerald-300 text-sm font-medium">Step 5 Complete — {step5Data.templateCount} Elementor Templates</p>
                    <p className="text-zinc-500 text-xs mt-1">Review templates below. Click &quot;Run&quot; on Step 6 when ready.</p>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 max-h-[600px] overflow-y-auto">
                    {step5Data.templates.map((t, i) => (
                      <div key={i} className="mb-3 p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium">{t.title}</span>
                          <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded">{t.type}</span>
                        </div>
                        <pre className="text-xs text-zinc-400 font-mono overflow-x-auto max-h-40 overflow-y-auto">
                          {JSON.stringify(t.content, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Theme Files */}
              {step6Data && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <p className="text-emerald-300 text-sm font-medium">Step 6 Complete — {step6Data.fileCount} Theme Files</p>
                    <p className="text-zinc-500 text-xs mt-1">Review file structure below. Click &quot;Run&quot; on Step 7 when ready.</p>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 max-h-[600px] overflow-y-auto font-mono text-xs">
                    {step6Data.files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
                        <span className="text-zinc-300">{f.path}</span>
                        <span className="text-zinc-600">{(f.size / 1024).toFixed(1)}KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 9: Validation */}
              {step9Data && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <p className="text-emerald-300 text-sm font-medium">Step 9 Complete — Validation Report</p>
                  </div>
                  <ValidationResults
                    data={{
                      errors: step9Data.errors.map(e => ({
                        message: e.message,
                        severity: e.severity as 'error' | 'warning' | 'info',
                        file: e.file,
                        line: e.line,
                        rule: e.rule,
                      })),
                      warnings: step9Data.warnings.map(w => ({
                        message: w.message,
                        severity: w.severity as 'error' | 'warning' | 'info',
                        file: w.file,
                        line: w.line,
                        rule: w.rule,
                      })),
                      summary: {
                        score: step9Data.score,
                        errors: step9Data.errors.length,
                        warnings: step9Data.warnings.length,
                        passed: step9Data.score >= 80,
                      },
                      performance: {
                        cssSize: step9Data.performance.cssSize,
                        jsSize: step9Data.performance.jsSize,
                        totalSize: step9Data.performance.totalSize,
                      },
                      accessibility: {
                        score: step9Data.accessibility.score,
                        issues: step9Data.accessibility.issues.map(i => ({
                          message: i.message,
                          severity: i.severity as 'error' | 'warning' | 'info',
                          rule: i.rule,
                        })),
                      },
                    }}
                  />
                </div>
              )}

              {/* Step 10: Done */}
              {step10Data && (
                <div className="space-y-4">
                  <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-6 text-center">
                    <p className="text-emerald-400 text-lg font-medium mb-3">Theme Generated Successfully!</p>
                    <p className="text-zinc-400 text-sm mb-2">{step10Data.fileCount} files created</p>
                    <p className="text-zinc-500 text-xs mb-4">ZIP: {step10Data.zipPath}</p>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition"
                    >
                      Start over
                    </button>
                  </div>
                </div>
              )}

              {/* No step output yet */}
              {!step4Data && !step5Data && !step6Data && !step9Data && !step10Data && (
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-12 text-center">
                  <p className="text-4xl mb-4">🚀</p>
                  <p className="text-zinc-400 text-sm">Click &quot;Run&quot; on Step 4 to start generating your theme</p>
                  <p className="text-zinc-600 text-xs mt-2">Each step will show its output here for review</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Always-visible logs box */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Logs</h3>
          <LogBox logs={logs} />
        </div>
      </div>
    </main>
  );
}
