import React from 'react';
import { cn } from '@/lib/utils';

interface MapPlaceholderProps {
  locations: string[];
  className?: string;
}

export function MapPlaceholder({ locations, className }: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        'bg-sage rounded-2xl p-6 border border-warm-100 relative overflow-hidden',
        className
      )}
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(27,60,52,0.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="flex flex-col gap-0">
        {locations.map((loc, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-3.5 h-3.5 rounded-full border-2 shrink-0',
                i === 0 ? 'bg-forest-500 border-forest-500' :
                i === locations.length - 1 ? 'bg-amber-200 border-amber-200' :
                'bg-white border-forest-300'
              )} />
              {i < locations.length - 1 && (
                <div className="w-[2px] h-8 bg-forest-200" />
              )}
            </div>
            <span className={cn(
              'font-body text-sm -mt-0.5',
              i === 0 || i === locations.length - 1 ? 'font-semibold text-forest-600' : 'text-warm-500'
            )}>
              {loc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
