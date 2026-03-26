import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Search, X, ChevronDown, Calendar, CreditCard, RotateCcw,
  Car, Users, Luggage, Wifi, Shield, MessageCircle, Mail,
  Phone, CheckCircle2, AlertCircle, Clock, ArrowRight,
  ThumbsUp, ThumbsDown, Zap, Star, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/peacock/Container';
import { cn } from '@/lib/utils';

/* ─── Ease ───────────────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

/* ─── Types ──────────────────────────────────────────────────── */
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tag?: string; // optional label like "Most asked"
}

interface FAQCategory {
  id: string;
  label: string;
  short: string;
  Icon: React.ElementType;
  color: string;        // accent colour
  colorLight: string;   // bg tint
  items: FAQItem[];
}

/* ─── Content ────────────────────────────────────────────────── */
const CATEGORIES: FAQCategory[] = [
  {
    id: 'booking',
    label: 'Booking Procedures',
    short: 'Booking',
    Icon: Calendar,
    color: '#14524C',
    colorLight: '#CCFFDE',
    items: [
      {
        id: 'b1',
        question: 'How do I make a booking?',
        answer: 'You can book in three ways: (1) Select a Ready-to-Go tour and follow the online checkout in under 5 minutes. (2) Use the Trip Wizard to build a custom route, which our team confirms within 24 hours. (3) Book a point-to-point transfer instantly — enter pickup and drop-off, choose your vehicle, and pay. All three flows issue an instant email confirmation.',
        tag: 'Most asked',
      },
      {
        id: 'b2',
        question: 'How far in advance should I book?',
        answer: 'Transfers can be booked same-day. For multi-day tours during peak season (December–March) we recommend booking at least 2–4 weeks ahead to guarantee your preferred dates and vehicle. Custom itineraries require 48 hours minimum for the team to confirm driver availability.',
      },
      {
        id: 'b3',
        question: 'Is every booking private — or do I share with other guests?',
        answer: 'Every single booking is 100% private. You get a dedicated vehicle and driver-guide exclusively for you and your travel companions — no strangers, no rigid group schedules, no forced stops.',
        tag: 'Popular',
      },
      {
        id: 'b4',
        question: 'Can I customise a Ready-to-Go tour?',
        answer: 'Yes. Every curated itinerary is a starting point, not a contract. You can swap stops, adjust daily pacing, add extra nights, or remove destinations you\'re less interested in. Contact us after booking and our team will adjust your itinerary accordingly.',
      },
      {
        id: 'b5',
        question: 'Do I need to create an account to book?',
        answer: 'No account is required to browse or enquire. However, creating a free account lets you save itineraries, track your booking status, download invoices, and message our team directly from your dashboard.',
      },
      {
        id: 'b6',
        question: 'Will I receive a booking confirmation?',
        answer: 'Yes — immediately. You\'ll receive a detailed confirmation email the moment your deposit clears, including your itinerary summary, driver contact details (for multi-day tours), vehicle information, pickup time and location, and our 24/7 support WhatsApp number.',
      },
      {
        id: 'b7',
        question: 'Can I book for a large group?',
        answer: 'Absolutely. We accommodate groups of all sizes. For parties larger than 14, we can arrange a convoy of vehicles with coordinated drivers. Contact us directly and we\'ll put together a group quote with a coordinated plan.',
      },
    ],
  },
  {
    id: 'payment',
    label: 'Payment & Pricing',
    short: 'Payment',
    Icon: CreditCard,
    color: '#E8A825',
    colorLight: '#FEF3C7',
    items: [
      {
        id: 'p1',
        question: 'What payment methods do you accept?',
        answer: 'Online deposits are accepted via all major credit and debit cards (Visa, Mastercard, American Express) through our Stripe-secured checkout. Remaining balances for tours can be settled in cash (USD, EUR, GBP, or Sri Lankan Rupees) directly with your driver on arrival, or via bank transfer arranged in advance.',
        tag: 'Most asked',
      },
      {
        id: 'p2',
        question: 'How does the deposit system work?',
        answer: 'For multi-day tours, you pay approximately 20–30% upfront as a deposit to secure your booking. The balance is paid to your driver on the first day of your trip. For transfers, the full amount is paid at checkout. No balance is ever charged automatically to your card.',
      },
      {
        id: 'p3',
        question: 'What\'s included in the tour price?',
        answer: 'Our daily rate is comprehensive: fuel, the driver\'s salary and tips, vehicle insurance, highway tolls, parking fees, and the driver\'s accommodation and meals. You only pay for your own accommodation, meals, personal shopping, and attraction entry tickets.',
      },
      {
        id: 'p4',
        question: 'Are there any hidden fees?',
        answer: 'None. The price you see is the price you pay for vehicle and driver costs. We list every included and excluded item clearly on each tour and transfer page. The only unexpected cost some guests encounter is tipping — which is entirely optional and at your discretion.',
      },
      {
        id: 'p5',
        question: 'Can I pay in my home currency?',
        answer: 'Our online checkout processes in USD by default, with automatic conversion for most major currencies. Your bank may apply its own conversion rate. Cash payments to drivers are accepted in USD, EUR, GBP, AUD, and Sri Lankan Rupees at current exchange rates.',
      },
      {
        id: 'p6',
        question: 'Do you offer discounts for longer trips?',
        answer: 'Yes — our per-day rate decreases on trips of 10 days or more. We also offer returning guest discounts and occasional seasonal promotions. Contact us with your dates and we\'ll provide a tailored quote.',
      },
      {
        id: 'p7',
        question: 'Can I get an invoice or receipt?',
        answer: 'A VAT-compliant invoice is generated automatically after each booking and available in your account dashboard. You can also request a PDF invoice by emailing billing@peacockdrivers.com with your booking reference.',
      },
    ],
  },
  {
    id: 'cancellation',
    label: 'Cancellations & Changes',
    short: 'Cancellations',
    Icon: RotateCcw,
    color: '#14524C',
    colorLight: '#CCFFDE',
    items: [
      {
        id: 'c1',
        question: 'What is your cancellation policy?',
        answer: 'We offer flexible cancellation: full refund of deposit if cancelled more than 48 hours before your scheduled start. Cancellations within 48 hours forfeit the deposit (but not any balance). Transfers have a stricter 24-hour policy due to driver allocation. Special terms apply during peak season (Dec 15 – Jan 15).',
        tag: 'Important',
      },
      {
        id: 'c2',
        question: 'How do I cancel a booking?',
        answer: 'Log in to your account and select the booking you wish to cancel — you\'ll see a Cancel option with a confirmation step. Alternatively, message us via WhatsApp or email with your booking reference and we\'ll handle it within 2 hours. Refunds are issued to your original payment method.',
      },
      {
        id: 'c3',
        question: 'How long does a refund take?',
        answer: 'Deposit refunds are processed within 3–5 business days from the cancellation request. Depending on your bank, the amount may take up to 10 business days to appear in your account. We\'ll send a confirmation email when the refund is issued.',
      },
      {
        id: 'c4',
        question: 'Can I modify my booking instead of cancelling?',
        answer: 'Yes, and we strongly encourage it. Date changes, stop additions or removals, vehicle upgrades, and group size adjustments can all be made up to 24 hours before departure. Contact our team via WhatsApp for fastest response. Modifications are free of charge when made with reasonable notice.',
      },
      {
        id: 'c5',
        question: 'What happens if Peacock Drivers needs to cancel?',
        answer: 'In the very rare event we need to cancel (e.g., severe weather, unforeseen vehicle issue), you will receive a full refund of all amounts paid, including the deposit. We will also do our best to arrange an equivalent alternative through our network of partner operators.',
      },
      {
        id: 'c6',
        question: 'What if my flight is cancelled or significantly delayed?',
        answer: 'For airport pickups, we track your flight in real-time and automatically adjust. If your flight is cancelled and you cannot travel, this is treated as a cancellation under our standard policy. We recommend travel insurance that covers trip cancellation for these situations.',
      },
      {
        id: 'c7',
        question: 'Is there a fee for rescheduling?',
        answer: 'No rescheduling fee when you change dates more than 48 hours in advance, subject to availability. Last-minute reschedules (within 48 hours) may require forfeit of the deposit if a new booking must be arranged urgently.',
      },
    ],
  },
  {
    id: 'vehicles',
    label: 'Vehicle Types',
    short: 'Vehicles',
    Icon: Car,
    color: '#0C2421',
    colorLight: '#F0F4F0',
    items: [
      {
        id: 'v1',
        question: 'How do I know which vehicle to choose?',
        answer: 'A simple rule: match the vehicle to your passenger count plus luggage. Solo or couple with light bags → Sedan. Family of 4 with full luggage → SUV or KDH Van. Larger groups → Minibus. Our booking flow recommends the best fit automatically based on your inputs.',
        tag: 'Start here',
      },
      {
        id: 'v2',
        question: 'Are all vehicles air-conditioned?',
        answer: 'Yes. Every vehicle in our fleet is fitted with a fully functioning air conditioning system — essential in Sri Lanka\'s climate. All cars are inspected before each trip and our drivers know to keep the cabin comfortable throughout the journey.',
      },
      {
        id: 'v3',
        question: 'Do vehicles have Wi-Fi and charging ports?',
        answer: 'Most vehicles are equipped with a mobile Wi-Fi hotspot (3–4G, speeds vary by region) and multiple USB-A and USB-C charging ports. Your driver will share the Wi-Fi password at the start of your journey. Coverage may be limited in very remote hill country areas.',
      },
      {
        id: 'v4',
        question: 'Can I request a specific vehicle model?',
        answer: 'You can request a vehicle class (e.g., "premium sedan" or "large van") during booking and we\'ll match you with the best available option. Specific model requests (e.g., "Toyota Prado only") may not always be possible but we note the preference and do our best.',
      },
      {
        id: 'v5',
        question: 'Are child safety seats available?',
        answer: 'Yes. Baby seats, infant seats, and booster seats are available on request at no additional charge. Please mention this during booking so we can confirm the right seat for your child\'s age and weight. We recommend specifying your child\'s age to ensure the correct seat type.',
      },
      {
        id: 'v6',
        question: 'Is there a vehicle for accessibility needs?',
        answer: 'We have vehicles that can better accommodate guests with mobility challenges. Please contact us before booking to discuss your specific requirements — we\'ll match you with the most suitable vehicle and a driver experienced in assisting guests with accessibility needs.',
      },
    ],
  },
];

/* ─── Vehicle fleet cards data ───────────────────────────────── */
const FLEET = [
  {
    name: 'Sedan',
    model: 'Toyota Axio / Honda Grace',
    emoji: '🚙',
    capacity: '1–3',
    luggage: '2 bags',
    bestFor: ['Couples', 'Solo', 'Transfers'],
    highlight: 'Most affordable',
    color: '#14524C',
    features: ['AC', 'USB charging', 'Comfortable'],
  },
  {
    name: 'SUV / 4×4',
    model: 'Toyota Prado / Land Cruiser',
    emoji: '🛻',
    capacity: '1–5',
    luggage: '4–5 bags',
    bestFor: ['Families', 'Hill country', 'Off-road'],
    highlight: 'Most popular',
    color: '#E8A825',
    features: ['AC', 'Wi-Fi', 'Extra ground clearance'],
  },
  {
    name: 'KDH Van',
    model: 'Toyota KDH / HiAce',
    emoji: '🚐',
    capacity: '6–8',
    luggage: '8+ bags',
    bestFor: ['Large families', 'Groups', 'Long tours'],
    highlight: 'Best for families',
    color: '#14524C',
    features: ['AC', 'Wi-Fi', 'Reclining seats', 'USB'],
  },
  {
    name: 'Luxury Sedan',
    model: 'Mercedes E-Class / BMW 5',
    emoji: '✨',
    capacity: '1–3',
    luggage: '3 bags',
    bestFor: ['Executive', 'Honeymoon', 'Premium'],
    highlight: 'Premium experience',
    color: '#0C2421',
    features: ['Premium AC', 'Wi-Fi', 'Leather', 'Privacy'],
  },
  {
    name: 'Minibus',
    model: 'Rosa / Coaster',
    emoji: '🚌',
    capacity: '9–14',
    luggage: '14+ bags',
    bestFor: ['Group tours', 'Corporate', 'Events'],
    highlight: 'Best for groups',
    color: '#14524C',
    features: ['AC', 'Wi-Fi', 'PA system', 'Luggage bay'],
  },
];

/* ─── Highlight matched text ─────────────────────────────────── */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200/70 text-[#0C2421] rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* ─── Single FAQ accordion row ───────────────────────────────── */
function AccordionItem({
  item,
  isOpen,
  onToggle,
  query,
  accentColor,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  query: string;
  accentColor: string;
}) {
  const [helpful, setHelpful] = useState<null | 'yes' | 'no'>(null);

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300 overflow-hidden',
        isOpen
          ? 'border-l-4 bg-white shadow-sm'
          : 'border-warm-100 bg-white hover:border-warm-200 hover:shadow-sm',
      )}
      style={isOpen ? { borderLeftColor: accentColor } : {}}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="mt-0.5">
            {item.tag && (
              <span
                className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mr-2"
                style={{ backgroundColor: accentColor + '18', color: accentColor }}
              >
                {item.tag}
              </span>
            )}
          </span>
          <span className="font-body font-semibold text-[15px] text-[#0C2421] leading-snug group-hover:text-forest-600 transition-colors">
            <Highlight text={item.question} query={query} />
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease }}
          className="shrink-0 mt-0.5"
        >
          <ChevronDown
            className="w-5 h-5 transition-colors"
            style={{ color: isOpen ? accentColor : '#9CA3AF' }}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">
              <div className="h-px bg-warm-100 mb-4" />
              <p className="text-[14px] text-warm-600 leading-[1.75]">
                <Highlight text={item.answer} query={query} />
              </p>
              {/* Helpfulness */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-warm-50">
                <span className="text-[11px] text-warm-400 uppercase tracking-wider font-bold">
                  Was this helpful?
                </span>
                <button
                  onClick={() => setHelpful('yes')}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer',
                    helpful === 'yes'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-warm-50 text-warm-400 hover:bg-warm-100',
                  )}
                >
                  <ThumbsUp className="w-3 h-3" /> Yes
                </button>
                <button
                  onClick={() => setHelpful('no')}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer',
                    helpful === 'no'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-warm-50 text-warm-400 hover:bg-warm-100',
                  )}
                >
                  <ThumbsDown className="w-3 h-3" /> No
                </button>
                {helpful === 'no' && (
                  <span className="text-[11px] text-warm-400 ml-1">
                    Contact us and we'll help directly →
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Vehicle fleet card ─────────────────────────────────────── */
function FleetCard({ v }: { v: (typeof FLEET)[0] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease }}
      className="bg-white rounded-2xl border border-warm-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-3xl mb-1">{v.emoji}</div>
          <h4 className="font-display font-normal text-lg text-[#0C2421] leading-tight">{v.name}</h4>
          <p className="text-xs text-warm-400 mt-0.5">{v.model}</p>
        </div>
        {v.highlight && (
          <span
            className="text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: v.color + '15', color: v.color }}
          >
            {v.highlight}
          </span>
        )}
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 bg-warm-50 rounded-xl px-3 py-2">
          <Users className="w-3.5 h-3.5 text-warm-400 shrink-0" />
          <div>
            <p className="text-[10px] text-warm-400 uppercase tracking-wider">Passengers</p>
            <p className="text-xs font-bold text-[#0C2421]">{v.capacity}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-warm-50 rounded-xl px-3 py-2">
          <Luggage className="w-3.5 h-3.5 text-warm-400 shrink-0" />
          <div>
            <p className="text-[10px] text-warm-400 uppercase tracking-wider">Luggage</p>
            <p className="text-xs font-bold text-[#0C2421]">{v.luggage}</p>
          </div>
        </div>
      </div>

      {/* Best for */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-1.5">Best for</p>
        <div className="flex flex-wrap gap-1">
          {v.bestFor.map(tag => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: v.color + '12', color: v.color }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-warm-50">
        {v.features.map(f => (
          <span key={f} className="flex items-center gap-1 text-[11px] text-warm-500">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {f}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Category section ───────────────────────────────────────── */
function CategorySection({
  cat,
  openId,
  setOpenId,
  query,
}: {
  cat: FAQCategory;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  query: string;
}) {
  const { Icon } = cat;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const filtered = useMemo(() => {
    if (!query.trim()) return cat.items;
    const q = query.toLowerCase();
    return cat.items.filter(
      item =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q),
    );
  }, [cat.items, query]);

  if (filtered.length === 0) return null;

  return (
    <section
      id={cat.id}
      ref={ref}
      className="scroll-mt-32"
    >
      {/* Category header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease }}
        className="flex items-center gap-4 mb-6"
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: cat.colorLight }}
        >
          <Icon className="w-5 h-5" style={{ color: cat.color }} />
        </div>
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-normal text-[#0C2421]">{cat.label}</h2>
          <p className="text-xs text-warm-400 mt-0.5">{filtered.length} question{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </motion.div>

      {/* Vehicle fleet grid (special treatment for vehicles category) */}
      {cat.id === 'vehicles' && !query && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {FLEET.map(v => <FleetCard key={v.name} v={v} />)}
        </div>
      )}

      {/* FAQ items */}
      <div className="space-y-3">
        {filtered.map(item => (
          <AccordionItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            query={query}
            accentColor={cat.color}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Sticky sidebar nav ─────────────────────────────────────── */
function SidebarNav({
  active,
  onSelect,
  counts,
}: {
  active: string;
  onSelect: (id: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <nav className="space-y-1">
      {CATEGORIES.map(cat => {
        const { Icon } = cat;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer group',
              isActive
                ? 'bg-[#0C2421] text-white'
                : 'text-warm-600 hover:bg-warm-100 hover:text-[#0C2421]',
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                isActive ? 'bg-white/15' : 'bg-warm-100 group-hover:bg-warm-200',
              )}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: isActive ? 'white' : cat.color }}
              />
            </div>
            <span className="font-body font-semibold text-sm flex-1">{cat.short}</span>
            <span
              className={cn(
                'text-[11px] font-bold px-2 py-0.5 rounded-full',
                isActive ? 'bg-white/20 text-white' : 'bg-warm-200 text-warm-500',
              )}
            >
              {counts[cat.id] ?? cat.items.length}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function FAQ() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const contentRef = useRef<HTMLDivElement>(null);

  /* Active category from scroll position */
  useEffect(() => {
    const sections = CATEGORIES.map(c => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveCat(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /* Scroll to category */
  const scrollToCategory = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveCat(id);
  };

  /* Filter counts for sidebar badges */
  const filteredCounts = useMemo(() => {
    const result: Record<string, number> = {};
    CATEGORIES.forEach(cat => {
      if (!query.trim()) {
        result[cat.id] = cat.items.length;
      } else {
        const q = query.toLowerCase();
        result[cat.id] = cat.items.filter(
          i => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q),
        ).length;
      }
    });
    return result;
  }, [query]);

  const totalResults = Object.values(filteredCounts).reduce((a, b) => a + b, 0);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0C2421] pt-36 pb-20 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-forest-600/20 -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-500/8 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/12 mb-8"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Help Centre</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-5 leading-[1.06]"
            >
              Everything you{' '}
              <em className="italic text-amber-400">need to know</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease }}
              className="text-lg text-white/50 mb-10 leading-relaxed"
            >
              {CATEGORIES.reduce((n, c) => n + c.items.length, 0)} answers across booking, payment,
              cancellation, and vehicle types.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease }}
              className="relative max-w-lg mx-auto"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={'Search questions\u2026 e.g. \u201ccancellation\u201d'}
                className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/35 font-body text-[15px] focus:outline-none focus:border-amber-400/50 focus:bg-white/15 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>

            {/* Search result count */}
            <AnimatePresence>
              {hasQuery && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm text-white/40 mt-3"
                >
                  {totalResults > 0
                    ? `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
                    : `No results for "${query}" — try different words`}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </Container>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: 64 }}>
            <path d="M0 64L1440 64L1440 22C1100 58 900 6 600 22C300 38 150 8 0 22Z" fill="#FAF7F2" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          QUICK STATS
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-warm-100">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-warm-100 py-4">
            {[
              { Icon: Clock,         val: '< 2 min',   label: 'Avg. response time' },
              { Icon: MessageCircle, val: '24/7',       label: 'WhatsApp support' },
              { Icon: Star,          val: '4.9 / 5',    label: 'Support rating' },
              { Icon: CheckCircle2,  val: '98%',        label: 'Issues resolved' },
            ].map(({ Icon, val, label }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-3 first:pl-0">
                <Icon className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <p className="font-display font-normal text-lg text-[#0C2421] leading-none">{val}</p>
                  <p className="text-[11px] text-warm-400 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT — sidebar + accordion
      ══════════════════════════════════════════════════════════ */}
      <Container className="py-16 md:py-24">
        <div className="grid lg:grid-cols-[260px_1fr] gap-12 xl:gap-16 items-start">

          {/* Sticky sidebar — desktop only */}
          <aside className="hidden lg:block sticky top-28 self-start">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-warm-400 mb-3 px-1">
              Categories
            </p>
            <SidebarNav
              active={activeCat}
              onSelect={scrollToCategory}
              counts={filteredCounts}
            />

            {/* Mobile-style category chips in sidebar */}
            <div className="mt-8 p-4 rounded-2xl bg-white border border-warm-100">
              <p className="text-xs font-bold text-[#0C2421] mb-3">Still need help?</p>
              <div className="space-y-2">
                <a
                  href="https://wa.me/94771234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp us
                </a>
                <a
                  href="mailto:hello@peacockdrivers.com"
                  className="flex items-center gap-2.5 text-xs font-semibold text-warm-600 hover:text-[#0C2421] transition-colors"
                >
                  <Mail className="w-4 h-4" /> Send an email
                </a>
                <a
                  href="tel:+94771234567"
                  className="flex items-center gap-2.5 text-xs font-semibold text-warm-600 hover:text-[#0C2421] transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call us
                </a>
              </div>
            </div>
          </aside>

          {/* Mobile category chips */}
          <div className="lg:hidden -mb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map(cat => {
                const { Icon } = cat;
                return (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer',
                      activeCat === cat.id
                        ? 'bg-[#0C2421] text-white'
                        : 'bg-white border border-warm-200 text-warm-600',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.short}
                    <span className="opacity-60">{filteredCounts[cat.id]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ sections */}
          <div ref={contentRef} className="space-y-16">
            <AnimatePresence mode="wait">
              {totalResults === 0 && hasQuery ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20"
                >
                  <AlertCircle className="w-10 h-10 text-warm-300 mx-auto mb-4" />
                  <p className="font-display text-2xl font-normal text-[#0C2421] mb-2">No results found</p>
                  <p className="text-warm-400 mb-6">Try searching for "deposit", "cancel", "van", or "payment"</p>
                  <button
                    onClick={() => setQuery('')}
                    className="text-sm font-bold text-forest-500 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    Clear search
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-16"
                >
                  {CATEGORIES.map(cat => (
                    <CategorySection
                      key={cat.id}
                      cat={cat}
                      openId={openId}
                      setOpenId={setOpenId}
                      query={query}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>

      {/* ══════════════════════════════════════════════════════════
          CONTACT CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-warm-100 py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-normal text-[#0C2421] mb-3">
              Didn't find your answer?
            </h2>
            <p className="text-warm-500 text-[16px]">
              Our team is real people who reply fast. Pick your preferred way to reach us.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
            {[
              {
                Icon: MessageCircle,
                label: 'WhatsApp',
                sub: 'Fastest — replies in minutes',
                href: 'https://wa.me/94771234567',
                color: '#25D366',
                colorLight: '#25D36615',
                external: true,
              },
              {
                Icon: Mail,
                label: 'Email',
                sub: 'Detailed queries welcome',
                href: 'mailto:hello@peacockdrivers.com',
                color: '#14524C',
                colorLight: '#CCFFDE',
                external: false,
              },
              {
                Icon: Phone,
                label: 'Phone',
                sub: 'Mon–Fri, 8am–8pm LKT',
                href: 'tel:+94771234567',
                color: '#E8A825',
                colorLight: '#FEF3C7',
                external: false,
              },
            ].map(({ Icon, label, sub, href, color, colorLight, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF7F2] border border-warm-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: colorLight }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="font-display font-normal text-lg text-[#0C2421] mb-1">{label}</p>
                <p className="text-xs text-warm-400">{sub}</p>
              </a>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/tours">
              <Button size="lg" className="rounded-full px-10 h-13 font-bold gap-2 bg-[#0C2421] hover:bg-forest-700">
                Ready to book? <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
