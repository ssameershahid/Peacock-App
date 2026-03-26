import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CityData {
  temp: number;
  rain: number;
}

interface MonthData {
  label: string;
  short: string;
  recommendation: "best" | "good" | "possible";
  message: string;
  cities: CityData[];
}

const CITIES = [
  "Colombo",
  "Anuradhapura",
  "Dambulla",
  "Sigiriya",
  "Kandy",
  "Nuwara Eliya",
  "Galle",
  "Bentota",
];

const MONTHS: MonthData[] = [
  {
    label: "JAN", short: "JAN", recommendation: "best", message: "The best time to travel",
    cities: [{ temp: 30, rain: 74 }, { temp: 29, rain: 99 }, { temp: 29, rain: 136 }, { temp: 28, rain: 163 }, { temp: 27, rain: 176 }, { temp: 19, rain: 127 }, { temp: 29, rain: 105 }, { temp: 30, rain: 101 }],
  },
  {
    label: "FEB", short: "FEB", recommendation: "best", message: "The best time to travel",
    cities: [{ temp: 31, rain: 74 }, { temp: 31, rain: 50 }, { temp: 31, rain: 80 }, { temp: 30, rain: 86 }, { temp: 28, rain: 119 }, { temp: 19, rain: 87 }, { temp: 30, rain: 94 }, { temp: 31, rain: 98 }],
  },
  {
    label: "MAR", short: "MAR", recommendation: "best", message: "The best time to travel",
    cities: [{ temp: 32, rain: 136 }, { temp: 33, rain: 78 }, { temp: 33, rain: 96 }, { temp: 32, rain: 95 }, { temp: 30, rain: 130 }, { temp: 23, rain: 82 }, { temp: 31, rain: 143 }, { temp: 31, rain: 159 }],
  },
  {
    label: "APR", short: "APR", recommendation: "best", message: "The best time to travel",
    cities: [{ temp: 32, rain: 247 }, { temp: 33, rain: 171 }, { temp: 33, rain: 175 }, { temp: 32, rain: 153 }, { temp: 30, rain: 211 }, { temp: 24, rain: 180 }, { temp: 31, rain: 239 }, { temp: 32, rain: 316 }],
  },
  {
    label: "MAY", short: "MAY", recommendation: "good", message: "A good time to travel, but there may be some factors to be aware of",
    cities: [{ temp: 31, rain: 361 }, { temp: 33, rain: 92 }, { temp: 32, rain: 91 }, { temp: 32, rain: 84 }, { temp: 29, rain: 228 }, { temp: 21, rain: 180 }, { temp: 30, rain: 307 }, { temp: 30, rain: 440 }],
  },
  {
    label: "JUN", short: "JUN", recommendation: "good", message: "A good time to travel, but there may be some factors to be aware of",
    cities: [{ temp: 30, rain: 208 }, { temp: 32, rain: 12 }, { temp: 31, rain: 17 }, { temp: 31, rain: 11 }, { temp: 28, rain: 173 }, { temp: 19, rain: 168 }, { temp: 29, rain: 192 }, { temp: 30, rain: 260 }],
  },
  {
    label: "JUL", short: "JUL", recommendation: "possible", message: "Travel is possible, but this is not the best time of year",
    cities: [{ temp: 30, rain: 135 }, { temp: 32, rain: 32 }, { temp: 31, rain: 42 }, { temp: 31, rain: 47 }, { temp: 27, rain: 172 }, { temp: 18, rain: 175 }, { temp: 29, rain: 167 }, { temp: 29, rain: 204 }],
  },
  {
    label: "AUG", short: "AUG", recommendation: "possible", message: "Travel is possible, but this is not the best time of year",
    cities: [{ temp: 30, rain: 103 }, { temp: 33, rain: 41 }, { temp: 31, rain: 37 }, { temp: 32, rain: 42 }, { temp: 28, rain: 163 }, { temp: 18, rain: 154 }, { temp: 28, rain: 177 }, { temp: 29, rain: 190 }],
  },
  {
    label: "SEP", short: "SEP", recommendation: "possible", message: "Travel is possible, but this is not the best time of year",
    cities: [{ temp: 30, rain: 184 }, { temp: 33, rain: 71 }, { temp: 32, rain: 86 }, { temp: 32, rain: 95 }, { temp: 28, rain: 176 }, { temp: 21, rain: 169 }, { temp: 29, rain: 222 }, { temp: 29, rain: 310 }],
  },
  {
    label: "OCT", short: "OCT", recommendation: "possible", message: "Travel is possible, but this is not the best time of year",
    cities: [{ temp: 30, rain: 360 }, { temp: 31, rain: 239 }, { temp: 31, rain: 264 }, { temp: 30, rain: 253 }, { temp: 28, rain: 323 }, { temp: 19, rain: 245 }, { temp: 29, rain: 354 }, { temp: 29, rain: 431 }],
  },
  {
    label: "NOV", short: "NOV", recommendation: "possible", message: "Travel is possible, but this is not the best time of year",
    cities: [{ temp: 30, rain: 318 }, { temp: 30, rain: 247 }, { temp: 30, rain: 265 }, { temp: 29, rain: 271 }, { temp: 27, rain: 340 }, { temp: 20, rain: 236 }, { temp: 29, rain: 316 }, { temp: 30, rain: 359 }],
  },
  {
    label: "DEC", short: "DEC", recommendation: "good", message: "A good time to travel, but there may be some factors to be aware of",
    cities: [{ temp: 30, rain: 160 }, { temp: 29, rain: 225 }, { temp: 29, rain: 279 }, { temp: 28, rain: 328 }, { temp: 27, rain: 262 }, { temp: 19, rain: 228 }, { temp: 29, rain: 192 }, { temp: 30, rain: 218 }],
  },
];

const MAX_TEMP = 40;
const MAX_RAIN = 500;

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M5 0.5L6.1 3.7L9.5 4L6.9 6.2L7.6 9.5L5 7.8L2.4 9.5L3.1 6.2L0.5 4L3.9 3.7L5 0.5Z" />
  </svg>
);

const WaveCheck = ({ count }: { count: number }) => (
  <div className="flex items-center gap-[2px] justify-center mt-1">
    {Array.from({ length: count }).map((_, i) => (
      <StarIcon key={i} />
    ))}
  </div>
);

const getWaveCount = (rec: "best" | "good" | "possible") => {
  if (rec === "best") return 3;
  if (rec === "good") return 2;
  return 1;
};

const ClimateGuideSection: React.FC = () => {
  const [activeMonth, setActiveMonth] = useState(0);
  const month = MONTHS[activeMonth];

  return (
    <section className="bg-[#FBFAF9] py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-5xl sm:text-6xl text-center text-[#0C2421] mb-10 font-normal" style={{ color: 'rgba(12, 36, 33, 1)' }}>
          When to go
        </h2>

        {/* Month Tabs */}
        <div className="flex justify-between items-start mb-0 border-b border-[#D5D5D0]">
          {MONTHS.map((m, i) => {
            const isActive = i === activeMonth;
            return (
              <button
                key={m.label}
                onClick={() => setActiveMonth(i)}
                className={`
                  relative flex flex-col items-center pb-3 pt-2 px-1 sm:px-3 text-xs sm:text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer
                  ${isActive
                    ? "text-[#2C3E50] font-bold"
                    : "text-[#8E9EAB] hover:text-[#5A6B7A]"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="month-indicator"
                    className="absolute inset-0 border-2 border-[#2C3E50] rounded-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{m.label}</span>
                <span
                  className={`relative z-10 ${
                    isActive ? "text-[#5A8F7B]" : "text-[#B0BEC5]"
                  }`}
                >
                  <WaveCheck count={getWaveCount(m.recommendation)} />
                </span>
              </button>
            );
          })}
        </div>

        {/* Data Panel */}
        <div className="bg-[#F5F5F0] rounded-b-2xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMonth + "-msg"}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="mb-[50px] text-left pt-[30px]"
            >
              <p
                className="text-[24px] text-black font-extrabold flex flex-wrap"
                style={{ fontFamily: 'LLIvory' }}
              >
                {month.message}
              </p>
              <motion.svg
                width="200"
                height="12"
                viewBox="0 0 200 12"
                fill="none"
                className="mt-2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.path
                  d="M2 6C10 2 18 10 26 6C34 2 42 10 50 6C58 2 66 10 74 6C82 2 90 10 98 6C106 2 114 10 122 6C130 2 138 10 146 6C154 2 162 10 170 6C178 2 186 10 194 6"
                  stroke="#5A8F7B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                />
              </motion.svg>
            </motion.div>
          </AnimatePresence>

          {/* Column Headers */}
          <div className="grid grid-cols-[minmax(100px,160px)_1fr_1fr] gap-x-4 sm:gap-x-8 mb-4">
            <span className="text-[18px] font-semibold text-[#0C2421]" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Place
            </span>
            <span className="text-[18px] font-semibold text-[#0C2421]" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Daily max temperature (°C)
            </span>
            <span className="text-[18px] font-semibold text-[#0C2421]" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Monthly rainfall (mm)
            </span>
          </div>

          {/* City Rows */}
          <div className="space-y-2">
            {CITIES.map((city, i) => {
              const data = month.cities[i];
              const tempPercent = (data.temp / MAX_TEMP) * 100;
              const rainPercent = (data.rain / MAX_RAIN) * 100;

              return (
                <div
                  key={city}
                  className="grid grid-cols-[minmax(100px,160px)_1fr_1fr] gap-x-4 sm:gap-x-8 items-center py-2"
                >
                  <span className="text-[18px] font-normal text-[#0C2421]" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                    {city}
                  </span>

                  <div className="relative h-8 flex items-center">
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                      <div className="w-full h-[6px] bg-[#D5D8DC] rounded-full" />
                    </div>
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #E67E22, #F39C12)" }}
                      initial={false}
                      animate={{ width: `${tempPercent}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                      initial={false}
                      animate={{ left: `${tempPercent}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E67E22] flex items-center justify-center shadow-md">
                        <span className="text-[10px] sm:text-xs font-bold text-white">
                          {data.temp}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  <div className="relative h-8 flex items-center">
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                      <div className="w-full h-[6px] bg-[#D5D8DC] rounded-full" />
                    </div>
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #5B8C8D, #6FA8A9)" }}
                      initial={false}
                      animate={{ width: `${rainPercent}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                      initial={false}
                      animate={{ left: `${rainPercent}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5B8C8D] flex items-center justify-center shadow-md">
                        <span className="text-[10px] sm:text-xs font-bold text-white">
                          {data.rain}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClimateGuideSection;
