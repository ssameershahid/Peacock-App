import React, { useState } from 'react';
import { Link } from 'wouter';
import { useUserBookings, useCYORequests } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { BookingCard } from '@/components/shared/BookingCard';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Map, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MyTrips() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data: bookings, isLoading } = useUserBookings();
  const { data: cyoRequests } = useCYORequests();
  const { format } = useCurrency();

  const upcoming = bookings?.filter(b => ['Upcoming', 'Pending', 'In Progress', 'Quote Paid'].includes(b.status)) || [];
  const past = bookings?.filter(b => ['Completed', 'Cancelled'].includes(b.status)) || [];
  const quotedCYO = cyoRequests?.filter(r => r.status === 'Quoted') || [];

  const displayList = tab === 'upcoming' ? upcoming : past;

  return (
    <div>
      <SectionHeading title="My *trips*" className="mb-6" />

      <div className="flex gap-2 bg-warm-100/50 p-1 rounded-pill w-fit mb-8">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-6 py-2 rounded-pill font-body text-sm font-medium transition-all capitalize',
              tab === t ? 'bg-white shadow-sm text-forest-600' : 'text-warm-500 hover:text-forest-600'
            )}
          >
            {t === 'upcoming' ? 'Upcoming' : 'Past'}
          </button>
        ))}
      </div>

      {tab === 'upcoming' && quotedCYO.length > 0 && (
        <div className="mb-6">
          {quotedCYO.map(cyo => (
            <Link key={cyo.id} href={`/account/bookings/${cyo.id}`}>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-body font-semibold text-forest-600">Custom: {cyo.locations.join(" \u2192 ")}</h4>
                      <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-body font-medium bg-amber-100 text-amber-700">Quote Ready</span>
                    </div>
                    <p className="font-body text-sm text-warm-500">{cyo.dates}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-body font-bold text-amber-600">View & Pay {"\u2014"} {format(cyo.quotedAmount)}</span>
                  <ArrowRight className="w-4 h-4 text-amber-200" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-warm-100 rounded-2xl animate-pulse" />
          ))
        ) : displayList.length === 0 ? (
          <div className="bg-white border border-dashed border-warm-200 rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mb-4">
              <Map className="w-8 h-8 text-forest-400" />
            </div>
            <h3 className="font-display text-2xl text-forest-600 mb-2">
              {tab === 'upcoming' ? 'No upcoming trips yet' : 'No past trips'}
            </h3>
            <p className="font-body text-warm-500 mb-6">
              {tab === 'upcoming' ? 'Time to plan your Sri Lankan adventure!' : 'Your completed trips will appear here.'}
            </p>
            <Link href="/tours">
              <button className="bg-forest-600 text-white px-6 py-3 rounded-full font-body font-medium hover:bg-forest-700 transition-all duration-200 inline-flex items-center gap-2">
                Browse tours <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        ) : (
          displayList.map(booking => (
            <Link key={booking.id} href={`/account/bookings/${booking.id}`}>
              <BookingCard booking={booking} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
