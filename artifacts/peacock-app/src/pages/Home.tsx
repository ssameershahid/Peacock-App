import React from 'react';
import { Link } from 'wouter';
import { Star, ArrowRight, CheckCircle2, ShieldCheck, Map, Plane, Users } from 'lucide-react';
import { Container, Section } from '@/components/peacock/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TripSearchHero from '@/components/peacock/TripSearchHero';
import MarqueeTestimonials from '@/components/peacock/MarqueeTestimonials';
import DesignAdventureCTA from '@/components/peacock/DesignAdventureCTA';
import FAQSection from '@/components/home/FAQSection';
import { StoryIntroSection, StoryBlocksSection } from '@/components/home/StoryScrollSection';
import SpreadCardsSection from '@/components/home/SpreadCardsSection';
import ParallaxDestinationsSection from '@/components/home/ParallaxDestinationsSection';
import OrbitShowcaseSection from '@/components/home/OrbitShowcaseSection';
import TropicalParadiseSection from '@/components/home/TropicalParadiseSection';
import ClimateGuideSection from '@/components/home/ClimateGuideSection';
import { H2, P, Kicker } from '@/components/peacock/Type';
import { reviews } from '@/content/reviews';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { useVehicles } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function Home() {
  const { data: vehicles } = useVehicles();
  const { format } = useCurrency();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* 1. Cinematic Hero Section */}
      <div className="relative h-screen w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover animate-in fade-in duration-[2000ms]"
          >
            <source src="https://s3.amazonaws.com/webflow-prod-assets/68fe492bc39e0e661cce824d/6983912e334f06ffc3475dd8_Screen%20Recording%202026-02-04%20at%2011.30.50%E2%80%AFPM.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <Container className="relative z-10 w-full pt-20 flex flex-col items-center">
          <div className="text-center max-w-4xl mx-auto mb-12 animate-in slide-in-from-bottom-8 fade-in duration-1000">
            <h1 className="text-5xl md:text-7xl lg:text-[72px] font-display font-normal text-white mb-6 tracking-tight leading-[1.1] drop-shadow-sm">
              Experience Sri Lanka's <br /> beauty like a <em className="italic">true native</em>
            </h1>
            <P className="text-white/90 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
              Plan a Sri Lanka trip with local experts. Custom itineraries, vetted drivers, transparent pricing.
            </P>
          </div>

          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full max-w-4xl relative">
              <TripSearchHero />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm transition-transform hover:scale-105 cursor-default">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Free Cancellation</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm transition-transform hover:scale-105 cursor-default">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm transition-transform hover:scale-105 cursor-default">
                <Star className="h-4 w-4 text-amber-200 fill-amber-200" />
                <span className="text-sm font-medium text-white">4.9/5 Guest Rating</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* About Peacock — Intro (word-by-word reveal) */}
      <StoryIntroSection />

      {/* Spread Cards Gallery (3 images) */}
      <SpreadCardsSection />

      {/* Our Philosophy (Tropical Paradise + Philosophy content) */}
      <TropicalParadiseSection />

      {/* Orbit Showcase — Experience categories */}
      <OrbitShowcaseSection />

      {/* Three Product Cards */}
      <section className="py-24 px-6 bg-white relative -mt-16 z-20 rounded-t-[40px]">
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
                <p className="font-body text-warm-600 mb-8 leading-relaxed">Tell us where you want to go and what you love. We'll build a completely bespoke itinerary just for you.</p>
                <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-500 group-hover:text-amber-200 transition-colors">Design your perfect trip <ArrowRight className="w-4 h-4" /></span>
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

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeading overline="HOW IT WORKS" title="Three simple *steps*" align="center" />
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

      {/* About Peacock — Story Blocks (sticky image + text) */}
      <StoryBlocksSection />

      {/* Explore Destinations + Design your own adventure */}
      <section className="bg-background">
        <ParallaxDestinationsSection />
        <DesignAdventureCTA />
      </section>

      {/* Vehicle Fleet */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <SectionHeading overline="OUR FLEET" title="Travel in *comfort*" align="center" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
            {vehicles?.map(v => (
              <div key={v.id} className="bg-warm-50 rounded-2xl p-6 flex flex-col items-center text-center border border-warm-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                <img src={v.image} alt={v.name} className="w-full h-28 object-contain mb-4" />
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

      {/* Climate Guide ("When to go") */}
      <ClimateGuideSection />

      {/* Get Inspired — curated journeys grid */}
      <Section className="bg-background py-24 md:py-32 overflow-hidden border-t border-gray-100">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <Kicker>Curated Journeys</Kicker>
              <H2 className="mb-6 text-warm-900">Get <em className="italic">Inspired.</em></H2>
              <P className="text-xl max-w-lg leading-relaxed">
                Hand-picked itineraries that define luxury travel in Sri Lanka.
                Customize any route to your pace.
              </P>
            </div>
            <Link href="/tours">
              <Button className="rounded-full px-8 h-12">
                View All Collections
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[1200px] md:h-[600px]">
            {/* Large Feature Card */}
            <Link href="/tours" className="md:col-span-2 md:row-span-2 group relative h-full rounded-[2rem] overflow-hidden cursor-pointer isolate ring-1 ring-black/5">
              <img src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984886cfce4578d36659ddd_What-are-the-top-attractions-in-Nuwara-Eliya_20241113112510.jpg" alt="Wildlife" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">10 Days</Badge>
                <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">Wildlife</Badge>
              </div>
              <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                <span className="text-amber-200 text-xs font-bold uppercase tracking-[0.2em] mb-3 block opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100">Signature Series</span>
                <h3 className="font-display text-5xl md:text-6xl font-normal text-white mb-4 leading-[0.9]">Wild Sri Lanka</h3>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                  <div className="overflow-hidden">
                    <p className="text-white/80 pb-6 leading-relaxed max-w-md text-lg font-light">
                      An immersive journey through the island's most pristine national parks. Leopards, elephants, and luxury camping under the stars.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-6 mt-2">
                  <span className="text-white font-medium uppercase tracking-widest text-xs">Explore Trip</span>
                  <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500 shadow-lg">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Tall Portrait Card */}
            <Link href="/tours" className="md:col-span-1 md:row-span-2 group relative h-full rounded-[2rem] overflow-hidden cursor-pointer isolate ring-1 ring-black/5">
              <img src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698487a2a035dec2b9a0c107_Fishermen.jpeg" alt="Cultural Triangle" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute top-6 left-6">
                <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">7 Days</Badge>
              </div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="font-display text-3xl font-normal text-white mb-2 leading-tight">Cultural Triangle Odyssey</h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Ancient cities and rock fortresses.</p>
                <div className="h-8 w-8 rounded-full border border-white/30 text-white flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500 group-hover:bg-white group-hover:text-black">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            {/* Small Card - Southern Coast */}
            <Link href="/tours" className="md:col-span-1 md:row-span-1 group relative h-full rounded-[2rem] overflow-hidden cursor-pointer isolate ring-1 ring-black/5">
              <img src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898716687fc4ba9b5441_Sri-Lanka-5.jpg" alt="Southern Coast" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-6">
                <div className="text-amber-200 text-[10px] font-bold uppercase tracking-widest mb-1">Beach & Chill</div>
                <h3 className="font-display text-xl font-normal text-white leading-tight">Southern Coast</h3>
              </div>
            </Link>

            {/* Small Card - Hill Country */}
            <Link href="/tours" className="md:col-span-1 md:row-span-1 group relative h-full rounded-[2rem] overflow-hidden cursor-pointer isolate ring-1 ring-black/5">
              <img src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898b6458e65dd0444751_Must-Visit-Caves-in-Sri-Lanka%20(1).jpg" alt="Hill Country" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-6">
                <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Tea & Mountains</div>
                <h3 className="font-display text-xl font-normal text-white leading-tight">Hill Country</h3>
              </div>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Parallax Wizard CTA */}
      <Section
        className="min-h-[90vh] flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69838bc1712205ff655de71c_5052216621-ezgif.com-webp-to-jpg-converter.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <Container className="relative z-10 text-center">
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-normal text-white mb-6">
              Still not sure where to <em className="italic">go?</em>
            </h2>
            <p className="text-xl text-white/90 mb-10 font-light">
              Try our trip wizard to find your dream trip. We'll ask a few simple questions and build a route just for you.
            </p>
            <Link href="/tours/custom">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 h-14 px-8 rounded-full text-lg font-medium">
                Start Trip Wizard
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Trust + FAQ + Reviews */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "rgba(251, 250, 249, 1)" }}
      >
        {/* As Seen In */}
        <div className="py-16">
          <Container>
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                We are one of the world's best tour operators
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-2xl font-display font-normal">Travel+Leisure</span>
              <span className="text-2xl font-display font-normal">Cond&#233; Nast</span>
              <span className="text-2xl font-display font-normal">VOGUE</span>
              <span className="text-2xl font-display font-normal">Lonely Planet</span>
            </div>
          </Container>
        </div>

        {/* FAQs */}
        <FAQSection embedded />

        {/* Stories from the Road */}
        <div className="overflow-hidden pb-24">
          <Container className="pt-4">
            <div className="text-center mb-12">
              <Kicker>Social Proof</Kicker>
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
