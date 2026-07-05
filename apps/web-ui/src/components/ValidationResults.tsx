'use client';

import { useState, useMemo } from 'react';

interface ValidationIssue {
  line?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
  file?: string;
}

interface ValidationPerformance {
  cssSize?: number;
  jsSize?: number;
  totalSize?: number;
  loadTime?: number;
}

interface ValidationAccessibility {
  score: number;
  issues: ValidationIssue[];
}

interface ValidationWordPress {
  i18nFunctions?: number;
  noncesFound?: number;
  themeCheckPassed?: boolean;
}

interface ValidationSummary {
  score: number;
  errors: number;
  warnings: number;
  passed: boolean;
}

interface ValidationData {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: ValidationSummary;
  performance?: ValidationPerformance;
  accessibility?: ValidationAccessibility;
  wordpress?: ValidationWordPress;
}

interface ValidationResultsProps {
  data: ValidationData;
}

const COLORS = {
  error: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  info: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
};

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  const strokeColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgb(39 39 42)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="36" fill="none" stroke={strokeColor} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <text x="40" y="40" textAnchor="middle" dominantBaseline="central" className="fill-current text-lg font-bold" fill="currentColor">
          {score}
        </text>
      </svg>
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function IssueList({ issues, type }: { issues: ValidationIssue[]; type: 'error' | 'warning' | 'info' }) {
  const [expanded, setExpanded] = useState(false);
  const colors = COLORS[type];
  const displayIssues = expanded ? issues : issues.slice(0, 5);

  if (issues.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-300 transition"
      >
        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <span className={colors.text}>{issues.length} {type}{issues.length > 1 ? 's' : ''}</span>
        {issues.length > 5 && (
          <span className="text-zinc-600">({expanded ? 'show less' : `show all ${issues.length}`})</span>
        )}
      </button>
      {displayIssues.map((issue, i) => (
        <div key={i} className={`p-2.5 rounded border text-xs ${colors.bg} ${colors.border}`}>
          <div className="flex items-start gap-2">
            <span className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${colors.dot}`} />
            <div className="min-w-0">
              <p className="text-zinc-300">{issue.message}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                {issue.rule && <span>Rule: {issue.rule}</span>}
                {issue.file && <span>File: {issue.file}</span>}
                {issue.line && <span>Line: {issue.line}</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ValidationResults({ data }: ValidationResultsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'issues' | 'accessibility'>('summary');

  const allIssues = useMemo(() => [
    ...data.errors.map(e => ({ ...e, severity: 'error' as const })),
    ...data.warnings.map(w => ({ ...w, severity: 'warning' as const })),
  ], [data.errors, data.warnings]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Validation Results</h3>
        {data.summary.passed ? (
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Passed</span>
        ) : (
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Failed</span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-zinc-900/50 rounded-lg p-1">
        {(['summary', 'issues', 'accessibility'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition capitalize ${
              activeTab === tab
                ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'issues' ? `Issues (${allIssues.length})` : tab}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Score gauges */}
          <div className="flex items-center justify-center gap-6 py-4">
            <ScoreGauge score={data.summary.score} label="Overall" />
            {data.accessibility && <ScoreGauge score={data.accessibility.score} label="A11y" />}
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-lg font-bold text-zinc-200">{data.summary.errors}</div>
              <div className="text-xs text-zinc-500">Errors</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-lg font-bold text-zinc-200">{data.summary.warnings}</div>
              <div className="text-xs text-zinc-500">Warnings</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="text-lg font-bold text-zinc-200">{data.summary.score}</div>
              <div className="text-xs text-zinc-500">Score</div>
            </div>
          </div>
          {/* Performance */}
          {data.performance && (
            <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Performance</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-zinc-600">CSS:</span> <span className="text-zinc-300 font-mono">{(data.performance.cssSize! / 1024).toFixed(1)} KB</span></div>
                <div><span className="text-zinc-600">JS:</span> <span className="text-zinc-300 font-mono">{(data.performance.jsSize! / 1024).toFixed(1)} KB</span></div>
                <div><span className="text-zinc-600">Total:</span> <span className="text-zinc-300 font-mono">{(data.performance.totalSize! / 1024).toFixed(1)} KB</span></div>
              </div>
            </div>
          )}
          {/* WordPress */}
          {data.wordpress && (
            <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">WordPress</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-zinc-600">i18n:</span> <span className="text-zinc-300">{data.wordpress.i18nFunctions} functions</span></div>
                <div><span className="text-zinc-600">Nonces:</span> <span className="text-zinc-300">{data.wordpress.noncesFound}</span></div>
                <div><span className="text-zinc-600">Theme Check:</span>
                  <span className={data.wordpress.themeCheckPassed ? 'text-green-400' : 'text-red-400'}>
                    {data.wordpress.themeCheckPassed ? ' Passed' : ' Failed'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {data.errors.length > 0 && <IssueList issues={data.errors} type="error" />}
          {data.warnings.length > 0 && <IssueList issues={data.warnings} type="warning" />}
          {allIssues.length === 0 && (
            <div className="text-center py-8 text-zinc-600">
              <p className="text-sm">No issues found — theme is valid!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'accessibility' && (
        <div className="space-y-3">
          {data.accessibility ? (
            <>
              <div className="flex items-center justify-center py-4">
                <ScoreGauge score={data.accessibility.score} label="A11y Score" />
              </div>
              {data.accessibility.issues.length > 0 ? (
                <IssueList issues={data.accessibility.issues} type="warning" />
              ) : (
                <div className="text-center py-8 text-zinc-600">
                  <p className="text-sm">No accessibility issues found</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-zinc-600">
              <p className="text-sm">No accessibility data available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
