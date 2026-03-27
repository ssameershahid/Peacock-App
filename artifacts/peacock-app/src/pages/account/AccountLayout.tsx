import React from 'react';
import { Link, useLocation } from 'wouter';
import { Map, FileText, User, LogOut, LayoutDashboard, Plane, Sparkles, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/bookings', label: 'My Trips', icon: Map },
  { href: '/account/invoices', label: 'Invoices', icon: FileText },
  { href: '/account/profile', label: 'Profile', icon: User },
];

interface AccountLayoutProps {
  children: React.ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Traveller';

  const isActive = (href: string) => {
    if (href === '/account') return location === '/account';
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Top navigation bar */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center text-amber-200 font-display text-lg italic pr-0.5 shadow-sm group-hover:bg-forest-400 transition-colors">
                P
              </div>
              <span className="font-display text-xl text-forest-600 hidden sm:block">Peacock Drivers</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/tours" className="font-body text-sm font-medium text-warm-500 hover:text-forest-600 transition-colors flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5" /> Browse Tours
              </Link>
              <Link href="/transfers" className="font-body text-sm font-medium text-warm-500 hover:text-forest-600 transition-colors flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" /> Transfers
              </Link>
              <Link href="/tours/custom" className="font-body text-sm font-medium text-warm-500 hover:text-forest-600 transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Trip Wizard
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div
              className="relative"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-warm-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-xs font-bold border border-forest-200">
                  {firstName[0]?.toUpperCase()}
                </div>
                <span className="font-body text-sm font-medium text-forest-600">{firstName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-warm-400" />
              </button>
              <div className={cn(
                'absolute top-full right-0 pt-1 transition-all duration-150',
                userMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              )}>
                <div className="bg-white rounded-xl shadow-lg border border-warm-100 py-1 w-48">
                  {NAV_ITEMS.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-4 py-2 font-body text-sm text-warm-600 hover:bg-warm-50 hover:text-forest-600 transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-warm-400" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-warm-100 my-1" />
                  <button
                    onClick={logout}
                    className="flex items-center gap-2.5 px-4 py-2 font-body text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button className="md:hidden p-2 text-warm-500" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-150">
          <div className="p-4 flex justify-between items-center border-b border-warm-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center text-amber-200 font-display text-lg italic pr-0.5">P</div>
              <span className="font-display text-xl text-forest-600">Peacock Drivers</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-warm-50 rounded-full text-warm-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-6 space-y-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-body text-base transition-colors',
                  isActive(item.href) ? 'bg-forest-50 text-forest-600 font-medium' : 'text-warm-600'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <div className="border-t border-warm-100 my-4" />
            <Link href="/tours" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-base text-warm-600">
              <Map className="w-5 h-5" /> Browse Tours
            </Link>
            <Link href="/transfers" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-base text-warm-600">
              <Plane className="w-5 h-5" /> Transfers
            </Link>
          </div>
          <div className="p-6 border-t border-warm-100">
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-4 py-3 font-body text-sm text-red-500 w-full">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Welcome hero */}
      <div className="bg-forest-600 text-white pt-24 pb-12 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-5xl mb-2">
              Welcome back, <span className="italic text-amber-200">{firstName}</span>
            </h1>
            <p className="font-body text-white/70">Manage your Sri Lankan adventures.</p>
          </div>
          <Link href="/tours">
            <Button className="bg-amber-200 text-forest-700 hover:bg-amber-300 rounded-pill font-body">
              <Sparkles className="w-4 h-4 mr-2" /> Book a new trip
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-warm-100 p-4 sticky top-20">
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 w-full p-3 rounded-xl font-body font-medium transition-colors',
                      active
                        ? 'bg-forest-50 text-forest-600'
                        : 'text-warm-600 hover:bg-warm-50'
                    )}
                  >
                    <item.icon className={cn('w-5 h-5', active ? 'text-forest-500' : 'text-warm-400')} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
