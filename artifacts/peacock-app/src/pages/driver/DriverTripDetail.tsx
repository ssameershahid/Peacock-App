import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Calendar, Users, Car, Clock,
  AlertCircle, ChevronDown, ChevronUp, Flag, CheckCircle, CheckCircle2,
  Play, X, Navigation, XCircle
} from 'lucide-react';
import { useDriverBooking, useTour, useUpdateDriverStatus, useDriverChecklist, useUpdateChecklist } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const STATUS_BANNER: Record<string, { bg: string; text: string; label: string }> = {
  assigned: { bg: 'bg-[#E6F1FB]', text: 'text-[#185FA5]', label: 'Awaiting your acceptance' },
  accepted: { bg: 'bg-[#FDF5E0]', text: 'text-[#8A6200]', label: 'Trip accepted — awaiting start' },
  'in-progress': { bg: 'bg-[#E4EAE4]', text: 'text-forest-600', label: 'Trip in progress' },
  completed: { bg: 'bg-warm-100', text: 'text-warm-600', label: 'Trip completed' },
};

const CHECKLIST_LABELS: Record<string, string> = {
  'vehicle-cleaned': 'Vehicle cleaned and inspected',
  'fuel-full': 'Fuel tank full',
  'welcome-pack': 'Welcome pack prepared (water, towels, snacks)',
  'flight-confirmed': 'Tourist flight details confirmed',
  'route-reviewed': 'Route reviewed and planned',
  'phone-charged': 'Phone fully charged',
};

export default function DriverTripDetail() {
  const params = useParams<{ id: string }>();
  const tripId = params?.id || '';
  const { data: trip, isLoading } = useDriverBooking(tripId);
  const tourSlug = trip?.tourId || '';
  const { data: tour } = useTour(tourSlug);
  const { format } = useCurrency();
  const updateStatus = useUpdateDriverStatus();
  const { data: checklistData } = useDriverChecklist(tripId);
  const updateChecklist = useUpdateChecklist();
  const isMobile = useIsMobile();
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<null | 'accept' | 'decline' | 'start' | 'complete'>(null);
  const [declineReason, setDeclineReason] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <CalendarIcon className="w-12 h-12 text-warm-300 mb-3" />
        <p className="font-display text-xl text-warm-900 mb-1">Trip not found</p>
        <Link href="/driver/trips">
          <span className="font-body text-sm text-forest-500 font-medium hover:underline">Back to trips</span>
        </Link>
      </div>
    );
  }

  const status = trip.driverStatus || 'assigned';
  const banner = STATUS_BANNER[status] || STATUS_BANNER.assigned;
  const startDate = new Date(trip.startDate);
  const endDate = trip.endDate ? new Date(trip.endDate) : startDate;
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date();
  const isStartDay = trip.startDate <= todayStr;
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isMultiDay = durationDays > 1;
  const currentDay = isStartDay ? Math.min(Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1, durationDays) : 0;
  const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Update banner label for in-progress multi-day
  const bannerLabel = status === 'in-progress' && isMultiDay
    ? `Trip in progress — Day ${currentDay} of ${durationDays}`
    : banner.label;

  // Checklist state
  const checklist = checklistData?.items || [];
  const checkedCount = checklist.filter((i: any) => i.checked).length;

  const handleChecklistToggle = (itemId: string, checked: boolean) => {
    const updated = checklist.map((i: any) => i.id === itemId ? { ...i, checked } : i);
    updateChecklist.mutate({ tripId, items: updated });
  };

  const handleStatusAction = (action: string) => {
    if (action === 'accept') {
      updateStatus.mutate({ id: trip.id, status: 'accepted' });
    } else if (action === 'decline') {
      updateStatus.mutate({ id: trip.id, status: 'CANCELLED', reason: declineReason });
    } else if (action === 'start') {
      updateStatus.mutate({ id: trip.id, status: 'in-progress' });
    } else if (action === 'complete') {
      updateStatus.mutate({ id: trip.id, status: 'completed' });
    }
    setShowConfirmModal(null);
    setDeclineReason('');
  };

  // Google Maps deep link for navigation
  const getNavigateUrl = () => {
    if (trip.pickupLocation) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trip.pickupLocation)}`;
    }
    return null;
  };

  return (
    <div className="pb-32 md:pb-8">
      {/* Status banner */}
      <div className={cn('px-5 pt-10 pb-4 md:pt-6', banner.bg)}>
        <div className="max-w-lg mx-auto md:max-w-3xl">
          <Link href="/driver/trips">
            <span className={cn('inline-flex items-center gap-1.5 font-body text-sm mb-3', banner.text, 'opacity-70 hover:opacity-100')}>
              <ArrowLeft className="w-4 h-4" /> Back to trips
            </span>
          </Link>
          <p className={cn('font-body text-xs uppercase tracking-wider mb-0.5', banner.text, 'opacity-60')}>Status</p>
          <h1 className={cn('font-display text-2xl', banner.text)}>{bannerLabel}</h1>
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-5 space-y-4">
        {/* Tourist info card */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <h2 className="font-body text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">Tourist</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-forest-400 flex items-center justify-center shrink-0">
              <span className="font-display text-lg text-white">{trip.customer?.name?.charAt(0) || '?'}</span>
            </div>
            <div className="flex-1">
              <p className="font-body text-lg font-semibold text-warm-900">{trip.customer?.name || 'Guest'}</p>
              <p className="font-body text-sm text-warm-500">
                {trip.customer?.country && <><Flag className="w-3 h-3 inline mr-1" />{trip.customer.country} · </>}
                <Users className="w-3 h-3 inline mr-1" />{trip.passengers || 1} passengers
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={`tel:${trip.customer?.phone || ''}`}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2D7A4F] hover:bg-[#256B44] text-white rounded-full min-h-[48px] font-body text-sm font-medium transition-all duration-200"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
            <a
              href={`https://wa.me/${(trip.customer?.phone || '').replace(/[\s+]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full min-h-[48px] font-body text-sm font-medium transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Trip details card */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <h2 className="font-display text-xl text-warm-900 mb-1">{trip.title}</h2>

          {/* Multi-day progress tracker */}
          {isMultiDay && tour?.itinerary?.length > 0 && (status === 'in-progress' || status === 'accepted' || status === 'completed') && (
            <div className="my-4 overflow-x-auto scrollbar-none -mx-1 px-1">
              <div className="flex items-center gap-0 min-w-max py-2">
                {Array.from({ length: durationDays }).map((_, i) => {
                  const dayNum = i + 1;
                  const isCompleted = status === 'completed' || dayNum < currentDay;
                  const isCurrent = status === 'in-progress' && dayNum === currentDay;
                  const isFuture = dayNum > currentDay && status !== 'completed';
                  const itDay = tour.itinerary[i];
                  const locLabel = itDay?.location?.slice(0, 8) || '';

                  return (
                    <div key={dayNum} className="flex items-center">
                      <div className="flex flex-col items-center" style={{ minWidth: '48px' }}>
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-all',
                          isCompleted && 'bg-forest-500 text-white',
                          isCurrent && 'bg-amber-200 text-white animate-pulse-dot',
                          isFuture && 'border-2 border-warm-200 text-warm-500',
                        )}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : dayNum}
                        </div>
                        <span className="font-body text-[9px] text-warm-400 mt-1 max-w-[48px] truncate text-center">{locLabel}</span>
                      </div>
                      {i < durationDays - 1 && (
                        <div className={cn(
                          'w-4 h-[2px] -mt-3',
                          isCompleted && (i + 1 < currentDay || status === 'completed') ? 'bg-forest-500' : isCurrent ? 'border-t-2 border-dashed border-warm-200' : 'bg-warm-100'
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
              {status === 'in-progress' && currentDay > 0 && tour.itinerary[currentDay - 1] && (
                <p className="font-body text-[13px] text-warm-600 font-medium mt-1">
                  Day {currentDay}: {tour.itinerary[currentDay - 1].title}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Dates</p>
                <p className="font-body text-sm text-warm-900">
                  {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {"\u2013"} {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Pickup</p>
                <p className="font-body text-[15px] font-medium text-warm-900">{trip.pickupTime || 'TBC'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Pickup location</p>
                <p className="font-body text-sm text-warm-900">{trip.pickupLocation || 'TBC'}</p>
              </div>
            </div>
            {trip.dropoffLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-warm-400 mt-0.5" />
                <div>
                  <p className="font-body text-xs text-warm-400">Drop-off</p>
                  <p className="font-body text-sm text-warm-900">{trip.dropoffLocation}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Car className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Vehicle</p>
                <p className="font-body text-sm text-warm-900">{trip.vehicle || trip.vehicleType} {"\u00B7"} {trip.plateNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-warm-400 mt-0.5" />
              <div>
                <p className="font-body text-xs text-warm-400">Passengers</p>
                <p className="font-body text-sm text-warm-900">{trip.passengers || 1}</p>
              </div>
            </div>
          </div>

          {/* Navigate to pickup */}
          {getNavigateUrl() && (status === 'accepted' || status === 'in-progress') && (
            <a
              href={getNavigateUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-forest-50 hover:bg-forest-100 text-forest-600 rounded-xl min-h-[44px] font-body text-sm font-medium transition-colors"
            >
              <Navigation className="w-4 h-4" /> Navigate to pickup
            </a>
          )}
        </div>

        {/* Special requests */}
        {trip.specialRequests && (
          <div className="bg-[#FDF5E0] rounded-2xl border-l-[3px] border-l-amber-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-body text-[13px] font-semibold text-amber-500 mb-1">Special requests</h3>
                <p className="font-body text-[15px] text-warm-900">{trip.specialRequests}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin notes */}
        {trip.adminNotes && (
          <div className="bg-[#E4EAE4] rounded-2xl border-l-[3px] border-l-forest-500 p-4">
            <h3 className="font-body text-[13px] font-semibold text-forest-600 mb-1">Notes from Peacock Drivers</h3>
            <p className="font-body text-sm text-warm-900">{trip.adminNotes}</p>
          </div>
        )}

        {/* Pre-trip checklist */}
        {(status === 'accepted' || status === 'assigned') && (
          <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
            <h3 className="font-body text-base font-semibold text-warm-900 mb-3">Pre-trip checklist</h3>
            <div className="space-y-3">
              {checklist.map((item: any) => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                    item.checked ? 'bg-forest-500 border-forest-500' : 'border-warm-200 group-hover:border-forest-300'
                  )}>
                    {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={cn(
                    'font-body text-sm transition-colors',
                    item.checked ? 'text-warm-400 line-through' : 'text-warm-900'
                  )}>
                    {CHECKLIST_LABELS[item.id] || item.id}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={item.checked}
                    onChange={e => handleChecklistToggle(item.id, e.target.checked)}
                  />
                </label>
              ))}
            </div>
            {checklist.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-xs text-warm-400">{checkedCount} of {checklist.length} completed</span>
                </div>
                <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest-500 rounded-full transition-all duration-300"
                    style={{ width: `${(checkedCount / checklist.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Day-by-day itinerary */}
        {tour && tour.itinerary && tour.itinerary.length > 0 && (
          <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setItineraryOpen(!itineraryOpen)}
              className="w-full flex items-center justify-between p-5 min-h-[56px]"
            >
              <h2 className="font-body text-sm font-semibold text-warm-900">Day-by-day itinerary ({tour.itinerary.length} days)</h2>
              {itineraryOpen ? <ChevronUp className="w-5 h-5 text-warm-400" /> : <ChevronDown className="w-5 h-5 text-warm-400" />}
            </button>
            {itineraryOpen && (
              <div className="px-5 pb-5 space-y-4">
                {tour.itinerary.map((day: any) => (
                  <div key={day.day} className="flex gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      day.day === currentDay && status === 'in-progress' ? 'bg-amber-200 text-white' : 'bg-forest-50 text-forest-600'
                    )}>
                      <span className="font-body text-xs font-semibold">{day.day}</span>
                    </div>
                    <div className="flex-1 pb-4 border-b border-warm-100 last:border-0">
                      <p className="font-body text-sm font-semibold text-warm-900">{day.title}</p>
                      <p className="font-body text-xs text-warm-400 mt-0.5">{day.location} {day.drivingTime ? `\u00B7 ${day.drivingTime}` : ''}</p>
                      <p className="font-body text-xs text-warm-500 mt-1">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Earnings card */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-xs text-warm-400">Your earnings</p>
              <p className="font-display text-2xl text-emerald-600">{format(trip.driverEarnings)}</p>
            </div>
            <span className="font-body text-xs text-warm-400 bg-warm-50 px-3 py-1 rounded-pill">{trip.id?.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Status action buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-5 md:static md:px-0 md:mt-6 md:max-w-lg md:mx-auto z-40">
        <div className="max-w-lg mx-auto md:max-w-3xl space-y-2">
          {status === 'assigned' && (
            <>
              <button
                onClick={() => setShowConfirmModal('accept')}
                disabled={updateStatus.isPending}
                className="w-full bg-forest-500 hover:bg-forest-400 text-white font-body text-base font-semibold rounded-full min-h-[56px] shadow-lg transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {updateStatus.isPending ? 'Accepting...' : 'Accept this trip'}
              </button>
              <button
                onClick={() => setShowConfirmModal('decline')}
                className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-body text-sm font-medium rounded-full min-h-[48px] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Decline trip
              </button>
            </>
          )}
          {status === 'accepted' && (
            <button
              disabled={!isStartDay || updateStatus.isPending}
              onClick={() => isStartDay && setShowConfirmModal('start')}
              className={cn(
                'w-full font-body text-base font-semibold rounded-full min-h-[56px] shadow-lg transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2',
                isStartDay
                  ? 'bg-amber-200 hover:bg-amber-300 text-forest-800'
                  : 'bg-warm-200 text-warm-500 cursor-not-allowed'
              )}
            >
              {isStartDay ? (
                <><Play className="w-5 h-5" /> {updateStatus.isPending ? 'Starting...' : 'Start trip'}</>
              ) : (
                `Trip starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`
              )}
            </button>
          )}
          {status === 'in-progress' && (
            <button
              onClick={() => setShowConfirmModal('complete')}
              disabled={updateStatus.isPending}
              className="w-full bg-forest-500 hover:bg-forest-400 text-white font-body text-base font-semibold rounded-full min-h-[56px] shadow-lg transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {updateStatus.isPending ? 'Completing...' : 'Complete trip'}
            </button>
          )}
          {status === 'completed' && (
            <div className="text-center">
              <button disabled className="w-full bg-[#E4EAE4] text-forest-600 font-body text-base font-semibold rounded-full min-h-[56px] cursor-not-allowed flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Trip completed
              </button>
              <p className="font-display text-2xl text-emerald-600 mt-3">Earnings: {format(trip.driverEarnings)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirmModal && (
        <ConfirmModal
          action={showConfirmModal}
          onConfirm={() => handleStatusAction(showConfirmModal)}
          onCancel={() => { setShowConfirmModal(null); setDeclineReason(''); }}
          isPending={updateStatus.isPending}
          declineReason={declineReason}
          onDeclineReasonChange={setDeclineReason}
          tripTitle={trip.title}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

function CalendarIcon(props: any) {
  return <Calendar {...props} />;
}

function ConfirmModal({
  action,
  onConfirm,
  onCancel,
  isPending,
  declineReason,
  onDeclineReasonChange,
  tripTitle,
  isMobile,
}: {
  action: 'accept' | 'decline' | 'start' | 'complete';
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
  declineReason: string;
  onDeclineReasonChange: (v: string) => void;
  tripTitle: string;
  isMobile: boolean;
}) {
  const config = {
    accept: {
      title: 'Accept this trip?',
      body: `You're confirming that you can drive "${tripTitle}". The tourist and admin will be notified.`,
      confirm: 'Accept trip',
      confirmClass: 'bg-forest-500 hover:bg-forest-400 text-white',
    },
    decline: {
      title: 'Decline this trip?',
      body: 'The admin will be notified and may assign another driver.',
      confirm: 'Decline trip',
      confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
    },
    start: {
      title: 'Start this trip?',
      body: `Beginning "${tripTitle}" now. The tourist will be notified that you're on your way.`,
      confirm: 'Start trip',
      confirmClass: 'bg-amber-200 hover:bg-amber-300 text-forest-800',
    },
    complete: {
      title: 'Complete this trip?',
      body: 'This will calculate your earnings and notify the tourist. This action cannot be undone.',
      confirm: 'Complete trip',
      confirmClass: 'bg-forest-500 hover:bg-forest-400 text-white',
    },
  }[action];

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className={cn(
        'relative bg-white z-10 w-full',
        isMobile ? 'rounded-t-2xl px-5 pt-6 pb-8' : 'max-w-[440px] rounded-2xl px-6 pt-6 pb-6 mx-4'
      )}
        style={isMobile ? { paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' } : undefined}
      >
        {isMobile && (
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-warm-200" />
          </div>
        )}
        <h3 className="font-display text-xl text-warm-900 mb-2">{config.title}</h3>
        <p className="font-body text-sm text-warm-500 mb-5">{config.body}</p>

        {action === 'decline' && (
          <div className="mb-5">
            <label className="font-body text-[13px] font-medium text-warm-600 mb-1.5 block">
              Reason for declining (optional)
            </label>
            <textarea
              value={declineReason}
              onChange={e => onDeclineReasonChange(e.target.value)}
              rows={3}
              className="w-full border border-warm-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
              placeholder="E.g. vehicle unavailable, schedule conflict..."
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-warm-200 text-warm-600 font-body text-sm font-medium rounded-full min-h-[48px] hover:bg-warm-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={cn('flex-1 font-body text-sm font-semibold rounded-full min-h-[48px] transition-all duration-200 disabled:opacity-60', config.confirmClass)}
          >
            {isPending ? 'Processing...' : config.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
