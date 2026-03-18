import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Map, Star, Plane, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TourCard } from '@/components/shared/TourCard';
import { useTours, useVehicles } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function Home() {
  const { data: tours, isLoading } = useTours();
  const { data: vehicles } = useVehicles();
  const { format } = useCurrency();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] w-full flex items-center bg-cream">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1578637387939-43c525550085?w=1920&q=80"
            alt="Sri Lanka landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-700/70 via-forest-700/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full pt-28 pb-32">
          <div className="max-w-2xl">
            <span className="inline-block py-1.5 px-4 bg-white/15 backdrop-blur-md rounded-pill text-white font-body text-sm font-medium tracking-wide mb-6 border border-white/20">
              PREMIUM PRIVATE DRIVERS
            </span>
            <h1 className="font-display text-[56px] md:text-7xl lg:text-8xl text-white leading-[1.05] mb-6">
              Explore Sri Lanka your <em className="italic text-amber-300">way</em>
            </h1>
            <p className="font-body text-lg md:text-xl text-white/85 mb-10 max-w-xl leading-relaxed">
              Private driver &amp; vehicle included. Choose a curated tour,
              design your own journey, or book an instant transfer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/tours">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-body">
                  View our journeys
                </Button>
              </Link>
              <Link href="/tours/custom">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-body text-white border-white/40 hover:bg-white hover:text-forest-600 backdrop-blur-sm">
                  Create your own
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Product Cards */}
      <section className="py-24 px-6 bg-white relative -mt-16 z-20 rounded-t-[40px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/tours" className="block">
              <div className="bg-sage rounded-3xl p-8 h-full hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-100 group cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6 text-forest-500" />
                </div>
                <h3 className="font-display text-3xl text-forest-600 mb-3">
                  Ready-to-Go <em className="italic">Tours</em>
                </h3>
                <p className="font-body text-warm-600 mb-8 leading-relaxed">
                  Expertly crafted itineraries covering the best of the island, from ancient ruins to pristine beaches.
                </p>
                <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-500 group-hover:text-amber-500 transition-colors">
                  Browse curated tours <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link href="/tours/custom" className="block">
              <div className="bg-cream rounded-3xl p-8 h-full hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-100 group cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-display text-3xl text-forest-600 mb-3">
                  Create Your <em className="italic">Own</em>
                </h3>
                <p className="font-body text-warm-600 mb-8 leading-relaxed">
                  Tell us where you want to go and what you love. We'll build a completely bespoke itinerary just for you.
                </p>
                <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-500 group-hover:text-amber-500 transition-colors">
                  Design your perfect trip <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link href="/transfers" className="block">
              <div className="bg-sage rounded-3xl p-8 h-full hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-100 group cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Plane className="w-6 h-6 text-forest-500" />
                </div>
                <h3 className="font-display text-3xl text-forest-600 mb-3">
                  Airport &amp; <em className="italic">Transfers</em>
                </h3>
                <p className="font-body text-warm-600 mb-8 leading-relaxed">
                  Reliable, comfortable point-to-point transfers anywhere in Sri Lanka with our modern fleet.
                </p>
                <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-500 group-hover:text-amber-500 transition-colors">
                  Book a ride <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-12 flex justify-between items-end">
          <SectionHeading
            overline="POPULAR JOURNEYS"
            title="Tours we *love*"
            className="mb-0"
          />
          <Link href="/tours" className="hidden sm:flex items-center gap-2 font-body font-semibold text-forest-500 hover:text-amber-500 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="pl-6 md:pl-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))]">
          <div className="flex gap-6 overflow-x-auto pb-12 pt-4 pr-6 hide-scrollbar snap-x snap-mandatory">
            {isLoading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="min-w-[320px] h-[400px] bg-warm-100 rounded-2xl animate-pulse snap-center" />)
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

      {/* How It Works */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeading
            overline="HOW IT WORKS"
            title="Three simple *steps*"
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-forest-100 border-dashed border-t-2 border-forest-200" />

            {[
              { num: 1, title: 'Choose your journey', desc: 'Browse ready-made tours, create your own, or book a simple transfer.' },
              { num: 2, title: 'Book & pay securely', desc: 'Select your vehicle, add extras, and pay securely online. Stripe-powered checkout.' },
              { num: 3, title: 'Meet your driver', desc: 'Your personal, English-speaking chauffeur arrives on time, ready to show you the real Sri Lanka.' },
            ].map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center z-10">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-forest-100 flex items-center justify-center shadow-sm mb-6 group hover:border-amber-300 transition-colors">
                  <span className="font-display text-4xl text-forest-500">{step.num}</span>
                </div>
                <h3 className="font-display text-2xl text-forest-600 mb-3">{step.title}</h3>
                <p className="font-body text-warm-500 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Fleet */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeading
            overline="OUR FLEET"
            title="Travel in *comfort*"
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
            {vehicles?.map(v => (
              <div key={v.id} className="bg-warm-50 rounded-2xl p-6 flex flex-col items-center text-center border border-warm-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                <img
                  src={v.image}
                  alt={v.name}
                  className="w-full h-28 object-contain mb-4"
                />
                <h4 className="font-display text-xl text-forest-600 mb-1">{v.name}</h4>
                <p className="font-body text-xs text-warm-400 mb-1">{v.model}</p>
                <p className="font-body text-sm text-warm-500 flex items-center gap-1 mb-3">
                  <Users className="w-3.5 h-3.5" /> {v.capacity} passengers
                </p>
                <span className="font-body text-sm font-semibold text-forest-500">
                  From {format(v.pricePerDay)}<span className="text-xs font-normal text-warm-400">/day</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-6 bg-cream border-y border-warm-100">
        <div className="max-w-[1200px] mx-auto">
          <p className="font-body text-xs text-warm-400 text-center uppercase tracking-widest mb-8">As featured in</p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-6 opacity-30">
            {['Travel+Leisure', 'Condé Nast Traveller', 'Lonely Planet', 'TripAdvisor', 'National Geographic'].map(name => (
              <span key={name} className="font-display text-2xl text-warm-600 whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-forest-600 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl text-white mb-6">
            Ready to explore <em className="italic text-amber-300">Sri Lanka?</em>
          </h2>
          <p className="font-body text-xl text-white/80 mb-10">
            Book your journey today and travel with trusted local drivers.
          </p>
          <Link href="/tours">
            <Button size="lg" className="bg-white text-forest-600 hover:bg-warm-50 h-14 px-10 text-lg font-body">
              Start planning <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
