import React, { useRef, useState } from 'react';
import { Link } from 'wouter';
import { StoryIntroSection } from '@/components/home/StoryScrollSection';
import SpreadCardsSection from '@/components/home/SpreadCardsSection';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, MapPin, Mail, Phone, MessageCircle,
  Heart, Shield, Leaf, Users, Star, CheckCircle2,
  Instagram, Linkedin, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/peacock/Container';
import { cn } from '@/lib/utils';

/* ─── Animation config ───────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
};
const stagger = (d = 0.12) => ({
  hidden: {},
  visible: { transition: { staggerChildren: d } },
});

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-70px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerReveal({
  children,
  className,
  delay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger(delay)}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Team data ──────────────────────────────────────────────── */
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string;
  origin: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  tag: string;
}

const LEADERSHIP: TeamMember[] = [
  {
    name: 'Arjun Perera',
    role: 'Co-Founder & CEO',
    bio: 'Born and raised in Kandy, Arjun spent a decade in hospitality management before realising Sri Lanka\'s travel industry needed a human reset. He founded Peacock Drivers in 2019 with a single conviction: every guest deserves a driver who loves this island as much as they do.',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    origin: 'Kandy, Sri Lanka',
    email: 'arjun@peacockdrivers.com',
    linkedin: '#',
    tag: 'Founder',
  },
  {
    name: 'Nisha Fernando',
    role: 'Head of Guest Experience',
    bio: 'Nisha is the reason guests receive a message from a real person within minutes of booking. With a background in boutique hotel management and a natural gift for anticipating needs, she shaped Peacock\'s reputation for care that goes beyond the drive.',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
    origin: 'Colombo, Sri Lanka',
    email: 'nisha@peacockdrivers.com',
    instagram: '#',
    tag: 'Guest Care',
  },
  {
    name: 'Rohan Silva',
    role: 'Operations & Fleet Lead',
    bio: 'Rohan keeps 40+ vehicles in pristine condition and ensures every driver is vetted, trained, and ready. Former logistics director for a luxury resort group, he brought military-grade organisation to a company that needed it — wrapped in warmth.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
    origin: 'Galle, Sri Lanka',
    email: 'rohan@peacockdrivers.com',
    linkedin: '#',
    tag: 'Operations',
  },
];

interface Driver {
  name: string;
  specialty: string;
  region: string;
  years: number;
  languages: string[];
  bio: string;
  photo: string;
  status: 'available' | 'on-tour' | 'available-from';
  availableFrom?: string;
  whatsapp: string;
  rating: number;
  trips: number;
}

const DRIVERS: Driver[] = [
  {
    name: 'Kamal Rathnayake',
    specialty: 'Cultural Triangle & Ancient Cities',
    region: 'North Central Province',
    years: 8,
    languages: ['English', 'Sinhala', 'Tamil'],
    bio: 'Kamal grew up in the shadow of Sigiriya. He doesn\'t just drive you there — he tells you which crevice the king used to spy on his enemies. Eight years, zero bad reviews.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    status: 'available',
    whatsapp: '+94771234567',
    rating: 5.0,
    trips: 312,
  },
  {
    name: 'Pradeep Kumara',
    specialty: 'Hill Country & Tea Estates',
    region: 'Nuwara Eliya · Ella · Haputale',
    years: 6,
    languages: ['English', 'Sinhala', 'German (basic)'],
    bio: 'Pradeep navigates the serpentine hill roads with a calm that puts every passenger at ease. He knows every tea estate manager by name, which gets guests into places no tour group ever sees.',
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=400&auto=format&fit=crop',
    status: 'on-tour',
    availableFrom: 'March 28',
    whatsapp: '+94772345678',
    rating: 4.9,
    trips: 247,
  },
  {
    name: 'Thilanka Jayawardena',
    specialty: 'Southern Coast & Wildlife',
    region: 'Galle · Mirissa · Yala',
    years: 5,
    languages: ['English', 'Sinhala', 'French (basic)'],
    bio: 'Thilanka spotted a leopard on his first Yala safari as a driver. He\'s logged 41 leopard sightings since. The wildlife finds him — guests say it feels like he\'s on speaking terms with the jungle.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    status: 'available',
    whatsapp: '+94773456789',
    rating: 5.0,
    trips: 189,
  },
  {
    name: 'Saman Wijesuriya',
    specialty: 'Airport Transfers & Colombo',
    region: 'Colombo · Negombo · BIA',
    years: 10,
    languages: ['English', 'Sinhala', 'Japanese (conversational)'],
    bio: 'Saman has met every type of traveller — the nervous first-timer at 3am, the seasoned executive who needs silence, the family who\'ve been in the air for 18 hours. He reads the room instantly and adapts.',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    status: 'available',
    whatsapp: '+94774567890',
    rating: 4.9,
    trips: 534,
  },
];

/* ─── Values ─────────────────────────────────────────────────── */
const VALUES = [
  {
    letter: 'H',
    word: 'Honesty',
    Icon: Shield,
    desc: 'Fixed prices before you book. No surprises at the end of a trip. You see exactly what you\'re paying for — and why.',
  },
  {
    letter: 'C',
    word: 'Care',
    Icon: Heart,
    desc: 'The best drivers don\'t just get you from A to B. They notice when you\'re tired, when you\'re hungry, and when you just need to stop and breathe.',
  },
  {
    letter: 'R',
    word: 'Roots',
    Icon: Leaf,
    desc: 'We employ local. We spend local. Every booking strengthens a family in the community we operate in — not a shareholder across the world.',
  },
  {
    letter: 'P',
    word: 'People',
    Icon: Users,
    desc: 'Technology is a tool, not the product. The product is a human being who shows up on time, smiles, and changes how you see a country.',
  },
];

/* ─── Timeline ───────────────────────────────────────────────── */
const TIMELINE = [
  { year: '2019', event: 'Founded', detail: 'One van, two drivers, and a website built over a weekend in Kandy.' },
  { year: '2020', event: 'Survived', detail: 'Tourism collapsed. We retrained our drivers and waited. Every guest who\'d been with us before came back first.' },
  { year: '2021', event: 'Rebuilt', detail: 'Sri Lanka reopened. We launched online booking and grew from 4 to 18 drivers in eight months.' },
  { year: '2022', event: 'Expanded', detail: 'Custom itinerary tool launched. 400+ trips completed. First TripAdvisor #1 ranking achieved.' },
  { year: '2023', event: 'Recognised', detail: '1,200 verified reviews. Named one of Asia\'s top boutique travel operators by Lonely Planet.' },
  { year: '2024', event: 'Growing', detail: '40 drivers, 47 countries represented in guest list, and still the same WhatsApp number for support.' },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function About() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF7F2] overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          HERO — full height, dark, parallax
      ══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img
            src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df064c0a6b469e5a7164_Screenshot%202026-02-09%20at%203.56.00%E2%80%AFPM.png"
            alt="Sri Lanka landscape"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-[#0C2421]/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C2421]/40 via-transparent to-[#0C2421]/80" />
        </motion.div>

        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />

        <motion.div
          className="relative z-10 w-full"
          style={{ opacity: heroOpacity }}
        >
          <Container>
            <div className="max-w-4xl">
              {/* Chapter tag */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-10"
              >
                <div className="h-px w-10 bg-amber-200" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200">Our Story</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1, ease }}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-normal text-white leading-[1.03] mb-8"
              >
                A different kind{' '}
                <br />
                of travel{' '}
                <em className="italic text-amber-200">company.</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.25, ease }}
                className="text-xl text-white/60 leading-relaxed max-w-xl font-light"
              >
                We started with one van and a conviction that the driver is never just a driver.
                He is the guide, the storyteller, the reason the trip becomes unforgettable.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease }}
                className="flex flex-wrap gap-6 mt-12"
              >
                {[
                  { n: '2019', l: 'Founded in Kandy' },
                  { n: '40+', l: 'Driver-Guides' },
                  { n: '47', l: 'Guest Countries' },
                ].map(({ n, l }) => (
                  <div key={l}>
                    <p className="font-display text-4xl font-normal text-white">{n}</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{l}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </Container>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ABOUT INTRO — word-by-word reveal + spread cards
      ══════════════════════════════════════════════════════════ */}
      <StoryIntroSection />
      <SpreadCardsSection />

      {/* ══════════════════════════════════════════════════════════
          CHAPTER 01 — The Origin
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] pt-28 pb-20">
        <Container>
          {/* Chapter marker */}
          <Reveal className="flex items-baseline gap-5 mb-16">
            <span className="font-display text-[120px] md:text-[180px] font-normal text-[#0C2421]/6 leading-none select-none -mb-10">
              01
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 mb-1">Chapter One</p>
              <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421]">
                Where it <em className="italic">began</em>
              </h2>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Story text */}
            <div className="lg:col-span-5">
              <StaggerReveal className="space-y-6">
                {[
                  'In 2019, Arjun Perera — a former hospitality manager from Kandy — quit his resort job to solve a problem he\'d watched frustrate tourists for years: the mismatch between what a Sri Lanka journey could be, and what most visitors actually experienced.',
                  'Too many tourists were shuttled between sites by silent drivers who saw the job as cargo logistics. Arjun believed that the driver was the experience — the living, breathing, knowing interpreter of everything a visitor was seeing through the window.',
                  'So he recruited six drivers who shared that belief, built a simple website, and started picking people up from the airport with a handwritten sign and a genuine smile. Word spread faster than the van could keep up.',
                  'Five years later, Peacock Drivers has 40 vetted driver-guides, a custom booking platform, and reviews in 24 languages. But every WhatsApp message still goes to a real person. Every driver still gets trained personally. And every trip still starts with the same question Arjun asked in 2019: what would make this guest feel genuinely cared for?',
                ].map((p, i) => (
                  <motion.p
                    key={i}
                    variants={fadeUp}
                    className="text-[16px] text-warm-600 leading-[1.8]"
                  >
                    {p}
                  </motion.p>
                ))}
              </StaggerReveal>
            </div>

            {/* Photo collage */}
            <div className="lg:col-span-7">
              <Reveal className="relative h-[560px]">
                {/* Large photo */}
                <div className="absolute top-0 left-0 right-16 bottom-16 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df099e7a4a0b5ecbcd53_Screenshot%202026-02-09%20at%203.57.01%E2%80%AFPM.png"
                    alt="Sri Lanka road"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C2421]/40 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60">Ella, 2019</p>
                    <p className="text-white font-display text-lg italic">First official booking</p>
                  </div>
                </div>
                {/* Overlapping smaller photo */}
                <div className="absolute bottom-0 right-0 w-56 h-48 rounded-2xl overflow-hidden shadow-xl ring-4 ring-[#FAF7F2]">
                  <img
                    src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989c9da9422f8c13806555f_Screenshot%202026-02-09%20at%204.49.15%E2%80%AFPM.png"
                    alt="Driver with guests"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Tag */}
                <div className="absolute top-6 right-6 bg-[#0C2421] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                  Est. 2019
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MANIFESTO — full-width typographic statement
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0C2421] py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />
        {/* Decorative large quote mark */}
        <div className="absolute -top-10 -left-10 font-display text-[300px] text-white/[0.03] leading-none select-none pointer-events-none">
          "
        </div>

        <Container className="relative z-10">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-200 mb-8">Our mission</p>
            <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[1.2] max-w-5xl font-normal">
              <em className="italic text-amber-200 not-italic">"</em>
              We believe travel is not about ticking off sites. It is about the moment a stranger becomes a guide, a road becomes a story, and a country becomes{' '}
              <em className="italic text-amber-200">home for a while.</em>
              <em className="italic text-amber-200 not-italic">"</em>
            </blockquote>
            <div className="flex items-center gap-4 mt-10">
              <div className="h-px w-12 bg-amber-200/50" />
              <p className="text-sm text-white/50 font-bold">Arjun Perera, Co-Founder</p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CHAPTER 02 — Timeline
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32 border-t border-warm-100">
        <Container>
          <Reveal className="flex items-baseline gap-5 mb-16">
            <span className="font-display text-[120px] md:text-[180px] font-normal text-[#0C2421]/6 leading-none select-none -mb-10">
              02
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 mb-1">Chapter Two</p>
              <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421]">
                Five years,{' '}
                <em className="italic">one road</em>
              </h2>
            </div>
          </Reveal>

          <StaggerReveal className="relative" delay={0.1}>
            {/* Vertical line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-px bg-warm-200 hidden md:block" />

            <div className="space-y-0">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  variants={fadeUp}
                  className="grid md:grid-cols-[48px_140px_1fr] gap-x-8 gap-y-2 items-start py-7 border-b border-warm-100 last:border-0 group"
                >
                  {/* Dot */}
                  <div className="hidden md:flex items-center justify-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-[#14524C] ring-4 ring-white ring-offset-0 group-hover:bg-amber-200 transition-colors duration-300 z-10" />
                  </div>
                  {/* Year */}
                  <div>
                    <span className="font-display text-3xl font-normal text-[#0C2421]">{item.year}</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-200 mt-0.5">{item.event}</p>
                  </div>
                  {/* Detail */}
                  <p className="text-[15px] text-warm-500 leading-relaxed max-w-xl md:pt-1">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </StaggerReveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CHAPTER 03 — Values
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] py-24 md:py-32 border-t border-warm-100">
        <Container>
          <Reveal className="flex items-baseline gap-5 mb-16">
            <span className="font-display text-[120px] md:text-[180px] font-normal text-[#0C2421]/6 leading-none select-none -mb-10">
              03
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 mb-1">Chapter Three</p>
              <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421]">
                What we{' '}
                <em className="italic">stand for</em>
              </h2>
            </div>
          </Reveal>

          <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" delay={0.1}>
            {VALUES.map(({ letter, word, Icon, desc }) => (
              <motion.div
                key={word}
                variants={fadeUp}
                className="group relative bg-white rounded-3xl p-7 border border-warm-100 hover:border-forest-200 hover:shadow-sm transition-all duration-300 overflow-hidden"
              >
                {/* Giant background letter */}
                <div className="absolute -bottom-4 -right-2 font-display text-[100px] font-normal text-[#0C2421]/5 leading-none select-none pointer-events-none group-hover:text-[#0C2421]/8 transition-colors">
                  {letter}
                </div>

                <div className="w-12 h-12 rounded-2xl bg-[#CCFFDE] flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#14524C]" />
                </div>
                <h3 className="font-display text-2xl font-normal text-[#0C2421] mb-3">{word}</h3>
                <p className="text-[14px] text-warm-500 leading-relaxed relative z-10">{desc}</p>
              </motion.div>
            ))}
          </StaggerReveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CHAPTER 04 — Leadership Team
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 md:py-32 border-t border-warm-100">
        <Container>
          <Reveal className="flex items-baseline gap-5 mb-6">
            <span className="font-display text-[120px] md:text-[180px] font-normal text-[#0C2421]/6 leading-none select-none -mb-10">
              04
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 mb-1">Chapter Four</p>
              <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421]">
                The people{' '}
                <em className="italic">behind it</em>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mb-14">
            <p className="text-[16px] text-warm-500 leading-relaxed max-w-xl ml-0 md:ml-[calc(120px+20px)]">
              Small by design. Every person on this team owns what they do and answers directly to the guests they serve.
            </p>
          </Reveal>

          <StaggerReveal className="grid md:grid-cols-3 gap-6" delay={0.12}>
            {LEADERSHIP.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="group relative bg-[#FAF7F2] rounded-3xl overflow-hidden border border-warm-100 hover:shadow-md transition-all duration-400"
              >
                {/* Photo */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover object-top scale-105 group-hover:scale-100 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C2421]/80 via-[#0C2421]/10 to-transparent" />
                  {/* Tag */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-amber-200 text-[10px] font-black uppercase tracking-widest text-[#0C2421]">
                    {member.tag}
                  </div>
                  {/* Name overlay */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="font-display text-2xl font-normal text-white leading-tight">{member.name}</h3>
                    <p className="text-xs text-white/60 mt-0.5 uppercase tracking-wider">{member.role}</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="p-6">
                  <div className="flex items-center gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-warm-400" />
                    <span className="text-xs text-warm-400">{member.origin}</span>
                  </div>
                  <p className="text-[14px] text-warm-500 leading-relaxed mb-5">{member.bio}</p>

                  {/* Contact */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-warm-100">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-warm-200 text-xs font-semibold text-warm-600 hover:border-forest-300 hover:text-forest-600 transition-colors"
                      >
                        <Mail className="w-3 h-3" /> Email
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-warm-200 text-xs font-semibold text-warm-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-warm-200 text-xs font-semibold text-warm-600 hover:border-pink-300 hover:text-pink-600 transition-colors"
                      >
                        <Instagram className="w-3 h-3" /> Instagram
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerReveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CHAPTER 05 — Driver Roster
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0C2421] py-24 md:py-32">
        <Container>
          {/* Header */}
          <Reveal className="mb-16">
            <div className="flex items-baseline gap-5">
              <span className="font-display text-[120px] md:text-[180px] font-normal text-white/5 leading-none select-none -mb-10">
                05
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 mb-1">Chapter Five</p>
                <h2 className="font-display text-4xl md:text-5xl font-normal text-white">
                  Meet your{' '}
                  <em className="italic text-amber-200">driver-guides</em>
                </h2>
              </div>
            </div>
            <p className="text-[16px] text-white/45 leading-relaxed max-w-xl mt-6 ml-0 md:ml-[calc(120px+20px)]">
              Every driver below has been personally vetted by Arjun, trained in guest hospitality, and reviewed by real guests. They are not contractors — they are the product.
            </p>
          </Reveal>

          <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" delay={0.1}>
            {DRIVERS.map((driver) => (
              <motion.div
                key={driver.name}
                variants={fadeUp}
                className="group flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/8 transition-all duration-300"
              >
                {/* Photo */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={driver.photo}
                    alt={driver.name}
                    className="w-full h-full object-cover object-top scale-105 group-hover:scale-100 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C2421] via-[#0C2421]/30 to-transparent" />

                  {/* Availability badge */}
                  <div className="absolute top-4 right-4">
                    {driver.status === 'available' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/15 border border-amber-200/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                          {driver.availableFrom ? `From ${driver.availableFrom}` : 'On Tour'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                    <span className="text-sm font-bold text-white">{driver.rating}</span>
                    <span className="text-xs text-white/40">({driver.trips} trips)</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 p-5 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-display text-lg font-normal text-white leading-tight">{driver.name}</h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200 mt-0.5">{driver.specialty}</p>
                  </div>

                  <div className="flex items-start gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                    <p className="text-xs text-white/40 leading-relaxed">{driver.region}</p>
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {driver.languages.map(l => (
                      <span key={l} className="px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-[10px] text-white/50 font-medium">
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* Expandable bio */}
                  <div
                    className={cn(
                      'text-[13px] text-white/45 leading-relaxed mb-4 overflow-hidden transition-all duration-400',
                      expandedDriver === driver.name ? 'max-h-40' : 'max-h-0',
                    )}
                  >
                    {driver.bio}
                  </div>

                  <button
                    onClick={() => setExpandedDriver(prev => prev === driver.name ? null : driver.name)}
                    className="text-[11px] font-bold uppercase tracking-widest text-white/30 hover:text-amber-200 transition-colors mb-4 flex items-center gap-1 cursor-pointer"
                  >
                    {expandedDriver === driver.name ? 'Less' : 'Read bio'}
                    <ChevronRight className={cn('w-3 h-3 transition-transform', expandedDriver === driver.name && 'rotate-90')} />
                  </button>

                  {/* Experience bar */}
                  <div className="mb-5">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Experience</span>
                      <span className="text-[10px] font-bold text-white/50">{driver.years} yrs</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-amber-200"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(driver.years * 10, 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease }}
                      />
                    </div>
                  </div>

                  {/* WhatsApp contact */}
                  <a
                    href={`https://wa.me/${driver.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'mt-auto flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-200',
                      driver.status === 'available'
                        ? 'bg-emerald-500/20 border border-emerald-400/25 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-white/5 border border-white/10 text-white/35 cursor-not-allowed',
                    )}
                    onClick={driver.status !== 'available' ? e => e.preventDefault() : undefined}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {driver.status === 'available' ? 'WhatsApp' : `On tour · ${driver.availableFrom ?? ''}`}
                  </a>
                </div>
              </motion.div>
            ))}
          </StaggerReveal>

          {/* View all drivers CTA */}
          <Reveal delay={0.3} className="text-center mt-12">
            <Link href="/tours">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 h-13 border-white/15 text-white hover:bg-white/10 hover:border-white/30 bg-transparent font-bold gap-2"
              >
                All 40+ driver-guides <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PLEDGE — community & environment
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] py-24 md:py-32 border-t border-warm-100">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <Reveal>
              <div className="relative h-80 md:h-[480px] rounded-3xl overflow-hidden shadow-xl">
                <img
                  src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df2274d427fd46cdd3f3_Screenshot%202026-02-09%20at%203.55.33%E2%80%AFPM.png"
                  alt="Sri Lanka community"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C2421]/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-4">
                    <p className="text-white font-display text-lg italic">
                      "Every road on this island was built by someone's grandfather. We owe them a decent living."
                    </p>
                    <p className="text-white/50 text-xs mt-2">— Arjun Perera</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Pledge content */}
            <div>
              <Reveal>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200 mb-4">Our commitment</p>
                <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421] leading-[1.1] mb-6">
                  Sri Lanka{' '}
                  <em className="italic">gives us everything.</em>
                  <br />We give back.
                </h2>
                <p className="text-[16px] text-warm-500 leading-relaxed mb-8">
                  Every driver earns above the national average. 5% of all booking revenue goes directly to the Peacock Community Fund — which has funded three rural school repair projects and an English literacy programme for young drivers.
                </p>
              </Reveal>

              <StaggerReveal className="space-y-4" delay={0.1}>
                {[
                  { Icon: CheckCircle2, text: '100% Sri Lankan-employed drivers — no foreign agencies' },
                  { Icon: Leaf, text: 'Carbon offset partnership with Trees for Sri Lanka' },
                  { Icon: Users, text: 'Community fund active since 2021, 3 projects completed' },
                  { Icon: Heart, text: 'Every driver has health insurance — an industry first here' },
                ].map(({ Icon, text }) => (
                  <motion.div key={text} variants={fadeUp} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#CCFFDE] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#14524C]" />
                    </div>
                    <p className="text-[15px] text-warm-600 leading-relaxed">{text}</p>
                  </motion.div>
                ))}
              </StaggerReveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA — final chapter
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0C2421] py-28 md:py-40 overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989df190501fea92245c727_Screenshot%202026-02-09%20at%203.55.06%E2%80%AFPM.png"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[#0C2421]/60" />
        </div>
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />

        <Container className="relative z-10 text-center">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-200 mb-6">The next chapter</p>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal text-white leading-[1.05] mb-6">
              Come write yours{' '}
              <em className="italic text-amber-200">with us.</em>
            </h2>
            <p className="text-lg text-white/50 max-w-md mx-auto mb-12 leading-relaxed">
              Every trip is someone's story. We'd like to help you with yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tours">
                <Button
                  size="lg"
                  className="rounded-full px-10 h-14 text-base font-bold gap-2 bg-amber-200 hover:bg-amber-300 text-[#0C2421]"
                >
                  Start planning <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/reviews">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-10 h-14 text-base font-bold gap-2 border-white/15 text-white hover:bg-white/10 hover:border-white/30 bg-transparent"
                >
                  Read guest stories <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
