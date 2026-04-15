import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────
type FilterCategory = 'All' | 'Regions' | 'Culture & Tips' | 'Wildlife' | 'Seasonal';
type ArticleCategory = 'Culture & Tips' | 'Wildlife' | 'Seasonal';
type SeasonQuality = 'best' | 'good' | 'mixed' | 'wet';

interface Destination {
  slug: string;
  name: string;
  tagline: string;
  region: string;
  image: string;
  bestTime: string;
  duration: string;
  readTime: string;
}

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  category: ArticleCategory;
  date: string;
  featured?: boolean;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const DESTINATIONS: Destination[] = [
  {
    slug: 'ella',
    name: 'Ella',
    tagline: 'Nine arches, misty peaks & slow mornings',
    region: 'Hill Country',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec6368ef419f4ec73b_Screenshot%202026-02-10%20at%204.14.02%E2%80%AFAM.png',
    bestTime: 'Dec – Apr',
    duration: '2–3 days',
    readTime: '7 min',
  },
  {
    slug: 'kandy',
    name: 'Kandy',
    tagline: 'The spiritual heart of the island',
    region: 'Central Province',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec3b53bbedef516144_Screenshot%202026-02-10%20at%204.13.52%E2%80%AFAM.png',
    bestTime: 'Jan – Apr',
    duration: '2–3 days',
    readTime: '6 min',
  },
  {
    slug: 'galle',
    name: 'Galle',
    tagline: 'Dutch colonial charm meets the Indian Ocean',
    region: 'Southern Province',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec8d2e8ca70d64c46c_Screenshot%202026-02-10%20at%204.12.48%E2%80%AFAM.png',
    bestTime: 'Nov – Apr',
    duration: '2–4 days',
    readTime: '8 min',
  },
  {
    slug: 'colombo',
    name: 'Colombo',
    tagline: 'A capital city in full, exhilarating bloom',
    region: 'Western Province',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec5e5b8765ccd38e63_Screenshot%202026-02-10%20at%204.12.54%E2%80%AFAM.png',
    bestTime: 'Dec – Mar',
    duration: '1–2 days',
    readTime: '5 min',
  },
  {
    slug: 'sigiriya',
    name: 'Sigiriya',
    tagline: 'An ancient kingdom rising from the jungle',
    region: 'Cultural Triangle',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898b6458e65dd0444751_Must-Visit-Caves-in-Sri-Lanka%20(1).jpg',
    bestTime: 'Jan – Sep',
    duration: '1–2 days',
    readTime: '6 min',
  },
  {
    slug: 'nuwara-eliya',
    name: 'Nuwara Eliya',
    tagline: 'Tea, mist & Little England at 1,868m',
    region: 'Hill Country',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984886cfce4578d36659ddd_What-are-the-top-attractions-in-Nuwara-Eliya_20241113112510.jpg',
    bestTime: 'Dec – Mar',
    duration: '2–3 days',
    readTime: '7 min',
  },
  {
    slug: 'trincomalee',
    name: 'Trincomalee',
    tagline: "Sri Lanka's best-kept east coast secret",
    region: 'Eastern Province',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898716687fc4ba9b5441_Sri-Lanka-5.jpg',
    bestTime: 'May – Sep',
    duration: '3–5 days',
    readTime: '6 min',
  },
  {
    slug: 'yala',
    name: 'Yala',
    tagline: 'Leopards, elephants & wild Sri Lanka',
    region: 'Southern Province',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698487a2a035dec2b9a0c107_Fishermen.jpeg',
    bestTime: 'Feb – Jul',
    duration: '2–3 days',
    readTime: '5 min',
  },
];

// Slugs mapped to canonical blog slugs so ArticlePage resolves them
const ARTICLES: Article[] = [
  {
    slug: 'when-to-visit-sri-lanka',
    title: 'When to Visit Sri Lanka: The Complete Seasonal Guide',
    excerpt:
      'With two monsoon seasons and year-round sunshine somewhere on the island, knowing when to visit which region changes everything about your trip.',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69838bc1712205ff655de71c_5052216621-ezgif.com-webp-to-jpg-converter.jpg',
    readTime: '5 min',
    category: 'Seasonal',
    date: 'Dec 2025',
    featured: true,
  },
  {
    slug: 'sri-lankan-food-guide',
    title: "Sri Lankan Food: A Complete Traveller's Guide",
    excerpt:
      'From hoppers and kottu roti to seafood curries and buffalo curd — a full guide to eating your way around the island.',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df099e7a4a0b5ecbcd53_Screenshot%202026-02-09%20at%203.57.01%E2%80%AFPM.png',
    readTime: '8 min',
    category: 'Culture & Tips',
    date: 'Jan 2026',
  },
  {
    slug: 'what-to-pack-for-sri-lanka',
    title: 'What to Pack for Sri Lanka',
    excerpt:
      'A practical, no-nonsense packing list for every type of Sri Lanka trip — from beach to highlands to cultural triangle.',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df190501fea92245c727_Screenshot%202026-02-09%20at%203.55.06%E2%80%AFPM.png',
    readTime: '4 min',
    category: 'Culture & Tips',
    date: 'Feb 2026',
  },
  {
    slug: 'wildlife-safari-yala',
    title: "Yala National Park: The Ultimate Safari Guide",
    excerpt:
      'Leopards at Yala, elephants at Minneriya, blue whales off Mirissa. Plan your wildlife encounter with our expert field guide.',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989c9da9422f8c13806555f_Screenshot%202026-02-09%20at%204.49.15%E2%80%AFPM.png',
    readTime: '7 min',
    category: 'Wildlife',
    date: 'Feb 2026',
  },
  {
    slug: 'cultural-etiquette',
    title: 'Cultural Etiquette: How to Travel Sri Lanka Respectfully',
    excerpt:
      'Temple dress codes, dining customs, gestures to learn — everything you need to travel with genuine respect and connection.',
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df2274d427fd46cdd3f3_Screenshot%202026-02-09%20at%203.55.33%E2%80%AFPM.png',
    readTime: '6 min',
    category: 'Culture & Tips',
    date: 'Mar 2026',
  },
  {
    slug: 'east-coast-guide',
    title: "Why the East Coast Is Sri Lanka's Best-Kept Secret",
    excerpt:
      "While the west coast gets the crowds, the east offers pristine beaches and a slower, more authentic pace — from May through September.",
    image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698487a2a035dec2b9a0c107_Fishermen.jpeg',
    readTime: '7 min',
    category: 'Seasonal',
    date: 'Mar 2026',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SEASONAL_DATA: { region: string; months: SeasonQuality[] }[] = [
  {
    region: 'West & South Coast',
    months: ['best', 'best', 'best', 'good', 'wet', 'wet', 'wet', 'wet', 'wet', 'mixed', 'mixed', 'best'],
  },
  {
    region: 'Hill Country',
    months: ['best', 'best', 'good', 'mixed', 'wet', 'wet', 'wet', 'wet', 'good', 'mixed', 'good', 'best'],
  },
  {
    region: 'Cultural Triangle',
    months: ['best', 'best', 'best', 'good', 'good', 'good', 'good', 'good', 'good', 'mixed', 'mixed', 'best'],
  },
  {
    region: 'East Coast',
    months: ['mixed', 'mixed', 'mixed', 'good', 'best', 'best', 'best', 'best', 'best', 'mixed', 'wet', 'wet'],
  },
];

const QUALITY_COLORS: Record<SeasonQuality, string> = {
  best: '#1B5E4A',
  good: '#6FA394',
  mixed: '#C4873A',
  wet: '#C5BFBA',
};

const CATEGORY_COLORS: Record<ArticleCategory, { bg: string; text: string }> = {
  'Culture & Tips': { bg: '#7BA99A', text: '#fff' },
  Wildlife: { bg: '#1B5E4A', text: '#fff' },
  Seasonal: { bg: '#C4873A', text: '#fff' },
};

const QUICK_TIPS = [
  {
    num: '01',
    title: 'Get a local SIM card at the airport',
    body: "Dialog or Mobitel SIM cards cost around $5 and offer excellent coverage. Buy one before you leave the arrivals hall.",
  },
  {
    num: '02',
    title: 'Dress modestly at all temples',
    body: 'Cover shoulders and knees at religious sites. Carry a light sarong — many temples lend them at the entrance.',
  },
  {
    num: '03',
    title: 'Book the Kandy–Ella train in advance',
    body: "One of the world's great rail journeys. Observation carriage tickets sell out weeks ahead — book online on bookme.lk.",
  },
  {
    num: '04',
    title: 'The east coast runs May–September',
    body: "While the west coast goes quiet in the southwest monsoon, the east coast blooms into its dry season. Plan accordingly.",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const DestinationCard: React.FC<{
  dest: Destination;
  large?: boolean;
  wide?: boolean;
  index?: number;
}> = ({ dest, large, wide, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    className="h-full"
  >
    <Link href={`/destinations/${dest.slug}`} className="block group h-full">
      <div
        className="relative overflow-hidden rounded-2xl h-full"
        style={{ minHeight: large ? '520px' : wide ? '260px' : '300px' }}
      >
        <img
          src={dest.image}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-between p-5 lg:p-6">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {dest.region}
            </span>
            <span className="text-[11px] text-white/50 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {dest.readTime}
            </span>
          </div>

          {/* Bottom content */}
          <div>
            <h3
              className="font-bold text-white leading-tight mb-1"
              style={{
                fontFamily: "'LLIvory', serif",
                fontSize: large ? '2.75rem' : '1.75rem',
                lineHeight: 1.05,
              }}
            >
              {dest.name}
            </h3>
            <p className="text-white/65 text-sm mb-4 line-clamp-2">{dest.tagline}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white/50 text-xs">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {dest.bestTime}
                </span>
                <span className="hidden sm:block">{dest.duration}</span>
              </div>
              <div
                className="h-8 w-8 rounded-full border border-white/25 flex items-center justify-center text-white -rotate-45 group-hover:rotate-0 group-hover:bg-white group-hover:text-black transition-all duration-500"
              >
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const ArticleCard: React.FC<{ article: Article; featured?: boolean; number?: number; index?: number }> = ({
  article,
  featured,
  number,
  index = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-30px' }}
    transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
  >
    <Link href={`/blog/${article.slug}`} className="block group">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ height: featured ? '440px' : '280px' }}
      >
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-between p-5 lg:p-6">
          <div className="flex items-start justify-between">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: CATEGORY_COLORS[article.category].bg,
                color: CATEGORY_COLORS[article.category].text,
              }}
            >
              {article.category}
            </span>
            {number !== undefined && (
              <span
                className="font-bold text-white/20"
                style={{ fontFamily: "'LLIvory', serif", fontSize: '2rem' }}
              >
                {String(number).padStart(2, '0')}
              </span>
            )}
          </div>

          <div>
            <h3
              className="font-bold text-white leading-snug mb-2"
              style={{
                fontFamily: "'LLIvory', serif",
                fontSize: featured ? '1.65rem' : '1.2rem',
                lineHeight: 1.2,
              }}
            >
              {article.title}
            </h3>
            {featured && (
              <p className="text-white/65 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.readTime}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/60 group-hover:text-white flex items-center gap-1 transition-colors duration-300">
                Read <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const SeasonalGuide: React.FC<{ currentMonth: number }> = ({ currentMonth }) => (
  <section className="py-20 lg:py-28" style={{ backgroundColor: '#111C1A' }}>
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
            style={{ color: '#C4873A' }}
          >
            Planning Your Visit
          </p>
          <h2
            className="font-bold leading-[1.05]"
            style={{
              fontFamily: "'LLIvory', serif",
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              color: '#FAF8F3',
              fontWeight: 600,
            }}
          >
            When to visit,{' '}
            <em className="italic" style={{ color: '#6FA394' }}>
              where to go.
            </em>
          </h2>
        </div>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(250,248,243,0.45)' }}>
          Sri Lanka has two monsoon seasons. There's always a sunny corner of the island — here's how to find it.
        </p>
      </div>

      {/* Seasonal grid */}
      <div
        className="overflow-x-auto rounded-2xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="min-w-[700px] p-6 lg:p-8">
          {/* Month header row */}
          <div className="grid gap-1.5 mb-4" style={{ gridTemplateColumns: '160px repeat(12, 1fr)' }}>
            <div />
            {MONTHS.map((m, i) => (
              <div
                key={m}
                className="text-center text-[11px] font-bold uppercase pb-2"
                style={{
                  color: i === currentMonth ? '#C4873A' : 'rgba(250,248,243,0.3)',
                  borderBottom: i === currentMonth ? '2px solid #C4873A' : '2px solid transparent',
                }}
              >
                {m}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {SEASONAL_DATA.map((row, ri) => (
            <motion.div
              key={row.region}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: ri * 0.08 }}
              className="grid gap-1.5 mb-2.5"
              style={{ gridTemplateColumns: '160px repeat(12, 1fr)' }}
            >
              <div
                className="flex items-center text-[12px] font-medium pr-4"
                style={{ color: 'rgba(250,248,243,0.65)' }}
              >
                {row.region}
              </div>
              {row.months.map((quality, i) => (
                <div
                  key={i}
                  className="h-9 rounded-md transition-all duration-200 hover:brightness-110"
                  style={{
                    backgroundColor: QUALITY_COLORS[quality],
                    outline: i === currentMonth ? '2px solid #C4873A' : 'none',
                    outlineOffset: '2px',
                  }}
                  title={`${MONTHS[i]}: ${quality}`}
                />
              ))}
            </motion.div>
          ))}

          {/* Legend */}
          <div
            className="flex flex-wrap gap-5 mt-6 pt-6"
            style={{ borderTop: '1px solid rgba(250,248,243,0.08)' }}
          >
            {(
              [
                { quality: 'best' as SeasonQuality, label: 'Best time to visit' },
                { quality: 'good' as SeasonQuality, label: 'Good conditions' },
                { quality: 'mixed' as SeasonQuality, label: 'Shoulder season' },
                { quality: 'wet' as SeasonQuality, label: 'Rainy season' },
              ] as const
            ).map(({ quality, label }) => (
              <div key={quality} className="flex items-center gap-2">
                <div className="h-3 w-5 rounded" style={{ backgroundColor: QUALITY_COLORS[quality] }} />
                <span className="text-xs" style={{ color: 'rgba(250,248,243,0.45)' }}>
                  {label}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="h-3 w-5 rounded border-2" style={{ borderColor: '#C4873A', backgroundColor: 'transparent' }} />
              <span className="text-xs" style={{ color: 'rgba(250,248,243,0.45)' }}>
                Current month
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ArticlesGrid: React.FC<{ articles: Article[]; showAll: boolean }> = ({ articles, showAll }) => {
  const featured = showAll ? articles.find((a) => a.featured) : undefined;
  const secondary = showAll ? articles.filter((a) => !a.featured).slice(0, 2) : [];
  const rest = showAll ? articles.filter((a) => !a.featured).slice(2) : articles;

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: '#FAF8F3' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#C4873A' }}>
              Field Notes
            </p>
            <h2
              className="font-bold leading-[1.05]"
              style={{
                fontFamily: "'LLIvory', serif",
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                color: '#0C2421',
                fontWeight: 600,
              }}
            >
              Travel dispatches.
            </h2>
          </div>
          <Link href="/destinations" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider group" style={{ color: '#0C2421' }}>
            All Articles <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature + secondary articles */}
        {featured && (
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 mb-4">
            <ArticleCard article={featured} featured />
            <div className="flex flex-col gap-4">
              {secondary.map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Remaining articles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((article, i) => (
            <ArticleCard key={article.slug} article={article} number={i + 1} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const QuickTips: React.FC = () => (
  <section className="py-20 lg:py-24" style={{ backgroundColor: '#0C2421' }}>
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#C4873A' }}>
          Traveller's Notebook
        </p>
        <h2
          className="font-bold"
          style={{
            fontFamily: "'LLIvory', serif",
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
            color: '#FAF8F3',
            fontWeight: 600,
            lineHeight: 1.05,
          }}
        >
          Things we wish<br />
          <em className="italic" style={{ color: '#6FA394' }}>we'd known sooner.</em>
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_TIPS.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="p-6 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span
              className="block font-bold mb-4"
              style={{
                fontFamily: "'LLIvory', serif",
                fontSize: '3.5rem',
                color: 'rgba(196,135,58,0.25)',
                lineHeight: 1,
              }}
            >
              {tip.num}
            </span>
            <h4 className="font-semibold text-sm mb-3 leading-snug" style={{ color: '#FAF8F3' }}>
              {tip.title}
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,248,243,0.45)' }}>
              {tip.body}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const FILTER_CATEGORIES: FilterCategory[] = ['All', 'Regions', 'Culture & Tips', 'Wildlife', 'Seasonal'];

export default function DestinationsGuide() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const currentMonth = new Date().getMonth();

  const showRegions = activeFilter === 'All' || activeFilter === 'Regions' || activeFilter === 'Wildlife';
  const showSeasonal = activeFilter === 'All' || activeFilter === 'Seasonal';
  const showArticles =
    activeFilter === 'All' ||
    activeFilter === 'Culture & Tips' ||
    activeFilter === 'Wildlife' ||
    activeFilter === 'Seasonal';
  const showTips = activeFilter === 'All' || activeFilter === 'Culture & Tips';

  const filteredArticles =
    activeFilter === 'All'
      ? ARTICLES
      : activeFilter === 'Regions'
      ? []
      : ARTICLES.filter((a) => a.category === activeFilter);

  const filteredDests =
    activeFilter === 'Wildlife' ? DESTINATIONS.filter((d) => d.slug === 'yala') : DESTINATIONS;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      {/* ── Hero / Editorial Masthead ── */}
      <section style={{ backgroundColor: '#0C2421' }} className="relative overflow-hidden">
        {/* Subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-[1200px] mx-auto px-6 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-[1fr_360px] gap-14 lg:gap-20 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Masthead label */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px w-8" style={{ backgroundColor: '#C4873A' }} />
                  <span
                    className="text-xs font-bold uppercase tracking-[0.25em]"
                    style={{ color: '#C4873A' }}
                  >
                    Sri Lanka Travel Guide · Vol. I · 2026
                  </span>
                </div>

                <h1
                  className="leading-[0.95] mb-7"
                  style={{
                    fontFamily: "'LLIvory', serif",
                    fontSize: 'clamp(3rem, 7vw, 6rem)',
                    color: '#FAF8F3',
                    fontWeight: 600,
                  }}
                >
                  Discover the island,{' '}
                  <em className="italic" style={{ color: '#C4873A' }}>
                    one road
                  </em>{' '}
                  at a time.
                </h1>

                <p
                  className="text-base leading-relaxed max-w-lg mb-10"
                  style={{ color: 'rgba(250,248,243,0.55)' }}
                >
                  Eight unforgettable regions. Essential seasonal guides. Local tips from people who know every mile.
                  Everything you need to plan the journey of your life.
                </p>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                  {FILTER_CATEGORIES.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: activeFilter === f ? '#C4873A' : 'rgba(250,248,243,0.08)',
                        color: activeFilter === f ? '#FAF8F3' : 'rgba(250,248,243,0.6)',
                        border: `1px solid ${activeFilter === f ? '#C4873A' : 'rgba(250,248,243,0.12)'}`,
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Featured destination card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href="/destinations/ella" className="block group">
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <img
                    src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec6368ef419f4ec73b_Screenshot%202026-02-10%20at%204.14.02%E2%80%AFAM.png"
                    alt="Ella, Sri Lanka"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: '#C4873A', color: '#FAF8F3' }}
                    >
                      Featured Region
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                      style={{ color: '#C4873A' }}
                    >
                      Hill Country
                    </p>
                    <h3
                      className="font-bold text-white mb-1"
                      style={{ fontFamily: "'LLIvory', serif", fontSize: '2.25rem', lineHeight: 1.05 }}
                    >
                      Ella
                    </h3>
                    <p className="text-white/60 text-sm mb-5">Nine arches, misty peaks & slow mornings</p>
                    <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all duration-300">
                      <span className="text-xs font-bold uppercase tracking-wider">Read the guide</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Destinations Grid ── */}
      <AnimatePresence>
        {showRegions && (
          <motion.section
            key="destinations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 lg:py-28"
            style={{ backgroundColor: '#FAF8F3' }}
          >
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#C4873A' }}>
                  Browse by Region
                </p>
                <h2
                  className="font-bold leading-[1.05]"
                  style={{
                    fontFamily: "'LLIvory', serif",
                    fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                    color: '#0C2421',
                    fontWeight: 600,
                  }}
                >
                  Eight worlds,{' '}
                  <em className="italic" style={{ color: '#6FA394' }}>
                    one island.
                  </em>
                </h2>
              </div>

              {/* Magazine grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Row 1: large (2/3) + 2 stacked (1/3) */}
                <div className="md:col-span-2 md:row-span-2" style={{ minHeight: '520px' }}>
                  {filteredDests[0] && <DestinationCard dest={filteredDests[0]} large index={0} />}
                </div>
                <div style={{ minHeight: '250px' }}>
                  {filteredDests[1] && <DestinationCard dest={filteredDests[1]} index={1} />}
                </div>
                <div style={{ minHeight: '250px' }}>
                  {filteredDests[2] && <DestinationCard dest={filteredDests[2]} index={2} />}
                </div>

                {/* Row 2: 3 equal */}
                {filteredDests[3] && (
                  <div style={{ minHeight: '280px' }}>
                    <DestinationCard dest={filteredDests[3]} index={3} />
                  </div>
                )}
                {filteredDests[4] && (
                  <div style={{ minHeight: '280px' }}>
                    <DestinationCard dest={filteredDests[4]} index={4} />
                  </div>
                )}
                {filteredDests[5] && (
                  <div style={{ minHeight: '280px' }}>
                    <DestinationCard dest={filteredDests[5]} index={5} />
                  </div>
                )}

                {/* Row 3: wide (2/3) + 1 */}
                {filteredDests[6] && (
                  <div className="md:col-span-2" style={{ minHeight: '260px' }}>
                    <DestinationCard dest={filteredDests[6]} wide index={6} />
                  </div>
                )}
                {filteredDests[7] && (
                  <div style={{ minHeight: '260px' }}>
                    <DestinationCard dest={filteredDests[7]} index={7} />
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Seasonal Guide ── */}
      {showSeasonal && <SeasonalGuide currentMonth={currentMonth} />}

      {/* ── Articles ── */}
      {showArticles && filteredArticles.length > 0 && (
        <ArticlesGrid articles={filteredArticles} showAll={activeFilter === 'All'} />
      )}

      {/* ── Quick Tips ── */}
      {showTips && <QuickTips />}

      {/* ── CTA ── */}
      <section
        className="min-h-[90vh] flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69838bc1712205ff655de71c_5052216621-ezgif.com-webp-to-jpg-converter.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-4">
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-normal text-white mb-6">
              Still not sure where to <em className="italic">go?</em>
            </h2>
            <p className="text-xl text-white/90 mb-10 font-light">
              Try our trip wizard to find your dream trip. We'll ask a few simple questions and build a route just for you.
            </p>
            <Link href="/tours/custom">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 h-14 px-8 rounded-full text-lg font-medium">
                Start Trip Wizard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
