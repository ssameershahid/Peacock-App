import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Kicker, P } from "@/components/peacock/Type";

interface Destination {
  cityName: string;
  slug: string;
  image: string;
  experiences: string[];
}

const DESTINATIONS: Destination[] = [
  {
    cityName: "Colombo",
    slug: "colombo",
    image:
      "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec5e5b8765ccd38e63_Screenshot%202026-02-10%20at%204.12.54%E2%80%AFAM.png",
    experiences: [
      "Street food tours & markets",
      "Gangaramaya Temple",
      "Galle Face promenade",
      "Independence Square",
      "Colombo Fort & Pettah",
    ],
  },
  {
    cityName: "Kandy",
    slug: "kandy",
    image:
      "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec3b53bbedef516144_Screenshot%202026-02-10%20at%204.13.52%E2%80%AFAM.png",
    experiences: [
      "Temple of the Sacred Tooth",
      "Royal Botanical Gardens",
      "Kandy Lake & city views",
      "Traditional dance performances",
      "Tea country day trips",
    ],
  },
  {
    cityName: "Galle",
    slug: "galle",
    image:
      "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec8d2e8ca70d64c46c_Screenshot%202026-02-10%20at%204.12.48%E2%80%AFAM.png",
    experiences: [
      "Galle Fort walking tours",
      "Lighthouse & ramparts",
      "Boutique cafés and shops",
      "UNESCO heritage sites",
      "Beach & surf nearby",
    ],
  },
  {
    cityName: "Ella",
    slug: "ella",
    image:
      "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec6368ef419f4ec73b_Screenshot%202026-02-10%20at%204.14.02%E2%80%AFAM.png",
    experiences: [
      "Nine Arch Bridge",
      "Little Adam's Peak hike",
      "Ella–Kandy train journey",
      "Tea trails & viewpoints",
      "Laid-back cafés",
    ],
  },
];

const ParallaxCard: React.FC<{
  dest: Destination;
  progress: MotionValue<number>;
}> = ({ dest, progress }) => {
  const imageY = useTransform(progress, [0, 1], ["-15%", "15%"]);

  return (
    <a
      href={`/destinations/${dest.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="relative overflow-hidden rounded-2xl lg:rounded-[1.25rem] group cursor-pointer h-full block"
    >
      <motion.img
        src={dest.image}
        alt={dest.cityName}
        style={{ y: imageY }}
        className="absolute inset-x-0 -top-[15%] w-full h-[130%] object-cover will-change-transform pointer-events-none"
        loading="lazy"
        draggable={false}
      />

      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-5 lg:p-6">
        <h3 className="font-sans text-2xl sm:text-[32px] lg:text-[36px] font-bold text-white leading-tight pt-2 sm:pt-[40px]">
          {dest.cityName}
        </h3>
        <ul className="space-y-1 sm:space-y-2 list-none mt-auto">
          {dest.experiences.map((exp, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-white/95 text-sm sm:text-base lg:text-[0.9375rem] leading-relaxed"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <span>{exp}</span>
            </li>
          ))}
        </ul>
      </div>
    </a>
  );
};

const ParallaxDestinationsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      ref={sectionRef}
      className="bg-background py-20 lg:py-[80px] overflow-hidden"
    >
      <div className="text-center mb-12 lg:mb-16 px-4 pt-5 pb-5">
        <Kicker className="mb-2">Destinations</Kicker>
        <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-6xl text-[#0C2421] mb-4 leading-[1.15]">
          See our amazing{" "}
          <span className="italic">journeys.</span>
        </h2>
        <P className="max-w-2xl mx-auto pt-5 text-lg mb-6">
          Curated city experiences with a private driver — from street food to UNESCO sites.
        </P>
        <Link href="/tours">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200">
            Discover More
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: 2×2 grid | Desktop: 4-up row */}
        <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-4">
          {DESTINATIONS.map((dest, i) => (
            <div
              key={i}
              className="h-[240px] sm:h-[320px] lg:h-[450px] lg:flex-1 lg:min-w-0"
            >
              <ParallaxCard dest={dest} progress={smooth} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParallaxDestinationsSection;
