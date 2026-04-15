import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Container } from "@/components/peacock/Container";

const CATEGORIES = [
  "Booking & Pricing",
  "Your Driver",
  "On the Road",
] as const;

type Category = (typeof CATEGORIES)[number];

interface FAQ {
  question: string;
  answer: string;
  category: Category;
}

const FAQS: FAQ[] = [
  {
    question: "Is this a private driver or shared tour?",
    answer: "Every booking with Peacock Drivers is 100% private. You get your own dedicated vehicle and driver-guide for the duration of your trip. No strangers, no rigid schedules — just you and your travel companions.",
    category: "Booking & Pricing",
  },
  {
    question: "How does pricing work?",
    answer: "For multi-day tours, we charge a fixed daily rate that covers the vehicle and driver. For point-to-point transfers, pricing is based on distance (km). To secure a booking, you only pay a small deposit (approx. 20%) online. The remaining balance is paid directly to your driver upon arrival.",
    category: "Booking & Pricing",
  },
  {
    question: "What's included in the price?",
    answer: "Our rates are comprehensive. They include fuel, comprehensive insurance, parking fees, highway tolls, and the driver's accommodation and meals. You are only responsible for your own entry tickets, food, and hotel stays.",
    category: "Booking & Pricing",
  },
  {
    question: "What is the cancellation policy?",
    answer: "We offer free cancellation up to 24 hours before your pickup time for a full refund of your deposit. We understand travel plans change, so we keep it stress-free.",
    category: "Booking & Pricing",
  },
  {
    question: "Are there any hidden fees?",
    answer: "No hidden fees whatsoever. Our pricing is transparent and includes everything we mention: fuel, insurance, tolls, parking, and driver expenses. The only additional costs you'll encounter are your own accommodation, meals, and entry tickets to attractions — which you'd pay regardless of how you travel.",
    category: "Booking & Pricing",
  },
  {
    question: "Do you offer discounts for longer trips?",
    answer: "Yes! We offer competitive rates for extended multi-day tours. The longer your trip, the better value you get. Contact us with your itinerary and dates, and we'll provide a customized quote that reflects the duration of your journey.",
    category: "Booking & Pricing",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit cards and debit cards for the initial deposit payment online. The remaining balance can be paid in cash (USD, EUR, or Sri Lankan Rupees) directly to your driver upon arrival, or via bank transfer if arranged in advance.",
    category: "Booking & Pricing",
  },
  {
    question: "Is it safe? Are drivers vetted?",
    answer: "Safety is our priority. All our drivers are personally vetted, background-checked, and licensed by the Sri Lanka Tourist Board. We also have a 24/7 support team available via WhatsApp throughout your trip.",
    category: "Your Driver",
  },
  {
    question: "Do drivers speak English?",
    answer: "Yes. All our driver-guides are fluent in English and many speak additional languages. They double as knowledgeable local guides who can share hidden gems, cultural context, and restaurant recommendations along the way.",
    category: "Your Driver",
  },
  {
    question: "What kind of experience do your drivers have?",
    answer: "Our drivers are experienced professionals who have been driving tourists around Sri Lanka for years. They know the roads, understand local customs, and are familiar with popular destinations as well as off-the-beaten-path locations.",
    category: "Your Driver",
  },
  {
    question: "Can I request a specific driver?",
    answer: "While we can't guarantee a specific driver due to scheduling, we can note your preferences and do our best to match you with a driver who fits your needs.",
    category: "Your Driver",
  },
  {
    question: "What if I have special requirements or accessibility needs?",
    answer: "We're happy to accommodate special requirements. Whether you need assistance with mobility, have dietary restrictions, require specific vehicle features, or need help with any other needs, please mention it during booking.",
    category: "Your Driver",
  },
  {
    question: "Will my driver help with recommendations and local tips?",
    answer: "Absolutely! Your driver is your local guide. They'll suggest the best restaurants, hidden viewpoints, cultural sites, and can help you avoid tourist traps.",
    category: "Your Driver",
  },
  {
    question: "Can I change stops after booking?",
    answer: "Absolutely. Flexibility is the main benefit of a private driver. While we recommend planning a route to ensure manageable driving times, you can tweak daily stops or linger longer at places you love. Just chat with your driver!",
    category: "On the Road",
  },
  {
    question: "What happens if my flight is delayed?",
    answer: "For airport pickups, we track your flight number in real-time. If you're delayed, your driver will adjust the pickup time automatically and wait for you at the arrival hall — no extra charge.",
    category: "On the Road",
  },
  {
    question: "Do you support families and luggage?",
    answer: "Yes! We have vehicles ranging from sedans to large vans. We can provide child safety seats upon request. When booking, simply select the number of passengers and luggage to get the right vehicle recommendation.",
    category: "On the Road",
  },
  {
    question: "What happens in case of a vehicle breakdown or emergency?",
    answer: "We maintain our vehicles to the highest standards, but if any issue arises, we have a 24/7 support team ready to assist. We'll arrange a replacement vehicle as quickly as possible to minimize disruption to your trip.",
    category: "On the Road",
  },
  {
    question: "Can I use the vehicle's Wi-Fi and charging ports?",
    answer: "Yes! Most of our vehicles are equipped with Wi-Fi hotspots and multiple USB charging ports. Your driver will provide the Wi-Fi password, and you can charge your devices throughout your journey.",
    category: "On the Road",
  },
  {
    question: "What are the typical driving hours per day?",
    answer: "We recommend keeping daily driving to 4-6 hours to ensure you have time to enjoy destinations and your driver stays fresh. Longer drives are possible, but we'll discuss the best route and timing to make it comfortable.",
    category: "On the Road",
  },
  {
    question: "Can my driver help me book hotels or restaurants?",
    answer: "While we don't directly book accommodations, your driver can recommend excellent hotels and restaurants based on your preferences and budget. They can call ahead to check availability and make reservations on your behalf.",
    category: "On the Road",
  },
];

const C = {
  bg: "rgba(251, 250, 249, 1)",
  text: "#0C2421",
  pillActiveBg: "rgba(21, 82, 77, 1)",
  pillActiveText: "rgba(255, 255, 255, 1)",
};

const FAQItem: React.FC<{
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}> = ({ faq, isOpen, onToggle, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left group"
        aria-expanded={isOpen}
      >
        <div
          className="rounded-2xl px-4 py-4 sm:px-7 sm:py-6 transition-colors duration-300"
          style={{
            backgroundColor: "rgba(232, 230, 227, 1)",
            color: "rgba(0, 0, 0, 1)",
            fontWeight: 500,
          }}
        >
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            <span
              className="text-[0.9375rem] md:text-[1.15rem] font-medium leading-snug"
              style={{ fontFamily: "'Inter', sans-serif", color: "rgba(0, 0, 0, 1)" }}
            >
              {faq.question}
            </span>

            <div
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ color: "rgba(21, 82, 77, 1)", border: "1px solid rgba(21, 82, 77, 1)" }}
            >
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="block text-xl leading-none select-none"
                style={{ color: "rgba(21, 82, 77, 1)" }}
              >
                +
              </motion.span>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p
                  className="pt-4 pb-1 text-[0.95rem] leading-relaxed max-w-2xl"
                  style={{ color: "rgba(0, 0, 0, 1)", fontFamily: "'Inter', sans-serif" }}
                >
                  {faq.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
};

const CategoryPill: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className="shrink-0 lg:w-full px-5 py-2 lg:py-2.5 rounded-full text-sm lg:text-base font-medium tracking-wide transition-all duration-300 border cursor-pointer whitespace-nowrap"
    style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: active ? C.pillActiveBg : "rgba(232, 230, 227, 1)",
      color: active ? C.pillActiveText : "rgba(0, 0, 0, 1)",
      borderColor: active ? C.pillActiveBg : "rgba(232, 230, 227, 1)",
    }}
  >
    {label}
  </button>
);

interface FAQSectionProps {
  embedded?: boolean;
}

const FAQSection: React.FC<FAQSectionProps> = ({ embedded = false }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const leftY = useTransform(smoothProgress, [0, 1], ["4%", "-4%"]);
  const rightY = useTransform(smoothProgress, [0, 1], ["8%", "-8%"]);

  const filteredFaqs = FAQS.filter((f) => f.category === activeCategory);

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setOpenIndex(null);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-clip"
      style={{
        backgroundColor: embedded ? "transparent" : C.bg,
        color: "#000000",
      }}
    >
      <Container className="py-12 md:py-24 lg:py-32 xl:py-40">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 xl:gap-24">
          <motion.div
            className="lg:col-span-5 flex flex-col"
            style={{ y: leftY }}
          >
            <div className="lg:sticky lg:top-32 flex flex-col min-h-full">
              <h2
                className="text-[2rem] md:text-5xl lg:text-[3.4rem] font-normal leading-[1.15] mb-8 lg:mb-14"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  color: C.text,
                }}
              >
                Find answers to all your burning questions, here.
              </h2>

              <div className="flex-1 hidden lg:block" />

              <div className="mt-6 lg:mt-0 lg:mt-auto">
                {/* Mobile: horizontally scrollable pill strip */}
                <div className="-mx-4 px-4 overflow-x-auto lg:overflow-visible lg:mx-0 lg:px-0 pb-2 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 w-max lg:w-[250px] pr-4 lg:pr-0">
                    {CATEGORIES.map((cat) => (
                      <CategoryPill
                        key={cat}
                        label={cat}
                        active={activeCategory === cat}
                        onClick={() => handleCategoryChange(cat)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-7 flex flex-col"
            style={{ y: rightY }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-3"
              >
                {filteredFaqs.map((faq, i) => (
                  <FAQItem
                    key={`${activeCategory}-${i}`}
                    faq={faq}
                    index={i}
                    isOpen={openIndex === i}
                    onToggle={() =>
                      setOpenIndex(openIndex === i ? null : i)
                    }
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default FAQSection;
