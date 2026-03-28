import React from 'react';
import { Link } from 'wouter';
import { useTouristDashboard, useTouristNotifications, useTours } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateRange, formatDateRangeWithDay, daysAgo } from '@/lib/date-utils';
import { SectionHeading } from '@/components/shared/SectionHeading';
import {
  ArrowRight, Sparkles, MapPin, Plane, Car, Users, CheckCircle, Circle,
  Star, X, Bell, Calendar, ChevronRight, Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Countdown Hero ──────────────────────────────────────────────────────────

function CountdownHero({ trip }: { trip: any }) {
  const heroImage = trip.heroImage || 'https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80';
  const isToday = trip.daysUntil <= 0;
  const isTomorrow = trip.daysUntil === 1;
  const isClose = trip.daysUntil <= 3 && trip.daysUntil > 1;

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden h-[220px] md:h-[280px] mb-8",
        isToday && "animate-sparkle"
      )}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(27,60,52,0.3) 0%, rgba(27,60,52,0.85) 100%), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 h-full flex flex-col md:flex-row items-start md:items-end justify-between p-6 md:p-8">
        <div className="flex-1">
          <span className="font-body text-[12px] font-medium tracking-[0.08em] uppercase text-amber-200 mb-2 block">
            Your upcoming trip
          </span>
          <h2 className="font-display text-2xl md:text-[32px] text-white leading-tight mb-1">
            {trip.tourName}
          </h2>
          <p className="font-body text-base text-white/80 mb-1">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
          <p className="font-body text-sm text-white/60">
            {trip.vehicleType} · {trip.passengers} passenger{trip.passengers !== 1 ? 's' : ''}
          </p>
          <Link href={`/account/bookings/${trip.id}`}>
            <button className="mt-4 bg-white text-forest-600 font-body text-sm font-medium px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors inline-flex items-center gap-2">
              View trip details <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="mt-4 md:mt-0 text-right">
          {isToday ? (
            <div className="text-amber-200">
              <p className="font-display text-4xl md:text-[56px] leading-none">TODAY</p>
              <p className="font-body text-sm text-white/70 mt-1">Have an amazing trip!</p>
            </div>
          ) : isTomorrow ? (
            <div>
              <p className="font-display text-4xl md:text-[56px] leading-none text-amber-200 animate-pulse">TOMORROW</p>
              <p className="font-body text-sm text-white/70 mt-1">Get ready!</p>
            </div>
          ) : (
            <div className={cn(isClose && 'animate-countdown-pulse')}>
              <p className="font-display text-4xl md:text-[56px] leading-none text-white font-bold">{trip.daysUntil}</p>
              <p className="font-body text-sm text-white/70 mt-1">days to go</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Active Trip Hero ────────────────────────────────────────────────────────

function ActiveTripHero({ trip }: { trip: any }) {
  const heroImage = trip.heroImage || 'https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80';
  const todayItinerary = trip.itinerary?.[trip.currentDay - 1];

  return (
    <div
      className="relative rounded-2xl overflow-hidden h-[220px] md:h-[280px] mb-8"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(27,60,52,0.3) 0%, rgba(27,60,52,0.85) 100%), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
        <span className="font-body text-[12px] font-medium tracking-[0.08em] uppercase text-amber-200 mb-2">
          Your trip is in progress
        </span>
        <h2 className="font-display text-2xl md:text-[32px] text-white leading-tight mb-1">
          {trip.tourName}
        </h2>
        <p className="font-body text-lg text-white/90 mb-3">
          Day {trip.currentDay} of {trip.totalDays}
          {todayItinerary && ` — ${todayItinerary.title}`}
        </p>

        {/* Mini progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: trip.totalDays }, (_, i) => {
            const dayNum = i + 1;
            const isCompleted = dayNum < trip.currentDay;
            const isCurrent = dayNum === trip.currentDay;
            return (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all',
                  isCompleted && 'w-2 h-2 bg-emerald-400',
                  isCurrent && 'w-3 h-3 bg-amber-200 animate-pulse',
                  !isCompleted && !isCurrent && 'w-2 h-2 bg-white/30'
                )}
              />
            );
          })}
        </div>

        <Link href={`/account/bookings/${trip.id}`}>
          <button className="bg-white text-forest-600 font-body text-sm font-medium px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors inline-flex items-center gap-2 w-fit">
            View today's itinerary <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Welcome Back Hero (completed trips only) ────────────────────────────────

function WelcomeBackHero({ firstName }: { firstName: string }) {
  return (
    <div className="bg-[#F8F5F0] rounded-2xl p-8 md:p-10 mb-8">
      <h2 className="font-display text-3xl md:text-4xl text-warm-900 mb-2">
        Welcome back, <em className="italic">{firstName}</em>
      </h2>
      <p className="font-body text-warm-500 mb-6">
        You've explored Sri Lanka with us — ready for your next adventure?
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/tours">
          <button className="bg-forest-500 text-white font-body text-sm font-medium px-6 py-3 rounded-full hover:bg-forest-400 transition-colors">
            Browse tours
          </button>
        </Link>
        <Link href="/account/bookings">
          <button className="font-body text-sm font-medium text-forest-600 hover:text-forest-500 transition-colors px-4 py-3">
            View your past trips →
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── First Time Welcome (no trips) ───────────────────────────────────────────

function FirstTimeWelcome() {
  const pathways = [
    { label: 'Browse tours', desc: 'Curated multi-day adventures', href: '/tours', icon: MapPin, color: 'bg-forest-50 text-forest-500' },
    { label: 'Create your own', desc: 'Design a custom itinerary', href: '/tours/custom', icon: Sparkles, color: 'bg-amber-50 text-amber-500' },
    { label: 'Book a transfer', desc: 'Airport & city transfers', href: '/transfers', icon: Car, color: 'bg-blue-50 text-blue-500' },
  ];

  return (
    <div>
      <div className="bg-[#F8F5F0] rounded-2xl p-8 md:p-10 mb-8">
        <h2 className="font-display text-3xl md:text-4xl text-warm-900 mb-2">
          Welcome to Peacock <em className="italic">Drivers</em>
        </h2>
        <p className="font-body text-warm-500">Start planning your Sri Lanka adventure</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {pathways.map(p => (
          <Link key={p.href} href={p.href}>
            <div className="bg-white rounded-2xl border border-warm-100 p-5 hover:shadow-md transition-shadow cursor-pointer group text-center">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3', p.color)}>
                <p.icon className="w-5 h-5" />
              </div>
              <h3 className="font-body font-semibold text-forest-600 group-hover:text-forest-500 transition-colors">{p.label}</h3>
              <p className="font-body text-sm text-warm-400 mt-1">{p.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Preparation Checklist ───────────────────────────────────────────────────

function PreparationChecklist({ trip }: { trip: any }) {
  const prep = trip.preparation;
  if (!prep) return null;

  const items = [
    { label: 'Add your flight details', done: prep.flightAdded, section: 'flight' },
    { label: 'Add your passport number', done: prep.passportAdded, section: 'passport' },
    { label: 'Tell us about your hotels', done: prep.hotelsAdded, section: 'hotels' },
    { label: 'Review your special requests', done: prep.specialRequestsReviewed, section: 'requests' },
    { label: 'Add an emergency contact', done: prep.emergencyContactAdded, section: 'emergency' },
  ];

  const pct = (prep.completedCount / prep.totalCount) * 100;

  return (
    <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-8">
      <h3 className="font-display text-xl text-warm-900 mb-4">
        Prepare for your <em className="italic">trip</em>
      </h3>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-body text-xs text-warm-500">{prep.completedCount} of {prep.totalCount} completed</span>
          <span className="font-body text-xs font-medium text-forest-600">{Math.round(pct)}%</span>
        </div>
        <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-forest-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map(item => (
          <Link key={item.section} href={`/account/bookings/${trip.id}?section=${item.section}`}>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 transition-colors cursor-pointer group">
              {item.done ? (
                <div className="w-6 h-6 rounded-full bg-forest-500 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-warm-200 shrink-0" />
              )}
              <span className={cn('font-body text-sm flex-1', item.done ? 'text-warm-500' : 'text-warm-700')}>
                {item.label}
              </span>
              <span className={cn('font-body text-xs', item.done ? 'text-emerald-600' : 'text-amber-600')}>
                {item.done ? 'Added ✓' : 'Not yet added'}
              </span>
              <ChevronRight className="w-4 h-4 text-warm-300 group-hover:text-forest-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <p className="font-body text-[13px] text-warm-400 mt-4">
        Completing these details helps your driver prepare for a smooth trip
      </p>
    </div>
  );
}

// ── Destination Preview Cards ───────────────────────────────────────────────

function DestinationPreviews({ trip }: { trip: any }) {
  if (!trip.itinerary || trip.itinerary.length === 0) return null;
  // Show 2-3 destination highlights
  const highlights = trip.itinerary.slice(1, 4);
  if (highlights.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="font-display text-xl text-warm-900 mb-4">
        Explore what's <em className="italic">ahead</em>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {highlights.map((d: any, i: number) => (
          <div key={i} className="bg-white rounded-2xl border border-warm-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-br from-forest-100 to-sage flex items-center justify-center">
              <MapPin className="w-8 h-8 text-forest-400" />
            </div>
            <div className="p-4">
              <span className="font-body text-[11px] font-medium text-amber-600 uppercase tracking-wider">
                Day {d.day} of your tour
              </span>
              <h4 className="font-display text-lg text-warm-900 mt-1">{d.location || d.title}</h4>
              {d.description && (
                <p className="font-body text-[13px] text-warm-500 mt-1 line-clamp-2">{d.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Review Prompt Banner ────────────────────────────────────────────────────

function ReviewPromptBanner({ trip }: { trip: any }) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-[#F8F5F0] border-l-[3px] border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-4">
      <Star className="w-6 h-6 text-amber-200 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium text-warm-700">
          How was your {trip.tourName}? Share your experience
        </p>
      </div>
      <Link href={`/account/bookings/${trip.id}?section=review`}>
        <button className="font-body text-sm font-medium text-forest-600 border border-forest-500 px-4 py-2 rounded-full hover:bg-forest-50 transition-colors whitespace-nowrap">
          Leave a review →
        </button>
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-warm-400 hover:text-warm-600 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Recent Updates ──────────────────────────────────────────────────────────

function RecentUpdates() {
  const { data: notifications = [] } = useTouristNotifications();
  const recent = notifications.slice(0, 5);
  if (recent.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-8">
      <h3 className="font-body text-base font-semibold text-warm-900 mb-4">Recent updates</h3>
      <div className="space-y-3">
        {recent.map((n: any) => (
          <Link key={n.id} href={n.relatedId ? `/account/bookings/${n.relatedId}` : '#'}>
            <div className="flex items-start gap-3 group cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-forest-50 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-3 h-3 text-forest-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-warm-600 group-hover:text-forest-600 transition-colors truncate">
                  {n.title}
                </p>
              </div>
              <span className="font-body text-xs text-warm-400 shrink-0">{daysAgo(n.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Featured Tours Section ──────────────────────────────────────────────────

function FeaturedTours() {
  const { data: tours } = useTours();
  const featured = tours?.slice(0, 3) || [];
  if (featured.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="font-display text-xl text-warm-900 mb-4">
        Plan your next <em className="italic">adventure</em>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {featured.map((tour: any) => (
          <Link key={tour.slug} href={`/tours/${tour.slug}`}>
            <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: tour.image ? `url(${tour.image})` : undefined }}
              >
                {!tour.image && (
                  <div className="h-full bg-gradient-to-br from-forest-100 to-sage flex items-center justify-center">
                    <Compass className="w-8 h-8 text-forest-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-display text-lg text-warm-900 group-hover:text-forest-600 transition-colors">{tour.title}</h4>
                <p className="font-body text-[13px] text-warm-500 mt-1">{tour.duration} days · {tour.regions?.slice(0, 2).join(', ')}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function AccountOverview() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useTouristDashboard();
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Traveller';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-[280px] bg-warm-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-white border border-warm-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const { upcomingTrips = [], activeTrips = [], completedTripsNeedingReview = [], totalTrips = 0 } = dashboard || {};

  // Determine which state to show
  const hasActiveTrip = activeTrips.length > 0;
  const hasUpcomingTrip = upcomingTrips.length > 0;
  const hasTrips = totalTrips > 0;
  const unreviewedTrip = completedTripsNeedingReview[0];

  // STATE 2: Trip in progress
  if (hasActiveTrip) {
    const trip = activeTrips[0];
    return (
      <div>
        <ActiveTripHero trip={trip} />

        {/* Driver contact card */}
        {trip.driver && (
          <div className="bg-white rounded-2xl border-l-[3px] border-sage border border-warm-100 p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-display text-xl shrink-0">
              {trip.driver.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs text-warm-400 uppercase tracking-wider">Your driver</p>
              <p className="font-body font-semibold text-forest-600">{trip.driver.name}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={`tel:${trip.driver.phone}`} className="bg-forest-500 text-white rounded-full px-4 py-2.5 font-body text-sm font-medium hover:bg-forest-400 transition-colors inline-flex items-center gap-1.5">
                <Plane className="w-4 h-4" /> Call
              </a>
              <a href={`https://wa.me/${trip.driver.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white rounded-full px-4 py-2.5 font-body text-sm font-medium hover:bg-[#20BD5A] transition-colors inline-flex items-center gap-1.5">
                WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Today's itinerary */}
        {trip.itinerary?.[trip.currentDay - 1] && (
          <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-8">
            <h3 className="font-body font-semibold text-forest-600 mb-3">Today's itinerary</h3>
            <div className="flex items-start gap-3">
              <span className="font-body text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                Day {trip.currentDay}
              </span>
              <div>
                <h4 className="font-body font-medium text-warm-900">{trip.itinerary[trip.currentDay - 1].title}</h4>
                <p className="font-body text-sm text-warm-500 mt-1">{trip.itinerary[trip.currentDay - 1].description}</p>
              </div>
            </div>
          </div>
        )}

        <RecentUpdates />
      </div>
    );
  }

  // STATE 1: Upcoming trip
  if (hasUpcomingTrip) {
    const trip = upcomingTrips[0];
    const showDestinations = trip.daysUntil >= 7;

    return (
      <div>
        <CountdownHero trip={trip} />

        {/* Multiple upcoming trips notice */}
        {upcomingTrips.length > 1 && (
          <div className="mb-6">
            <Link href="/account/bookings">
              <p className="font-body text-sm text-warm-500 hover:text-forest-600 transition-colors cursor-pointer">
                You also have {upcomingTrips.length - 1} more upcoming trip{upcomingTrips.length - 1 > 1 ? 's' : ''} →
              </p>
            </Link>
          </div>
        )}

        {/* Review prompt banner */}
        {unreviewedTrip && <ReviewPromptBanner trip={unreviewedTrip} />}

        {/* Preparation checklist */}
        <PreparationChecklist trip={trip} />

        {/* Destination previews (only if trip is 7+ days away) */}
        {showDestinations && <DestinationPreviews trip={trip} />}

        <RecentUpdates />
      </div>
    );
  }

  // STATE 3: Only completed trips
  if (hasTrips) {
    return (
      <div>
        <WelcomeBackHero firstName={firstName} />

        {/* Review prompt banner */}
        {unreviewedTrip && <ReviewPromptBanner trip={unreviewedTrip} />}

        <FeaturedTours />
        <RecentUpdates />
      </div>
    );
  }

  // STATE 4: No trips at all
  return (
    <div>
      <FirstTimeWelcome />
      <FeaturedTours />
    </div>
  );
}
