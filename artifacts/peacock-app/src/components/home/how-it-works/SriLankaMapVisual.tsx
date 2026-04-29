import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* ─── Sri Lanka approximate outline (longitude/latitude pairs normalised to canvas) ── */
// Bounding box: lon 79.65–81.88, lat 5.92–9.83
// Canvas coords: x = (lon - 79.65) / 2.23 * W,  y = (9.83 - lat) / 3.91 * H

function latlonToCanvas(lat: number, lon: number, W: number, H: number): [number, number] {
  const x = ((lon - 79.52) / 2.56) * W;
  const y = ((9.95 - lat) / 4.2) * H;
  return [x, y];
}

// Key locations
const LOCATIONS = {
  colombo:    { lat: 6.927,  lon: 79.862, label: 'Colombo',    abbr: 'CMB' },
  airport:    { lat: 7.181,  lon: 79.885, label: 'Airport',    abbr: 'BIA' },
  kandy:      { lat: 7.291,  lon: 80.636, label: 'Kandy',      abbr: 'KDY' },
  sigiriya:   { lat: 7.957,  lon: 80.760, label: 'Sigiriya',   abbr: 'SGR' },
  ella:       { lat: 6.867,  lon: 81.046, label: 'Ella',       abbr: 'ELA' },
  galle:      { lat: 6.053,  lon: 80.220, label: 'Galle',      abbr: 'GAL' },
  trinco:     { lat: 8.577,  lon: 81.233, label: 'Trinco',     abbr: 'TRN' },
  nuwara:     { lat: 6.970,  lon: 80.783, label: 'Nuwara Eliya', abbr: 'NWE' },
};

// Routes per modality
const ROUTES = [
  {
    id: 'ready',
    color: '#4ADE80',  // green
    glow: 'rgba(74,222,128,0.5)',
    stops: ['colombo', 'kandy', 'nuwara', 'ella'] as const,
    label: 'Ready-to-Go',
    delay: 0,
  },
  {
    id: 'wizard',
    color: '#FCD34D',  // amber
    glow: 'rgba(252,211,77,0.5)',
    stops: ['colombo', 'sigiriya', 'trinco'] as const,
    label: 'Trip Wizard',
    delay: 0.8,
  },
  {
    id: 'transfer',
    color: '#67E8F9',  // cyan
    glow: 'rgba(103,232,249,0.5)',
    stops: ['airport', 'colombo', 'galle'] as const,
    label: 'Transfers',
    delay: 1.6,
  },
];

// Sri Lanka outline path (simplified polygon, lon/lat)
const SL_OUTLINE: [number, number][] = [
  [9.83, 80.25], [9.72, 80.02], [9.48, 80.10], [9.22, 80.27],
  [9.05, 80.44], [8.89, 80.73], [8.75, 81.08], [8.58, 81.22],
  [8.42, 81.38], [8.32, 81.43], [8.10, 81.47], [7.92, 81.52],
  [7.72, 81.57], [7.45, 81.62], [7.20, 81.73], [6.97, 81.68],
  [6.78, 81.60], [6.58, 81.50], [6.40, 81.40], [6.22, 81.23],
  [6.07, 80.95], [5.98, 80.65], [5.95, 80.40], [5.92, 80.10],
  [6.00, 79.95], [6.18, 79.77], [6.40, 79.70], [6.62, 79.68],
  [6.88, 79.72], [7.10, 79.78], [7.35, 79.85], [7.57, 79.88],
  [7.82, 79.92], [8.05, 79.98], [8.28, 80.05], [8.52, 80.08],
  [8.74, 80.12], [9.00, 80.10], [9.20, 80.17], [9.83, 80.25],
];

function drawGlowLine(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: string,
  glowColor: string,
  progress: number,
  lineWidth = 2.5,
) {
  if (points.length < 2 || progress <= 0) return;

  const totalSegments = points.length - 1;
  const drawn = progress * totalSegments;
  const fullSegments = Math.floor(drawn);
  const partial = drawn - fullSegments;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Glow pass
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth + 2;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 0; i < fullSegments; i++) {
    ctx.lineTo(points[i + 1][0], points[i + 1][1]);
  }
  if (partial > 0 && fullSegments < totalSegments) {
    const x = points[fullSegments][0] + (points[fullSegments + 1][0] - points[fullSegments][0]) * partial;
    const y = points[fullSegments][1] + (points[fullSegments + 1][1] - points[fullSegments][1]) * partial;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Core line
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 0; i < fullSegments; i++) {
    ctx.lineTo(points[i + 1][0], points[i + 1][1]);
  }
  if (partial > 0 && fullSegments < totalSegments) {
    const x = points[fullSegments][0] + (points[fullSegments + 1][0] - points[fullSegments][0]) * partial;
    const y = points[fullSegments][1] + (points[fullSegments + 1][1] - points[fullSegments][1]) * partial;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.restore();
}

function drawPulsingDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  glowColor: string,
  t: number,
  visible: boolean,
) {
  if (!visible) return;
  const pulse = Math.sin(t * 2) * 0.5 + 0.5;

  ctx.save();
  // Outer ring pulse
  ctx.beginPath();
  ctx.arc(x, y, 8 + pulse * 5, 0, Math.PI * 2);
  ctx.fillStyle = glowColor.replace('0.5', `${0.15 * pulse}`);
  ctx.fill();

  // Middle ring
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = glowColor.replace('0.5', '0.3');
  ctx.fill();

  // Core dot
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

export default function SriLankaMapVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Pre-compute all canvas coords
    const locCoords: Record<string, [number, number]> = {};
    for (const [key, val] of Object.entries(LOCATIONS)) {
      locCoords[key] = latlonToCanvas(val.lat, val.lon, W, H);
    }

    const outlinePoints = SL_OUTLINE.map(([lat, lon]) => latlonToCanvas(lat, lon, W, H));

    const routePoints = ROUTES.map(r => r.stops.map(s => locCoords[s]));

    const TOTAL_DURATION = 5000; // ms for all routes to fully draw
    const ROUTE_DURATION = 2200; // ms per route draw
    const ROUTE_STAGGER = 900;   // ms between route starts

    function draw(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = elapsed / 1000;

      ctx!.clearRect(0, 0, W, H);

      // ── Background ──────────────────────────────────────────
      const bg = ctx!.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.75);
      bg.addColorStop(0, '#0e2e2a');
      bg.addColorStop(1, '#061a17');
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, W, H);

      // Subtle dot grid
      ctx!.save();
      ctx!.globalAlpha = 0.07;
      for (let gx = 0; gx < W; gx += 22) {
        for (let gy = 0; gy < H; gy += 22) {
          ctx!.beginPath();
          ctx!.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx!.fillStyle = '#ffffff';
          ctx!.fill();
        }
      }
      ctx!.restore();

      // ── Sri Lanka outline ────────────────────────────────────
      if (outlinePoints.length > 2) {
        // Shadow fill
        ctx!.save();
        ctx!.beginPath();
        ctx!.moveTo(outlinePoints[0][0], outlinePoints[0][1]);
        for (let i = 1; i < outlinePoints.length; i++) {
          ctx!.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
        }
        ctx!.closePath();
        const fillGrad = ctx!.createRadialGradient(W * 0.52, H * 0.5, 0, W * 0.52, H * 0.5, W * 0.45);
        fillGrad.addColorStop(0, 'rgba(74,222,128,0.07)');
        fillGrad.addColorStop(1, 'rgba(74,222,128,0.02)');
        ctx!.fillStyle = fillGrad;
        ctx!.fill();

        // Outline stroke
        ctx!.shadowColor = 'rgba(74,222,128,0.25)';
        ctx!.shadowBlur = 12;
        ctx!.strokeStyle = 'rgba(74,222,128,0.35)';
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.restore();
      }

      // ── Routes ───────────────────────────────────────────────
      ROUTES.forEach((route, ri) => {
        const routeStart = ri * ROUTE_STAGGER;
        const routeElapsed = elapsed - routeStart;
        const progress = Math.min(1, Math.max(0, routeElapsed / ROUTE_DURATION));
        drawGlowLine(ctx!, routePoints[ri], route.color, route.glow, progress);
      });

      // ── Location dots ────────────────────────────────────────
      // Determine which dots are "visible" based on route progress
      const visibleLocs = new Set<string>();
      ROUTES.forEach((route, ri) => {
        const routeStart = ri * ROUTE_STAGGER;
        const routeElapsed = elapsed - routeStart;
        const progress = Math.min(1, Math.max(0, routeElapsed / ROUTE_DURATION));
        const totalSegments = route.stops.length - 1;
        const drawn = progress * totalSegments;
        const fullSegments = Math.floor(drawn);
        for (let i = 0; i <= fullSegments && i < route.stops.length; i++) {
          visibleLocs.add(route.stops[i]);
        }
      });

      // Draw dots for all active routes
      ROUTES.forEach((route, ri) => {
        route.stops.forEach(stop => {
          const [x, y] = locCoords[stop];
          if (visibleLocs.has(stop)) {
            drawPulsingDot(ctx!, x, y, route.color, route.glow, t, true);
          }
        });
      });

      // ── Location labels ──────────────────────────────────────
      ctx!.save();
      ctx!.font = 'bold 9px "Inter", system-ui, sans-serif';
      ctx!.letterSpacing = '0.05em';
      visibleLocs.forEach(key => {
        const loc = LOCATIONS[key as keyof typeof LOCATIONS];
        if (!loc) return;
        const [x, y] = locCoords[key];
        // Find which route this belongs to for color
        let color = '#ffffff';
        for (const r of ROUTES) {
          if ((r.stops as readonly string[]).includes(key)) { color = r.color; break; }
        }
        ctx!.fillStyle = color;
        ctx!.globalAlpha = 0.9;
        ctx!.fillText(loc.abbr, x + 7, y - 7);
      });
      ctx!.restore();

      // ── Moving dot at head of each route ────────────────────
      ROUTES.forEach((route, ri) => {
        const routeStart = ri * ROUTE_STAGGER;
        const routeElapsed = elapsed - routeStart;
        const progress = Math.min(1, Math.max(0, routeElapsed / ROUTE_DURATION));
        if (progress <= 0 || progress >= 1) return;

        const pts = routePoints[ri];
        const totalSegments = pts.length - 1;
        const drawn = progress * totalSegments;
        const seg = Math.min(Math.floor(drawn), totalSegments - 1);
        const frac = drawn - seg;
        const hx = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * frac;
        const hy = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * frac;

        ctx!.save();
        ctx!.shadowColor = route.glow;
        ctx!.shadowBlur = 20;
        ctx!.beginPath();
        ctx!.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx!.fillStyle = '#ffffff';
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(hx, hy, 3, 0, Math.PI * 2);
        ctx!.fillStyle = route.color;
        ctx!.fill();
        ctx!.restore();
      });

      // ── Vignette ─────────────────────────────────────────────
      const vignette = ctx!.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
      vignette.addColorStop(0, 'rgba(6,26,23,0)');
      vignette.addColorStop(1, 'rgba(6,26,23,0.72)');
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-full rounded-3xl overflow-hidden"
      style={{ minHeight: 420 }}
    >
      <canvas
        ref={canvasRef}
        width={520}
        height={520}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Route legend overlay */}
      <div className="absolute bottom-5 left-5 flex flex-col gap-2">
        {ROUTES.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 + i * 0.15 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(6,26,23,0.75)', backdropFilter: 'blur(8px)', border: `1px solid ${r.color}30` }}
          >
            <span className="w-5 h-px rounded-full" style={{ backgroundColor: r.color, boxShadow: `0 0 6px ${r.color}` }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: r.color }}>
              {r.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Top-right badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] text-white/40"
        style={{ backgroundColor: 'rgba(6,26,23,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        Sri Lanka
      </motion.div>
    </motion.div>
  );
}
