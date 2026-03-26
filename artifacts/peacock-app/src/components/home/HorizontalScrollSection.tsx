import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Link } from "wouter";

interface JourneyCard {
  image: string;
  title: string;
  location: string;
  href: string;
}

const JOURNEYS: JourneyCard[] = [
  {
    image:
      "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989ca83944fd4ef083d92e4_Screenshot%202026-02-09%20at%204.52.29%E2%80%AFPM.png",
    title: "Ancient Sigiriya Rock Fortress",
    location: "Sigiriya, Cultural Triangle",
    href: "/tours",
  },
  {
    image:
      "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989c9da28c916bcf284a2f8_Screenshot%202026-02-09%20at%204.49.16%E2%80%AFPM.png",
    title: "Train Through the Hill Country",
    location: "Ella, Central Highlands",
    href: "/tours",
  },
  {
    image:
      "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989c9dacd3fab459f56831f_Screenshot%202026-02-09%20at%204.47.51%E2%80%AFPM.png",
    title: "Whale Watching at Mirissa",
    location: "Mirissa, Southern Coast",
    href: "/tours",
  },
  {
    image:
      "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6989c9daf037781ffb34f3d9_Screenshot%202026-02-09%20at%204.49.30%E2%80%AFPM.png",
    title: "Leopard Safari at Yala",
    location: "Yala National Park, Southern Province",
    href: "/tours",
  },
];

const HorizontalScrollSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001,
  });

  const x = useTransform(smooth, [0, 1], ["0vw", "-258vw"]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-background"
      style={{ height: "400vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        <div className="pt-12 sm:pt-16 lg:pt-[130px] px-6 sm:px-10 lg:px-16 pb-[30px] shrink-0">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground block mb-3">
            Experiences
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-foreground leading-[1.1] font-normal">
            Unforgettable Journeys{" "}
            <span className="italic">Await</span>
          </h2>
        </div>

        <div className="flex-1 min-h-0 flex items-end pb-6 sm:pb-[30px]">
          <motion.div
            style={{ x }}
            className="flex gap-6 sm:gap-8 pl-6 sm:pl-10 lg:pl-16 pr-[15vw] will-change-transform h-[calc(100%-1rem)]"
          >
            {JOURNEYS.map((journey, i) => (
              <Link
                key={i}
                href={journey.href}
                className="shrink-0 w-[85vw] sm:w-[80vw] lg:w-[75vw] h-full group block"
              >
                <div className="relative h-full rounded-2xl lg:rounded-3xl overflow-hidden border border-black/[0.08] shadow-lg">
                  <img
                    src={journey.image}
                    alt={journey.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />

                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 lg:bottom-5 lg:left-5 lg:right-5 flex items-center justify-between gap-4 px-6 sm:px-8 py-4 sm:py-5 bg-[#F7F5F0]/95 backdrop-blur-sm rounded-xl lg:rounded-2xl">
                    <h3 className="font-display text-lg sm:text-xl lg:text-[36px] font-normal text-foreground leading-tight truncate">
                      {journey.title}
                    </h3>
                    <span className="hidden sm:block text-[20px] text-muted-foreground whitespace-nowrap shrink-0">
                      {journey.location}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>

        <div className="shrink-0 px-6 sm:px-10 lg:px-16 pb-[60px]">
          <div className="h-[2px] bg-border rounded-full overflow-hidden max-w-xs">
            <motion.div
              className="h-full bg-foreground/60 rounded-full origin-left"
              style={{ scaleX: smooth }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalScrollSection;
