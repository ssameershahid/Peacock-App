import React from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface LegalPageProps {
  title: string;
  subtitle?: string;
  effectiveDate: string;
  lastUpdated?: string;
  sections: LegalSection[];
  /** Optional contact nudge shown in the footer strip */
  contactNote?: React.ReactNode;
}

// ─── Sidebar nav ─────────────────────────────────────────────────────────────

function SidebarNav({ sections, activeId }: { sections: LegalSection[]; activeId: string }) {
  return (
    <nav className="sticky top-28 hidden lg:block w-56 shrink-0">
      <p className="text-[11px] font-body font-semibold uppercase tracking-widest text-warm-400 mb-4">
        On this page
      </p>
      <ul className="space-y-0.5">
        {sections.map(s => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                'group flex items-center gap-2 py-1.5 text-[13px] font-body transition-colors',
                activeId === s.id
                  ? 'text-forest-500 font-medium'
                  : 'text-warm-400 hover:text-warm-600'
              )}
            >
              <span
                className={cn(
                  'w-0.5 h-4 rounded-full transition-colors shrink-0',
                  activeId === s.id ? 'bg-forest-400' : 'bg-transparent group-hover:bg-warm-200'
                )}
              />
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LegalPage({
  title,
  subtitle,
  effectiveDate,
  lastUpdated,
  sections,
  contactNote,
}: LegalPageProps) {
  const [activeId, setActiveId] = React.useState(sections[0]?.id ?? '');

  // Scroll-spy
  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(s.id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-forest-600 pt-32 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/40 text-xs font-body mb-6">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">{title}</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl text-white mb-4 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-white/60 text-base max-w-xl">{subtitle}</p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-6 text-[13px] font-body text-white/40">
            <span>Effective: <span className="text-white/60">{effectiveDate}</span></span>
            {lastUpdated && (
              <span>Last updated: <span className="text-white/60">{lastUpdated}</span></span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1200px] mx-auto px-6 py-16 flex gap-16">
        <SidebarNav sections={sections} activeId={activeId} />

        <article className="flex-1 min-w-0">
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className={cn('scroll-mt-28', i < sections.length - 1 && 'mb-14 pb-14 border-b border-warm-100')}
            >
              <h2 className="font-display text-2xl text-forest-600 mb-5">{section.title}</h2>
              <div className="prose-legal">{section.content}</div>
            </section>
          ))}
        </article>
      </div>

      {/* Footer strip */}
      {contactNote && (
        <div className="border-t border-warm-100 bg-warm-50">
          <div className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center text-amber-200 font-display text-xl italic pr-0.5 shrink-0">
              P
            </div>
            <div className="font-body text-sm text-warm-500 leading-relaxed">{contactNote}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Prose helpers ────────────────────────────────────────────────────────────
// Use these inside section `content` for consistent typography.

export function LegalP({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('font-body text-[15px] text-warm-600 leading-relaxed mb-4 last:mb-0', className)}>
      {children}
    </p>
  );
}

export function LegalUL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-4 last:mb-0 space-y-2 pl-5 list-none">
      {children}
    </ul>
  );
}

export function LegalLI({ children }: { children: React.ReactNode }) {
  return (
    <li className="font-body text-[15px] text-warm-600 leading-relaxed flex gap-3">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-200 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export function LegalOL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="mb-4 last:mb-0 space-y-2 pl-5 list-decimal marker:text-warm-300 marker:font-body">
      {children}
    </ol>
  );
}

export function LegalNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border-l-2 border-amber-200 rounded-r-lg px-5 py-4 mb-4 last:mb-0">
      <p className="font-body text-[14px] text-amber-500 leading-relaxed">{children}</p>
    </div>
  );
}

export function LegalHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-forest-50 border border-forest-100 rounded-xl px-5 py-4 mb-4 last:mb-0">
      <p className="font-body text-[14px] text-forest-500 leading-relaxed">{children}</p>
    </div>
  );
}

export function LegalEmail({ address }: { address: string }) {
  return (
    <a href={`mailto:${address}`} className="text-forest-500 hover:text-forest-400 underline underline-offset-2 transition-colors">
      {address}
    </a>
  );
}
