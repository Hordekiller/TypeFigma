'use client';

import { useEffect, useState } from 'react';

export interface ThemeControlsProps {
  onToggleMode: () => void;
  onChangeDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  darkMode: boolean;
  device: 'desktop' | 'tablet' | 'mobile';
}

export default function ThemeControls({
  onToggleMode,
  onChangeDevice,
  darkMode,
  device,
}: ThemeControlsProps) {
  return (
    <div className="theme-controls flex items-center gap-2 p-2 bg-zinc-900/50 border-b border-zinc-800">
      <button
        onClick={onToggleMode}
        className="p-1.5 rounded-md hover:bg-zinc-800 transition text-xs"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      <select
        value={device}
        onChange={(e) => onChangeDevice(e.target.value as 'desktop' | 'tablet' | 'mobile')}
        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="desktop">Desktop</option>
        <option value="tablet">Tablet</option>
        <option value="mobile">Mobile</option>
      </select>
    </div>
  );
}