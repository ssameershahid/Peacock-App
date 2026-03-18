import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Star, Shield, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TourCard } from '@/components/shared/TourCard';
import { useTours } from '@/hooks/use-app-data';

export default function Home() {
  const { data: tours, isLoading } = useTours();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center">
        <div className="absolute inset-0 z-0">
          {/* landing page hero scenic tea plantation landscape */}
          <img 
            src="https://images.unsplash.com/photo-1578637387939-43c525550085?w=1920&q=80" 
            alt="Sri Lanka landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest-600/40" />
        </div>
        
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full pt-20">
          <div className="max-w-3xl">
            <span className="inline-block py-1.5 px-4 bg-white/20 backdrop-blur-md rounded-pill text-white font-body text-sm font-medium tracking-wide mb-6 border border-white/30">
              PREMIUM PRIVATE DRIVERS
            </span>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-6">
              Explore Sri Lanka your <span className="italic text-amber-300">way</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-white/90 mb-10 max-w-xl leading-relaxed">
              Curated journeys and seamless transfers with professional chauffeurs. Discover the island's beauty at your own pace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/tours">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                  View our journeys
                </Button>
              </Link>
              <Link href="/tours/custom">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg text-white border-white hover:bg-white hover:text-forest-600">
                  Create your own
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pathways Section */}
      <section className="py-24 px-6 bg-white relative -mt-16 z-20 rounded-t-[40px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-sage rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-100 group">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6 text-forest-500" />
              </div>
              <h3 className="font-display text-3xl text-forest-600 mb-3">Ready-to-Go <span className="italic">Tours</span></h3>
              <p className="font-body text-warm-600 mb-8 leading-relaxed">Expertly crafted itineraries covering the best of the island, from ancient ruins to pristine beaches.</p>
              <Link href="/tours">
                <Button variant="outline" className="w-full bg-white group-hover:bg-forest-500 group-hover:text-white group-hover:border-forest-500">
                  Explore tours
                </Button>
              </Link>
            </div>
            
            {/* Card 2 */}
            <div className="bg-cream rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-100 group">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-display text-3xl text-forest-600 mb-3">Create Your <span className="italic">Own</span></h3>
              <p className="font-body text-warm-600 mb-8 leading-relaxed">Tell us where you want to go and what you love. We'll build a completely bespoke itinerary just for you.</p>
              <Link href="/tours/custom">
                <Button variant="outline" className="w-full bg-white group-hover:bg-forest-500 group-hover:text-white group-hover:border-forest-500">
                  Start planning
                </Button>
              </Link>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-200 group">
              <div className="w-14 h-14 bg-warm-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-forest-500" />
              </div>
              <h3 className="font-display text-3xl text-forest-600 mb-3">Airport & <span className="italic">Transfers</span></h3>
              <p className="font-body text-warm-600 mb-8 leading-relaxed">Reliable, comfortable point-to-point transfers anywhere in Sri Lanka with our modern fleet.</p>
              <Link href="/transfers">
                <Button variant="outline" className="w-full bg-warm-50 group-hover:bg-forest-500 group-hover:text-white group-hover:border-forest-500">
                  Book transfer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-24 bg-cream overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-12 flex justify-between items-end">
          <SectionHeading 
            overline="curated experiences"
            title="See our amazing *journeys*"
            className="mb-0"
          />
          <Link href="/tours" className="hidden sm:flex items-center gap-2 font-body font-semibold text-forest-500 hover:text-amber-500 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="pl-6 md:pl-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))]">
          <div className="flex gap-6 overflow-x-auto pb-12 pt-4 pr-6 hide-scrollbar snap-x snap-mandatory">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="min-w-[320px] h-[400px] bg-warm-100 rounded-2xl animate-pulse snap-center" />)
            ) : (
              tours?.map(tour => (
                <div key={tour.id} className="snap-center">
                  <TourCard tour={tour} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeading 
            overline="how it works"
            title="Simple to book, a joy to *experience*"
            align="center"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-warm-100 border-dashed border-t-2" />
            
            {[
              { num: 1, title: "Choose your journey", desc: "Select a ready-made tour, build your own, or just book a simple transfer." },
              { num: 2, title: "Book securely", desc: "Select your vehicle, add extras, and pay securely online to confirm instantly." },
              { num: 3, title: "Meet your driver", desc: "Your professional chauffeur arrives on time, ready to show you the real Sri Lanka." }
            ].map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center z-10">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-sage flex items-center justify-center shadow-sm mb-6 group hover:border-amber-300 transition-colors">
                  <span className="font-display text-4xl text-forest-500">{step.num}</span>
                </div>
                <h3 className="font-display text-2xl text-forest-600 mb-3">{step.title}</h3>
                <p className="font-body text-warm-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="py-32 px-6 bg-forest-600 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl text-white mb-6">
            Ready to discover the <span className="italic text-amber-300">island?</span>
          </h2>
          <p className="font-body text-xl text-white/80 mb-10">
            Let our experienced drivers show you the hidden gems and famous sights of Sri Lanka in total comfort.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/tours">
              <Button size="lg" className="bg-white text-forest-600 hover:bg-warm-50 w-full sm:w-auto h-14 px-10 text-lg">
                Browse Tours
              </Button>
            </Link>
            <Link href="/tours/custom">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto h-14 px-10 text-lg">
                Get a Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
