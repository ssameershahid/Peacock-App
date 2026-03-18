import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: string[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <div className={cn('flex items-center justify-center gap-0', className)}>
      {steps.map((label, i) => {
        const isCompleted = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2 min-w-[80px]">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-body font-bold transition-all',
                  isCompleted && 'bg-forest-500 text-white',
                  isActive && 'bg-forest-500 text-white ring-4 ring-forest-100',
                  !isCompleted && !isActive && 'bg-warm-100 text-warm-400 border-2 border-warm-200'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={cn(
                  'font-body text-xs text-center',
                  isActive ? 'text-forest-600 font-semibold' : 'text-warm-400'
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-[2px] flex-1 max-w-[60px] -mt-6',
                  i < current ? 'bg-forest-500' : 'bg-warm-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
