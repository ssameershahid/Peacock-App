import { Link } from 'wouter';
import {
  Calendar,
  DollarSign,
  MessageSquare,
  Users,
  ArrowRight,
  Navigation,
  Truck,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  useUserBookings,
  useAdminCYO,
  useAdminToday,
  useAdminAttention,
  useAdminStats,
} from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import AdminLayout from './AdminLayout';

/* ── Icon mapping for attention items ─────────────────────────────────────── */

const ATTENTION_ICONS: Record<string, typeof AlertTriangle> = {
  booking: Calendar,
  bookings: Calendar,
  driver: UserCheck,
  drivers: UserCheck,
  vehicle: Truck,
  vehicles: Truck,
  document: FileText,
  documents: FileText,
  custom: MessageSquare,
  customRequests: MessageSquare,
};

const ATTENTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-l-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-l-amber-400' },
  low: { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-l-amber-300' },
};

function getAttentionSeverity(item: { urgentCount?: number; count?: number }): string {
  if (item.urgentCount && item.urgentCount > 0) return 'high';
  if (item.count && item.count > 3) return 'medium';
  return 'low';
}

/* ── Main component ───────────────────────────────────────────────────────── */

export default function AdminHome() {
  const { data: bookings } = useUserBookings();
  const { data: cyoRequests } = useAdminCYO();
  const { data: todayData } = useAdminToday();
  const { data: attentionData } = useAdminAttention();
  const { data: statsData } = useAdminStats();
  const { format } = useCurrency();

  const allBookings = bookings || [];
  const pendingCYO = cyoRequests?.filter((r: any) => r.status === 'New') || [];

  /* Derive KPI values — prefer stats API, fall back to local computation */
  const totalRevenue = statsData?.totalRevenue ?? allBookings.reduce((s, b) => s + b.price, 0);
  const totalBookings = statsData?.totalBookings ?? allBookings.length;
  const activeDrivers = statsData?.activeDrivers ?? 0;
  const revenueTrend = statsData?.revenueTrend ?? null;

  /* Recent bookings table */
  const recentBookings = [...allBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  /* Revenue chart data from stats API */
  const revenueByMonth = statsData?.revenueByMonth ?? [];

  /* Today's operations */
  const tripsInProgress = todayData?.tripsInProgress ?? 0;
  const pickupsToday = todayData?.pickupsToday ?? [];
  const transfersToday = todayData?.transfersToday ?? [];
  const needsAttentionCount = todayData?.needsAttentionCount ?? 0;

  /* Attention items */
  const attentionItems = attentionData?.items ?? [];

  const todayString = formatDate(new Date(), 'long');

  return (
    <AdminLayout title="Dashboard">
      {/* ── Today's Operations ──────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg text-forest-600">Today&apos;s operations</h2>
          <span className="font-body text-xs text-warm-400">{todayString}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <TodayCard
            icon={<Navigation className="w-4 h-4" />}
            label="Trips in progress"
            value={tripsInProgress}
            accent="forest"
          />
          <TodayCard
            icon={<Clock className="w-4 h-4" />}
            label="Pickups today"
            value={Array.isArray(pickupsToday) ? pickupsToday.length : 0}
            accent="forest"
          />
          <TodayCard
            icon={<Truck className="w-4 h-4" />}
            label="Transfers today"
            value={Array.isArray(transfersToday) ? transfersToday.length : 0}
            accent="forest"
          />
          <TodayCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Needs attention"
            value={needsAttentionCount}
            accent={needsAttentionCount > 0 ? 'amber' : 'forest'}
          />
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={<Calendar className="w-5 h-5" />}
          label="Bookings this month"
          value={String(totalBookings)}
        />
        <KPICard
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          label="Revenue"
          value={format(totalRevenue)}
          trend={
            revenueTrend != null
              ? { value: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`, positive: revenueTrend >= 0 }
              : undefined
          }
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
          value={String(activeDrivers)}
        />
      </div>

      {/* ── Needs Attention ────────────────────────────────────────────── */}
      {attentionItems.length > 0 && (
        <div className="bg-white rounded-xl border border-warm-100 p-6 mb-8">
          <h3 className="font-display text-lg text-forest-600 mb-4">Needs attention</h3>
          <div className="space-y-3">
            {attentionItems.map((item: any, i: number) => {
              const severity = getAttentionSeverity(item);
              const colors = ATTENTION_COLORS[severity] ?? ATTENTION_COLORS.low;
              const Icon = ATTENTION_ICONS[item.type] ?? AlertTriangle;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border-l-[3px] px-4 py-3 transition-colors',
                    colors.border,
                    colors.bg,
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                      severity === 'high' ? 'bg-red-100' : 'bg-amber-100',
                    )}
                  >
                    <Icon className={cn('w-4 h-4', colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-warm-900">{item.title}</p>
                    <p className="font-body text-xs text-warm-500 mt-0.5">{item.description}</p>
                  </div>
                  {item.link && (
                    <Link
                      href={item.link}
                      className={cn(
                        'font-body text-xs font-medium flex items-center gap-1 shrink-0 hover:underline',
                        colors.text,
                      )}
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Revenue Chart ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-warm-100 p-6 mb-8">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-display text-lg text-forest-600">
              Monthly revenue {'\u2014'} last 6 months
            </h3>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="font-display text-3xl text-warm-900">
                {format(totalRevenue)}
              </span>
              {revenueTrend != null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-body font-medium',
                    revenueTrend >= 0
                      ? 'bg-[#E8F5E9] text-[#2D7A4F]'
                      : 'bg-[#FDECEA] text-[#C4382A]',
                  )}
                >
                  {revenueTrend >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {revenueTrend >= 0 ? '+' : ''}{revenueTrend}% vs last period
                </span>
              )}
            </div>
          </div>
        </div>

        {revenueByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByMonth} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DF" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#8A8782' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#8A8782' }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={(v: number) => format(v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E8E5DF',
                  fontSize: 13,
                  fontFamily: 'DM Sans',
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    tours: 'Tours',
                    transfers: 'Transfers',
                    custom: 'Custom',
                  };
                  return [format(value), labels[name] ?? name];
                }}
              />
              <Legend
                wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12, paddingTop: 12 }}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    tours: 'Tours',
                    transfers: 'Transfers',
                    custom: 'Custom',
                  };
                  return labels[value] ?? value;
                }}
              />
              <Bar dataKey="tours" stackId="revenue" fill="#1B3C34" radius={[0, 0, 0, 0]} name="tours" />
              <Bar dataKey="transfers" stackId="revenue" fill="#2D7A4F" radius={[0, 0, 0, 0]} name="transfers" />
              <Bar dataKey="custom" stackId="revenue" fill="#E8A825" radius={[4, 4, 0, 0]} name="custom" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px] flex items-center justify-center">
            <p className="font-body text-sm text-warm-400">No revenue data available</p>
          </div>
        )}
      </div>

      {/* ── Pending CYO banner ─────────────────────────────────────────── */}
      {pendingCYO.length > 0 && (
        <Link href="/admin/requests">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between mb-8 cursor-pointer hover:bg-amber-100 transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-amber-200" />
              <p className="font-body text-sm font-medium text-amber-800">
                {pendingCYO.length} custom tour request
                {pendingCYO.length > 1 ? 's' : ''} need
                {pendingCYO.length === 1 ? 's' : ''} your attention
              </p>
            </div>
            <span className="font-body text-sm text-amber-600 font-medium flex items-center gap-1">
              View requests <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      )}

      {/* ── Recent Bookings Table ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-warm-100 overflow-hidden">
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <h3 className="font-display text-lg text-forest-600">Recent bookings</h3>
          <Link
            href="/admin/bookings"
            className="font-body text-sm text-forest-500 hover:text-amber-200 transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-warm-50 border-b border-warm-100">
                {['Reference', 'Customer', 'Type', 'Tour/Route', 'Date', 'Status', 'Amount'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-body text-xs font-semibold text-warm-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-50">
              {recentBookings.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-warm-50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/admin/bookings/${b.id}`)}
                >
                  <td className="px-4 py-3 font-body text-sm font-medium text-forest-600">
                    {b.referenceCode ?? b.id}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-warm-600">
                    {b.customer.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'font-body text-[10px] font-medium px-2 py-0.5 rounded-pill',
                        b.type === 'tour'
                          ? 'bg-forest-50 text-forest-600'
                          : b.type === 'transfer'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600',
                      )}
                    >
                      {b.type === 'tour' ? 'Tour' : b.type === 'transfer' ? 'Transfer' : 'Custom'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-warm-600">{b.title}</td>
                  <td className="px-4 py-3 font-body text-sm text-warm-500">
                    {formatDate(b.startDate, 'short')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 font-body text-sm font-medium text-forest-600">
                    {format(b.price)}
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-body text-sm text-warm-400">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ── Today's Operations Card ──────────────────────────────────────────────── */

function TodayCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: 'forest' | 'amber';
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-warm-100 px-4 py-3.5',
        accent === 'amber' && value > 0 && 'ring-1 ring-amber-200',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            accent === 'amber' && value > 0
              ? 'bg-amber-50 text-amber-500'
              : 'bg-forest-50 text-forest-500',
          )}
        >
          {icon}
        </div>
      </div>
      <p className="font-body text-xs text-warm-400 mb-0.5">{label}</p>
      <p
        className={cn(
          'font-display text-2xl',
          accent === 'amber' && value > 0 ? 'text-amber-500' : 'text-warm-900',
        )}
      >
        {value}
      </p>
    </div>
  );
}
