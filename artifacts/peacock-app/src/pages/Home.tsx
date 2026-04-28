import React from 'react';
import { Link } from 'wouter';
import { Star, ArrowRight, Map, Plane } from 'lucide-react';
import { Container } from '@/components/peacock/Container';
import { Button } from '@/components/ui/button';
import MarqueeTestimonials from '@/components/peacock/MarqueeTestimonials';
import FAQSection from '@/components/home/FAQSection';
import { StoryBlocksSection } from '@/components/home/StoryScrollSection';
import ParallaxDestinationsSection from '@/components/home/ParallaxDestinationsSection';
import OrbitShowcaseSection from '@/components/home/OrbitShowcaseSection';
import TropicalParadiseSection from '@/components/home/TropicalParadiseSection';
import ClimateGuideSection from '@/components/home/ClimateGuideSection';
import CuratedJourneysSection from '@/components/home/CuratedJourneysSection';
import { H2, P, Kicker } from '@/components/peacock/Type';
import { reviews } from '@/content/reviews';
import { SectionHeading } from '@/components/shared/SectionHeading';
export default function Home() {

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">

      {/* 1. Cinematic Hero Section */}
      <div className="relative h-screen w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Fallback image — always present, visible on iOS when video fails to load */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69838bc1712205ff655de71c_5052216621-ezgif.com-webp-to-jpg-converter.jpg')" }}
          />
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69838bc1712205ff655de71c_5052216621-ezgif.com-webp-to-jpg-converter.jpg"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <Container className="relative z-10 w-full pt-20 flex flex-col items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4 flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-1000">
            <h1 className="text-[2.88rem] sm:text-[3.6rem] md:text-[5.4rem] lg:text-[86px] font-display font-normal text-white mb-5 md:mb-7 tracking-tight leading-[1.08] drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
              Experience Sri Lanka's <br className="hidden sm:block" /> beauty like a <em className="italic">true native</em>
            </h1>
            <P className="text-white/90 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10">
              Plan a Sri Lanka trip with local experts. Custom itineraries, concierge drivers, transparent pricing.
            </P>
            <Button variant="amber" size="lg" className="text-base md:text-[17px] px-10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.28)]" asChild>
              <a href="#what-we-do">Start planning your trip</a>
            </Button>
          </div>
        </Container>
      </div>

      {/* Three Product Cards — "What We Do" (2nd section, right after hero) */}
      <section id="what-we-do" className="py-24 px-6 bg-white relative z-20 scroll-mt-20">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeading overline="WHAT WE DO" title="Your journey, your *way*" subtitle="Whether you want a ready-made itinerary, a fully custom adventure, or a simple airport transfer — we've got you covered." align="center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/tours" className="block">
              <div className="bg-sage rounded-3xl p-8 h-full hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-100 group cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6 text-forest-500" />
                </div>
                <h3 className="font-display text-3xl text-forest-600 mb-3">Ready-to-Go <em className="italic">Tours</em></h3>
                <p className="font-body text-warm-600 mb-8 leading-relaxed">Expertly crafted itineraries covering the best of the island, from ancient ruins to pristine beaches.</p>
                <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-500 group-hover:text-amber-200 transition-colors">Browse curated tours <ArrowRight className="w-4 h-4" /></span>
              </div>
            </Link>
            <Link href="/tours/custom" className="block">
              <div className="bg-cream rounded-3xl p-8 h-full hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-100 group cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-amber-200" />
                </div>
                <h3 className="font-display text-3xl text-forest-600 mb-3">Create Your <em className="italic">Own</em></h3>
                <p className="font-body text-warm-600 mb-8 leading-relaxed">Build your own itinerary day-by-day using our trip wizard — then our team steps in to refine and perfect it for you.</p>
                <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-500 group-hover:text-amber-200 transition-colors">Launch trip wizard <ArrowRight className="w-4 h-4" /></span>
              </div>
            </Link>
            <Link href="/transfers" className="block">
              <div className="bg-sage rounded-3xl p-8 h-full hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-warm-100 group cursor-pointer">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Plane className="w-6 h-6 text-forest-500" />
                </div>
                <h3 className="font-display text-3xl text-forest-600 mb-3">Airport &amp; <em className="italic">Transfers</em></h3>
                <p className="font-body text-warm-600 mb-8 leading-relaxed">Reliable, comfortable point-to-point transfers anywhere in Sri Lanka with our modern fleet.</p>
                <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-500 group-hover:text-amber-200 transition-colors">Book a ride <ArrowRight className="w-4 h-4" /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Philosophy (Tropical Paradise + Philosophy content) */}
      <TropicalParadiseSection />

      {/* Get Inspired — curated journeys (auto-rotating bento grid) */}
      <CuratedJourneysSection />

      {/* About Peacock — Story Blocks (sticky image + text) */}
      <div className="h-24 lg:h-32 bg-background" />
      <StoryBlocksSection />

      {/* Explore Destinations + Design your own adventure */}
      <section className="bg-background">
        <ParallaxDestinationsSection />
      </section>

      {/* Climate Guide ("When to go") */}
      <ClimateGuideSection />

      {/* Trust + FAQ + Reviews */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "rgba(251, 250, 249, 1)" }}
      >
        {/* FAQs */}
        <FAQSection embedded />

        {/* Stories from the Road */}
        <div className="overflow-hidden pb-24">
          <Container className="pt-4">
            <div className="text-center mb-12">
              <Kicker>Our Traveller Journeys</Kicker>
              <H2 className="mb-4" style={{ fontSize: "60px", color: "rgba(12, 36, 33, 1)" }}>
                Stories from the Road
              </H2>
              <P>Our guests don't just visit Sri Lanka; they live it.</P>
            </div>
          </Container>
          <div className="w-full">
            <MarqueeTestimonials reviews={reviews} />
          </div>
        </div>
      </section>
    </div>
  );
}
