import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/*
 * viewBox "0 0 100 123" — matches ~530×650 PNG aspect ratio.
 *
 * City coordinates (x, y):
 *   Jaffna        : 43,  10
 *   Mannar        : 22,  30
 *   Trincomalee   : 68,  37
 *   Sigiriya      : 48,  47
 *   Batticaloa    : 74,  52
 *   Kandy         : 41,  57
 *   Colombo       : 26,  82
 *   Ella          : 53,  79
 *   Arugam Bay    : 75,  65
 *   Galle         : 30, 105
 *   Hambantota    : 53, 107
 */

const MAP_URL =
  'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f187790f4ca7415125670b_Sri%20Lanka%20Map.png';

const WHITE = 'rgba(255,255,255,0.88)';
const WHITE_GLOW = 'rgba(255,255,255,0.32)';

const ROUTES = [
  {
    id: 'r1',
    // Jaffna → Sigiriya → Colombo  (top → centre → southwest)
    d: 'M 43,10 C 44,24 46,36 48,47 C 41,62 33,72 26,82',
    color: WHITE,
    glowColor: WHITE_GLOW,
    drawDelay: 0.2,
    flowDelay: '2.4s',
    flowDuration: '2.6s',
    reverse: false,
    nodes: [
      { cx: 43, cy: 10,  key: 'jaffna' },
      { cx: 48, cy: 47,  key: 'sigiriya' },
      { cx: 26, cy: 82,  key: 'colombo' },
    ],
  },
  {
    id: 'r2',
    // Hambantota → Ella → Kandy → Mannar  (bottom → top, reversed)
    d: 'M 22,30 C 28,40 35,49 41,57 C 46,65 50,72 53,79 C 53,91 53,99 53,107',
    color: WHITE,
    glowColor: WHITE_GLOW,
    drawDelay: 1.05,
    flowDelay: '3.3s',
    flowDuration: '2.9s',
    reverse: true,
    nodes: [
      { cx: 22, cy: 30,  key: 'mannar' },
      { cx: 41, cy: 57,  key: 'kandy' },
      { cx: 53, cy: 79,  key: 'ella' },
      { cx: 53, cy: 107, key: 'hambantota' },
    ],
  },
  {
    id: 'r3',
    // Trincomalee → Batticaloa → Arugam Bay → Galle  (east coast → south)
    d: 'M 68,37 C 70,44 72,48 74,52 C 74,58 74,62 75,65 C 59,85 44,96 30,105',
    color: WHITE,
    glowColor: WHITE_GLOW,
    drawDelay: 1.9,
    flowDelay: '4.2s',
    flowDuration: '2.7s',
    reverse: false,
    nodes: [
      { cx: 68, cy: 37,  key: 'trinco' },
      { cx: 74, cy: 52,  key: 'batticaloa' },
      { cx: 30, cy: 105, key: 'galle' },
    ],
  },
] as const;

const CSS = `
  @media (prefers-reduced-motion: reduce) {
    .slm-flow, .slm-pulse { animation: none !important; }
    .slm-draw { opacity: 0.55 !important; }
  }
  @keyframes slm-flow-fwd { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
  @keyframes slm-flow-rev { from { stroke-dashoffset: 0; } to { stroke-dashoffset:  1; } }
  @keyframes slm-pulse {
    0%, 100% { r: 1.8; opacity: 0.8; }
    50%       { r: 3.2; opacity: 0.2; }
  }
`;

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

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    ROUTES.forEach(r => {
      const t = setTimeout(() => {
        setNodesVisible(prev => {
          const next = { ...prev };
          r.nodes.forEach(n => { next[n.key] = true; });
          return next;
        });
      }, (r.drawDelay + 1.7) * 1000);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: '100 / 123', marginTop: '-6%' }}
      aria-hidden="true"
    >
      {/* Base map image — anchored top so full island shows */}
      <img
        src={MAP_URL}
        alt=""
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'contain', objectPosition: 'top center', opacity: 0.88, transform: 'scale(1.1)', transformOrigin: 'top center' }}
        loading="eager"
        draggable={false}
      />

      {/* SVG overlay */}
      <svg
        viewBox="0 0 100 123"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible', transform: 'translateY(9%)' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Wide outer glow — just blur, no source merge */}
          <filter id="glow-wide" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
          {/* Mid glow — blur + source */}
          <filter id="glow-mid" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Crisp core glow */}
          <filter id="glow-crisp" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {ROUTES.map((route, ri) => {
          const flowAnim = route.reverse ? 'slm-flow-rev' : 'slm-flow-fwd';
          const drawTransition = {
            pathLength:    { duration: 1.7, delay: route.drawDelay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
            strokeOpacity: { duration: 0.35, delay: route.drawDelay },
          };

          return (
            <g key={route.id}>
              {/* Beam: outermost soft glow */}
              <motion.path
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth="1.9"
                strokeLinecap="round"
                filter="url(#glow-wide)"
                initial={{ pathLength: 0, strokeOpacity: 0 }}
                animate={{ pathLength: 1, strokeOpacity: 0.033 }}
                transition={drawTransition}
              />

              {/* Beam: mid glow */}
              <motion.path
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth="0.84"
                strokeLinecap="round"
                filter="url(#glow-mid)"
                initial={{ pathLength: 0, strokeOpacity: 0 }}
                animate={{ pathLength: 1, strokeOpacity: 0.08 }}
                transition={drawTransition}
              />

              {/* Beam: crisp core draw-on */}
              <motion.path
                className="slm-draw"
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth="0.4"
                strokeLinecap="round"
                filter="url(#glow-crisp)"
                initial={{ pathLength: 0, strokeOpacity: 0 }}
                animate={{ pathLength: 1, strokeOpacity: 0.43 }}
                transition={drawTransition}
              />

              {/* Flow: wide glow halo traveling the beam */}
              <path
                d={route.d}
                fill="none"
                stroke={route.glowColor}
                strokeWidth="1.44"
                strokeLinecap="round"
                pathLength={1}
                style={{
                  strokeDasharray: '0.18 0.82',
                  strokeDashoffset: 0,
                  animation: `${flowAnim} ${route.flowDuration} linear ${route.flowDelay} infinite`,
                  filter: 'blur(2px)',
                }}
              />

              {/* Flow: crisp bright dot */}
              <path
                className="slm-flow"
                d={route.d}
                fill="none"
                stroke={route.color}
                strokeWidth="0.5"
                strokeLinecap="round"
                pathLength={1}
                style={{
                  strokeDasharray: '0.13 0.87',
                  strokeDashoffset: 0,
                  animation: `${flowAnim} ${route.flowDuration} linear ${route.flowDelay} infinite`,
                  filter: 'url(#glow-crisp)',
                }}
              />

              {/* Node dots */}
              {route.nodes.map(node => (
                <g
                  key={node.key}
                  style={{
                    opacity: nodesVisible[node.key] ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                  }}
                >
                  <circle
                    className="slm-pulse"
                    cx={node.cx}
                    cy={node.cy}
                    r="1.8"
                    fill="none"
                    stroke={route.color}
                    strokeWidth="0.45"
                    strokeOpacity="0.5"
                    style={{
                      transformOrigin: `${node.cx}px ${node.cy}px`,
                      animation: `slm-pulse 2.2s ease-in-out ${ri * 0.35}s infinite`,
                    }}
                  />
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="1.0"
                    fill={route.color}
                    fillOpacity="0.95"
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
