import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TourCard } from '@/components/shared/TourCard';
import { useTours } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Map, SlidersHorizontal, ArrowRight } from 'lucide-react';

export default function Tours() {
  const { data: tours, isLoading } = useTours();
  const [category, setCategory] = useState('All');
  const [duration, setDuration] = useState('Any');
  const [region, setRegion] = useState('All');
  const [sort, setSort] = useState('Popular');

  const categories = ['All', 'Cultural', 'Wildlife', 'Scenic', 'Mix'];

  const filteredTours = useMemo(() => {
    if (!tours) return [];
    let result = [...tours];

    if (category !== 'All') result = result.filter(t => t.category === category);

    if (duration === '5-7') result = result.filter(t => t.durationDays >= 5 && t.durationDays <= 7);
    else if (duration === '8-10') result = result.filter(t => t.durationDays >= 8 && t.durationDays <= 10);
    else if (duration === '11+') result = result.filter(t => t.durationDays >= 11);

    if (region !== 'All') result = result.filter(t => t.regions.some((r: string) => r.toLowerCase().includes(region.toLowerCase())));

    if (sort === 'Price low-high') result.sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === 'Price high-low') result.sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === 'Duration') result.sort((a, b) => a.durationDays - b.durationDays);

    return result;
  }, [tours, category, duration, region, sort]);

  return (
    <div className="pt-24 pb-32 bg-cream min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeading
          overline="EXPLORE SRI LANKA"
          title="Ready-to-go *tours*"
          subtitle="From the ancient cities of the cultural triangle to the leopard-spotted plains of Yala, find your perfect Sri Lankan adventure."
          align="center"
          className="mb-8"
        />

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

        <div className="flex justify-center mb-6">
          <div className="bg-white p-1.5 rounded-full shadow-sm border border-warm-100 inline-flex overflow-x-auto max-w-full hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-body text-sm font-medium transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-forest-500 text-white shadow-sm'
                    : 'text-warm-500 hover:text-forest-600 hover:bg-warm-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-warm-400" />
          </div>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="px-4 py-2 bg-white border border-warm-200 rounded-pill font-body text-sm text-warm-600 focus:ring-2 focus:ring-forest-500 outline-none appearance-none cursor-pointer"
          >
            <option value="Any">Any duration</option>
            <option value="5-7">5–7 days</option>
            <option value="8-10">8–10 days</option>
            <option value="11+">11+ days</option>
          </select>
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="px-4 py-2 bg-white border border-warm-200 rounded-pill font-body text-sm text-warm-600 focus:ring-2 focus:ring-forest-500 outline-none appearance-none cursor-pointer"
          >
            <option value="All">All regions</option>
            <option value="Cultural Triangle">Cultural Triangle</option>
            <option value="Hill Country">Hill Country</option>
            <option value="South Coast">South Coast</option>
            <option value="East Coast">East Coast</option>
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-2 bg-white border border-warm-200 rounded-pill font-body text-sm text-warm-600 focus:ring-2 focus:ring-forest-500 outline-none appearance-none cursor-pointer"
          >
            <option value="Popular">Popular</option>
            <option value="Price low-high">Price: Low → High</option>
            <option value="Price high-low">Price: High → Low</option>
            <option value="Duration">Duration</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[450px] bg-warm-100 rounded-2xl animate-pulse" />
            ))
          ) : filteredTours.length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <p className="font-body text-warm-400 text-lg">No tours match your filters.</p>
              <Button variant="ghost" onClick={() => { setCategory('All'); setDuration('Any'); setRegion('All'); }} className="mt-4">
                Clear filters
              </Button>
            </div>
          ) : (
            filteredTours.map(tour => (
              <div key={tour.id} className="w-full flex justify-center">
                <TourCard tour={tour} />
              </div>
            ))
          )}
        </div>

        <div className="bg-forest-600 rounded-[32px] p-8 md:p-16 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="font-display text-4xl text-white mb-4">Can't find exactly what you're <em className="italic text-amber-200">looking for?</em></h3>
              <p className="font-body text-lg text-white/80">Build your own itinerary. Select your destinations, preferences, and duration, and our experts will craft a bespoke quote for you within 24 hours.</p>
            </div>
            <div className="shrink-0">
              <Link href="/tours/custom">
                <Button className="bg-amber-200 hover:bg-amber-300 text-forest-600 h-16 px-10 text-lg shadow-xl shadow-amber-900/20 font-body group">
                  <Map className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Create Your Own
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
