'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const KnowledgeGraphViz = dynamic(() => import('../../components/KnowledgeGraph'), { ssr: false, loading: () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <svg className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p className="text-sm text-[#71717a]">Loading graph…</p>
    </div>
  </div>
)});

export default function KnowledgeGraphPage() {
  const [filter, setFilter] = useState<'all' | 'paper' | 'entity' | 'concept'>('all');

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#09090b]/80 border-b border-[#27272a] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Knowledge Graph</h1>
          <p className="text-xs text-[#71717a] mt-0.5">Entity relationships extracted from indexed papers via Neo4j GraphRAG</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'paper', 'entity', 'concept'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-indigo-500/20 text-indigo-400' : 'text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <KnowledgeGraphViz activeFilter={filter} />
        </div>

        <div className="w-[220px] flex-shrink-0 border-l border-[#27272a] flex flex-col overflow-y-auto">
          <div className="p-4">
            <p className="text-xs text-[#71717a] font-medium uppercase tracking-wider mb-3">Graph Stats</p>
            <div className="space-y-3">
              {[
                { label: 'Papers',   value: '7',   color: 'bg-violet-400' },
                { label: 'Entities', value: '34',  color: 'bg-cyan-400'   },
                { label: 'Concepts', value: '21',  color: 'bg-indigo-400'  },
                { label: 'Edges',    value: '89',  color: 'bg-emerald-400'},
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                    <span className="text-xs text-[#a1a1aa]">{s.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#fafafa]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#27272a]">
            <p className="text-xs text-[#71717a] font-medium uppercase tracking-wider mb-3">Legend</p>
            <div className="space-y-2">
              {[
                { label: 'Paper node',   color: 'bg-violet-400'  },
                { label: 'Entity node',  color: 'bg-cyan-400'    },
                { label: 'Concept node', color: 'bg-indigo-400'   },
                { label: 'Relationship', color: 'bg-[#3f3f46]'   },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${l.color}`}></span>
                  <span className="text-[11px] text-[#71717a]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#27272a]">
            <p className="text-xs text-[#71717a] font-medium uppercase tracking-wider mb-3">Top Entities</p>
            <div className="space-y-2">
              {[
                { name: 'HeLa Cells',        count: 5 },
                { name: 'Lipid Nanoparticles',count: 4 },
                { name: 'Oxidative Stress',   count: 4 },
                { name: 'mRNA',               count: 3 },
                { name: 'Cytotoxicity',       count: 3 },
              ].map(e => (
                <div key={e.name} className="flex items-center justify-between">
                  <span className="text-[11px] text-[#a1a1aa] truncate">{e.name}</span>
                  <span className="text-[10px] text-[#52525b] ml-2 flex-shrink-0">{e.count} refs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
