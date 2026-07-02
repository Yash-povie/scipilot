'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

interface AgentMessage {
  id: string;
  agent: string;
  content: string;
  timestamp: string;
}

const AGENTS: Record<string, { dot: string; badge: string; label: string }> = {
  PaperReader:    { dot: 'bg-emerald-400', badge: 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20', label: 'Paper Reader' },
  Reasoner:       { dot: 'bg-indigo-400',  badge: 'bg-indigo-400/10 text-indigo-300 border border-indigo-400/20',   label: 'Reasoner' },
  FactChecker:    { dot: 'bg-indigo-400',   badge: 'bg-indigo-400/10 text-indigo-300 border border-indigo-400/20',     label: 'Fact Checker' },
  KnowledgeGraph: { dot: 'bg-violet-400',  badge: 'bg-violet-400/10 text-violet-300 border border-violet-400/20',  label: 'Knowledge Graph' },
  Citation:       { dot: 'bg-cyan-400',    badge: 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20',        label: 'Citations' },
  Report:         { dot: 'bg-rose-400',    badge: 'bg-rose-400/10 text-rose-300 border border-rose-400/20',        label: 'Final Report' },
};

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      nodes.push(<h3 key={key++} className="text-sm font-semibold text-[#fafafa] mt-3 mb-1 border-b border-[#27272a] pb-1">{line.slice(3)}</h3>);
    } else if (line.startsWith('### ')) {
      nodes.push(<h4 key={key++} className="text-xs font-semibold text-[#a1a1aa] mt-2 mb-0.5 uppercase tracking-wide">{line.slice(4)}</h4>);
    } else if (line.match(/^\d+\.\s/) || line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      const raw = line.replace(/^(\d+\.\s|- |\* |• )/, '');
      const content = raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      nodes.push(<p key={key++} className="text-sm text-[#e4e4e7] pl-4 my-0.5" dangerouslySetInnerHTML={{ __html: `• ${content}` }} />);
    } else if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-1.5" />);
    } else {
      const content = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      nodes.push(<p key={key++} className="text-sm text-[#e4e4e7] leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />);
    }
  }
  return nodes;
}

export default function AgentStream({ query, isActive, onComplete, sessionId }: {
  query: string;
  isActive: boolean;
  onComplete: () => void;
  sessionId?: string;
}) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isActive) return;
    setMessages([]);
    setIsComplete(false);

    const url = new URL('http://localhost:8001/stream');
    url.searchParams.set('query', query);
    if (sessionId) url.searchParams.set('session_id', sessionId);

    const es = new EventSource(url.toString());
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'end') {
          setIsComplete(true);
          onComplete();
          es.close();
        } else {
          setMessages(prev => [...prev, {
            id: Math.random().toString(36).slice(2),
            agent: data.agent || 'System',
            content: data.content || '',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      } catch {}
    };
    es.onerror = () => { es.close(); };
    return () => { es.close(); };
  }, [isActive, query, sessionId, onComplete]);

  const downloadMarkdown = useCallback(() => {
    const lines = [
      `# SciPilot Research Report`,
      `**Query:** ${query}`,
      `**Date:** ${new Date().toLocaleString()}`,
      `---`,
      ...messages.map(m => {
        const agent = AGENTS[m.agent] || { label: m.agent };
        return `\n## ${agent.label}\n*${m.timestamp}*\n\n${m.content}`;
      })
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scipilot-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages, query]);

  const copyAll = useCallback(() => {
    const text = messages.map(m => {
      const agent = AGENTS[m.agent] || { label: m.agent };
      return `## ${agent.label}\n${m.content}`;
    }).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [messages]);

  return (
    <div className="flex flex-col bg-[#09090b] border-t border-[#27272a]">
      {/* Header */}
      <div className="px-5 py-3 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Live Agent Swarm
        </h3>
        <div className="flex items-center gap-2">
          {isComplete && (
            <>
              {/* Copy button */}
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#a1a1aa] hover:text-white bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    Copy
                  </>
                )}
              </button>
              {/* Download button */}
              <button
                onClick={downloadMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Save .md
              </button>
            </>
          )}
          {isActive && !isComplete && (
            <span className="flex items-center gap-2 text-xs text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Running agents...
            </span>
          )}
          {isComplete && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="overflow-y-auto max-h-[520px] divide-y divide-[#27272a]">
        {messages.length === 0 && isActive && (
          <div className="flex items-center justify-center py-16 text-[#71717a] text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Dispatching agents...
            </div>
          </div>
        )}
        {messages.map((msg) => {
          const agent = AGENTS[msg.agent] || { dot: 'bg-slate-400', badge: 'bg-slate-400/10 text-slate-300 border border-slate-400/20', label: msg.agent };
          return (
            <div key={msg.id} className="px-5 py-4 hover:bg-[#18181b]/50 transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${agent.dot}`}></span>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${agent.badge}`}>
                  {agent.label}
                </span>
                <span className="text-[11px] text-[#52525b] ml-auto">{msg.timestamp}</span>
              </div>
              <div className="pl-4 border-l-2 border-[#27272a] space-y-1">
                {renderMarkdown(msg.content)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}