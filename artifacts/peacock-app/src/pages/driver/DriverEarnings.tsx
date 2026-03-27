import { useState, useMemo } from 'react';
import { Download, Clock, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useDriverBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { NotificationBell } from './DriverLayout';
import { cn } from '@/lib/utils';

type Period = 'this-month' | 'last-month' | 'last-3' | 'all-time';

export default function DriverEarnings() {
  const [period, setPeriod] = useState<Period>('this-month');
  const { data: bookings, isLoading } = useDriverBookings();
  const { format } = useCurrency();

  const completed = useMemo(() =>
    (bookings || []).filter(b => b.driverStatus === 'completed')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()),
    [bookings]
  );

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

  // Chart data
  const chartData = useMemo(() => {
    if (period === 'this-month' || period === 'last-month') {
      // Weekly breakdown
      const trips = period === 'this-month' ? thisMonthTrips : lastMonthTrips;
      const weeks: { name: string; earnings: number }[] = [
        { name: 'Week 1', earnings: 0 },
        { name: 'Week 2', earnings: 0 },
        { name: 'Week 3', earnings: 0 },
        { name: 'Week 4', earnings: 0 },
      ];
      trips.forEach(t => {
        const dayOfMonth = new Date(t.endDate).getDate();
        const weekIdx = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
        weeks[weekIdx].earnings += t.driverEarnings;
      });
      return weeks;
    } else {
      // Monthly breakdown (last 6 or 12 months)
      const months = period === 'last-3' ? 3 : 12;
      const data: { name: string; earnings: number }[] = [];
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthTrips = completed.filter(b => {
          const ed = new Date(b.endDate);
          return ed >= d && ed <= monthEnd;
        });
        data.push({
          name: d.toLocaleDateString('en-GB', { month: 'short' }),
          earnings: monthTrips.reduce((s, b) => s + b.driverEarnings, 0),
        });
      }
      return data;
    }
  }, [period, completed, thisMonthTrips, lastMonthTrips]);

  const summaryCards = [
    { label: 'This month', amount: thisMonthEarnings },
    { label: 'Last month', amount: lastMonthEarnings },
    { label: 'All time', amount: allTimeEarnings },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-forest-600 text-white px-5 pt-10 pb-6 rounded-b-[32px] md:rounded-none md:pt-6 md:pb-5">
        <div className="max-w-lg mx-auto md:max-w-3xl flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl mb-1">Earnings</h1>
            <p className="font-body text-white/60 text-sm">{completed.length} completed trips</p>
          </div>
          <NotificationBell />
        </div>
      </div>

      <div className="px-5 max-w-lg mx-auto md:max-w-3xl pt-5 pb-8">
        {/* Summary cards */}
        {isLoading ? (
          <div className="flex gap-3 mb-5">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl flex-1" />)}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 mb-5 scrollbar-none">
            {summaryCards.map(card => (
              <div key={card.label} className="bg-white rounded-2xl p-4 border border-warm-100 shadow-sm min-w-[130px] flex-shrink-0 flex-1">
                <p className="font-body text-xs text-warm-400 mb-1.5">{card.label}</p>
                <p className="font-display text-2xl text-forest-600">{format(card.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pending payout */}
        {pendingTotal > 0 && (
          <div className="bg-[#FDF5E0] rounded-2xl border-l-[3px] border-l-amber-200 p-4 mb-5">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-warm-900">Pending payout</p>
                <p className="font-display text-2xl text-forest-500">{format(pendingTotal)}</p>
              </div>
              <div className="text-right">
                <p className="font-body text-xs text-warm-500">Expected: Monday</p>
                <p className="font-body text-xs text-warm-400">Via bank transfer</p>
              </div>
            </div>
          </div>
        )}

        {/* Earnings chart */}
        {isLoading ? (
          <div className="skeleton h-[200px] rounded-2xl mb-5" />
        ) : (
          <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-5 mb-5">
            {chartData.some(d => d.earnings > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DF" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#8A8782' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#8A8782' }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => `£${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E8E5DF', fontSize: 13, fontFamily: 'DM Sans' }}
                    formatter={(value: number) => [`£${value.toFixed(0)}`, 'Earnings']}
                  />
                  <Bar dataKey="earnings" fill="#1B3C34" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center">
                <p className="font-body text-sm text-warm-400">No earnings data for this period</p>
              </div>
            )}
          </div>
        )}

        {/* Period filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
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

        {/* Trip-by-trip earnings */}
        {isLoading ? (
          <div className="space-y-3 mb-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden mb-5">
            {filteredTrips.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-body text-sm text-warm-400">No completed trips in this period</p>
              </div>
            ) : (
              <div className="divide-y divide-warm-100">
                {filteredTrips.map(trip => (
                  <div key={trip.id} className="flex items-center justify-between p-4 hover:bg-warm-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-body text-[13px] text-warm-500 shrink-0 w-[70px]">
                        {new Date(trip.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className={cn(
                        'font-body text-[10px] font-medium px-2 py-0.5 rounded-pill shrink-0',
                        (trip.type === 'tour' || trip.type === 'READY_MADE') ? 'bg-forest-50 text-forest-600' : 'bg-amber-50 text-amber-500'
                      )}>
                        {(trip.type === 'tour' || trip.type === 'READY_MADE') ? 'Tour' : 'Transfer'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm font-medium text-warm-900 truncate">{trip.title}</p>
                        <p className="font-body text-[13px] text-warm-400 truncate">{trip.customer?.name || 'Guest'}</p>
                      </div>
                    </div>
                    <span className="font-body text-base font-semibold text-forest-500 ml-3">{format(trip.driverEarnings)}</span>
                  </div>
                ))}
              </div>
            )}
            {filteredTrips.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-warm-50 border-t border-warm-100">
                <span className="font-body text-sm font-semibold text-warm-900">Total</span>
                <span className="font-body text-sm font-bold text-forest-600">{format(filteredTotal)}</span>
              </div>
            )}
          </div>
        )}

        {/* Export button */}
        <button className="w-full flex items-center justify-center gap-2 bg-white border border-warm-200 text-forest-600 font-body text-sm font-medium rounded-full min-h-[48px] hover:bg-warm-50 transition-all duration-200">
          <Download className="w-4 h-4" /> Export earnings report
        </button>
      </div>
    </div>
  );
}
