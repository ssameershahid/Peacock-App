import React, { useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Map, Wand2, Car, CheckCircle2, ShieldCheck,
  UserCheck, Headphones, RefreshCcw, ChevronDown, ChevronRight,
  Star, MapPin, Calendar, Clock, Plane, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/peacock/Container';
import {
  ReadyToGoVisual,
  CreateYourOwnVisual,
  TransfersVisual,
} from '@/components/home/how-it-works/FlowVisuals';
import SriLankaMapVisual from '@/components/home/how-it-works/SriLankaMapVisual';

/* ─── Animation variants ─────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

/* ─── Static content ─────────────────────────────────────────── */
const TRUST_ITEMS = [
  { Icon: ShieldCheck, label: 'Secure checkout', sub: 'Powered by Stripe' },
  { Icon: UserCheck,   label: 'Vetted drivers',  sub: 'Handpicked & trained' },
  { Icon: Headphones,  label: 'Human support',   sub: '24/7 via WhatsApp' },
  { Icon: RefreshCcw,  label: 'Flexible changes', sub: 'Whilst you travel' },
];

const FAQS = [
  {
    q: 'Do I need to book far in advance?',
    a: 'For multi-day tours we recommend booking at least 4 weeks ahead during peak season (December–March). Transfers can often be arranged same-day. Availability is always shown live at checkout.',
  },
  {
    q: 'What if my plans change?',
    a: 'You can cancel or reschedule up to 21 days before your start date for a full refund on your deposit. If you need to alter your journey you can message our support team directly via WhatsApp.',
  },
  {
    q: 'Is my driver English-speaking?',
    a: 'Yes — every Peacock driver is fluent in English and trained as a local guide. They know the best detours, hidden cafés, and the right pace for each day.',
  },
  {
    q: 'How does payment work?',
    a: 'Multi-day tours require a 50% refundable deposit to hold your booking; the balance is settled up to 21 days before your start date. Transfers are paid in full at checkout. All payments run through Stripe — we never store card details.',
  },
  {
    q: 'Can I mix modalities — e.g. a custom tour plus an airport transfer?',
    a: 'Absolutely. Many guests book an airport transfer to arrive comfortably, then start a ready-to-go or custom tour at a later date. Each booking is independent and confirmed separately.',
  },
];

const MODALITIES = [
  {
    id: 'ready-to-go',
    num: '01',
    Icon: Map,
    label: 'Ready-to-Go Tours',
    badge: 'Most popular · Best for first-timers',
    headline: 'Pick a route. We handle everything else.',
    subhead:
      'Choose from our hand-built itineraries. Each one is timed perfectly — realistic drive days, curated stops, and a driver-guide who knows every road.',
    bg: '#FAF7F2',
    accent: '#14524C',
    accentLight: '#CCFFDE',
    steps: [
      {
        Icon: Map,
        num: 1,
        title: 'Browse & choose an itinerary',
        desc: 'Filter tours by duration, region, or theme. Every listing shows a full map, day-by-day breakdown, and exact inclusions — before you commit.',
      },
      {
        Icon: Calendar,
        num: 2,
        title: 'Set your dates & vehicle',
        desc: "Pick your start date and group size. We recommend the right vehicle automatically — you'll see the complete price before paying. No hidden fees.",
      },
      {
        Icon: CheckCircle2,
        num: 3,
        title: 'Reserve with a small deposit',
        desc: "Hold your tour with a refundable deposit. Instant email confirmation, a detailed itinerary, and your driver's direct contact land in your inbox.",
      },
    ],
    cta: { label: 'Browse all tours', href: '/tours' },
    Visual: ReadyToGoVisual,
  },
  {
    id: 'trip-wizard',
    num: '02',
    Icon: Wand2,
    label: 'Trip Wizard',
    badge: 'Fully bespoke · Your stops, your pace',
    headline: 'Build your route, stop by stop.',
    subhead:
      'Pin destinations across the island and watch your live route take shape. Our pacing engine keeps the trip realistic — you stay in full control.',
    bg: '#FFFFFF',
    accent: '#E8A825',
    accentLight: '#FEF3C7',
    steps: [
      {
        Icon: MapPin,
        num: 1,
        title: 'Add destinations day by day',
        desc: 'Search any town, attraction, or hotel across Sri Lanka. Drag pins to reorder anytime — the map updates in real time as you build.',
      },
      {
        Icon: Clock,
        num: 2,
        title: 'We keep the pacing realistic',
        desc: "Our engine flags any day that exceeds six hours of driving and suggests a quick fix. Split a day, swap a stop, or adjust order — you decide.",
      },
      {
        Icon: Car,
        num: 3,
        title: 'Pick your vehicle & lock it in',
        desc: "Choose from our verified fleet and pay a small deposit. Our team reviews your custom route within 24 hours to confirm driver availability.",
      },
    ],
    cta: { label: 'Open the Trip Wizard', href: '/tours/custom' },
    Visual: CreateYourOwnVisual,
  },
  {
    id: 'transfers',
    num: '03',
    Icon: Plane,
    label: 'Island Transfers',
    badge: 'Instant price · No guesswork',
    headline: 'From A to B — confirmed in under two minutes.',
    subhead:
      "Need an airport pickup or a city-to-city ride? Enter your locations, see a fixed price instantly, and check out in one smooth step.",
    bg: 'hsl(120 11% 91%)',
    accent: '#14524C',
    accentLight: '#CCFFDE',
    steps: [
      {
        Icon: MapPin,
        num: 1,
        title: 'Enter your pickup & drop-off',
        desc: 'Autocomplete covers airports, hotels, and every town on the island. Works for one-way journeys and return transfers alike.',
      },
      {
        Icon: Car,
        num: 2,
        title: 'See price, ETA & vehicle options',
        desc: "Get a fixed price with distance and drive time shown clearly. Choose your vehicle type, add luggage notes, and set a preferred pickup time.",
      },
      {
        Icon: ShieldCheck,
        num: 3,
        title: 'Pay & receive instant confirmation',
        desc: "One-step secure checkout. Your driver's name and WhatsApp number arrive by email immediately — everything you need in one place.",
      },
    ],
    cta: { label: 'Book a transfer', href: '/transfers' },
    Visual: TransfersVisual,
  },
] as const;

type Modality = (typeof MODALITIES)[number];

/* ─── Step timeline card ─────────────────────────────────────── */
function StepCard({
  step,
  isLast,
  accent,
  accentLight,
}: {
  step: Modality['steps'][number];
  isLast: boolean;
  accent: string;
  accentLight: string;
}) {
  const { Icon } = step;
  return (
    <motion.li variants={fadeUp} className="relative flex gap-5">
      {/* Number column */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm z-10"
          style={{ backgroundColor: accent }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {!isLast && (
          <div className="w-px flex-1 min-h-[40px] mt-2" style={{ backgroundColor: accentLight }} />
        )}
      </div>
      {/* Text */}
      <div className="pb-10 last:pb-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            Step {step.num}
          </span>
        </div>
        <h4 className="font-display text-xl font-normal text-[#0C2421] mb-2 leading-snug">
          {step.title}
        </h4>
        <p className="text-[15px] leading-relaxed text-warm-500 max-w-sm">{step.desc}</p>
      </div>
    </motion.li>
  );
}

/* ─── Per-modality full section ──────────────────────────────── */
function ModalitySection({
  modality,
  reversed,
}: {
  modality: Modality;
  reversed: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { Visual, Icon } = modality;

  return (
    <section
      id={modality.id}
      ref={ref}
      className="py-24 md:py-36 scroll-mt-16"
      style={{ backgroundColor: modality.bg }}
    >
      <Container>
        <div
          className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
            reversed ? 'lg:grid-flow-dense' : ''
          }`}
        >
          {/* ── Content ── */}
          <div className={reversed ? 'lg:col-start-2' : ''}>
            {/* Modality badge */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.55, ease }}
              className="flex items-center gap-3 mb-7"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: modality.accentLight }}
              >
                <Icon className="w-4 h-4" style={{ color: modality.accent }} />
              </div>
              <div>
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em] block leading-none"
                  style={{ color: modality.accent }}
                >
                  {modality.num} — {modality.label}
                </span>
                <span className="text-[11px] text-warm-400 mt-0.5 block">{modality.badge}</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.72, delay: 0.08, ease }}
              className="font-display text-4xl md:text-5xl font-normal text-[#0C2421] mb-5 leading-[1.08]"
            >
              {modality.headline}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.16, ease }}
              className="text-[17px] text-warm-500 leading-relaxed mb-10 max-w-md"
            >
              {modality.subhead}
            </motion.p>

            {/* Steps */}
            <motion.ul
              variants={stagger}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="space-y-0 mb-10 list-none"
            >
              {modality.steps.map((step, i) => (
                <StepCard
                  key={step.num}
                  step={step}
                  isLast={i === modality.steps.length - 1}
                  accent={modality.accent}
                  accentLight={modality.accentLight}
                />
              ))}
            </motion.ul>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5, ease }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link href={modality.cta.href}>
                <Button
                  size="lg"
                  className="rounded-full px-8 h-14 text-base font-bold shadow-lg gap-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: modality.accent, color: 'white' }}
                >
                  {modality.cta.label}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <span className="text-[13px] text-warm-400 leading-tight">
                No account needed to browse
              </span>
            </motion.div>
          </div>

          {/* ── Visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 28 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.18, ease }}
            className={`relative h-[460px] md:h-[560px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 ${
              reversed ? 'lg:col-start-1 lg:row-start-1' : ''
            }`}
          >
            <Visual />

            {/* Floating step counter badge */}
            <div
              className="absolute top-5 left-5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg"
              style={{ backgroundColor: modality.accent }}
            >
              {modality.num}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/* ─── FAQ accordion item ─────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="border-b border-warm-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between py-5 text-left gap-6 cursor-pointer group"
      >
        <span className="font-display text-xl md:text-2xl font-normal text-[#0C2421] group-hover:text-forest-500 transition-colors leading-snug">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 mt-0.5"
        >
          <ChevronDown className="w-5 h-5 text-warm-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-base text-warm-500 leading-relaxed max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function HowItWorks() {
  const trustRef = useRef(null);
  const faqRef   = useRef(null);
  const ctaRef   = useRef(null);

  const trustInView = useInView(trustRef, { once: true, margin: '-60px' });
  const faqInView   = useInView(faqRef,   { once: true, margin: '-60px' });
  const ctaInView   = useInView(ctaRef,   { once: true, margin: '-60px' });

  return (
    <div className="min-h-screen bg-background scroll-smooth">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0C2421] overflow-hidden pt-36 pb-28 md:pt-44 md:pb-32">
        {/* Soft glow orbs */}
        <div className="absolute -top-32 -right-40 w-[700px] h-[700px] rounded-full bg-forest-600/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[480px] h-[480px] rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-[1fr_460px] gap-12 lg:gap-16 items-center">
            {/* ── Left: Text ── */}
            <div>
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.08, ease }}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-normal text-white mb-6 leading-[1.04]"
              >
                How it{' '}
                <em className="italic text-amber-400">works</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease }}
                className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-4 max-w-xl"
              >
                Three ways to explore Sri Lanka with a trusted local driver-guide.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.28, ease }}
                className="text-base text-white/40 mb-12 max-w-lg leading-relaxed"
              >
                Pick a curated itinerary, build your own route from scratch, or book a single transfer — every option includes a vetted local driver, transparent pricing, and the freedom to travel entirely on your terms.
              </motion.p>

              {/* Anchor pills */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.38, ease }}
                className="flex flex-wrap gap-3"
              >
                {MODALITIES.map(m => {
                  const { Icon } = m;
                  return (
                    <a
                      key={m.id}
                      href={`#${m.id}`}
                      className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/8 border border-white/12 hover:bg-white/15 hover:border-white/25 transition-all duration-200 text-sm font-semibold text-white"
                    >
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span>{m.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all duration-200" />
                    </a>
                  );
                })}
              </motion.div>
            </div>

            {/* ── Right: Sri Lanka Map Visual ── */}
            <div className="hidden lg:block h-[540px]">
              <SriLankaMapVisual />
            </div>
          </div>
        </Container>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="w-full" style={{ display: 'block' }} preserveAspectRatio="none">
            <path d="M0 72L1440 72L1440 28C1200 62 960 10 720 28C480 46 240 4 0 28L0 72Z" fill="#FAF7F2" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          THREE MODALITY SECTIONS
      ══════════════════════════════════════════════════════════ */}
      {MODALITIES.map((m, i) => (
        <ModalitySection key={m.id} modality={m} reversed={i % 2 === 1} />
      ))}

      {/* ══════════════════════════════════════════════════════════
          DIVIDER BAND — reassurance
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-[#0C2421] py-12">
        <Container>
          <p className="font-display text-xl md:text-2xl italic text-center text-white/60">
            Every booking — every modality — includes the same guarantees
          </p>
        </Container>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TRUST STRIP
      ══════════════════════════════════════════════════════════ */}
      <section ref={trustRef} className="bg-[#0C2421] pb-24 md:pb-32">
        <Container>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={trustInView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {TRUST_ITEMS.map(({ Icon, label, sub }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/10 transition-colors duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-[#CCFFDE]/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#CCFFDE]" />
                </div>
                <span className="text-base font-bold text-white mb-1">{label}</span>
                <span className="text-[13px] text-white/45">{sub}</span>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PROCESS TIMELINE — condensed visual overview
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] py-24 md:py-32">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-3 block">
              Every journey, simplified
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421] leading-[1.1]">
              The same smooth experience,{' '}
              <em className="italic">every time</em>
            </h2>
          </div>

          {/* Horizontal flow — desktop */}
          <div className="hidden md:flex items-start gap-0 relative">
            {/* Connector line */}
            <div className="absolute top-10 left-[calc(12.5%)] right-[calc(12.5%)] h-px bg-warm-200" />

            {[
              { num: '1', Icon: Sparkles, title: 'Choose your journey', desc: 'Browse a tour, build a custom route, or book a transfer — whichever fits your trip.' },
              { num: '2', Icon: Calendar, title: 'Set dates, vehicle & pay', desc: 'Pick dates, group size, and vehicle. Secure Stripe checkout with instant confirmation.' },
              { num: '3', Icon: MapPin, title: 'Meet your driver', desc: 'Your driver arrives on time with your full itinerary loaded and ready to go.' },
              { num: '4', Icon: Star, title: 'Enjoy Sri Lanka', desc: 'Sit back and let a trusted local show you the island at its absolute best.' },
            ].map((step, i) => {
              const { Icon } = step;
              return (
                <div key={i} className="flex-1 flex flex-col items-center text-center px-4 relative z-10">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-forest-100 flex items-center justify-center shadow-sm mb-5 hover:border-amber-300 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-forest-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-2">{step.num}</span>
                  <h4 className="font-display text-xl font-normal text-[#0C2421] mb-2 leading-tight">{step.title}</h4>
                  <p className="text-[14px] text-warm-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Stacked — mobile */}
          <div className="md:hidden space-y-0">
            {[
              { num: '1', Icon: Sparkles, title: 'Choose your journey', desc: 'Browse, build, or book a transfer — whichever fits.' },
              { num: '2', Icon: Calendar, title: 'Set dates, vehicle & pay', desc: 'Dates, group size, vehicle, and Stripe checkout.' },
              { num: '3', Icon: MapPin, title: 'Meet your driver', desc: 'On time with your full itinerary loaded.' },
              { num: '4', Icon: Star, title: 'Enjoy Sri Lanka', desc: 'A trusted local shows you the island at its best.' },
            ].map((step, i, arr) => {
              const { Icon } = step;
              return (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-forest-100 flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-forest-500" />
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-px flex-1 min-h-[40px] bg-warm-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-8 last:pb-0">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 block mb-1">{step.num}</span>
                    <h4 className="font-display text-lg font-normal text-[#0C2421] mb-1.5 leading-tight">{step.title}</h4>
                    <p className="text-[14px] text-warm-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════ */}
      <section ref={faqRef} className="bg-white py-24 md:py-32 border-t border-warm-100">
        <Container>
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={faqInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease }}
              className="text-center mb-14"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-3 block">
                Common questions
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421] leading-[1.12]">
                Good to know{' '}
                <em className="italic">before</em> you book
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate={faqInView ? 'visible' : 'hidden'}
            >
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={faqInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5, ease }}
              className="mt-10 text-center"
            >
              <p className="text-sm text-warm-400 mb-4">Still have questions?</p>
              <a
                href="mailto:hello@peacockdrivers.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-forest-500 hover:text-amber-500 transition-colors"
              >
                <Headphones className="w-4 h-4" />
                Reach our team directly
              </a>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHICH IS RIGHT FOR ME
      ══════════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="bg-[#FAF7F2] py-24 md:py-32 border-t border-warm-100">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease }}
            className="text-center mb-14"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-500 mb-3 block">
              Not sure where to start?
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421] leading-[1.1] mb-4">
              Which journey is{' '}
              <em className="italic">right for you?</em>
            </h2>
            <p className="text-[17px] text-warm-400 max-w-md mx-auto">
              A quick guide to help you pick the best fit for your trip.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate={ctaInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                Icon: Map,
                accent: '#14524C',
                accentLight: '#CCFFDE',
                label: 'Ready-to-Go Tours',
                tagline: 'Everything sorted for me.',
                bullets: [
                  'First visit to Sri Lanka',
                  'Prefer a planned itinerary',
                  'No logistics to manage',
                ],
                cta: 'Browse all tours',
                href: '/tours',
              },
              {
                Icon: Wand2,
                accent: '#E8A825',
                accentLight: '#FEF3C7',
                label: 'Trip Wizard',
                tagline: 'I know where I want to go.',
                bullets: [
                  'Return visitor with own ideas',
                  'Specific places in mind',
                  'Full flexibility & control',
                ],
                cta: 'Open Trip Wizard',
                href: '/tours/custom',
              },
              {
                Icon: Plane,
                accent: '#14524C',
                accentLight: '#CCFFDE',
                label: 'Island Transfer',
                tagline: 'Just a reliable ride.',
                bullets: [
                  'Airport pickup or drop-off',
                  'City-to-city transfer',
                  'Book in under two minutes',
                ],
                cta: 'Book a transfer',
                href: '/transfers',
              },
            ].map(({ Icon, accent, accentLight, label, tagline, bullets, cta, href }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="bg-white rounded-3xl p-8 border border-warm-100 shadow-sm hover:-translate-y-1.5 transition-transform duration-300 flex flex-col"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: accentLight }}
                >
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 block"
                  style={{ color: accent }}
                >
                  {label}
                </span>
                <h3 className="font-display text-2xl font-normal text-[#0C2421] mb-5 leading-snug">
                  {tagline}
                </h3>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {bullets.map(b => (
                    <li key={b} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: accent }}
                      />
                      <span className="text-[14px] text-warm-500">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link href={href}>
                  <Button
                    className="w-full rounded-full font-bold gap-2 h-12 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accent, color: 'white' }}
                  >
                    {cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
