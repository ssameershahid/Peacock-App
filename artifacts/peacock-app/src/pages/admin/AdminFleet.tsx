import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import AdminLayout from './AdminLayout';

const VEHICLES = [
  { id: 'car', name: 'Car', model: 'Toyota Prius / Axio', count: 3, dailyRate: 45, perKm: 0.15 },
  { id: 'minivan', name: 'Minivan', model: 'Toyota KDH', count: 4, dailyRate: 65, perKm: 0.20 },
  { id: 'large-van', name: 'Large Van', model: 'Toyota HiAce', count: 2, dailyRate: 85, perKm: 0.25 },
  { id: 'small-bus', name: 'Small Bus', model: 'Rosa / Coaster', count: 1, dailyRate: 120, perKm: 0.35 },
  { id: 'medium-bus', name: 'Medium Bus', model: 'Mitsubishi Rosa', count: 1, dailyRate: 175, perKm: 0.45 },
];

const DAYS_IN_MONTH = 31;

function generateCalendarData() {
  const data: Record<string, Record<number, 'available' | 'partial' | 'full'>> = {};
  VEHICLES.forEach(v => {
    data[v.id] = {};
    for (let d = 1; d <= DAYS_IN_MONTH; d++) {
      const r = Math.random();
      data[v.id][d] = r < 0.65 ? 'available' : r < 0.85 ? 'partial' : 'full';
    }
  });
  return data;
}

export default function AdminFleet() {
  const { format } = useCurrency();
  const [monthOffset, setMonthOffset] = useState(0);
  const [calData] = useState(generateCalendarData);
  const [popover, setPopover] = useState<{ vehicle: string; day: number } | null>(null);

  const baseDate = new Date(2026, 2 + monthOffset, 1);
  const monthName = baseDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const daysCount = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();

  return (
    <AdminLayout
      title="Fleet & availability"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Fleet' }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {VEHICLES.map(v => (
          <div key={v.id} className="bg-white rounded-2xl border border-warm-100 p-5">
            <div className="w-full h-20 bg-warm-50 rounded-xl mb-3 flex items-center justify-center">
              <span className="font-body text-2xl text-warm-300">{v.name[0]}</span>
            </div>
            <h3 className="font-body text-sm font-semibold text-forest-600">{v.name}</h3>
            <p className="font-body text-xs text-warm-400 mb-3">{v.model}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-body text-xs text-warm-400">In fleet:</span>
              <input type="number" defaultValue={v.count} className="w-12 border border-warm-200 rounded-lg px-2 py-1 font-body text-sm text-center focus:outline-none focus:ring-2 focus:ring-forest-300" />
            </div>
            <div className="flex items-center justify-between text-xs font-body text-warm-500">
              <span>Daily: {format(v.dailyRate)}</span>
              <span>Per km: {format(v.perKm)}</span>
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 border border-warm-200 text-forest-600 font-body text-xs font-medium py-1.5 rounded-xl hover:bg-warm-50 transition-colors">
              <Edit className="w-3 h-3" /> Edit
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-warm-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body text-sm font-semibold text-forest-600">Availability calendar</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setMonthOffset(monthOffset - 1)} className="p-1.5 hover:bg-warm-50 rounded-lg"><ChevronLeft className="w-4 h-4 text-warm-500" /></button>
            <span className="font-body text-sm font-medium text-forest-600 min-w-[140px] text-center">{monthName}</span>
            <button onClick={() => setMonthOffset(monthOffset + 1)} className="p-1.5 hover:bg-warm-50 rounded-lg"><ChevronRight className="w-4 h-4 text-warm-500" /></button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4 font-body text-xs text-warm-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-200" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-300" /> Partial</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-300" /> Fully booked</span>
        </div>
        <div className="overflow-x-auto relative">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 px-3 py-2 text-left font-body text-xs font-semibold text-warm-500 w-28">Vehicle</th>
                {Array.from({ length: daysCount }).map((_, d) => (
                  <th key={d} className="px-0.5 py-2 font-body text-[10px] text-warm-400 text-center w-7">{d + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map(v => (
                <tr key={v.id}>
                  <td className="sticky left-0 bg-white z-10 px-3 py-1.5 font-body text-xs text-forest-600 font-medium">{v.name}</td>
                  {Array.from({ length: daysCount }).map((_, d) => {
                    const status = calData[v.id]?.[d + 1] || 'available';
                    const isPopover = popover?.vehicle === v.id && popover?.day === d + 1;
                    return (
                      <td key={d} className="px-0.5 py-1.5 relative">
                        <button
                          onClick={() => setPopover(isPopover ? null : { vehicle: v.id, day: d + 1 })}
                          className={cn(
                            'w-6 h-6 rounded-md transition-colors',
                            status === 'available' ? 'bg-emerald-100 hover:bg-emerald-200' :
                            status === 'partial' ? 'bg-amber-200 hover:bg-amber-300' :
                            'bg-red-200 hover:bg-red-300'
                          )}
                        />
                        {isPopover && (
                          <div className="absolute top-8 left-0 z-20 w-48 bg-white rounded-xl shadow-lg border border-warm-100 p-3">
                            <p className="font-body text-xs font-semibold text-forest-600 mb-1">{v.name} {"\u2014"} {monthName.split(' ')[0]} {d + 1}</p>
                            {status === 'available' ? (
                              <p className="font-body text-xs text-emerald-600">All {v.count} vehicles available</p>
                            ) : status === 'partial' ? (
                              <div>
                                <p className="font-body text-xs text-amber-600 mb-1">{Math.max(1, v.count - 1)} of {v.count} booked</p>
                                <p className="font-body text-[10px] text-warm-400">BK-2026-007 (Johnson family)</p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-body text-xs text-red-600 mb-1">All {v.count} vehicles booked</p>
                                <p className="font-body text-[10px] text-warm-400">BK-2026-007, BK-2026-009</p>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
