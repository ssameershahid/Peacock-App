import React from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { MapView } from '@/components/shared/MapView';
import { getCoords } from '@/lib/mapbox';
import { formatDateRange } from '@/lib/date-utils';
import { MapPin, Calendar, ArrowRight, Compass } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api';

export default function TripShare() {
  const [, params] = useRoute('/trips/share/:token');
  const token = params?.token || '';

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip-share', token],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/account/trips/share/${token}`);
      if (!res.ok) throw new Error('Trip not found');
      return res.json();
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
        <Compass className="w-16 h-16 text-warm-300 mb-4" />
        <h1 className="font-display text-2xl text-warm-900 mb-2">Trip not found</h1>
        <p className="font-body text-warm-500 mb-6">This share link may have expired or been removed.</p>
        <Link href="/tours">
          <button className="bg-forest-500 text-white font-body text-sm font-medium px-6 py-3 rounded-full hover:bg-forest-400 transition-colors">
            Browse tours
          </button>
        </Link>
      </div>
    );
  }

  const heroImage = trip.heroImage || 'https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80';

  // Build map markers from itinerary
  const markers = (trip.itinerary || []).reduce((acc: any[], day: any, i: number) => {
    const coords = getCoords(day.location);
    if (coords) acc.push({ id: day.location, lng: coords[0], lat: coords[1], label: day.location, index: i });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center text-amber-200 font-display text-lg italic pr-0.5 shadow-sm">
              P
            </div>
            <span className="font-display text-xl text-forest-600">Peacock Drivers</span>
          </Link>
          <Link href="/tours">
            <button className="bg-forest-500 text-white font-body text-sm font-medium px-5 py-2 rounded-full hover:bg-forest-400 transition-colors">
              Book this tour
            </button>
          </Link>
        </div>
      </header>

      {/* Hero image */}
      <div
        className="h-[280px] md:h-[360px] bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(27,60,52,0.2) 0%, rgba(27,60,52,0.8) 100%), url(${heroImage})`,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-[900px] mx-auto">
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">{trip.tourName}</h1>
          <div className="flex items-center gap-4 text-white/80 font-body text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {trip.startDate && trip.endDate ? formatDateRange(trip.startDate, trip.endDate) : ''}
            </span>
            {trip.regions?.length > 0 && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {trip.regions.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        {/* Highlights */}
        {trip.highlights?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl text-warm-900 mb-4">
              Tour <em className="italic">highlights</em>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trip.highlights.map((h: string, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-warm-100 p-4">
                  <div className="w-6 h-6 rounded-full bg-forest-50 flex items-center justify-center text-forest-500 font-body text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="font-body text-sm text-warm-700">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Route map */}
        {markers.length >= 2 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl text-warm-900 mb-4">
              The <em className="italic">route</em>
            </h2>
            <MapView markers={markers} showRoute height="360px" />
          </div>
        )}

        {/* Itinerary */}
        {trip.itinerary?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl text-warm-900 mb-4">
              Day by <em className="italic">day</em>
            </h2>
            <div className="space-y-3">
              {trip.itinerary.map((day: any) => (
                <div key={day.day} className="flex gap-3 bg-white rounded-xl border border-warm-100 p-4">
                  <span className="font-body text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full whitespace-nowrap h-fit">
                    Day {day.day}
                  </span>
                  <div>
                    <h4 className="font-body text-sm font-medium text-warm-900">{day.title}</h4>
                    <p className="font-body text-xs text-warm-500 mt-0.5">{day.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-forest-600 rounded-2xl p-8 text-center">
          <h2 className="font-display text-2xl text-white mb-2">
            Ready for your own <em className="italic">adventure</em>?
          </h2>
          <p className="font-body text-white/70 mb-6">Book this tour with your own dates and preferences</p>
          <Link href={trip.tourSlug ? `/tours/${trip.tourSlug}` : '/tours'}>
            <button className="bg-amber-200 text-forest-700 font-body text-sm font-semibold px-8 py-3 rounded-full hover:bg-amber-300 transition-colors inline-flex items-center gap-2">
              Book this tour <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
