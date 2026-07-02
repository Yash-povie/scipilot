'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(
  () => import('react-force-graph').then(m => ({ default: m.ForceGraph2D })),
  { ssr: false }
);

const allNodes = [
  { id: 'p1', label: 'AgNP Cytotoxicity',     type: 'paper',   color: '#4f46e5', size: 8 },
  { id: 'p2', label: 'LNP mRNA Delivery',     type: 'paper',   color: '#4f46e5', size: 8 },
  { id: 'p3', label: 'CRISPR Off-Targets',    type: 'paper',   color: '#4f46e5', size: 8 },
  { id: 'p4', label: 'ZnO Plant Toxicology',  type: 'paper',   color: '#4f46e5', size: 8 },
  { id: 'p5', label: 'EV Proteomics',         type: 'paper',   color: '#4f46e5', size: 8 },
  { id: 'e1', label: 'HeLa Cells',            type: 'entity',  color: '#06b6d4', size: 6 },
  { id: 'e2', label: 'Lipid Nanoparticles',   type: 'entity',  color: '#06b6d4', size: 6 },
  { id: 'e3', label: 'Cas9 Protein',          type: 'entity',  color: '#06b6d4', size: 6 },
  { id: 'e4', label: 'ZnO Nanoparticles',     type: 'entity',  color: '#06b6d4', size: 6 },
  { id: 'e5', label: 'Exosomes',              type: 'entity',  color: '#06b6d4', size: 6 },
  { id: 'e6', label: 'Silver Nanoparticles',  type: 'entity',  color: '#06b6d4', size: 6 },
  { id: 'c1', label: 'Cytotoxicity',          type: 'concept', color: '#6366f1', size: 5 },
  { id: 'c2', label: 'Oxidative Stress',      type: 'concept', color: '#6366f1', size: 5 },
  { id: 'c3', label: 'Drug Delivery',         type: 'concept', color: '#6366f1', size: 5 },
  { id: 'c4', label: 'Gene Editing',          type: 'concept', color: '#6366f1', size: 5 },
  { id: 'c5', label: 'Apoptosis',             type: 'concept', color: '#6366f1', size: 5 },
  { id: 'c6', label: 'Endocytosis',           type: 'concept', color: '#6366f1', size: 5 },
  { id: 'c7', label: 'DNA Damage',            type: 'concept', color: '#6366f1', size: 5 },
];

const allLinks = [
  { source: 'p1', target: 'e6' }, { source: 'p1', target: 'e1' }, { source: 'p1', target: 'c1' },
  { source: 'p1', target: 'c2' }, { source: 'p1', target: 'c5' }, { source: 'p1', target: 'c7' },
  { source: 'p2', target: 'e2' }, { source: 'p2', target: 'c3' }, { source: 'p2', target: 'c6' },
  { source: 'p3', target: 'e3' }, { source: 'p3', target: 'c4' }, { source: 'p3', target: 'c7' },
  { source: 'p4', target: 'e4' }, { source: 'p4', target: 'c1' }, { source: 'p4', target: 'c2' },
  { source: 'p5', target: 'e5' }, { source: 'p5', target: 'c1' },
  { source: 'e6', target: 'c2' }, { source: 'e6', target: 'c1' }, { source: 'e2', target: 'c3' },
  { source: 'e1', target: 'c5' }, { source: 'c2', target: 'c5' },
];

type Filter = 'all' | 'paper' | 'entity' | 'concept';

interface Props { activeFilter: Filter; }

export default function KnowledgeGraph({ activeFilter }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const filteredNodes = activeFilter === 'all'
    ? allNodes
    : allNodes.filter(n => n.type === activeFilter);

  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = allLinks.filter(l =>
    nodeIds.has(l.source as string) && nodeIds.has(l.target as string)
  );

  const graphData = { nodes: filteredNodes, links: filteredLinks };

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        graphData={graphData}
        width={dims.w}
        height={dims.h}
        backgroundColor="#09090b"
        nodeRelSize={6}
        nodeColor={(node: any) => node.color}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label as string;
          const fontSize = Math.max(10 / globalScale, 4);
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
          if (globalScale > 0.8) {
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = '#a1a1aa';
            ctx.textAlign = 'center';
            ctx.fillText(label, node.x, node.y + node.size + fontSize + 2);
          }
        }}
        linkColor={() => '#27272a'}
        linkWidth={1}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => '#6366f1'}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        cooldownTicks={100}
      />
    </div>
  );
}
