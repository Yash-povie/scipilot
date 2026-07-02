'use client';
import React, { useState } from 'react';
import ReportViewer from '../../components/ReportViewer';

const mockReports = [
  {
    id: '1',
    title: 'Cytotoxic Mechanisms of Silver Nanoparticles on HeLa Cells',
    query: 'What are the cytotoxic mechanisms of silver nanoparticles on HeLa cells?',
    date: '2024-01-14',
    wordCount: 1240,
    agents: ['Paper Reader', 'Reasoner', 'Fact Checker', 'Citation'],
    status: 'complete',
    content: `# Cytotoxic Mechanisms of Silver Nanoparticles on HeLa Cells

## Executive Summary

Silver nanoparticles (AgNPs) exhibit potent cytotoxicity against HeLa cervical cancer cells through multiple converging mechanisms. This analysis synthesizes findings across the indexed literature corpus.

## Key Findings

### 1. Oxidative Stress Induction
AgNPs generate reactive oxygen species (ROS) that overwhelm cellular antioxidant defenses. Studies report 3-8x elevation in intracellular ROS at IC50 concentrations (10-25 μg/mL).

### 2. Mitochondrial Dysfunction
AgNPs disrupt mitochondrial membrane potential (ΔΨm), triggering intrinsic apoptosis cascades. Caspase-3 and caspase-9 activation was confirmed via flow cytometry in all reviewed studies.

### 3. DNA Damage
Comet assays demonstrate significant DNA strand breaks at sub-cytotoxic doses. The γ-H2AX foci formation confirms double-strand break induction.

### 4. Size-Dependent Effects
Smaller particles (< 20 nm) show disproportionately higher toxicity due to increased surface area-to-volume ratio and superior cellular internalization via endocytosis.

## Conclusion

AgNPs cytotoxicity is concentration- and size-dependent, mediated primarily through oxidative stress → mitochondrial pathway → apoptosis. Future work should investigate surface coating effects on toxicity profiles.

## References
1. Foldbjerg et al., 2011 — *Arch Toxicol*
2. AshaRani et al., 2009 — *ACS Nano*
3. Kim et al., 2012 — *Toxicol Lett*`,
  },
  {
    id: '2',
    title: 'mRNA Delivery via Lipid Nanoparticles — Comparative Efficacy',
    query: 'Compare the efficacy of different lipid nanoparticle formulations for mRNA delivery',
    date: '2024-01-13',
    wordCount: 980,
    agents: ['Paper Reader', 'Reasoner', 'Fact Checker', 'Citation', 'Reporter'],
    status: 'complete',
    content: `# mRNA Delivery via Lipid Nanoparticles — Comparative Efficacy

## Overview

Lipid nanoparticles (LNPs) have emerged as the leading non-viral vector for mRNA therapeutics following COVID-19 vaccine successes. This report compares key formulation parameters across the indexed literature.

## Formulation Comparison

| Parameter | MC3-LNP | DLin-MC3 | DOTAP-LNP |
|-----------|---------|----------|-----------|
| Encapsulation efficiency | 92% | 95% | 78% |
| Particle size | 80-120 nm | 70-100 nm | 150-200 nm |
| PDI | 0.12 | 0.09 | 0.22 |
| In vivo expression (24h) | High | Very High | Moderate |

## Key Insights

- Ionizable lipids outperform cationic lipids for *in vivo* delivery due to reduced toxicity and endosomal escape efficiency
- PEGylation extends circulation time but reduces cellular uptake — optimal PEG density: 1.5-2 mol%
- Organ tropism is tunable via lipid composition: liver targeting vs. lung targeting formulations

## Conclusion

DLin-MC3-DMA remains the gold standard ionizable lipid for hepatic mRNA delivery. Emerging alternatives (lipitoids, bioreducible lipids) show promise for extrahepatic targets.`,
  },
  {
    id: '3',
    title: 'CRISPR-Cas9 Off-Target Mutation Rates — Meta-Analysis',
    query: 'What off-target mutation rates are reported for CRISPR-Cas9 across different cell types?',
    date: '2024-01-10',
    wordCount: 1560,
    agents: ['Paper Reader', 'Reasoner', 'Fact Checker', 'Citation'],
    status: 'complete',
    content: `# CRISPR-Cas9 Off-Target Mutation Rates — Meta-Analysis

## Summary

This meta-analysis aggregates off-target frequency data from 12 studies spanning primary cells, cell lines, and organoids. Off-target rates vary by 4 orders of magnitude (0.001%–10%) depending on guide RNA design and Cas9 variant.

## Off-Target Rates by Cas9 Variant

- **SpCas9 WT**: 0.1–10% off-target frequency at predicted sites
- **eSpCas9**: ~10-100x reduction vs WT
- **HiFi Cas9**: < 0.01% at most sites
- **Base editors (ABE8e, CBE4max)**: Bystander edits remain a concern

## Guide RNA Design Impact

GUIDE-seq and CIRCLE-seq data consistently show that mismatches at PAM-distal positions are better tolerated than PAM-proximal mismatches. GC content > 70% correlates with elevated off-target activity.

## Recommendations

1. Use high-fidelity Cas9 variants for therapeutic applications
2. Validate using unbiased genome-wide detection (GUIDE-seq, CIRCLE-seq)
3. Avoid G-rich repeat regions in guide design`,
  },
];

export default function ReportsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = mockReports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.query.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#09090b]/80 border-b border-[#27272a] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reports</h1>
          <p className="text-xs text-[#71717a] mt-0.5">{mockReports.length} research reports generated</p>
        </div>
      </header>

      <div className="p-8 space-y-4 max-w-5xl mx-auto w-full">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reports…"
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="space-y-3">
          {filtered.map(report => (
            <div key={report.id} className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden hover:border-[#3f3f46] transition-colors">
              <button
                onClick={() => setExpanded(expanded === report.id ? null : report.id)}
                className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="px-2.5 py-0.5 bg-emerald-400/10 text-emerald-400 rounded-full text-[11px] font-medium">Complete</span>
                    <span className="text-[11px] text-[#52525b]">{report.date}</span>
                    <span className="text-[11px] text-[#52525b]">{report.wordCount.toLocaleString()} words</span>
                  </div>
                  <h3 className="font-semibold text-[#fafafa] text-sm leading-snug">{report.title}</h3>
                  <p className="text-xs text-[#71717a] mt-1 line-clamp-1 italic">"{report.query}"</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {report.agents.map(a => (
                      <span key={a} className="text-[10px] px-2 py-0.5 bg-[#09090b] border border-[#27272a] text-[#52525b] rounded">{a}</span>
                    ))}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-[#52525b] flex-shrink-0 mt-1 transition-transform ${expanded === report.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {expanded === report.id && (
                <div className="border-t border-[#27272a]">
                  <ReportViewer content={report.content} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
