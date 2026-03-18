import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Map, Users, Calendar, MessageSquare, Truck, Settings, LogOut, Menu, X, Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { section: 'Overview' },
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { section: 'Management' },
  { label: 'Tours', icon: Map, href: '/admin/tours' },
  { label: 'Drivers', icon: Users, href: '/admin/drivers' },
  { label: 'Bookings', icon: Calendar, href: '/admin/bookings' },
  { label: 'Custom Requests', icon: MessageSquare, href: '/admin/requests' },
  { label: 'Fleet', icon: Truck, href: '/admin/fleet' },
  { section: 'System' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export default function AdminLayout({ children, title, breadcrumbs, actions }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return location === '/admin' || location === '/admin/';
    return location.startsWith(href);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-3 border-b border-forest-600/50">
        <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-forest-700 font-display text-xl italic pr-0.5">P</div>
        <span className="font-display text-lg text-white tracking-wide">Peacock Admin</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, i) => {
          if ('section' in item && item.section) {
            return (
              <div key={i} className={cn('px-3 font-body text-[10px] font-bold text-forest-400 uppercase tracking-widest', i > 0 ? 'mt-6 mb-2' : 'mb-2')}>
                {item.section}
              </div>
            );
          }
          const Icon = (item as any).icon;
          const href = (item as any).href;
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors',
                active
                  ? 'bg-forest-500/20 text-white font-medium border-l-2 border-amber-400'
                  : 'text-forest-200 hover:bg-forest-600 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4', active && 'text-amber-400')} />
              {(item as any).label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-forest-600/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest-500 flex items-center justify-center text-white font-body text-sm font-bold">SS</div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm text-white font-medium truncate">Sameer Shahid</p>
            <p className="font-body text-[10px] text-forest-300">Admin</p>
          </div>
          <button className="p-1.5 text-forest-300 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <aside className="w-[260px] bg-forest-700 hidden lg:flex flex-col sticky top-0 h-screen shrink-0">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-[260px] bg-forest-700 h-full">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white z-10">
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-warm-200 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-warm-500 hover:text-forest-600">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center bg-warm-50 rounded-full px-4 py-2 border border-warm-200 w-72">
              <Search className="w-4 h-4 text-warm-400 mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none font-body text-sm w-full text-forest-600 placeholder:text-warm-400" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-warm-500 hover:text-forest-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-xs font-bold border border-forest-200">
              SS
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1.5 font-body text-xs text-warm-400 mb-1">
                  {breadcrumbs.map((bc, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && <span>/</span>}
                      {bc.href ? (
                        <Link href={bc.href} className="hover:text-forest-600 transition-colors">{bc.label}</Link>
                      ) : (
                        <span className="text-warm-600">{bc.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="font-display text-2xl lg:text-3xl text-forest-600">{title}</h1>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
