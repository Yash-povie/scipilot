'use client';
import React from 'react';
import Link from 'next/link';

const stats = [
  { label: 'Papers Indexed', value: '42',   sub: '+8 this week',     color: 'text-indigo-400',   border: 'border-t-indigo-400/40',   icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { label: 'Queries Run',    value: '128',  sub: '+23 today',        color: 'text-emerald-400', border: 'border-t-emerald-400/40', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { label: 'Cache Hit Rate', value: '73%',  sub: 'saves ~$4.20/day', color: 'text-violet-400',  border: 'border-t-violet-400/40',  icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { label: 'Avg Response',   value: '2.4s', sub: 'p95: 4.1s',       color: 'text-rose-400',    border: 'border-t-rose-400/40',    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const queries = [
  { q: 'Cytotoxic mechanisms of silver nanoparticles on HeLa cells',  t: '2h ago', s: 'Complete', c: 'text-emerald-400 bg-emerald-400/10' },
  { q: 'mRNA delivery via lipid nanoparticles — comparative efficacy', t: '1d ago', s: 'Complete', c: 'text-emerald-400 bg-emerald-400/10' },
  { q: 'CRISPR-Cas9 off-target mutation rates — meta-analysis',        t: '3d ago', s: 'Cached',   c: 'text-indigo-400 bg-indigo-400/10'   },
  { q: 'Toxicological profile of ZnO nanoparticles in plant systems',  t: '5d ago', s: 'Complete', c: 'text-emerald-400 bg-emerald-400/10' },
  { q: 'Extracellular vesicle cargo proteins — proteomic analysis',    t: '1w ago', s: 'Cached',   c: 'text-indigo-400 bg-indigo-400/10'   },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#09090b]/90 border-b border-[#27272a] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#fafafa]">Research Dashboard</h1>
          <p className="text-xs text-[#52525b] mt-0.5">Overview of your scientific research activity</p>
        </div>
        <Link
          href="/research"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_28px_rgba(99,102,241,0.4)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          New Research
        </Link>
      </header>

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`bg-gradient-to-br from-[#27272a] to-[#18181b] border border-[#27272a] border-t-2 ${s.border} rounded-xl p-5 hover:border-[#3f3f46] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#71717a] font-medium uppercase tracking-wider">{s.label}</p>
                <svg className={`w-4 h-4 ${s.color} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={s.icon}/>
                </svg>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#52525b] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent Queries */}
          <div className="col-span-2 bg-gradient-to-b from-[#111113] to-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#fafafa]">Recent Queries</h2>
              <Link href="/research" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
            </div>
            {queries.map((r, i) => (
              <Link key={i} href="/research" className="block px-6 py-4 border-b border-[#27272a] last:border-0 hover:bg-[#27272a] transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-[#e4e4e7] truncate">{r.q}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-[#52525b]">{r.t}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r.c}`}>{r.s}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-4">
            {/* Agent Status */}
            <div className="bg-gradient-to-b from-[#111113] to-[#18181b] border border-[#27272a] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[#fafafa] mb-4">Agent Status</h2>
              <div className="space-y-2.5">
                {[
                  { name: 'Paper Reader', dot: 'bg-emerald-400' },
                  { name: 'Reasoner',     dot: 'bg-indigo-400'   },
                  { name: 'Fact Checker', dot: 'bg-cyan-400'  },
                  { name: 'Graph Agent',  dot: 'bg-violet-400'  },
                  { name: 'Citation',     dot: 'bg-indigo-300'   },
                  { name: 'Reporter',     dot: 'bg-rose-400'    },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${a.dot}`}></span>
                      <span className="text-xs text-[#a1a1aa]">{a.name}</span>
                    </div>
                    <span className="text-[11px] text-[#52525b] bg-[#27272a] px-2 py-0.5 rounded">idle</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-b from-[#111113] to-[#18181b] border border-[#27272a] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[#fafafa] mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/research" className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-gradient-to-r from-indigo-600/20 to-violet-600/10 hover:from-indigo-600/30 hover:to-violet-600/20 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-semibold transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  Start New Research
                </Link>
                <Link href="/documents" className="flex items-center gap-2.5 w-full px-3.5 py-2.5 hover:bg-[#27272a] text-[#71717a] hover:text-[#fafafa] border border-transparent hover:border-[#27272a] rounded-lg text-xs font-medium transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  Upload Papers
                </Link>
                <Link href="/knowledge-graph" className="flex items-center gap-2.5 w-full px-3.5 py-2.5 hover:bg-[#27272a] text-[#71717a] hover:text-[#fafafa] border border-transparent hover:border-[#27272a] rounded-lg text-xs font-medium transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                  Explore Knowledge Graph
                </Link>
                <Link href="/reports" className="flex items-center gap-2.5 w-full px-3.5 py-2.5 hover:bg-[#27272a] text-[#71717a] hover:text-[#fafafa] border border-transparent hover:border-[#27272a] rounded-lg text-xs font-medium transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  View Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}