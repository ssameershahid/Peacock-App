import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { SectionHeading } from '@/components/shared/SectionHeading';
import HowItWorksSteps from '@/components/peacock/HowItWorksSteps';
import { useTourGroups } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Map, SlidersHorizontal, ArrowRight, Clock, Users, ChevronDown, Minus, Plus } from 'lucide-react';
import DesignAdventureCTA from '@/components/peacock/DesignAdventureCTA';
import { useCurrency } from '@/contexts/CurrencyContext';

const DURATIONS = [5, 7, 10, 14] as const;

// ── Counter row ───────────────────────────────────────────────────────────────

function CounterRow({
  label, sublabel, value, min, max,
  onChange,
}: {
  label: string; sublabel: string; value: number;
  min: number; max: number; onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="font-body text-sm font-medium text-forest-600">{label}</p>
        <p className="font-body text-xs text-warm-400">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 disabled:opacity-30 transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-5 text-center font-body text-sm font-semibold text-forest-600 tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 disabled:opacity-30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Travellers selector ───────────────────────────────────────────────────────

interface TravellerState {
  adults: number;
  children: number;
  childAges: string[];
}

function TravellersSelector({
  value, onChange,
}: {
  value: TravellerState;
  onChange: (v: TravellerState) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const { adults, children, childAges } = value;

  const label = children === 0
    ? `${adults} Adult${adults !== 1 ? 's' : ''}`
    : `${adults} Adult${adults !== 1 ? 's' : ''} · ${children} Child${children !== 1 ? 'ren' : ''}`;

  const isDefault = adults === 2 && children === 0;

  function setAdults(n: number) {
    onChange({ ...value, adults: n });
  }

  function setChildren(n: number) {
    const ages = n > childAges.length
      ? [...childAges, ...Array(n - childAges.length).fill('')]
      : childAges.slice(0, n);
    onChange({ ...value, children: n, childAges: ages });
  }

  function setChildAge(i: number, age: string) {
    const ages = childAges.map((a, idx) => (idx === i ? age : a));
    onChange({ ...value, childAges: ages });
  }

  const allAgesSet = children === 0 || childAges.slice(0, children).every(a => a !== '');

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-pill font-body text-sm shadow-sm transition-all ${
          open || !isDefault
            ? 'border-forest-400 text-forest-600 ring-1 ring-forest-300'
            : 'border-warm-200 text-warm-600 hover:border-warm-400'
        }`}
      >
        <Users className="w-4 h-4 shrink-0" />
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-warm-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl border border-warm-200 shadow-2xl p-5 w-80">
          {/* Adults */}
          <CounterRow label="Adults" sublabel="Age 18+" value={adults} min={1} max={12} onChange={setAdults} />

          <div className="my-3 border-t border-warm-100" />

          {/* Children */}
          <CounterRow label="Children" sublabel="Age 0–17" value={children} min={0} max={8} onChange={setChildren} />

          {/* Per-child age selectors */}
          {children > 0 && (
            <div className="mt-4 pt-4 border-t border-warm-100 space-y-3">
              <p className="font-body text-xs text-warm-500 font-medium">Age of each child at time of travel</p>
              {Array.from({ length: children }, (_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <label className="font-body text-sm text-warm-600 shrink-0">Child {i + 1}</label>
                  <select
                    value={childAges[i] ?? ''}
                    onChange={e => setChildAge(i, e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 appearance-none cursor-pointer ${
                      !childAges[i] ? 'border-amber-300 bg-amber-50 text-warm-500' : 'border-warm-200 text-forest-600'
                    }`}
                  >
                    <option value="">Select age</option>
                    <option value="0">Under 1 (Infant)</option>
                    <option value="1">1 year old</option>
                    {Array.from({ length: 16 }, (_, j) => j + 2).map(age => (
                      <option key={age} value={String(age)}>{age} years old</option>
                    ))}
                  </select>
                </div>
              ))}
              {!allAgesSet && (
                <p className="font-body text-[11px] text-amber-600">Please select an age for each child</p>
              )}
            </div>
          )}

          <button
            onClick={() => setOpen(false)}
            className="mt-5 w-full py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium rounded-full transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tour group card ───────────────────────────────────────────────────────────

function TourGroupCard({ group, travellers, activeDuration }: { group: any; travellers: TravellerState; activeDuration: number }) {
  const [, navigate] = useLocation();
  const { format } = useCurrency();

  const selectedDuration = activeDuration;

  const selectedVariant = group.variants.find((v: any) => v.durationDays === selectedDuration) ?? group.variants[0];
  const perDay = selectedVariant?.vehicleRates?.find((r: any) => r.vehicleType === 'car')?.pricePerDay
    ?? selectedVariant?.vehicleRates?.[0]?.pricePerDay
    ?? 0;

  const heroImage = group.heroImages?.[0] ?? '';

  function handleView() {
    sessionStorage.setItem('peacock_travellers', JSON.stringify(travellers));
    navigate(`/tours/${group.groupSlug}/${selectedDuration}`);
  }

  return (
    <div className="group block rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Image */}
      <div className="relative h-[240px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt={group.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-600/90 via-forest-600/30 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 z-10">
          <h3 className="font-display text-2xl text-white mb-1">{group.name}</h3>
          <p className="font-body text-sm text-white/80 line-clamp-1">{group.tagline}</p>
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-pill flex items-center gap-1.5 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-forest-500" />
          <span className="font-body text-xs font-medium text-forest-600">{selectedDuration} Days</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Best for */}
        {group.bestFor && (
          <p className="font-body text-xs text-warm-400 mb-3">
            <span className="font-semibold text-warm-500">Best for:</span> {group.bestFor}
          </p>
        )}

        {/* Highlight pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(group.highlights ?? group.regions ?? []).slice(0, 4).map((h: string) => (
            <span key={h} className="px-2.5 py-1 bg-warm-50 rounded-pill text-xs font-medium text-warm-400 font-body">
              {h}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-warm-400 font-body">From</span>
            <span className="text-lg font-semibold text-forest-500 font-body">
              {perDay > 0 ? <>{format(perDay)} <span className="text-sm font-normal text-warm-400">/day</span></> : '—'}
            </span>
          </div>
          <button
            onClick={handleView}
            className="flex items-center gap-1 font-body text-sm font-semibold text-forest-500 hover:text-amber-500 transition-colors"
          >
            View tour <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Tours() {
  const { data: groups, isLoading } = useTourGroups();
  const [duration, setDuration] = useState<number>(7);
  const [region, setRegion] = useState('All');
  const [travellers, setTravellers] = useState<TravellerState>({ adults: 2, children: 0, childAges: [] });

  const allRegions = useMemo(() => {
    if (!groups) return [];
    const set = new Set<string>();
    groups.forEach((g: any) => g.regions?.forEach((r: string) => set.add(r)));
    return Array.from(set).sort();
  }, [groups]);

  const filtered = useMemo(() => {
    if (!groups) return [];
    return groups.filter((g: any) => {
      if (!g.variants.some((v: any) => v.durationDays === duration)) return false;
      if (region !== 'All' && !g.regions?.some((r: string) => r.toLowerCase().includes(region.toLowerCase()))) return false;
      return true;
    });
  }, [groups, duration, region]);

  return (
    <div className="pt-24 pb-32 min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-forest-600 py-16 -mt-24 pt-36 mb-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-amber-200 mb-3">EXPLORE SRI LANKA</p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">
            Ready-to-go <em className="italic text-amber-200">tours</em>
          </h1>
          <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
            Curated private itineraries across Sri Lanka's finest regions. Every route is flexible,
            fully guided, and driven by an expert local driver.
          </p>

          <HowItWorksSteps steps={[
            {
              title: 'Choose your journey',
              desc: 'Browse our selection of ready-made tours. Each tour has 5, 7, 10 & 14-day itineraries with the added option to select an alternative start and end location so you get the best experience whatever your timeframe is.',
            },
            {
              title: 'Select your vehicle',
              desc: 'Select your vehicle, number of travellers, and pay securely online. Stripe-powered checkout.',
            },
            {
              title: 'Meet your driver',
              desc: 'Your personal, English-speaking and Tourist Board-certified concierge driver arrives on time, ready to show you the real Sri Lanka.',
            },
          ]} />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Custom tour banner */}
        <Link href="/tours/custom" className="block mb-12">
          <div className="bg-sage rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-forest-100 hover:shadow-card-hover transition-shadow cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Map className="w-5 h-5 text-forest-500" />
              </div>
              <div>
                <h3 className="font-display text-xl text-forest-600">Don't see what you're looking for?</h3>
                <p className="font-body text-sm text-warm-500">Tell us your dream trip and we'll create a bespoke itinerary just for you.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 font-body font-semibold text-forest-500 group-hover:text-amber-200 transition-colors whitespace-nowrap">
              Create your own tour <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-warm-400" />
          </div>

          {/* Travellers selector */}
          <TravellersSelector value={travellers} onChange={setTravellers} />

          {/* Duration — fixed 4 options, default 7 days */}
          <div className="flex items-center gap-1 bg-white border border-warm-200 rounded-pill px-1 py-1 shadow-sm">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-4 py-1.5 rounded-full font-body text-sm transition-colors whitespace-nowrap ${
                  duration === d ? 'bg-forest-500 text-white' : 'text-warm-500 hover:text-forest-600'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>

          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="px-4 py-2 bg-white border border-warm-200 rounded-pill font-body text-sm text-warm-600 focus:ring-2 focus:ring-forest-500 outline-none appearance-none cursor-pointer shadow-sm"
          >
            <option value="All">All regions</option>
            {allRegions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

        </div>

        {/* Tour grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[480px] bg-warm-100 rounded-2xl animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <p className="font-body text-warm-400 text-lg">No tours match your filters.</p>
              <Button variant="ghost" onClick={() => { setDuration(7); setRegion('All'); }} className="mt-4">
                Clear filters
              </Button>
            </div>
          ) : (
            filtered.map((group: any) => (
              <TourGroupCard key={group.groupId} group={group} travellers={travellers} activeDuration={duration} />
            ))
          )}
        </div>

        <DesignAdventureCTA className="bg-transparent" />
      </div>
    </div>
  );
}
