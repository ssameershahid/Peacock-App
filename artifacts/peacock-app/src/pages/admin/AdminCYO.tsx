import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useAdminCYO } from '@/hooks/use-app-data';
import { cn } from '@/lib/utils';
import { formatDate, timeAgo, getAgingStatus } from '@/lib/date-utils';
import AdminLayout from './AdminLayout';

const KANBAN_COLS = [
  { key: 'New', color: 'bg-blue-500', label: 'New' },
  { key: 'Reviewing', color: 'bg-amber-500', label: 'Reviewing' },
  { key: 'Quoted', color: 'bg-purple-500', label: 'Quoted' },
  { key: 'Awaiting Payment', color: 'bg-amber-400', label: 'Awaiting Payment' },
  { key: 'Paid', color: 'bg-emerald-500', label: 'Paid' },
  { key: 'Confirmed', color: 'bg-forest-600', label: 'Confirmed' },
  { key: 'Abandoned', color: 'bg-warm-400', label: 'Abandoned' },
];

const AGING_BORDER_COLS = new Set(['New', 'Reviewing']);

function getAgingColor(status: 'fresh' | 'warning' | 'overdue') {
  if (status === 'fresh') return 'text-emerald-600';
  if (status === 'warning') return 'text-amber-600';
  return 'text-red-600';
}

function getAgingBorder(status: 'fresh' | 'warning' | 'overdue') {
  if (status === 'warning') return 'border-l-[3px] border-l-[#E8A825]';
  if (status === 'overdue') return 'border-l-[3px] border-l-[#C4382A]';
  return '';
}

function getCardTimestamp(req: any) {
  // For non-New statuses, prefer updatedAt if available for age calculation
  const ts = req.updatedAt && req.status !== 'New' ? req.updatedAt : (req.submittedAt || req.createdAt);
  return ts;
}

export default function AdminCYO() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const { data: requests } = useAdminCYO();

  const filteredRequests = useMemo(() => {
    if (!overdueOnly) return requests || [];
    return (requests || []).filter(r => {
      const ts = getCardTimestamp(r);
      if (!ts) return false;
      const aging = getAgingStatus(ts);
      return aging === 'warning' || aging === 'overdue';
    });
  }, [requests, overdueOnly]);

  const getByStatus = (status: string) =>
    filteredRequests.filter(r => r.status === status);

  return (
    <AdminLayout
      title="Custom tour requests"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Custom Requests' }]}
      actions={
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-warm-100 rounded-xl p-1">
            {(['kanban', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-4 py-1.5 rounded-full font-body text-xs font-medium transition-all duration-200 capitalize',
                  view === v ? 'bg-white text-forest-600 shadow-sm' : 'text-warm-500 hover:text-forest-600'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {/* Overdue toggle */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={cn(
            'relative w-10 h-6 rounded-full transition-colors',
            overdueOnly ? 'bg-amber-500' : 'bg-warm-300'
          )}
        >
          <div className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all',
            overdueOnly ? 'right-0.5' : 'left-0.5'
          )} />
        </button>
        <span className="font-body text-sm text-warm-600">Show overdue only</span>
        {overdueOnly && (
          <span className="font-body text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-pill">
            Showing 24h+ items
          </span>
        )}
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {KANBAN_COLS.map(col => {
            const items = getByStatus(col.key);
            return (
              <div key={col.key} className="min-w-[260px] flex-shrink-0">
                <div className={cn('h-1.5 rounded-t-xl', col.color)} />
                <div className="bg-warm-50 rounded-b-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body text-xs font-semibold text-forest-600">{col.label}</span>
                    <span className="font-body text-[10px] text-warm-400 bg-white px-2 py-0.5 rounded-pill">{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map(req => {
                      const ts = getCardTimestamp(req);
                      const aging = ts ? getAgingStatus(ts) : 'fresh';
                      const showBorder = AGING_BORDER_COLS.has(col.key);
                      return (
                        <Link key={req.id} href={`/admin/requests/${req.id}`}>
                          <div className={cn(
                            'bg-white rounded-xl p-4 border border-warm-100 cursor-pointer hover:bg-warm-50 transition-colors',
                            showBorder && getAgingBorder(aging)
                          )}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-body text-[10px] font-bold text-warm-400">
                                {req.referenceCode || req.id}
                              </span>
                              <span className="font-body text-[10px] text-warm-400">
                                {ts ? formatDate(ts, 'short') : ''}
                              </span>
                            </div>
                            <p className="font-body text-sm font-medium text-forest-600 mb-1">{req.customer || req.customerName}</p>
                            <p className="font-body text-xs text-warm-500 mb-2">
                              {(req.locations || []).slice(0, 3).join(', ')}
                              {(req.locations || []).length > 3 && ` +${req.locations.length - 3} more`}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-body text-[10px] text-warm-400">{req.dates || req.preferredDates}</span>
                                <span className="bg-warm-50 text-warm-600 font-body text-[10px] px-2 py-0.5 rounded-pill">{req.vehiclePreference}</span>
                              </div>
                            </div>
                            {/* Aging indicator */}
                            {ts && (
                              <div className="mt-2 pt-2 border-t border-warm-50">
                                <span className={cn('font-body text-[10px]', getAgingColor(aging))}>
                                  {aging === 'overdue' && '\u26A0 '}Submitted {timeAgo(ts)}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="text-center py-6">
                        <p className="font-body text-xs text-warm-400">
                          {overdueOnly ? 'No overdue requests' : 'No requests'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-warm-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-warm-50 border-b border-warm-100">
                  {['Ref', 'Customer', 'Destinations', 'Dates', 'Vehicle', 'Status', 'Submitted', 'Age'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-warm-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {filteredRequests.map(req => {
                  const ts = getCardTimestamp(req);
                  const aging = ts ? getAgingStatus(ts) : 'fresh';
                  return (
                    <tr key={req.id} className="hover:bg-warm-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/requests/${req.id}`}>
                      <td className="px-4 py-3 font-body text-sm font-medium text-forest-600">{req.referenceCode || req.id}</td>
                      <td className="px-4 py-3 font-body text-sm text-warm-600">{req.customer || req.customerName}</td>
                      <td className="px-4 py-3 font-body text-sm text-warm-500">
                        {(req.locations || []).slice(0, 2).join(', ')}
                        {(req.locations || []).length > 2 && '...'}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-warm-500">{req.dates || req.preferredDates}</td>
                      <td className="px-4 py-3"><span className="bg-warm-50 text-warm-600 font-body text-[10px] px-2 py-0.5 rounded-pill">{req.vehiclePreference}</span></td>
                      <td className="px-4 py-3">
                        <span className={cn('font-body text-[10px] font-medium px-2 py-0.5 rounded-pill',
                          req.status === 'New' ? 'bg-blue-100 text-blue-700' :
                          req.status === 'Quoted' ? 'bg-purple-100 text-purple-700' :
                          req.status === 'Abandoned' ? 'bg-warm-100 text-warm-500' :
                          'bg-amber-100 text-amber-700'
                        )}>{req.status}</span>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-warm-400">
                        {ts ? formatDate(ts, 'short') : ''}
                      </td>
                      <td className="px-4 py-3">
                        {ts && (
                          <span className={cn('font-body text-xs', getAgingColor(aging))}>
                            {aging === 'overdue' && '\u26A0 '}{timeAgo(ts)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
