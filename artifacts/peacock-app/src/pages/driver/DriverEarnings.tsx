import { useState } from 'react';
import { Download, Clock } from 'lucide-react';
import { useDriverBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

type Period = 'this-month' | 'last-month' | 'last-3' | 'all-time';

export default function DriverEarnings() {
  const [period, setPeriod] = useState<Period>('this-month');
  const { data: bookings } = useDriverBookings();
  const { format } = useCurrency();

  const completed = (bookings || []).filter(b => b.driverStatus === 'completed')
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const thisMonthTrips = completed.filter(b => new Date(b.endDate) >= thisMonthStart);
  const lastMonthTrips = completed.filter(b => {
    const d = new Date(b.endDate);
    return d >= lastMonthStart && d <= lastMonthEnd;
  });
  const last3Trips = completed.filter(b => new Date(b.endDate) >= threeMonthsAgo);

  const thisMonthEarnings = thisMonthTrips.reduce((s, b) => s + b.driverEarnings, 0);
  const lastMonthEarnings = lastMonthTrips.reduce((s, b) => s + b.driverEarnings, 0);
  const allTimeEarnings = completed.reduce((s, b) => s + b.driverEarnings, 0);

  const getFilteredTrips = () => {
    switch (period) {
      case 'this-month': return thisMonthTrips;
      case 'last-month': return lastMonthTrips;
      case 'last-3': return last3Trips;
      case 'all-time': return completed;
    }
  };

  const filteredTrips = getFilteredTrips();
  const filteredTotal = filteredTrips.reduce((s, b) => s + b.driverEarnings, 0);

  const pendingTrips = (bookings || []).filter(b => b.driverStatus !== 'completed' && b.driverEarnings > 0);
  const pendingTotal = pendingTrips.reduce((s, b) => s + b.driverEarnings, 0);

  const summaryCards = [
    { label: 'This month', amount: thisMonthEarnings },
    { label: 'Last month', amount: lastMonthEarnings },
    { label: 'All time', amount: allTimeEarnings },
  ];

  return (
    <div>
      <div className="bg-forest-600 text-white px-5 pt-12 pb-8 rounded-b-[32px] md:rounded-none md:pt-8 md:pb-6">
        <div className="max-w-lg mx-auto md:max-w-3xl">
          <h1 className="font-display text-3xl mb-2">Earnings</h1>
          <p className="font-body text-white/60 text-sm">{completed.length} completed trips</p>
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-6 pb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 mb-6 scrollbar-none">
          {summaryCards.map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-warm-100 shadow-sm min-w-[140px] flex-shrink-0">
              <p className="font-body text-xs text-warm-400 mb-2">{card.label}</p>
              <p className="font-display text-2xl text-forest-600">{format(card.amount)}</p>
            </div>
          ))}
        </div>

        {pendingTotal > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-body text-sm font-semibold text-amber-800">Pending payout: {format(pendingTotal)}</p>
                <p className="font-body text-xs text-amber-600 mt-0.5">Payouts are processed weekly</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {([
            { key: 'this-month', label: 'This month' },
            { key: 'last-month', label: 'Last month' },
            { key: 'last-3', label: 'Last 3 months' },
            { key: 'all-time', label: 'All time' },
          ] as const).map(opt => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              className={cn(
                'px-4 py-2 rounded-pill font-body text-xs font-medium whitespace-nowrap transition-colors min-h-[40px]',
                period === opt.key
                  ? 'bg-forest-600 text-white'
                  : 'bg-white text-warm-500 border border-warm-200 hover:bg-warm-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden mb-6">
          {filteredTrips.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-body text-sm text-warm-400">No completed trips in this period</p>
            </div>
          ) : (
            <div className="divide-y divide-warm-100">
              {filteredTrips.map(trip => (
                <div key={trip.id} className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-forest-600 truncate">{trip.title}</p>
                    <p className="font-body text-xs text-warm-400 mt-0.5">
                      {new Date(trip.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'font-body text-[10px] font-medium px-2 py-0.5 rounded-pill',
                      trip.type === 'tour' ? 'bg-forest-50 text-forest-600' : 'bg-blue-50 text-blue-600'
                    )}>
                      {trip.type === 'tour' ? 'Tour' : 'Transfer'}
                    </span>
                    <span className="font-body text-sm font-semibold text-emerald-600 min-w-[60px] text-right">{format(trip.driverEarnings)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredTrips.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-warm-50 border-t border-warm-100">
              <span className="font-body text-sm font-semibold text-forest-600">Total</span>
              <span className="font-body text-sm font-bold text-forest-600">{format(filteredTotal)}</span>
            </div>
          )}
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-white border border-warm-200 text-forest-600 font-body text-sm font-medium rounded-xl min-h-[48px] hover:bg-warm-50 transition-colors">
          <Download className="w-4 h-4" /> Export earnings report
        </button>
      </div>
    </div>
  );
}
