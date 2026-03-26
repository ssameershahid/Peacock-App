import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from 'framer-motion';
import {
  Star, Quote, MapPin, ArrowRight, Globe, Users, Calendar,
  ShieldCheck, Verified, Award, ExternalLink, ChevronRight, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/peacock/Container';
import { cn } from '@/lib/utils';
import MarqueeTestimonials from '@/components/peacock/MarqueeTestimonials';

/* ─── Types ──────────────────────────────────────────────────── */
interface ReviewEntry {
  id: string;
  author: string;
  origin: string;
  flag: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
  itinerary: string;
  tripLength: string;
  travelerType: string;
  highlight?: string; // optional pullquote excerpt
}

/* ─── Extended Reviews ───────────────────────────────────────── */
const ALL_REVIEWS: ReviewEntry[] = [
  {
    id: 'r1',
    author: 'Sarah Jenkins',
    origin: 'London, UK',
    flag: '🇬🇧',
    rating: 5,
    date: 'Oct 2023',
    text: 'Our driver was incredibly professional. The car was spotless, and he knew all the best hidden spots in Ella that weren\'t on any blogs. We felt safe and pampered the entire time. A truly once-in-a-lifetime experience that we\'ll be recommending to everyone.',
    highlight: 'He knew all the best hidden spots in Ella that weren\'t on any blogs.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Cultural Triangle Odyssey',
    tripLength: '10 Days',
    travelerType: 'Couple',
  },
  {
    id: 'r2',
    author: 'Michael Chen',
    origin: 'Singapore',
    flag: '🇸🇬',
    rating: 5,
    date: 'Sep 2023',
    text: 'Seamless booking process. The KDH van was perfect for our family of 6. Comfortable driving through the winding hill country roads is no easy feat, but our driver handled it perfectly. Kids loved every moment.',
    highlight: 'The KDH van was perfect for our family of 6.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Hill Country Tea Trails',
    tripLength: '7 Days',
    travelerType: 'Family',
  },
  {
    id: 'r3',
    author: 'Emma & Tom',
    origin: 'Melbourne, AU',
    flag: '🇦🇺',
    rating: 5,
    date: 'Nov 2023',
    text: 'We customized our own itinerary and the team was very accommodating with last-minute changes when we decided to stay an extra night in Mirissa. The flexibility was a game changer for our honeymoon.',
    highlight: 'The flexibility was a game changer for our honeymoon.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Custom South Coast Trip',
    tripLength: '14 Days',
    travelerType: 'Honeymoon',
  },
  {
    id: 'r4',
    author: 'Priya Nair',
    origin: 'Mumbai, India',
    flag: '🇮🇳',
    rating: 5,
    date: 'Dec 2023',
    text: 'From airport pickup to our final drop-off, every moment was handled with care and professionalism. Our driver Rajan became like a family member by day three. He knew exactly when to talk and when to let the silence of the landscape speak for itself.',
    highlight: 'Our driver Rajan became like a family member by day three.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Golden Triangle Tour',
    tripLength: '8 Days',
    travelerType: 'Family',
  },
  {
    id: 'r5',
    author: 'James Whitmore',
    origin: 'Toronto, Canada',
    flag: '🇨🇦',
    rating: 5,
    date: 'Jan 2024',
    text: 'I was traveling solo and wasn\'t sure if a private driver made sense financially. It absolutely did. The peace of mind, the insider stops, the stories — you cannot put a price on this kind of local knowledge.',
    highlight: 'You cannot put a price on this kind of local knowledge.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Island Explorer Solo',
    tripLength: '12 Days',
    travelerType: 'Solo',
  },
  {
    id: 'r6',
    author: 'Léa Fontaine',
    origin: 'Paris, France',
    flag: '🇫🇷',
    rating: 5,
    date: 'Feb 2024',
    text: 'Très professionnel. The transfer from Colombo to Galle was immaculate — clean vehicle, punctual driver, and he even stopped at a local gem for breakfast that I would never have found on my own.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Airport to Galle Transfer',
    tripLength: '1 Day',
    travelerType: 'Solo',
  },
  {
    id: 'r7',
    author: 'The Andersson Family',
    origin: 'Stockholm, Sweden',
    flag: '🇸🇪',
    rating: 5,
    date: 'Dec 2023',
    text: 'Four adults, one teenager, and a toddler — and not a single complaint from anyone in the vehicle. That is a miracle. Our driver was patient, kind with our little one, and endlessly knowledgeable about everything we passed.',
    highlight: 'Not a single complaint from anyone. That is a miracle.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Sri Lanka Family Journey',
    tripLength: '10 Days',
    travelerType: 'Family',
  },
  {
    id: 'r8',
    author: 'David & Aisha Powell',
    origin: 'New York, USA',
    flag: '🇺🇸',
    rating: 5,
    date: 'Mar 2024',
    text: 'We had used private drivers in Thailand and Bali before, but Peacock is on a different level. The app experience, the communication, the actual driver — every piece is polished. Our honeymoon was exactly what we dreamed of.',
    highlight: 'Peacock is on a different level. Every piece is polished.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Southern Coast Honeymoon',
    tripLength: '9 Days',
    travelerType: 'Honeymoon',
  },
  {
    id: 'r9',
    author: 'Klaus Bauer',
    origin: 'Munich, Germany',
    flag: '🇩🇪',
    rating: 5,
    date: 'Jan 2024',
    text: 'Very organised. I appreciated that the booking confirmed instantly with clear details about the driver. No vague promises. Exactly what was described. Germans appreciate reliability, and this delivered.',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=200&auto=format&fit=crop',
    itinerary: 'North & East Explorer',
    tripLength: '6 Days',
    travelerType: 'Couple',
  },
  {
    id: 'r10',
    author: 'Yuki Tanaka',
    origin: 'Tokyo, Japan',
    flag: '🇯🇵',
    rating: 5,
    date: 'Feb 2024',
    text: 'My driver spoke softly, drove smoothly, and always had cold water ready. Small things that made a huge difference in 35-degree heat. The Sigiriya climb was terrifying — but he waited patiently and with a smile.',
    highlight: 'Small things that made a huge difference in 35-degree heat.',
    avatar: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Ancient Cities Circuit',
    tripLength: '5 Days',
    travelerType: 'Solo',
  },
  {
    id: 'r11',
    author: 'Chloe Martins',
    origin: 'São Paulo, Brazil',
    flag: '🇧🇷',
    rating: 5,
    date: 'Nov 2023',
    text: 'I was nervous booking something this substantial online, but every step reassured me. The WhatsApp support is real people, not bots. That alone made me trust the whole experience.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Coastal Highlights Tour',
    tripLength: '7 Days',
    travelerType: 'Solo',
  },
  {
    id: 'r12',
    author: 'Oliver & Grace Bennett',
    origin: 'Edinburgh, UK',
    flag: '🇬🇧',
    rating: 5,
    date: 'Oct 2023',
    text: 'Grace has mobility challenges and we were worried about accessibility. Our driver was extraordinarily thoughtful — helping at every stop without making her feel like a burden. He transformed what could have been a stressful trip into a joyful adventure.',
    highlight: 'He transformed what could have been a stressful trip into a joyful adventure.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    itinerary: 'Gentle Sri Lanka Circuit',
    tripLength: '11 Days',
    travelerType: 'Couple',
  },
];

/* ─── Marquee-compatible format ──────────────────────────────── */
const marqueeReviews = ALL_REVIEWS.map(r => ({
  id: r.id,
  author: r.author,
  origin: r.origin,
  rating: r.rating,
  date: r.date,
  text: r.text,
  avatar: r.avatar,
  itineraryName: r.itinerary,
  tripLength: r.tripLength,
  travelerType: r.travelerType,
}));

/* ─── Animation helpers ──────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const stagger = (delay = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

/* ─── Stars ──────────────────────────────────────────────────── */
function Stars({ count = 5, size = 'sm' }: { count?: number; size?: 'xs' | 'sm' | 'md' }) {
  const sz = size === 'xs' ? 'h-3 w-3' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className={cn(sz, 'fill-amber-400 text-amber-400')} />
      ))}
    </div>
  );
}

/* ─── Animated count-up ──────────────────────────────────────── */
function CountUp({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const val = useMotionValue(0);
  const display = useTransform(val, v => v.toFixed(decimals));

  useEffect(() => {
    if (inView) animate(val, to, { duration: 2, ease: 'easeOut' });
  }, [inView, to, val]);

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>{suffix}
    </span>
  );
}

/* ─── Review card — "cinematic" (dark, large, photo-half) ────── */
function CinematicCard({ review }: { review: ReviewEntry }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-[#0C2421] h-full min-h-[400px] flex flex-col">
      {/* Photo strip top */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={review.avatar}
          alt={review.author}
          className="w-full h-full object-cover object-top scale-110 group-hover:scale-100 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0C2421]" />
        <div className="absolute top-4 left-4">
          <Stars size="sm" />
        </div>
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#CCFFDE]/20 border border-[#CCFFDE]/30">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#CCFFDE]">
            Verified
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <p className="font-display text-lg text-white/90 leading-relaxed mb-4 italic">
            "{review.text.slice(0, 160)}{review.text.length > 160 ? '…' : ''}"
          </p>
        </div>
        <div className="pt-4 border-t border-white/10">
          <p className="font-bold text-white text-sm">{review.author}</p>
          <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" /> {review.origin} · {review.date}
          </p>
          <p className="text-xs text-[#E8A825] mt-2 font-semibold">{review.itinerary}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Review card — "editorial" (cream, large quote) ─────────── */
function EditorialCard({ review, accent = false }: { review: ReviewEntry; accent?: boolean }) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl p-7 h-full flex flex-col justify-between',
        accent ? 'bg-[#CCFFDE]' : 'bg-white border border-warm-100',
      )}
    >
      {/* Decorative quote mark */}
      <div
        className="absolute top-4 right-6 font-display text-[120px] leading-none select-none pointer-events-none opacity-10"
        style={{ color: accent ? '#0C2421' : '#14524C', lineHeight: 1 }}
      >
        "
      </div>

      <div className="relative z-10">
        <Stars size="sm" />
        <p
          className={cn(
            'font-display text-xl md:text-2xl leading-relaxed mt-4 mb-6',
            accent ? 'text-[#0C2421]' : 'text-[#0C2421]',
          )}
        >
          "{review.text.slice(0, 220)}{review.text.length > 220 ? '…' : ''}"
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-3 pt-4 border-t border-black/8">
        <img
          src={review.avatar}
          alt={review.author}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#0C2421] truncate">{review.author}</p>
          <p className="text-xs text-warm-400 flex items-center gap-1 truncate">
            {review.flag} {review.origin}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#14524C]">{review.tripLength}</p>
          <p className="text-[10px] text-warm-400">{review.travelerType}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Review card — "compact" (small, list-like) ─────────────── */
function CompactCard({ review }: { review: ReviewEntry }) {
  return (
    <div className="group flex gap-4 p-5 rounded-2xl bg-[#FAF7F2] border border-warm-100 hover:border-warm-200 hover:shadow-sm transition-all duration-200">
      <img
        src={review.avatar}
        alt={review.author}
        className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-white group-hover:ring-amber-200 transition-all"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Stars size="xs" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-warm-400">{review.date}</span>
        </div>
        <p className="text-[13px] text-[#0C2421] leading-relaxed line-clamp-3 italic font-display">
          "{review.text}"
        </p>
        <p className="text-xs font-bold text-[#14524C] mt-2 truncate">
          {review.author} · <span className="font-normal text-warm-400">{review.origin}</span>
        </p>
      </div>
    </div>
  );
}

/* ─── Pull-quote card (typographic, no photo) ────────────────── */
function PullQuote({ text, author, origin }: { text: string; author: string; origin: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease }}
      className="py-16 md:py-20 border-b border-warm-100 last:border-0"
    >
      <div className="max-w-4xl">
        <div className="font-display text-5xl md:text-6xl lg:text-7xl text-[#0C2421] leading-[1.08] mb-8">
          <span className="text-[#E8A825]">"</span>
          {text}
          <span className="text-[#E8A825]">"</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-[#E8A825]" />
          <span className="text-sm font-bold text-[#0C2421]">{author}</span>
          <span className="text-sm text-warm-400">{origin}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Platform trust badge ───────────────────────────────────── */
function PlatformBadge({
  name, rating, count, color, icon,
}: {
  name: string; rating: string; count: string; color: string; icon: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-white border border-warm-100 hover:shadow-sm transition-shadow">
      <span className="text-2xl">{icon}</span>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-warm-400">{name}</p>
        <p className="font-display text-3xl font-normal text-[#0C2421] mt-0.5">{rating}</p>
        <div className="flex justify-center mt-1">
          <Stars size="xs" />
        </div>
        <p className="text-xs text-warm-400 mt-1">{count} reviews</p>
      </div>
    </div>
  );
}

/* ─── Section wrapper with scroll reveal ─────────────────────── */
function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger()}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function Reviews() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const filters = ['All', 'Couple', 'Family', 'Honeymoon', 'Solo'];
  const filtered =
    activeFilter === 'All'
      ? ALL_REVIEWS
      : ALL_REVIEWS.filter(r => r.travelerType === activeFilter);

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });

  /* rotating featured review in hero */
  const [featuredIdx, setFeaturedIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFeaturedIdx(i => (i + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  const featured = ALL_REVIEWS[featuredIdx];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* ══════════════════════════════════════════════════════════
          HERO — dark cinematic, rotating testimonial
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative bg-[#0C2421] overflow-hidden pt-36 pb-0"
      >
        {/* Ambient orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-forest-600/20 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/8 translate-y-1/2 blur-3xl pointer-events-none" />

        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <Container className="relative z-10">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-white/50 font-bold uppercase tracking-[0.18em]">
              Guest Stories
            </span>
          </motion.div>

          {/* Main headline */}
          <div className="grid lg:grid-cols-2 gap-16 items-end pb-16">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.08, ease }}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-normal text-white leading-[1.04] mb-6"
              >
                Real trips.{' '}
                <br />
                <em className="italic text-amber-400">Real people.</em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.2, ease }}
                className="text-lg text-white/55 leading-relaxed max-w-md mb-10"
              >
                Over 2,400 verified guests have shared their Peacock Drivers experiences.
                Here's what they said — unfiltered.
              </motion.p>

              {/* Mini stats row */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32, ease }}
                className="flex flex-wrap gap-6"
              >
                {[
                  { val: '4.9', label: 'Average rating', suffix: '' },
                  { val: '2,400+', label: 'Reviews', suffix: '' },
                  { val: '47', label: 'Countries', suffix: '+' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="font-display text-3xl font-normal text-white">{val}</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Rotating featured card */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease }}
              className="relative"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={featured.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.55, ease }}
                  className="bg-white/8 border border-white/12 backdrop-blur-xl rounded-3xl p-8"
                >
                  {/* Large quote */}
                  <div className="font-display text-6xl text-amber-400/40 leading-none select-none mb-2">"</div>
                  <p className="font-display text-xl md:text-2xl text-white/90 leading-relaxed mb-6 italic">
                    {featured.highlight || featured.text.slice(0, 140)}
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={featured.avatar}
                      alt={featured.author}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/30"
                    />
                    <div>
                      <p className="font-bold text-white text-sm">{featured.author}</p>
                      <p className="text-xs text-white/40">
                        {featured.flag} {featured.origin} · {featured.itinerary}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Stars size="sm" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => setFeaturedIdx(i)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      i === featuredIdx ? 'bg-amber-400 w-6' : 'bg-white/20',
                    )}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </Container>

        {/* Wave */}
        <div className="relative -mb-px">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: 80 }}>
            <path d="M0 80L1440 80L1440 32C1100 72 900 8 600 32C300 56 150 12 0 32Z" fill="#FAF7F2" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ANIMATED STATS ROW
      ══════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="bg-[#FAF7F2] py-20">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-warm-200">
            {[
              { num: 4.9, decimals: 1, suffix: '', label: 'Average Star Rating', sub: 'Across all platforms' },
              { num: 2400, decimals: 0, suffix: '+', label: 'Verified Reviews', sub: 'Every one is real' },
              { num: 47, decimals: 0, suffix: '', label: 'Countries Represented', sub: 'Global guests' },
              { num: 98, decimals: 0, suffix: '%', label: 'Would Recommend', sub: 'Friends & family' },
            ].map(({ num, decimals, suffix, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.12, ease }}
                className="text-center px-6"
              >
                <div className="font-display text-5xl md:text-6xl font-normal text-[#0C2421] mb-1">
                  <CountUp to={num} decimals={decimals} suffix={suffix} />
                </div>
                <p className="text-sm font-bold text-[#14524C] mb-0.5">{label}</p>
                <p className="text-xs text-warm-400">{sub}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PLATFORM TRUST BAR
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-b border-warm-100 py-12">
        <Container>
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-warm-400 mb-8">
            Also recognised on
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Google', rating: '4.9', count: '1,240', icon: '🔵' },
              { name: 'TripAdvisor', rating: '5.0', count: '680', icon: '🦉' },
              { name: 'Trustpilot', rating: '4.8', count: '340', icon: '⭐' },
              { name: 'Booking.com', rating: '9.6', count: '190', icon: '🏨' },
            ].map(p => (
              <PlatformBadge key={p.name} {...p} color="#14524C" />
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          EDITORIAL MASONRY GRID
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] py-24 md:py-32">
        <Container>
          {/* Section heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-2 block">
                From the guest book
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421] leading-[1.1]">
                Every story,{' '}
                <em className="italic">genuinely told</em>
              </h2>
            </div>
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer',
                    activeFilter === f
                      ? 'bg-[#0C2421] text-white'
                      : 'bg-white border border-warm-200 text-warm-500 hover:border-warm-400',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Row 1: 2-col with large editorial left, compact stack right */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              variants={stagger(0.08)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              {filtered.length > 0 && (
                <>
                  {/* Row 1 */}
                  <div className="grid md:grid-cols-3 gap-5 mb-5">
                    {/* Large editorial card */}
                    <motion.div variants={fadeUp} className="md:col-span-2">
                      <EditorialCard review={filtered[0]} />
                    </motion.div>
                    {/* Cinematic card */}
                    <motion.div variants={fadeUp}>
                      <CinematicCard review={filtered[1] || filtered[0]} />
                    </motion.div>
                  </div>

                  {/* Row 2: 3 compact */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                    {filtered.slice(2, 5).map(r => (
                      <motion.div key={r.id} variants={fadeUp}>
                        <CompactCard review={r} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Row 3: accent editorial + 2 compact stack */}
                  {filtered.length > 5 && (
                    <div className="grid md:grid-cols-3 gap-5 mb-5">
                      <motion.div variants={fadeUp} className="md:col-span-1">
                        <EditorialCard review={filtered[5]} accent />
                      </motion.div>
                      <motion.div variants={fadeUp} className="md:col-span-2 grid sm:grid-cols-2 gap-5">
                        {filtered.slice(6, 8).map(r => (
                          <CinematicCard key={r.id} review={r} />
                        ))}
                      </motion.div>
                    </div>
                  )}

                  {/* Row 4: remaining compact */}
                  {filtered.length > 8 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {filtered.slice(8, 12).map(r => (
                        <motion.div key={r.id} variants={fadeUp}>
                          <CompactCard review={r} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {filtered.length === 0 && (
                <motion.div
                  variants={fadeUp}
                  className="text-center py-20 text-warm-400"
                >
                  No reviews in this category yet.
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PULL-QUOTE RIVER
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-warm-100 py-12 md:py-16">
        <Container>
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500 mb-2">
              In their own words
            </p>
            {[
              {
                text: 'He knew exactly when to talk and when to let the silence of the landscape speak for itself.',
                author: 'Priya Nair',
                origin: '🇮🇳 Mumbai, India',
              },
              {
                text: 'You cannot put a price on this kind of local knowledge.',
                author: 'James Whitmore',
                origin: '🇨🇦 Toronto, Canada',
              },
              {
                text: 'He transformed what could have been a stressful trip into a joyful adventure.',
                author: 'Oliver & Grace Bennett',
                origin: '🇬🇧 Edinburgh, UK',
              },
            ].map(q => (
              <PullQuote key={q.author} {...q} />
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MARQUEE (existing component, reused)
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] py-20 border-t border-warm-100 overflow-hidden">
        <Container>
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-warm-400 mb-2 block">
              More from our guests
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-normal text-[#0C2421]">
              The conversation{' '}
              <em className="italic">never stops</em>
            </h2>
          </div>
        </Container>
        <MarqueeTestimonials reviews={marqueeReviews as any} />
      </section>

      {/* ══════════════════════════════════════════════════════════
          GLOBAL REACH
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 border-t border-warm-100">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <RevealSection>
              <motion.div variants={fadeUp}>
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500 mb-3 block">
                  Our guests come from
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-normal text-[#0C2421] leading-[1.1] mb-6">
                  47 countries,{' '}
                  <em className="italic">one island</em>
                </h2>
                <p className="text-[16px] text-warm-500 leading-relaxed max-w-md">
                  From first-timers who found us by chance to seasoned Sri Lanka travellers who come back every year — our guests span the globe.
                </p>
              </motion.div>
            </RevealSection>

            <RevealSection className="grid grid-cols-1 gap-3">
              {[
                { flag: '🇬🇧', country: 'United Kingdom', pct: 24 },
                { flag: '🇦🇺', country: 'Australia', pct: 18 },
                { flag: '🇩🇪', country: 'Germany', pct: 14 },
                { flag: '🇺🇸', country: 'United States', pct: 12 },
                { flag: '🇸🇬', country: 'Singapore', pct: 8 },
                { flag: '🌍', country: 'Rest of world', pct: 24 },
              ].map(({ flag, country, pct }, i) => (
                <motion.div
                  key={country}
                  variants={fadeUp}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl w-7 text-center">{flag}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-[#0C2421]">{country}</span>
                      <span className="text-xs text-warm-400 font-bold">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-warm-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease }}
                        className="h-full rounded-full bg-[#14524C]"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </RevealSection>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TRUST SIGNALS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] py-20 border-t border-warm-100">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                Icon: ShieldCheck,
                title: '100% Verified Reviews',
                desc: 'Every testimonial comes from a confirmed booking. We never publish paid or anonymous reviews.',
              },
              {
                Icon: Award,
                title: 'TripAdvisor #1 Operator',
                desc: 'Recognised as the top private driver service in Sri Lanka for three consecutive years.',
              },
              {
                Icon: Globe,
                title: 'International Coverage',
                desc: 'Our guests speak 24 languages. Our drivers handle them all with warmth and professionalism.',
              },
            ].map(({ Icon, title, desc }, i) => (
              <RevealSection key={title}>
                <motion.div
                  variants={fadeUp}
                  className="p-7 rounded-3xl bg-white border border-warm-100 hover:shadow-sm transition-shadow"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#CCFFDE] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#14524C]" />
                  </div>
                  <h3 className="font-display text-xl font-normal text-[#0C2421] mb-2">{title}</h3>
                  <p className="text-[14px] text-warm-500 leading-relaxed">{desc}</p>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0C2421] py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-forest-600/20 blur-3xl pointer-events-none" />

        <Container className="relative z-10 text-center">
          <RevealSection>
            <motion.div variants={fadeUp}>
              <div className="flex justify-center mb-6">
                <Stars size="md" count={5} />
              </div>
              <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-6 leading-[1.06]">
                Ready to write{' '}
                <em className="italic text-amber-400">your story?</em>
              </h2>
              <p className="text-lg text-white/55 max-w-md mx-auto mb-10 leading-relaxed">
                Join 2,400+ guests who've experienced Sri Lanka the Peacock Drivers way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/tours">
                  <Button
                    size="lg"
                    className="rounded-full px-10 h-14 text-base font-bold gap-2 bg-amber-400 hover:bg-amber-300 text-[#0C2421]"
                  >
                    Browse tours <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-10 h-14 text-base font-bold gap-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 bg-transparent"
                  >
                    How it works <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </RevealSection>
        </Container>
      </section>
    </div>
  );
}
