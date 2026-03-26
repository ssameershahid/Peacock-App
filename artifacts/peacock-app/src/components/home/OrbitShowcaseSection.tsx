import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

interface Experience {
  image: string;
  label: string;
  tagline: string;
  href: string;
  span?: "tall" | "wide" | "normal";
}

const EXPERIENCES: Experience[] = [
  {
    // col 1, row-span-2 (tall left anchor)
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?q=80&w=900&auto=format&fit=crop",
    label: "Wildlife",
    tagline: "Leopards, elephants & open skies",
    href: "/tours",
    span: "tall",
  },
  {
    // col 2, row 1
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop",
    label: "Beach",
    tagline: "90 miles of golden Indian Ocean shore",
    href: "/tours",
    span: "normal",
  },
  {
    // col 3, row 1
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=900&auto=format&fit=crop",
    label: "Luxury",
    tagline: "Uncompromised comfort, every mile",
    href: "/tours",
    span: "normal",
  },
  {
    // col 4, row 1
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=900&auto=format&fit=crop",
    label: "Adventure",
    tagline: "White water, summits, open road",
    href: "/tours",
    span: "normal",
  },
  {
    // col 2–3, row 2 (wide)
    image: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=900&auto=format&fit=crop",
    label: "Honeymoon",
    tagline: "Secluded coves & candlelit evenings",
    href: "/tours",
    span: "wide",
  },
  {
    // col 4, row 2
    image: "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898716687fc4ba9b5441_Sri-Lanka-5.jpg",
    label: "Tropical",
    tagline: "Spice gardens, rainforests, mist",
    href: "/tours",
    span: "normal",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", delay: i * 0.08 },
  }),
};

const ExperienceCard: React.FC<{ exp: Experience; index: number; inView: boolean }> = ({
  exp,
  index,
  inView,
}) => (
  <motion.div
    custom={index}
    variants={cardVariants}
    initial="hidden"
    animate={inView ? "visible" : "hidden"}
    className="group relative overflow-hidden rounded-2xl cursor-pointer"
    style={{
      gridRow: exp.span === "tall" ? "span 2" : "span 1",
      gridColumn: exp.span === "wide" ? "span 2" : "span 1",
    }}
  >
    <Link href={exp.href} className="block h-full w-full">
      {/* Image */}
      <div className="absolute inset-0">
        <img
          src={exp.image}
          alt={exp.label}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#0C2421]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="relative h-full min-h-[220px] flex flex-col justify-end p-6 lg:p-7">
        {/* Arrow icon — appears on hover */}
        <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>

        {/* Label + tagline */}
        <div>
          {/* Amber rule — slides in on hover */}
          <div className="w-8 h-[1.5px] bg-[#E8A825] mb-3 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-400" />
          <p className="font-body text-[10px] uppercase tracking-[0.28em] text-white/60 mb-1.5 group-hover:text-[#E8A825]/80 transition-colors duration-300">
            {exp.tagline}
          </p>
          <h3 className="font-display text-2xl lg:text-3xl text-white font-normal leading-tight">
            {exp.label}
          </h3>
        </div>
      </div>
    </Link>
  </motion.div>
);

const OrbitShowcaseSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="bg-[#0C2421] py-24 lg:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[1px] bg-[#E8A825]/50" />
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-[#E8A825]/70">
                Sri Lanka Experiences
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-[1.06] tracking-tight">
              Every traveller.<br />
              <em className="italic text-white/70">Every</em> experience.
            </h2>
          </div>
          <Link
            href="/tours"
            className="group inline-flex items-center gap-2 font-body text-sm text-white/50 hover:text-white transition-colors duration-300 shrink-0 mb-1"
          >
            Explore all tours
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </Link>
        </motion.div>

        {/* Grid — 4 cols × 2 rows, Wildlife spans rows, Honeymoon spans 2 cols */}
        <div
          className="grid gap-3 lg:gap-4"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "280px 280px",
          }}
        >
          {EXPERIENCES.map((exp, i) => (
            <ExperienceCard key={exp.label} exp={exp} index={i} inView={inView} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default OrbitShowcaseSection;
