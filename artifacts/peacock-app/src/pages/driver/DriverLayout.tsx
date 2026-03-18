import { Link, useLocation } from 'wouter';
import { Home, Calendar, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, href: '/driver' },
  { label: 'Trips', icon: Calendar, href: '/driver/trips' },
  { label: 'Earnings', icon: Wallet, href: '/driver/earnings' },
  { label: 'Profile', icon: User, href: '/driver/profile' },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === '/driver') return location === '/driver' || location === '/driver/';
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-20 md:pb-0">
      <div className="md:hidden">
        {children}
      </div>

      <div className="hidden md:flex min-h-screen">
        <aside className="w-64 bg-white border-r border-warm-100 p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-forest-600 font-display text-2xl italic pr-1">P</div>
            <span className="font-display text-xl text-forest-600">Peacock Drivers</span>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-colors',
                    active
                      ? 'bg-forest-50 text-forest-600 font-medium'
                      : 'text-warm-500 hover:bg-warm-50 hover:text-forest-600'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 px-2 py-2 flex justify-around items-center z-50 md:hidden safe-bottom">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[48px] rounded-xl transition-colors',
                active ? 'text-forest-600' : 'text-warm-400'
              )}
            >
              <Icon className={cn('w-6 h-6 mb-0.5', active && 'stroke-[2.5]')} />
              <span className="font-body text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
