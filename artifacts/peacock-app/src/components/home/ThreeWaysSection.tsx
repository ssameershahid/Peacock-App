import React from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Compass, Sparkles, Car } from "lucide-react";
import { Container } from "@/components/peacock/Container";
import { H2, P, Kicker } from "@/components/peacock/Type";
import StatsMarqueeBanner from "./StatsMarqueeBanner";

const BACKGROUND_IMAGES = {
  readyToGo: "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a0a78d8e7f40ce9181162_15.svg",
  createYourOwn: "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a0a78c556e09117a13098_14.svg",
  islandTransfers: "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698a0a78d8e7f40ce9181162_15.svg",
};

interface IllustrationProps {
  backgroundUrl: string;
  icon: React.ReactNode;
  className?: string;
}

const Illustration: React.FC<IllustrationProps> = ({
  backgroundUrl,
  icon,
  className,
}) => {
  return (
    <div
      className={`
        relative w-48 h-48 sm:w-52 sm:h-52 lg:w-56 lg:h-56
        rounded-full overflow-hidden
        flex items-center justify-center
        transition-transform duration-500
        ${className || ""}
      `}
    >
      <img
        src={backgroundUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
      <div className="relative z-10 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
};

interface ExploreMode {
  title: string;
  description: string;
  cta: string;
  href: string;
  backgroundUrl: string;
  icon: React.ReactNode;
}

const EXPLORE_MODES: ExploreMode[] = [
  {
    title: "Ready-to-Go Tours",
    description:
      "Proven itineraries crafted by our travel experts — with hotels, driver, and vehicle all included. Just pick a route and go.",
    cta: "Browse Catalogue",
    href: "/tours",
    backgroundUrl: BACKGROUND_IMAGES.readyToGo,
    icon: (
      <Compass className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-primary stroke-[1.5]" />
    ),
  },
  {
    title: "Create-Your-Own",
    description:
      "Design your dream trip with our intelligent wizard. You pick the stops and pace, we handle all the logistics.",
    cta: "Start Trip Wizard",
    href: "/tours/custom",
    backgroundUrl: BACKGROUND_IMAGES.createYourOwn,
    icon: (
      <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-primary stroke-[1.5]" />
    ),
  },
  {
    title: "Island Transfers",
    description:
      "Reliable point-to-point transfers from airport or between cities. Modern A/C vehicles and fixed, transparent pricing.",
    cta: "Get a Quote",
    href: "/transfers",
    backgroundUrl: BACKGROUND_IMAGES.islandTransfers,
    icon: (
      <Car className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-primary stroke-[1.5]" />
    ),
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

interface ThreeWaysSectionProps {
  merged?: boolean;
}

const ThreeWaysSection: React.FC<ThreeWaysSectionProps> = ({ merged }) => {
  const content = (
    <>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 lg:mb-20 max-w-2xl mx-auto"
        >
          <Kicker className="mb-3">The Collection</Kicker>
          <H2 className="text-4xl md:text-6xl text-foreground leading-[1.1] mb-5">
            Three ways to{" "}
            <span className="italic">explore.</span>
          </H2>
          <P className="text-lg text-muted-foreground leading-relaxed">
            However you like to travel, we have a mode for you.
          </P>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto"
        >
          {EXPLORE_MODES.map((mode) => (
            <motion.div key={mode.title} variants={cardVariants}>
              <Link
                href={mode.href}
                className="group block text-center"
              >
                <div className="flex justify-center mb-6 lg:mb-8">
                  <Illustration
                    backgroundUrl={mode.backgroundUrl}
                    icon={mode.icon}
                    className="group-hover:scale-105 group-hover:-translate-y-1"
                  />
                </div>

                <h3 className="font-display font-normal text-xl md:text-3xl text-[#0c2421] leading-tight mb-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                  {mode.title}
                </h3>

                <p className="font-sans text-sm md:text-[0.9rem] text-muted-foreground leading-[1.7] max-w-[280px] mx-auto mb-5">
                  {mode.description}
                </p>

                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-primary/80 group-hover:text-primary transition-colors duration-300">
                  {mode.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>

      <StatsMarqueeBanner className="mt-[130px] mb-[100px] border-0 bg-white" />
    </>
  );

  if (merged) {
    return content;
  }

  return (
    <section className="bg-[#FAF7F2] py-20 lg:py-32 overflow-hidden">
      {content}
    </section>
  );
};

export default ThreeWaysSection;
