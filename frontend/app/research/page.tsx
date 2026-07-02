'use client';
import React, { useState, useCallback } from 'react';
import AgentStream from '../../components/AgentStream';

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const handleFile = useCallback(async (file: File) => {
    setUploadedFile(file);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('http://localhost:8001/upload-context', { method: 'POST', body: fd });
      const json = await res.json();
      setSessionId(json.session_id);
    } catch {
      // backend may not be running in local dev
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') handleFile(file);
  }, [handleFile]);

  const handleRun = () => {
    if (!query.trim() || uploading) return;
    setIsResearching(true);
  };

  const handleReset = () => {
    setIsResearching(false);
    setQuery('');
    setUploadedFile(null);
    setSessionId('');
  };

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#09090b]/80 border-b border-[#27272a] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Research</h1>
          <p className="text-xs text-[#71717a] mt-0.5">Multi-agent scientific research powered by LangGraph</p>
        </div>
        {isResearching && (
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border border-[#27272a] hover:border-[#3f3f46] text-[#71717a] hover:text-[#fafafa] rounded-lg text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            New Query
          </button>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[280px] flex-shrink-0 border-r border-[#27272a] flex flex-col overflow-y-auto">
          <div className="p-5">
            <p className="text-xs text-[#71717a] font-medium uppercase tracking-wider mb-3">Context Paper</p>
            <p className="text-[11px] text-[#52525b] mb-4">Upload a PDF to ground the agents in a specific paper before running a query.</p>
            {!uploadedFile ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById('research-file-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#27272a] hover:border-[#3f3f46] hover:bg-[#18181b]'}`}
              >
                <svg className="w-7 h-7 mx-auto mb-2 text-[#52525b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p className="text-xs text-[#71717a]">Drop PDF here</p>
                <p className="text-[11px] text-[#52525b] mt-1">or click to browse</p>
                <input id="research-file-input" type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-[#18181b] border border-[#27272a] rounded-xl">
                {uploading ? (
                  <svg className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#fafafa] truncate font-medium">{uploadedFile.name}</p>
                  <p className="text-[11px] text-[#52525b] mt-0.5">{uploading ? 'Extracting...' : `${(uploadedFile.size / 1024).toFixed(0)} KB · Indexed`}</p>
                </div>
                <button onClick={() => { setUploadedFile(null); setSessionId(''); }} className="text-[#52525b] hover:text-red-400 transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-[#27272a]">
            <p className="text-xs text-[#71717a] font-medium uppercase tracking-wider mb-3">Active Agents</p>
            <div className="space-y-2.5">
              {[
                { name: 'Paper Reader', dot: 'bg-emerald-400', desc: 'Extracts text & metadata' },
                { name: 'Reasoner',     dot: 'bg-indigo-400',  desc: 'Synthesizes findings'     },
                { name: 'Fact Checker', dot: 'bg-indigo-400',   desc: 'Validates claims'          },
                { name: 'Graph Agent',  dot: 'bg-violet-400',  desc: 'Builds knowledge graph'    },
                { name: 'Citation',     dot: 'bg-cyan-400',    desc: 'Links references'          },
                { name: 'Reporter',     dot: 'bg-rose-400',    desc: 'Generates final report'    },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot} ${isResearching ? 'animate-pulse' : ''}`}></span>
                  <div>
                    <p className="text-[12px] text-[#a1a1aa] leading-none">{a.name}</p>
                    <p className="text-[10px] text-[#52525b] mt-0.5">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#27272a]">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRun()}
                placeholder="e.g. What are the key cytotoxic mechanisms described in this paper?"
                disabled={isResearching}
                className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
              />
              <button
                onClick={handleRun}
                disabled={!query.trim() || isResearching || uploading}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] whitespace-nowrap"
              >
                {isResearching ? 'Running…' : 'Run Agents →'}
              </button>
            </div>
            {!isResearching && (
              <div className="flex flex-wrap gap-2 mt-3">
                {['Summarize key findings', 'What methods were used?', 'List all cited papers', 'Extract experimental conditions'].map(s => (
                  <button key={s} onClick={() => setQuery(s)} className="px-3 py-1 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#71717a] hover:text-[#fafafa] rounded-full text-xs transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isResearching ? (
              <AgentStream query={query} isActive={isResearching} sessionId={sessionId} onComplete={() => {}} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                </div>
                <p className="text-[#a1a1aa] font-medium">Ready to research</p>
                <p className="text-xs text-[#52525b] mt-1 max-w-xs">Optionally upload a PDF context paper, then type your research question and hit Run Agents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
