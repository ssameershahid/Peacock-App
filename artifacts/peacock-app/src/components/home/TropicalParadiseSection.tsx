import React, { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { H2, Kicker } from "@/components/peacock/Type";
import lottie from "lottie-web";

const PalmSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 217 196"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M175.253 32.9107C178.916 28.0867 181.703 22.7907 183.664 17.064C184.207 15.476 181.695 14.7934 181.153 16.372C179.264 21.8934 176.533 26.952 173.007 31.5973C171.993 32.9307 174.252 34.2294 175.253 32.9107Z" fill="currentColor"/>
    <path d="M162.235 22.1773C161.073 18.3946 159.316 14.8893 156.937 11.724C155.943 10.4013 153.683 11.6973 154.689 13.0373C156.937 16.0293 158.627 19.2893 159.725 22.8693C160.215 24.4653 162.728 23.7853 162.235 22.1773Z" fill="currentColor"/>
    <path d="M181.911 41.4653C185.944 39.8266 189.977 38.1879 194.011 36.5479C195.541 35.9252 194.872 33.4066 193.319 34.0386C189.285 35.6772 185.252 37.3172 181.219 38.9559C179.688 39.5785 180.357 42.0973 181.911 41.4653Z" fill="currentColor"/>
    <path d="M188.892 49.6907C191.006 49.664 192.937 50.1947 194.744 51.2961C196.178 52.1694 197.488 49.92 196.057 49.048C193.882 47.7227 191.438 47.056 188.892 47.088C187.218 47.1094 187.213 49.712 188.892 49.6907Z" fill="currentColor"/>
    <path d="M169.144 57.128C168.429 55.6146 166.185 56.9346 166.896 58.4426C168.235 61.2813 168.721 64.288 168.472 67.408C168.337 69.0773 170.941 69.068 171.075 67.408C171.361 63.82 170.673 60.3773 169.144 57.128Z" fill="currentColor"/>
  </svg>
);

const StarSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 98 92"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M35.3813 33.4812C35.4053 34.4052 35.392 35.3253 35.472 36.2586C35.6133 37.9146 38.216 37.9293 38.0746 36.2586C37.0426 24.1106 40.856 12.6599 48.936 3.61595C57.0146 12.6599 60.828 24.1106 59.7973 36.2586C59.6546 37.9266 62.2587 37.9173 62.3987 36.2586C62.4787 35.3253 62.4653 34.4052 62.4893 33.4812C74.208 32.7759 85.2267 36.5586 93.9827 44.3812C84.9387 52.4599 73.4866 56.2746 61.3399 55.2426C59.6719 55.0999 59.6813 57.7039 61.3399 57.8439C62.9519 57.9813 64.552 58.0279 66.1386 58.0012C75.2546 65.8359 80.5507 76.5052 81.224 88.4679C69.1173 87.7852 58.3226 82.3853 50.4626 73.0653C50.1853 72.736 49.8586 72.6186 49.5426 72.6399C49.228 72.6186 48.9013 72.736 48.6226 73.0653C40.7626 82.3853 29.9693 87.7852 17.8613 88.4679C18.536 76.4839 23.8466 65.7986 32.9906 57.96C34.1666 57.948 35.3426 57.9453 36.5306 57.8439C38.1866 57.7039 38.2026 55.0999 36.5306 55.2426C24.384 56.2746 12.932 52.4599 3.88796 44.3812C12.644 36.5586 23.664 32.7759 35.3813 33.4812Z" fill="currentColor"/>
  </svg>
);

const LottieLeaves: React.FC<{ className?: string }> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: ReturnType<typeof lottie.loadAnimation> | null = null;
    if (containerRef.current) {
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "https://cdn.prod.website-files.com/67eaa2d9c202da8c1b6180c4/67eea3130ffdc0e1cf6b1e0b_leaf.json",
      });
    }
    return () => {
      anim?.destroy();
    };
  }, []);

  return <div ref={containerRef} className={className} />;
};

const TropicalParadiseSection: React.FC = () => {
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

  const mapY = useTransform(smooth, [0, 1], [40, -40]);
  const leafY = useTransform(smooth, [0, 1], [30, -20]);
  const lottieY = useTransform(smooth, [0, 1], [20, -30]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-36 bg-[#FBFAF9]"
    >
      {/* Lottie falling leaves */}
      <motion.div
        style={{ y: lottieY }}
        className="absolute -left-20 top-0 w-[500px] h-[600px] opacity-30 blur-[2px] pointer-events-none"
      >
        <LottieLeaves className="w-full h-full" />
      </motion.div>

      {/* Tropical leaf photo */}
      <motion.img
        src="https://images.unsplash.com/photo-1518882460017-3e14aeba68d1?q=80&w=600&auto=format&fit=crop"
        alt=""
        style={{ y: leafY }}
        className="absolute -top-12 -right-8 w-[280px] sm:w-[340px] lg:w-[420px] h-auto opacity-90 pointer-events-none select-none"
        loading="lazy"
        draggable={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Right: Sri Lanka Map Image */}
          <motion.div
            style={{ y: mapY }}
            className="order-2 lg:order-2 will-change-transform"
          >
            <div className="relative rounded-2xl max-w-[552px] mx-auto lg:mx-0">
              <img
                src="https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698422a59ddf0f18170acd04_il_1588xN.2098694640_2ax3%20-%20Edited%20(1).png"
                alt="Sri Lanka Map Collage"
                className="object-contain w-full h-full"
                loading="lazy"
                draggable={false}
              />
            </div>
          </motion.div>

          {/* Left: Text Content */}
          <div className="order-1 lg:order-1 relative">
            <Kicker className="text-primary mb-4">Our Philosophy</Kicker>

            <H2 className="text-4xl sm:text-5xl md:text-6xl leading-tight mb-8" style={{ color: "rgba(12, 36, 33, 1)" }}>
              From far-flung coasts to ancient cities.
            </H2>

            <div className="space-y-5 text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-lg mb-10">
              <p>
                There's lots to think about and choose from—and that's where
                our interactive trip planner comes in.
              </p>
              <p>
                Put just like flip-flops and sandy toes, or maps and big
                dreams, some things are better together. Enter, our team of
                travel experts who will turn your dreams into reality.
              </p>
              <p>
                Go on, travel with Peacock and make your trip extraordinary
                from beginning to end.
              </p>
            </div>

            <Link href="/tours/custom">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 bg-primary border-transparent text-white hover:bg-primary/90 hover:text-white transition-all duration-200"
              >
                Start Planning
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TropicalParadiseSection;
