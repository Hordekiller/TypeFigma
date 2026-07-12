'use client';

interface StepInfo {
  num: number;
  name: string;
  icon: string;
}

interface StepRunnerProps {
  steps: StepInfo[];
  completedSteps: Set<number>;
  activeStep: number;
  runningStep: number | null;
  onRunStep: (step: number) => void;
}

export default function StepRunner({ steps, completedSteps, activeStep, runningStep, onRunStep }: StepRunnerProps) {
  return (
    <div className="space-y-1.5">
      {steps.map((step) => {
        const isCompleted = completedSteps.has(step.num);
        const isActive = activeStep === step.num;
        const isRunning = runningStep === step.num;
        const isLocked = step.num > activeStep && !isCompleted;

        return (
          <div
            key={step.num}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${
              isActive && !isCompleted
                ? 'bg-blue-600/10 border border-blue-500/30 text-blue-300'
                : isCompleted
                ? 'bg-emerald-600/5 border border-emerald-500/20 text-emerald-400'
                : isLocked
                ? 'text-zinc-600'
                : 'text-zinc-400'
            }`}
          >
            <span className="w-6 text-center">
              {isCompleted ? '✓' : isRunning ? '⏳' : step.icon}
            </span>
            <span className={`flex-1 ${isActive ? 'font-medium' : ''}`}>
              Step {step.num}: {step.name}
            </span>
            {isCompleted && (
              <span className="text-xs text-emerald-500">Done</span>
            )}
            {isActive && !isCompleted && !isRunning && (
              <button
                onClick={() => onRunStep(step.num)}
                className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition"
              >
                Run
              </button>
            )}
            {isRunning && (
              <span className="text-xs text-blue-400 animate-pulse">Running...</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
