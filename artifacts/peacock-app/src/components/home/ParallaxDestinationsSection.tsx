import React from "react";
import { Link } from "wouter";
import { Kicker, P } from "@/components/peacock/Type";
import { ArrowRight } from "lucide-react";

const CARD_IMAGE_RTG =
  "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec5e5b8765ccd38e63_Screenshot%202026-02-10%20at%204.12.54%E2%80%AFAM.png";

const CARD_IMAGE_DESTINATIONS =
  "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a6aec3b53bbedef516144_Screenshot%202026-02-10%20at%204.13.52%E2%80%AFAM.png";

const cardBase =
  "relative overflow-hidden rounded-2xl lg:rounded-[1.25rem] group cursor-pointer h-full block";

const CardContent = ({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: string;
}) => (
  <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 lg:p-8">
    <h3 className="font-display font-normal text-3xl lg:text-[2.25rem] text-white leading-tight mb-3">
      {title}
    </h3>
    <p className="text-white/80 text-sm lg:text-base mb-5">{subtitle}</p>
    <span className="inline-flex items-center gap-2 text-white text-sm font-semibold uppercase tracking-widest group-hover:gap-3 transition-all duration-200">
      {cta} <ArrowRight className="w-4 h-4" />
    </span>
  </div>
);

const ImageCard = ({
  href,
  image,
  title,
  subtitle,
  cta,
}: {
  href: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
}) => (
  <Link href={href} className={cardBase}>
    <img
      src={image}
      alt={title}
      className="absolute inset-x-0 -top-[15%] w-full h-[130%] object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
      loading="lazy"
      draggable={false}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 group-hover:from-black/75 transition-colors duration-300" />
    <CardContent title={title} subtitle={subtitle} cta={cta} />
  </Link>
);

const VideoCard = () => (
  <Link href="/tours/custom" className={cardBase}>
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    >
      <source src="/videos/cta.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 group-hover:from-black/75 transition-colors duration-300" />
    <CardContent
      title="Design your own adventure"
      subtitle="Build a route that perfectly matches your pace and interests."
      cta="Start Trip Wizard"
    />
  </Link>
);

const ParallaxDestinationsSection: React.FC = () => {
  return (
    <div className="bg-background py-20 lg:py-[80px] overflow-hidden">
      <div className="text-center mb-12 lg:mb-16 px-4 pt-5 pb-5">
        <Kicker className="mb-2">How would you like to travel?</Kicker>
        <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-6xl text-[#0C2421] mb-4 leading-[1.15]">
          Choose your{" "}
          <span className="italic">journey.</span>
        </h2>
        <P className="max-w-2xl mx-auto pt-5 text-lg">
          Pick a ready-made tour, craft your own route, or explore our destinations — we'll handle the rest.
        </P>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-[70vw] sm:h-[420px] lg:h-[500px]">
            <ImageCard
              href="/tours"
              image={CARD_IMAGE_RTG}
              title="See our curated, ready-to-go tours"
              subtitle="Handcrafted itineraries — just pick one and book."
              cta="Browse tours"
            />
          </div>
          <div className="h-[70vw] sm:h-[420px] lg:h-[500px]">
            <VideoCard />
          </div>
          <div className="h-[70vw] sm:h-[420px] lg:h-[500px]">
            <ImageCard
              href="/destinations"
              image={CARD_IMAGE_DESTINATIONS}
              title="Explore our most popular destinations"
              subtitle="Discover the cities, coasts, and highlands of Sri Lanka."
              cta="See destinations"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParallaxDestinationsSection;
