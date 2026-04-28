import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useTourVariant, useTourGroups, useVehicles } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { MapView, type MapMarker } from '@/components/shared/MapView';
import { getCoords } from '@/lib/mapbox';
import { Button } from '@/components/ui/button';
import { haversineKm, calcLocationSurcharge } from '@/lib/haversine';
import { SRI_LANKA_CITIES, findCity, type SLCity } from '@/lib/sriLankaCities';
import {
  MapPin, Clock, Calendar as CalendarIcon, Users, Check, X,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Shield, ArrowRight, AlertCircle, Navigation,
  Mail, Bookmark, BookmarkCheck, Sparkles, Maximize2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailTripPlan, useCreateSavedTrip } from '@/hooks/use-app-data';

const DURATIONS = [5, 7, 10, 14] as const;

// ── Location picker sub-component ─────────────────────────────────────────────

interface LocationPickerProps {
  label: string;
  defaultLabel: string;
  selected: SLCity | null;
  onSelect: (city: SLCity | null) => void;
  originalCoords: { lat: number; lng: number } | null;
  surchargeRate: number;
  format: (n: number) => string;
}

function LocationPicker({ label, defaultLabel, selected, onSelect, originalCoords, surchargeRate, format }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return SRI_LANKA_CITIES;
    const q = query.toLowerCase();
    return SRI_LANKA_CITIES.filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
  }, [query]);

  const distKm = selected && originalCoords
    ? haversineKm(originalCoords.lat, originalCoords.lng, selected.lat, selected.lng)
    : null;
  const surcharge = distKm !== null ? calcLocationSurcharge(distKm, surchargeRate) : 0;
  const isFree = distKm !== null && distKm <= 50;

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-warm-500 mb-1 font-body">{label}</label>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm font-body transition-all ${
          selected
            ? 'border-forest-400 bg-forest-50 text-forest-700'
            : 'border-warm-200 bg-warm-50 text-warm-400'
        }`}
      >
        <Navigation className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 truncate">{selected ? selected.name : defaultLabel}</span>
        {selected ? (
          <button
            onClick={e => { e.stopPropagation(); onSelect(null); setQuery(''); }}
            className="text-warm-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-warm-400" />
        )}
      </button>

      {/* Distance / surcharge badge */}
      {distKm !== null && (
        <div className={`mt-1 flex items-center gap-1.5 font-body text-[11px] font-medium ${isFree ? 'text-emerald-600' : 'text-amber-600'}`}>
          {isFree ? (
            <><Check className="w-3 h-3" /> {Math.round(distKm)} km — No extra charge</>
          ) : (
            <><AlertCircle className="w-3 h-3" /> {Math.round(distKm)} km — +{format(surcharge)} surcharge</>
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full bg-white rounded-xl border border-warm-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-warm-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search cities..."
              className="w-full px-3 py-1.5 rounded-lg border border-warm-200 font-body text-xs focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(city => (
              <button
                key={city.name}
                onClick={() => { onSelect(city); setOpen(false); setQuery(''); }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-forest-50 text-left transition-colors"
              >
                <div>
                  <p className="font-body text-xs font-medium text-forest-700">{city.name}</p>
                  <p className="font-body text-[10px] text-warm-400">{city.region}</p>
                </div>
                {originalCoords && (() => {
                  const d = haversineKm(originalCoords.lat, originalCoords.lng, city.lat, city.lng);
                  const s = calcLocationSurcharge(d, surchargeRate);
                  return (
                    <span className={`font-body text-[10px] font-semibold ${s === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {s === 0 ? 'Free' : `+${format(s)}`}
                    </span>
                  );
                })()}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-3 font-body text-xs text-warm-400 text-center">No cities found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Save Trip Section ─────────────────────────────────────────────────────────

interface SaveTripSectionProps {
  tripSnapshot: {
    tourId: string;
    tourName: string;
    groupSlug: string;
    duration: number;
    vehicleType: string;
    startDate: string;
    totalPrice: number;
    pax: number;
    heroImage?: string;
  };
  format: (n: number) => string;
}

function SaveTripSection({ tripSnapshot, format }: SaveTripSectionProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const emailTrip = useEmailTripPlan();
  const saveTrip = useCreateSavedTrip();

  // Email form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailDone, setEmailDone] = useState(false);

  // Save state
  const [saved, setSaved] = useState(false);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await emailTrip.mutateAsync({
      email,
      name,
      tripData: { ...tripSnapshot, type: 'READY_MADE' },
      source: 'tour_detail_save',
    });
    setEmailDone(true);
  }

  async function handleSave() {
    if (!user) { setLocation('/register'); return; }
    await saveTrip.mutateAsync({
      tripData: { ...tripSnapshot, type: 'READY_MADE', savedAt: new Date().toISOString() },
      currentStep: 5,
      isComplete: false,
    });
    setSaved(true);
  }

  return (
    <div className="bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-20">

        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sage rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-forest-500" />
            <span className="font-body text-xs font-semibold text-forest-600 tracking-wider uppercase">Not ready to book?</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-forest-600 mb-4">
            Save this trip for later
          </h2>
          <p className="font-body text-lg text-warm-500 max-w-xl mx-auto">
            Love the look of this tour? Keep it for when you're ready — email yourself a copy or save it to your account.
          </p>
        </div>

        {/* Two cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Card 1 — Email */}
          <div className="border border-warm-200 rounded-3xl p-8 flex flex-col bg-warm-50/50">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
              <Mail className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-display text-2xl text-forest-600 mb-2">Email it to yourself</h3>
            <p className="font-body text-sm text-warm-500 mb-6 leading-relaxed">
              We'll send you a full itinerary summary with pricing. No account needed.
            </p>

            {emailDone ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="font-body text-forest-600 font-medium text-center">Sent! Check your inbox.</p>
                <p className="font-body text-xs text-warm-400 text-center">Can't find it? Check your spam folder.</p>
              </div>
            ) : (
              <form onSubmit={handleEmail} className="flex flex-col gap-3 flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl font-body text-sm text-forest-600 placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-forest-300"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl font-body text-sm text-forest-600 placeholder-warm-300 focus:outline-none focus:ring-2 focus:ring-forest-300"
                />
                <button
                  type="submit"
                  disabled={emailTrip.isPending || !email}
                  className="mt-auto w-full py-3 bg-forest-600 hover:bg-forest-500 disabled:opacity-50 text-white font-body font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2"
                >
                  {emailTrip.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Mail className="w-4 h-4" /> Send my trip plan</>
                  )}
                </button>
                <p className="text-center font-body text-[11px] text-warm-400 mt-1">Free · No account · No spam</p>
              </form>
            )}
          </div>

          {/* Card 2 — Account save */}
          <div className="border border-warm-200 rounded-3xl p-8 flex flex-col bg-warm-50/50">
            <div className="w-12 h-12 bg-forest-50 border border-forest-100 rounded-2xl flex items-center justify-center mb-5">
              {saved ? <BookmarkCheck className="w-6 h-6 text-emerald-600" /> : <Bookmark className="w-6 h-6 text-forest-500" />}
            </div>
            <h3 className="font-display text-2xl text-forest-600 mb-2">
              {user ? 'Save to My Trips' : 'Create a free account'}
            </h3>
            <p className="font-body text-sm text-warm-500 mb-6 leading-relaxed">
              {user
                ? 'Add this tour to your saved trips and access it any time from your account.'
                : "Save tours, compare options, and book when you're ready — all in one place."}
            </p>

            {/* Benefits — logged out only */}
            {!user && (
              <ul className="space-y-3 mb-6 flex-1">
                {[
                  'Save multiple tours to compare',
                  'Share with your travel companions',
                  'Pick up right where you left off',
                  'Get notified of price changes',
                ].map(b => (
                  <li key={b} className="flex items-center gap-3 font-body text-sm text-warm-600">
                    <Check className="w-4 h-4 text-forest-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Logged-in success */}
            {user && saved && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <BookmarkCheck className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="font-body text-forest-600 font-medium">Saved to My Trips!</p>
              </div>
            )}

            {/* CTA buttons */}
            {!saved && (
              <div className="mt-auto space-y-3">
                <button
                  onClick={handleSave}
                  disabled={saveTrip.isPending}
                  className="w-full py-3 bg-forest-600 hover:bg-forest-500 disabled:opacity-50 text-white font-body font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2"
                >
                  {saveTrip.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : user ? (
                    <><Bookmark className="w-4 h-4" /> Save this tour</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Create free account</>
                  )}
                </button>
                {!user && (
                  <button
                    onClick={() => setLocation('/login')}
                    className="w-full py-3 border border-warm-200 hover:border-warm-400 text-warm-500 hover:text-forest-600 font-body text-sm rounded-full transition-all"
                  >
                    Already have an account? Sign in
                  </button>
                )}
              </div>
            )}

            {user && saved && (
              <button
                onClick={() => setLocation('/account/saved-trips')}
                className="mt-4 w-full py-3 border border-warm-200 hover:border-forest-300 text-warm-500 hover:text-forest-600 font-body text-sm rounded-full transition-all flex items-center justify-center gap-2"
              >
                View My Trips <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tour summary pill */}
        <div className="flex justify-center mt-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-warm-50 border border-warm-200 rounded-full">
            {tripSnapshot.heroImage && (
              <img src={tripSnapshot.heroImage} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
            )}
            <span className="font-body text-sm text-warm-600">{tripSnapshot.tourName}</span>
            <span className="w-px h-4 bg-warm-200" />
            <span className="font-body text-sm text-warm-400">{tripSnapshot.duration} days</span>
            {tripSnapshot.totalPrice > 0 && (
              <>
                <span className="w-px h-4 bg-warm-200" />
                <span className="font-body text-sm font-semibold text-forest-600">from {format(tripSnapshot.totalPrice)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TourVariantDetail() {
  const [, params] = useRoute('/tours/:groupSlug/:duration');
  const [, setLocation] = useLocation();

  const groupSlug = params?.groupSlug ?? '';
  const duration = Number(params?.duration ?? 7);

  const { data: tour, isLoading } = useTourVariant(groupSlug, duration);
  const { data: tourGroups } = useTourGroups();
  const { data: vehicles } = useVehicles();
  const { format } = useCurrency();

  // Durations that actually exist for this group (from the groups cache)
  const availableDurations = useMemo<number[]>(() => {
    const group = tourGroups?.find((g: any) => g.groupSlug === groupSlug);
    const durations = group?.variants?.map((v: any) => v.durationDays as number) ?? [];
    return durations.length > 0 ? durations : [];
  }, [tourGroups, groupSlug]);

  // Auto-redirect if the requested duration has no variant (e.g. /classic-sri-lanka/5 when only 10d exists)
  React.useEffect(() => {
    if (availableDurations.length === 0) return;
    if (!availableDurations.includes(duration)) {
      setLocation(`/tours/${groupSlug}/${availableDurations[0]}`);
    }
  }, [availableDurations, duration, groupSlug, setLocation]);

  // Sidebar state — preserved across duration switches
  const [selectedVehicle, setSelectedVehicle] = useState<string>('minivan');
  const [pax, setPax] = useState(() => {
    try {
      const stored = sessionStorage.getItem('peacock_travellers');
      if (stored) {
        const { adults, children } = JSON.parse(stored);
        return (adults || 2) + (children || 0);
      }
    } catch {}
    return 2;
  });
  const [startDate, setStartDate] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});

  const startDateRef = useRef<HTMLInputElement>(null);
  const vehicleScrollRef = useRef<HTMLDivElement>(null);
  const [vehicleScrollState, setVehicleScrollState] = useState({ canLeft: false, canRight: true });

  const syncVehicleScrollState = useCallback(() => {
    const el = vehicleScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    setVehicleScrollState({
      canLeft: scrollLeft > 2,
      canRight: max > 2 && scrollLeft < max - 2,
    });
  }, []);

  useEffect(() => {
    syncVehicleScrollState();
    const el = vehicleScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', syncVehicleScrollState, { passive: true });
    const ro = new ResizeObserver(syncVehicleScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', syncVehicleScrollState);
      ro.disconnect();
    };
  }, [vehicles, syncVehicleScrollState]);

  const scrollVehicleRow = (dir: 'prev' | 'next') => {
    const el = vehicleScrollRef.current;
    if (!el) return;
    const step = Math.max(Math.round(el.clientWidth * 0.75), 160);
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  const [mapExpanded, setMapExpanded] = useState(false);

  // Close map lightbox on Escape
  React.useEffect(() => {
    if (!mapExpanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMapExpanded(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mapExpanded]);

  // Alternative location state
  const [showAltLocation, setShowAltLocation] = useState(false);
  const [altStartCity, setAltStartCity] = useState<SLCity | null>(null);
  const [altEndCity, setAltEndCity] = useState<SLCity | null>(null);

  // Surcharge rate from admin settings (localStorage, default £20/block)
  const surchargeRate = Number(localStorage.getItem('peacock_location_surcharge_rate') ?? '20');

  // showAddOns from admin toggle (localStorage per tour)
  const showAddOns = tour ? localStorage.getItem(`peacock_showAddOns_${tour.id}`) === 'true' : false;

  // Switch to a different duration variant — in-place swap, URL updates
  const switchDuration = (newDuration: number) => {
    setLocation(`/tours/${groupSlug}/${newDuration}`);
    setExpandedDay(1);
  };

  if (isLoading) return <div className="min-h-screen pt-32 text-center font-body">Loading journey details...</div>;
  if (!tour) return <div className="min-h-screen pt-32 text-center font-body">Tour not found.</div>;

  // ── Coordinate helpers ───────────────────────────────────────────────────

  function getItineraryCoords(day: any): { lat: number; lng: number } | null {
    if (day?.lat && day?.lng) return { lat: day.lat, lng: day.lng };
    const city = findCity(day?.location ?? '');
    return city ? { lat: city.lat, lng: city.lng } : null;
  }

  const firstDay = tour.itinerary?.[0];
  const lastDay = tour.itinerary?.[tour.itinerary.length - 1];
  const origStartCoords = getItineraryCoords(firstDay);
  const origEndCoords = getItineraryCoords(lastDay);

  const startDistKm = altStartCity && origStartCoords
    ? haversineKm(origStartCoords.lat, origStartCoords.lng, altStartCity.lat, altStartCity.lng)
    : null;
  const endDistKm = altEndCity && origEndCoords
    ? haversineKm(origEndCoords.lat, origEndCoords.lng, altEndCity.lat, altEndCity.lng)
    : null;

  const startSurcharge = startDistKm !== null ? calcLocationSurcharge(startDistKm, surchargeRate) : 0;
  const endSurcharge = endDistKm !== null ? calcLocationSurcharge(endDistKm, surchargeRate) : 0;
  const locationSurchargeTotal = startSurcharge + endSurcharge;

  // ── Pricing ──────────────────────────────────────────────────────────────

  const vehicleRate = tour.vehicleRates?.[selectedVehicle as keyof typeof tour.vehicleRates] ?? 45;
  const vehicleTotal = vehicleRate * duration;
  const addOnsTotal = (tour.addOns || []).reduce((sum: number, a: any) => sum + (selectedAddOns[a.id] ? a.price : 0), 0);
  const totalPrice = vehicleTotal + addOnsTotal + locationSurchargeTotal;

  const vehicleDetails = vehicles?.find((v: any) => v.id === selectedVehicle);
  const maxPax = vehicleDetails?.maxPassengers ?? 35;

  // ── Itinerary display location overrides ─────────────────────────────────

  function getDisplayLocation(day: any, index: number): string {
    if (index === 0 && altStartCity) return altStartCity.name;
    if (tour.itinerary && index === tour.itinerary.length - 1 && altEndCity) return altEndCity.name;
    return day.location;
  }

  // ── Map markers ──────────────────────────────────────────────────────────

  const locations = (tour.itinerary || []).map((d: any) => d.location).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
  const itineraryMarkers: MapMarker[] = locations.reduce((acc: MapMarker[], loc: string, i: number) => {
    const coords = getCoords(loc);
    if (coords) acc.push({ id: loc, lng: coords[0], lat: coords[1], label: loc, index: i });
    return acc;
  }, []);

  // ── Booking ──────────────────────────────────────────────────────────────

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + (tour.leadTimeDays || 7));
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleBooking = () => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration - 1);
    const storedTravellers = (() => {
      try { return JSON.parse(sessionStorage.getItem('peacock_travellers') || '{}'); } catch { return {}; }
    })();
    const bookingData = {
      type: 'READY_MADE',
      travellers: storedTravellers,
      tourId: tour.id,
      tourName: tour.title,
      tourImage: tour.images?.[0],
      vehicleType: selectedVehicle,
      vehicleName: vehicleDetails?.name || selectedVehicle,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      numDays: duration,
      passengers: pax,
      vehicleRate,
      vehicleTotal,
      addOnsTotal,
      selectedAddOns: (tour.addOns || [])
        .filter((a: any) => selectedAddOns[a.id])
        .map((a: any) => ({ id: a.id, name: a.name, price: a.price })),
      customStartLocation: altStartCity ? { name: altStartCity.name, surcharge: startSurcharge } : null,
      customEndLocation: altEndCity ? { name: altEndCity.name, surcharge: endSurcharge } : null,
      locationSurcharge: locationSurchargeTotal,
      totalPrice,
    };
    sessionStorage.setItem('peacock_booking', JSON.stringify(bookingData));
    setLocation('/checkout');
  };

  // ── Render ───────────────────────────────────────────────────────────────

  // Info strip start/end label
  const infoStartLabel = altStartCity ? altStartCity.name : (firstDay?.location ?? 'Colombo (CMB)');
  const infoEndLabel = altEndCity ? altEndCity.name : (lastDay?.location ?? 'Colombo (CMB)');

  return (
    <div className="bg-white pb-32">
      {/* Hero */}
      <div className="h-[55vh] md:h-[70vh] min-h-[450px] relative w-full overflow-hidden">
        <img src={tour.images?.[0]} className="w-full h-full object-cover" alt={tour.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-700/80 via-forest-700/20 to-transparent" />
        <div className="absolute bottom-10 left-0 w-full">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-pill text-white text-sm font-medium font-body border border-white/30">
                {tour.difficulty}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-pill text-white text-sm font-medium font-body border border-white/30">
                <Clock className="w-3.5 h-3.5 inline mr-1" />{duration} days / {duration - 1} nights
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-3">{tour.title}</h1>
            <p className="font-body text-xl text-white/90 max-w-2xl">{tour.tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-12 flex flex-col lg:flex-row gap-12 relative">
        {/* Left: content */}
        <div className="flex-1 lg:w-2/3">
          {/* Info strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-warm-100 mb-12">
            <div className="flex flex-col gap-1">
              <span className="text-warm-400 text-xs font-body uppercase tracking-wider">Duration</span>
              <div className="flex items-center gap-2 text-forest-600 font-medium font-body text-sm">
                <Clock className="w-4 h-4 text-amber-200" />
                {duration} Days, {duration - 1} Nights
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-warm-400 text-xs font-body uppercase tracking-wider">Start / End</span>
              <div className="flex items-center gap-2 text-forest-600 font-medium font-body text-sm">
                {startDate ? (
                  <><CalendarIcon className="w-4 h-4 text-amber-200 shrink-0" />
                  <span>
                    {new Date(startDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {' → '}
                    {(() => { const d = new Date(startDate + 'T00:00:00'); d.setDate(d.getDate() + duration - 1); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); })()}
                  </span></>
                ) : (
                  <><MapPin className="w-4 h-4 text-amber-200 shrink-0" />
                  <span>{infoStartLabel && infoEndLabel ? `${infoStartLabel} → ${infoEndLabel}` : 'Set start date →'}</span></>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <span className="text-warm-400 text-xs font-body uppercase tracking-wider">Regions</span>
              <div className="text-forest-600 font-medium font-body text-sm">
                {tour.regions?.join(' • ')}
              </div>
            </div>
          </div>

          {/* Description */}
          {tour.description && (
            <div className="mb-12">
              <p className="font-body text-warm-600 leading-relaxed text-lg">{tour.description}</p>
              {tour.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {tour.highlights.map((h: string) => (
                    <span key={h} className="px-3 py-1.5 bg-sage rounded-pill text-xs font-medium text-forest-600 font-body">{h}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Itinerary + Map */}
          <div className="flex flex-col lg:flex-row gap-8 mb-16">
            <div className="flex-1">
              <SectionHeading overline="itinerary" title={`Your *${duration}-day* itinerary`} />
              <div className="space-y-3">
                {(tour.itinerary || []).map((day: any, idx: number) => (
                  <div key={day.day} className="border border-warm-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-warm-50 transition-colors focus:outline-none"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-xl transition-colors shrink-0 ${expandedDay === day.day ? 'bg-forest-500 text-white' : 'bg-sage text-forest-600'}`}>
                          {day.day}
                        </div>
                        <div>
                          <p className="font-body text-[10px] font-semibold text-warm-400 uppercase tracking-widest mb-0.5">Day {day.dayNumber ?? day.day}</p>
                          <h4 className="font-display text-xl text-forest-600">{day.title}</h4>
                          <p className="font-body text-xs text-warm-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getDisplayLocation(day, idx)}
                            {/* Show custom badge if overridden */}
                            {((idx === 0 && altStartCity) || (idx === (tour.itinerary?.length ?? 0) - 1 && altEndCity)) && (
                              <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-semibold">custom</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {expandedDay === day.day ? <ChevronUp className="w-5 h-5 text-warm-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-warm-400 shrink-0" />}
                    </button>
                    {expandedDay === day.day && (
                      <div className="px-5 pb-5 pt-1 animate-in slide-in-from-top-2 duration-200">
                        <p className="font-body text-sm text-warm-600 leading-relaxed mb-4">{day.description}</p>
                        <div className="flex flex-wrap gap-3 items-center bg-warm-50 p-3 rounded-xl">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-forest-600 font-body mr-2">
                            <Clock className="w-3.5 h-3.5 text-amber-200" /> {day.drivingTime}
                          </div>
                          {(day.stops || []).map((stop: string) => (
                            <span key={stop} className="px-2.5 py-1 bg-white rounded-pill text-xs font-medium text-warm-500 border border-warm-200 font-body">
                              {stop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="lg:w-[320px] shrink-0">
              <div className="sticky top-24">
                {/* Map with expand button */}
                <div className="relative group">
                  <MapView
                    markers={itineraryMarkers}
                    activeMarkerId={
                      expandedDay !== null
                        ? (itineraryMarkers.find(m => m.label === locations[expandedDay - 1])?.id ?? undefined)
                        : undefined
                    }
                    height="560px"
                    showRoute
                    className="shadow-xl"
                  />
                  {/* Expand button */}
                  <button
                    onClick={() => setMapExpanded(true)}
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg shadow-md border border-warm-200 font-body text-xs font-medium text-forest-600 transition-all"
                    title="Expand map"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Expand
                  </button>
                </div>

                {itineraryMarkers.length > 0 && (
                  <div className="mt-3 bg-warm-50 rounded-xl p-3 border border-warm-100">
                    <p className="font-body text-xs font-semibold text-forest-600 mb-2 uppercase tracking-wide">Route stops</p>
                    <div className="space-y-1">
                      {itineraryMarkers.map((m, i) => (
                        <div key={m.id} className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shrink-0 ${
                            i === 0 ? 'bg-forest-600 border-forest-600 text-white' :
                            i === itineraryMarkers.length - 1 ? 'bg-amber-400 border-amber-400 text-forest-800' :
                            'bg-white border-forest-400 text-forest-600'
                          }`}>{i + 1}</div>
                          <span className="font-body text-xs text-warm-600 truncate">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map lightbox */}
            {mapExpanded && (
              <div
                className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                onClick={() => setMapExpanded(false)}
              >
                <div
                  className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl"
                  style={{ height: '85vh' }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setMapExpanded(false)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-warm-50 transition-colors"
                  >
                    <X className="w-5 h-5 text-forest-600" />
                  </button>

                  {/* Route stops sidebar */}
                  {itineraryMarkers.length > 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 max-h-[calc(85vh-2rem)] overflow-y-auto w-52">
                      <p className="font-body text-xs font-semibold text-forest-600 mb-3 uppercase tracking-wide">Route stops</p>
                      <div className="space-y-2">
                        {itineraryMarkers.map((m, i) => (
                          <div key={m.id} className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0 ${
                              i === 0 ? 'bg-forest-600 border-forest-600 text-white' :
                              i === itineraryMarkers.length - 1 ? 'bg-amber-400 border-amber-400 text-forest-800' :
                              'bg-white border-forest-400 text-forest-600'
                            }`}>{i + 1}</div>
                            <span className="font-body text-xs text-warm-700 leading-tight">{m.label}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-body text-[10px] text-warm-400 mt-3 pt-3 border-t border-warm-100">Press Esc to close</p>
                    </div>
                  )}

                  <MapView
                    markers={itineraryMarkers}
                    activeMarkerId={
                      expandedDay !== null
                        ? (itineraryMarkers.find(m => m.label === locations[expandedDay - 1])?.id ?? undefined)
                        : undefined
                    }
                    height="100%"
                    showRoute
                  />
                </div>
              </div>
            )}
          </div>

          {/* Included / Not Included */}
          <SectionHeading overline="the details" title="What's *included*" />
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
              <h4 className="font-body font-bold text-forest-600 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                Included
              </h4>
              <ul className="space-y-3">
                {[
                  'Private vehicle and chauffeur driver for entire duration',
                  'Airport pick-up and drop-off',
                  'All fuel and highway tolls',
                  'Vehicle insurance',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-warm-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
              <h4 className="font-body font-bold text-forest-600 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-500" />
                </div>
                Not Included
              </h4>
              <ul className="space-y-3">
                {[
                  'Flights',
                  'Accommodation',
                  'Meals and drinks',
                  'Entrance fees to attractions',
                  'Personal travel insurance',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-warm-600">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: booking sidebar */}
        <div className="lg:w-[380px] shrink-0 relative">
          <div className="sticky top-24 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-warm-100 p-6 flex flex-col gap-5">
            <h3 className="font-display text-2xl text-forest-600">Book this tour</h3>

            {/* Duration — 4-pill selector */}
            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2 font-body">
                Duration: <span className="text-amber-500">{duration} days / {duration - 1} nights</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-warm-50 rounded-xl border border-warm-100">
                {DURATIONS.map(d => {
                  const exists = availableDurations.length === 0 || availableDurations.includes(d);
                  if (!exists) return null;
                  return (
                    <button
                      key={d}
                      onClick={() => switchDuration(d)}
                      className={`py-2 rounded-lg font-body text-sm font-medium transition-all ${
                        duration === d
                          ? 'bg-forest-500 text-white shadow-sm'
                          : 'text-warm-500 hover:text-forest-600 hover:bg-white'
                      }`}
                    >
                      {d}d
                    </button>
                  );
                })}
              </div>
              <p className="font-body text-xs text-warm-400 mt-1.5">Switch duration to see a different itinerary</p>
            </div>

            {/* Start Date + End Date */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Start Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                  <input
                    ref={startDateRef}
                    type="date"
                    lang="en-GB"
                    min={minDateStr}
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    onKeyDown={e => e.preventDefault()}
                    onClick={() => startDateRef.current?.showPicker()}
                    className="w-full bg-warm-50 border border-warm-200 rounded-xl py-2.5 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">End Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                  <input
                    type="date"
                    lang="en-GB"
                    readOnly
                    value={(() => {
                      if (!startDate) return '';
                      const d = new Date(startDate);
                      d.setDate(d.getDate() + duration - 1);
                      return d.toISOString().split('T')[0];
                    })()}
                    placeholder="Auto-calculated"
                    className="w-full bg-warm-100 border border-warm-200 rounded-xl py-2.5 pl-10 pr-4 font-body text-sm text-warm-500 cursor-not-allowed outline-none"
                  />
                </div>
                {!startDate && (
                  <p className="font-body text-[11px] text-warm-400 mt-1">Set start date first</p>
                )}
              </div>
            </div>

            {/* Vehicle */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm font-medium text-forest-600 font-body">Vehicle</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    aria-label="Scroll vehicles left"
                    disabled={!vehicleScrollState.canLeft}
                    onClick={() => scrollVehicleRow('prev')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-warm-200 bg-warm-50 text-forest-600 transition-colors hover:bg-warm-100 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll vehicles right"
                    disabled={!vehicleScrollState.canRight}
                    onClick={() => scrollVehicleRow('next')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-warm-200 bg-warm-50 text-forest-600 transition-colors hover:bg-warm-100 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div
                ref={vehicleScrollRef}
                className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none -mx-1 px-1"
              >
                {vehicles?.map((v: any) => (
                  <div
                    key={v.id}
                    onClick={() => { setSelectedVehicle(v.id); setPax((p: number) => Math.min(p, v.maxPassengers)); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all text-center shrink-0 w-[30%] snap-start ${selectedVehicle === v.id ? 'border-forest-500 bg-forest-50 ring-1 ring-forest-500' : 'border-warm-200 hover:border-forest-300'}`}
                  >
                    <img src={v.image} alt={v.name} className="w-12 h-8 object-contain" />
                    <p className="font-body font-medium text-[11px] text-forest-600 leading-tight">{v.name}</p>
                    <p className="font-body text-[10px] text-warm-400">{v.capacity} pax</p>
                    <span className="font-body text-xs font-semibold text-forest-600">
                      {format(tour.vehicleRates?.[v.id as keyof typeof tour.vehicleRates] ?? v.pricePerDay)}
                      <span className="text-[9px] font-normal text-warm-400">/d</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Travellers */}
            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Travellers</label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 w-4 h-4 text-warm-400" />
                <select
                  value={pax}
                  onChange={e => setPax(Number(e.target.value))}
                  className="w-full bg-warm-50 border border-warm-200 rounded-xl py-2.5 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none appearance-none"
                >
                  {Array.from({ length: maxPax }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Alternative Start / End Location */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showAltLocation}
                onChange={e => {
                  setShowAltLocation(e.target.checked);
                  if (!e.target.checked) { setAltStartCity(null); setAltEndCity(null); }
                }}
                className="w-4 h-4 rounded accent-forest-600 cursor-pointer"
              />
              <span className="font-body text-sm font-medium text-forest-600 group-hover:text-forest-500 transition-colors flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-forest-400" />
                Alternate start / end location
              </span>
            </label>

            {showAltLocation && (
              <div className="flex flex-col gap-3 pl-7">
                <LocationPicker
                  label={`Start (default: ${firstDay?.location ?? 'Day 1 location'})`}
                  defaultLabel={firstDay?.location ?? 'Day 1 location'}
                  selected={altStartCity}
                  onSelect={setAltStartCity}
                  originalCoords={origStartCoords}
                  surchargeRate={surchargeRate}
                  format={format}
                />
                <LocationPicker
                  label={`End (default: ${lastDay?.location ?? 'Last day location'})`}
                  defaultLabel={lastDay?.location ?? 'Last day location'}
                  selected={altEndCity}
                  onSelect={setAltEndCity}
                  originalCoords={origEndCoords}
                  surchargeRate={surchargeRate}
                  format={format}
                />
              </div>
            )}

            {/* Add-ons — only shown if admin has enabled it */}
            {showAddOns && tour.addOns && tour.addOns.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Add-ons</label>
                <div className="space-y-2">
                  {tour.addOns.map((addon: any) => (
                    <label key={addon.id} className="flex items-center justify-between p-3 border border-warm-200 rounded-xl cursor-pointer hover:bg-warm-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAddOns[addon.id] || false}
                          onChange={e => setSelectedAddOns(prev => ({ ...prev, [addon.id]: e.target.checked }))}
                          className="w-4 h-4 rounded accent-forest-600"
                        />
                        <div>
                          <span className="font-body text-sm text-forest-600">{addon.name}</span>
                          <p className="font-body text-xs text-warm-400">{addon.description}</p>
                        </div>
                      </div>
                      <span className="font-body text-sm font-medium text-warm-600 whitespace-nowrap ml-2">+{format(addon.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price summary */}
            <div className="border-t border-warm-100 pt-4 space-y-2">
              <div className="flex justify-between font-body text-sm text-warm-500">
                <span>{format(vehicleRate)} × {duration} days</span>
                <span className="text-forest-600 font-medium">{format(vehicleTotal)}</span>
              </div>
              {addOnsTotal > 0 && (
                <div className="flex justify-between font-body text-sm text-warm-500">
                  <span>Add-ons</span>
                  <span className="text-forest-600 font-medium">{format(addOnsTotal)}</span>
                </div>
              )}
              {locationSurchargeTotal > 0 && (
                <div className="flex justify-between font-body text-sm text-warm-500">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Location surcharge
                  </span>
                  <span className="text-amber-600 font-medium">{format(locationSurchargeTotal)}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2 border-t border-warm-100">
                <span className="font-body text-xs text-warm-400">per vehicle, not per person</span>
                <span className="font-display text-3xl text-forest-600">{format(totalPrice)}</span>
              </div>
            </div>

            {!startDate && (
              <p className="flex items-center gap-1.5 font-body text-xs text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" /> Please select a start date
              </p>
            )}

            <Button
              onClick={handleBooking}
              disabled={!startDate}
              className="w-full h-14 text-lg font-body bg-amber-200 hover:bg-amber-300 text-forest-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              Book this tour — {format(totalPrice)} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-emerald-600 font-body flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Free cancellation 10+ days before start.
            </p>
          </div>
        </div>
      </div>

      {/* Save Trip CTA — full width above footer */}
      <SaveTripSection
        tripSnapshot={{
          tourId: tour.id,
          tourName: tour.title ?? tour.name,
          groupSlug,
          duration,
          vehicleType: selectedVehicle,
          startDate,
          totalPrice,
          pax,
          heroImage: tour.images?.[0],
        }}
        format={format}
      />
    </div>
  );
}
