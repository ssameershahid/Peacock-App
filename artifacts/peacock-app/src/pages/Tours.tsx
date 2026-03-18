import React from 'react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TourCard } from '@/components/shared/TourCard';
import { useTours } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Map } from 'lucide-react';

export default function Tours() {
  const { data: tours, isLoading } = useTours();
  const [filter, setFilter] = React.useState('All');

  const categories = ['All', 'Cultural', 'Wildlife', 'Scenic', 'Mix'];
  
  const filteredTours = tours?.filter(t => filter === 'All' || t.category === filter);

  return (
    <div className="pt-24 pb-32 bg-cream min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeading 
          overline="our itineraries"
          title="Journeys crafted with *care*"
          subtitle="From the ancient cities of the cultural triangle to the leopard-spotted plains of Yala, find your perfect Sri Lankan adventure."
          align="center"
          className="mb-16"
        />

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-full shadow-sm border border-warm-100 inline-flex overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full font-body text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === cat 
                    ? 'bg-forest-500 text-white shadow-sm' 
                    : 'text-warm-500 hover:text-forest-600 hover:bg-warm-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[450px] bg-warm-100 rounded-2xl animate-pulse" />
            ))
          ) : (
            filteredTours?.map(tour => (
              <div key={tour.id} className="w-full flex justify-center">
                <TourCard tour={tour} />
              </div>
            ))
          )}
        </div>

        {/* CYO Banner */}
        <div className="bg-forest-600 rounded-[32px] p-8 md:p-16 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="font-display text-4xl text-white mb-4">Can't find exactly what you're <span className="italic text-amber-300">looking for?</span></h3>
              <p className="font-body text-lg text-white/80">Build your own itinerary. Select your destinations, preferences, and duration, and our experts will craft a bespoke quote for you within 24 hours.</p>
            </div>
            <div className="shrink-0">
              <Link href="/tours/custom">
                <Button className="bg-amber-300 hover:bg-amber-400 text-forest-600 h-16 px-10 text-lg shadow-xl shadow-amber-900/20 group">
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
