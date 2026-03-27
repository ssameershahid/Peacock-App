import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, CalendarDays, Wallet, UserCircle, LogOut, Bell, CalendarPlus, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-app-data';
import { useIsMobile } from '@/hooks/use-mobile';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: Home, href: '/driver' },
  { label: 'Trips', icon: CalendarDays, href: '/driver/trips' },
  { label: 'Earnings', icon: Wallet, href: '/driver/earnings' },
  { label: 'Profile', icon: UserCircle, href: '/driver/profile' },
];

const NOTIF_ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  TRIP_ASSIGNED: { icon: CalendarPlus, color: 'bg-forest-100 text-forest-600' },
  SCHEDULE_CHANGE: { icon: Clock, color: 'bg-amber-50 text-amber-500' },
  TOURIST_UPDATE: { icon: MessageSquare, color: 'bg-blue-100 text-blue-600' },
  PAYMENT_RECEIVED: { icon: Wallet, color: 'bg-green-100 text-green-600' },
  TRIP_REMINDER: { icon: Bell, color: 'bg-amber-50 text-amber-500' },
};

function timeAgo(date: string | Date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { data: notifications = [] } = useDriverNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const handleItemClick = (n: any) => {
    if (!n.isRead) markRead.mutate(n.id);
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        'bg-white z-[60]',
        isMobile
          ? 'fixed inset-x-0 bottom-0 top-[30%] rounded-t-2xl shadow-modal animate-slide-up'
          : 'absolute right-0 top-full mt-2 w-[380px] max-h-[480px] rounded-xl shadow-modal border border-warm-100'
      )}
    >
      {isMobile && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-200" />
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100">
        <h3 className="font-body text-base font-semibold text-warm-900">Notifications</h3>
        {notifications.some((n: any) => !n.isRead) && (
          <button
            onClick={() => markAllRead.mutate()}
            className="font-body text-[13px] text-forest-500 hover:text-forest-600 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(70vh - 80px)' : '400px' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="w-10 h-10 text-warm-300 mb-3" />
            <p className="font-body text-sm text-warm-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n: any) => {
            const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.TRIP_REMINDER;
            const Icon = cfg.icon;
            return (
              <button
                key={n.id}
                onClick={() => handleItemClick(n)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-warm-100/60 hover:bg-warm-50 transition-colors"
              >
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', cfg.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-warm-900 leading-snug">{n.title}</p>
                  <p className="font-body text-[13px] text-warm-500 line-clamp-2 mt-0.5">{n.message}</p>
                  <p className="font-body text-xs text-warm-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-forest-500 mt-1.5 shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const { data: notifications = [] } = useDriverNotifications();
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const hasNewTrip = notifications.some((n: any) => n.type === 'TRIP_ASSIGNED' && !n.isRead);

  const isActive = (href: string) => {
    if (href === '/driver') return location === '/driver' || location === '/driver/';
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-20 md:pb-0">
      {/* Mobile content */}
      <div className="md:hidden">
        {children}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex min-h-screen">
        <aside className="w-[220px] bg-white border-r border-warm-100 p-6 sticky top-0 h-screen flex flex-col">
          <Link href="/" className="flex items-center gap-3 mb-10 group">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-forest-600 font-display text-2xl italic pr-1 group-hover:bg-amber-300 transition-colors">P</div>
            <span className="font-display text-xl text-forest-600">Peacock Drivers</span>
          </Link>
          <nav className="space-y-1 flex-1">
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
                      ? 'bg-forest-50 text-forest-600 font-medium border-l-[3px] border-forest-500'
                      : 'text-warm-500 hover:bg-warm-50 hover:text-forest-600'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-warm-400 hover:bg-red-50 hover:text-red-500 transition-colors mt-auto"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </aside>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-[0.5px] border-warm-200 flex justify-around items-center z-50 md:hidden"
        style={{ height: '64px', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const showRedDot = item.label === 'Trips' && hasNewTrip;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full min-h-[64px] relative"
            >
              {active && (
                <div className="absolute top-1.5 w-1 h-1 rounded-full bg-forest-500" />
              )}
              <div className="relative">
                <Icon className={cn('w-6 h-6', active ? 'text-forest-600 stroke-[2.5]' : 'text-warm-400')} />
                {showRedDot && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <span className={cn(
                'font-body text-[11px] font-medium mt-0.5',
                active ? 'text-forest-600' : 'text-warm-400'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Notification panel overlay */}
      {showNotifs && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[55] md:hidden" onClick={() => setShowNotifs(false)} />
          <NotificationPanel onClose={() => setShowNotifs(false)} />
        </>
      )}
    </div>
  );
}

// Exported for use by page components that need the notification bell in their hero
export function NotificationBell({ className }: { className?: string }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const { data: notifications = [] } = useDriverNotifications();
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setShowNotifs(!showNotifs)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <Bell className="w-[22px] h-[22px] text-white/80" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-body font-semibold flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
    </div>
  );
}
