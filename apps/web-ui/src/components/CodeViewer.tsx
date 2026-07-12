'use client';

import { useState } from 'react';

interface Tab {
  label: string;
  content: string;
  language?: string;
}

interface CodeViewerProps {
  tabs: Tab[];
  maxHeight?: string;
}

export default function CodeViewer({ tabs, maxHeight = '500px' }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tabs[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = tabs[activeTab].content.split('\n').length;

  return (
    <div className="rounded-xl border border-zinc-700 overflow-hidden bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-xs font-medium transition ${
                activeTab === i
                  ? 'text-white border-b-2 border-blue-500 bg-zinc-800/50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-zinc-600">
                {tab.content.split('\n').length}L
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-3">
          <span className="text-xs text-zinc-600">{lineCount} lines</span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className="p-4 text-xs font-mono leading-relaxed text-zinc-300 whitespace-pre-wrap break-words">
          {tabs[activeTab].content}
        </pre>
      </div>
    </div>
  );
}
