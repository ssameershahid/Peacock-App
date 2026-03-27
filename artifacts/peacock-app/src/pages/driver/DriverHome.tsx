import { Link } from 'wouter';
import { ArrowRight, MapPin, Clock, Star, Calendar, Wallet, ChevronRight, Phone, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { useDriverProfile, useDriverBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { NotificationBell } from './DriverLayout';
import { cn } from '@/lib/utils';

export default function DriverHome() {
  const { data: profile, isLoading: profileLoading } = useDriverProfile();
  const { data: bookings, isLoading: bookingsLoading } = useDriverBookings();
  const { format } = useCurrency();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const upcomingTrips = (bookings || [])
    .filter(b => b.startDate >= todayStr && b.driverStatus !== 'completed')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const next3 = upcomingTrips.slice(0, 3);
  const todayTrip = upcomingTrips.find(b => b.startDate === todayStr);

  const completedTrips = (bookings || [])
    .filter(b => b.driverStatus === 'completed')
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  const completedThisMonth = completedTrips.filter(b => {
    const d = new Date(b.endDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);
  const weekTrips = (bookings || []).filter(b => b.startDate >= weekStartStr && b.startDate <= weekEndStr);
  const weekEarnings = weekTrips.reduce((sum, b) => sum + (b.driverEarnings || 0), 0);
  const weekRemaining = weekTrips.filter(b => b.driverStatus !== 'completed').length;

  // Last week comparison
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekEnd);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
  const lastWeekTrips = (bookings || []).filter(b => {
    const d = b.startDate;
    return d >= lastWeekStart.toISOString().slice(0, 10) && d <= lastWeekEnd.toISOString().slice(0, 10);
  });
  const lastWeekEarnings = lastWeekTrips.reduce((sum, b) => sum + (b.driverEarnings || 0), 0);
  const earningsTrend = lastWeekEarnings > 0 ? Math.round(((weekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100) : 0;

  // Recent activity
  const recentActivity: { type: string; text: string; time: string; color: string }[] = [];
  completedTrips.slice(0, 3).forEach(trip => {
    recentActivity.push({
      type: 'completed',
      text: `Trip completed: ${trip.title} with ${trip.customer?.name || 'Guest'}`,
      time: timeAgo(trip.endDate),
      color: 'bg-forest-500',
    });
  });

  const isLoading = profileLoading || bookingsLoading;

  return (
    <div>
      {/* Compact hero */}
      <div className="bg-forest-600 text-white px-5 pt-10 pb-6 rounded-b-[32px] md:rounded-none md:pt-6 md:pb-5" style={{ minHeight: '120px' }}>
        <div className="max-w-lg mx-auto md:max-w-3xl">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-forest-600 font-display text-2xl italic pr-1 md:hidden">P</div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-forest-400 overflow-hidden border-2 border-white/30 flex items-center justify-center">
                {profile?.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-lg text-white">{profile?.name?.charAt(0) || 'D'}</span>
                )}
              </div>
            </div>
            <NotificationBell />
          </div>
          <p className="font-body text-white/70 text-sm">{greeting},</p>
          <h1 className="font-body text-xl font-medium text-white">{profile?.name || 'Driver'}</h1>
          <p className="font-body text-white/50 text-sm mt-0.5">{dateLabel}</p>
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-5 pb-8">
        {/* Upcoming trips section */}
        {isLoading ? (
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : next3.length > 0 ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-body text-base font-semibold text-warm-900">Coming up</h2>
              <Link href="/driver/trips">
                <span className="font-body text-[13px] text-forest-500 font-medium hover:text-forest-600 flex items-center gap-0.5">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {next3.map(trip => {
                const startDate = new Date(trip.startDate);
                const isToday = trip.startDate === todayStr;
                return (
                  <Link key={trip.id} href={`/driver/trips/${trip.id}`}>
                    <div className={cn(
                      'bg-white rounded-xl border border-warm-100 p-4 cursor-pointer hover:shadow-card-hover hover:-translate-y-[1px] transition-all duration-200 flex items-center gap-3',
                      isToday && 'border-l-[3px] border-l-amber-200'
                    )}>
                      {/* Date block */}
                      <div className="w-12 h-14 rounded-lg bg-forest-50 flex flex-col items-center justify-center shrink-0">
                        {isToday && (
                          <span className="font-body text-[9px] font-semibold text-amber-500 uppercase tracking-wider">Today</span>
                        )}
                        <span className="font-display text-xl text-forest-500 leading-tight">{startDate.getDate()}</span>
                        <span className="font-body text-[10px] text-warm-500 uppercase">{startDate.toLocaleDateString('en-GB', { month: 'short' })}</span>
                      </div>

                      {/* Trip info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-[15px] font-medium text-warm-900 truncate">{trip.title}</p>
                        <p className="font-body text-[13px] text-warm-500 truncate">
                          {trip.customer?.name || 'Guest'} {trip.customer?.country ? `🇱🇰` : ''}
                        </p>
                        {trip.pickupTime && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-warm-400" />
                            <span className="font-body text-[13px] text-warm-400">
                              {trip.pickupTime} {trip.pickupLocation ? `· ${trip.pickupLocation}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right section */}
                      <div className="flex items-center gap-2 shrink-0">
                        {trip.customer?.phone && (
                          <a
                            href={`tel:${trip.customer.phone}`}
                            onClick={e => e.stopPropagation()}
                            className="w-8 h-8 rounded-full border border-forest-200 flex items-center justify-center text-forest-500 hover:bg-forest-50 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <ChevronRight className="w-4 h-4 text-warm-300" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-warm-100 p-5 mb-6 text-center">
            <Calendar className="w-10 h-10 text-warm-300 mx-auto mb-2" />
            <h3 className="font-display text-lg text-warm-900 mb-1">No upcoming trips</h3>
            <p className="font-body text-sm text-warm-500 mb-3">New trips will appear here when assigned.</p>
            <Link href="/driver/trips">
              <span className="font-body text-sm text-forest-500 font-medium hover:underline inline-flex items-center gap-1">
                View all trips <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        )}

        {/* Stats cards */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-warm-100 shadow-sm">
              <p className="font-body text-xs text-warm-500 mb-1">Trips this week</p>
              <p className="font-display text-2xl text-forest-600">{weekTrips.length}</p>
              <p className="font-body text-[11px] text-warm-400 mt-0.5">{weekRemaining} remaining</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-warm-100 shadow-sm">
              <p className="font-body text-xs text-warm-500 mb-1">Est. earnings</p>
              <p className="font-display text-2xl text-forest-600">{format(weekEarnings)}</p>
              {earningsTrend !== 0 && (
                <div className={cn('flex items-center gap-0.5 mt-0.5', earningsTrend > 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {earningsTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="font-body text-[11px] font-medium">{Math.abs(earningsTrend)}% vs last wk</span>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-4 border border-warm-100 shadow-sm">
              <p className="font-body text-xs text-warm-500 mb-1">This month</p>
              <p className="font-display text-2xl text-forest-600">{completedThisMonth.length}</p>
              <p className="font-body text-[11px] text-warm-400 mt-0.5">completed</p>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/driver/trips">
            <div className="bg-white rounded-xl p-4 border border-warm-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center justify-center gap-2 min-h-[48px]">
              <Calendar className="w-5 h-5 text-forest-500" />
              <span className="font-body text-sm font-medium text-forest-600">View all trips</span>
            </div>
          </Link>
          <Link href="/driver/profile">
            <div className="bg-white rounded-xl p-4 border border-warm-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center justify-center gap-2 min-h-[48px]">
              <Wallet className="w-5 h-5 text-forest-500" />
              <span className="font-body text-sm font-medium text-forest-600">Update profile</span>
            </div>
          </Link>
        </div>

        {/* Recent activity */}
        {completedTrips.length > 0 && (
          <div>
            <h3 className="font-body text-base font-semibold text-warm-900 mb-3">Recent activity</h3>
            <div className="space-y-2">
              {completedTrips.slice(0, 5).map(trip => (
                <div key={trip.id} className="flex items-start gap-3 py-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    trip.driverEarnings > 0 ? 'bg-emerald-500' : 'bg-forest-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[13px] text-warm-600 truncate">
                      Trip completed: {trip.title} with {trip.customer?.name || 'Guest'}
                    </p>
                    {trip.driverEarnings > 0 && (
                      <p className="font-body text-[13px] font-medium text-emerald-600">{format(trip.driverEarnings)}</p>
                    )}
                  </div>
                  <span className="font-body text-xs text-warm-400 shrink-0">
                    {timeAgo(trip.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}
