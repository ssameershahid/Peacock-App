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
    <div className="mt-14 max-w-[1200px] mx-auto px-6 pb-4">
      <p className="font-display font-normal italic text-center text-2xl md:text-3xl text-white/70 mb-10">
        Three simple steps
      </p>

      <div className="flex flex-col md:flex-row">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className="flex-1 flex flex-col items-center text-center px-4 md:px-8">
              {/* Circle */}
              <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center mb-5 shrink-0">
                <span className="font-display font-normal text-xl text-white">{i + 1}</span>
              </div>
              <h3 className="font-display font-normal italic text-lg md:text-xl text-white mb-3 leading-snug">
                {step.title}
              </h3>
              <p className="font-body text-sm text-white/65 leading-relaxed max-w-[240px]">
                {step.desc}
              </p>
            </div>

            {/* Dashed connector */}
            {i < steps.length - 1 && (
              <div className="hidden md:flex items-start pt-7 shrink-0">
                <div className="w-12 lg:w-20 border-t border-dashed border-white/20" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HowItWorksSteps;
