'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard',       href: '/',                icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zm10 0a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2z' },
  { label: 'Research',        href: '/research',        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Documents',       href: '/documents',       icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { label: 'Knowledge Graph', href: '/knowledge-graph', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { label: 'Reports',         href: '/reports',         icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-[#27272a] bg-[#09090b] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-[#27272a]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.3)]">
          <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight tracking-tight text-[#fafafa]">SciPilot</div>
          <div className="text-[10px] text-[#52525b] uppercase tracking-widest font-medium">Research OS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/15 to-indigo-500/5 text-indigo-300 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]'
                  : 'text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-full"/>
              )}
              <svg className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-[#52525b] group-hover:text-[#71717a]'}`}
                fill="none" stroke="currentColor" viewBox="0 0 20 20" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider + build info */}
      <div className="px-4 py-3 border-t border-[#27272a]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] text-[#52525b]">LangGraph · Neo4j · pgvector</span>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-[#27272a] flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]">YW</div>
        <div>
          <p className="text-[13px] font-medium text-[#fafafa] leading-none">Yash Wasnik</p>
          <p className="text-[10px] text-[#52525b] mt-0.5">Researcher</p>
        </div>
      </div>
    </aside>
  );
}