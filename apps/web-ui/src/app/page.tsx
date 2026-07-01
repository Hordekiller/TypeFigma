'use client';

import { useState } from 'react';

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

export default function Home() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!figmaUrl) return;
    setIsGenerating(true);
    setCurrentStep(1);
    setLogs(['📥 Initiating Figma fetch...']);

    for (let i = 1; i <= STEPS.length; i++) {
      setCurrentStep(i);
      setLogs(prev => [...prev, `🔄 ${STEPS[i - 1].icon} ${STEPS[i - 1].name}...`]);
      await new Promise(r => setTimeout(r, 600));
      setLogs(prev => [...prev, `   ✅ ${STEPS[i - 1].name} completed`]);
    }

    setLogs(prev => [...prev, '', '🎉 Theme generated successfully!']);
    setIsGenerating(false);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
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
        {/* Hero */}
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

        {/* Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://figma.com/file/..."
              value={figmaUrl}
              onChange={e => setFigmaUrl(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={!figmaUrl || isGenerating}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-medium transition text-sm"
            >
              {isGenerating ? 'Generating...' : 'Generate Theme'}
            </button>
          </div>
        </div>

        {/* Pipeline & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Steps Pipeline */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Pipeline</h3>
            <div className="space-y-1.5">
              {STEPS.map((step, i) => {
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

          {/* Logs / Preview */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Live Preview</h3>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 h-[500px] overflow-y-auto font-mono text-xs leading-relaxed">
              {logs.length === 0 ? (
                <div className="text-zinc-600 text-center mt-32">
                  <p className="text-4xl mb-4">🎨</p>
                  <p className="text-sm font-sans">Enter a Figma URL and click Generate</p>
                  <p className="text-xs mt-2">The pipeline output will appear here</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={log.startsWith('   ') ? 'text-zinc-500 pl-4' : 'text-zinc-300'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Features */}
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
