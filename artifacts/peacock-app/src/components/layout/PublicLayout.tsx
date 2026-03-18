import React from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/tours', label: 'Tours' },
    { href: '/tours/custom', label: 'Create Your Own' },
    { href: '/transfers', label: 'Transfers' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header 
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          isScrolled || location !== '/' ? "bg-white/95 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
        )}
      >
        <div className="container-max mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-forest-500 flex items-center justify-center text-amber-300 font-display text-2xl italic pr-1 shadow-sm group-hover:bg-forest-400 transition-colors">
              P
            </div>
            <span className={cn("font-display text-2xl hidden sm:block", isScrolled || location !== '/' ? "text-forest-600" : "text-white")}>
              Peacock Drivers
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={cn("font-body text-[15px] font-medium transition-colors hover:text-amber-500", isScrolled || location !== '/' ? "text-warm-600" : "text-white/90")}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/account">
              <Button variant="ghost" size="icon" className={cn(isScrolled || location !== '/' ? "text-forest-500 hover:bg-warm-50" : "text-white hover:bg-white/10")}>
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/tours">
              <Button variant={isScrolled || location !== '/' ? "default" : "amber"}>
                Book a journey
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className={cn("w-6 h-6", isScrolled || location !== '/' ? "text-forest-600" : "text-white")} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-warm-100">
            <span className="font-display text-2xl text-forest-600">Peacock Drivers</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-warm-50 rounded-full text-warm-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display text-forest-600 border-b border-warm-100 pb-4">
                {link.label}
              </Link>
            ))}
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-display text-forest-600 border-b border-warm-100 pb-4">
              My Account
            </Link>
          </div>
          <div className="p-6 mt-auto">
            <Link href="/tours" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-14 text-lg">Book a journey</Button>
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-forest-600 text-white py-20 px-6 mt-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-forest-600 font-display text-2xl italic pr-1">P</div>
              <span className="font-display text-3xl">Peacock Drivers</span>
            </div>
            <p className="font-body text-sage/80 max-w-sm leading-relaxed">
              Premium private transportation and curated journeys across Sri Lanka. Experience the art of hospitality.
            </p>
          </div>
          <div>
            <h4 className="font-body font-bold text-sm tracking-wider uppercase text-amber-400 mb-6">Explore</h4>
            <ul className="space-y-4 font-body text-sage/80">
              <li><Link href="/tours" className="hover:text-white transition-colors">Our Tours</Link></li>
              <li><Link href="/tours/custom" className="hover:text-white transition-colors">Custom Journeys</Link></li>
              <li><Link href="/transfers" className="hover:text-white transition-colors">Airport Transfers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-body font-bold text-sm tracking-wider uppercase text-amber-400 mb-6">Company</h4>
            <ul className="space-y-4 font-body text-sage/80">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><Link href="/driver" className="hover:text-white transition-colors">Driver Portal</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Panel</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-forest-400/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-sage/60">© {new Date().getFullYear()} Peacock Drivers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
