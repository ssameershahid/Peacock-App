import { useState } from 'react';
import { useParams } from 'wouter';
import { Mail, Phone, Plus, Trash2, Copy, Send, Link2, Clock } from 'lucide-react';
import { useAdminCYO, useUpdateCYOStatus } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import AdminLayout from './AdminLayout';

export default function AdminCYODetail() {
  const params = useParams<{ id: string }>();
  const reqId = params?.id || '';
  const { data: requests } = useAdminCYO();
  const updateStatus = useUpdateCYOStatus();
  const { format } = useCurrency();
  const request = requests?.find(r => r.id === reqId);

  const [lineItems, setLineItems] = useState([
    { desc: 'Car x 10 days', rate: 38, qty: 10, subtotal: 380 },
  ]);
  const [extras, setExtras] = useState([
    { desc: 'Premium accommodation surcharge', amount: 60 },
    { desc: 'Trail guide (3 days)', amount: 45 },
  ]);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  if (!request) {
    return (
      <AdminLayout title="Request" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Custom Requests', href: '/admin/requests' }, { label: reqId }]}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const lineTotal = lineItems.reduce((s, l) => s + l.subtotal, 0);
  const extrasTotal = extras.reduce((s, e) => s + e.amount, 0);
  const total = lineTotal + extrasTotal;

  return (
    <AdminLayout
      title={request.id}
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Custom Requests', href: '/admin/requests' }, { label: request.id }]}
    >
      <div className="flex items-center gap-4 mb-6">
        <StatusBadge status={request.status} />
        <select
          defaultValue={request.status}
          onChange={e => updateStatus.mutate({ id: request.id, status: e.target.value })}
          className="border border-warm-200 rounded-xl px-3 py-1.5 font-body text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-300"
        >
          {['New', 'Reviewing', 'Quoted', 'Awaiting Payment', 'Paid', 'Confirmed', 'Abandoned'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Customer request</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="font-body text-xs text-warm-400">Trip type</p><p className="font-body text-sm text-forest-600">{request.tripType}</p></div>
              <div><p className="font-body text-xs text-warm-400">Travellers</p><p className="font-body text-sm text-forest-600">{request.travellers}</p></div>
              <div><p className="font-body text-xs text-warm-400">Dates</p><p className="font-body text-sm text-forest-600">{request.dates}{request.flexible ? ' (flexible)' : ''}</p></div>
              <div><p className="font-body text-xs text-warm-400">Vehicle preference</p><p className="font-body text-sm text-forest-600 capitalize">{request.vehiclePreference}</p></div>
              <div><p className="font-body text-xs text-warm-400">Budget</p><p className="font-body text-sm text-forest-600">{request.budget}</p></div>
            </div>
            <div className="mb-4">
              <p className="font-body text-xs text-warm-400 mb-1.5">Destinations</p>
              <div className="flex flex-wrap gap-2">
                {request.locations.map((l: string) => (
                  <span key={l} className="bg-forest-50 text-forest-600 font-body text-xs px-3 py-1 rounded-pill">{l}</span>
                ))}
              </div>
            </div>
            {request.travelStyle && (
              <div className="mb-4">
                <p className="font-body text-xs text-warm-400 mb-1.5">Travel style</p>
                <div className="flex flex-wrap gap-2">
                  {request.travelStyle.map((s: string) => (
                    <span key={s} className="bg-amber-50 text-amber-700 font-body text-xs px-3 py-1 rounded-pill">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {request.interests && request.interests.length > 0 && (
              <div className="mb-4">
                <p className="font-body text-xs text-warm-400 mb-1.5">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {request.interests.map((i: string) => (
                    <span key={i} className="bg-warm-50 text-warm-600 font-body text-xs px-3 py-1 rounded-pill">{i}</span>
                  ))}
                </div>
              </div>
            )}
            {request.specialRequests && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="font-body text-xs font-semibold text-amber-800 mb-1">Special requests</p>
                <p className="font-body text-sm text-amber-700">{request.specialRequests}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Quote builder</h2>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-medium text-warm-400 uppercase tracking-wider">Line items</span>
                <button onClick={() => setLineItems([...lineItems, { desc: '', rate: 0, qty: 1, subtotal: 0 }])} className="font-body text-xs text-forest-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add line item</button>
              </div>
              <div className="space-y-2">
                {lineItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" defaultValue={item.desc} placeholder="Description" className="flex-1 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                    <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden">
                      <span className="px-2 py-2 bg-warm-50 font-body text-xs text-warm-400 border-r border-warm-200">{"\u00A3"}</span>
                      <input type="number" defaultValue={item.rate} className="w-14 px-2 py-2 font-body text-sm focus:outline-none" />
                    </div>
                    <input type="number" defaultValue={item.qty} className="w-14 border border-warm-200 rounded-xl px-2 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 text-center" />
                    <span className="font-body text-sm font-medium text-forest-600 w-16 text-right">{format(item.subtotal)}</span>
                    <button onClick={() => setLineItems(lineItems.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-medium text-warm-400 uppercase tracking-wider">Extras</span>
                <button onClick={() => setExtras([...extras, { desc: '', amount: 0 }])} className="font-body text-xs text-forest-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add extra</button>
              </div>
              <div className="space-y-2">
                {extras.map((ext, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" defaultValue={ext.desc} placeholder="Description" className="flex-1 border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
                    <div className="flex items-center border border-warm-200 rounded-xl overflow-hidden">
                      <span className="px-2 py-2 bg-warm-50 font-body text-xs text-warm-400 border-r border-warm-200">{"\u00A3"}</span>
                      <input type="number" defaultValue={ext.amount} className="w-16 px-2 py-2 font-body text-sm focus:outline-none" />
                    </div>
                    <button onClick={() => setExtras(extras.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-forest-50 rounded-xl mb-6">
              <span className="font-body text-sm font-semibold text-forest-600">Quote total</span>
              <span className="font-display text-2xl text-forest-600">{format(total)}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setLinkGenerated(true)} className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white font-body text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200">
                <Link2 className="w-4 h-4" /> Generate Stripe Payment Link
              </button>
              <button onClick={() => setQuoteSent(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-forest-800 font-body text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200">
                <Send className="w-4 h-4" /> Send quote to customer
              </button>
              <button className="flex items-center gap-2 border border-warm-200 text-forest-600 font-body text-sm font-medium px-5 py-2.5 rounded-full hover:bg-warm-50 transition-all duration-200">
                <Copy className="w-4 h-4" /> Copy payment link
              </button>
            </div>
            {linkGenerated && (
              <div className="mt-3 bg-emerald-50 rounded-xl p-3">
                <p className="font-body text-xs text-emerald-700">Payment link generated: https://pay.stripe.com/c/cs_live_mock_abc123</p>
              </div>
            )}
            {quoteSent && (
              <div className="mt-3 bg-blue-50 rounded-xl p-3">
                <p className="font-body text-xs text-blue-700">Quote sent to {request.customerData?.email || request.customer}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Activity log</h2>
            <div className="space-y-4">
              {[
                { date: request.submittedAt, action: 'Request submitted by customer', status: 'New' },
                { date: new Date(new Date(request.submittedAt).getTime() + 86400000).toISOString(), action: 'Admin reviewed request', status: 'Reviewing' },
                ...(request.status === 'Quoted' || request.status === 'Abandoned' ? [{ date: new Date(new Date(request.submittedAt).getTime() + 172800000).toISOString(), action: `Status changed to ${request.status}`, status: request.status }] : []),
              ].map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-warm-50 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-warm-400" />
                  </div>
                  <div className="flex-1 pb-3 border-b border-warm-50 last:border-0">
                    <p className="font-body text-sm text-forest-600">{entry.action}</p>
                    <p className="font-body text-xs text-warm-400 mt-0.5">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-warm-100 p-6">
            <h2 className="font-body text-sm font-semibold text-forest-600 mb-4">Customer</h2>
            <p className="font-body font-semibold text-forest-600">{request.customer}</p>
            {request.customerData && (
              <>
                <a href={`mailto:${request.customerData.email}`} className="font-body text-sm text-forest-500 hover:text-amber-200 flex items-center gap-1.5 mt-2"><Mail className="w-3.5 h-3.5" /> {request.customerData.email}</a>
                <a href={`tel:${request.customerData.phone}`} className="font-body text-sm text-warm-500 hover:text-forest-500 flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5" /> {request.customerData.phone}</a>
                <p className="font-body text-sm text-warm-400 mt-1">{request.customerData.country}</p>
              </>
            )}
          </div>

          {request.status === 'Abandoned' && (
            <div className="bg-white rounded-xl border border-warm-100 p-6">
              <h2 className="font-body text-sm font-semibold text-warm-500 mb-3">Abandonment reason</h2>
              <textarea rows={3} defaultValue="No response after 3 follow-ups" className="w-full border border-warm-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
