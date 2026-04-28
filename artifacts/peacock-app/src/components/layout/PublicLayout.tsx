import React from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, User, LogOut, ChevronDown, Map, Plane, Sparkles, Star, Mail, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CurrencySelector } from '@/components/shared/CurrencySelector';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/peacock/Footer';
import { WhatsAppWidget } from '@/components/shared/WhatsAppWidget';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICE_LINKS = [
  { href: '/tours', label: 'Ready To Go', icon: Map, desc: 'Expertly crafted island itineraries' },
  { href: '/tours/custom', label: 'Create Your Own', icon: Sparkles, desc: 'Build your bespoke journey' },
  { href: '/transfers', label: 'Island Transfers', icon: Plane, desc: 'Airport & point-to-point rides' },
];

const MORE_LINKS = [
  { href: '/reviews', label: 'Reviews', icon: Star, desc: 'What our travellers say' },
  { href: '/contact', label: 'Contact', icon: Mail, desc: 'Get in touch with us' },
  { href: '/blog', label: 'Blog', icon: BookOpen, desc: 'Field notes & travel dispatches' },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [servicesOpen, setServicesOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const isHome = location === '/' || location === '';

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solidHeader = isScrolled || !isHome;

  const navLinks = [
    { href: '/destinations', label: 'Destinations' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/about', label: 'About' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-clip">
      <header
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300',
          solidHeader ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-forest-500 flex items-center justify-center text-amber-200 font-display text-2xl italic pr-1 shadow-sm group-hover:bg-forest-400 transition-colors">
              P
            </div>
            <span className={cn(
              'font-display text-2xl hidden sm:block transition-colors',
              solidHeader ? 'text-forest-600' : 'text-white'
            )}>
              Peacock Drivers
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 font-body text-[15px] font-medium transition-colors hover:text-amber-200',
                  solidHeader ? 'text-warm-600' : 'text-white/90'
                )}
              >
                Services
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', servicesOpen && 'rotate-180')} />
              </button>

              {/* Dropdown panel */}
              <div
                className={cn(
                  'absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200',
                  servicesOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'
                )}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-warm-100 overflow-hidden w-72 p-2">
                  {SERVICE_LINKS.map(({ href, label, icon: Icon, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-warm-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-forest-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-forest-100 transition-colors">
                        <Icon className="w-4 h-4 text-forest-500" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-semibold text-forest-700 group-hover:text-forest-900">{label}</p>
                        <p className="font-body text-xs text-warm-400 mt-0.5">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-body text-[15px] font-medium transition-colors hover:text-amber-200',
                  solidHeader ? 'text-warm-600' : 'text-white/90'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 font-body text-[15px] font-medium transition-colors hover:text-amber-200',
                  solidHeader ? 'text-warm-600' : 'text-white/90'
                )}
              >
                More
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', moreOpen && 'rotate-180')} />
              </button>

              <div
                className={cn(
                  'absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200',
                  moreOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'
                )}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-warm-100 overflow-hidden w-72 p-2">
                  {MORE_LINKS.map(({ href, label, icon: Icon, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-warm-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-forest-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-forest-100 transition-colors">
                        <Icon className="w-4 h-4 text-forest-500" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-semibold text-forest-700 group-hover:text-forest-900">{label}</p>
                        <p className="font-body text-xs text-warm-400 mt-0.5">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <CurrencySelector variant={solidHeader ? 'light' : 'dark'} />
            {user ? (
              <>
                <Link href="/account">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-2 font-body',
                      solidHeader ? 'text-warm-600 hover:bg-warm-50' : 'text-white hover:bg-white/10'
                    )}
                  >
                    <User className="w-4 h-4" />
                    {user.name?.split(' ')[0] ?? 'Account'}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className={cn(
                    'gap-2 font-body',
                    solidHeader ? 'text-warm-400 hover:bg-warm-50' : 'text-white/70 hover:bg-white/10'
                  )}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2 font-body',
                    solidHeader ? 'text-warm-600 hover:bg-warm-50' : 'text-white hover:bg-white/10'
                  )}
                >
                  <User className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
            <Link href="/tours">
              <Button className="font-body">
                Book a journey
              </Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <CurrencySelector variant={solidHeader ? 'light' : 'dark'} />
            <button className="p-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className={cn('w-6 h-6', solidHeader ? 'text-forest-600' : 'text-white')} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{
              background: 'radial-gradient(ellipse at 78% 12%, rgba(232,168,37,0.13) 0%, transparent 52%), linear-gradient(155deg, #080f0e 0%, #0C2421 42%, #14524C 100%)',
            }}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="px-6 py-5 flex justify-between items-center shrink-0">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-9 h-9 rounded-full border border-amber-200/30 bg-amber-200/10 flex items-center justify-center text-amber-200 font-display text-xl italic pr-0.5">
                  P
                </div>
                <span className="font-display text-[19px] text-white/85 tracking-tight">Peacock Drivers</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center active:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Amber accent rule */}
            <div className="h-px mx-6 shrink-0 mb-1" style={{ background: 'linear-gradient(to right, rgba(232,168,37,0.5), rgba(232,168,37,0.15), transparent)' }} />

            {/* ── Scrollable body ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-4">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } } }}
              >

                {/* Services grid */}
                <motion.p
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-3"
                >
                  Services
                </motion.p>
                <div className="grid grid-cols-3 gap-2.5 mb-8">
                  {SERVICE_LINKS.map(({ href, label, icon: Icon }) => (
                    <motion.div
                      key={href}
                      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.32 } } }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-white/[0.09] bg-white/[0.05] active:bg-white/[0.12] transition-colors text-center"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232,168,37,0.14)' }}>
                          <Icon className="w-5 h-5" style={{ color: '#E8A825' }} />
                        </div>
                        <span className="text-[11px] font-semibold text-white/80 leading-tight">{label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Hairline */}
                <motion.div
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  className="h-px bg-white/[0.07] mb-6"
                />

                {/* Main nav links */}
                {navLinks.map(({ href, label }) => (
                  <motion.div
                    key={href}
                    variants={{ hidden: { opacity: 0, x: 18 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3 } } }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-1 py-[18px] border-b border-white/[0.07] group active:opacity-60 transition-opacity"
                    >
                      <span className="font-display text-[1.85rem] leading-none text-white/90 tracking-tight">
                        {label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white/20 group-active:text-amber-200 transition-colors shrink-0" style={{ color: 'rgba(232,168,37,0.35)' }} />
                    </Link>
                  </motion.div>
                ))}

                {/* More */}
                <motion.div
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.05 } } }}
                  className="mt-8 mb-2"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-3">More</p>
                  {MORE_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-1 border-b border-white/[0.06] active:opacity-60 transition-opacity"
                    >
                      <Icon className="w-4 h-4 text-white/25 shrink-0" />
                      <span className="text-[15px] font-medium text-white/55">{label}</span>
                    </Link>
                  ))}
                </motion.div>

                {/* Account links when logged in */}
                {user && (
                  <motion.div
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                    className="mt-2"
                  >
                    <Link href="/account/bookings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-1 border-b border-white/[0.06] active:opacity-60 transition-opacity">
                      <BookOpen className="w-4 h-4 text-white/25 shrink-0" />
                      <span className="text-[15px] font-medium text-white/55">My Trips</span>
                    </Link>
                    <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-1 border-b border-white/[0.06] active:opacity-60 transition-opacity">
                      <User className="w-4 h-4 text-white/25 shrink-0" />
                      <span className="text-[15px] font-medium text-white/55">My Account</span>
                    </Link>
                  </motion.div>
                )}

              </motion.div>
            </div>

            {/* ── Sticky bottom CTAs ──────────────────────────────────────── */}
            <div
              className="shrink-0 px-6 pt-5 pb-8 space-y-3 border-t border-white/[0.08]"
              style={{ background: 'linear-gradient(to top, rgba(8,15,14,0.98) 50%, transparent)' }}
            >
              <Link href="/tours" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  className="w-full h-[52px] text-[15px] font-semibold rounded-2xl"
                  style={{ background: '#E8A825', color: '#0C2421' }}
                >
                  Book a Journey
                </Button>
              </Link>
              {!user ? (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-[14px] rounded-2xl bg-transparent border-white/20 text-white/65 hover:bg-white/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login / Register
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full h-12 text-[14px] rounded-2xl bg-transparent border-white/20 text-white/65 hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 page-enter">{children}</main>

      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
