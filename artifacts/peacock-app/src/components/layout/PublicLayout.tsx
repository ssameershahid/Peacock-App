import React from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, User, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CurrencySelector } from '@/components/shared/CurrencySelector';
import { cn } from '@/lib/utils';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isHome = location === '/' || location === '';

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solidHeader = isScrolled || !isHome;

  const navLinks = [
    { href: '/tours', label: 'Tours' },
    { href: '/transfers', label: 'Transfers' },
    { href: '/account/bookings', label: 'My Trips' },
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
            <div className="w-10 h-10 rounded-full bg-forest-500 flex items-center justify-center text-amber-300 font-display text-2xl italic pr-1 shadow-sm group-hover:bg-forest-400 transition-colors">
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
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-body text-[15px] font-medium transition-colors hover:text-amber-500',
                  solidHeader ? 'text-warm-600' : 'text-white/90'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <CurrencySelector variant={solidHeader ? 'light' : 'dark'} />
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
              <div className="w-10 h-10 rounded-full bg-forest-500 flex items-center justify-center text-amber-300 font-display text-2xl italic pr-1">
                P
              </div>
              <span className="font-display text-2xl text-forest-600">Peacock Drivers</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-warm-50 rounded-full text-warm-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-0">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-display text-forest-600 border-b border-warm-100 py-5 hover:text-amber-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tours/custom"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-display text-forest-600 border-b border-warm-100 py-5 hover:text-amber-500 transition-colors"
            >
              Create Your Own
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-display text-forest-600 border-b border-warm-100 py-5 hover:text-amber-500 transition-colors"
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

      <main className="flex-1">{children}</main>

      <footer className="bg-forest-600 text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-forest-600 font-display text-2xl italic pr-1">
                  P
                </div>
                <span className="font-display text-3xl">Peacock Drivers</span>
              </div>
              <p className="font-body text-forest-100/70 max-w-sm leading-relaxed mb-6">
                Premium private transportation and curated journeys across Sri Lanka.
                Experience the art of island hospitality with trusted local drivers.
              </p>
              <div className="flex flex-col gap-3">
                <a href="mailto:hello@peacockdrivers.com" className="flex items-center gap-2 font-body text-sm text-forest-100/60 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" /> hello@peacockdrivers.com
                </a>
                <a href="tel:+94771234567" className="flex items-center gap-2 font-body text-sm text-forest-100/60 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" /> +94 77 123 4567
                </a>
                <span className="flex items-center gap-2 font-body text-sm text-forest-100/60">
                  <MapPin className="w-4 h-4" /> Colombo, Sri Lanka
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-body font-bold text-sm tracking-wider uppercase text-amber-400 mb-6">Explore</h4>
              <ul className="space-y-3 font-body text-sm text-forest-100/70">
                <li><Link href="/tours" className="hover:text-white transition-colors">Our Tours</Link></li>
                <li><Link href="/tours/custom" className="hover:text-white transition-colors">Custom Journeys</Link></li>
                <li><Link href="/transfers" className="hover:text-white transition-colors">Airport Transfers</Link></li>
                <li><Link href="/account/bookings" className="hover:text-white transition-colors">My Trips</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-body font-bold text-sm tracking-wider uppercase text-amber-400 mb-6">Company</h4>
              <ul className="space-y-3 font-body text-sm text-forest-100/70">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Drivers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-body font-bold text-sm tracking-wider uppercase text-amber-400 mb-6">Follow Us</h4>
              <div className="flex gap-3 mb-6">
                {['Facebook', 'Instagram', 'Twitter', 'TripAdvisor'].map(name => (
                  <a
                    key={name}
                    href="#"
                    className="w-10 h-10 rounded-full bg-forest-500 flex items-center justify-center text-forest-100/60 hover:bg-amber-400 hover:text-forest-600 transition-colors font-body text-xs font-bold"
                  >
                    {name[0]}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/driver" className="font-body text-sm text-forest-100/50 hover:text-white transition-colors">
                  Driver Portal
                </Link>
                <Link href="/admin" className="font-body text-sm text-forest-100/50 hover:text-white transition-colors">
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-forest-500/50">
          <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-forest-100/40">
              &copy; {new Date().getFullYear()} Peacock Drivers. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="font-body text-xs text-forest-100/40 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="font-body text-xs text-forest-100/40 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
