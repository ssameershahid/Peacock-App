import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, Container } from '@/components/peacock/Container';
import { H2, P, Kicker } from '@/components/peacock/Type';

type Trip = {
  title: string;
  series?: string;
  description: string;
  image: string;
  tags: string[];
  kicker?: string;
  kickerColor?: 'amber' | 'emerald';
};

const trips: Trip[] = [
  {
    title: 'Wild Sri Lanka',
    series: 'Signature Series',
    description:
      "An immersive journey through the island's most pristine national parks. Leopards, elephants, and luxury camping under the stars.",
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984886cfce4578d36659ddd_What-are-the-top-attractions-in-Nuwara-Eliya_20241113112510.jpg',
    tags: ['10 Days', 'Wildlife'],
  },
  {
    title: 'Cultural Triangle Odyssey',
    description: 'Ancient cities, sacred rock fortresses, and timeless temples.',
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698487a2a035dec2b9a0c107_Fishermen.jpeg',
    tags: ['7 Days'],
  },
  {
    title: 'Southern Coast',
    description: 'Sun-soaked beaches, whale watching, and coastal surf towns.',
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898716687fc4ba9b5441_Sri-Lanka-5.jpg',
    tags: ['5 Days'],
    kicker: 'Beach & Chill',
    kickerColor: 'amber',
  },
  {
    title: 'Hill Country',
    description: 'Misty tea estates, cascading waterfalls, and cool highland air.',
    image:
      'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898b6458e65dd0444751_Must-Visit-Caves-in-Sri-Lanka%20(1).jpg',
    tags: ['4 Days'],
    kicker: 'Tea & Mountains',
    kickerColor: 'emerald',
  },
];

const DURATION = 3000;

const textVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.3, ease: 'easeIn' } },
};

const smallTextVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

export default function CuratedJourneysSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setActiveIndex(i => (i + 1) % trips.length), DURATION);
    return () => clearInterval(id);
  }, [isPaused]);

  const featured = trips[activeIndex];
  const card1 = trips[(activeIndex + 1) % trips.length];
  const card2 = trips[(activeIndex + 2) % trips.length];
  const card3 = trips[(activeIndex + 3) % trips.length];

  return (
    <Section className="bg-[#F1EDE7] py-24 md:py-32 overflow-hidden border-t border-gray-100">
      <style>{`
        @keyframes fillBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <Kicker>Curated Journeys</Kicker>
            <H2 className="mb-6 text-warm-900 text-[36px] md:text-[52px]">
              Every traveller, <em className="italic">every experience</em>
            </H2>
            <P className="text-xl max-w-lg leading-relaxed">
              Hand-picked itineraries that define luxury travel in Sri Lanka.
              Customize any route to your pace.
            </P>
          </div>
          <Link href="/tours">
            <Button className="rounded-full px-8 h-12">View All Collections</Button>
          </Link>
        </div>

        {/* Bento Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 grid-rows-[380px_280px_200px] md:grid-rows-[300px_300px] gap-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* ── Large Feature Card (col-span-2, row-span-2) ── */}
          <Link
            href="/tours"
            className="col-span-2 md:col-span-2 md:row-span-2 group relative h-full rounded-[2rem] overflow-hidden cursor-pointer isolate ring-1 ring-black/5"
          >
            {/* Crossfading image stack */}
            {trips.map((trip, i) => (
              <div
                key={trip.title}
                className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
                  i === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
              </div>
            ))}

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

            {/* Tags */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`tags-${activeIndex}`}
                variants={textVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute top-6 left-6 flex flex-wrap gap-2"
              >
                {featured.tags.map(tag => (
                  <Badge
                    key={tag}
                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider"
                  >
                    {tag}
                  </Badge>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Text content */}
            <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${activeIndex}`}
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {featured.series && (
                    <span className="text-amber-200 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                      {featured.series}
                    </span>
                  )}
                  <h3 className="font-display text-5xl md:text-6xl font-normal text-white mb-4 leading-[0.9]">
                    {featured.title}
                  </h3>
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                    <div className="overflow-hidden">
                      <p className="text-white/80 pb-6 leading-relaxed max-w-md text-lg font-light">
                        {featured.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/20 pt-6 mt-2">
                    <span className="text-white font-medium uppercase tracking-widest text-xs">
                      Explore Trip
                    </span>
                    <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500 shadow-lg">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 rounded-full overflow-hidden">
              <div
                key={`progress-${activeIndex}`}
                className="h-full bg-amber-200/80 origin-left rounded-full"
                style={{
                  animation: isPaused ? 'none' : `fillBar ${DURATION}ms linear forwards`,
                }}
              />
            </div>
          </Link>

          {/* ── Tall Portrait Card (col-span-1, row-span-2) ── */}
          <Link
            href="/tours"
            className="col-span-2 md:col-span-1 md:row-span-2 group relative h-full rounded-[2rem] overflow-hidden cursor-pointer isolate ring-1 ring-black/5"
          >
            {trips.map((trip, i) => (
              <div
                key={trip.title}
                className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
                  i === (activeIndex + 1) % trips.length ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute top-6 left-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`tall-badge-${activeIndex}`}
                  variants={smallTextVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {card1.tags[0]}
                  </Badge>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`tall-text-${activeIndex}`}
                  variants={smallTextVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h3 className="font-display text-3xl font-normal text-white mb-2 leading-tight">
                    {card1.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {card1.description}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="h-8 w-8 rounded-full border border-white/30 text-white flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500 group-hover:bg-white group-hover:text-black">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* ── Small Card 1 (col-span-1, row-span-1) ── */}
          <Link
            href="/tours"
            className="md:col-span-1 md:row-span-1 group relative h-full rounded-[2rem] overflow-hidden cursor-pointer isolate ring-1 ring-black/5"
          >
            {trips.map((trip, i) => (
              <div
                key={trip.title}
                className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
                  i === (activeIndex + 2) % trips.length ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-0 left-0 p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`small1-${activeIndex}`}
                  variants={smallTextVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {card2.kicker && (
                    <div
                      className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                        card2.kickerColor === 'amber' ? 'text-amber-200' : 'text-emerald-400'
                      }`}
                    >
                      {card2.kicker}
                    </div>
                  )}
                  <h3 className="font-display text-xl md:text-3xl font-normal text-white leading-tight">
                    {card2.title}
                  </h3>
                </motion.div>
              </AnimatePresence>
            </div>
          </Link>

          {/* ── Small Card 2 (col-span-1, row-span-1) ── */}
          <Link
            href="/tours"
            className="md:col-span-1 md:row-span-1 group relative h-full rounded-[2rem] overflow-hidden cursor-pointer isolate ring-1 ring-black/5"
          >
            {trips.map((trip, i) => (
              <div
                key={trip.title}
                className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
                  i === (activeIndex + 3) % trips.length ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-0 left-0 p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`small2-${activeIndex}`}
                  variants={smallTextVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {card3.kicker && (
                    <div
                      className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                        card3.kickerColor === 'amber' ? 'text-amber-200' : 'text-emerald-400'
                      }`}
                    >
                      {card3.kicker}
                    </div>
                  )}
                  <h3 className="font-display text-xl md:text-3xl font-normal text-white leading-tight">
                    {card3.title}
                  </h3>
                </motion.div>
              </AnimatePresence>
            </div>
          </Link>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {trips.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to ${trips[i].title}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 h-2 bg-forest-600'
                  : 'w-2 h-2 bg-forest-600/30 hover:bg-forest-600/60'
              }`}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
