import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Download, Search, ChevronDown, Check, X, Calendar } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { useAdminBookings, useAdminDrivers, useUpdateBooking } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/date-utils';
import AdminLayout from './AdminLayout';

/* ── Inline driver assignment dropdown ───────────────────────────────────── */

function DriverAssignDropdown({
  bookingId,
  vehicleType,
  onClose,
}: {
  bookingId: string;
  vehicleType: string;
  onClose: () => void;
}) {
  const { data: drivers } = useAdminDrivers();
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [confirmDriver, setConfirmDriver] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const filteredDrivers = useMemo(() => {
    const list = (drivers || []).map((d: any) => ({
      ...d,
      fullName: [d.user?.firstName, d.user?.lastName].filter(Boolean).join(' ') || 'Driver',
      initials: [d.user?.firstName?.[0], d.user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'D',
      vehicleLabel: d.vehicles?.[0]?.vehicleType || d.vehicleType || '',
      isAvailable: d.available !== false,
    }));

    const vt = vehicleType?.toLowerCase() || '';
    const matched = vt
      ? list.filter((d: any) => {
          const dv = (d.vehicleLabel || '').toLowerCase();
          return !dv || dv.includes(vt) || vt.includes(dv);
        })
      : list;

    if (!search) return matched;
    const q = search.toLowerCase();
    return matched.filter((d: any) => d.fullName.toLowerCase().includes(q));
  }, [drivers, vehicleType, search]);

  const handleAssign = async (driver: any) => {
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        data: { driverId: driver.id, status: 'CONFIRMED' },
      });
      toast({ title: 'Driver assigned', description: `${driver.fullName} assigned and booking confirmed.` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <div
        ref={ref}
        className="absolute top-full left-0 mt-1 w-[280px] bg-white rounded-xl border border-warm-200 shadow-lg z-50 overflow-hidden"
      >
        <div className="p-2 border-b border-warm-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search drivers..."
              autoFocus
              className="w-full pl-8 pr-3 py-2 bg-warm-50 border border-warm-200 rounded-lg font-body text-xs focus:ring-2 focus:ring-forest-500 outline-none"
            />
          </div>
        </div>
        <div className="max-h-[220px] overflow-y-auto">
          {filteredDrivers.length === 0 && (
            <p className="px-3 py-4 text-center font-body text-xs text-warm-400">No matching drivers</p>
          )}
          {filteredDrivers.map((d: any) => (
            <button
              key={d.id}
              onClick={() => setConfirmDriver(d)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-warm-50 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-[10px] font-bold shrink-0">
                {d.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs font-medium text-forest-600 truncate">{d.fullName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {d.vehicleLabel && (
                    <span className="font-body text-[10px] text-warm-400 bg-warm-50 px-1.5 py-0.5 rounded">
                      {d.vehicleLabel}
                    </span>
                  )}
                  <span className={`w-1.5 h-1.5 rounded-full ${d.isAvailable ? 'bg-emerald-400' : 'bg-warm-300'}`} />
                  <span className="font-body text-[10px] text-warm-400">
                    {d.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation modal */}
      <Modal
        open={!!confirmDriver}
        onClose={() => setConfirmDriver(null)}
        title="Assign Driver"
        confirmLabel={updateBooking.isPending ? 'Assigning...' : 'Assign & Confirm'}
        onConfirm={() => confirmDriver && handleAssign(confirmDriver)}
      >
        {confirmDriver && (
          <div className="space-y-3">
            <p className="font-body text-sm text-warm-600">
              Assign <span className="font-semibold text-forest-600">{confirmDriver.fullName}</span> to this booking?
            </p>
            <p className="font-body text-xs text-warm-400">
              The booking status will be set to Confirmed and the driver will be notified.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ── Date range filter presets ───────────────────────────────────────────── */

function getDatePreset(preset: string): { from: string; to: string } {
  const today = new Date();
  const yyyy = (d: Date) => d.toISOString().split('T')[0];

  switch (preset) {
    case 'this-week': {
      const day = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((day + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { from: yyyy(monday), to: yyyy(sunday) };
    }
    case 'this-month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: yyyy(first), to: yyyy(last) };
    }
    case 'next-30': {
      const end = new Date(today);
      end.setDate(today.getDate() + 30);
      return { from: yyyy(today), to: yyyy(end) };
    }
    default:
      return { from: '', to: '' };
  }
}

/* ── Main component ──────────────────────────────────────────────────────── */

export default function AdminBookings() {
  const { data: bookings } = useAdminBookings();
  const { format } = useCurrency();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [assigningBookingId, setAssigningBookingId] = useState<string | null>(null);

  const tableData = useMemo(() => {
    let list = (bookings || []).map((b: any) => ({
      ...b,
      customerName: b.customer?.name || 'Guest',
      driverName: b.driver?.name || 'Unassigned',
      typeLabel: b.type === 'tour' ? 'Tour' : b.type === 'transfer' ? 'Transfer' : 'Custom',
      dateLabel: b.startDate ? formatDate(b.startDate) : '',
      amount: b.price,
    }));

    // Apply date range filter
    if (dateFrom || dateTo) {
      list = list.filter((b: any) => {
        if (!b.startDate) return true;
        const d = b.startDate;
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
        return true;
      });
    }

    return list.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bookings, dateFrom, dateTo]);

  const handlePreset = (preset: string) => {
    if (preset === 'clear') {
      setDateFrom('');
      setDateTo('');
      return;
    }
    const { from, to } = getDatePreset(preset);
    setDateFrom(from);
    setDateTo(to);
  };

  return (
    <AdminLayout
      title="Bookings"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Bookings' }]}
      actions={
        <button className="flex items-center gap-2 bg-white border border-warm-200 text-forest-600 font-body text-sm font-medium px-5 py-2.5 rounded-full hover:bg-warm-50 transition-all duration-200">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      }
    >
      {/* Date range filter bar */}
      <div className="bg-white rounded-xl border border-warm-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-warm-500">
            <Calendar className="w-4 h-4" />
            <span className="font-body text-xs font-medium text-warm-500">Date range</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg font-body text-xs focus:ring-2 focus:ring-forest-500 outline-none"
              placeholder="From"
            />
            <span className="font-body text-xs text-warm-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg font-body text-xs focus:ring-2 focus:ring-forest-500 outline-none"
              placeholder="To"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'this-week', label: 'This week' },
              { key: 'this-month', label: 'This month' },
              { key: 'next-30', label: 'Next 30 days' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key)}
                className="px-2.5 py-1.5 font-body text-[11px] font-medium text-forest-600 bg-forest-50 hover:bg-forest-100 rounded-full transition-colors"
              >
                {p.label}
              </button>
            ))}
            {(dateFrom || dateTo) && (
              <button
                onClick={() => handlePreset('clear')}
                className="px-2.5 py-1.5 font-body text-[11px] font-medium text-warm-500 bg-warm-100 hover:bg-warm-200 rounded-full transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'referenceCode',
            label: 'Reference',
            sortable: true,
            render: (row: any) => (
              <Link href={`/admin/bookings/${row.id}`}>
                <span className="font-medium text-forest-600 hover:text-amber-200 cursor-pointer">
                  {row.referenceCode || row.id}
                </span>
              </Link>
            ),
          },
          { key: 'customerName', label: 'Customer', sortable: true },
          {
            key: 'typeLabel',
            label: 'Type',
            render: (row: any) => (
              <span
                className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  row.type === 'tour'
                    ? 'bg-forest-50 text-forest-600'
                    : row.type === 'transfer'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                {row.typeLabel}
              </span>
            ),
          },
          { key: 'title', label: 'Tour/Route', sortable: true },
          { key: 'dateLabel', label: 'Dates', sortable: true },
          { key: 'vehicle', label: 'Vehicle' },
          {
            key: 'driverName',
            label: 'Driver',
            render: (row: any) => {
              if (row.driverName !== 'Unassigned') {
                return <span>{row.driverName}</span>;
              }
              return (
                <div className="relative">
                  <button
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAssigningBookingId(assigningBookingId === row.id ? null : row.id);
                    }}
                    className="text-amber-200 font-medium hover:text-amber-300 underline underline-offset-2 decoration-dashed cursor-pointer transition-colors"
                  >
                    Unassigned
                  </button>
                  {assigningBookingId === row.id && (
                    <DriverAssignDropdown
                      bookingId={row.id}
                      vehicleType={row.vehicle || row.vehicleType || ''}
                      onClose={() => setAssigningBookingId(null)}
                    />
                  )}
                </div>
              );
            },
          },
          {
            key: 'status',
            label: 'Status',
            render: (row: any) => <StatusBadge status={row.status} />,
          },
          {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (row: any) => (
              <span className="font-medium text-forest-600">{format(row.amount)}</span>
            ),
          },
        ]}
        data={tableData}
        filters={[
          {
            key: 'typeLabel',
            label: 'All types',
            options: [
              { value: 'Tour', label: 'Tour' },
              { value: 'Transfer', label: 'Transfer' },
              { value: 'Custom', label: 'Custom' },
            ],
          },
          {
            key: 'status',
            label: 'All statuses',
            options: [
              { value: 'Upcoming', label: 'Confirmed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ],
          },
        ]}
        searchPlaceholder="Search by reference or customer..."
      />
    </AdminLayout>
  );
}
