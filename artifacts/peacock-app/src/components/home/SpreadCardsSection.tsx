import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

const CARD_IMAGES = [
  "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/698487a2a035dec2b9a0c107_Fishermen.jpeg",
  "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898b6458e65dd0444751_Must-Visit-Caves-in-Sri-Lanka%20(1).jpg",
  "https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/6984898716687fc4ba9b5441_Sri-Lanka-5.jpg",
];

const SpreadCardsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001,
  });

  const leftX = useTransform(smooth, [0.12, 0.42], ["110%", "0%"]);
  const leftRotate = useTransform(smooth, [0.12, 0.42], [8, 0]);

  const rightX = useTransform(smooth, [0.12, 0.42], ["-110%", "0%"]);
  const rightRotate = useTransform(smooth, [0.12, 0.42], [-8, 0]);

  const sideScale = useTransform(smooth, [0.12, 0.42], [0.88, 1]);
  const centerScale = useTransform(smooth, [0.12, 0.42], [0.94, 1]);

  const cardCls =
    "w-[28vw] sm:w-[26vw] lg:w-[22vw] max-w-[300px] min-w-[90px] aspect-[2/3] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl will-change-transform";

  return (
    <section
      ref={sectionRef}
      className="bg-[#FBFAF9] pt-8 pb-24 md:pt-12 md:pb-36 lg:pt-16 lg:pb-48 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-6">
          <motion.div
            style={{ x: leftX, rotate: leftRotate, scale: sideScale }}
            className={cardCls}
          >
            <img
              src={CARD_IMAGES[0]}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          </motion.div>

          <motion.div
            style={{ scale: centerScale }}
            className={`${cardCls} z-10 relative`}
          >
            <img
              src={CARD_IMAGES[1]}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          </motion.div>

          <motion.div
            style={{ x: rightX, rotate: rightRotate, scale: sideScale }}
            className={cardCls}
          >
            <img
              src={CARD_IMAGES[2]}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SpreadCardsSection;
