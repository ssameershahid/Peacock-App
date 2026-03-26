import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Mail, Phone, MapPin, MessageCircle, Clock, Send,
  CheckCircle2, AlertCircle, Instagram, Linkedin,
  ArrowRight, ChevronDown, User, FileText, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Animation ──────────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Subject options ────────────────────────────────────────── */
const SUBJECTS = [
  'General enquiry',
  'Help with a booking',
  'Custom itinerary request',
  'Transfer booking',
  'Group or corporate booking',
  'Partnership or press',
  'Feedback or complaint',
  'Other',
] as const;

const HOW_HEARD = [
  'Google search',
  'TripAdvisor',
  'Instagram',
  'Friend or family',
  'Travel blog',
  'Previous guest',
  'Other',
] as const;

/* ─── Form state ─────────────────────────────────────────────── */
interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  howHeard: string;
}

const EMPTY: FormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  howHeard: '',
};

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'spam' | 'toosoon';

/* ─── Field wrapper ──────────────────────────────────────────── */
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold uppercase tracking-[0.14em] text-warm-500">
        {label}
        {required && <span className="text-amber-200 ml-0.5">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[12px] text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  'w-full bg-[#FAF7F2] border border-warm-200 rounded-xl px-4 py-3 font-body text-[14px] text-[#0C2421] placeholder-warm-400 focus:outline-none focus:border-[#14524C] focus:bg-white focus:ring-2 focus:ring-[#14524C]/12 transition-all duration-200';

/* ─── Contact detail card ────────────────────────────────────── */
function ContactCard({
  Icon,
  label,
  value,
  href,
  sub,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
  sub?: string;
}) {
  const content = (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/8 transition-colors duration-200 group">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
        <Icon className="w-4 h-4 text-[#CCFFDE]" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-0.5">{label}</p>
        <p className="text-white font-semibold text-[15px] leading-snug">{value}</p>
        {sub && <p className="text-white/40 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

/* ─── Custom select ──────────────────────────────────────────── */
function Select({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          inputCls,
          'appearance-none pr-10 cursor-pointer',
          !value && 'text-warm-400',
          error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
        )}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" />
    </div>
  );
}

/* ─── Success overlay ────────────────────────────────────────── */
function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease }}
      className="flex flex-col items-center justify-center text-center py-16 px-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-[#CCFFDE] flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-9 h-9 text-[#14524C]" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease }}
        className="font-display text-3xl font-normal text-[#0C2421] mb-3"
      >
        Message received!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, ease }}
        className="text-[15px] text-warm-500 leading-relaxed max-w-xs mb-8"
      >
        We usually reply within a few hours. Check your inbox — and your spam folder just in case.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <a
          href="https://wa.me/94771234567"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
        </a>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-warm-200 text-warm-500 text-sm font-bold hover:border-warm-400 hover:text-[#0C2421] transition-colors cursor-pointer"
        >
          Send another
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function Contact() {
  /* Form state */
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [status, setStatus] = useState<Status>('idle');

  /* Anti-spam: honeypot + time gate */
  const [honeypot, setHoneypot] = useState('');          // bots fill this
  const loadTimeRef = useRef(Date.now());                 // track when form appeared

  /* Char count */
  const maxMsg = 1200;

  const set = (k: keyof FormData) => (v: string) => {
    setData(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  };

  /* Validation */
  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!data.name.trim()) e.name = 'Please enter your name';
    if (!data.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Please enter a valid email';
    if (!data.subject) e.subject = 'Please choose a subject';
    if (!data.message.trim()) e.message = 'Please write your message';
    else if (data.message.trim().length < 20) e.message = 'Message too short — a few more words help us respond better';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* Honeypot check — silently pretend success */
    if (honeypot) {
      setStatus('success');
      return;
    }

    /* Time gate — if submitted within 3 seconds of page load */
    if (Date.now() - loadTimeRef.current < 3000) {
      setStatus('toosoon');
      setTimeout(() => setStatus('idle'), 3500);
      return;
    }

    if (!validate()) return;

    setStatus('submitting');

    /* Simulate async submit (replace with real API call) */
    await new Promise(r => setTimeout(r, 1600));
    setStatus('success');
  };

  const reset = () => {
    setData(EMPTY);
    setErrors({});
    setStatus('idle');
    loadTimeRef.current = Date.now();
  };

  /* Scroll reveal */
  const leftRef = useRef(null);
  const leftInView = useInView(leftRef, { once: true, margin: '-60px' });
  const formRef = useRef(null);
  const formInView = useInView(formRef, { once: true, margin: '-60px' });

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* ══════════════════════════════════════════════════════════
          HERO — thin, typographic
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0C2421] pt-36 pb-16 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-forest-600/20 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-10 bg-amber-200" />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Contact us</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease }}
            className="font-display text-6xl md:text-7xl lg:text-8xl font-normal text-white leading-[1.04]"
          >
            Let's talk.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease }}
            className="text-lg text-white/50 mt-4 max-w-md leading-relaxed font-light"
          >
            We're real people who reply fast. Message us, call us, or just say hi on WhatsApp.
          </motion.p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: 56 }}>
            <path d="M0 56L1440 56L1440 18C1100 50 900 4 600 18C300 32 150 6 0 18Z" fill="#FAF7F2" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SPLIT LAYOUT
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-[420px_1fr] gap-10 xl:gap-16 items-start">

          {/* ── LEFT PANEL — contact info ── */}
          <motion.aside
            ref={leftRef}
            variants={stagger}
            initial="hidden"
            animate={leftInView ? 'visible' : 'hidden'}
            className="lg:sticky lg:top-28 self-start"
          >
            {/* Dark card */}
            <motion.div
              variants={fadeUp}
              className="rounded-3xl bg-[#0C2421] overflow-hidden relative"
            >
              {/* Grain */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
              />
              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/10 -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

              <div className="relative z-10 p-8">
                {/* Availability indicator */}
                <div className="flex items-center gap-2 mb-8">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                    We're available now
                  </span>
                </div>

                <h2 className="font-display text-3xl md:text-4xl font-normal text-white mb-2 leading-snug">
                  Reach us{' '}
                  <em className="italic text-amber-200">any way you like.</em>
                </h2>
                <p className="text-white/45 text-[14px] leading-relaxed mb-8">
                  WhatsApp is fastest. Email for detailed enquiries. Phone for urgent matters.
                </p>

                {/* Contact details */}
                <div className="space-y-1 mb-8">
                  <ContactCard
                    Icon={MessageCircle}
                    label="WhatsApp (fastest)"
                    value="+94 77 123 4567"
                    href="https://wa.me/94771234567"
                    sub="Replies within minutes"
                  />
                  <ContactCard
                    Icon={Mail}
                    label="Email"
                    value="hello@peacockdrivers.com"
                    href="mailto:hello@peacockdrivers.com"
                    sub="Replies within a few hours"
                  />
                  <ContactCard
                    Icon={Phone}
                    label="Phone"
                    value="+94 11 234 5678"
                    href="tel:+94112345678"
                    sub="Mon–Sat, 8am–8pm LKT"
                  />
                  <ContactCard
                    Icon={MapPin}
                    label="Office"
                    value="No. 42, Temple Road"
                    sub="Kandy 20000, Sri Lanka"
                  />
                  <ContactCard
                    Icon={Clock}
                    label="Hours"
                    value="Mon – Sat, 8am – 8pm"
                    sub="Sri Lanka Time (UTC +5:30)"
                  />
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-6" />

                {/* Social links */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Find us</span>
                  {[
                    { Icon: Instagram, href: '#', label: 'Instagram' },
                    { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                  ].map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 hover:border-white/20 transition-all"
                    >
                      <Icon className="w-3.5 h-3.5 text-white/60" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Response time badge */}
            <motion.div
              variants={fadeUp}
              className="mt-4 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-warm-100"
            >
              <div className="w-8 h-8 rounded-xl bg-[#CCFFDE] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#14524C]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0C2421]">Average response time</p>
                <p className="text-[11px] text-warm-400">Under 2 hours during business hours</p>
              </div>
              <div className="ml-auto font-display font-normal text-xl text-[#14524C]">&lt; 2h</div>
            </motion.div>
          </motion.aside>

          {/* ── RIGHT PANEL — form ── */}
          <motion.div
            ref={formRef}
            variants={stagger}
            initial="hidden"
            animate={formInView ? 'visible' : 'hidden'}
          >
            <motion.div
              variants={fadeUp}
              className="bg-white rounded-3xl border border-warm-100 shadow-sm overflow-hidden"
            >
              {/* Form header */}
              <div className="px-8 pt-8 pb-6 border-b border-warm-100">
                <h2 className="font-display text-2xl font-normal text-[#0C2421] mb-1">Send us a message</h2>
                <p className="text-[13px] text-warm-400">
                  Fields marked <span className="text-amber-200 font-bold">*</span> are required. We never share your details.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <SuccessState key="success" onReset={reset} />
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    noValidate
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-8 py-8 space-y-6"
                  >
                    {/* Honeypot — visually hidden, only bots fill this */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: '-9999px',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        opacity: 0,
                        pointerEvents: 'none',
                      }}
                    >
                      <label htmlFor="__hp">Leave this blank</label>
                      <input
                        id="__hp"
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={e => setHoneypot(e.target.value)}
                      />
                    </div>

                    {/* Row 1 — name + email */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Your name" required error={errors.name}>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 w-4 h-4 text-warm-400 pointer-events-none" />
                          <input
                            type="text"
                            value={data.name}
                            onChange={e => set('name')(e.target.value)}
                            placeholder="Jane Smith"
                            autoComplete="name"
                            className={cn(inputCls, 'pl-10', errors.name && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
                          />
                        </div>
                      </Field>
                      <Field label="Email address" required error={errors.email}>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 w-4 h-4 text-warm-400 pointer-events-none" />
                          <input
                            type="email"
                            value={data.email}
                            onChange={e => set('email')(e.target.value)}
                            placeholder="jane@example.com"
                            autoComplete="email"
                            className={cn(inputCls, 'pl-10', errors.email && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
                          />
                        </div>
                      </Field>
                    </div>

                    {/* Row 2 — phone + subject */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Phone number" error={errors.phone}>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 w-4 h-4 text-warm-400 pointer-events-none" />
                          <input
                            type="tel"
                            value={data.phone}
                            onChange={e => set('phone')(e.target.value)}
                            placeholder="+1 234 567 8900"
                            autoComplete="tel"
                            className={cn(inputCls, 'pl-10')}
                          />
                        </div>
                      </Field>
                      <Field label="Subject" required error={errors.subject}>
                        <Select
                          value={data.subject}
                          onChange={set('subject')}
                          options={SUBJECTS}
                          placeholder="What's this about?"
                          error={errors.subject}
                        />
                      </Field>
                    </div>

                    {/* Message */}
                    <Field label="Your message" required error={errors.message}>
                      <div className="relative">
                        <textarea
                          value={data.message}
                          onChange={e => set('message')(e.target.value)}
                          placeholder="Tell us about your trip plans, questions, or anything else…"
                          rows={6}
                          maxLength={maxMsg}
                          className={cn(inputCls, 'resize-none', errors.message && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
                        />
                        <span
                          className={cn(
                            'absolute bottom-3 right-3 text-[11px]',
                            data.message.length > maxMsg * 0.9 ? 'text-amber-200' : 'text-warm-300',
                          )}
                        >
                          {data.message.length}/{maxMsg}
                        </span>
                      </div>
                    </Field>

                    {/* How did you hear */}
                    <Field label="How did you hear about us?">
                      <Select
                        value={data.howHeard}
                        onChange={set('howHeard')}
                        options={HOW_HEARD}
                        placeholder="Optional"
                      />
                    </Field>

                    {/* Anti-spam note */}
                    <div className="flex items-start gap-2.5 bg-[#FAF7F2] rounded-xl px-4 py-3 border border-warm-100">
                      <CheckCircle2 className="w-4 h-4 text-[#14524C] mt-0.5 shrink-0" />
                      <p className="text-[12px] text-warm-400 leading-relaxed">
                        This form is protected against spam. Your information is encrypted and never shared with third parties.
                      </p>
                    </div>

                    {/* Error / too-soon messages */}
                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                        >
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          <p className="text-sm text-red-600">Something went wrong. Please try again or contact us via WhatsApp.</p>
                        </motion.div>
                      )}
                      {status === 'toosoon' && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
                        >
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <p className="text-sm text-amber-700">Please take a moment to review your message before sending.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === 'submitting' || status === 'toosoon'}
                      className={cn(
                        'w-full h-14 rounded-full font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer',
                        status === 'submitting' || status === 'toosoon'
                          ? 'bg-warm-200 text-warm-400 cursor-not-allowed'
                          : 'bg-[#0C2421] text-white hover:bg-forest-700 active:scale-[0.98] shadow-lg shadow-[#0C2421]/20 hover:shadow-xl',
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {status === 'submitting' ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5"
                          >
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending…
                          </motion.div>
                        ) : (
                          <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5"
                          >
                            <Send className="w-4 h-4" />
                            Send message
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>

                    <p className="text-center text-[12px] text-warm-400">
                      Prefer instant help?{' '}
                      <a
                        href="https://wa.me/94771234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Chat on WhatsApp instead →
                      </a>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
