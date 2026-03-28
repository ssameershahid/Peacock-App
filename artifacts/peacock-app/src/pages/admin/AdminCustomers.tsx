import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminCustomers } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatDate } from '@/lib/date-utils';
import AdminLayout from './AdminLayout';

/* ── Country flag helper ───────────────────────────────────────────────────── */

function countryFlag(countryCode: string): string {
  if (!countryCode) return '';
  const code = countryCode.toUpperCase().trim();
  // If already a 2-letter code, convert to flag emoji
  if (code.length === 2) {
    return String.fromCodePoint(
      ...code.split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  }
  // Common country name → code mapping
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
    'ARGENTINA': 'AR', 'COLOMBIA': 'CO', 'CHILE': 'CL', 'PERU': 'PE',
    'EGYPT': 'EG', 'ISRAEL': 'IL', 'UAE': 'AE', 'UNITED ARAB EMIRATES': 'AE',
    'SAUDI ARABIA': 'SA', 'MALAYSIA': 'MY', 'INDONESIA': 'ID', 'PHILIPPINES': 'PH',
    'VIETNAM': 'VN', 'TAIWAN': 'TW', 'HONG KONG': 'HK', 'PAKISTAN': 'PK',
  };
  const mapped = NAME_MAP[code];
  if (mapped) {
    return String.fromCodePoint(
      ...mapped.split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  }
  return '';
}

/* ── Pagination constants ──────────────────────────────────────────────────── */

const PAGE_SIZE = 15;

export default function AdminCustomers() {
  const { data: customers, isLoading } = useAdminCustomers();
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [page, setPage] = useState(1);

  /* ── Derived data ──────────────────────────────────────────────────────── */

  const allCustomers = useMemo(() => {
    return [...(customers || [])].sort((a: any, b: any) => {
      const dateA = a.lastBooking ? new Date(a.lastBooking).getTime() : 0;
      const dateB = b.lastBooking ? new Date(b.lastBooking).getTime() : 0;
      return dateB - dateA;
    });
  }, [customers]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    (allCustomers || []).forEach((c: any) => {
      if (c.country) set.add(c.country);
    });
    return Array.from(set).sort();
  }, [allCustomers]);

  const filtered = useMemo(() => {
    let list = allCustomers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
      );
    }
    if (countryFilter) {
      list = list.filter((c: any) => c.country === countryFilter);
    }
    return list;
  }, [allCustomers, search, countryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Initials helper ───────────────────────────────────────────────────── */

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <AdminLayout
      title="Customers"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Customers' }]}
    >
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center bg-white rounded-full px-4 py-2.5 border border-warm-200 flex-1 focus-within:border-forest-400 focus-within:ring-1 focus-within:ring-forest-400/30 transition-all">
          <Search className="w-4 h-4 text-warm-400 mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search customers..."
            className="bg-transparent border-none outline-none font-body text-sm w-full text-forest-600 placeholder:text-warm-400"
          />
        </div>
        <select
          value={countryFilter}
          onChange={e => { setCountryFilter(e.target.value); setPage(1); }}
          className="border border-warm-200 rounded-full px-4 py-2.5 font-body text-sm bg-white text-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-300 min-w-[180px]"
        >
          <option value="">All countries</option>
          {countries.map(c => (
            <option key={c} value={c}>
              {countryFlag(c)} {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-white border border-warm-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-warm-100 p-12 text-center">
          <p className="font-body text-sm text-warm-400">No customers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-warm-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-100 bg-warm-50/50">
                  <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider px-4 py-3">
                    Name
                  </th>
                  <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider px-4 py-3">
                    Email
                  </th>
                  <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider px-4 py-3">
                    Country
                  </th>
                  <th className="text-right font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider px-4 py-3">
                    Bookings
                  </th>
                  <th className="text-right font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider px-4 py-3">
                    Total spend
                  </th>
                  <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider px-4 py-3">
                    First booking
                  </th>
                  <th className="text-left font-body text-[11px] font-semibold text-warm-400 uppercase tracking-wider px-4 py-3">
                    Last booking
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-b border-warm-50 last:border-0 hover:bg-warm-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-xs font-bold shrink-0">
                          {getInitials(c.name || '?')}
                        </div>
                        <span className="font-body text-sm font-medium text-forest-600 group-hover:text-amber-200 transition-colors">
                          {c.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-warm-500">
                      {c.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-sm text-warm-600">
                        {countryFlag(c.country)}{' '}
                        {c.country}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-body text-sm text-forest-600 font-medium">
                      {c.bookingCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right font-body text-sm text-forest-600 font-medium">
                      {format(c.totalSpend ?? 0)}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-warm-500">
                      {c.firstBooking ? formatDate(c.firstBooking) : '--'}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-warm-500">
                      {c.lastBooking ? formatDate(c.lastBooking) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-warm-100">
              <p className="font-body text-xs text-warm-400">
                Showing {(safePage - 1) * PAGE_SIZE + 1}-
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} customers
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="p-1.5 rounded-lg border border-warm-200 text-warm-500 hover:bg-warm-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg font-body text-xs font-medium transition-colors ${
                      safePage === i + 1
                        ? 'bg-forest-600 text-white'
                        : 'text-warm-500 hover:bg-warm-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="p-1.5 rounded-lg border border-warm-200 text-warm-500 hover:bg-warm-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
