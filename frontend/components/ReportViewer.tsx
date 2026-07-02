'use client';
import React, { useState } from 'react';

interface Props { content: string; }

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#fafafa] font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-[#e4e4e7] italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-[#09090b] border border-[#27272a] text-indigo-300 px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>');
}

function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      nodes.push(<h1 key={key++} className="text-xl font-bold text-[#fafafa] mt-6 mb-3">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h2 key={key++} className="text-base font-semibold text-[#fafafa] mt-5 mb-2 border-b border-[#27272a] pb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      nodes.push(<h3 key={key++} className="text-sm font-semibold text-[#e4e4e7] mt-4 mb-1.5">{line.slice(4)}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={key++} className="list-none space-y-1 my-2 ml-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5"></span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-2" />);
    } else {
      nodes.push(
        <p key={key++} className="text-sm text-[#a1a1aa] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
      );
    }
    i++;
  }
  return nodes;
}

export default function ReportViewer({ content }: Props) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'report.md'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#71717a] hover:text-[#fafafa] rounded-lg text-xs transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#71717a] hover:text-[#fafafa] rounded-lg text-xs transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Save (.md)
        </button>
      </div>
      <div className="space-y-1">{renderMarkdown(content)}</div>
    </div>
  );
}
