import { Link } from 'wouter';
import { ArrowRight, MapPin, Clock, Star, Calendar, Wallet } from 'lucide-react';
import { useDriverProfile, useDriverBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function DriverHome() {
  const { data: profile } = useDriverProfile();
  const { data: bookings } = useDriverBookings();
  const { format } = useCurrency();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const todayTrip = bookings?.find(b => b.startDate === todayStr && b.driverStatus !== 'completed');
  const upcomingTrips = bookings?.filter(b => b.startDate >= todayStr && b.driverStatus !== 'completed') || [];
  const completedTrips = bookings?.filter(b => b.driverStatus === 'completed')
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()) || [];
  const recentCompleted = completedTrips.slice(0, 3);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);

  const weekTrips = bookings?.filter(b => b.startDate >= weekStartStr && b.startDate <= weekEndStr) || [];
  const weekEarnings = weekTrips.reduce((sum, b) => sum + (b.driverEarnings || 0), 0);
  const weekRemaining = weekTrips.filter(b => b.driverStatus !== 'completed').length;

  return (
    <div>
      <div className="bg-forest-600 text-white px-5 pt-12 pb-24 rounded-b-[32px] md:rounded-none md:pt-8 md:pb-16">
        <div className="max-w-lg mx-auto md:max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-forest-600 font-display text-2xl italic pr-1 md:hidden">P</div>
            <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
              {profile?.photo && <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />}
            </div>
          </div>
          <p className="font-body text-white/70 text-sm mb-1">{greeting},</p>
          <h1 className="font-display text-3xl md:text-4xl mb-2">{profile?.name || 'Driver'}</h1>
          <p className="font-body text-white/60 text-sm">{dateLabel}</p>
        </div>
      </div>

      <div className="px-5 -mt-16 max-w-lg mx-auto md:max-w-3xl pb-8">
        {todayTrip ? (
          <Link href={`/driver/trips/${todayTrip.id}`}>
            <div className="bg-white rounded-2xl shadow-lg border border-warm-100 p-6 mb-6 cursor-pointer hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-body text-xs font-medium text-amber-600 uppercase tracking-wider">Next pickup</span>
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-display text-2xl text-forest-600 mb-1">{todayTrip.pickupTime || 'TBC'}</p>
                  <h3 className="font-body font-semibold text-forest-600">{todayTrip.title}</h3>
                </div>
                <span className="bg-forest-50 text-forest-600 font-body text-xs font-medium px-3 py-1 rounded-pill">{todayTrip.vehicle}</span>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-body text-xs text-warm-400">Pickup</p>
                    <p className="font-body text-sm text-forest-600">{todayTrip.pickupLocation || 'TBC'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-forest-100 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-forest-500 rounded-full" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-warm-400">Tourist</p>
                    <p className="font-body text-sm text-forest-600">{todayTrip.customer.name} {"\u00B7"} {todayTrip.passengers} pax</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-forest-50 rounded-xl px-4 py-3">
                <span className="font-body text-sm font-medium text-forest-600">View trip</span>
                <ArrowRight className="w-5 h-5 text-forest-500" />
              </div>
            </div>
          </Link>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-warm-100 p-6 mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-50 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-warm-300" />
            </div>
            <h3 className="font-display text-xl text-forest-600 mb-1">No trips today</h3>
            <p className="font-body text-sm text-warm-400 mb-4">Enjoy your day off!</p>
            <Link href="/driver/trips">
              <span className="font-body text-sm text-amber-600 font-medium hover:underline inline-flex items-center gap-1">
                View upcoming trips <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-warm-100 shadow-sm">
            <p className="font-body text-sm text-warm-500 mb-2">Trips this week</p>
            <p className="font-display text-3xl text-forest-600">{weekTrips.length}</p>
            <p className="font-body text-xs text-warm-400 mt-1">{weekRemaining} remaining</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-warm-100 shadow-sm">
            <p className="font-body text-sm text-warm-500 mb-2">Est. earnings</p>
            <p className="font-display text-3xl text-forest-600">{format(weekEarnings)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/driver/trips">
            <div className="bg-white rounded-2xl p-5 border border-warm-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[56px] flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-forest-500" />
              <span className="font-body text-sm font-medium text-forest-600">View all trips</span>
            </div>
          </Link>
          <Link href="/driver/profile">
            <div className="bg-white rounded-2xl p-5 border border-warm-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[56px] flex items-center justify-center gap-2">
              <Wallet className="w-5 h-5 text-forest-500" />
              <span className="font-body text-sm font-medium text-forest-600">Update profile</span>
            </div>
          </Link>
        </div>

        {recentCompleted.length > 0 && (
          <div>
            <h3 className="font-display text-xl text-forest-600 mb-4">Recent activity</h3>
            <div className="space-y-3">
              {recentCompleted.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl p-4 border border-warm-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warm-50 flex flex-col items-center justify-center">
                      <span className="font-body text-[9px] text-warm-400 uppercase leading-tight">
                        {new Date(trip.endDate).toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                      <span className="font-display text-sm text-forest-600 leading-tight">
                        {new Date(trip.endDate).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-forest-600">{trip.title}</p>
                      <p className="font-body text-xs text-warm-400">{trip.customer.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-sm font-semibold text-emerald-600">{format(trip.driverEarnings)}</p>
                    {trip.rating && (
                      <div className="flex items-center gap-0.5 justify-end mt-0.5">
                        {Array.from({ length: trip.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
