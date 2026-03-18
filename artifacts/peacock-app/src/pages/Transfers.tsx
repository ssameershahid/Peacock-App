import React, { useState } from 'react';
import { Link } from 'wouter';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { MapView, type MapMarker } from '@/components/shared/MapView';
import { PlacesAutocomplete, type PlaceResult } from '@/components/shared/PlacesAutocomplete';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTransfers, usePopularRoutes, useVehicles } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Plane, Clock, MapPin, ChevronDown, ChevronUp, ArrowRight, Calendar, Users, Luggage } from 'lucide-react';

export default function Transfers() {
  const { format } = useCurrency();
  const { data: routes } = useTransfers();
  const { data: popularRoutes } = usePopularRoutes();
  const { data: vehicles } = useVehicles();

  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState('car');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:00');
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);

  const selectedVehicleData = vehicles?.find((v: any) => v.id === selectedVehicle);
  const perKmRate = selectedVehicleData ? selectedVehicleData.pricePerDay / 100 : 0.55;
  const estimatedDistance = pickup && dropoff ? 80 + Math.floor(Math.random() * 120) : 0;
  const estimatedPrice = Math.round(estimatedDistance * perKmRate);

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  });

  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="bg-forest-600 py-16 -mt-24 pt-36 mb-16">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-amber-300 mb-3">GET THERE</p>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">Island <em className="italic text-amber-300">transfers</em></h1>
          <p className="font-body text-lg text-white/80 max-w-2xl mx-auto">
            Private driver transfers to any destination in Sri Lanka. Airport pickups, city-to-city routes, and custom journeys — all with English-speaking drivers.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-forest-500 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-3xl text-forest-600">Airport pickup & drop-off</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes?.map((route: any) => (
              <div key={route.id} className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm hover:shadow-card-hover transition-shadow">
                <button
                  onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-forest-600">{route.from} → {route.to}</h3>
                    <div className="flex gap-4 mt-2">
                      <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {route.distance}
                      </span>
                      <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {route.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-sm font-semibold text-forest-600">From {format(route.price)}</span>
                    {expandedRoute === route.id ? <ChevronUp className="w-5 h-5 text-warm-400" /> : <ChevronDown className="w-5 h-5 text-warm-400" />}
                  </div>
                </button>

                {expandedRoute === route.id && (
                  <div className="px-5 pb-5 pt-1 border-t border-warm-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      {vehicles?.map((v: any) => (
                        <div key={v.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-warm-50">
                          <div className="flex items-center gap-3">
                            <img src={v.image} alt={v.name} className="w-12 h-8 object-contain" />
                            <div>
                              <p className="font-body text-sm font-medium text-forest-600">{v.name}</p>
                              <p className="font-body text-xs text-warm-400">{v.capacity} pax</p>
                            </div>
                          </div>
                          <span className="font-body text-sm font-semibold text-forest-600">{format(route.prices[v.id])}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/checkout">
                      <Button className="w-full mt-4 font-body">
                        Book now <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

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
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Pickup location</label>
                  <PlacesAutocomplete
                    value={pickup}
                    onChange={val => { setPickup(val); if (!val) setPickupCoords(null); }}
                    onPlaceSelect={(p: PlaceResult) => { setPickup(p.name); setPickupCoords([p.lng, p.lat]); }}
                    placeholder="e.g. Colombo Fort"
                    icon={<MapPin className="w-4 h-4 text-emerald-500" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Drop-off location</label>
                  <PlacesAutocomplete
                    value={dropoff}
                    onChange={val => { setDropoff(val); if (!val) setDropoffCoords(null); }}
                    onPlaceSelect={(p: PlaceResult) => { setDropoff(p.name); setDropoffCoords([p.lng, p.lat]); }}
                    placeholder="e.g. Galle Fort"
                    icon={<MapPin className="w-4 h-4 text-red-400" />}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Vehicle</label>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                  {vehicles?.map((v: any) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicle(v.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all shrink-0 min-w-[100px] ${
                        selectedVehicle === v.id
                          ? 'border-forest-500 bg-forest-50'
                          : 'border-warm-200 hover:border-forest-300 bg-white'
                      }`}
                    >
                      <img src={v.image} alt={v.name} className="w-16 h-10 object-contain mb-1" />
                      <p className="font-body text-xs font-medium text-forest-600 text-center">{v.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Time</label>
                  <select
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none appearance-none"
                  >
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                    <input
                      type="number"
                      min={1}
                      max={35}
                      value={passengers}
                      onChange={e => setPassengers(Number(e.target.value))}
                      className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Luggage</label>
                  <div className="relative">
                    <Luggage className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={luggage}
                      onChange={e => setLuggage(Number(e.target.value))}
                      className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-3 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {pickup && dropoff && (
                <div className="bg-white rounded-2xl p-6 border border-forest-200 text-center">
                  <p className="font-body text-sm text-warm-400 mb-1">Estimated price</p>
                  <p className="font-display text-5xl text-forest-600 mb-2">{format(estimatedPrice)}</p>
                  <p className="font-body text-xs text-warm-400">~{estimatedDistance} km · {selectedVehicleData?.name || 'Car'}</p>
                  <Link href="/checkout">
                    <Button className="mt-4 h-12 px-8 text-base bg-amber-400 text-forest-600 hover:bg-amber-300 font-body">
                      Book transfer — {format(estimatedPrice)} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Map — always visible; shows route when both coords are known */}
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

        <div>
          <SectionHeading
            overline="POPULAR"
            title="Most booked *routes*"
            className="mb-8"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularRoutes?.map((route: any) => (
              <div key={route.id} className="bg-white rounded-2xl p-5 border border-warm-200 hover:shadow-card-hover transition-shadow">
                <h3 className="font-display text-lg text-forest-600 mb-1">{route.from} → {route.to}</h3>
                <div className="flex gap-3 mb-3">
                  <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {route.distance} km
                  </span>
                  <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {route.estimatedTime}
                  </span>
                </div>
                <p className="font-body text-sm text-warm-500 mb-4 line-clamp-2">{route.description}</p>
                <Link href="/checkout">
                  <Button variant="outline" size="sm" className="font-body text-xs w-full">
                    Book this route <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
