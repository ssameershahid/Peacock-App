import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ARTICLES, type ArticleCategory, type FullArticle } from '@/content/articles';

// ── Types ──────────────────────────────────────────────────────────────────────

type Category = 'All' | ArticleCategory;

const CATEGORIES: Category[] = ['All', 'Seasonal', 'Wildlife', 'Culture & Tips', 'Food & Drink', 'Itineraries'];

// ── Category colour map ────────────────────────────────────────────────────────

const CATEGORY_COLOUR: Record<ArticleCategory, string> = {
  'Seasonal':       'bg-amber-100 text-amber-200',
  'Wildlife':       'bg-forest-100 text-forest-500',
  'Culture & Tips': 'bg-[#e6f0ee] text-forest-400',
  'Food & Drink':   'bg-warm-100 text-warm-600',
  'Itineraries':    'bg-[#f0ede6] text-amber-200',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function CategoryTag({ category, className }: { category: ArticleCategory; className?: string }) {
  return (
    <span className={cn(
      'inline-block text-[10px] font-body font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full',
      CATEGORY_COLOUR[category],
      className
    )}>
      {category}
    </span>
  );
}

function ReadTime({ minutes, light }: { minutes: number; light?: boolean }) {
  return (
    <span className={cn('flex items-center gap-1 font-body text-[12px]', light ? 'text-white/50' : 'text-warm-400')}>
      <Clock className="w-3 h-3" />
      {minutes} min
    </span>
  );
}

// ── Featured hero card (large) ─────────────────────────────────────────────────

function FeaturedCard({ article, index }: { article: FullArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
    >
      <Link href={`/blog/${article.slug}`}>
        <div className="relative w-full h-full min-h-[420px] md:min-h-[500px] overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
          <div className="absolute inset-0 flex flex-col justify-between p-7">
            <CategoryTag category={article.category} />
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-white leading-tight mb-2 max-w-sm">
                {article.title}
              </h2>
              <p className="font-body text-[13px] text-white/60 leading-relaxed mb-4 max-w-xs line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <ReadTime minutes={article.readTime} light />
                <span className="font-body text-[12px] font-semibold uppercase tracking-widest text-white/70 group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                  Read <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Stacked secondary card ─────────────────────────────────────────────────────

function StackedCard({ article, index }: { article: FullArticle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer flex-1"
    >
      <Link href={`/blog/${article.slug}`}>
        <div className="relative w-full h-full min-h-[200px] overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <CategoryTag category={article.category} />
            <div>
              <h3 className="font-display text-xl text-white leading-tight mb-3">
                {article.title}
              </h3>
              <div className="flex items-center justify-between">
                <ReadTime minutes={article.readTime} light />
                <span className="font-body text-[11px] font-semibold uppercase tracking-widest text-white/60 group-hover:text-amber-200 transition-colors flex items-center gap-1">
                  Read <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Grid article card ──────────────────────────────────────────────────────────

function GridCard({ article, index }: { article: FullArticle; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
    >
      <Link href={`/blog/${article.slug}`}>
        <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3]">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-forest-600 text-[11px] font-body font-semibold px-2.5 py-1 rounded-full">
              <Clock className="w-2.5 h-2.5" /> {article.readTime} min
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <CategoryTag category={article.category} />
          <span className="text-[11px] font-body text-warm-300">{article.date}</span>
        </div>
        <h3 className="font-display text-[17px] text-forest-600 leading-snug mb-2 group-hover:text-forest-500 transition-colors">
          <span className="relative">
            {article.title}
            <span className="absolute bottom-0 left-0 w-0 h-px bg-amber-200 group-hover:w-full transition-all duration-500 ease-out" />
          </span>
        </h3>
        <p className="font-body text-[13px] text-warm-400 leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
      </Link>
    </motion.article>
  );
}

// ── Newsletter strip ───────────────────────────────────────────────────────────

function NewsletterStrip() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSent(true);
  }

  return (
    <section className="bg-forest-600 rounded-2xl px-8 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-amber-200 mb-2">
          Field Notes — Newsletter
        </p>
        <h3 className="font-display text-3xl md:text-4xl text-white leading-tight">
          Dispatches from the road,<br />straight to your inbox.
        </h3>
        <p className="font-body text-[14px] text-white/50 mt-3 max-w-sm">
          Seasonal guides, hidden gems, and travel intel from our drivers — once a month, no noise.
        </p>
      </div>
      {sent ? (
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-6 py-4">
          <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-forest-600" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-body text-[14px] text-white/80">You're on the list — welcome.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-white/10 border border-white/20 text-white placeholder:text-white/30 font-body text-[14px] rounded-xl px-4 py-3 outline-none focus:border-amber-200/60 transition-colors w-full md:w-64"
          />
          <button
            type="submit"
            className="shrink-0 bg-amber-200 hover:bg-amber-300 text-warm-900 font-body font-semibold text-[13px] px-5 py-3 rounded-full transition-all duration-200 flex items-center gap-1.5"
          >
            Subscribe <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const featured = ARTICLES.find(a => a.featured)!;
  const secondaryFeatured = ARTICLES.filter(a => !a.featured).slice(0, 2);

  const filteredGrid = useMemo(() => {
    const rest = ARTICLES.filter(a => !a.featured && !secondaryFeatured.includes(a));
    if (activeCategory === 'All') return rest;
    return rest.filter(a => a.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pt-36 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-amber-200 mb-3">
            Field Notes
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="font-display text-5xl md:text-7xl text-forest-700 leading-none">
              Travel dispatches.
            </h1>
          </div>
        </motion.div>
      </div>

      {/* ── Featured trio ──────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)' }}>
          <FeaturedCard article={featured} index={0} />
          <div className="flex flex-col gap-4">
            {secondaryFeatured.map((article, i) => (
              <StackedCard key={article.slug} article={article} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Divider + category filter ──────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pb-10">
        <div className="border-t border-warm-200 pt-10 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'font-body text-[12px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200',
                activeCategory === cat
                  ? 'bg-forest-600 text-white'
                  : 'bg-white text-warm-500 hover:bg-warm-50 hover:text-warm-700 border border-warm-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Article grid ───────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {filteredGrid.length > 0 ? (
            <motion.div
              key={activeCategory}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
            >
              {filteredGrid.map((article, i) => (
                <GridCard key={article.slug} article={article} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center"
            >
              <p className="font-display text-2xl text-warm-300 mb-2">No articles yet</p>
              <p className="font-body text-sm text-warm-300">Check back soon — our writers are in the field.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Newsletter ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        <NewsletterStrip />
      </div>
    </div>
  );
}
