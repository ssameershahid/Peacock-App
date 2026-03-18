import React from 'react';
import { Users } from 'lucide-react';
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

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory', className)}>
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
  );
}
