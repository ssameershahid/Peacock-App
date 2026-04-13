import React, { useRef } from 'react';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface Vehicle {
  id: string;
  name: string;
  model: string;
  image: string;
  capacity: string;
  maxPassengers: number;
  pricePerDay: number;
}

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selected: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function VehicleSelector({ vehicles, selected, onSelect, className }: VehicleSelectorProps) {
  const { format } = useCurrency();
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 164 : -164, behavior: 'smooth' });
  }

  const selectedIdx = vehicles.findIndex(v => v.id === selected);

  function step(dir: 'prev' | 'next') {
    const next = dir === 'next'
      ? Math.min(selectedIdx + 1, vehicles.length - 1)
      : Math.max(selectedIdx - 1, 0);
    onSelect(vehicles[next].id);
    // scroll the new card into view
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  return (
    <div className={cn('', className)}>
      {/* Top-right arrow pair — sits above the card strip, floated to the right */}
      <div className="flex justify-end gap-1 mb-2">
        <button
          type="button"
          onClick={() => step('prev')}
          disabled={selectedIdx <= 0}
          className="w-7 h-7 rounded-lg bg-white border border-warm-200 shadow-sm flex items-center justify-center text-forest-600 hover:bg-forest-50 hover:border-forest-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous vehicle"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => step('next')}
          disabled={selectedIdx >= vehicles.length - 1}
          className="w-7 h-7 rounded-lg bg-white border border-warm-200 shadow-sm flex items-center justify-center text-forest-600 hover:bg-forest-50 hover:border-forest-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next vehicle"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable card list */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory"
      >
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={cn(
              'flex-shrink-0 snap-center flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 min-w-[140px] cursor-pointer',
              selected === v.id
                ? 'border-forest-500 bg-forest-50 ring-2 ring-forest-500 shadow-sm'
                : 'border-warm-200 bg-white hover:border-forest-300 hover:shadow-sm'
            )}
          >
            <img
              src={v.image}
              alt={v.name}
              className="w-24 h-16 object-contain mb-3"
            />
            <span className="font-body font-semibold text-sm text-forest-600">{v.name}</span>
            <span className="font-body text-xs text-warm-400 flex items-center gap-1 mt-1">
              <Users className="w-3 h-3" />
              {v.capacity}
            </span>
            <span className="font-body text-sm font-semibold text-forest-500 mt-2">
              {format(v.pricePerDay)}<span className="text-xs font-normal text-warm-400">/day</span>
            </span>
          </button>
        ))}
      </div>

      {/* Position indicator dots */}
      {vehicles.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {vehicles.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              className={cn(
                'rounded-full transition-all',
                i === selectedIdx
                  ? 'w-4 h-1.5 bg-forest-500'
                  : 'w-1.5 h-1.5 bg-warm-300 hover:bg-warm-400'
              )}
              aria-label={v.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
