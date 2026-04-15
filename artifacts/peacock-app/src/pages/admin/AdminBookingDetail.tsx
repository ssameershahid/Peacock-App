import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Mail, Phone, AlertTriangle, Download, MapPin, User, Clock } from 'lucide-react';
import {
  useBooking,
  useUpdateBooking,
  useCancelBooking,
  useAdminDrivers,
  useBookingActivities,
} from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import AdminLayout from './AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatDateTime } from '@/lib/date-utils';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

/* ── Activity timeline colour mapping ────────────────────────────────────── */

function getActivityDot(action: string) {
  const a = action?.toLowerCase() || '';
  if (a.includes('cancel') || a.includes('refund'))
    return 'bg-red-500 ring-red-100';
  if (a.includes('driver') || a.includes('assign'))
    return 'bg-blue-500 ring-blue-100';
  if (a.includes('payment') || a.includes('paid') || a.includes('invoice'))
    return 'bg-amber-500 ring-amber-100';
  // status changes, creation, default
  return 'bg-emerald-600 ring-emerald-100';
}

export default function AdminBookingDetail() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id || '';
  const { data: booking } = useBooking(bookingId);
  const { data: drivers } = useAdminDrivers();
  const { data: activities } = useBookingActivities(bookingId);
  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();
  const { format } = useCurrency();
  const { toast } = useToast();

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Initialise local state once booking loads
  useEffect(() => {
    if (booking && !selectedStatus) {
      setSelectedStatus(booking.status?.toUpperCase().replace(' ', '_') || 'PENDING');
      setSelectedDriverId(booking.driverId || '');
      setAdminNotes(booking.adminNotes || '');
    }
  }, [booking]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateStatus = async () => {
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        data: { status: selectedStatus as any, driverNotes: adminNotes },
      });
      toast({ title: 'Booking updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) return;
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        data: { driverId: selectedDriverId, status: 'CONFIRMED' as any },
      });
      toast({ title: 'Driver assigned and booking confirmed' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync({ id: bookingId, reason: cancelReason });
      setShowCancel(false);
      toast({ title: 'Booking cancelled' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  /* ── Loading state ─────────────────────────────────────────────────────── */

  if (!booking) {
    return (
      <AdminLayout
        title="Booking"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Bookings', href: '/admin/bookings' },
          { label: bookingId },
        ]}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  /* ── Derived data ──────────────────────────────────────────────────────── */

  const customer = booking.customer;
  const pricing = booking.pricing || booking.pricingBreakdown || null;
  const addOns = booking.addOns || pricing?.addOns || [];
  const sortedActivities = [...(activities || [])].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const customerInitials = customer?.name
    ? customer.name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'G';

  return (
    <AdminLayout
      title={booking.referenceCode || booking.id}
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Bookings', href: '/admin/bookings' },
        { label: booking.referenceCode || booking.id },
      ]}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 mb-6">
        <StatusBadge status={booking.status} />
        {booking.createdAt && (
          <span className="font-body text-sm text-warm-400">
            Created {formatDate(booking.createdAt)}
          </span>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (2/3) ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer card */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Customer</h2>
            {customer && customer.name && customer.name !== 'Guest' ? (
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-body text-sm font-bold shrink-0">
                    {customerInitials}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-forest-600 text-lg">{customer.name}</p>
                    {customer.email && (
                      <a
                        href={`mailto:${customer.email}`}
                        className="font-body text-sm text-forest-500 hover:text-amber-200 flex items-center gap-1.5 mt-1"
                      >
                        <Mail className="w-3.5 h-3.5" /> {customer.email}
                      </a>
                    )}
                    {customer.phone && (
                      <a
                        href={`tel:${customer.phone}`}
                        className="font-body text-sm text-warm-500 hover:text-forest-500 flex items-center gap-1.5 mt-1"
                      >
                        <Phone className="w-3.5 h-3.5" /> {customer.phone}
                      </a>
                    )}
                    {customer.country && (
                      <p className="font-body text-sm text-warm-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {customer.country}
                      </p>
                    )}
                    {customer.createdAt && (
                      <p className="font-body text-xs text-warm-400 mt-2">
                        Member since {formatDate(customer.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
                <button className="px-4 py-2 bg-forest-600 hover:bg-forest-500 text-white font-body text-xs font-medium rounded-full transition-all duration-200">
                  Contact customer
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-warm-100 flex items-center justify-center text-warm-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-body font-medium bg-warm-100 text-warm-500">
                    Guest checkout
                  </span>
                  {booking.customerId && (
                    <p className="font-body text-xs text-warm-400 mt-1">ID: {booking.customerId}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Trip details card */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Trip details</h2>
            <h3 className="font-display text-xl text-forest-600 mb-3">
              {booking.title || booking.referenceCode}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-body text-xs text-warm-400">Start date</p>
                <p className="font-body text-sm text-forest-600">
                  {booking.startDate ? formatDate(booking.startDate, 'long') : '--'}
                </p>
              </div>
              <div>
                <p className="font-body text-xs text-warm-400">Vehicle</p>
                <p className="font-body text-sm text-forest-600">
                  {booking.vehicle || booking.vehicleType}
                </p>
              </div>
              <div>
                <p className="font-body text-xs text-warm-400">Passengers</p>
                <p className="font-body text-sm text-forest-600">
                  {booking.passengers || booking.numPassengers}
                </p>
              </div>
              <div>
                <p className="font-body text-xs text-warm-400">Type</p>
                <p className="font-body text-sm text-forest-600 capitalize">{booking.type}</p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-200 mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-xs font-semibold text-amber-800">Special requests</p>
                  <p className="font-body text-sm text-amber-700">{booking.specialRequests}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column (1/3) ────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Management card */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Management</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Status</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full border border-warm-200 rounded-xl px-3 py-2.5 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updateBooking.isPending}
                  className="mt-2 w-full bg-forest-600 hover:bg-forest-500 text-white font-body text-xs font-medium py-2 rounded-full transition-all duration-200 disabled:opacity-60"
                >
                  {updateBooking.isPending ? 'Updating...' : 'Update status'}
                </button>
              </div>
              <div className="border-t border-warm-100 pt-4">
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">
                  Assign driver
                </label>
                <select
                  value={selectedDriverId}
                  onChange={e => setSelectedDriverId(e.target.value)}
                  className="w-full border border-warm-200 rounded-xl px-3 py-2.5 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300"
                >
                  <option value="">Select driver...</option>
                  {(drivers || []).map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {[d.user?.firstName, d.user?.lastName].filter(Boolean).join(' ') || d.id}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignDriver}
                  disabled={!selectedDriverId || updateBooking.isPending}
                  className="mt-2 w-full bg-white border border-warm-200 text-forest-600 font-body text-xs font-medium py-2 rounded-full hover:bg-warm-50 transition-all duration-200 disabled:opacity-60"
                >
                  Assign & confirm
                </button>
                <p className="font-body text-[10px] text-warm-400 mt-1">
                  Driver will be notified by email
                </p>
              </div>
              <div className="border-t border-warm-100 pt-4">
                <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">
                  Internal notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Notes visible only to admin..."
                  className="w-full border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment card */}
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400">Amount</span>
                <span className="font-body text-sm font-semibold text-forest-600">
                  {format(booking.price || booking.totalAmountGBP || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400">Status</span>
                <span
                  className={`font-body text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    booking.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {booking.paymentStatus || 'PENDING'}
                </span>
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 border border-warm-200 text-forest-600 font-body text-xs font-medium py-2 rounded-full hover:bg-warm-50 transition-all duration-200">
                <Download className="w-3.5 h-3.5" /> Download invoice
              </button>
            </div>
          </div>

          {/* Price breakdown card */}
          {pricing && (
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">
                Price breakdown
              </h2>
              <div className="space-y-2.5">
                {/* Vehicle cost */}
                {pricing.vehicleTotal != null && pricing.vehicleTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-warm-500">
                      {booking.vehicle || booking.vehicleType || 'Vehicle'}
                      {booking.startDate && booking.endDate
                        ? ` x ${Math.max(
                            1,
                            Math.ceil(
                              (new Date(booking.endDate).getTime() -
                                new Date(booking.startDate).getTime()) /
                                86400000
                            )
                          )} days`
                        : ''}
                    </span>
                    <span className="font-body text-xs text-forest-600 font-medium">
                      {format(pricing.vehicleTotal)}
                    </span>
                  </div>
                )}

                {/* Add-ons from pricingBreakdown or addOns array */}
                {(pricing.lineItems || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-body text-xs text-warm-500">{item.label || item.name}</span>
                    <span className="font-body text-xs text-forest-600 font-medium">
                      {format(item.amount || item.price || 0)}
                    </span>
                  </div>
                ))}

                {addOns.length > 0 &&
                  addOns.map((addon: any, i: number) => (
                    <div key={`addon-${i}`} className="flex items-center justify-between">
                      <span className="font-body text-xs text-warm-500">
                        {addon.name || addon.label} add-on
                      </span>
                      <span className="font-body text-xs text-forest-600 font-medium">
                        {format(addon.price || addon.priceGBP || 0)}
                      </span>
                    </div>
                  ))}

                {/* Taxes */}
                {pricing.taxesAndFees != null && pricing.taxesAndFees > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-warm-500">Taxes & fees</span>
                    <span className="font-body text-xs text-forest-600 font-medium">
                      {format(pricing.taxesAndFees)}
                    </span>
                  </div>
                )}

                {/* Discount */}
                {pricing.discount != null && pricing.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-emerald-600">Discount</span>
                    <span className="font-body text-xs text-emerald-600 font-medium">
                      -{format(pricing.discount)}
                    </span>
                  </div>
                )}

                {/* Divider + Total */}
                <div className="border-t border-warm-200 pt-2.5 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm font-semibold text-forest-600">Total</span>
                    <span className="font-body text-sm font-semibold text-forest-600">
                      {format(booking.price || booking.totalAmountGBP || pricing.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div className="border border-red-200 rounded-xl p-6">
            <h2 className="font-body text-sm font-semibold text-red-600 mb-3">Danger zone</h2>
            <button
              onClick={() => setShowCancel(true)}
              className="w-full text-[#C4382A] border-[1.5px] border-[#C4382A] bg-transparent hover:bg-[#FDECEA] font-body text-xs font-medium py-2.5 rounded-full transition-all duration-200"
            >
              Cancel booking
            </button>
          </div>
        </div>
      </div>

      {/* ── Activity Timeline (full width below both columns) ──────────── */}
      {sortedActivities.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-warm-100 p-6">
          <h2 className="font-body text-sm font-semibold text-forest-600 mb-5">Activity timeline</h2>
          <div className="relative">
            {sortedActivities.map((activity: any, idx: number) => {
              const isLast = idx === sortedActivities.length - 1;
              const dotClass = getActivityDot(activity.action);
              return (
                <div key={activity.id || idx} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Vertical line */}
                  {!isLast && (
                    <div className="absolute left-[9px] top-5 bottom-0 w-px bg-warm-200" />
                  )}
                  {/* Dot */}
                  <div
                    className={`relative w-[18px] h-[18px] rounded-full ring-4 shrink-0 mt-0.5 ${dotClass}`}
                  />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-forest-600">
                      {activity.details || activity.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {activity.performedByName && (
                        <span className="font-body text-xs text-warm-500">
                          {activity.performedByName}
                        </span>
                      )}
                      {activity.performedByName && activity.createdAt && (
                        <span className="text-warm-300">&middot;</span>
                      )}
                      {activity.createdAt && (
                        <span className="font-body text-xs text-warm-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(activity.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel modal */}
      <Modal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title="Cancel Booking"
        confirmLabel="Confirm cancellation"
        onConfirm={handleCancel}
        confirmVariant="destructive"
      >
        <div className="space-y-4">
          <div className="bg-red-50 rounded-xl p-4">
            <p className="font-body text-sm text-red-700">
              Refund: Full refund if more than 14 days before departure. No refund within 14 days.
            </p>
          </div>
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">
              Cancellation reason
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
            />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
