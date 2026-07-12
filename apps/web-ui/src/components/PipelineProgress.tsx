'use client';

import { useMemo } from 'react';

interface Step {
  num: number;
  name: string;
  icon: string;
}

interface LogEntry {
  step: number;
  message: string;
}

interface PipelineProgressProps {
  steps: Step[];
  currentStep: number;
  logs: LogEntry[];
  isRunning: boolean;
}

const STEP_COLORS: Record<string, string> = {
  complete: 'bg-green-500',
  active: 'bg-blue-500 animate-pulse',
  pending: 'bg-zinc-700',
  error: 'bg-red-500',
};

export default function PipelineProgress({ steps, currentStep, logs, isRunning }: PipelineProgressProps) {
  const statusMap = useMemo(() => {
    const map: Record<number, string> = {};
    const stepErrors = new Set(logs.filter(l => l.message.startsWith('ERROR')).map(l => l.step));

    for (const step of steps) {
      const hasError = stepErrors.has(step.num);
      if (hasError) {
        map[step.num] = 'error';
      } else if (step.num < currentStep) {
        map[step.num] = 'complete';
      } else if (step.num === currentStep) {
        map[step.num] = 'active';
      } else {
        map[step.num] = 'pending';
      }
    }
    return map;
  }, [steps, currentStep, logs]);

  const progressPercent = useMemo(() => {
    const completed = steps.filter(s => statusMap[s.num] === 'complete' || statusMap[s.num] === 'error').length;
    return Math.round((completed / steps.length) * 100);
  }, [steps, statusMap]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Pipeline Progress</h3>
        <span className="text-xs text-zinc-500 tabular-nums">{progressPercent}%</span>
      </div>

      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map(step => {
          const status = statusMap[step.num];
          const isLast = step.num === steps.length;
          return (
            <div key={step.num} className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                status === 'active' ? 'bg-blue-500/10 text-blue-300' :
                status === 'complete' ? 'bg-green-500/10 text-green-300' :
                status === 'error' ? 'bg-red-500/10 text-red-300' :
                'bg-zinc-900 text-zinc-600'
              }`}>
                <span className={STEP_COLORS[status] || 'bg-zinc-700'}>
                  <span className="block w-1.5 h-1.5 rounded-full" />
                </span>
                <span>{step.icon}</span>
                <span className="font-medium tabular-nums">{step.num}.</span>
                <span className="hidden sm:inline">{step.name}</span>
              </div>
              {!isLast && <span className="text-zinc-800 text-xs">→</span>}
            </div>
          );
        })}
      </div>

      {isRunning && (
        <div className="text-xs text-blue-400/70 flex items-center gap-2">
          <span className="animate-pulse">●</span>
          Running step {currentStep}: {steps.find(s => s.num === currentStep)?.name}
        </div>
      )}
    </div>
  );
}
