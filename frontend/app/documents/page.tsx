'use client';
import React, { useState } from 'react';

const mockDocs = [
  { id: '1', name: 'Silver_Nanoparticles_HeLa_Cytotoxicity.pdf',  size: 2.4,  pages: 18, tags: ['nanotoxicology', 'HeLa', 'AgNPs'],   status: 'indexed',    date: '2024-01-14' },
  { id: '2', name: 'mRNA_LNP_Delivery_Comparative_Study.pdf',      size: 3.1,  pages: 24, tags: ['mRNA', 'lipid nanoparticles', 'drug'], status: 'indexed',    date: '2024-01-13' },
  { id: '3', name: 'CRISPR_Cas9_Off_Target_Meta_Analysis.pdf',     size: 1.8,  pages: 12, tags: ['CRISPR', 'gene editing'],              status: 'indexed',    date: '2024-01-10' },
  { id: '4', name: 'ZnO_Nanoparticles_Plant_Toxicology.pdf',       size: 4.2,  pages: 31, tags: ['ZnO', 'plant toxicology'],             status: 'indexed',    date: '2024-01-08' },
  { id: '5', name: 'Extracellular_Vesicle_Proteomics.pdf',         size: 2.9,  pages: 22, tags: ['EVs', 'proteomics', 'biomarkers'],     status: 'indexed',    date: '2024-01-05' },
  { id: '6', name: 'CAR_T_Cell_Exhaustion_Review.pdf',             size: 5.6,  pages: 41, tags: ['CAR-T', 'immunotherapy'],              status: 'processing', date: '2024-01-04' },
  { id: '7', name: 'Graphene_Oxide_Lung_Toxicity.pdf',             size: 3.3,  pages: 27, tags: ['graphene', 'lung', 'toxicity'],        status: 'indexed',    date: '2024-01-02' },
];

const statusColors: Record<string, string> = {
  indexed:    'text-emerald-400 bg-emerald-400/10',
  processing: 'text-indigo-400 bg-indigo-400/10',
};

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const filtered = mockDocs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#09090b]/80 border-b border-[#27272a] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Documents</h1>
          <p className="text-xs text-[#71717a] mt-0.5">{mockDocs.length} papers indexed · {mockDocs.reduce((a, d) => a + d.pages, 0)} total pages</p>
        </div>
        <button
          onClick={() => document.getElementById('doc-upload')?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Upload Papers
          <input id="doc-upload" type="file" accept=".pdf" multiple className="hidden"/>
        </button>
      </header>

      <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragOver ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#27272a] hover:border-[#3f3f46]'}`}
        >
          <svg className="w-8 h-8 mx-auto mb-2 text-[#52525b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          <p className="text-sm text-[#71717a]">Drag & drop PDF papers to index them</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search papers or tags…"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <span className="text-xs text-[#52525b]">{filtered.length} of {mockDocs.length}</span>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#27272a] text-[10px] text-[#52525b] uppercase tracking-wider">
                <th className="px-6 py-3 text-left font-medium">File</th>
                <th className="px-4 py-3 text-left font-medium">Tags</th>
                <th className="px-4 py-3 text-right font-medium">Pages</th>
                <th className="px-4 py-3 text-right font-medium">Size</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Indexed</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id} className="border-b border-[#27272a] last:border-0 hover:bg-[#27272a] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <span className="text-[#e4e4e7] font-medium truncate max-w-[240px]">{doc.name.replace('.pdf', '').replaceAll('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-[#09090b] border border-[#27272a] text-[#71717a] rounded text-[10px]">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-[#71717a]">{doc.pages}</td>
                  <td className="px-4 py-4 text-right text-[#71717a]">{doc.size} MB</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusColors[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#52525b] text-xs">{doc.date}</td>
                  <td className="px-4 py-4">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#52525b] hover:text-red-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
