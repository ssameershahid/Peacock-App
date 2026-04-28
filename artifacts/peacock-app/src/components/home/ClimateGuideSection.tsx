import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CityData { temp: number; rain: number; }
interface Festival { emoji: string; name: string; }
interface MonthData {
  label: string; short: string;
  recommendation: "best" | "good" | "possible";
  message: string;
  summary: string;
  crowd: 1 | 2 | 3 | 4 | 5;
  festivals: Festival[];
  tripLength: { duration: string; note: string };
  cities: CityData[];
}
interface ActivityRow { icon: string; name: string; locations: string; months: Record<number, "peak" | "good">; }
interface LiveCity { name: string; temp: number; code: number; }
interface Run { start: number; end: number; quality: "peak" | "good"; }

// ─── Static Data ───────────────────────────────────────────────────────────────

const CITIES = [
  "Colombo", "Anuradhapura", "Dambulla", "Sigiriya",
  "Kandy", "Nuwara Eliya", "Galle", "Bentota",
];

const MONTH_ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const MONTHS: MonthData[] = [
  { label: "JAN", short: "JAN", recommendation: "best", message: "The best time to travel", crowd: 5,
    summary: "The south and west coasts are at their finest — clear skies, flat seas, and warm beaches from Galle to Negombo.",
    festivals: [{ emoji: "🪔", name: "Thai Pongal (Jan 14)" }, { emoji: "🐘", name: "Duruthu Perahera" }],
    tripLength: { duration: "10–14 days", note: "West coast, south coast & hill country all at their best" },
    cities: [{temp:30,rain:74},{temp:29,rain:99},{temp:29,rain:136},{temp:28,rain:163},{temp:27,rain:176},{temp:19,rain:127},{temp:29,rain:105},{temp:30,rain:101}] },
  { label: "FEB", short: "FEB", recommendation: "best", message: "The best time to travel", crowd: 4,
    summary: "Peak conditions continue across the south; ideal for whale watching off Mirissa before crowds ease into March.",
    festivals: [{ emoji: "🐘", name: "Navam Perahera" }, { emoji: "🇱🇰", name: "Independence Day (Feb 4)" }],
    tripLength: { duration: "10–14 days", note: "Full circuit possible: beaches, wildlife, culture & tea country" },
    cities: [{temp:31,rain:74},{temp:31,rain:50},{temp:31,rain:80},{temp:30,rain:86},{temp:28,rain:119},{temp:19,rain:87},{temp:30,rain:94},{temp:31,rain:98}] },
  { label: "MAR", short: "MAR", recommendation: "best", message: "The best time to travel", crowd: 3,
    summary: "The last of the prime south coast weather before the rains; Kandy and Sigiriya are excellent and noticeably less busy.",
    festivals: [{ emoji: "🕉️", name: "Maha Sivarathri" }],
    tripLength: { duration: "7–10 days", note: "South coast + Cultural Triangle before the rains arrive" },
    cities: [{temp:32,rain:136},{temp:33,rain:78},{temp:33,rain:96},{temp:32,rain:95},{temp:30,rain:130},{temp:23,rain:82},{temp:31,rain:143},{temp:31,rain:159}] },
  { label: "APR", short: "APR", recommendation: "best", message: "The best time to travel", crowd: 3,
    summary: "Sinhala and Tamil New Year brings local festivities; showers begin on the west coast but the Cultural Triangle stays dry.",
    festivals: [{ emoji: "🎊", name: "Sinhala & Tamil New Year (Apr 13–14)" }],
    tripLength: { duration: "7–10 days", note: "New Year festivities add colour — stay for at least a week" },
    cities: [{temp:32,rain:247},{temp:33,rain:171},{temp:33,rain:175},{temp:32,rain:153},{temp:30,rain:211},{temp:24,rain:180},{temp:31,rain:239},{temp:32,rain:316}] },
  { label: "MAY", short: "MAY", recommendation: "good", message: "A good time to travel, but there may be some factors to be aware of", crowd: 1,
    summary: "The southwest monsoon arrives on the west coast — great for the Cultural Triangle and a good time to find deals.",
    festivals: [{ emoji: "🪔", name: "Vesak Full Moon Poya" }],
    tripLength: { duration: "7–10 days", note: "Focus on the Cultural Triangle; east coast begins to open" },
    cities: [{temp:31,rain:361},{temp:33,rain:92},{temp:32,rain:91},{temp:32,rain:84},{temp:29,rain:228},{temp:21,rain:180},{temp:30,rain:307},{temp:30,rain:440}] },
  { label: "JUN", short: "JUN", recommendation: "good", message: "A good time to travel, but there may be some factors to be aware of", crowd: 1,
    summary: "West coast beaches are quiet and wet; the east coast opens up with calm seas for Trincomalee and Arugam Bay.",
    festivals: [{ emoji: "🏛️", name: "Poson Poya — Mihintale Pilgrimage" }],
    tripLength: { duration: "7–10 days", note: "East coast beaches + Poson Poya pilgrimage" },
    cities: [{temp:30,rain:208},{temp:32,rain:12},{temp:31,rain:17},{temp:31,rain:11},{temp:28,rain:173},{temp:19,rain:168},{temp:29,rain:192},{temp:30,rain:260}] },
  { label: "JUL", short: "JUL", recommendation: "possible", message: "A great time to visit for a different side of Sri Lanka", crowd: 2,
    summary: "East coast peak — Arugam Bay surf season hits its stride; west coast is off-season and uncrowded with lower prices.",
    festivals: [{ emoji: "🎺", name: "Vel Festival (Colombo)" }],
    tripLength: { duration: "7–10 days", note: "East coast peak; west coast less appealing but very affordable" },
    cities: [{temp:30,rain:135},{temp:32,rain:32},{temp:31,rain:42},{temp:31,rain:47},{temp:27,rain:172},{temp:18,rain:175},{temp:29,rain:167},{temp:29,rain:204}] },
  { label: "AUG", short: "AUG", recommendation: "possible", message: "A great time to visit for a different side of Sri Lanka", crowd: 2,
    summary: "Best month for east coast beaches and wildlife at Yala; expect significantly lower prices and fewer tourists island-wide.",
    festivals: [{ emoji: "🐘", name: "Kandy Esala Perahera (10 nights)" }],
    tripLength: { duration: "10–14 days", note: "Allow extra days for the Kandy Perahera — it's unmissable" },
    cities: [{temp:30,rain:103},{temp:33,rain:41},{temp:31,rain:37},{temp:32,rain:42},{temp:28,rain:163},{temp:18,rain:154},{temp:28,rain:177},{temp:29,rain:190}] },
  { label: "SEP", short: "SEP", recommendation: "possible", message: "A great time to visit for a different side of Sri Lanka", crowd: 1,
    summary: "A quiet transition month with occasional showers across the island — good for deals, cultural sites, and fewer crowds.",
    festivals: [],
    tripLength: { duration: "7–10 days", note: "Good value island-wide; fewer tourists and lower prices" },
    cities: [{temp:30,rain:184},{temp:33,rain:71},{temp:32,rain:86},{temp:32,rain:95},{temp:28,rain:176},{temp:21,rain:169},{temp:29,rain:222},{temp:29,rain:310}] },
  { label: "OCT", short: "OCT", recommendation: "possible", message: "A great time to visit for a different side of Sri Lanka", crowd: 1,
    summary: "The northeast monsoon begins — the wettest and least-visited month, but prices hit their annual low across the island.",
    festivals: [{ emoji: "✨", name: "Deepavali preparations begin" }],
    tripLength: { duration: "5–7 days", note: "Keep it short; heavy rains limit access to many regions" },
    cities: [{temp:30,rain:360},{temp:31,rain:239},{temp:31,rain:264},{temp:30,rain:253},{temp:28,rain:323},{temp:19,rain:245},{temp:29,rain:354},{temp:29,rain:431}] },
  { label: "NOV", short: "NOV", recommendation: "possible", message: "A great time to visit for a different side of Sri Lanka", crowd: 2,
    summary: "Rain eases toward month's end as the season begins to turn — a great time to arrive ahead of the December rush.",
    festivals: [{ emoji: "✨", name: "Deepavali / Diwali" }],
    tripLength: { duration: "7–10 days", note: "Rains ease late in the month; good timing to arrive early" },
    cities: [{temp:30,rain:318},{temp:30,rain:247},{temp:30,rain:265},{temp:29,rain:271},{temp:27,rain:340},{temp:20,rain:236},{temp:29,rain:316},{temp:30,rain:359}] },
  { label: "DEC", short: "DEC", recommendation: "good", message: "A good time to travel, but there may be some factors to be aware of", crowd: 5,
    summary: "High season returns with Christmas and New Year bringing peak prices and packed beaches — but the weather is superb.",
    festivals: [{ emoji: "🎄", name: "Christmas" }, { emoji: "🎆", name: "New Year's Eve" }],
    tripLength: { duration: "10–14 days", note: "Book early — Christmas and New Year demand is extremely high" },
    cities: [{temp:30,rain:160},{temp:29,rain:225},{temp:29,rain:279},{temp:28,rain:328},{temp:27,rain:262},{temp:19,rain:228},{temp:29,rain:192},{temp:30,rain:218}] },
];

const ACTIVITIES: ActivityRow[] = [
  {
    icon: "🏖", name: "Beaches — South & West", locations: "Mirissa · Galle · Bentota",
    months: { 11:"peak", 0:"peak", 1:"peak", 2:"peak", 3:"peak", 4:"good", 9:"good", 10:"good" },
  },
  {
    icon: "🏖", name: "Beaches — East Coast", locations: "Trincomalee · Arugam Bay",
    months: { 3:"good", 4:"peak", 5:"peak", 6:"peak", 7:"peak", 8:"good" },
  },
  {
    icon: "🏄", name: "Surfing", locations: "Arugam Bay · Hikkaduwa",
    months: { 10:"good", 11:"good", 0:"good", 1:"good", 2:"good", 3:"good", 4:"peak", 5:"peak", 6:"peak", 7:"peak", 8:"good" },
  },
  {
    icon: "🐋", name: "Whale Watching", locations: "Mirissa · Trincomalee",
    months: { 11:"peak", 0:"peak", 1:"peak", 2:"peak", 3:"good", 4:"peak", 5:"peak", 6:"peak" },
  },
  {
    icon: "🐘", name: "Wildlife Safari", locations: "Yala · Udawalawe",
    months: { 0:"good", 1:"good", 5:"good", 6:"peak", 7:"peak", 8:"good", 11:"good" },
  },
  {
    icon: "🌿", name: "Hill Country & Tea", locations: "Ella · Kandy · Nuwara Eliya",
    months: { 11:"peak", 0:"peak", 1:"peak", 2:"peak", 3:"good", 7:"good", 8:"good" },
  },
  {
    icon: "🏛", name: "Cultural Triangle", locations: "Sigiriya · Dambulla",
    months: { 11:"peak", 0:"peak", 1:"peak", 2:"peak", 3:"good", 5:"good", 6:"good", 7:"good", 8:"good" },
  },
];

const LIVE_CITIES = [
  { name: "Colombo",      lat: 6.93, lon: 79.86 },
  { name: "Kandy",        lat: 7.29, lon: 80.63 },
  { name: "Ella",         lat: 6.87, lon: 81.05 },
  { name: "Galle",        lat: 6.03, lon: 80.22 },
  { name: "Trincomalee",  lat: 8.57, lon: 81.23 },
];

const MAX_TEMP = 40;
const MAX_RAIN = 500;

const CROWD_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Very Low",  color: "#4A8C6F", bg: "rgba(74,140,111,0.12)" },
  2: { label: "Low",       color: "#5A9E7A", bg: "rgba(90,158,122,0.12)" },
  3: { label: "Moderate",  color: "#B8903A", bg: "rgba(184,144,58,0.12)" },
  4: { label: "Busy",      color: "#C4733A", bg: "rgba(196,115,58,0.12)" },
  5: { label: "Peak",      color: "#B84A2E", bg: "rgba(184,74,46,0.12)" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

function toF(c: number): number { return Math.round(c * 9 / 5 + 32); }

function getActivityRuns(months: Record<number, "peak" | "good">): Run[] {
  const runs: Run[] = [];
  let i = 0;
  while (i < 12) {
    const q = months[i];
    if (q) {
      let j = i + 1;
      while (j < 12 && months[j] === q) j++;
      runs.push({ start: i, end: j - 1, quality: q });
      i = j;
    } else {
      i++;
    }
  }
  return runs;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// ─── Month calendar (same Gantt structure as ActivityCalendar) ─────────────────

const MONTH_QUAL_COLOR: Record<"best" | "good" | "possible", string> = {
  best: "#1B5E4A",
  good: "#6FA394",
  possible: "#B8AFA6",
};

const MonthCalendar: React.FC<{
  currentMonth: number;
  activeMonth: number;
  setActiveMonth: (i: number) => void;
  display: (c: number) => number;
  unitLabel: string;
  unit: "C" | "F";
  setUnit: (u: "C" | "F") => void;
}> = ({ currentMonth, activeMonth, setActiveMonth, display, unitLabel, unit, setUnit }) => {
  const month = MONTHS[activeMonth];

  // Contiguous recommendation runs → pill bars
  const recRuns: Array<{ start: number; end: number; quality: "best" | "good" | "possible" }> = [];
  (() => {
    let i = 0;
    while (i < 12) {
      const q = MONTHS[i].recommendation;
      let j = i + 1;
      while (j < 12 && MONTHS[j].recommendation === q) j++;
      recRuns.push({ start: i, end: j - 1, quality: q });
      i = j;
    }
  })();

  const colHighlight = (i: number) => (
    <>
      {i === currentMonth && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(196,135,58,0.06)", pointerEvents: "none" }} />
      )}
      {i === activeMonth && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(12,36,33,0.06)", pointerEvents: "none" }} />
      )}
    </>
  );

  const rowLabel = (icon: string, name: string, sub: string) => (
    <div style={{ width: 236, flexShrink: 0, padding: "12px 20px", display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: "#0C2421", lineHeight: 1.25, fontFamily: '"Instrument Serif", serif' }}>
          {name}
        </span>
      </div>
      <span style={{ fontSize: 12, color: "#8A7E74", paddingLeft: 29, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.3 }}>
        {sub}
      </span>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#F5F5F0", border: "1px solid rgba(12,36,33,0.07)" }}>
      <div className="overflow-x-auto scrollbar-none">
        <div style={{ minWidth: "720px" }}>

          {/* ── Month header row ── */}
          <div className="flex items-stretch" style={{ borderBottom: "1px solid rgba(12,36,33,0.07)" }}>
            <div style={{ width: 236, flexShrink: 0, padding: "14px 20px", display: "flex", alignItems: "flex-end" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>
                Month
              </span>
            </div>
            <div className="flex-1" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)" }}>
              {MONTH_ABBR.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMonth(i)}
                  style={{ textAlign: "center", padding: "14px 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: i === currentMonth ? "#C4873A" : i === activeMonth ? "#0C2421" : "#A09890", fontFamily: '"DM Sans", sans-serif', cursor: "pointer", border: "none", backgroundColor: "transparent", position: "relative" }}
                >
                  {i === activeMonth && (
                    <motion.div
                      layoutId="month-col-highlight"
                      className="absolute inset-0"
                      style={{ backgroundColor: i === currentMonth ? "rgba(196,135,58,0.09)" : "rgba(12,36,33,0.08)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  {i !== activeMonth && i === currentMonth && (
                    <div className="absolute inset-0" style={{ backgroundColor: "rgba(196,135,58,0.09)" }} />
                  )}
                  <span className="relative" style={{ zIndex: 1 }}>{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Row 1: Travel quality (pill bars) ── */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0 }}
            style={{ borderBottom: "1px solid rgba(12,36,33,0.05)" }}
          >
            {rowLabel("✈️", "Travel quality", "Island-wide")}
            <div className="flex-1 relative" style={{ height: 66 }}>
              <div style={{ position: "absolute", inset: 0, left: `${(currentMonth / 12) * 100}%`, width: `${(1 / 12) * 100}%`, backgroundColor: "rgba(196,135,58,0.06)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", inset: 0, left: `${(activeMonth / 12) * 100}%`, width: `${(1 / 12) * 100}%`, backgroundColor: "rgba(12,36,33,0.06)", pointerEvents: "none" }} />
              {recRuns.map((run, ri) => {
                const leftPct = (run.start / 12) * 100;
                const widthPct = ((run.end - run.start + 1) / 12) * 100;
                const runLength = run.end - run.start + 1;
                const label = run.quality === "best" ? "Best time" : run.quality === "good" ? "Good" : "Possible";
                return (
                  <motion.div
                    key={ri}
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: ri * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: "absolute", left: `calc(${leftPct}% + 2px)`, width: `calc(${widthPct}% - 4px)`, top: "50%", transform: "translateY(-50%)", height: 32, backgroundColor: MONTH_QUAL_COLOR[run.quality], borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "0 10px", transformOrigin: "left center" }}
                  >
                    {runLength >= 2 && (
                      <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 10.9, fontWeight: 600, letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: '"DM Sans", sans-serif' }}>
                        {label}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Row 2: Crowd level ── */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.06 }}
            style={{ borderBottom: "1px solid rgba(12,36,33,0.05)" }}
          >
            {rowLabel("👥", "Crowd level", "All regions")}
            <div className="flex-1" style={{ height: 66, display: "grid", gridTemplateColumns: "repeat(12, 1fr)", position: "relative" }}>
              {MONTHS.map((m, i) => {
                const cfg = CROWD_CONFIG[m.crowd];
                return (
                  <div
                    key={i}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, position: "relative", cursor: "pointer" }}
                    onClick={() => setActiveMonth(i)}
                  >
                    {colHighlight(i)}
                    <div style={{ display: "flex", gap: 2, position: "relative", zIndex: 1 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: n <= m.crowd ? cfg.color : "#D5D0CA" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, color: cfg.color, fontFamily: '"DM Sans", sans-serif', letterSpacing: "0.04em", position: "relative", zIndex: 1 }}>
                      {cfg.label.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Row 3: Festivals ── */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.12 }}
            style={{ borderBottom: "1px solid rgba(12,36,33,0.05)" }}
          >
            {rowLabel("🎉", "Festivals", "Sri Lanka")}
            <div className="flex-1" style={{ height: 66, display: "grid", gridTemplateColumns: "repeat(12, 1fr)", position: "relative" }}>
              {MONTHS.map((m, i) => (
                <div
                  key={i}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, position: "relative", cursor: "pointer" }}
                  onClick={() => setActiveMonth(i)}
                >
                  {colHighlight(i)}
                  {m.festivals.length > 0 ? (
                    <>
                      <span style={{ fontSize: 18, position: "relative", zIndex: 1 }}>{m.festivals[0].emoji}</span>
                      {m.festivals.length > 1 && (
                        <span style={{ fontSize: 8, fontWeight: 700, color: "#C4873A", fontFamily: '"DM Sans", sans-serif', position: "relative", zIndex: 1 }}>
                          +{m.festivals.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "#D5D0CA", position: "relative", zIndex: 1 }}>—</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Legend ── */}
          <div
            className="flex items-center gap-5 flex-wrap"
            style={{ padding: "14px 20px", borderTop: "1px solid rgba(12,36,33,0.06)", backgroundColor: "rgba(12,36,33,0.02)" }}
          >
            {[
              { color: "#1B5E4A", label: "Best time" },
              { color: "#6FA394", label: "Good / shoulder" },
              { color: "#B8AFA6", label: "Possible" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ height: 10, width: 28, borderRadius: 999, backgroundColor: color }} />
                <span style={{ fontSize: 11, color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>{label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ height: 10, width: 28, borderRadius: 999, border: "1.5px solid #C4873A", backgroundColor: "transparent" }} />
              <span style={{ fontSize: 11, color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>Current month</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Selected month detail panel — outside the scrollable area so it's full-width on mobile ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMonth + "-detail"}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.22 }}
          style={{ padding: "22px 20px", backgroundColor: "rgba(255,255,255,0.55)", borderTop: "1px solid rgba(12,36,33,0.06)" }}
        >
          {/* Headline + summary */}
          <p style={{ fontSize: 22, fontWeight: 600, color: "#0C2421", fontFamily: '"Instrument Serif", serif', marginBottom: 6 }}>
            {MONTH_ABBR[activeMonth]} — {month.message}
          </p>
          <p style={{ fontSize: 14, color: "#5A5046", fontFamily: '"DM Sans", sans-serif', lineHeight: 1.65, maxWidth: 580, marginBottom: 14 }}>
            {month.summary}
          </p>

          {/* Pills row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: month.festivals.length > 0 ? 10 : 18 }}>
            {/* Crowd pill */}
            {(() => {
              const cfg = CROWD_CONFIG[month.crowd];
              return (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>Crowds</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} style={{ width: n <= month.crowd ? 7 : 5, height: n <= month.crowd ? 7 : 5, borderRadius: "50%", backgroundColor: n <= month.crowd ? cfg.color : "#D5D0CA" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, fontFamily: '"DM Sans", sans-serif' }}>{cfg.label}</span>
                </div>
              );
            })()}
            {/* Trip length pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, backgroundColor: "rgba(12,36,33,0.05)", border: "1px solid rgba(12,36,33,0.10)" }}>
              <span style={{ fontSize: 13 }}>🗓️</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0C2421", fontFamily: '"DM Sans", sans-serif' }}>{month.tripLength.duration}</span>
              <span style={{ width: 1, height: 11, backgroundColor: "rgba(12,36,33,0.15)", display: "inline-block" }} />
              <span style={{ fontSize: 10, color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>{month.tripLength.note}</span>
            </div>
          </div>

          {/* Festivals strip */}
          {month.festivals.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 18, padding: "10px 14px", borderRadius: 12, backgroundColor: "rgba(196,135,58,0.07)", border: "1px solid rgba(196,135,58,0.18)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C4873A", fontFamily: '"DM Sans", sans-serif', marginRight: 4 }}>What's on</span>
              {month.festivals.map((f, fi) => (
                <React.Fragment key={fi}>
                  {fi > 0 && <span style={{ color: "#D5D0CA", fontSize: 12 }}>·</span>}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, backgroundColor: "rgba(196,135,58,0.10)", fontSize: 12, color: "#5A4020", fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}>
                    <span>{f.emoji}</span>
                    <span>{f.name}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Weather by region header */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>
              Weather by region
            </p>
          </div>

          {/* City rows — stacked, clean on all screen sizes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {CITIES.map((city, ci) => {
              const data = month.cities[ci];
              const tempPct = (data.temp / MAX_TEMP) * 100;
              const rainPct = (data.rain / MAX_RAIN) * 100;
              return (
                <div key={city}>
                  {/* City name + values on one line */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0C2421", fontFamily: '"DM Sans", sans-serif' }}>
                      {city}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#E67E22", fontFamily: '"DM Sans", sans-serif' }}>
                        {display(data.temp)}{unitLabel}
                      </span>
                      <span style={{ color: "#D5D0CA", fontSize: 11 }}>·</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#5B8C8D", fontFamily: '"DM Sans", sans-serif' }}>
                        {data.rain}mm
                      </span>
                    </div>
                  </div>
                  {/* Two thin bars: temp left, rain right */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div style={{ position: "relative", height: 4, borderRadius: 999, backgroundColor: "#D5D8DC" }}>
                      <motion.div
                        style={{ position: "absolute", left: 0, top: 0, height: "100%", background: "linear-gradient(90deg, #E67E22, #F39C12)", borderRadius: 999 }}
                        initial={false}
                        animate={{ width: `${tempPct}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </div>
                    <div style={{ position: "relative", height: 4, borderRadius: 999, backgroundColor: "#D5D8DC" }}>
                      <motion.div
                        style={{ position: "absolute", left: 0, top: 0, height: "100%", background: "linear-gradient(90deg, #5B8C8D, #6FA8A9)", borderRadius: 999 }}
                        initial={false}
                        animate={{ width: `${rainPct}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Activity calendar (Gantt chart view)
const ActivityCalendar: React.FC<{ currentMonth: number }> = ({ currentMonth }) => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{ backgroundColor: "#F5F5F0", border: "1px solid rgba(12,36,33,0.07)" }}
  >
    <div className="overflow-x-auto scrollbar-none">
      <div style={{ minWidth: "720px" }}>

        {/* Month header row */}
        <div
          className="flex items-stretch"
          style={{ borderBottom: "1px solid rgba(12,36,33,0.07)" }}
        >
          <div
            style={{ width: 236, flexShrink: 0, padding: "14px 20px", display: "flex", alignItems: "flex-end" }}
          >
            <span
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "#8A7E74",
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Activity
            </span>
          </div>
          <div className="flex-1" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)" }}>
            {MONTH_ABBR.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: "14px 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: i === currentMonth ? "#C4873A" : "#A09890",
                  backgroundColor: i === currentMonth ? "rgba(196,135,58,0.09)" : "transparent",
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Activity rows */}
        {ACTIVITIES.map((activity, ai) => (
          <motion.div
            key={activity.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: ai * 0.06 }}
            className="flex items-center"
            style={{
              borderBottom:
                ai < ACTIVITIES.length - 1 ? "1px solid rgba(12,36,33,0.05)" : "none",
            }}
          >
            {/* Label */}
            <div
              style={{
                width: 236,
                flexShrink: 0,
                padding: "12px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{activity.icon}</span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#0C2421",
                    lineHeight: 1.25,
                    fontFamily: '"Instrument Serif", serif',
                  }}
                >
                  {activity.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12.1,
                  color: "#8A7E74",
                  paddingLeft: 29,
                  fontFamily: '"DM Sans", sans-serif',
                  lineHeight: 1.3,
                }}
              >
                {activity.locations}
              </span>
            </div>

            {/* Bar chart */}
            <div className="flex-1 relative" style={{ height: 66 }}>
              {/* Current-month column highlight */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  left: `${(currentMonth / 12) * 100}%`,
                  width: `${(1 / 12) * 100}%`,
                  backgroundColor: "rgba(196,135,58,0.06)",
                  pointerEvents: "none",
                }}
              />

              {/* Runs */}
              {getActivityRuns(activity.months).map((run, ri) => {
                const leftPct = (run.start / 12) * 100;
                const widthPct = ((run.end - run.start + 1) / 12) * 100;
                const runLength = run.end - run.start + 1;
                const bg = run.quality === "peak" ? "#1B5E4A" : "#6FA394";

                return (
                  <motion.div
                    key={ri}
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: ai * 0.06 + ri * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute",
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: 32,
                      backgroundColor: bg,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      padding: "0 10px",
                      transformOrigin: "left center",
                    }}
                  >
                    {runLength >= 3 && (
                      <span
                        style={{
                          color: "rgba(255,255,255,0.88)",
                          fontSize: 10.9,
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: '"DM Sans", sans-serif',
                        }}
                      >
                        {activity.locations}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Legend */}
        <div
          className="flex items-center gap-5 flex-wrap"
          style={{
            padding: "14px 20px",
            borderTop: "1px solid rgba(12,36,33,0.06)",
            backgroundColor: "rgba(12,36,33,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 10, width: 28, borderRadius: 999, backgroundColor: "#1B5E4A" }} />
            <span style={{ fontSize: 11, color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>
              Peak season
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 10, width: 28, borderRadius: 999, backgroundColor: "#6FA394" }} />
            <span style={{ fontSize: 11, color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>
              Good / shoulder
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                height: 10, width: 28, borderRadius: 999,
                border: "1.5px solid #C4873A", backgroundColor: "transparent",
              }}
            />
            <span style={{ fontSize: 11, color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>
              Current month
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const ClimateGuideSection: React.FC = () => {
  const currentMonth = new Date().getMonth();
  const [viewMode, setViewMode] = useState<"month" | "activity">("activity");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [liveWeather, setLiveWeather] = useState<LiveCity[] | null>(null);

  const display = (c: number) => unit === "C" ? c : toF(c);
  const unitLabel = unit === "C" ? "°C" : "°F";

  useEffect(() => {
    Promise.all(
      LIVE_CITIES.map((city) =>
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`
        )
          .then((r) => r.json())
          .then((d) => ({
            name: city.name,
            temp: Math.round(d.current_weather.temperature),
            code: d.current_weather.weathercode as number,
          }))
      )
    )
      .then(setLiveWeather)
      .catch(() => {});
  }, []);

  return (
    <section className="bg-[#FBFAF9] py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header row ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2
            className="font-display text-3xl sm:text-5xl text-[#0C2421] font-normal"
            style={{ fontFamily: "'Instrument Serif', serif", color: "rgba(12,36,33,1)" }}
          >
            When to go
          </h2>

          {/* View mode toggle */}
          <div
            className="flex items-center p-1 rounded-full shrink-0"
            style={{ backgroundColor: "#EDEAE4" }}
          >
            {(["activity", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="relative px-3 py-1.5 sm:px-4 rounded-full transition-colors duration-200 cursor-pointer"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: viewMode === mode ? "#FBFAF9" : "#8A7E74",
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="view-bg"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: "#0C2421" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  {mode === "month" ? "By Month" : "By Activity"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Live Weather Strip ──────────────────────────────────────── */}
        <AnimatePresence>
          {liveWeather && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <div
                className="flex items-center gap-3 sm:gap-5 px-5 py-3 rounded-xl"
                style={{
                  backgroundColor: "#F0EDE7",
                  border: "1px solid rgba(196,135,58,0.22)",
                }}
              >
                {/* Live pulse dot */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: "#3D9E6A",
                      boxShadow: "0 0 0 0 rgba(61,158,106,0.4)",
                      animation: "livePulse 2s ease-in-out infinite",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#8A7E74",
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  >
                    Live now
                  </span>
                </div>

                <div
                  style={{ width: 1, height: 14, backgroundColor: "#D5D0CA", flexShrink: 0 }}
                />

                {/* City temps — horizontally scrollable on mobile */}
                <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {liveWeather.map((city, i) => (
                    <React.Fragment key={city.name}>
                      {i > 0 && (
                        <span style={{ color: "#D5D0CA", fontSize: 12, fontWeight: 300, flexShrink: 0 }}>·</span>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#5A5046",
                            fontFamily: '"DM Sans", sans-serif',
                          }}
                        >
                          {city.name}
                        </span>
                        <span style={{ fontSize: 14 }}>{weatherEmoji(city.code)}</span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0C2421",
                            fontFamily: '"DM Sans", sans-serif',
                          }}
                        >
                          {display(city.temp)}{unitLabel}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {/* °C / °F toggle — pinned to the right */}
                <div
                  style={{ width: 1, height: 14, backgroundColor: "#D5D0CA", flexShrink: 0 }}
                />
                <div style={{ display: "flex", alignItems: "center", borderRadius: 999, overflow: "hidden", border: "1.5px solid #D5D0CA", flexShrink: 0 }}>
                  {(["C", "F"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      style={{ padding: "4px 10px", fontSize: 11, fontWeight: unit === u ? 700 : 500, fontFamily: '"DM Sans", sans-serif', backgroundColor: unit === u ? "#0C2421" : "transparent", color: unit === u ? "#FBFAF9" : "#8A7E74", border: "none", cursor: "pointer", transition: "all 0.15s ease" }}
                    >
                      °{u}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Views ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {viewMode === "month" ? (
            <motion.div
              key="month-view"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.28 }}
            >
              <MonthCalendar
                currentMonth={currentMonth}
                activeMonth={activeMonth}
                setActiveMonth={setActiveMonth}
                display={display}
                unitLabel={unitLabel}
                unit={unit}
                setUnit={setUnit}
              />
            </motion.div>
          ) : (
            <motion.div
              key="activity-view"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.28 }}
            >
              <ActivityCalendar currentMonth={currentMonth} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Live pulse keyframe */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(61,158,106,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(61,158,106,0); }
        }
      `}</style>
    </section>
  );
};

export default ClimateGuideSection;
