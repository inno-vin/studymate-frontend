import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Simple, user-friendly flow chart with draggable nodes and zoom/pan
const initialNodes = [
  { id: 'start', label: 'Start', type: 'circle', x: 80, y: 60 },
  { id: 'plan', label: 'Plan', type: 'rounded', x: 260, y: 60 },
  { id: 'process', label: 'Process', type: 'rect', x: 460, y: 160 },
  { id: 'decision', label: 'Decision?', type: 'diamond', x: 260, y: 260 },
  { id: 'end', label: 'End', type: 'circle', x: 80, y: 360 }
];

const initialEdges = [
  ['start', 'plan'],
  ['plan', 'process'],
  ['process', 'decision'],
  ['decision', 'end']
];

const NodeShape = ({ type, selected }) => {
  const base = 'stroke-academic-300 fill-white';
  const active = selected ? 'stroke-primary-500 ring-2 ring-primary-200' : '';
  switch (type) {
    case 'circle':
      return <circle cx="0" cy="0" r="36" className={`${base} ${active}`} strokeWidth="2" />;
    case 'rounded':
      return <rect x="-48" y="-28" rx="12" ry="12" width="96" height="56" className={`${base} ${active}`} strokeWidth="2" />;
    case 'diamond':
      return <polygon points="0,-36 48,0 0,36 -48,0" className={`${base} ${active}`} strokeWidth="2" />;
    default:
      return <rect x="-48" y="-28" width="96" height="56" className={`${base} ${active}`} strokeWidth="2" />;
  }
};

const FlowChart = () => {
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges] = useState(initialEdges);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.1;
      setZoom((z) => Math.min(2, Math.max(0.5, z + delta)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const startPan = (e) => {
    if (e.button !== 0) return; // left click
    isPanningRef.current = true;
    lastPanRef.current = { x: e.clientX, y: e.clientY };
  };

  const pan = (e) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPanRef.current.x;
    const dy = e.clientY - lastPanRef.current.y;
    lastPanRef.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };

  const endPan = () => {
    isPanningRef.current = false;
  };

  const onNodeDrag = (id, dx, dy) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x: n.x + dx / zoom, y: n.y + dy / zoom } : n)));
  };

  return (
    <div className="h-full w-full overflow-hidden bg-white">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab select-none"
        onMouseDown={startPan}
        onMouseMove={pan}
        onMouseUp={endPan}
        onMouseLeave={endPan}
      >
        <svg className="h-full w-full">
          <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map(([fromId, toId], idx) => {
              const from = nodes.find((n) => n.id === fromId);
              const to = nodes.find((n) => n.id === toId);
              if (!from || !to) return null;
              return (
                <g key={idx}>
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
                    </marker>
                  </defs>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`} onMouseDown={(e) => e.stopPropagation()}>
                <Draggable onDrag={(dx, dy) => onNodeDrag(node.id, dx, dy)} onSelect={() => setSelectedId(node.id)}>
                  <NodeShape type={node.type} selected={selectedId === node.id} />
                  <text x="0" y="5" textAnchor="middle" className="fill-academic-800 text-[12px] select-none">
                    {node.label}
                  </text>
                </Draggable>
              </g>
            ))}
          </g>
        </svg>

        {/* UI Controls */}
        <div className="absolute top-3 right-3 bg-white border border-academic-200 rounded-lg shadow-sm p-2 flex items-center space-x-2">
          <button className="btn-secondary text-sm" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>+
          </button>
          <button className="btn-secondary text-sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>-
          </button>
          <button className="btn-secondary text-sm" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const Draggable = ({ children, onDrag, onSelect }) => {
  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  const onDown = (e) => {
    draggingRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
    onSelect?.();
  };

  const onMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    onDrag?.(dx, dy);
  };

  const onUp = () => {
    draggingRef.current = false;
  };

  return (
    <g onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} style={{ cursor: 'grab' }}>
      {children}
    </g>
  );
};

export default FlowChart;


