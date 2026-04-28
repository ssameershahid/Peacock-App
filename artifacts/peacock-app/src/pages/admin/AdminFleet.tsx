import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatDate } from '@/lib/date-utils';
import AdminLayout from './AdminLayout';

const VEHICLES = [
  { id: 'car', name: 'Car', model: 'Toyota Prius / Axio', image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f0fcc850133576a0f0dd01_car.png', count: 3, dailyRate: 45, perKm: 0.15 },
  { id: 'minivan', name: 'Minivan', model: 'Toyota KDH', image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f0fcc866a9748d607bd3d6_mini%20van.png', count: 4, dailyRate: 65, perKm: 0.20 },
  { id: 'large-van', name: 'Large Van', model: 'Toyota HiAce', image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f0fcc90efd8b08fe8622af_lage%20mini%20van.png', count: 2, dailyRate: 85, perKm: 0.25 },
  { id: 'small-bus', name: 'Small Bus', model: 'Rosa / Coaster', image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f0fcc8f280f0165506a485_small%20bus.png', count: 1, dailyRate: 120, perKm: 0.35 },
  { id: 'medium-bus', name: 'Medium Bus', model: 'Mitsubishi Rosa', image: 'https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f0fb9d7a6b519f150e3394_Screenshot%202026-04-28%20at%2011.23%20Background%20Removed.55%E2%80%AFPM.png', count: 1, dailyRate: 175, perKm: 0.45 },
];

const FAKE_CUSTOMERS = [
  'Johnson family', 'Smith group', 'Patel party', 'Williams tour',
  'Garcia family', 'Anderson duo', 'Thompson group', 'Martinez clan',
  'Robinson party', 'Clark family', 'Walker tour', 'Lewis group',
];

const FAKE_TOUR_NAMES = [
  'Hill Country Explorer', 'Coastal Sri Lanka', 'Cultural Triangle',
  'Southern Beaches', 'Wildlife Safari', 'Tea Country Tour',
  'Ancient Cities Trail', 'East Coast Discovery',
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

type DayStatus = 'available' | 'partial' | 'full';

interface BookingInfo {
  refCode: string;
  customer: string;
  tour: string;
}

interface DayData {
  status: DayStatus;
  bookedCount: number;
  bookings: BookingInfo[];
}

function generateCalendarData(year: number, month: number) {
  const daysCount = new Date(year, month + 1, 0).getDate();
  const data: Record<string, Record<number, DayData>> = {};

  VEHICLES.forEach(v => {
    data[v.id] = {};
    for (let d = 1; d <= daysCount; d++) {
      const rng = seededRandom(year * 10000 + month * 100 + d + v.id.charCodeAt(0) * 7);
      const r = rng();
      let status: DayStatus;
      let bookedCount = 0;
      const bookings: BookingInfo[] = [];

      if (r < 0.65) {
        status = 'available';
        bookedCount = 0;
      } else if (r < 0.85) {
        status = 'partial';
        bookedCount = Math.max(1, Math.floor(rng() * v.count));
        if (bookedCount >= v.count) bookedCount = v.count - 1;
        for (let b = 0; b < bookedCount; b++) {
          const idx = Math.floor(rng() * 900) + 100;
          bookings.push({
            refCode: `PKD-2026-${idx}`,
            customer: FAKE_CUSTOMERS[Math.floor(rng() * FAKE_CUSTOMERS.length)],
            tour: FAKE_TOUR_NAMES[Math.floor(rng() * FAKE_TOUR_NAMES.length)],
          });
        }
      } else {
        status = 'full';
        bookedCount = v.count;
        for (let b = 0; b < bookedCount; b++) {
          const idx = Math.floor(rng() * 900) + 100;
          bookings.push({
            refCode: `PKD-2026-${idx}`,
            customer: FAKE_CUSTOMERS[Math.floor(rng() * FAKE_CUSTOMERS.length)],
            tour: FAKE_TOUR_NAMES[Math.floor(rng() * FAKE_TOUR_NAMES.length)],
          });
        }
      }

      data[v.id][d] = { status, bookedCount, bookings };
    }
  });
  return data;
}

export default function AdminFleet() {
  const { format } = useCurrency();
  const [monthOffset, setMonthOffset] = useState(0);
  const [popover, setPopover] = useState<{ vehicle: string; day: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const baseDate = new Date(2026, 2 + monthOffset, 1);
  const monthName = baseDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const daysCount = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();

  const calData = useMemo(
    () => generateCalendarData(baseDate.getFullYear(), baseDate.getMonth()),
    [baseDate.getFullYear(), baseDate.getMonth()]
  );

  // Close popover when clicking outside
  useEffect(() => {
    if (!popover) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popover]);

  function buildDateString(day: number) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
    return formatDate(d, 'medium');
  }

  return (
    <AdminLayout
      title="Fleet & availability"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Fleet' }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {VEHICLES.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-warm-100 p-5">
            <div className="w-full h-20 bg-warm-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
              <img src={v.image} alt={v.name} className="h-16 w-auto object-contain" />
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
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 border border-warm-200 text-forest-600 font-body text-xs font-medium py-1.5 rounded-full hover:bg-warm-50 transition-all duration-200">
              <Edit className="w-3 h-3" /> Edit
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-warm-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body text-sm font-semibold text-forest-600">Availability calendar</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => { setPopover(null); setMonthOffset(monthOffset - 1); }} className="p-1.5 hover:bg-warm-50 rounded-full transition-all duration-200"><ChevronLeft className="w-4 h-4 text-warm-500" /></button>
            <span className="font-body text-sm font-medium text-forest-600 min-w-[140px] text-center">{monthName}</span>
            <button onClick={() => { setPopover(null); setMonthOffset(monthOffset + 1); }} className="p-1.5 hover:bg-warm-50 rounded-full transition-all duration-200"><ChevronRight className="w-4 h-4 text-warm-500" /></button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4 font-body text-xs text-warm-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-200" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-200" /> Partial</span>
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
                    const dayData = calData[v.id]?.[d + 1];
                    const status = dayData?.status || 'available';
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
                        {isPopover && dayData && (
                          <div
                            ref={popoverRef}
                            className="absolute z-30 w-[280px] bg-white rounded-xl shadow-lg border border-warm-100"
                            style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' }}
                          >
                            {/* Pointer arrow */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-warm-100 rotate-45" />

                            <div className="relative p-4">
                              {/* Header */}
                              <div className="mb-3 pb-2 border-b border-warm-50">
                                <p className="font-body text-sm font-semibold text-forest-600">
                                  {v.name}, {buildDateString(d + 1)}
                                </p>
                                <p className={cn(
                                  'font-body text-xs mt-0.5',
                                  status === 'available' ? 'text-emerald-600' :
                                  status === 'partial' ? 'text-amber-600' :
                                  'text-red-600'
                                )}>
                                  {dayData.bookedCount} of {v.count} in use
                                </p>
                              </div>

                              {/* Booking list or empty state */}
                              {dayData.bookings.length > 0 ? (
                                <div className="space-y-2">
                                  {dayData.bookings.map((bk, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-warm-50 rounded-lg p-2.5">
                                      <div className="flex-1 min-w-0">
                                        <a
                                          href={`/admin/bookings/${bk.refCode}`}
                                          className="font-body text-xs font-semibold text-forest-600 hover:text-forest-500 underline decoration-forest-200 hover:decoration-forest-400 transition-colors"
                                          onClick={e => e.stopPropagation()}
                                        >
                                          {bk.refCode}
                                        </a>
                                        <p className="font-body text-[11px] text-warm-600 mt-0.5">{bk.customer}</p>
                                        <p className="font-body text-[10px] text-warm-400">{bk.tour}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="font-body text-xs text-emerald-600 py-2">
                                  No bookings {'\u2014'} all {v.count} {v.name.toLowerCase()}{v.count > 1 ? 's' : ''} available
                                </p>
                              )}
                            </div>
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
