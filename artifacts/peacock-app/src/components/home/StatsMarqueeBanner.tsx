import React from "react";
import { cn } from "@/lib/utils";

const STATS = [
  { number: "500+", label: "Tours Completed" },
  { number: "50+", label: "Curated Routes" },
  { number: "4.9", label: "Average Guest Rating" },
  { number: "8+", label: "Years of Excellence" },
  { number: "24/7", label: "Traveler Support" },
];

interface StatsMarqueeBannerProps {
  className?: string;
}

const StatsMarqueeBanner: React.FC<StatsMarqueeBannerProps> = ({ className }) => {
  return (
    <section
      className={cn(
        "w-full h-[95px] pt-[20px] pb-[20px] overflow-hidden bg-white text-[#221E1C]",
        className
      )}
    >
      <div className="flex gap-8 mb-0 pt-[10px] pb-[10px]">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center justify-center gap-10 animate-marquee"
            style={{ animationDuration: "25s" }}
            aria-hidden={copy === 1 ? true : undefined}
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="flex items-baseline gap-2.5 shrink-0"
              >
                <span className="text-2xl sm:text-3xl font-display font-normal text-accent leading-none">
                  {stat.number}
                </span>
                <span className="text-[14px] text-muted-foreground whitespace-nowrap">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsMarqueeBanner;
