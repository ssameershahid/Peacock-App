import React from 'react';

interface Step {
  title: string;
  desc: string;
}

interface StepCardsProps {
  steps: Step[];
}

const StepCards: React.FC<StepCardsProps> = ({ steps }) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={index}
          className="border border-border/50 rounded-2xl bg-card px-5 py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/20"
        >
          <div className="flex items-start text-left gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white font-display font-normal flex items-center justify-center text-sm border border-primary mt-0.5">
              {index + 1}
            </div>
            <div>
              <h4 className="font-display font-normal text-lg text-foreground leading-tight mb-1">
                {step.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                {step.desc}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepCards;
