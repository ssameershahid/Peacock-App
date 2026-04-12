import React from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, User, LogOut, ChevronDown, Map, Plane, Sparkles, Star, Mail, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CurrencySelector } from '@/components/shared/CurrencySelector';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/peacock/Footer';

const SERVICE_LINKS = [
  { href: '/tours', label: 'Ready To Go', icon: Map, desc: 'Expertly crafted island itineraries' },
  { href: '/transfers', label: 'Island Transfers', icon: Plane, desc: 'Airport & point-to-point rides' },
  { href: '/tours/custom', label: 'Trip Wizard', icon: Sparkles, desc: 'Build your bespoke journey' },
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
    <div className="min-h-screen flex flex-col bg-white">
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

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-150">
          <div className="p-6 flex justify-between items-center border-b border-warm-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-forest-500 flex items-center justify-center text-amber-200 font-display text-2xl italic pr-1">
                P
              </div>
              <span className="font-display text-2xl text-forest-600">Peacock Drivers</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-warm-50 rounded-full text-warm-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-0">
            {/* Services group */}
            <div className="border-b border-warm-100 py-4">
              <p className="font-body text-xs uppercase tracking-widest text-warm-400 mb-3">Services</p>
              {SERVICE_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-xl font-display text-forest-600 py-2.5 hover:text-amber-200 transition-colors"
                >
                  <Icon className="w-5 h-5 text-forest-400" />
                  {label}
                </Link>
              ))}
            </div>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-display text-forest-600 border-b border-warm-100 py-5 hover:text-amber-200 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* More group */}
            <div className="border-b border-warm-100 py-4">
              <p className="font-body text-xs uppercase tracking-widest text-warm-400 mb-3">More</p>
              {MORE_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-xl font-display text-forest-600 py-2.5 hover:text-amber-200 transition-colors"
                >
                  <Icon className="w-5 h-5 text-forest-400" />
                  {label}
                </Link>
              ))}
            </div>
            {user && (
              <Link
                href="/account/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-display text-forest-600 border-b border-warm-100 py-5 hover:text-amber-200 transition-colors"
              >
                My Trips
              </Link>
            )}
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-display text-forest-600 border-b border-warm-100 py-5 hover:text-amber-200 transition-colors"
            >
              My Account
            </Link>
          </div>
          <div className="p-6 space-y-3">
            <Link href="/tours" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-14 text-lg font-body">Book a journey</Button>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full h-12 font-body">
                <User className="w-4 h-4 mr-2" /> Login / Register
              </Button>
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1 page-enter">{children}</main>

      <Footer />
    </div>
  );
}
