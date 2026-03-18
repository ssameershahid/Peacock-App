import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useTour, useVehicles } from '@/hooks/use-app-data';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Calendar as CalendarIcon, Users, Check, X, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function TourDetail() {
  const [, params] = useRoute('/tours/:slug');
  const slug = params?.slug;
  const { data: tour, isLoading } = useTour(slug || "");
  const { data: vehicles } = useVehicles();
  
  const [selectedVehicle, setSelectedVehicle] = useState<string>("minivan");
  const [pax, setPax] = useState(2);
  const [addons, setAddons] = useState({ airport: true, sim: false });
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  if (isLoading) return <div className="min-h-screen pt-32 text-center font-body">Loading journey details...</div>;
  if (!tour) return <div className="min-h-screen pt-32 text-center font-body">Tour not found.</div>;

  const vehicleDetails = vehicles?.find(v => v.id === selectedVehicle);
  const vehiclePrice = vehicleDetails ? vehicleDetails.pricePerDay * tour.durationDays : tour.basePrice;
  const totalAddons = (addons.airport ? 28 : 0) + (addons.sim ? 15 : 0);
  const totalPrice = vehiclePrice + totalAddons;

  return (
    <div className="bg-white pb-32">
      {/* Hero Image Gallery */}
      <div className="h-[60vh] md:h-[75vh] min-h-[500px] relative w-full flex overflow-hidden">
        <img src={tour.images[0]} className="w-full h-full object-cover" alt={tour.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-700/80 via-forest-700/20 to-transparent" />
        <div className="absolute bottom-12 left-0 w-full">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-pill text-white text-sm font-medium border border-white/30">{tour.category}</span>
              <span className="px-3 py-1 bg-amber-500/80 backdrop-blur-md rounded-pill text-white text-sm font-medium">{tour.difficulty}</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-4">{tour.title}</h1>
            <p className="font-body text-xl text-white/90 max-w-2xl">{tour.tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-16 flex flex-col lg:flex-row gap-16 relative">
        
        {/* Left Column: Content */}
        <div className="flex-1 lg:w-2/3">
          
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-warm-100 mb-16">
            <div className="flex flex-col gap-1">
              <span className="text-warm-400 text-sm font-body uppercase tracking-wider">Duration</span>
              <div className="flex items-center gap-2 text-forest-600 font-medium">
                <Clock className="w-5 h-5 text-amber-500" />
                {tour.durationDays} Days, {tour.durationNights} Nights
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-warm-400 text-sm font-body uppercase tracking-wider">Start/End</span>
              <div className="flex items-center gap-2 text-forest-600 font-medium">
                <MapPin className="w-5 h-5 text-amber-500" />
                Colombo (CMB)
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <span className="text-warm-400 text-sm font-body uppercase tracking-wider">Regions covered</span>
              <div className="flex items-center gap-2 text-forest-600 font-medium">
                {tour.regions.join(" • ")}
              </div>
            </div>
          </div>

          <SectionHeading overline="itinerary" title="Day by day *journey*" />
          
          {/* Itinerary Accordion */}
          <div className="mb-20 space-y-4">
            {tour.itinerary.map((day: any) => (
              <div key={day.day} className="border border-warm-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-warm-50 transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-2xl transition-colors ${expandedDay === day.day ? 'bg-forest-500 text-white' : 'bg-sage text-forest-600'}`}>
                      {day.day}
                    </div>
                    <div>
                      <h4 className="font-display text-2xl text-forest-600">{day.title}</h4>
                      <p className="font-body text-sm text-warm-500 mt-1 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> {day.location}
                      </p>
                    </div>
                  </div>
                  {expandedDay === day.day ? <ChevronUp className="w-6 h-6 text-warm-400" /> : <ChevronDown className="w-6 h-6 text-warm-400" />}
                </button>
                
                {expandedDay === day.day && (
                  <div className="px-6 pb-6 pt-2 ml-18 animate-in slide-in-from-top-2 duration-200">
                    <p className="font-body text-warm-600 leading-relaxed mb-6">{day.description}</p>
                    
                    <div className="flex flex-wrap gap-4 items-center bg-warm-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-sm font-medium text-forest-600 mr-4">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Drive: {day.drivingTime}
                      </div>
                      {day.stops.map((stop: string) => (
                        <span key={stop} className="px-3 py-1 bg-white rounded-pill text-xs font-medium text-warm-600 border border-warm-200 shadow-sm">
                          {stop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <SectionHeading overline="the details" title="What's *included*" />
          <div className="grid sm:grid-cols-2 gap-8 mb-16 bg-cream p-8 rounded-3xl">
            <div>
              <h4 className="font-body font-bold text-forest-600 mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-success" />
                </div>
                Included
              </h4>
              <ul className="space-y-4">
                {tour.included.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 font-body text-warm-600">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-body font-bold text-forest-600 mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-destructive" />
                </div>
                Not Included
              </h4>
              <ul className="space-y-4">
                {tour.notIncluded.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 font-body text-warm-600">
                    <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:w-1/3 relative">
          <div className="sticky top-24 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-warm-100 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-warm-100 pb-6">
              <div>
                <p className="text-sm text-warm-500 font-body uppercase tracking-wider mb-1">Total Price</p>
                <div className="font-display text-4xl text-forest-600">{formatCurrency(totalPrice)}</div>
              </div>
              <div className="text-right">
                <p className="text-xs text-warm-400 font-body mb-1">per vehicle, not per person</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Start Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-warm-400" />
                  <input type="date" className="w-full bg-warm-50 border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body focus:ring-2 focus:ring-forest-500 outline-none" />
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Travellers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-5 h-5 text-warm-400" />
                  <select 
                    value={pax} 
                    onChange={e => setPax(Number(e.target.value))}
                    className="w-full bg-warm-50 border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body focus:ring-2 focus:ring-forest-500 outline-none appearance-none"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
                  </select>
                </div>
              </div>

              {/* Vehicle */}
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Select Vehicle</label>
                <div className="flex flex-col gap-3">
                  {vehicles?.slice(0,3).map(v => (
                    <div 
                      key={v.id}
                      onClick={() => setSelectedVehicle(v.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedVehicle === v.id ? 'border-forest-500 bg-forest-50 shadow-sm ring-1 ring-forest-500' : 'border-warm-200 hover:border-forest-300'}`}
                    >
                      <div>
                        <p className="font-medium text-forest-600 font-body">{v.name}</p>
                        <p className="text-xs text-warm-500 font-body">{v.capacity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-forest-600 font-body">+{formatCurrency(v.pricePerDay)}<span className="text-xs font-normal">/d</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addons */}
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Add-ons</label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border border-warm-200 rounded-xl cursor-pointer hover:bg-warm-50">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={addons.airport} onChange={e => setAddons({...addons, airport: e.target.checked})} className="w-4 h-4 text-forest-600 rounded focus:ring-forest-500 accent-forest-600" />
                      <span className="font-body text-sm text-forest-600">Airport Pickup</span>
                    </div>
                    <span className="font-body text-sm font-medium text-warm-600">+£28</span>
                  </label>
                  <label className="flex items-center justify-between p-3 border border-warm-200 rounded-xl cursor-pointer hover:bg-warm-50">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={addons.sim} onChange={e => setAddons({...addons, sim: e.target.checked})} className="w-4 h-4 text-forest-600 rounded focus:ring-forest-500 accent-forest-600" />
                      <span className="font-body text-sm text-forest-600">Welcome SIM Card</span>
                    </div>
                    <span className="font-body text-sm font-medium text-warm-600">+£15</span>
                  </label>
                </div>
              </div>
            </div>

            <Button className="w-full h-14 text-lg mt-4 shadow-md hover:shadow-lg transition-shadow">
              Book this journey
            </Button>
            
            <p className="text-center text-xs text-warm-400 font-body mt-2 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Secure payment. Free cancellation 10+ days before start.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
