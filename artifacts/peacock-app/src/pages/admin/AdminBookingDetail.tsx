import { useState } from 'react';
import { useParams } from 'wouter';
import { Mail, Phone, AlertTriangle, Download } from 'lucide-react';
import { useBooking } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import AdminLayout from './AdminLayout';

export default function AdminBookingDetail() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id || '';
  const { data: booking } = useBooking(bookingId);
  const { format } = useCurrency();
  const [showCancel, setShowCancel] = useState(false);

  if (!booking) {
    return (
      <AdminLayout title="Booking" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Bookings', href: '/admin/bookings' }, { label: bookingId }]}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={booking.id}
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Bookings', href: '/admin/bookings' }, { label: booking.id }]}
    >
      <div className="flex items-center gap-4 mb-6">
        <StatusBadge status={booking.status} />
        <span className="font-body text-sm text-warm-400">Created {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Customer</h2>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body font-semibold text-forest-600 text-lg">{booking.customer.name}</p>
                <a href={`mailto:${booking.customer.email}`} className="font-body text-sm text-forest-500 hover:text-amber-500 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" /> {booking.customer.email}</a>
                <a href={`tel:${booking.customer.phone}`} className="font-body text-sm text-warm-500 hover:text-forest-500 flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5" /> {booking.customer.phone}</a>
                <p className="font-body text-sm text-warm-400 mt-1">{booking.customer.country}</p>
              </div>
              <button className="px-4 py-2 bg-forest-600 hover:bg-forest-500 text-white font-body text-xs font-medium rounded-xl transition-colors">Contact customer</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Trip details</h2>
            <h3 className="font-display text-xl text-forest-600 mb-3">{booking.title}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="font-body text-xs text-warm-400">Dates</p><p className="font-body text-sm text-forest-600">{booking.date}</p></div>
              <div><p className="font-body text-xs text-warm-400">Vehicle</p><p className="font-body text-sm text-forest-600">{booking.vehicle}</p></div>
              <div><p className="font-body text-xs text-warm-400">Passengers</p><p className="font-body text-sm text-forest-600">{booking.passengers}</p></div>
              <div><p className="font-body text-xs text-warm-400">Type</p><p className="font-body text-sm text-forest-600 capitalize">{booking.type}</p></div>
            </div>
            {booking.addOns && booking.addOns.length > 0 && (
              <div className="mb-4">
                <p className="font-body text-xs text-warm-400 mb-2">Add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {booking.addOns.map((a: string) => (
                    <span key={a} className="bg-warm-50 text-warm-600 font-body text-xs px-3 py-1 rounded-pill">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {booking.specialRequests && (
              <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-xs font-semibold text-amber-800">Special requests</p>
                  <p className="font-body text-sm text-amber-700">{booking.specialRequests}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Management</h2>
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Status</label>
                <select defaultValue={booking.status} className="w-full border border-warm-200 rounded-xl px-3 py-2.5 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300">
                  {['Pending', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="mt-2 w-full bg-forest-600 hover:bg-forest-500 text-white font-body text-xs font-medium py-2 rounded-xl transition-colors">Update status</button>
              </div>
              <div className="border-t border-warm-100 pt-4">
                <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Assign driver</label>
                <select className="w-full border border-warm-200 rounded-xl px-3 py-2.5 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300">
                  <option value="">{booking.driver ? booking.driver.name : 'Select driver...'}</option>
                  <option>Dudley Perera</option>
                  <option>Priyantha Fernando</option>
                  <option>Kasun Rajapaksa</option>
                </select>
                <button className="mt-2 w-full bg-white border border-warm-200 text-forest-600 font-body text-xs font-medium py-2 rounded-xl hover:bg-warm-50 transition-colors">Assign driver</button>
                <p className="font-body text-[10px] text-warm-400 mt-1">Driver will be notified by email</p>
              </div>
              <div className="border-t border-warm-100 pt-4">
                <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Internal notes</label>
                <textarea rows={3} defaultValue={booking.adminNotes || ''} placeholder="Notes visible only to admin..." className="w-full border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400">Payment ID</span>
                <span className="font-mono text-xs text-warm-600">pi_3N...xK4q</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400">Amount paid</span>
                <span className="font-body text-sm font-semibold text-forest-600">{format(booking.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-warm-400">Status</span>
                <span className="bg-emerald-100 text-emerald-700 font-body text-[10px] font-medium px-2 py-0.5 rounded-pill">Paid</span>
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 border border-warm-200 text-forest-600 font-body text-xs font-medium py-2 rounded-xl hover:bg-warm-50 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download invoice
              </button>
            </div>
          </div>

          <div className="border border-red-200 rounded-2xl p-6">
            <h2 className="font-body text-sm font-semibold text-red-600 mb-3">Danger zone</h2>
            <button onClick={() => setShowCancel(true)} className="w-full border border-red-300 text-red-600 font-body text-xs font-medium py-2.5 rounded-xl hover:bg-red-50 transition-colors">Cancel booking</button>
          </div>
        </div>
      </div>

      <Modal open={showCancel} onClose={() => setShowCancel(false)} title="Cancel Booking" confirmLabel="Confirm cancellation" onConfirm={() => setShowCancel(false)} confirmVariant="destructive">
        <div className="space-y-4">
          <div className="bg-red-50 rounded-xl p-4">
            <p className="font-body text-sm text-red-700">Refund: Full refund if more than 10 days before departure. No refund within 10 days.</p>
          </div>
          <div>
            <label className="font-body text-xs font-medium text-forest-600 mb-1 block">Cancellation reason</label>
            <textarea rows={3} placeholder="Reason for cancellation..." className="w-full border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
