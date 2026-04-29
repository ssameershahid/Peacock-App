import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/*
 * Coordinate system: viewBox "0 0 100 123"
 * Matches the ~530×650 aspect ratio of the Sri Lanka map PNG.
 * All x/y values are % of those dimensions, mapped visually to city locations.
 *
 * Key cities (x, y in viewBox units):
 *   Airport/Negombo : 25, 76
 *   Colombo         : 26, 82
 *   Kandy           : 41, 57
 *   Sigiriya        : 48, 47
 *   Trincomalee     : 68, 37
 *   Nuwara Eliya    : 47, 71
 *   Ella            : 53, 79
 *   Galle           : 30, 105
 *   Hambantota      : 53, 107
 */

const MAP_URL =
  'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f187790f4ca7415125670b_Sri%20Lanka%20Map.png';

/* ─── Route definitions ─────────────────────────────────────────────────── */
const ROUTES = [
  {
    id: 'hill-country',
    label: 'Ready-to-Go',
    // Airport → Kandy → Nuwara Eliya → Ella
    d: 'M 25,76 C 29,70 35,63 41,57 C 44,62 45.5,66 47,71 C 49,74.5 51,77 53,79',
    color: '#D4A574',
    glowColor: 'rgba(212,165,116,0.55)',
    drawDelay: 0.25,
    flowDelay: '2.6s',
    flowDuration: '2.4s',
    nodes: [
      { cx: 25, cy: 76, key: 'airport' },
      { cx: 41, cy: 57, key: 'kandy' },
      { cx: 47, cy: 71, key: 'nuwara' },
      { cx: 53, cy: 79, key: 'ella' },
    ],
  },
  {
    id: 'north-circuit',
    label: 'Trip Wizard',
    // Colombo → Sigiriya → Trincomalee
    d: 'M 26,82 C 33,72 40,60 48,47 C 55.5,43 62,39.5 68,37',
    color: '#C17070',
    glowColor: 'rgba(193,112,112,0.55)',
    drawDelay: 1.1,
    flowDelay: '3.5s',
    flowDuration: '2.8s',
    nodes: [
      { cx: 26, cy: 82, key: 'colombo' },
      { cx: 48, cy: 47, key: 'sigiriya' },
      { cx: 68, cy: 37, key: 'trinco' },
    ],
  },
  {
    id: 'south-coast',
    label: 'Transfers',
    // Airport → Colombo → Galle → Hambantota
    d: 'M 25,76 C 25.5,78.5 25.5,80.5 26,82 C 27,90 28.5,98 30,105 C 37,108.5 45,109 53,107',
    color: '#4AACA0',
    glowColor: 'rgba(74,172,160,0.55)',
    drawDelay: 1.95,
    flowDelay: '4.4s',
    flowDuration: '2.6s',
    nodes: [
      { cx: 26, cy: 82, key: 'colombo2' },
      { cx: 30, cy: 105, key: 'galle' },
      { cx: 53, cy: 107, key: 'hambantota' },
    ],
  },
] as const;

/* ─── CSS injected once ─────────────────────────────────────────────────── */
const CSS = `
  @media (prefers-reduced-motion: reduce) {
    .slm-flow, .slm-pulse { animation: none !important; }
    .slm-draw { opacity: 0.6 !important; }
  }

  @keyframes slm-flow-r1 {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -1; }
  }
  @keyframes slm-flow-r2 {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -1; }
  }
  @keyframes slm-flow-r3 {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -1; }
  }
  @keyframes slm-pulse {
    0%, 100% { transform: scale(1);   opacity: 0.9; }
    50%       { transform: scale(1.6); opacity: 0.4; }
  }
  @keyframes slm-dot-appear {
    from { opacity: 0; transform: scale(0); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function SriLankaMapVisual() {
  const styleInjected = useRef(false);
  const [nodesVisible, setNodesVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (styleInjected.current) return;
    const tag = document.createElement('style');
    tag.textContent = CSS;
    document.head.appendChild(tag);
    styleInjected.current = true;
  }, []);

  /* Reveal node dots after each route finishes drawing */
  useEffect(() => {
    ROUTES.forEach(r => {
      const completesAt = (r.drawDelay + 1.6) * 1000; // drawDelay + ~1.6s draw duration
      const timer = setTimeout(() => {
        setNodesVisible(prev => {
          const next = { ...prev };
          r.nodes.forEach(n => { next[n.key] = true; });
          return next;
        });
      }, completesAt);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: '100 / 123' }}
      aria-hidden="true"
    >
      {/* ── Base map image ─────────────────────────────────────────────── */}
      <img
        src={MAP_URL}
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
        style={{ opacity: 0.9 }}
        loading="eager"
        draggable={false}
      />

      {/* ── SVG overlay ────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 100 123"
        className="absolute inset-0 w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Drop-shadow filter for glow */}
          {ROUTES.map(r => (
            <filter key={r.id} id={`glow-${r.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {ROUTES.map((route, ri) => {
          const flowAnim = `slm-flow-r${ri + 1}`;
          return (
            <g key={route.id}>
              {/* ── 1. Static faint base trace (always visible) ─────── */}
              <path
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth="0.6"
                strokeOpacity="0.2"
                strokeLinecap="round"
              />

              {/* ── 2. Draw-on path (framer-motion, runs once) ──────── */}
              <motion.path
                className="slm-draw"
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeOpacity="0.7"
                filter={`url(#glow-${route.id})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{
                  pathLength: { duration: 1.6, delay: route.drawDelay, ease: [0.4, 0, 0.2, 1] },
                  opacity:    { duration: 0.4, delay: route.drawDelay },
                }}
              />

              {/* ── 3. Glow halo for traveling segment ──────────────── */}
              <path
                d={route.d}
                fill="none"
                stroke={route.glowColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength={1}
                style={{
                  strokeDasharray: '0.22 0.78',
                  strokeDashoffset: 0,
                  animation: `${flowAnim} ${route.flowDuration} linear ${route.flowDelay} infinite`,
                  filter: `blur(1.2px)`,
                }}
              />

              {/* ── 4. Crisp traveling segment ───────────────────────── */}
              <path
                className="slm-flow"
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth="1.8"
                strokeLinecap="round"
                pathLength={1}
                style={{
                  strokeDasharray: '0.18 0.82',
                  strokeDashoffset: 0,
                  animation: `${flowAnim} ${route.flowDuration} linear ${route.flowDelay} infinite`,
                  filter: `url(#glow-${route.id})`,
                }}
              />

              {/* ── 5. Node dots ─────────────────────────────────────── */}
              {route.nodes.map(node => (
                <g
                  key={node.key}
                  style={{
                    transformOrigin: `${node.cx}px ${node.cy}px`,
                    opacity: nodesVisible[node.key] ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                  }}
                >
                  {/* Pulse ring */}
                  <circle
                    className="slm-pulse"
                    cx={node.cx}
                    cy={node.cy}
                    r="2.2"
                    fill="none"
                    stroke={route.color}
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                    style={{
                      transformOrigin: `${node.cx}px ${node.cy}px`,
                      animation: `slm-pulse 2s ease-in-out ${ri * 0.3}s infinite`,
                    }}
                  />
                  {/* Core dot */}
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="1.1"
                    fill={route.color}
                    fillOpacity="0.95"
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      {/* ── Route legend ───────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-0 left-0 flex flex-col gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 3.5 }}
      >
        {ROUTES.map(r => (
          <div
            key={r.id}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: 'rgba(12,36,33,0.75)',
              backdropFilter: 'blur(6px)',
              border: `1px solid ${r.color}28`,
            }}
          >
            <span
              className="block rounded-full"
              style={{
                width: 20, height: 1.5,
                backgroundColor: r.color,
                boxShadow: `0 0 4px ${r.color}`,
              }}
            />
            <span
              className="text-[9px] font-bold uppercase tracking-[0.14em]"
              style={{ color: r.color }}
            >
              {r.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
