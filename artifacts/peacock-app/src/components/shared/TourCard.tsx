import React from 'react';
import { Link } from 'wouter';
import { Clock, ArrowRight } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TourCardProps {
  tour: any;
}

export function TourCard({ tour }: TourCardProps) {
  const { format } = useCurrency();
  const perDay = tour.vehicleRates?.car ?? Math.round(tour.basePrice / tour.durationDays);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group block min-w-[280px] w-[320px] sm:w-[360px] rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-[240px] w-full overflow-hidden">
        <img
          src={tour.image}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-600/90 via-forest-600/30 to-transparent" />

        <div className="absolute bottom-5 left-5 right-5 z-10">
          <h3 className="font-display text-2xl text-white mb-1">{tour.title}</h3>
          <p className="font-body text-sm text-white/80 line-clamp-1">{tour.tagline}</p>
        </div>

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-pill flex items-center gap-1.5 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-forest-500" />
          <span className="font-body text-xs font-medium text-forest-600">{tour.durationDays} Days</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 bg-sage rounded-pill text-xs font-medium text-forest-600 font-body">
            {tour.category}
          </span>
          <span className="px-2.5 py-1 bg-warm-50 rounded-pill text-xs font-medium text-warm-600 font-body">
            {tour.difficulty}
          </span>
          {tour.regions?.slice(0, 2).map((r: string) => (
            <span key={r} className="px-2.5 py-1 bg-warm-50 rounded-pill text-xs font-medium text-warm-400 font-body">
              {r}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-warm-400 font-body">From</span>
            <span className="text-lg font-semibold text-forest-500 font-body">
              {format(perDay)} <span className="text-sm font-normal text-warm-400">/day</span>
            </span>
          </div>
          <div className="flex items-center gap-1 font-body text-sm font-semibold text-forest-500 group-hover:text-amber-200 transition-colors">
            View tour <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
