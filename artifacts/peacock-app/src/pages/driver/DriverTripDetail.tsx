import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, Users, Car, Clock, AlertTriangle, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { useDriverBooking, useTour, useUpdateDriverStatus } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  assigned: { bg: 'bg-blue-500', text: 'text-white', label: 'Assigned' },
  accepted: { bg: 'bg-amber-500', text: 'text-white', label: 'Accepted' },
  'in-progress': { bg: 'bg-forest-600', text: 'text-white', label: 'In Progress' },
  completed: { bg: 'bg-warm-200', text: 'text-warm-600', label: 'Completed' },
};

export default function DriverTripDetail() {
  const params = useParams<{ id: string }>();
  const tripId = params?.id || '';
  const { data: trip, isLoading } = useDriverBooking(tripId);
  const tourSlug = trip?.tourId || '';
  const { data: tour } = useTour(tourSlug);
  const { format } = useCurrency();
  const updateStatus = useUpdateDriverStatus();
  const [itineraryOpen, setItineraryOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-5 text-center pt-20">
        <p className="font-body text-warm-500 mb-4">Trip not found</p>
        <Link href="/driver/trips">
          <span className="font-body text-amber-600 font-medium hover:underline">Back to trips</span>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[trip.driverStatus || 'assigned'] || STATUS_CONFIG.assigned;
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isStartDay = trip.startDate === todayStr;
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="pb-32 md:pb-8">
      <div className={cn('px-5 pt-12 pb-6 md:pt-8', statusCfg.bg)}>
        <div className="max-w-lg mx-auto md:max-w-3xl">
          <Link href="/driver/trips">
            <span className={cn('inline-flex items-center gap-1.5 font-body text-sm mb-4', statusCfg.text, 'opacity-80 hover:opacity-100')}>
              <ArrowLeft className="w-4 h-4" /> Back to trips
            </span>
          </Link>
          <p className={cn('font-body text-sm uppercase tracking-wider mb-1', statusCfg.text, 'opacity-70')}>Status</p>
          <h1 className={cn('font-display text-3xl', statusCfg.text)}>{statusCfg.label}</h1>
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-6 space-y-5">
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <h2 className="font-body text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">Tourist</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center">
              <span className="font-display text-lg text-forest-600">{trip.customer.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <p className="font-body font-semibold text-forest-600">{trip.customer.name}</p>
              <p className="font-body text-xs text-warm-400">{trip.passengers} passengers {"\u00B7"} <Flag className="w-3 h-3 inline" /> {trip.customer.country}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={`tel:${trip.customer.phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-forest-600 hover:bg-forest-500 text-white rounded-xl min-h-[48px] font-body text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" /> Call tourist
            </a>
            <a
              href={`https://wa.me/${trip.customer.phone.replace(/\s+/g, '').replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl min-h-[48px] font-body text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <h2 className="font-body text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">Trip details</h2>
          <h3 className="font-display text-xl text-forest-600 mb-4">{trip.title}</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Dates</p>
                <p className="font-body text-sm text-forest-600">
                  {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {"\u2013"} {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Pickup</p>
                <p className="font-body text-sm text-forest-600">{trip.pickupTime || 'TBC'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Pickup location</p>
                <p className="font-body text-sm text-forest-600">{trip.pickupLocation || 'TBC'}</p>
              </div>
            </div>
            {trip.dropoffLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-warm-400 mt-0.5" />
                <div>
                  <p className="font-body text-xs text-warm-400">Drop-off</p>
                  <p className="font-body text-sm text-forest-600">{trip.dropoffLocation}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Car className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Vehicle</p>
                <p className="font-body text-sm text-forest-600">{trip.vehicle} {"\u00B7"} {trip.plateNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Passengers</p>
                <p className="font-body text-sm text-forest-600">{trip.passengers}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-warm-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-warm-400" />
              <span className="font-body text-xs text-warm-400">Route preview</span>
            </div>
            <div className="bg-warm-100 rounded-lg h-32 flex items-center justify-center">
              <span className="font-body text-sm text-warm-400">Map placeholder</span>
            </div>
          </div>
        </div>

        {trip.specialRequests && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-body text-sm font-semibold text-amber-800 mb-1">Special requests</h3>
                <p className="font-body text-sm text-amber-700">{trip.specialRequests}</p>
              </div>
            </div>
          </div>
        )}

        {trip.adminNotes && (
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
            <h3 className="font-body text-sm font-semibold text-blue-800 mb-1">Admin notes</h3>
            <p className="font-body text-sm text-blue-700">{trip.adminNotes}</p>
          </div>
        )}

        {tour && tour.itinerary && tour.itinerary.length > 0 && (
          <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setItineraryOpen(!itineraryOpen)}
              className="w-full flex items-center justify-between p-5 min-h-[56px]"
            >
              <h2 className="font-body text-sm font-semibold text-forest-600">Day-by-day itinerary ({tour.itinerary.length} days)</h2>
              {itineraryOpen ? <ChevronUp className="w-5 h-5 text-warm-400" /> : <ChevronDown className="w-5 h-5 text-warm-400" />}
            </button>
            {itineraryOpen && (
              <div className="px-5 pb-5 space-y-4">
                {tour.itinerary.map((day: any) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center shrink-0">
                      <span className="font-body text-xs font-semibold text-forest-600">{day.day}</span>
                    </div>
                    <div className="flex-1 pb-4 border-b border-warm-100 last:border-0">
                      <p className="font-body text-sm font-semibold text-forest-600">{day.title}</p>
                      <p className="font-body text-xs text-warm-400 mt-0.5">{day.location} {day.drivingTime ? `\u00B7 ${day.drivingTime}` : ''}</p>
                      <p className="font-body text-xs text-warm-500 mt-1">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-xs text-warm-400">Your earnings</p>
              <p className="font-display text-2xl text-emerald-600">{format(trip.driverEarnings)}</p>
            </div>
            <span className="font-body text-xs text-warm-400 bg-warm-50 px-3 py-1 rounded-pill">{trip.id}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-5 md:static md:px-0 md:mt-6 md:max-w-lg md:mx-auto z-40">
        <div className="max-w-lg mx-auto md:max-w-3xl">
          {trip.driverStatus === 'assigned' && (
            <button
              onClick={() => updateStatus.mutate({ id: trip.id, status: 'accepted' })}
              disabled={updateStatus.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-body text-base font-semibold rounded-2xl min-h-[56px] shadow-lg transition-colors disabled:opacity-60"
            >
              {updateStatus.isPending ? 'Accepting...' : 'Accept trip'}
            </button>
          )}
          {trip.driverStatus === 'accepted' && (
            <button
              disabled={!isStartDay || updateStatus.isPending}
              onClick={() => isStartDay && updateStatus.mutate({ id: trip.id, status: 'in-progress' })}
              className={cn(
                'w-full font-body text-base font-semibold rounded-2xl min-h-[56px] shadow-lg transition-colors disabled:opacity-60',
                isStartDay
                  ? 'bg-amber-500 hover:bg-amber-400 text-white'
                  : 'bg-warm-200 text-warm-400 cursor-not-allowed'
              )}
            >
              {updateStatus.isPending ? 'Starting...' : isStartDay ? 'Start trip' : `Starts ${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
            </button>
          )}
          {trip.driverStatus === 'in-progress' && (
            <button
              onClick={() => updateStatus.mutate({ id: trip.id, status: 'completed' })}
              disabled={updateStatus.isPending}
              className="w-full bg-forest-600 hover:bg-forest-500 text-white font-body text-base font-semibold rounded-2xl min-h-[56px] shadow-lg transition-colors disabled:opacity-60"
            >
              {updateStatus.isPending ? 'Completing...' : 'Complete trip'}
            </button>
          )}
          {trip.driverStatus === 'completed' && (
            <button disabled className="w-full bg-warm-200 text-warm-500 font-body text-base font-semibold rounded-2xl min-h-[56px] cursor-not-allowed">
              Trip completed {"\u2713"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
