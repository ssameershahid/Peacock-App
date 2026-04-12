import { useState } from 'react';
import { Link } from 'wouter';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useTourGroups } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import AdminLayout from './AdminLayout';

const DURATIONS = [5, 7, 10, 14];

export default function AdminTours() {
  const { data: groups, isLoading } = useTourGroups();
  const { format } = useCurrency();
  const [search, setSearch] = useState('');

  const filtered = (groups || []).filter((g: any) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.regions?.some((r: string) => r.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout
      title="Tours"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Tours' }]}
      actions={
        <Link href="/admin/tours/new">
          <button className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200">
            <Plus className="w-4 h-4" /> Create new tour
          </button>
        </Link>
      }
    >
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tours..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-warm-200 rounded-xl font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none bg-white"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-warm-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((group: any) => (
            <TourGroupRow key={group.groupId} group={group} format={format} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 font-body text-warm-400">No tours found.</div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

function TourGroupRow({ group, format }: { group: any; format: (n: number) => string }) {
  const [expanded, setExpanded] = useState(false);

  // Min price across all variants (car rate)
  const minPrice = Math.min(
    ...group.variants.flatMap((v: any) =>
      v.vehicleRates
        .filter((r: any) => r.vehicleType === 'car')
        .map((r: any) => r.pricePerDay)
    ).filter((p: number) => p > 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-warm-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {expanded ? <ChevronDown className="w-4 h-4 text-warm-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-warm-400 shrink-0" />}
            <span className="font-display text-lg text-forest-600">{group.name}</span>
            <span className="bg-forest-50 text-forest-600 font-body text-[10px] font-medium px-2 py-0.5 rounded-pill">Ready-made</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1 ml-7">
            {group.regions?.map((r: string) => (
              <span key={r} className="bg-warm-50 text-warm-500 font-body text-[10px] px-2 py-0.5 rounded-pill">{r}</span>
            ))}
          </div>
        </div>

        {/* Duration pills */}
        <div className="flex gap-1.5 shrink-0">
          {DURATIONS.map(d => {
            const variant = group.variants.find((v: any) => v.durationDays === d);
            return (
              <Link
                key={d}
                href={variant ? `/admin/tours/${variant.id}/edit` : '#'}
                onClick={e => e.stopPropagation()}
              >
                <span className={`inline-flex items-center px-3 py-1 rounded-full font-body text-xs font-medium border transition-all ${
                  variant
                    ? 'bg-white border-forest-300 text-forest-600 hover:bg-forest-50 hover:border-forest-500 cursor-pointer'
                    : 'bg-warm-50 border-warm-200 text-warm-300 cursor-not-allowed'
                }`}>
                  {d}d
                </span>
              </Link>
            );
          })}
        </div>

        <div className="text-right shrink-0 ml-4">
          <p className="font-body text-xs text-warm-400">From</p>
          <p className="font-body text-sm font-semibold text-forest-600">{isFinite(minPrice) ? `${format(minPrice)}/day` : '—'}</p>
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          <div className="w-8 h-5 bg-emerald-500 rounded-full relative">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
          <span className="font-body text-xs text-emerald-600">Active</span>
        </div>
      </button>

      {/* Expanded variant rows */}
      {expanded && (
        <div className="border-t border-warm-100 divide-y divide-warm-50">
          {DURATIONS.map(d => {
            const variant = group.variants.find((v: any) => v.durationDays === d);
            if (!variant) return null;
            const carRate = variant.vehicleRates.find((r: any) => r.vehicleType === 'car')?.pricePerDay ?? 0;
            return (
              <div key={d} className="flex items-center gap-4 px-6 py-3 bg-warm-50/50">
                <div className="w-10 h-10 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center shrink-0">
                  <span className="font-body text-xs font-bold text-forest-600">{d}d</span>
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-forest-600">{d} Days / {d - 1} Nights</p>
                  <p className="font-body text-xs text-warm-400">{variant.slug}</p>
                </div>
                <div className="text-right">
                  <p className="font-body text-xs text-warm-400">Car rate</p>
                  <p className="font-body text-sm font-medium text-forest-600">{carRate > 0 ? `${format(carRate)}/day` : '—'}</p>
                </div>
                <Link href={`/admin/tours/${variant.id}/edit`}>
                  <button className="font-body text-xs text-forest-500 hover:text-amber-500 font-medium transition-colors px-3 py-1.5 rounded-lg border border-warm-200 hover:border-amber-300 bg-white">
                    Edit itinerary →
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
