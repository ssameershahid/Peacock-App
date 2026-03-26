import { useState } from 'react';
import { Link } from 'wouter';
import { useAdminCYO } from '@/hooks/use-app-data';
import { cn } from '@/lib/utils';
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

export default function AdminCYO() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const { data: requests } = useAdminCYO();

  const getByStatus = (status: string) =>
    (requests || []).filter(r => r.status === status);

  return (
    <AdminLayout
      title="Custom tour requests"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Custom Requests' }]}
      actions={
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
      }
    >
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
                    {items.map(req => (
                      <Link key={req.id} href={`/admin/requests/${req.id}`}>
                        <div className="bg-white rounded-xl p-4 border border-warm-100 cursor-pointer hover:bg-warm-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-body text-[10px] font-bold text-warm-400">{req.id}</span>
                            <span className="font-body text-[10px] text-warm-400">{new Date(req.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          <p className="font-body text-sm font-medium text-forest-600 mb-1">{req.customer}</p>
                          <p className="font-body text-xs text-warm-500 mb-2">
                            {req.locations.slice(0, 3).join(', ')}
                            {req.locations.length > 3 && ` +${req.locations.length - 3} more`}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="font-body text-[10px] text-warm-400">{req.dates}</span>
                            <span className="bg-warm-50 text-warm-600 font-body text-[10px] px-2 py-0.5 rounded-pill">{req.vehiclePreference}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-6">
                        <p className="font-body text-xs text-warm-400">No requests</p>
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
                  {['ID', 'Customer', 'Destinations', 'Dates', 'Vehicle', 'Status', 'Submitted'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-warm-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {(requests || []).map(req => (
                  <tr key={req.id} className="hover:bg-warm-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/requests/${req.id}`}>
                    <td className="px-4 py-3 font-body text-sm font-medium text-forest-600">{req.id}</td>
                    <td className="px-4 py-3 font-body text-sm text-warm-600">{req.customer}</td>
                    <td className="px-4 py-3 font-body text-sm text-warm-500">{req.locations.slice(0, 2).join(', ')}{req.locations.length > 2 && '...'}</td>
                    <td className="px-4 py-3 font-body text-sm text-warm-500">{req.dates}</td>
                    <td className="px-4 py-3"><span className="bg-warm-50 text-warm-600 font-body text-[10px] px-2 py-0.5 rounded-pill">{req.vehiclePreference}</span></td>
                    <td className="px-4 py-3">
                      <span className={cn('font-body text-[10px] font-medium px-2 py-0.5 rounded-pill',
                        req.status === 'New' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'Quoted' ? 'bg-purple-100 text-purple-700' :
                        req.status === 'Abandoned' ? 'bg-warm-100 text-warm-500' :
                        'bg-amber-100 text-amber-700'
                      )}>{req.status}</span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-warm-400">{new Date(req.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
