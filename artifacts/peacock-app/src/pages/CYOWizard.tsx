import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { VehicleSelector } from '@/components/shared/VehicleSelector';
import { MapPlaceholder } from '@/components/shared/MapPlaceholder';
import { Check, Map, Calendar, Settings2, Sparkles, Send, ArrowRight, ArrowLeft, Briefcase, Palmtree, Star, Trophy } from 'lucide-react';
import { useVehicles } from '@/hooks/use-app-data';

const DESTINATIONS = [
  { id: 'colombo', name: 'Colombo', desc: 'Vibrant capital city' },
  { id: 'sigiriya', name: 'Sigiriya', desc: 'Ancient rock fortress' },
  { id: 'kandy', name: 'Kandy', desc: 'Cultural capital' },
  { id: 'ella', name: 'Ella', desc: 'Mountain village' },
  { id: 'galle', name: 'Galle', desc: 'Colonial fort town' },
  { id: 'yala', name: 'Yala', desc: 'Leopard safaris' },
  { id: 'trincomalee', name: 'Trincomalee', desc: 'East coast beaches' },
  { id: 'negombo', name: 'Negombo', desc: 'Beach & fishing village' },
  { id: 'nuwara-eliya', name: 'Nuwara Eliya', desc: 'Little England' },
  { id: 'tangalle', name: 'Tangalle', desc: 'Secluded southern beaches' },
  { id: 'anuradhapura', name: 'Anuradhapura', desc: 'Ancient sacred city' },
  { id: 'haputale', name: 'Haputale', desc: 'Tea country viewpoint' },
];

const INTERESTS = ['Nature', 'Wildlife', 'Beaches', 'Food & Cuisine', 'Temples & History', 'Tea Plantations', 'Surfing', 'Hiking', 'Photography'];

const TRIP_TYPES = [
  { id: 'holiday', label: 'Holiday', icon: <Palmtree className="w-6 h-6" />, desc: 'Leisure & relaxation' },
  { id: 'business', label: 'Business', icon: <Briefcase className="w-6 h-6" />, desc: 'Corporate travel' },
  { id: 'seasonal', label: 'Seasonal / Religious', icon: <Star className="w-6 h-6" />, desc: 'Festivals & pilgrimages' },
  { id: 'sport', label: 'Sport', icon: <Trophy className="w-6 h-6" />, desc: 'Active adventures' },
];

export default function CYOWizard() {
  const [step, setStep] = useState(1);
  const { data: vehicles } = useVehicles();

  const [selections, setSelections] = useState({
    tripType: '',
    pax: 2,
    vehicle: 'minivan',
    destinations: [] as string[],
    otherPlaces: '',
    startDate: '',
    days: 7,
    flexibleDates: false,
    budget: 'mid',
    travelStyle: [] as string[],
    interests: [] as string[],
    specialRequests: '',
    name: '',
    email: '',
    phone: '',
    country: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const toggleDest = (id: string) => {
    setSelections(s => ({
      ...s,
      destinations: s.destinations.includes(id)
        ? s.destinations.filter(d => d !== id)
        : [...s.destinations, id],
    }));
  };

  const toggleInterest = (interest: string) => {
    setSelections(s => ({
      ...s,
      interests: s.interests.includes(interest)
        ? s.interests.filter(i => i !== interest)
        : [...s.interests, interest],
    }));
  };

  const toggleStyle = (style: string) => {
    setSelections(s => ({
      ...s,
      travelStyle: s.travelStyle.includes(style)
        ? s.travelStyle.filter(i => i !== style)
        : [...s.travelStyle, style],
    }));
  };

  const canProceed = () => {
    if (step === 1) return selections.tripType !== '';
    if (step === 2) return selections.destinations.length > 0;
    if (step === 3) return true;
    if (step === 4) return selections.budget !== '';
    if (step === 5) return selections.name && selections.email;
    return true;
  };

  const stepLabels = [
    { icon: <Map className="w-4 h-4" />, label: 'Basics' },
    { icon: <Sparkles className="w-4 h-4" />, label: 'Places' },
    { icon: <Calendar className="w-4 h-4" />, label: 'Dates' },
    { icon: <Settings2 className="w-4 h-4" />, label: 'Style' },
    { icon: <Send className="w-4 h-4" />, label: 'Submit' },
  ];

  const selectedDestNames = DESTINATIONS.filter(d => selections.destinations.includes(d.id)).map(d => d.name);

  if (submitted) {
    const refId = `CYO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    return (
      <div className="min-h-screen bg-cream pt-24 pb-32">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-display text-4xl text-forest-600 mb-3">Request submitted!</h1>
          <p className="font-body text-warm-500 text-lg mb-2">Your reference number:</p>
          <p className="font-mono text-2xl text-forest-600 bg-white px-6 py-3 rounded-xl border border-warm-200 inline-block mb-8">{refId}</p>
          <p className="font-body text-warm-500 mb-10">Our team will review your request and send you a personalised quote within 24–48 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/"><Button variant="outline" className="font-body">Back to Home</Button></Link>
            <Link href="/tours"><Button className="font-body">Browse Tours</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-forest-600 mb-2">Create Your <em className="italic text-amber-500">Own</em></h1>
          <p className="font-body text-warm-500">Design your perfect Sri Lankan journey in 5 simple steps.</p>
        </div>

        <div className="bg-white rounded-full p-1.5 shadow-sm border border-warm-100 flex justify-between mb-10 overflow-x-auto hide-scrollbar">
          {stepLabels.map((s, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isPast = step > num;
            return (
              <div
                key={num}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-medium transition-colors shrink-0 cursor-pointer ${
                  isActive ? 'bg-forest-500 text-white' :
                  isPast ? 'text-forest-600 bg-sage' : 'text-warm-400'
                }`}
                onClick={() => isPast && setStep(num)}
              >
                {isPast ? <Check className="w-4 h-4" /> : s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-warm-100 p-8 md:p-12 min-h-[500px]">

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-3xl text-forest-600 mb-8">What kind of trip?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {TRIP_TYPES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelections(s => ({ ...s, tripType: t.id }))}
                    className={`p-6 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                      selections.tripType === t.id
                        ? 'border-forest-500 bg-forest-50 shadow-sm'
                        : 'border-warm-200 hover:border-forest-300'
                    }`}
                  >
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${selections.tripType === t.id ? 'bg-forest-500 text-white' : 'bg-warm-100 text-warm-500'}`}>
                      {t.icon}
                    </div>
                    <p className="font-body font-semibold text-forest-600 text-sm">{t.label}</p>
                    <p className="font-body text-xs text-warm-400 mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-3 font-body">How many travellers?</label>
                  <div className="flex items-center gap-4 bg-warm-50 p-2 rounded-2xl w-fit border border-warm-200">
                    <button onClick={() => setSelections(s => ({ ...s, pax: Math.max(1, s.pax - 1) }))} className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl text-forest-600 hover:text-amber-500 font-body">−</button>
                    <span className="font-display text-3xl text-forest-600 w-12 text-center">{selections.pax}</span>
                    <button onClick={() => setSelections(s => ({ ...s, pax: s.pax + 1 }))} className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl text-forest-600 hover:text-amber-500 font-body">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-3 font-body">Preferred vehicle</label>
                  <VehicleSelector
                    vehicles={vehicles || []}
                    selected={selections.vehicle}
                    onSelect={(id) => setSelections(s => ({ ...s, vehicle: id }))}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-display text-3xl text-forest-600 mb-2">Where do you want to go?</h2>
                  <p className="font-body text-warm-500 text-sm">Select all destinations you'd like to visit.</p>
                </div>
                <span className="font-body text-sm font-medium text-forest-500 bg-sage px-4 py-2 rounded-full shrink-0 ml-4">
                  {selections.destinations.length} selected
                </span>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {DESTINATIONS.map(d => {
                      const isSelected = selections.destinations.includes(d.id);
                      return (
                        <div
                          key={d.id}
                          onClick={() => toggleDest(d.id)}
                          className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-forest-500 bg-forest-50 shadow-sm' : 'border-warm-200 hover:border-forest-300 bg-warm-50'
                          }`}
                        >
                          <p className="font-display text-lg text-forest-600">{d.name}</p>
                          <p className="font-body text-xs text-warm-500">{d.desc}</p>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-forest-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Anywhere else?</label>
                    <input
                      type="text"
                      value={selections.otherPlaces}
                      onChange={e => setSelections(s => ({ ...s, otherPlaces: e.target.value }))}
                      className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                      placeholder="e.g., Mirissa, Arugam Bay, Jaffna..."
                    />
                  </div>
                </div>
                <div className="lg:w-[250px] shrink-0">
                  <MapPlaceholder locations={selectedDestNames} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-3xl text-forest-600 mb-8">When & how long?</h2>
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Start date</label>
                  <input
                    type="date"
                    value={selections.startDate}
                    onChange={e => setSelections(s => ({ ...s, startDate: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body focus:ring-2 focus:ring-forest-500 outline-none"
                  />
                  <label className="flex items-center gap-3 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selections.flexibleDates}
                      onChange={e => setSelections(s => ({ ...s, flexibleDates: e.target.checked }))}
                      className="w-4 h-4 rounded accent-forest-600"
                    />
                    <span className="font-body text-sm text-warm-600">My dates are flexible</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">
                    How many days? <span className="text-amber-500 font-display text-lg">{selections.days}</span>
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={21}
                    value={selections.days}
                    onChange={e => setSelections(s => ({ ...s, days: Number(e.target.value) }))}
                    className="w-full accent-forest-500"
                  />
                  <div className="flex justify-between font-body text-xs text-warm-400 mt-1">
                    <span>3 days</span>
                    <span>21 days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-3xl text-forest-600 mb-8">Your preferences</h2>

              <div className="mb-8">
                <label className="block text-sm font-medium text-forest-600 mb-3 font-body">Budget range</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Budget', 'Mid-range', 'Premium', 'Flexible'].map(b => (
                    <div
                      key={b}
                      onClick={() => setSelections(s => ({ ...s, budget: b.toLowerCase() }))}
                      className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all font-body text-sm font-medium ${
                        selections.budget === b.toLowerCase()
                          ? 'border-forest-500 bg-forest-50 text-forest-600'
                          : 'border-warm-200 text-warm-500 hover:border-forest-300'
                      }`}
                    >
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-forest-600 mb-3 font-body">Travel style</label>
                <div className="flex flex-wrap gap-3">
                  {['Adventure', 'Cultural', 'Relaxation', 'Mix'].map(style => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selections.travelStyle.includes(style)}
                        onChange={() => toggleStyle(style)}
                        className="w-4 h-4 rounded accent-forest-600"
                      />
                      <span className="font-body text-sm text-warm-600">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-forest-600 mb-3 font-body">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full font-body text-sm transition-all ${
                        selections.interests.includes(interest)
                          ? 'bg-forest-500 text-white shadow-sm'
                          : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Special requests</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={selections.specialRequests}
                  onChange={e => setSelections(s => ({ ...s, specialRequests: e.target.value }))}
                  className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none resize-none"
                  placeholder="Any dietary requirements, accessibility needs, or special occasions?"
                />
                <p className="font-body text-xs text-warm-400 text-right mt-1">{selections.specialRequests.length}/500</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="font-display text-3xl text-forest-600 mb-8">Review & submit</h2>

              <div className="bg-warm-50 rounded-2xl p-6 mb-8 border border-warm-200 space-y-4">
                <div className="grid grid-cols-2 gap-4 font-body text-sm">
                  <div>
                    <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1">Trip type</span>
                    <span className="text-forest-600 font-medium capitalize">{selections.tripType || '—'}</span>
                  </div>
                  <div>
                    <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1">Travellers</span>
                    <span className="text-forest-600 font-medium">{selections.pax}</span>
                  </div>
                  <div>
                    <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1">Duration</span>
                    <span className="text-forest-600 font-medium">{selections.days} days</span>
                  </div>
                  <div>
                    <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1">Budget</span>
                    <span className="text-forest-600 font-medium capitalize">{selections.budget}</span>
                  </div>
                </div>
                <div>
                  <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1 font-body">Destinations</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestNames.map(n => (
                      <span key={n} className="px-3 py-1 bg-sage rounded-pill text-xs font-medium text-forest-600 font-body">{n}</span>
                    ))}
                    {selections.otherPlaces && <span className="px-3 py-1 bg-amber-100 rounded-pill text-xs font-medium text-amber-700 font-body">{selections.otherPlaces}</span>}
                  </div>
                </div>
                {selections.interests.length > 0 && (
                  <div>
                    <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1 font-body">Interests</span>
                    <div className="flex flex-wrap gap-2">
                      {selections.interests.map(i => (
                        <span key={i} className="px-3 py-1 bg-forest-100 rounded-pill text-xs font-medium text-forest-600 font-body">{i}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Full name *</label>
                  <input
                    type="text"
                    value={selections.name}
                    onChange={e => setSelections(s => ({ ...s, name: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Email address *</label>
                  <input
                    type="email"
                    value={selections.email}
                    onChange={e => setSelections(s => ({ ...s, email: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Phone number</label>
                  <input
                    type="tel"
                    value={selections.phone}
                    onChange={e => setSelections(s => ({ ...s, phone: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Country</label>
                  <select
                    value={selections.country}
                    onChange={e => setSelections(s => ({ ...s, country: e.target.value }))}
                    className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none appearance-none"
                  >
                    <option value="">Select country</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="AU">Australia</option>
                    <option value="CA">Canada</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="NL">Netherlands</option>
                    <option value="LK">Sri Lanka</option>
                    <option value="IN">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <p className="font-body text-sm text-warm-400 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                Our team will review your request and send you a personalised quote within 24–48 hours.
              </p>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-warm-100">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="font-body">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}
            {step < 5 ? (
              <Button
                size="lg"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="h-14 px-10 text-lg group font-body"
              >
                Continue <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setSubmitted(true)}
                disabled={!canProceed()}
                className="h-14 px-10 text-lg bg-amber-400 text-forest-600 hover:bg-amber-300 font-body"
              >
                Submit request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
