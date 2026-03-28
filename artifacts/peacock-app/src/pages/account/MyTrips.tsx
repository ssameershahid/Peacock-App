import React, { useState } from 'react';
import { Link } from 'wouter';
import { useUserBookings, useCYORequests, useTours } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { formatDateRange, daysUntil, daysAgo } from '@/lib/date-utils';
import { Map, Sparkles, ArrowRight, Car, Users, Compass, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── CYO Pipeline Status Dots ────────────────────────────────────────────────

const CYO_STEPS = ['Submitted', 'Under review', 'Quote ready', 'Payment pending', 'Confirmed'];

function CYOPipeline({ status }: { status: string }) {
  const statusIdx: Record<string, number> = {
    'New': 0, 'Reviewing': 1, 'Quoted': 2, 'Awaiting Payment': 3,
    'Paid': 4, 'Confirmed': 4,
  };
  const current = statusIdx[status] ?? 0;
  const statusLabels: Record<number, string> = {
    0: 'Submitted — we\'ll begin reviewing shortly',
    1: 'Under review — we\'ll send your quote within 24-48 hours',
    2: 'Quote ready — view & pay to confirm',
    3: 'Payment pending — complete payment to confirm',
    4: 'Confirmed — your trip is all set!',
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-0">
        {CYO_STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div
              className={cn(
                'rounded-full transition-all shrink-0',
                i < current && 'w-2.5 h-2.5 bg-forest-500',
                i === current && 'w-3.5 h-3.5 bg-amber-200 ring-2 ring-amber-200/30',
                i > current && 'w-2.5 h-2.5 border-2 border-warm-200'
              )}
            />
            {i < CYO_STEPS.length - 1 && (
              <div
                className={cn(
                  'h-[2px] flex-1 min-w-3',
                  i < current ? 'bg-forest-500' : 'bg-warm-100'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="font-body text-[13px] text-warm-500 mt-2">{statusLabels[current]}</p>
    </div>
  );
}

// ── Status Badge on Card ────────────────────────────────────────────────────

function CardStatusBadge({ status, startDate, endDate }: { status: string; startDate?: string; endDate?: string }) {
  const styles: Record<string, string> = {
    'Upcoming': 'bg-emerald-500 text-white',
    'Pending': 'bg-amber-400 text-warm-900',
    'In Progress': 'bg-amber-200 text-warm-900',
    'Completed': 'bg-warm-300 text-white',
    'Cancelled': 'bg-red-500 text-white',
    'Quote Paid': 'bg-emerald-500 text-white',
  };

  let label = status;
  if (status === 'In Progress' && startDate && endDate) {
    const total = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
    const current = total - Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000) + 1;
    label = `Day ${Math.max(1, Math.min(current, total))} of ${total}`;
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-body font-semibold shadow-sm',
      styles[status] || 'bg-warm-200 text-warm-600'
    )}>
      {label}
    </span>
  );
}

// ── Warm Trip Card ──────────────────────────────────────────────────────────

function TripCard({ booking }: { booking: any }) {
  const { format } = useCurrency();
  const days = daysUntil(booking.startDate);
  const isUpcoming = ['Upcoming', 'Pending', 'Quote Paid'].includes(booking.status);
  const isCompleted = booking.status === 'Completed';
  const isInProgress = booking.status === 'In Progress';

  // Determine countdown / time-ago text
  let timeText = '';
  if (isUpcoming && days >= 0) {
    timeText = days === 0 ? 'Departing today' : days === 1 ? 'Departing tomorrow' : `${days} days away`;
  } else if (isCompleted) {
    timeText = `Completed ${daysAgo(booking.endDate || booking.startDate).toLowerCase()}`;
  }

  // Tour image
  const tourImage = booking.tourImage || booking.image;

  // CTA text
  let ctaText = 'View trip details →';
  let ctaColor = 'text-forest-600';
  if (isInProgress) { ctaText = 'View today\'s itinerary →'; ctaColor = 'text-amber-600'; }
  else if (isCompleted && !booking.reviewed) { ctaText = 'Leave a review →'; ctaColor = 'text-amber-600'; }
  else if (isCompleted) { ctaText = 'View trip →'; ctaColor = 'text-warm-400'; }

  const durationDays = booking.startDate && booking.endDate
    ? Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000)
    : booking.numDays || 1;

  return (
    <Link href={`/account/bookings/${booking.id}`}>
      <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col md:flex-row">
        {/* Image section */}
        <div className="relative md:w-[200px] h-[180px] md:h-auto shrink-0 overflow-hidden">
          {tourImage ? (
            <div
              className={cn(
                'w-full h-full bg-cover bg-center',
                isCompleted && 'saturate-[0.7] brightness-95'
              )}
              style={{ backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%), url(${tourImage})` }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-forest-100 to-sage flex items-center justify-center">
              <MapPin className="w-10 h-10 text-forest-300" />
            </div>
          )}
          {/* Status badge overlaid */}
          <div className="absolute top-3 right-3">
            <CardStatusBadge status={booking.status} startDate={booking.startDate} endDate={booking.endDate} />
          </div>
        </div>

        {/* Content section */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display text-lg text-warm-900 truncate">{booking.title}</h4>
              {booking.type && (
                <span className="font-body text-[10px] font-medium uppercase tracking-wider text-warm-400 bg-warm-50 px-2 py-0.5 rounded-full shrink-0">
                  {booking.type === 'transfer' ? 'Transfer' : 'Tour'}
                </span>
              )}
            </div>
            <p className="font-body text-sm text-warm-500 mb-1">
              {booking.startDate && booking.endDate
                ? formatDateRange(booking.startDate, booking.endDate)
                : booking.date}
              {timeText && <span className="text-warm-400"> · {timeText}</span>}
            </p>
            <div className="flex items-center gap-4 text-[13px] font-body text-warm-400">
              <span className="inline-flex items-center gap-1">
                <Car className="w-3.5 h-3.5" /> {booking.vehicle}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {booking.passengers}
              </span>
              <span className="font-semibold text-forest-600">{format(booking.price)}</span>
            </div>
            {booking.driver && (
              <p className="font-body text-[13px] text-warm-400 mt-1 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 text-[9px] font-bold shrink-0">
                  {booking.driver.name?.charAt(0)}
                </div>
                Driver: {booking.driver.name}
              </p>
            )}
          </div>

          <p className={cn('font-body text-sm font-medium mt-3 group-hover:underline underline-offset-2', ctaColor)}>
            {ctaText}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── CYO Request Card ────────────────────────────────────────────────────────

function CYORequestCard({ cyo }: { cyo: any }) {
  const { format } = useCurrency();
  const isQuoteReady = cyo.status === 'Quoted';

  return (
    <Link href={`/account/bookings/${cyo.id}`}>
      <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col md:flex-row">
        {/* Left section — sage background with icon */}
        <div className="relative md:w-[200px] h-[140px] md:h-auto shrink-0 bg-gradient-to-br from-sage to-forest-50 flex items-center justify-center">
          <Compass className="w-12 h-12 text-forest-300" />
          <div className="absolute top-3 right-3">
            <span className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-body font-semibold shadow-sm',
              isQuoteReady ? 'bg-amber-200 text-warm-900' : 'bg-blue-100 text-blue-700'
            )}>
              {cyo.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
            <h4 className="font-display text-lg text-warm-900 truncate">
              Custom: {cyo.locations?.join(' → ') || 'Custom Trip'}
            </h4>
          </div>
          <p className="font-body text-sm text-warm-500">{cyo.dates} · {cyo.duration || cyo.durationDays} days</p>

          <CYOPipeline status={cyo.status} />

          {isQuoteReady && (
            <button className="mt-3 bg-amber-200 text-warm-900 font-body text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-amber-300 transition-colors inline-flex items-center gap-2">
              View quote & pay — {format(cyo.quotedAmount)} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Empty States ────────────────────────────────────────────────────────────

function EmptyUpcoming() {
  const { data: tours } = useTours();
  const featured = tours?.slice(0, 3) || [];

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden h-[240px] mb-6">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent 30%, rgba(27,60,52,0.8) 100%), url(https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-display text-2xl text-white">Your next adventure awaits</h3>
        </div>
      </div>
      <p className="font-body text-sm text-warm-500 text-center mb-6">
        Browse our curated tours or design your own Sri Lankan journey
      </p>
      <div className="flex justify-center gap-3 mb-8">
        <Link href="/tours">
          <button className="bg-forest-500 text-white font-body text-sm font-medium px-6 py-3 rounded-full hover:bg-forest-400 transition-colors">
            Browse tours
          </button>
        </Link>
        <Link href="/tours/custom">
          <button className="border border-forest-500 text-forest-600 font-body text-sm font-medium px-6 py-3 rounded-full hover:bg-forest-50 transition-colors">
            Create your own
          </button>
        </Link>
      </div>

      {featured.length > 0 && (
        <div>
          <h4 className="font-display text-lg text-warm-900 mb-4">Featured tours</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map((tour: any) => (
              <Link key={tour.slug} href={`/tours/${tour.slug}`}>
                <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden hover:shadow-md transition-all cursor-pointer">
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: tour.image ? `url(${tour.image})` : undefined }}>
                    {!tour.image && <div className="h-full bg-gradient-to-br from-forest-100 to-sage" />}
                  </div>
                  <div className="p-3">
                    <h5 className="font-display text-base text-warm-900">{tour.title}</h5>
                    <p className="font-body text-xs text-warm-500">{tour.duration} days</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyPast() {
  return (
    <div className="bg-white border border-dashed border-warm-200 rounded-2xl p-12 text-center flex flex-col items-center">
      <Compass className="w-12 h-12 text-warm-300 mb-4" />
      <h3 className="font-display text-xl text-warm-900 mb-2">Your travel memories will appear here</h3>
      <p className="font-body text-sm text-warm-500">
        After you complete your first trip with us, you'll find your journey history here
      </p>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function MyTrips() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data: bookings, isLoading } = useUserBookings();
  const { data: cyoRequests } = useCYORequests();

  const upcoming = bookings?.filter(b => ['Upcoming', 'Pending', 'In Progress', 'Quote Paid'].includes(b.status)) || [];
  const past = bookings?.filter(b => ['Completed', 'Cancelled'].includes(b.status)) || [];
  const quotedCYO = cyoRequests?.filter((r: any) => ['Quoted', 'New', 'Reviewing', 'Awaiting Payment'].includes(r.status)) || [];

  const displayList = tab === 'upcoming' ? upcoming : past;

  return (
    <div>
      <SectionHeading title="My *trips*" className="mb-6" />

      <div className="flex gap-2 bg-warm-100/50 p-1 rounded-pill w-fit mb-8">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-6 py-2 rounded-pill font-body text-sm font-medium transition-all capitalize',
              tab === t ? 'bg-white shadow-sm text-forest-600' : 'text-warm-500 hover:text-forest-600'
            )}
          >
            {t === 'upcoming' ? `Upcoming (${upcoming.length + quotedCYO.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {/* CYO requests (show in upcoming tab) */}
      {tab === 'upcoming' && quotedCYO.length > 0 && (
        <div className="space-y-4 mb-6">
          {quotedCYO.map((cyo: any) => (
            <CYORequestCard key={cyo.id} cyo={cyo} />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[180px] md:h-32 bg-white border border-warm-100 rounded-2xl animate-pulse" />
          ))
        ) : displayList.length === 0 && (tab !== 'upcoming' || quotedCYO.length === 0) ? (
          tab === 'upcoming' ? <EmptyUpcoming /> : <EmptyPast />
        ) : (
          displayList.map(booking => (
            <TripCard key={booking.id} booking={booking} />
          ))
        )}
      </div>
    </div>
  );
}
