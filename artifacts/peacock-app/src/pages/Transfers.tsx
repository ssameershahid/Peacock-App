import React, { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { SectionHeading } from '@/components/shared/SectionHeading';
import HowItWorksSteps from '@/components/peacock/HowItWorksSteps';
import { MapView } from '@/components/shared/MapView';
import { PlacesAutocomplete, type PlaceResult } from '@/components/shared/PlacesAutocomplete';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTransfers, usePopularRoutes, useVehicles } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import {
  Plane, Clock, MapPin, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeftRight, Calendar, Users, Luggage, Plus, Minus,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RouteOptions {
  vehicleId: string;
  time: string;
  adults: number;
  children: number;
  childAges: string[];
  luggage: number;
  flightNumber: string;
  arrivalTime: string;
}

const DEFAULT_ROUTE_OPTIONS: RouteOptions = {
  vehicleId: 'car',
  time: '08:00',
  adults: 2,
  children: 0,
  childAges: [],
  luggage: 2,
  flightNumber: '',
  arrivalTime: '',
};

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({
  label, value, onChange, min = 0, max = 35, icon: Icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-body text-xs text-warm-400 flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full border border-warm-200 flex items-center justify-center text-warm-400 hover:border-forest-400 hover:text-forest-600 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="font-body text-sm font-semibold text-forest-600 w-6 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border border-warm-200 flex items-center justify-center text-warm-400 hover:border-forest-400 hover:text-forest-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── BookingPanel ──────────────────────────────────────────────────────────────

function BookingPanel({
  prices,
  vehicles,
  options,
  timeSlots,
  onPatch,
  onBook,
  format,
}: {
  prices: Record<string, number>;
  vehicles: any[];
  options: RouteOptions;
  timeSlots: string[];
  onPatch: (patch: Partial<RouteOptions>) => void;
  onBook: (opts: RouteOptions) => void;
  format: (n: number) => string;
}) {
  const price = prices?.[options.vehicleId] ?? 0;
  const selectedVehicleData = vehicles.find((v: any) => v.id === options.vehicleId);

  const autoUpgrade = (pax: number, bags: number): string => {
    const sorted = [...vehicles].sort((a: any, b: any) => a.maxPassengers - b.maxPassengers);
    const fits = sorted.find((v: any) => v.maxPassengers >= pax && v.maxLuggage >= bags);
    return fits?.id ?? sorted[sorted.length - 1].id;
  };

  return (
    <div className="pt-4 space-y-4 border-t border-warm-100 mt-1">
      {/* Vehicle slider — greyed out if too small for selected pax/luggage */}
      <div>
        <p className="font-body text-[11px] font-medium uppercase tracking-wider text-warm-400 mb-2">
          Select vehicle
        </p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {vehicles.map((v: any) => {
            const tooSmall = v.maxPassengers < (options.adults + options.children) || v.maxLuggage < options.luggage;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => !tooSmall && onPatch({ vehicleId: v.id })}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border-2 shrink-0 min-w-[84px] transition-all focus:outline-none ${
                  tooSmall
                    ? 'border-warm-100 bg-warm-50 opacity-40 cursor-not-allowed'
                    : options.vehicleId === v.id
                    ? 'border-forest-500 bg-forest-50 cursor-pointer'
                    : 'border-warm-200 bg-white hover:border-forest-300 cursor-pointer'
                }`}
              >
                <img src={v.image} alt={v.name} className="w-14 h-8 object-contain" />
                <span className="font-body text-[11px] font-semibold text-forest-600 text-center leading-tight mt-0.5">
                  {v.name}
                </span>
                <span className="font-body text-[10px] text-warm-400">{v.capacity}</span>
                <span className="font-body text-[11px] font-bold text-forest-600">
                  {format(prices?.[v.id] ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
        {selectedVehicleData && (
          <p className="font-body text-xs text-forest-500 mt-1.5">
            ✓ <span className="font-medium">{selectedVehicleData.name}</span> — {selectedVehicleData.capacity} · {selectedVehicleData.luggageLabel}
          </p>
        )}
      </div>

      {/* Time · Luggage row */}
      <div className="flex flex-wrap items-end gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="font-body text-xs text-warm-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pickup time
          </span>
          <select
            value={options.time}
            onChange={e => onPatch({ time: e.target.value })}
            className="bg-white border border-warm-200 rounded-xl py-1.5 px-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none appearance-none min-w-[90px]"
          >
            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Stepper
          label="Luggage bags"
          value={options.luggage}
          onChange={v => {
            const vehicleId = autoUpgrade(options.adults + options.children, v);
            onPatch({ luggage: v, vehicleId });
          }}
          min={0} max={20}
          icon={Luggage}
        />
      </div>

      {/* Passengers — adults / children / child ages */}
      <div className="space-y-1">
        <p className="font-body text-xs text-warm-400 flex items-center gap-1 mb-2">
          <Users className="w-3 h-3" /> Passengers
        </p>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-body text-sm font-medium text-forest-600">Adults</p>
            <p className="font-body text-xs text-warm-400">Age 18+</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => {
                const a = Math.max(1, options.adults - 1);
                onPatch({ adults: a, vehicleId: autoUpgrade(a + options.children, options.luggage) });
              }}
              className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-5 text-center font-body text-sm font-semibold text-forest-600 tabular-nums">{options.adults}</span>
            <button type="button"
              onClick={() => {
                const a = Math.min(35, options.adults + 1);
                onPatch({ adults: a, vehicleId: autoUpgrade(a + options.children, options.luggage) });
              }}
              className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="border-t border-warm-100" />
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-body text-sm font-medium text-forest-600">Children</p>
            <p className="font-body text-xs text-warm-400">Age 0–17</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => {
                const c = Math.max(0, options.children - 1);
                onPatch({ children: c, childAges: options.childAges.slice(0, c), vehicleId: autoUpgrade(options.adults + c, options.luggage) });
              }}
              className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-5 text-center font-body text-sm font-semibold text-forest-600 tabular-nums">{options.children}</span>
            <button type="button"
              onClick={() => {
                const c = Math.min(12, options.children + 1);
                const ages = c > options.childAges.length
                  ? [...options.childAges, ...Array(c - options.childAges.length).fill('')]
                  : options.childAges;
                onPatch({ children: c, childAges: ages, vehicleId: autoUpgrade(options.adults + c, options.luggage) });
              }}
              className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {options.children > 0 && (
          <div className="pt-3 border-t border-warm-100 space-y-3">
            <p className="font-body text-xs text-warm-500 font-medium">Age of each child at time of travel</p>
            {Array.from({ length: options.children }, (_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <label className="font-body text-sm text-warm-600 shrink-0">Child {i + 1}</label>
                <select
                  value={options.childAges[i] ?? ''}
                  onChange={e => {
                    const ages = options.childAges.map((a, idx) => idx === i ? e.target.value : a);
                    onPatch({ childAges: ages });
                  }}
                  className={`flex-1 max-w-[180px] px-3 py-2 border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 appearance-none cursor-pointer ${
                    !options.childAges[i] ? 'border-amber-300 bg-amber-50 text-warm-500' : 'border-warm-200 text-forest-600'
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
            {!options.childAges.slice(0, options.children).every(a => a !== '') && (
              <p className="font-body text-[11px] text-amber-600">Please select an age for each child</p>
            )}
          </div>
        )}
      </div>

      {/* Flight details */}
      <div className="border-t border-warm-100 pt-4">
        <p className="font-body text-sm font-medium text-forest-600 mb-0.5">Flight details <span className="text-warm-400 font-normal">(Optional)</span></p>
        <p className="font-body text-xs text-warm-400 mb-3">Help us track your arrival so we can adjust pickup time.</p>
        <div className="space-y-2">
          <div className="relative">
            <Plane className="absolute left-3 top-2.5 w-3.5 h-3.5 text-warm-400" />
            <input
              type="text"
              value={options.flightNumber}
              onChange={e => onPatch({ flightNumber: e.target.value })}
              maxLength={80}
              placeholder="Flight number (e.g. EK651)"
              className="w-full bg-white border border-warm-200 rounded-xl py-2 pl-9 pr-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
            />
          </div>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-warm-400" />
            <input
              type="time"
              value={options.arrivalTime}
              onChange={e => onPatch({ arrivalTime: e.target.value })}
              className="w-full bg-white border border-warm-200 rounded-xl py-2 pl-9 pr-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button className="w-full font-body" onClick={() => onBook(options)}>
        Book now — {format(price)} <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Transfers() {
  const { format } = useCurrency();
  const { data: routes } = useTransfers();
  const { data: popularRoutes } = usePopularRoutes();
  const { data: vehicles } = useVehicles();
  const [, setLocation] = useLocation();

  // Airport section
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [showAllAirportRoutes, setShowAllAirportRoutes] = useState(false);

  // Popular routes section
  const [expandedPopularRoute, setExpandedPopularRoute] = useState<string | null>(null);
  const [showAllPopularRoutes, setShowAllPopularRoutes] = useState(false);

  // Per-route booking options (shared map for both airport + popular)
  const [routeOptions, setRouteOptions] = useState<Record<string, RouteOptions>>({});

  // Custom route state
  const [customVehicle, setCustomVehicle] = useState('car');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('08:00');
  const [customAdults, setCustomAdults] = useState(2);
  const [customChildren, setCustomChildren] = useState(0);
  const [customChildAges, setCustomChildAges] = useState<string[]>([]);
  const [customLuggage, setCustomLuggage] = useState(2);

  const dateRef = useRef<HTMLInputElement>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const customVehicleData = vehicles?.find((v: any) => v.id === customVehicle);
  const perKmRate = customVehicleData ? customVehicleData.pricePerDay / 100 : 0.55;

  const autoSelectVehicle = useCallback((pax: number, bags: number, currentVehicle: string) => {
    if (!vehicles) return currentVehicle;
    const sorted = [...vehicles].sort((a: any, b: any) => a.maxPassengers - b.maxPassengers);
    const fits = sorted.find((v: any) => v.maxPassengers >= pax && v.maxLuggage >= bags);
    return fits ? fits.id : sorted[sorted.length - 1].id;
  }, [vehicles]);

  const estimatedDistance = pickup && dropoff ? 80 + Math.floor(Math.random() * 120) : 0;
  const estimatedPrice = Math.round(estimatedDistance * perKmRate);

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  });

  const getOpts = (id: string): RouteOptions => {
    const defaults = { ...DEFAULT_ROUTE_OPTIONS, vehicleId: vehicles?.[0]?.id ?? 'car' };
    return { ...defaults, ...routeOptions[id] };
  };

  const patchOpts = (id: string, patch: Partial<RouteOptions>) =>
    setRouteOptions(prev => ({ ...prev, [id]: { ...getOpts(id), ...patch } }));

  const bookTransfer = (opts: {
    name: string;
    vehicleType: string;
    vehicleName: string;
    price: number;
    startDate?: string;
    pickupTime?: string;
    passengers?: number;
    adults?: number;
    children?: number;
    childAges?: string[];
    luggage?: number;
    routeId?: string;
    flightNumber?: string;
    arrivalTime?: string;
  }) => {
    const data = {
      type: 'TRANSFER',
      transferRouteId: opts.routeId,
      tourName: opts.name,
      vehicleType: opts.vehicleType,
      vehicleName: opts.vehicleName,
      startDate: opts.startDate || '',
      pickupTime: opts.pickupTime || '',
      numDays: 1,
      passengers: opts.passengers ?? 2,
      adults: opts.adults ?? opts.passengers ?? 2,
      children: opts.children ?? 0,
      childAges: opts.childAges ?? [],
      luggage: opts.luggage ?? 2,
      vehicleRate: opts.price,
      vehicleTotal: opts.price,
      addOnsTotal: 0,
      selectedAddOns: [],
      totalPrice: opts.price,
      flightNumber: opts.flightNumber || undefined,
      arrivalTime: opts.arrivalTime || undefined,
    };
    sessionStorage.setItem('peacock_booking', JSON.stringify(data));
    setLocation('/checkout');
  };

  return (
    <div className="pt-24 pb-32 min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-forest-600 py-16 -mt-24 pt-36 mb-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-amber-200 mb-3">GET THERE</p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">
            Island <em className="italic text-amber-200">transfers</em>
          </h1>
          <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
            Private driver transfers to any destination in Sri Lanka. Airport pickups, city-to-city
            routes, and custom journeys — all with English-speaking drivers.
          </p>

          <HowItWorksSteps steps={[
            {
              title: 'Choose your journey',
              desc: 'Browse a selection of popular island-wide transfers or enter your own pickup & drop-off locations for a custom route.',
            },
            {
              title: 'Select your vehicle',
              desc: 'Select your vehicle, pickup time and number of passengers, and pay securely online. Stripe-powered checkout.',
            },
            {
              title: 'Meet your driver',
              desc: 'Your personal, English-speaking concierge driver arrives on time, ready to escort you to your destination in safety and comfort.',
            },
          ]} />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">

        {/* ── Airport pickup & drop-off ─────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex flex-col mb-8">
            <span className="font-body text-[12px] font-medium tracking-[0.08em] uppercase text-amber-200 mb-3">
              AIRPORT
            </span>
            <div className="flex items-center gap-3">
              <Plane className="w-7 h-7 text-forest-600 shrink-0" />
              <h2 className="font-display font-normal text-[28px] md:text-[40px] text-warm-900 leading-[1.15]">
                Airport pickup <em className="italic">& drop-off</em>
              </h2>
            </div>
          </div>

          {/* Single column — expansion never pushes a sibling card */}
          <div className="flex flex-col gap-3">
            {(showAllAirportRoutes ? routes : routes?.slice(0, 5))?.map((route: any) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-warm-200 overflow-hidden hover:shadow-card-hover transition-shadow"
              >
                <div className="p-5">
                  <h3 className="font-display text-xl text-forest-600 mb-1 flex items-center gap-2">
                    {route.from} <ArrowLeftRight className="w-4 h-4 text-warm-400 shrink-0" /> {route.to}
                  </h3>
                  <div className="flex gap-4 mb-4">
                    <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {route.distance}
                    </span>
                    <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {route.time}
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                    className="w-full flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-body text-sm font-semibold text-forest-600">
                      From {format(route.prices?.car ?? route.price ?? 0)}
                    </span>
                    {expandedRoute === route.id
                      ? <ChevronUp className="w-4 h-4 text-warm-400" />
                      : <ChevronDown className="w-4 h-4 text-warm-400" />}
                  </button>
                </div>

                {expandedRoute === route.id && (
                  <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                    <BookingPanel
                      prices={route.prices ?? {}}
                      vehicles={vehicles ?? []}
                      options={getOpts(route.id)}
                      timeSlots={timeSlots}
                      onPatch={patch => patchOpts(route.id, patch)}
                      onBook={opts => {
                        const v = vehicles?.find((v: any) => v.id === opts.vehicleId);
                        bookTransfer({
                          name: `${route.from} → ${route.to}`,
                          routeId: route.id,
                          vehicleType: opts.vehicleId,
                          vehicleName: v?.name ?? 'Private Transfer',
                          price: route.prices?.[opts.vehicleId] ?? route.price ?? 0,
                          pickupTime: opts.time,
                          passengers: opts.adults + opts.children,
                          adults: opts.adults,
                          children: opts.children,
                          childAges: opts.childAges,
                          luggage: opts.luggage,
                          flightNumber: opts.flightNumber,
                          arrivalTime: opts.arrivalTime,
                        });
                      }}
                      format={format}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {routes && routes.length > 5 && (
            <div className="mt-5 text-center">
              <button
                onClick={() => setShowAllAirportRoutes(v => !v)}
                className="inline-flex items-center gap-2 font-body text-sm text-forest-600 hover:text-forest-700 font-medium"
              >
                {showAllAirportRoutes
                  ? <><ChevronUp className="w-4 h-4" /> Show less</>
                  : <><ChevronDown className="w-4 h-4" /> See {routes.length - 5} more routes</>}
              </button>
            </div>
          )}
        </div>

        {/* ── Most booked routes ────────────────────────────────────────── */}
        <div className="mb-16">
          <SectionHeading
            overline="POPULAR"
            title="Most booked *routes*"
            className="mb-8"
          />
          {/* Single column — each card is self-contained, no shared grid heights */}
          <div className="flex flex-col gap-3">
            {(showAllPopularRoutes ? popularRoutes : popularRoutes?.slice(0, 5))?.map((route: any) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-warm-200 overflow-hidden hover:shadow-card-hover transition-shadow"
              >
                <div className="p-5">
                  <h3 className="font-display text-xl text-forest-600 mb-1 flex items-center gap-2">
                    {route.from} <ArrowLeftRight className="w-4 h-4 text-warm-400 shrink-0" /> {route.to}
                  </h3>
                  <div className="flex gap-3 mb-2">
                    <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {route.distance} km
                    </span>
                    <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {route.estimatedTime}
                    </span>
                  </div>
                  <p className="font-body text-sm text-warm-500 mb-4 line-clamp-2">
                    {route.description}
                  </p>
                  <button
                    onClick={() => setExpandedPopularRoute(
                      expandedPopularRoute === route.id ? null : route.id
                    )}
                    className="w-full flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-body text-sm font-semibold text-forest-600">
                      From {format(route.prices?.car ?? route.priceFrom ?? route.price ?? 0)}
                    </span>
                    {expandedPopularRoute === route.id
                      ? <ChevronUp className="w-4 h-4 text-warm-400" />
                      : <ChevronDown className="w-4 h-4 text-warm-400" />}
                  </button>
                </div>

                {expandedPopularRoute === route.id && (
                  <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                    <BookingPanel
                      prices={route.prices ?? {}}
                      vehicles={vehicles ?? []}
                      options={getOpts(route.id)}
                      timeSlots={timeSlots}
                      onPatch={patch => patchOpts(route.id, patch)}
                      onBook={opts => {
                        const v = vehicles?.find((v: any) => v.id === opts.vehicleId);
                        bookTransfer({
                          name: `${route.from} → ${route.to}`,
                          routeId: route.id,
                          vehicleType: opts.vehicleId,
                          vehicleName: v?.name ?? 'Private Transfer',
                          price: route.prices?.[opts.vehicleId] ?? route.priceFrom ?? route.price ?? 0,
                          pickupTime: opts.time,
                          passengers: opts.adults + opts.children,
                          adults: opts.adults,
                          children: opts.children,
                          childAges: opts.childAges,
                          luggage: opts.luggage,
                          flightNumber: opts.flightNumber,
                          arrivalTime: opts.arrivalTime,
                        });
                      }}
                      format={format}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {popularRoutes && popularRoutes.length > 5 && (
            <div className="mt-5 text-center">
              <button
                onClick={() => setShowAllPopularRoutes(v => !v)}
                className="inline-flex items-center gap-2 font-body text-sm text-forest-600 hover:text-forest-700 font-medium"
              >
                {showAllPopularRoutes
                  ? <><ChevronUp className="w-4 h-4" /> Show less</>
                  : <><ChevronDown className="w-4 h-4" /> See {popularRoutes.length - 5} more routes</>}
              </button>
            </div>
          )}
        </div>

        {/* ── Custom route ──────────────────────────────────────────────── */}
        <div className="bg-cream rounded-[32px] p-8 md:p-12 mb-16">
          <SectionHeading
            overline="CUSTOM ROUTE"
            title="Going somewhere *else*?"
            subtitle="Enter your pickup and drop-off to get an instant price."
            align="left"
            className="mb-8"
          />

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-5">
              {/* Locations */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">
                    Pickup location
                  </label>
                  <PlacesAutocomplete
                    value={pickup}
                    onChange={val => { setPickup(val); if (!val) setPickupCoords(null); }}
                    onPlaceSelect={(p: PlaceResult) => {
                      setPickup(p.name);
                      setPickupCoords([p.lng, p.lat]);
                    }}
                    placeholder="e.g. Colombo Fort"
                    icon={<MapPin className="w-4 h-4 text-emerald-500" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">
                    Drop-off location
                  </label>
                  <PlacesAutocomplete
                    value={dropoff}
                    onChange={val => { setDropoff(val); if (!val) setDropoffCoords(null); }}
                    onPlaceSelect={(p: PlaceResult) => {
                      setDropoff(p.name);
                      setDropoffCoords([p.lng, p.lat]);
                    }}
                    placeholder="e.g. Galle Fort"
                    icon={<MapPin className="w-4 h-4 text-red-400" />}
                  />
                </div>
              </div>

              {/* Vehicle slider */}
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">
                  Vehicle
                </label>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                  {vehicles?.map((v: any) => {
                    const tooSmall = v.maxPassengers < (customAdults + customChildren) || v.maxLuggage < customLuggage;
                    return (
                      <div
                        key={v.id}
                        onClick={() => !tooSmall && setCustomVehicle(v.id)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all shrink-0 min-w-[100px] ${
                          tooSmall
                            ? 'border-warm-100 bg-warm-50 opacity-40 cursor-not-allowed'
                            : customVehicle === v.id
                            ? 'border-forest-500 bg-forest-50 cursor-pointer'
                            : 'border-warm-200 hover:border-forest-300 bg-white cursor-pointer'
                        }`}
                      >
                        <img src={v.image} alt={v.name} className="w-16 h-10 object-contain mb-1" />
                        <p className="font-body text-xs font-medium text-forest-600 text-center">{v.name}</p>
                        <p className="font-body text-[10px] text-warm-400">{v.capacity}</p>
                      </div>
                    );
                  })}
                </div>
                {customVehicleData && (
                  <p className="font-body text-xs text-forest-500 mt-1.5">
                    ✓ <span className="font-medium">{customVehicleData.name}</span> — {customVehicleData.capacity} · {customVehicleData.luggageLabel}
                  </p>
                )}
              </div>

              {/* Date · Pickup time · Luggage */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Date</label>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => dateRef.current?.showPicker()}
                  >
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-warm-400 pointer-events-none" />
                    <input
                      ref={dateRef}
                      type="date"
                      lang="en-GB"
                      min={todayStr}
                      value={customDate}
                      onChange={e => setCustomDate(e.target.value)}
                      onKeyDown={e => e.preventDefault()}
                      onClick={() => dateRef.current?.showPicker()}
                      className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Pickup time</label>
                  <select
                    value={customTime}
                    onChange={e => setCustomTime(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none appearance-none"
                  >
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Luggage bags</label>
                  <div className="flex items-center gap-2 h-[46px]">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(0, customLuggage - 1);
                        setCustomLuggage(next);
                        setCustomVehicle(autoSelectVehicle(customAdults + customChildren, next, customVehicle));
                      }}
                      className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-400 hover:border-forest-400 hover:text-forest-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-body text-sm font-semibold text-forest-600 w-6 text-center">{customLuggage}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(20, customLuggage + 1);
                        setCustomLuggage(next);
                        setCustomVehicle(autoSelectVehicle(customAdults + customChildren, next, customVehicle));
                      }}
                      className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-400 hover:border-forest-400 hover:text-forest-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Passengers — adults / children / child ages */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Passengers</label>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-body text-sm font-medium text-forest-600">Adults</p>
                    <p className="font-body text-xs text-warm-400">Age 18+</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => {
                        const a = Math.max(1, customAdults - 1);
                        setCustomAdults(a);
                        setCustomVehicle(autoSelectVehicle(a + customChildren, customLuggage, customVehicle));
                      }}
                      className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-body text-sm font-semibold text-forest-600 tabular-nums">{customAdults}</span>
                    <button type="button"
                      onClick={() => {
                        const a = Math.min(35, customAdults + 1);
                        setCustomAdults(a);
                        setCustomVehicle(autoSelectVehicle(a + customChildren, customLuggage, customVehicle));
                      }}
                      className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="border-t border-warm-100" />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-body text-sm font-medium text-forest-600">Children</p>
                    <p className="font-body text-xs text-warm-400">Age 0–17</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => {
                        const c = Math.max(0, customChildren - 1);
                        setCustomChildren(c);
                        setCustomChildAges(customChildAges.slice(0, c));
                        setCustomVehicle(autoSelectVehicle(customAdults + c, customLuggage, customVehicle));
                      }}
                      className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-body text-sm font-semibold text-forest-600 tabular-nums">{customChildren}</span>
                    <button type="button"
                      onClick={() => {
                        const c = Math.min(12, customChildren + 1);
                        const ages = c > customChildAges.length
                          ? [...customChildAges, ...Array(c - customChildAges.length).fill('')]
                          : customChildAges;
                        setCustomChildren(c);
                        setCustomChildAges(ages);
                        setCustomVehicle(autoSelectVehicle(customAdults + c, customLuggage, customVehicle));
                      }}
                      className="w-8 h-8 rounded-full border border-warm-200 flex items-center justify-center text-warm-600 hover:border-forest-400 hover:text-forest-600 transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {customChildren > 0 && (
                  <div className="pt-3 border-t border-warm-100 space-y-3">
                    <p className="font-body text-xs text-warm-500 font-medium">Age of each child at time of travel</p>
                    {Array.from({ length: customChildren }, (_, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <label className="font-body text-sm text-warm-600 shrink-0">Child {i + 1}</label>
                        <select
                          value={customChildAges[i] ?? ''}
                          onChange={e => {
                            const ages = customChildAges.map((a, idx) => idx === i ? e.target.value : a);
                            setCustomChildAges(ages);
                          }}
                          className={`flex-1 max-w-[180px] px-3 py-2 border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 appearance-none cursor-pointer ${
                            !customChildAges[i] ? 'border-amber-300 bg-amber-50 text-warm-500' : 'border-warm-200 text-forest-600'
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
                    {!customChildAges.slice(0, customChildren).every(a => a !== '') && (
                      <p className="font-body text-[11px] text-amber-600">Please select an age for each child</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price estimate + book CTA */}
              {pickup && dropoff && (
                <div className="bg-white rounded-2xl p-6 border border-forest-200 text-center">
                  <p className="font-body text-sm text-warm-400 mb-1">Estimated price</p>
                  <p className="font-display text-5xl text-forest-600 mb-2">{format(estimatedPrice)}</p>
                  <p className="font-body text-xs text-warm-400">
                    ~{estimatedDistance} km · {customVehicleData?.name || 'Car'}
                  </p>
                  <Button
                    onClick={() => bookTransfer({
                      name: `${pickup} → ${dropoff}`,
                      vehicleType: customVehicle,
                      vehicleName: customVehicleData?.name || 'Private Transfer',
                      price: estimatedPrice,
                      startDate: customDate,
                      pickupTime: customTime,
                      passengers: customAdults + customChildren,
                      adults: customAdults,
                      children: customChildren,
                      childAges: customChildAges,
                      luggage: customLuggage,
                    })}
                    className="mt-4 h-12 px-8 text-base bg-amber-200 text-forest-600 hover:bg-amber-300 font-body"
                  >
                    Book transfer — {format(estimatedPrice)} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>

            {/* Map — always visible; shows route when both coords are set */}
            <div className="lg:w-[360px] shrink-0">
              <div className="sticky top-24">
                <MapView
                  markers={
                    pickupCoords && dropoffCoords
                      ? [
                          { id: 'pickup', lng: pickupCoords[0], lat: pickupCoords[1], label: pickup || 'Pickup', index: 0 },
                          { id: 'dropoff', lng: dropoffCoords[0], lat: dropoffCoords[1], label: dropoff || 'Drop-off', index: 1 },
                        ]
                      : pickupCoords
                      ? [{ id: 'pickup', lng: pickupCoords[0], lat: pickupCoords[1], label: pickup || 'Pickup', index: 0 }]
                      : []
                  }
                  showRoute={!!(pickupCoords && dropoffCoords)}
                  height="420px"
                  className="shadow-xl"
                />
                {(!pickupCoords || !dropoffCoords) && (
                  <p className="font-body text-xs text-warm-400 text-center mt-2">
                    {!pickupCoords && !dropoffCoords
                      ? 'Enter pickup & drop-off to see your route'
                      : 'Enter drop-off location to complete the route'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
