import React from 'react';
import { Link, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getArticleBySlug, getRelatedArticles, type FullArticle } from '@/content/articles';

// ── Category colour ────────────────────────────────────────────────────────────

const CATEGORY_COLOUR: Record<string, string> = {
  'Seasonal':       'bg-amber-100 text-amber-200',
  'Wildlife':       'bg-forest-100 text-forest-500',
  'Culture & Tips': 'bg-[#e6f0ee] text-forest-400',
  'Food & Drink':   'bg-warm-100 text-warm-600',
  'Itineraries':    'bg-[#f0ede6] text-amber-200',
};

// ── Body renderer ──────────────────────────────────────────────────────────────

function ArticleBody({ article }: { article: FullArticle }) {
  return (
    <div className="space-y-10">
      {article.body.map((section, i) => (
        <div key={i}>
          {section.heading && (
            <h2 className="font-display text-2xl md:text-3xl text-forest-600 mb-4 leading-tight">
              {section.heading}
            </h2>
          )}

          {section.paragraphs?.map((p, j) => (
            <p key={j} className="font-body text-[16px] text-warm-600 leading-relaxed mb-4">
              {p}
            </p>
          ))}

          {section.pullquote && (
            <blockquote className="my-8 pl-6 border-l-2 border-amber-200">
              <p className="font-display text-xl md:text-2xl text-forest-500 leading-snug italic">
                {section.pullquote}
              </p>
            </blockquote>
          )}

          {section.list && (
            <ul className="space-y-4 my-4">
              {section.list.map((item, j) => (
                <li key={j} className="flex gap-4">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-200 shrink-0" />
                  <span className="font-body text-[15px] text-warm-600 leading-relaxed">
                    {item.label && (
                      <span className="font-semibold text-forest-500">{item.label}: </span>
                    )}
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {section.tip && (
            <div className="my-6 bg-forest-50 border border-forest-100 rounded-xl p-5 flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center mt-0.5">
                <span className="text-amber-200 text-[11px] font-body font-bold uppercase tracking-wide">
                  {(section.tipLabel ?? 'tip').charAt(0)}
                </span>
              </div>
              <div>
                {section.tipLabel && (
                  <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-forest-400 mb-1">
                    {section.tipLabel}
                  </p>
                )}
                <p className="font-body text-[14px] text-forest-500 leading-relaxed">{section.tip}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ article }: { article: FullArticle }) {
  const related = getRelatedArticles(article.relatedSlugs);

  return (
    <aside className="space-y-8">
      {/* CTA card */}
      <div className="bg-forest-600 rounded-2xl p-6 text-white">
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-amber-200 mb-3">
          Ready to experience this?
        </p>
        <p className="font-display text-xl leading-snug mb-5">
          Travel Sri Lanka with a local expert driver-guide.
        </p>
        <Link href={article.ctaHref}>
          <button className="w-full bg-amber-200 hover:bg-amber-300 text-warm-900 font-body font-semibold text-[13px] py-3 px-5 rounded-full transition-all duration-200 flex items-center justify-center gap-2">
            {article.ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
        <Link href="/tours/custom">
          <button className="w-full mt-2 bg-white/10 hover:bg-white/15 text-white/80 font-body text-[13px] py-3 px-5 rounded-full transition-all duration-200">
            Or build a custom trip
          </button>
        </Link>
      </div>

      {/* Article meta */}
      <div className="bg-warm-50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-body text-[11px] text-warm-400 uppercase tracking-widest">Category</span>
          <span className={cn(
            'text-[10px] font-body font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full',
            CATEGORY_COLOUR[article.category] ?? 'bg-warm-100 text-warm-500'
          )}>
            {article.category}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-[11px] text-warm-400 uppercase tracking-widest">Read time</span>
          <span className="font-body text-[13px] text-warm-600 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readTime} min
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-[11px] text-warm-400 uppercase tracking-widest">Published</span>
          <span className="font-body text-[13px] text-warm-600">{article.date}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-[11px] text-warm-400 uppercase tracking-widest">Author</span>
          <span className="font-body text-[13px] text-warm-600">{article.author}</span>
        </div>
      </div>

      {/* Related reading */}
      {related.length > 0 && (
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-warm-400 mb-4">
            Related reading
          </p>
          <div className="space-y-3">
            {related.map(rel => (
              <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group block">
                <div className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[13px] text-warm-600 leading-snug group-hover:text-forest-500 transition-colors line-clamp-2">
                      {rel.title}
                    </p>
                    <p className="font-body text-[11px] text-warm-300 mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {rel.readTime} min
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Related cards at bottom ────────────────────────────────────────────────────

function RelatedCard({ article }: { article: FullArticle }) {
  return (
    <Link href={`/blog/${article.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-4">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className={cn(
          'absolute top-3 left-3 text-[10px] font-body font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full',
          CATEGORY_COLOUR[article.category] ?? 'bg-warm-100 text-warm-500'
        )}>
          {article.category}
        </span>
      </div>
      <h3 className="font-display text-lg text-forest-600 leading-snug group-hover:text-forest-400 transition-colors">
        {article.title}
      </h3>
      <p className="font-body text-[12px] text-warm-400 mt-1 flex items-center gap-1">
        <Clock className="w-3 h-3" /> {article.readTime} min read
      </p>
    </Link>
  );
}

// ── 404 state ──────────────────────────────────────────────────────────────────

function ArticleNotFound({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-amber-200 mb-4">
          Field Notes
        </p>
        <h1 className="font-display text-4xl text-forest-600 mb-4">Article not found</h1>
        <p className="font-body text-warm-400 mb-8">
          We couldn't find an article at <code className="text-forest-400">/{slug}</code>. It may have moved or the URL may be incorrect.
        </p>
        <Link href="/blog">
          <button className="bg-forest-600 text-white font-body font-semibold text-[13px] px-6 py-3 rounded-full hover:bg-forest-500 transition-all duration-200 flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Field Notes
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ArticlePage() {
  // Matches both /blog/:slug and /destinations/articles/:slug
  const [matchBlog, paramsBlog] = useRoute('/blog/:slug');
  const [matchDest, paramsDest] = useRoute('/destinations/articles/:slug');
  const slug = (matchBlog ? paramsBlog?.slug : paramsDest?.slug) ?? '';
  const article = getArticleBySlug(slug);

  if (!article) return <ArticleNotFound slug={slug} />;

  const related = getRelatedArticles(article.relatedSlugs);

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-[60vh] min-h-[420px] max-h-[640px] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0 max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-1.5 text-white/40 text-xs font-body mt-20">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-white/70 transition-colors">Field Notes</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/60 line-clamp-1 max-w-xs">{article.title}</span>
          </div>
        </div>

        {/* Title overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 right-0 max-w-[1200px] mx-auto px-6 pb-10"
        >
          <span className={cn(
            'inline-block text-[10px] font-body font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4',
            CATEGORY_COLOUR[article.category] ?? 'bg-white/20 text-white'
          )}>
            {article.category}
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-white leading-tight max-w-3xl">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-white/50 font-body text-[13px]">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {article.readTime} min read</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.author}</span>
          </div>
        </motion.div>
      </div>

      {/* ── Body + Sidebar ────────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="flex gap-16 items-start">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 min-w-0"
          >
            {/* Excerpt lead */}
            <p className="font-display text-xl md:text-2xl text-forest-500 leading-relaxed mb-10 pb-10 border-b border-warm-200">
              {article.excerpt}
            </p>

            <ArticleBody article={article} />

            {/* Back link */}
            <div className="mt-14 pt-10 border-t border-warm-200">
              <Link href="/blog" className="group inline-flex items-center gap-2 font-body text-[13px] text-warm-400 hover:text-forest-500 transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Field Notes
              </Link>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block w-80 shrink-0 sticky top-28"
          >
            <Sidebar article={article} />
          </motion.div>
        </div>
      </div>

      {/* ── Related articles ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-warm-200 bg-white">
          <div className="max-w-[1200px] mx-auto px-6 py-14">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-amber-200 mb-2">
                  Continue reading
                </p>
                <h2 className="font-display text-3xl text-forest-600">More from Field Notes</h2>
              </div>
              <Link href="/blog" className="font-body text-[13px] text-warm-400 hover:text-forest-500 transition-colors flex items-center gap-1.5 pb-1">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map(rel => (
                <RelatedCard key={rel.slug} article={rel} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom CTA strip ──────────────────────────────────────────────── */}
      <div className="bg-forest-600 py-14 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-amber-200 mb-2">
              Peacock Drivers
            </p>
            <h3 className="font-display text-3xl text-white">
              Ready to experience Sri Lanka?
            </h3>
            <p className="font-body text-white/50 mt-2 text-[14px]">
              Expert driver-guides, curated itineraries, seamless logistics.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/tours">
              <button className="bg-amber-200 hover:bg-amber-300 text-warm-900 font-body font-semibold text-[14px] px-7 py-3.5 rounded-full transition-all duration-200">
                Browse tours
              </button>
            </Link>
            <Link href="/tours/custom">
              <button className="bg-white/10 hover:bg-white/15 text-white font-body text-[14px] px-7 py-3.5 rounded-full transition-all duration-200">
                Custom trip
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
