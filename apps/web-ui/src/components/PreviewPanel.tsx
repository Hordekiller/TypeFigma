'use client';

import { useEffect, useState } from 'react';

interface PreviewPanelProps {
  themeUrl: string;
  isLoading?: boolean;
}

export default function PreviewPanel({ themeUrl, isLoading }: PreviewPanelProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="preview-panel flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-md hover:bg-zinc-800 transition"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <select
            value={device}
            onChange={(e) => setDevice(e.target.value as 'desktop' | 'tablet' | 'mobile')}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>
        <div className="text-xs text-zinc-500">
          {isLoading ? 'Loading preview...' : 'Live Preview'}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <div className="animate-spin mb-2">⭕</div>
              <div className="text-xs">Generating theme...</div>
            </div>
          </div>
        ) : (
          <iframe
            src={themeUrl}
            title="Theme Preview"
            className={`w-full h-full border-none ${device === 'mobile' ? 'scale-50 origin-top-left' : device === 'tablet' ? 'scale-75 origin-top-left' : ''}`}
            style={{
              transform: device === 'mobile' ? 'scale(0.5)' : device === 'tablet' ? 'scale(0.75)' : 'scale(1)',
              height: device === 'mobile' || device === 'tablet' ? '200%' : '100%',
            }}
          />
        )}
      </div>
    </div>
  );
}