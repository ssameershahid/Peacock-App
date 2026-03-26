import React from 'react';
import { Link, useLocation } from 'wouter';
import { Map, FileText, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const isActive = (href: string) => {
    if (href === '/account') return location === '/account';
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest-600 text-white pt-32 pb-12 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-5xl mb-2">
              Welcome back, <span className="italic text-amber-200">James</span>
            </h1>
            <p className="font-body text-white/70">Manage your Sri Lankan adventures.</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-pill">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-warm-100 p-4 sticky top-24">
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
