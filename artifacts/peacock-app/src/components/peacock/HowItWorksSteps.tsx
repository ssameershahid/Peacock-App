import React from 'react';

interface Step {
  title: string;
  desc: string;
}

interface HowItWorksStepsProps {
  steps: Step[];
}

const HowItWorksSteps: React.FC<HowItWorksStepsProps> = ({ steps }) => {
  return (
    <div className="bg-[#faf7f2] border-b border-warm-100">
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <p className="font-display font-normal italic text-center text-2xl md:text-3xl text-forest-600 mb-12">
          Three simple steps
        </p>

        <div className="relative flex flex-col md:flex-row gap-10 md:gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              {/* Step */}
              <div className="flex-1 flex flex-col items-center text-center px-4 md:px-6">
                {/* Circle */}
                <div className="w-14 h-14 rounded-full border border-forest-300 flex items-center justify-center mb-5 bg-white shrink-0 z-10 relative">
                  <span className="font-display font-normal text-xl text-forest-500">{i + 1}</span>
                </div>
                <h3 className="font-display font-normal italic text-lg md:text-xl text-forest-600 mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-warm-500 leading-relaxed max-w-[260px]">
                  {step.desc}
                </p>
              </div>

              {/* Dashed connector — hidden after last step */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-start pt-7 shrink-0">
                  <div className="w-16 lg:w-24 border-t border-dashed border-forest-200 mt-0" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSteps;
