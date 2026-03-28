import { useParams, Link } from 'wouter';
import { Mail, Phone, MapPin, Calendar, Star, Award, TrendingUp } from 'lucide-react';
import { useAdminCustomer } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import AdminLayout from './AdminLayout';
import { formatDate } from '@/lib/date-utils';

/* ── Country flag helper ───────────────────────────────────────────────────── */

function countryFlag(countryCode: string): string {
  if (!countryCode) return '';
  const code = countryCode.toUpperCase().trim();
  if (code.length === 2) {
    return String.fromCodePoint(
      ...code.split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  }
  const NAME_MAP: Record<string, string> = {
    'UNITED KINGDOM': 'GB', 'UK': 'GB', 'ENGLAND': 'GB', 'SCOTLAND': 'GB',
    'UNITED STATES': 'US', 'USA': 'US', 'AMERICA': 'US',
    'FRANCE': 'FR', 'GERMANY': 'DE', 'ITALY': 'IT', 'SPAIN': 'ES',
    'CANADA': 'CA', 'AUSTRALIA': 'AU', 'JAPAN': 'JP', 'CHINA': 'CN',
    'INDIA': 'IN', 'BRAZIL': 'BR', 'MEXICO': 'MX', 'SOUTH KOREA': 'KR',
    'NETHERLANDS': 'NL', 'SWITZERLAND': 'CH', 'SWEDEN': 'SE', 'NORWAY': 'NO',
    'DENMARK': 'DK', 'FINLAND': 'FI', 'IRELAND': 'IE', 'PORTUGAL': 'PT',
    'AUSTRIA': 'AT', 'BELGIUM': 'BE', 'NEW ZEALAND': 'NZ', 'SINGAPORE': 'SG',
    'SRI LANKA': 'LK', 'SOUTH AFRICA': 'ZA', 'THAILAND': 'TH', 'TURKEY': 'TR',
    'POLAND': 'PL', 'CZECH REPUBLIC': 'CZ', 'GREECE': 'GR', 'RUSSIA': 'RU',
    'UAE': 'AE', 'UNITED ARAB EMIRATES': 'AE', 'SAUDI ARABIA': 'SA',
  };
  const mapped = NAME_MAP[code];
  if (mapped) {
    return String.fromCodePoint(
      ...mapped.split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  }
  return '';
}

export default function AdminCustomerDetail() {
  const params = useParams<{ id: string }>();
  const customerId = params?.id || '';
  const { data: customer } = useAdminCustomer(customerId);
  const { format } = useCurrency();

  /* ── Loading state ─────────────────────────────────────────────────────── */

  if (!customer) {
    return (
      <AdminLayout
        title="Customer"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Customers', href: '/admin/customers' },
          { label: customerId },
        ]}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  /* ── Derived data ──────────────────────────────────────────────────────── */

  const stats = customer.stats || {};
  const bookings = customer.bookings || [];
  const cyoRequests = customer.cyoRequests || [];
  const initials = customer.name
    ? customer.name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  /* ── Badges ────────────────────────────────────────────────────────────── */

  const badges: { label: string; color: string }[] = [];
  if ((stats.totalBookings ?? 0) >= 5 || (stats.totalSpend ?? 0) >= 2000) {
    badges.push({ label: 'VIP', color: 'bg-amber-100 text-amber-700' });
  } else if ((stats.totalBookings ?? 0) >= 2) {
    badges.push({ label: 'Repeat customer', color: 'bg-[#E6F1FB] text-[#2A6B8C]' });
  }
  if ((stats.averageBookingValue ?? 0) > 500) {
    badges.push({ label: 'High value', color: 'bg-[#EEEDFE] text-[#534AB7]' });
  }

  return (
    <AdminLayout
      title={customer.name || 'Customer'}
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Customers', href: '/admin/customers' },
        { label: customer.name || customerId },
      ]}
    >
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (2/3) ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer info card */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-lg font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl text-forest-600">{customer.name}</h2>
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="font-body text-sm text-forest-500 hover:text-amber-200 flex items-center gap-1.5 mt-1 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> {customer.email}
                  </a>
                )}
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="font-body text-sm text-warm-500 hover:text-forest-500 flex items-center gap-1.5 mt-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> {customer.phone}
                  </a>
                )}
                {customer.country && (
                  <p className="font-body text-sm text-warm-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {countryFlag(customer.country)} {customer.country}
                  </p>
                )}
                {customer.memberSince && (
                  <p className="font-body text-xs text-warm-400 mt-2">
                    Customer since {formatDate(customer.memberSince)}
                  </p>
                )}
              </div>
              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {badges.map(b => (
                    <span
                      key={b.label}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-body font-medium ${b.color}`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking history */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Booking history</h2>
            {bookings.length === 0 ? (
              <p className="font-body text-sm text-warm-400">No bookings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-100">
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Ref
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Type
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Tour
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Dates
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Status
                      </th>
                      <th className="text-right font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b: any, idx: number) => (
                      <tr key={b.referenceCode || idx} className="border-b border-warm-50 last:border-0">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/bookings/${b.id || b.referenceCode}`}
                            className="font-body text-sm text-forest-500 hover:text-amber-200 font-medium transition-colors"
                          >
                            {b.referenceCode}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 font-body text-xs text-warm-500 capitalize">
                          {b.type || '--'}
                        </td>
                        <td className="py-3 pr-4 font-body text-sm text-forest-600">
                          {b.tourName || '--'}
                        </td>
                        <td className="py-3 pr-4 font-body text-xs text-warm-500">
                          {b.startDate ? formatDate(b.startDate, 'short') : '--'}
                          {b.endDate ? ` - ${formatDate(b.endDate, 'short')}` : ''}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={b.status || 'pending'} />
                        </td>
                        <td className="py-3 text-right font-body text-sm font-semibold text-forest-600">
                          {format(b.totalGBP ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CYO request history */}
          {cyoRequests.length > 0 && (
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">
                Custom tour requests
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-warm-100">
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        ID
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Destination
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Dates
                      </th>
                      <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3 pr-4">
                        Status
                      </th>
                      <th className="text-right font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider pb-3">
                        Quote
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cyoRequests.map((r: any, idx: number) => (
                      <tr key={r.id || idx} className="border-b border-warm-50 last:border-0">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/requests/${r.id}`}
                            className="font-body text-sm text-forest-500 hover:text-amber-200 font-medium transition-colors"
                          >
                            {r.id}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 font-body text-sm text-forest-600">
                          {r.destination || r.title || '--'}
                        </td>
                        <td className="py-3 pr-4 font-body text-xs text-warm-500">
                          {r.startDate ? formatDate(r.startDate, 'short') : '--'}
                          {r.endDate ? ` - ${formatDate(r.endDate, 'short')}` : ''}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={r.status || 'pending'} />
                        </td>
                        <td className="py-3 text-right font-body text-sm font-semibold text-forest-600">
                          {r.quoteTotal ? format(r.quoteTotal) : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar (1/3) ──────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Summary metrics */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Total bookings
                </span>
                <span className="font-body text-sm font-semibold text-forest-600">
                  {stats.totalBookings ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Total spend
                </span>
                <span className="font-body text-sm font-semibold text-forest-600">
                  {format(stats.totalSpend ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" /> Avg booking value
                </span>
                <span className="font-body text-sm font-semibold text-forest-600">
                  {format(stats.averageBookingValue ?? 0)}
                </span>
              </div>
              {stats.favouriteVehicle && (
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-warm-400">Favourite vehicle</span>
                  <span className="font-body text-sm text-forest-600 capitalize">
                    {stats.favouriteVehicle}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400">Last booked</span>
                <span className="font-body text-sm text-forest-600">
                  {stats.lastBooked ? formatDate(stats.lastBooked) : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Badges card */}
          {badges.length > 0 && (
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Badges</h2>
              <div className="space-y-3">
                {badges.map(b => (
                  <div key={b.label} className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        b.label === 'VIP'
                          ? 'bg-amber-100'
                          : b.label === 'High value'
                            ? 'bg-[#EEEDFE]'
                            : 'bg-[#E6F1FB]'
                      }`}
                    >
                      <Award
                        className={`w-4 h-4 ${
                          b.label === 'VIP'
                            ? 'text-amber-600'
                            : b.label === 'High value'
                              ? 'text-[#534AB7]'
                              : 'text-[#2A6B8C]'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-body text-sm text-forest-600 font-medium">{b.label}</p>
                      <p className="font-body text-[10px] text-warm-400">
                        {b.label === 'VIP'
                          ? '5+ bookings or over £2,000 spent'
                          : b.label === 'High value'
                            ? 'Average booking value over £500'
                            : '2+ completed bookings'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
