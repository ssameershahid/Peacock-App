import React from 'react';
import { MapPin, Car, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: {
    id: string;
    type: string;
    title: string;
    date: string;
    status: string;
    vehicle: string;
    price: number;
    passengers?: number;
    driver?: { name: string; phone: string } | null;
  };
  className?: string;
  onClick?: () => void;
}

const typeIcon: Record<string, React.ReactNode> = {
  tour: <MapPin className="w-5 h-5" />,
  transfer: <Car className="w-5 h-5" />,
  cyo: <Sparkles className="w-5 h-5" />,
};

export function BookingCard({ booking, className, onClick }: BookingCardProps) {
  const { format } = useCurrency();

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-5 bg-white rounded-2xl border border-warm-100 shadow-card hover:shadow-card-hover transition-all cursor-pointer group',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center text-forest-500 shrink-0">
        {typeIcon[booking.type] || <MapPin className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-body font-semibold text-forest-600 truncate">{booking.title}</h4>
          <StatusBadge status={booking.status} />
        </div>
        <p className="font-body text-sm text-warm-400">{booking.date}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-body text-xs text-warm-400">{booking.vehicle}</span>
          {booking.driver && (
            <span className="font-body text-xs text-warm-400">• Driver: {booking.driver.name}</span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="font-display text-2xl text-forest-600">{format(booking.price)}</span>
        <p className="font-body text-xs text-warm-400">ID: {booking.id}</p>
      </div>
    </div>
  );
}
