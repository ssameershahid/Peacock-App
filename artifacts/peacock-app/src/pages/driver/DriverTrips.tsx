import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { MapPin, Users, Clock, Star, ArrowRight, ChevronLeft, ChevronRight, CalendarX2, CheckCircle, Phone, AlertCircle, List, CalendarDays } from 'lucide-react';
import { useDriverBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { NotificationBell } from './DriverLayout';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'calendar';

export default function DriverTrips() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data: bookings, isLoading } = useDriverBookings();
  const { format } = useCurrency();

  const todayStr = new Date().toISOString().slice(0, 10);

  const upcoming = useMemo(() =>
    (bookings || [])
      .filter(b => b.driverStatus !== 'completed' && b.startDate >= todayStr)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [bookings, todayStr]
  );

  const past = useMemo(() =>
    (bookings || [])
      .filter(b => b.driverStatus === 'completed')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()),
    [bookings]
  );

  const trips = tab === 'upcoming' ? upcoming : past;

  const driverStatusLabel = (ds: string | null) => {
    if (!ds) return 'Pending';
    return ds.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Calendar data
  const calDays = useMemo(() => {
    const year = calMonth.year;
    const month = calMonth.month;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Fill leading days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), isCurrentMonth: false });
    }
    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dt = new Date(year, month, d);
      days.push({ date: dt.toISOString().slice(0, 10), day: d, isCurrentMonth: true });
    }
    // Fill trailing days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), isCurrentMonth: false });
    }
    return days;
  }, [calMonth]);

  // Map dates to trips for calendar dots
  const tripsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    (bookings || []).forEach(b => {
      const start = new Date(b.startDate);
      const end = b.endDate ? new Date(b.endDate) : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().slice(0, 10);
        if (!map[ds]) map[ds] = [];
        map[ds].push(b);
      }
    });
    return map;
  }, [bookings]);

  const selectedTrips = selectedDate ? (tripsByDate[selectedDate] || []) : [];
  const calMonthLabel = new Date(calMonth.year, calMonth.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCalMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 });
  const nextMonth = () => setCalMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 });

  return (
    <div>
      {/* Hero */}
      <div className="bg-forest-600 text-white px-5 pt-10 pb-6 rounded-b-[32px] md:rounded-none md:pt-6 md:pb-5">
        <div className="max-w-lg mx-auto md:max-w-3xl flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl mb-1">My Trips</h1>
            <p className="font-body text-white/60 text-sm">{upcoming.length} upcoming {"\u00B7"} {past.length} completed</p>
          </div>
          <NotificationBell />
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-5 pb-8">
        {/* Tabs + view toggle */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-2">
            {(['upcoming', 'past'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-5 py-2.5 rounded-pill font-body text-sm font-medium transition-colors min-h-[44px]',
                  tab === t
                    ? 'bg-forest-600 text-white'
                    : 'bg-white text-warm-500 border border-warm-200 hover:bg-warm-50'
                )}
              >
                {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
              </button>
            ))}
          </div>
          {tab === 'upcoming' && (
            <div className="flex bg-white border border-warm-200 rounded-pill overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn('px-3 py-1.5 flex items-center gap-1 font-body text-xs font-medium transition-colors min-h-[36px]',
                  viewMode === 'list' ? 'bg-forest-600 text-white' : 'text-warm-500 hover:bg-warm-50'
                )}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn('px-3 py-1.5 flex items-center gap-1 font-body text-xs font-medium transition-colors min-h-[36px]',
                  viewMode === 'calendar' ? 'bg-forest-600 text-white' : 'text-warm-500 hover:bg-warm-50'
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" /> Calendar
              </button>
            </div>
          )}
        </div>

        {/* Calendar view */}
        {tab === 'upcoming' && viewMode === 'calendar' ? (
          <div>
            <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-4 mb-4">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-9 h-9 rounded-full hover:bg-warm-50 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5 text-warm-500" />
                </button>
                <h3 className="font-body text-sm font-semibold text-warm-900">{calMonthLabel}</h3>
                <button onClick={nextMonth} className="w-9 h-9 rounded-full hover:bg-warm-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5 text-warm-500" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-center font-body text-[11px] text-warm-400 font-medium py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7">
                {calDays.map((day, i) => {
                  const dayTrips = tripsByDate[day.date] || [];
                  const isToday = day.date === todayStr;
                  const isSelected = day.date === selectedDate;
                  const hasTour = dayTrips.some(t => t.type === 'tour' || t.type === 'READY_MADE');
                  const hasTransfer = dayTrips.some(t => t.type === 'transfer' || t.type === 'TRANSFER');

                  return (
                    <button
                      key={i}
                      onClick={() => dayTrips.length > 0 ? setSelectedDate(isSelected ? null : day.date) : setSelectedDate(null)}
                      className={cn(
                        'relative flex flex-col items-center justify-center py-2 rounded-lg transition-colors min-h-[44px]',
                        !day.isCurrentMonth && 'opacity-30',
                        isToday && !isSelected && 'bg-forest-50',
                        isSelected && 'bg-forest-500 text-white',
                        dayTrips.length > 0 && !isSelected && 'cursor-pointer hover:bg-warm-50',
                      )}
                    >
                      <span className={cn(
                        'font-body text-sm',
                        isSelected ? 'text-white font-semibold' : isToday ? 'text-forest-600 font-semibold' : 'text-warm-900'
                      )}>
                        {day.day}
                      </span>
                      {dayTrips.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasTour && <div className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-forest-500')} />}
                          {hasTransfer && <div className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/70' : 'bg-amber-200')} />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected date trip card */}
            {selectedDate && selectedTrips.length > 0 && (
              <div className="space-y-3">
                {selectedTrips.map(trip => (
                  <Link key={trip.id} href={`/driver/trips/${trip.id}`}>
                    <div className="bg-white rounded-xl border border-warm-100 p-4 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body text-[15px] font-medium text-warm-900">{trip.title}</p>
                          <p className="font-body text-[13px] text-warm-500 mt-0.5">{trip.customer?.name || 'Guest'}</p>
                          {trip.pickupTime && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-warm-400" />
                              <span className="font-body text-[13px] text-warm-400">{trip.pickupTime}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={driverStatusLabel(trip.driverStatus)} />
                          <ChevronRight className="w-4 h-4 text-warm-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* List view */
          isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-36 rounded-2xl" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            /* Empty states */
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-cream rounded-2xl">
              {tab === 'upcoming' ? (
                <>
                  <CalendarX2 className="w-12 h-12 text-warm-300 mb-3" />
                  <h3 className="font-display text-xl text-warm-900 mb-1">No upcoming trips</h3>
                  <p className="font-body text-sm text-warm-500 text-center max-w-[280px]">
                    New trips will appear here when the team assigns them to you.
                  </p>
                  <p className="font-body text-[13px] text-warm-400 mt-1">Check back soon or update your availability</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-12 h-12 text-warm-300 mb-3" />
                  <h3 className="font-display text-xl text-warm-900 mb-1">No completed trips yet</h3>
                  <p className="font-body text-sm text-warm-500 text-center max-w-[280px]">
                    Your trip history will build up as you complete journeys.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip, idx) => {
                const startDate = new Date(trip.startDate);
                const isToday = trip.startDate === todayStr;
                const endDate = trip.endDate ? new Date(trip.endDate) : startDate;
                const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <Link key={trip.id} href={`/driver/trips/${trip.id}`}>
                    <div className={cn(
                      'bg-white rounded-2xl p-4 border border-warm-100 shadow-sm cursor-pointer hover:shadow-card-hover hover:-translate-y-[1px] transition-all duration-200',
                      isToday && tab === 'upcoming' && 'border-l-[3px] border-l-amber-200'
                    )}>
                      <div className="flex items-start gap-3">
                        {/* Date column */}
                        <div className="w-14 flex flex-col items-center shrink-0">
                          <div className="w-14 rounded-lg bg-forest-50 flex flex-col items-center justify-center py-2">
                            <span className="font-display text-xl text-forest-500 leading-tight">{startDate.getDate()}</span>
                            <span className="font-body text-[10px] text-warm-400 uppercase">{startDate.toLocaleDateString('en-GB', { month: 'short' })}</span>
                          </div>
                          {/* Timeline connector */}
                          {idx < trips.length - 1 && tab === 'upcoming' && (
                            <div className="w-[1px] h-4 border-l border-dashed border-warm-200 mt-1" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-body text-[15px] font-medium text-warm-900 truncate">{trip.title}</h3>
                                <span className={cn(
                                  'font-body text-[10px] font-medium px-2 py-0.5 rounded-pill shrink-0',
                                  (trip.type === 'tour' || trip.type === 'READY_MADE') ? 'bg-forest-50 text-forest-600' : 'bg-amber-50 text-amber-500'
                                )}>
                                  {(trip.type === 'tour' || trip.type === 'READY_MADE') ? 'Tour' : 'Transfer'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-warm-500">
                                <Users className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-body text-xs truncate">{trip.customer?.name || 'Guest'} {"\u00B7"} {trip.passengers || 1} pax</span>
                              </div>
                            </div>
                            <StatusBadge status={tab === 'upcoming' ? driverStatusLabel(trip.driverStatus) : 'Completed'} />
                          </div>

                          <div className="space-y-1.5">
                            {trip.pickupTime && (
                              <div className="flex items-center gap-2 text-warm-400">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-body text-xs">Pickup {trip.pickupTime}</span>
                              </div>
                            )}
                            {trip.pickupLocation && (
                              <div className="flex items-center gap-2 text-warm-400">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-body text-xs truncate">{trip.pickupLocation}</span>
                              </div>
                            )}
                            {trip.specialRequests && tab === 'upcoming' && (
                              <div className="flex items-center gap-1.5 text-amber-500">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                <span className="font-body text-[11px] font-medium">Special requests</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-warm-100">
                            <div className="flex items-center gap-2">
                              <span className="bg-warm-50 text-warm-600 font-body text-xs font-medium px-3 py-1 rounded-pill">{trip.vehicle || trip.vehicleType}</span>
                              {durationDays > 1 && tab === 'upcoming' && (
                                <span className="font-body text-[11px] text-warm-400">Day 1 of {durationDays}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {tab === 'past' && (
                                <>
                                  <span className="font-body text-sm font-semibold text-emerald-600">{format(trip.driverEarnings)}</span>
                                  {trip.rating && (
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: trip.rating }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-amber-200 text-amber-200" />
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                              <ChevronRight className="w-4 h-4 text-warm-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
