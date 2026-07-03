'use client';

import { useState } from 'react';

interface ThemeSettings {
  themeName: string;
  createZip: boolean;
  outputDir: string;
}

interface SettingsPanelProps {
  settings: ThemeSettings;
  onChange: (settings: ThemeSettings) => void;
  onGenerate: () => void;
  isRunning: boolean;
  validationScore?: number;
  projectType?: string;
}

interface ValidationSummaryProps {
  score: number;
  projectType: string;
}

function ValidationSummary({ score, projectType }: ValidationSummaryProps) {
  const scoreColor =
    score >= 80 ? 'text-green-400' :
    score >= 50 ? 'text-amber-400' :
    'text-red-400';
  const scoreBg =
    score >= 80 ? 'bg-green-500/10 border-green-500/20' :
    score >= 50 ? 'bg-amber-500/10 border-amber-500/20' :
    'bg-red-500/10 border-red-500/20';

  return (
    <div className={`rounded-lg border p-4 ${scoreBg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-300">Validation Score</span>
        <span className={`text-2xl font-bold tabular-nums ${scoreColor}`}>{score}</span>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Project Type</span>
          <span className="font-medium text-zinc-300 capitalize">{projectType}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Status</span>
          <span className={score >= 70 ? 'text-green-400' : 'text-amber-400'}>
            {score >= 70 ? 'Passed' : 'Needs Review'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPanel({ settings, onChange, onGenerate, isRunning, validationScore, projectType }: SettingsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>('general');

  const toggleSection = (key: string) => {
    setExpanded(prev => prev === key ? null : key);
  };

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Settings</h3>
        <button
          onClick={onGenerate}
          disabled={isRunning}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
            isRunning
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {isRunning ? (
            <>
              <span className="animate-pulse">●</span>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Theme
            </>
          )}
        </button>
      </div>

      {validationScore !== undefined && projectType && (
        <ValidationSummary score={validationScore} projectType={projectType} />
      )}

      <div className="space-y-1">
        {/* General Section */}
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <button
            onClick={() => toggleSection('general')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-zinc-900/50 transition"
          >
            <span className="text-sm font-medium text-zinc-300">General</span>
            <svg className={`w-4 h-4 text-zinc-500 transition-transform ${expanded === 'general' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded === 'general' && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Theme Name</label>
                <input
                  type="text"
                  value={settings.themeName}
                  onChange={e => updateSetting('themeName', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 rounded text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
                  placeholder="My WordPress Theme"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Output Directory</label>
                <input
                  type="text"
                  value={settings.outputDir}
                  onChange={e => updateSetting('outputDir', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 rounded text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
                  placeholder="./output"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.createZip}
                  onChange={e => updateSetting('createZip', e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                />
                Create ZIP archive after generation
              </label>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <button
            onClick={() => toggleSection('actions')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-zinc-900/50 transition"
          >
            <span className="text-sm font-medium text-zinc-300">Quick Actions</span>
            <svg className={`w-4 h-4 text-zinc-500 transition-transform ${expanded === 'actions' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded === 'actions' && (
            <div className="px-3 pb-3 space-y-2">
              <button className="w-full px-3 py-2 text-xs text-left text-zinc-400 bg-zinc-900/50 rounded hover:bg-zinc-900 transition flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Last Export
              </button>
              <button className="w-full px-3 py-2 text-xs text-left text-zinc-400 bg-zinc-900/50 rounded hover:bg-zinc-900 transition flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Reset All Settings
              </button>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <button
            onClick={() => toggleSection('about')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-zinc-900/50 transition"
          >
            <span className="text-sm font-medium text-zinc-300">About</span>
            <svg className={`w-4 h-4 text-zinc-500 transition-transform ${expanded === 'about' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded === 'about' && (
            <div className="px-3 pb-3 space-y-2 text-xs text-zinc-500">
              <p>TypeFigma converts Figma designs into complete WordPress themes with Elementor integration.</p>
              <p>The process follows a 10-step pipeline:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Fetch &amp; Analysis</li>
                <li>Component Detection</li>
                <li>Design Tokens</li>
                <li>Code Generation</li>
                <li>Elementor JSON</li>
                <li>Theme Structure</li>
                <li>Configuration</li>
                <li>WooCommerce</li>
                <li>Validation</li>
                <li>Package &amp; Export</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
