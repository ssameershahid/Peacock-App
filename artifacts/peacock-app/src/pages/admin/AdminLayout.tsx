import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Map, Users, Calendar, MessageSquare, Truck, Settings,
  LogOut, Menu, X, Search, Bell, UserRound, Loader2, Mail, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSearch, useAdminAttention } from '@/hooks/use-app-data';

// ── Category config for search results ──────────────────────────────────────
const SEARCH_CATEGORIES = [
  { key: 'bookings',       label: 'Bookings',        icon: Calendar,       baseHref: '/admin/bookings' },
  { key: 'customers',      label: 'Customers',       icon: UserRound,      baseHref: '/admin/customers' },
  { key: 'drivers',        label: 'Drivers',         icon: Users,          baseHref: '/admin/drivers' },
  { key: 'tours',          label: 'Tours',           icon: Map,            baseHref: '/admin/tours' },
  { key: 'customRequests', label: 'Custom Requests', icon: MessageSquare,  baseHref: '/admin/requests' },
] as const;

type SearchCategoryKey = (typeof SEARCH_CATEGORIES)[number]['key'];

// ── Nav items with badge keys ───────────────────────────────────────────────
type NavSection = { section: string };
type NavLink = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badgeKey?: 'bookings' | 'customRequests' | 'drivers';
  badgeColor?: 'amber' | 'red';
};
type NavItem = NavSection | NavLink;

const NAV_ITEMS: NavItem[] = [
  { section: 'Overview' },
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { section: 'Management' },
  { label: 'Tours', icon: Map, href: '/admin/tours' },
  { label: 'Drivers', icon: Users, href: '/admin/drivers', badgeKey: 'drivers', badgeColor: 'red' },
  { label: 'Bookings', icon: Calendar, href: '/admin/bookings', badgeKey: 'bookings', badgeColor: 'amber' },
  { label: 'Custom Requests', icon: MessageSquare, href: '/admin/requests', badgeKey: 'customRequests', badgeColor: 'amber' },
  { label: 'CYO Pricing', icon: Tag, href: '/admin/cyo-pricing' },
  { label: 'Leads', icon: Mail, href: '/admin/leads' },
  { label: 'Fleet', icon: Truck, href: '/admin/fleet' },
  { label: 'Customers', icon: UserRound, href: '/admin/customers' },
  { section: 'System' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

function isNavLink(item: NavItem): item is NavLink {
  return 'href' in item;
}

// ── Global Search component ─────────────────────────────────────────────────
function GlobalSearch() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce the query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchData, isLoading } = useAdminSearch(debouncedQuery);

  // Build a flat list of all results for keyboard navigation
  const flatResults = useCallback(() => {
    if (!searchData) return [];
    const results: { category: SearchCategoryKey; item: any; href: string }[] = [];
    for (const cat of SEARCH_CATEGORIES) {
      const items: any[] = (searchData as any)?.[cat.key] ?? [];
      for (const item of items) {
        const id = item.id || item._id || '';
        results.push({ category: cat.key, item, href: `${cat.baseHref}/${id}` });
      }
    }
    return results;
  }, [searchData]);

  const allResults = flatResults();
  const hasResults = allResults.length > 0;
  const showDropdown = open && debouncedQuery.length >= 2;

  // Reset selection when results change
  useEffect(() => { setSelectedIndex(0); }, [searchData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigateToResult = useCallback((href: string) => {
    navigate(href);
    setQuery('');
    setDebouncedQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (allResults[selectedIndex]) {
          navigateToResult(allResults[selectedIndex].href);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (!showDropdown) return;
    const el = dropdownRef.current?.querySelector(`[data-result-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, showDropdown]);

  const getResultLabel = (item: any): string => {
    return item.name || item.title || item.fullName ||
      [item.firstName, item.lastName].filter(Boolean).join(' ') ||
      item.reference || item.email || item.id || 'Untitled';
  };

  const getResultSub = (item: any): string | null => {
    return item.email || item.date || item.status || item.destination || null;
  };

  // Track the running index across categories for flat-list keyboard nav
  let runningIndex = 0;

  return (
    <div className="relative hidden sm:block">
      <div className="flex items-center bg-warm-50 rounded-full px-4 py-2 border border-warm-200 w-72 focus-within:border-forest-400 focus-within:ring-1 focus-within:ring-forest-400/30 transition-all">
        <Search className="w-4 h-4 text-warm-400 mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.trim().length >= 2) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="bg-transparent border-none outline-none font-body text-sm w-full text-forest-600 placeholder:text-warm-400"
        />
        {isLoading && debouncedQuery.length >= 2 && (
          <Loader2 className="w-4 h-4 text-warm-400 animate-spin shrink-0" />
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-[480px] bg-white rounded-xl shadow-lg border border-warm-100 max-h-[400px] overflow-y-auto z-50"
        >
          {isLoading && !searchData ? (
            <div className="flex items-center justify-center py-10 text-warm-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="font-body text-sm">Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center text-warm-400 font-body text-sm">
              No results found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            SEARCH_CATEGORIES.map(cat => {
              const items: any[] = (searchData as any)?.[cat.key] ?? [];
              if (items.length === 0) return null;
              const CatIcon = cat.icon;
              const startIdx = runningIndex;
              runningIndex += items.length;

              return (
                <div key={cat.key} className="py-2">
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <CatIcon className="w-3.5 h-3.5 text-warm-400" />
                    <span className="font-body text-[11px] font-bold text-warm-400 uppercase tracking-widest">
                      {cat.label}
                    </span>
                  </div>
                  {items.map((item: any, i: number) => {
                    const globalIdx = startIdx + i;
                    const isSelected = globalIdx === selectedIndex;
                    const href = `${cat.baseHref}/${item.id || item._id || ''}`;
                    return (
                      <button
                        key={item.id || item._id || i}
                        data-result-index={globalIdx}
                        onClick={() => navigateToResult(href)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={cn(
                          'w-full text-left px-4 py-2 flex items-center gap-3 transition-colors cursor-pointer',
                          isSelected ? 'bg-forest-50' : 'hover:bg-warm-50'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-forest-600 truncate">{getResultLabel(item)}</p>
                          {getResultSub(item) && (
                            <p className="font-body text-xs text-warm-400 truncate">{getResultSub(item)}</p>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-body text-warm-300 bg-warm-100 px-1.5 py-0.5 rounded">
                            Enter
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Sidebar Badge ───────────────────────────────────────────────────────────
function SidebarBadge({ count, color }: { count: number; color: 'amber' | 'red' }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={cn(
        'ml-auto flex items-center justify-center rounded-full font-body text-[10px] font-bold leading-none',
        'min-w-[18px] h-[18px] px-1',
        color === 'amber' && 'bg-amber-100 text-amber-700',
        color === 'red' && 'bg-red-100 text-red-600'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ── AdminLayout ─────────────────────────────────────────────────────────────
interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export default function AdminLayout({ children, title, breadcrumbs, actions }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'AD';
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Admin';

  const { data: attention } = useAdminAttention();
  const badges = (attention as any)?.badges as Record<string, number> | undefined;

  const isActive = (href: string) => {
    if (href === '/admin') return location === '/admin' || location === '/admin/';
    return location.startsWith(href);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <Link href="/" className="p-5 flex items-center gap-3 border-b border-forest-600/50 hover:bg-forest-600/30 transition-colors">
        <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-forest-700 font-display text-xl italic pr-0.5">P</div>
        <span className="font-display text-lg text-white tracking-wide">Peacock Admin</span>
      </Link>
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, i) => {
          if (!isNavLink(item)) {
            return (
              <div key={i} className={cn('px-3 font-body text-[10px] font-bold text-forest-400 uppercase tracking-widest', i > 0 ? 'mt-6 mb-2' : 'mb-2')}>
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          const active = isActive(item.href);
          const badgeCount = item.badgeKey && badges ? badges[item.badgeKey] ?? 0 : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors',
                active
                  ? 'bg-forest-500/20 text-white font-medium border-l-2 border-amber-200'
                  : 'text-forest-200 hover:bg-forest-600 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4', active && 'text-amber-200')} />
              {item.label}
              {item.badgeKey && item.badgeColor && (
                <SidebarBadge count={badgeCount} color={item.badgeColor} />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-forest-600/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest-500 flex items-center justify-center text-white font-body text-sm font-bold">{initials}</div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm text-white font-medium truncate">{displayName}</p>
            <p className="font-body text-[10px] text-forest-300">Admin</p>
          </div>
          <button onClick={logout} className="p-1.5 text-forest-300 hover:text-white transition-colors">
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
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-warm-500 hover:text-forest-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-xs font-bold border border-forest-200">
              {initials}
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
