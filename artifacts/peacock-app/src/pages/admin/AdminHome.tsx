import { Link } from 'wouter';
import { Calendar, DollarSign, MessageSquare, Users, ArrowRight } from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useUserBookings, useAdminCYO } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import AdminLayout from './AdminLayout';

export default function AdminHome() {
  const { data: bookings } = useUserBookings();
  const { data: cyoRequests } = useAdminCYO();
  const { format } = useCurrency();

  const allBookings = bookings || [];
  const pendingCYO = cyoRequests?.filter(r => r.status === 'New') || [];
  const totalRevenue = allBookings.reduce((s, b) => s + b.price, 0);

  const recentBookings = [...allBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const chartData = [
    { month: 'Oct', value: 3200 },
    { month: 'Nov', value: 2800 },
    { month: 'Dec', value: 4100 },
    { month: 'Jan', value: 3600 },
    { month: 'Feb', value: 4500 },
    { month: 'Mar', value: 4280 },
  ];
  const maxChart = Math.max(...chartData.map(d => d.value));

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={<Calendar className="w-5 h-5" />}
          label="Bookings this month"
          value={String(allBookings.length)}
          trend={{ value: '+18%', positive: true }}
        />
        <KPICard
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          label="Revenue"
          value={format(totalRevenue)}
          trend={{ value: '+14%', positive: true }}
        />
        <KPICard
          icon={<MessageSquare className="w-5 h-5 text-amber-200" />}
          label="Pending requests"
          value={String(pendingCYO.length)}
          className={pendingCYO.length > 0 ? 'ring-2 ring-amber-200' : ''}
        />
        <KPICard
          icon={<Users className="w-5 h-5" />}
          label="Active drivers"
          value="8"
          trend={{ value: '+2', positive: true }}
        />
      </div>

      <div className="bg-white rounded-xl border border-warm-100 p-6 mb-8">
        <h3 className="font-display text-lg text-forest-600 mb-4">Monthly revenue {"\u2014"} last 6 months</h3>
        <div className="flex items-end gap-3 h-40">
          {chartData.map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="font-body text-[10px] text-warm-400">{format(d.value)}</span>
              <div
                className="w-full bg-forest-500 rounded-t-lg transition-all"
                style={{ height: `${(d.value / maxChart) * 100}%`, minHeight: 8 }}
              />
              <span className="font-body text-xs text-warm-500">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {pendingCYO.length > 0 && (
        <Link href="/admin/requests">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between mb-8 cursor-pointer hover:bg-amber-100 transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-amber-200" />
              <p className="font-body text-sm font-medium text-amber-800">{pendingCYO.length} custom tour request{pendingCYO.length > 1 ? 's' : ''} need{pendingCYO.length === 1 ? 's' : ''} your attention</p>
            </div>
            <span className="font-body text-sm text-amber-600 font-medium flex items-center gap-1">View requests <ArrowRight className="w-4 h-4" /></span>
          </div>
        </Link>
      )}

      <div className="bg-white rounded-xl border border-warm-100 overflow-hidden">
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <h3 className="font-display text-lg text-forest-600">Recent bookings</h3>
          <Link href="/admin/bookings" className="font-body text-sm text-forest-500 hover:text-amber-200 transition-colors">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-warm-50 border-b border-warm-100">
                {['Reference', 'Customer', 'Type', 'Tour/Route', 'Date', 'Status', 'Amount'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-warm-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-50">
              {recentBookings.map(b => (
                <tr key={b.id} className="hover:bg-warm-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/bookings/${b.id}`}>
                  <td className="px-4 py-3 font-body text-sm font-medium text-forest-600">{b.id}</td>
                  <td className="px-4 py-3 font-body text-sm text-warm-600">{b.customer.name}</td>
                  <td className="px-4 py-3">
                    <span className={cn('font-body text-[10px] font-medium px-2 py-0.5 rounded-pill', b.type === 'tour' ? 'bg-forest-50 text-forest-600' : 'bg-blue-50 text-blue-600')}>
                      {b.type === 'tour' ? 'Tour' : 'Transfer'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-warm-600">{b.title}</td>
                  <td className="px-4 py-3 font-body text-sm text-warm-500">{new Date(b.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 font-body text-sm font-medium text-forest-600">{format(b.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
