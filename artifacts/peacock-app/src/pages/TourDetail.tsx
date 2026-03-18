import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useTour, useVehicles } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { MapPlaceholder } from '@/components/shared/MapPlaceholder';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Calendar as CalendarIcon, Users, Check, X, ChevronDown, ChevronUp, Shield, Plus, Minus, ArrowRight } from 'lucide-react';

export default function TourDetail() {
  const [, params] = useRoute('/tours/:slug');
  const slug = params?.slug;
  const { data: tour, isLoading } = useTour(slug || '');
  const { data: vehicles } = useVehicles();
  const { format } = useCurrency();

  const [selectedVehicle, setSelectedVehicle] = useState<string>('minivan');
  const [pax, setPax] = useState(2);
  const [extraDays, setExtraDays] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [startDate, setStartDate] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});

  if (isLoading) return <div className="min-h-screen pt-32 text-center font-body">Loading journey details...</div>;
  if (!tour) return <div className="min-h-screen pt-32 text-center font-body">Tour not found.</div>;

  const totalDays = tour.durationDays + extraDays;
  const vehicleRate = tour.vehicleRates?.[selectedVehicle as keyof typeof tour.vehicleRates] ?? 45;
  const vehicleTotal = vehicleRate * totalDays;
  const addOnsTotal = (tour.addOns || []).reduce((sum: number, a: any) => sum + (selectedAddOns[a.id] ? a.price : 0), 0);
  const totalPrice = vehicleTotal + addOnsTotal;
  const vehicleDetails = vehicles?.find((v: any) => v.id === selectedVehicle);
  const maxPax = vehicleDetails?.maxPassengers ?? 35;
  const locations = tour.itinerary.map((d: any) => d.location).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + (tour.leadTimeDays || 3));
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="bg-white pb-32">
      <div className="h-[55vh] md:h-[70vh] min-h-[450px] relative w-full overflow-hidden">
        <img src={tour.images[0]} className="w-full h-full object-cover" alt={tour.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-700/80 via-forest-700/20 to-transparent" />
        <div className="absolute bottom-10 left-0 w-full">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-pill text-white text-sm font-medium font-body border border-white/30">{tour.category}</span>
              <span className="px-3 py-1 bg-amber-500/80 backdrop-blur-md rounded-pill text-white text-sm font-medium font-body">{tour.difficulty}</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-pill text-white text-sm font-medium font-body border border-white/30">
                <Clock className="w-3.5 h-3.5 inline mr-1" />{tour.durationDays} days / {tour.durationNights} nights
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-3">{tour.title}</h1>
            <p className="font-body text-xl text-white/90 max-w-2xl">{tour.tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-12 flex flex-col lg:flex-row gap-12 relative">
        <div className="flex-1 lg:w-2/3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-warm-100 mb-12">
            <div className="flex flex-col gap-1">
              <span className="text-warm-400 text-xs font-body uppercase tracking-wider">Duration</span>
              <div className="flex items-center gap-2 text-forest-600 font-medium font-body text-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                {tour.durationDays} Days, {tour.durationNights} Nights
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-warm-400 text-xs font-body uppercase tracking-wider">Start/End</span>
              <div className="flex items-center gap-2 text-forest-600 font-medium font-body text-sm">
                <MapPin className="w-4 h-4 text-amber-500" />
                {tour.startEnd || 'Colombo (CMB)'}
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <span className="text-warm-400 text-xs font-body uppercase tracking-wider">Regions</span>
              <div className="flex items-center gap-2 text-forest-600 font-medium font-body text-sm">
                {tour.regions.join(' • ')}
              </div>
            </div>
          </div>

          {tour.description && (
            <div className="mb-12">
              <p className="font-body text-warm-600 leading-relaxed text-lg">{tour.description}</p>
              {tour.highlights && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {tour.highlights.map((h: string) => (
                    <span key={h} className="px-3 py-1.5 bg-sage rounded-pill text-xs font-medium text-forest-600 font-body">{h}</span>
                  ))}
                </div>
              )}
            </div>
          )}

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
                {tour.included.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-warm-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
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
                {tour.notIncluded.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-warm-600">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 mb-16">
            <div className="flex-1">
              <SectionHeading overline="itinerary" title="Your *itinerary*" />
              <div className="space-y-3">
                {tour.itinerary.map((day: any) => (
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
                          <h4 className="font-display text-xl text-forest-600">{day.title}</h4>
                          <p className="font-body text-xs text-warm-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {day.location}
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
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {day.drivingTime}
                          </div>
                          {day.stops.map((stop: string) => (
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
            <div className="lg:w-[280px] shrink-0">
              <div className="sticky top-24">
                <MapPlaceholder locations={locations} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[380px] shrink-0 relative">
          <div className="sticky top-24 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-warm-100 p-6 flex flex-col gap-5">
            <h3 className="font-display text-2xl text-forest-600">Book this tour</h3>

            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Start Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                <input
                  type="date"
                  min={minDateStr}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-warm-50 border border-warm-200 rounded-xl py-2.5 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2 font-body">
                Duration: <span className="text-amber-500">{totalDays} days</span>
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => setExtraDays(d => Math.max(-(tour.maxExtraDays || 3), d - 1))} className="w-8 h-8 rounded-lg bg-warm-50 border border-warm-200 flex items-center justify-center hover:bg-warm-100">
                  <Minus className="w-4 h-4 text-warm-500" />
                </button>
                <input
                  type="range"
                  min={-(tour.maxExtraDays || 3)}
                  max={tour.maxExtraDays || 3}
                  value={extraDays}
                  onChange={e => setExtraDays(Number(e.target.value))}
                  className="flex-1 accent-forest-500"
                />
                <button onClick={() => setExtraDays(d => Math.min(tour.maxExtraDays || 3, d + 1))} className="w-8 h-8 rounded-lg bg-warm-50 border border-warm-200 flex items-center justify-center hover:bg-warm-100">
                  <Plus className="w-4 h-4 text-warm-500" />
                </button>
              </div>
              {extraDays !== 0 && (
                <p className="font-body text-xs text-warm-400 mt-1">
                  {extraDays > 0 ? `+${extraDays} extra` : `${extraDays}`} days from standard {tour.durationDays}-day itinerary
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Vehicle</label>
              <div className="flex flex-col gap-2">
                {vehicles?.map((v: any) => (
                  <div
                    key={v.id}
                    onClick={() => { setSelectedVehicle(v.id); setPax(p => Math.min(p, v.maxPassengers)); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedVehicle === v.id ? 'border-forest-500 bg-forest-50 ring-1 ring-forest-500' : 'border-warm-200 hover:border-forest-300'}`}
                  >
                    <img src={v.image} alt={v.name} className="w-14 h-10 object-contain shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-sm text-forest-600">{v.name}</p>
                      <p className="font-body text-xs text-warm-400">{v.capacity} pax</p>
                    </div>
                    <span className="font-body text-sm font-semibold text-forest-600 whitespace-nowrap">
                      {format(tour.vehicleRates?.[v.id as keyof typeof tour.vehicleRates] ?? v.pricePerDay)}<span className="text-xs font-normal text-warm-400">/d</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

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

            {tour.addOns && tour.addOns.length > 0 && (
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

            <div className="border-t border-warm-100 pt-4 space-y-2">
              <div className="flex justify-between font-body text-sm text-warm-500">
                <span>{format(vehicleRate)} × {totalDays} days</span>
                <span className="text-forest-600 font-medium">{format(vehicleTotal)}</span>
              </div>
              {addOnsTotal > 0 && (
                <div className="flex justify-between font-body text-sm text-warm-500">
                  <span>Add-ons</span>
                  <span className="text-forest-600 font-medium">{format(addOnsTotal)}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2 border-t border-warm-100">
                <span className="font-body text-xs text-warm-400">per vehicle, not per person</span>
                <span className="font-display text-3xl text-forest-600">{format(totalPrice)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="w-full h-14 text-lg font-body bg-amber-400 hover:bg-amber-300 text-forest-600 shadow-md hover:shadow-lg transition-all">
                Book this tour — {format(totalPrice)} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <p className="text-center text-xs text-emerald-600 font-body flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Free cancellation 10+ days before start.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
