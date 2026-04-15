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
  { label: "JUL", short: "JUL", recommendation: "possible", message: "Travel is possible, but this is not the best time of year", crowd: 2,
    summary: "East coast peak — Arugam Bay surf season hits its stride; west coast is off-season and uncrowded with lower prices.",
    festivals: [{ emoji: "🎺", name: "Vel Festival (Colombo)" }],
    tripLength: { duration: "7–10 days", note: "East coast peak; west coast less appealing but very affordable" },
    cities: [{temp:30,rain:135},{temp:32,rain:32},{temp:31,rain:42},{temp:31,rain:47},{temp:27,rain:172},{temp:18,rain:175},{temp:29,rain:167},{temp:29,rain:204}] },
  { label: "AUG", short: "AUG", recommendation: "possible", message: "Travel is possible, but this is not the best time of year", crowd: 2,
    summary: "Best month for east coast beaches and wildlife at Yala; expect significantly lower prices and fewer tourists island-wide.",
    festivals: [{ emoji: "🐘", name: "Kandy Esala Perahera (10 nights)" }],
    tripLength: { duration: "10–14 days", note: "Allow extra days for the Kandy Perahera — it's unmissable" },
    cities: [{temp:30,rain:103},{temp:33,rain:41},{temp:31,rain:37},{temp:32,rain:42},{temp:28,rain:163},{temp:18,rain:154},{temp:28,rain:177},{temp:29,rain:190}] },
  { label: "SEP", short: "SEP", recommendation: "possible", message: "Travel is possible, but this is not the best time of year", crowd: 1,
    summary: "A quiet transition month with occasional showers across the island — good for deals, cultural sites, and fewer crowds.",
    festivals: [],
    tripLength: { duration: "7–10 days", note: "Good value island-wide; fewer tourists and lower prices" },
    cities: [{temp:30,rain:184},{temp:33,rain:71},{temp:32,rain:86},{temp:32,rain:95},{temp:28,rain:176},{temp:21,rain:169},{temp:29,rain:222},{temp:29,rain:310}] },
  { label: "OCT", short: "OCT", recommendation: "possible", message: "Travel is possible, but this is not the best time of year", crowd: 1,
    summary: "The northeast monsoon begins — the wettest and least-visited month, but prices hit their annual low across the island.",
    festivals: [{ emoji: "✨", name: "Deepavali preparations begin" }],
    tripLength: { duration: "5–7 days", note: "Keep it short; heavy rains limit access to many regions" },
    cities: [{temp:30,rain:360},{temp:31,rain:239},{temp:31,rain:264},{temp:30,rain:253},{temp:28,rain:323},{temp:19,rain:245},{temp:29,rain:354},{temp:29,rain:431}] },
  { label: "NOV", short: "NOV", recommendation: "possible", message: "Travel is possible, but this is not the best time of year", crowd: 2,
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

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M5 0.5L6.1 3.7L9.5 4L6.9 6.2L7.6 9.5L5 7.8L2.4 9.5L3.1 6.2L0.5 4L3.9 3.7L5 0.5Z" />
  </svg>
);

const WaveCheck = ({ count }: { count: number }) => (
  <div className="flex items-center gap-[2px] justify-center mt-1">
    {Array.from({ length: count }).map((_, i) => <StarIcon key={i} />)}
  </div>
);

const getWaveCount = (rec: "best" | "good" | "possible") =>
  rec === "best" ? 3 : rec === "good" ? 2 : 1;

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

  const month = MONTHS[activeMonth];
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
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <h2
            className="font-display text-5xl sm:text-6xl text-[#0C2421] font-normal"
            style={{ fontFamily: "LLIvory", color: "rgba(12,36,33,1)" }}
          >
            When to go
          </h2>

          <div className="flex flex-col items-end gap-2.5 pt-1 sm:pt-2">
            {/* View mode toggle */}
            <div
              className="flex items-center p-1 rounded-full"
              style={{ backgroundColor: "#EDEAE4" }}
            >
              {(["activity", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="relative px-4 py-1.5 rounded-full transition-colors duration-200 cursor-pointer"
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

            {/* °C / °F toggle */}
            <div
              className="flex items-center rounded-full overflow-hidden"
              style={{ border: "1.5px solid #D5D0CA" }}
            >
              {(["C", "F"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className="cursor-pointer transition-colors duration-150"
                  style={{
                    padding: "5px 14px",
                    fontSize: 11,
                    fontWeight: unit === u ? 700 : 500,
                    fontFamily: '"DM Sans", sans-serif',
                    backgroundColor: unit === u ? "#0C2421" : "transparent",
                    color: unit === u ? "#FBFAF9" : "#8A7E74",
                  }}
                >
                  °{u}
                </button>
              ))}
            </div>
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
                className="flex items-center gap-3 sm:gap-5 px-5 py-3 rounded-xl flex-wrap"
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

                {liveWeather.map((city, i) => (
                  <React.Fragment key={city.name}>
                    {i > 0 && (
                      <span style={{ color: "#D5D0CA", fontSize: 12, fontWeight: 300 }}>·</span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
              {/* Month Tabs */}
              <div className="flex justify-between items-start mb-0 border-b border-[#D5D5D0]">
                {MONTHS.map((m, i) => {
                  const isActive = i === activeMonth;
                  const isCurrent = i === currentMonth;
                  return (
                    <button
                      key={m.label}
                      onClick={() => setActiveMonth(i)}
                      className={`
                        relative flex flex-col items-center pb-3 pt-2 px-1 sm:px-3 text-xs sm:text-sm font-medium
                        tracking-wide transition-colors duration-200 cursor-pointer
                        ${isActive ? "text-[#2C3E50] font-bold" : "text-[#8E9EAB] hover:text-[#5A6B7A]"}
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="month-indicator"
                          className="absolute inset-0 border-2 border-[#2C3E50] rounded-sm"
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      {/* Small amber dot on current (non-active) month */}
                      {isCurrent && !isActive && (
                        <span
                          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: "#C4873A" }}
                        />
                      )}
                      <span className="relative z-10">{m.label}</span>
                      <span
                        className={`relative z-10 ${isActive ? "text-[#5A8F7B]" : "text-[#B0BEC5]"}`}
                      >
                        <WaveCheck count={getWaveCount(m.recommendation)} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Data Panel */}
              <div className="bg-[#F5F5F0] rounded-b-2xl p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMonth + "-msg"}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="mb-[36px] text-left pt-[30px]"
                  >
                    {/* Headline */}
                    <p
                      className="text-[24px] text-black font-extrabold flex flex-wrap"
                      style={{ fontFamily: "LLIvory" }}
                    >
                      {month.message}
                    </p>
                    <motion.svg
                      width="200" height="12" viewBox="0 0 200 12"
                      fill="none" className="mt-2"
                    >
                      <motion.path
                        d="M2 6C10 2 18 10 26 6C34 2 42 10 50 6C58 2 66 10 74 6C82 2 90 10 98 6C106 2 114 10 122 6C130 2 138 10 146 6C154 2 162 10 170 6C178 2 186 10 194 6"
                        stroke="#5A8F7B" strokeWidth="2" strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                      />
                    </motion.svg>

                    {/* Plain-language summary */}
                    <p
                      className="mt-4 text-[15px] leading-relaxed"
                      style={{
                        color: "#5A5046",
                        fontFamily: '"DM Sans", sans-serif',
                        maxWidth: 560,
                      }}
                    >
                      {month.summary}
                    </p>

                    {/* Bottom info row: crowd + festivals + trip length */}
                    <div className="flex flex-wrap gap-3 mt-5">

                      {/* Crowd indicator */}
                      {(() => {
                        const cfg = CROWD_CONFIG[month.crowd];
                        return (
                          <div
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-full"
                            style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}33` }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>
                              Crowds
                            </span>
                            <div className="flex items-center gap-[5px]">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <div key={n} style={{ width: n <= month.crowd ? 8 : 6, height: n <= month.crowd ? 8 : 6, borderRadius: "50%", backgroundColor: n <= month.crowd ? cfg.color : "#D5D0CA", transition: "all 0.2s ease" }} />
                              ))}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, fontFamily: '"DM Sans", sans-serif' }}>
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Trip length */}
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ backgroundColor: "rgba(12,36,33,0.05)", border: "1px solid rgba(12,36,33,0.10)" }}
                      >
                        <span style={{ fontSize: 14 }}>🗓️</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0C2421", fontFamily: '"DM Sans", sans-serif' }}>
                          {month.tripLength.duration}
                        </span>
                        <span style={{ width: 1, height: 12, backgroundColor: "rgba(12,36,33,0.15)", display: "inline-block" }} />
                        <span style={{ fontSize: 11, color: "#8A7E74", fontFamily: '"DM Sans", sans-serif' }}>
                          {month.tripLength.note}
                        </span>
                      </div>

                    </div>

                    {/* Festivals */}
                    {month.festivals.length > 0 && (
                      <div
                        className="flex flex-wrap items-center gap-2 mt-3 px-4 py-3 rounded-xl"
                        style={{ backgroundColor: "rgba(196,135,58,0.07)", border: "1px solid rgba(196,135,58,0.18)" }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C4873A", fontFamily: '"DM Sans", sans-serif', marginRight: 4 }}>
                          What's on
                        </span>
                        {month.festivals.map((f, fi) => (
                          <React.Fragment key={fi}>
                            {fi > 0 && <span style={{ color: "#D5D0CA", fontSize: 12 }}>·</span>}
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                              style={{ backgroundColor: "rgba(196,135,58,0.10)", fontSize: 12, color: "#5A4020", fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}
                            >
                              <span>{f.emoji}</span>
                              <span>{f.name}</span>
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>

                {/* Column Headers */}
                <div className="grid grid-cols-[minmax(100px,160px)_1fr_1fr] gap-x-4 sm:gap-x-8 mb-4">
                  <span
                    className="text-[18px] font-semibold text-[#0C2421]"
                    style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    Place
                  </span>
                  <span
                    className="text-[18px] font-semibold text-[#0C2421]"
                    style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    Daily max temperature ({unitLabel})
                  </span>
                  <span
                    className="text-[18px] font-semibold text-[#0C2421]"
                    style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    Monthly rainfall (mm)
                  </span>
                </div>

                {/* City Rows */}
                <div className="space-y-2">
                  {CITIES.map((city, i) => {
                    const data = month.cities[i];
                    const tempPercent = (data.temp / MAX_TEMP) * 100;
                    const rainPercent = (data.rain / MAX_RAIN) * 100;
                    const displayTemp = display(data.temp);

                    return (
                      <div
                        key={city}
                        className="grid grid-cols-[minmax(100px,160px)_1fr_1fr] gap-x-4 sm:gap-x-8 items-center py-2"
                      >
                        <span
                          className="text-[18px] font-normal text-[#0C2421]"
                          style={{
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 400,
                          }}
                        >
                          {city}
                        </span>

                        {/* Temperature bar */}
                        <div className="relative h-8 flex items-center">
                          <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                            <div className="w-full h-[6px] bg-[#D5D8DC] rounded-full" />
                          </div>
                          <motion.div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full"
                            style={{ background: "linear-gradient(90deg, #E67E22, #F39C12)" }}
                            initial={false}
                            animate={{ width: `${tempPercent}%` }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                          />
                          <motion.div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                            initial={false}
                            animate={{ left: `${tempPercent}%` }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                          >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E67E22] flex items-center justify-center shadow-md">
                              <span className="text-[10px] sm:text-xs font-bold text-white">
                                {displayTemp}
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        {/* Rainfall bar */}
                        <div className="relative h-8 flex items-center">
                          <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                            <div className="w-full h-[6px] bg-[#D5D8DC] rounded-full" />
                          </div>
                          <motion.div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full"
                            style={{ background: "linear-gradient(90deg, #5B8C8D, #6FA8A9)" }}
                            initial={false}
                            animate={{ width: `${rainPercent}%` }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                          />
                          <motion.div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                            initial={false}
                            animate={{ left: `${rainPercent}%` }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                          >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5B8C8D] flex items-center justify-center shadow-md">
                              <span className="text-[10px] sm:text-xs font-bold text-white">
                                {data.rain}
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
