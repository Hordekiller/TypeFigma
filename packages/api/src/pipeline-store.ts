import type { FigmaAnalysis } from '@typefigma/analyzer';
import type { GeneratedCode } from '@typefigma/code-generator';
import type { ElementorTemplate, GlobalSettings } from '@typefigma/elementor-mapper';
import type { ThemeFile } from '@typefigma/theme-builder';

export interface PipelineSession {
  id: string;
  figmaUrl: string;
  figmaToken: string;
  themeName: string;
  currentStep: number;
  analysis: FigmaAnalysis;
  selectedSections?: string[];
  hierarchicalSelection?: import('@typefigma/elementor-mapper').HierarchicalSelection;
  step4?: { generatedCode: GeneratedCode };
  step5?: { elementorOutput: ElementorTemplate[]; globalSettings: GlobalSettings };
  step6?: { themeFiles: ThemeFile[] };
  step7?: { themeFiles: ThemeFile[] };
  step8?: { themeFiles: ThemeFile[] };
  step9?: {
    validation: {
      score: number;
      errors: Array<{ file: string; message: string; severity: string }>;
      warnings: Array<{ file: string; message: string; severity: string }>;
      accessibility: { score: number };
      performance: { cssSize: number; jsSize: number; totalSize: number };
      summary: { score: number; totalFiles: number; totalLines: number };
    };
  };
  step10?: { zipPath: string; themeDir: string };
  timestamp: number;
}

const SESSION_TTL = 30 * 60 * 1000;
const sessions = new Map<string, PipelineSession>();

export function createSession(
  id: string,
  figmaUrl: string,
  figmaToken: string,
  themeName: string,
  analysis: FigmaAnalysis,
  selectedSections?: string[],
  hierarchicalSelection?: import('@typefigma/elementor-mapper').HierarchicalSelection,
): PipelineSession {
  const session: PipelineSession = {
    id,
    figmaUrl,
    figmaToken,
    themeName,
    currentStep: 4,
    analysis,
    selectedSections,
    hierarchicalSelection,
    timestamp: Date.now(),
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): PipelineSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  if (Date.now() - session.timestamp > SESSION_TTL) {
    sessions.delete(id);
    return null;
  }
  return session;
}

export function updateSession(id: string, updates: Partial<PipelineSession>): PipelineSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  Object.assign(session, updates, { timestamp: Date.now() });
  return session;
}
