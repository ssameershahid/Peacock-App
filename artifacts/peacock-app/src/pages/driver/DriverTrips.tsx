import { useState } from 'react';
import { Link } from 'wouter';
import { MapPin, Users, Clock, Star, ArrowRight } from 'lucide-react';
import { useDriverBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

export default function DriverTrips() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data: bookings, isLoading } = useDriverBookings();
  const { format } = useCurrency();

  const todayStr = new Date().toISOString().slice(0, 10);

  const upcoming = (bookings || []).filter(
    b => b.driverStatus !== 'completed' && b.startDate >= todayStr
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const past = (bookings || []).filter(
    b => b.driverStatus === 'completed'
  ).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  const trips = tab === 'upcoming' ? upcoming : past;

  const driverStatusLabel = (ds: string | null) => {
    if (!ds) return 'Pending';
    return ds.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div>
      <div className="bg-forest-600 text-white px-5 pt-12 pb-8 rounded-b-[32px] md:rounded-none md:pt-8 md:pb-6">
        <div className="max-w-lg mx-auto md:max-w-3xl">
          <h1 className="font-display text-3xl mb-2">My Trips</h1>
          <p className="font-body text-white/60 text-sm">{upcoming.length} upcoming {"\u00B7"} {past.length} completed</p>
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-6 pb-8">
        <div className="flex gap-2 mb-6">
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

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-warm-100 animate-pulse h-36" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-warm-400">No {tab} trips</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => {
              const startDate = new Date(trip.startDate);
              const endDate = new Date(trip.endDate);
              const dayLabel = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <Link key={trip.id} href={`/driver/trips/${trip.id}`}>
                  <div className="bg-white rounded-2xl p-5 border border-warm-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-forest-50 flex flex-col items-center justify-center shrink-0">
                          <span className="font-body text-[9px] text-forest-500 uppercase leading-tight">
                            {startDate.toLocaleDateString('en-GB', { month: 'short' })}
                          </span>
                          <span className="font-display text-lg text-forest-600 leading-tight">
                            {startDate.getDate()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-body font-semibold text-forest-600 text-sm">{trip.title}</h3>
                          <p className="font-body text-xs text-warm-400 mt-0.5">{dayLabel}</p>
                        </div>
                      </div>
                      <StatusBadge status={tab === 'upcoming' ? driverStatusLabel(trip.driverStatus) : 'Completed'} />
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-warm-500">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-body text-xs">{trip.customer.name} {"\u00B7"} {trip.passengers} pax</span>
                      </div>
                      {trip.pickupTime && (
                        <div className="flex items-center gap-2 text-warm-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-body text-xs">Pickup {trip.pickupTime}</span>
                        </div>
                      )}
                      {trip.pickupLocation && (
                        <div className="flex items-center gap-2 text-warm-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="font-body text-xs">{trip.pickupLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-warm-100">
                      <span className="bg-warm-50 text-warm-600 font-body text-xs font-medium px-3 py-1 rounded-pill">{trip.vehicle}</span>
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
                        <ArrowRight className="w-4 h-4 text-warm-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
