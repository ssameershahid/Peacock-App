import React, { useState } from 'react';
import { Link } from 'wouter';
import { useUserBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Download, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateRange } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface InvoiceRow {
  invoiceNo: string;
  dateIssued: string;
  bookingRef: string;
  tourName: string;
  amount: number;
  status: string;
  vehicle: string;
  passengers: number;
  startDate: string;
  endDate: string;
  pricing: any;
}

function InvoiceExpandedPreview({ inv, onClose }: { inv: InvoiceRow; onClose: () => void }) {
  const { format } = useCurrency();
  const durationDays = inv.startDate && inv.endDate
    ? Math.ceil((new Date(inv.endDate).getTime() - new Date(inv.startDate).getTime()) / 86400000)
    : 1;

  return (
    <div className="bg-[#F8F5F0] px-6 py-5 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left — booking summary */}
        <div className="flex-1">
          <h4 className="font-display text-lg text-warm-900 mb-2">{inv.tourName}</h4>
          <p className="font-body text-sm text-warm-500 mb-1">
            {inv.startDate && inv.endDate ? formatDateRange(inv.startDate, inv.endDate) : inv.dateIssued}
          </p>
          <p className="font-body text-sm text-warm-500">
            {inv.vehicle} · {inv.passengers} passenger{inv.passengers !== 1 ? 's' : ''}
          </p>
          <p className="font-body text-xs text-warm-400 mt-2">Ref: {inv.bookingRef}</p>
        </div>

        {/* Right — price breakdown */}
        <div className="flex-1">
          <div className="space-y-2 mb-3">
            <div className="flex justify-between font-body text-sm">
              <span className="text-warm-600">{inv.vehicle} × {durationDays} day{durationDays !== 1 ? 's' : ''}</span>
              <span className="text-forest-600 font-medium">{format(inv.pricing?.vehicleTotal || inv.amount)}</span>
            </div>
            {inv.pricing?.addOnsTotal > 0 && (
              <div className="flex justify-between font-body text-sm">
                <span className="text-warm-600">Add-ons</span>
                <span className="text-forest-600 font-medium">{format(inv.pricing.addOnsTotal)}</span>
              </div>
            )}
            {inv.pricing?.taxesAndFees > 0 && (
              <div className="flex justify-between font-body text-sm">
                <span className="text-warm-600">Taxes & fees</span>
                <span className="text-forest-600 font-medium">{format(inv.pricing.taxesAndFees)}</span>
              </div>
            )}
            <div className="border-t border-warm-200 pt-2 flex justify-between font-body text-sm">
              <span className="font-semibold text-forest-600">Total paid</span>
              <span className="font-semibold text-forest-600">{format(inv.amount)}</span>
            </div>
          </div>
          <p className="font-body text-[13px] text-warm-400">
            Paid on {inv.dateIssued}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-warm-200/50">
        <Button variant="default" size="sm" className="rounded-pill">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
        </Button>
        <button onClick={onClose} className="font-body text-sm text-warm-500 hover:text-warm-600 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

export default function Invoices() {
  const { data: bookings, isLoading } = useUserBookings();
  const { format } = useCurrency();
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  const invoices: InvoiceRow[] = (bookings || [])
    .filter(b => ['Upcoming', 'Completed', 'Quote Paid', 'In Progress'].includes(b.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(b => ({
      invoiceNo: `INV-${b.id.replace('BK-', '')}`,
      dateIssued: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      bookingRef: b.id,
      tourName: b.title,
      amount: b.price,
      status: b.status === 'Completed' ? 'Paid' : 'Issued',
      vehicle: b.vehicle,
      passengers: b.passengers || 1,
      startDate: b.startDate,
      endDate: b.endDate,
      pricing: b.pricing,
    }));

  const toggleExpand = (invoiceNo: string) => {
    setExpandedInvoice(prev => prev === invoiceNo ? null : invoiceNo);
  };

  return (
    <div>
      <SectionHeading title="My *invoices*" className="mb-6" />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white border border-warm-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white border border-dashed border-warm-200 rounded-2xl p-12 text-center flex flex-col items-center">
          <FileText className="w-12 h-12 text-warm-300 mb-4" />
          <h3 className="font-display text-xl text-warm-900 mb-2">No invoices yet</h3>
          <p className="font-body text-sm text-warm-500 mb-4">Invoices are generated automatically when you complete a booking</p>
          <Link href="/tours">
            <button className="font-body text-sm font-medium text-forest-600 hover:text-forest-500 transition-colors">
              Browse tours →
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-warm-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-100 bg-warm-50/50">
                  <th className="text-left font-body text-xs font-medium text-warm-400 uppercase tracking-wider px-6 py-3">Invoice</th>
                  <th className="text-left font-body text-xs font-medium text-warm-400 uppercase tracking-wider px-6 py-3">Date Issued</th>
                  <th className="text-left font-body text-xs font-medium text-warm-400 uppercase tracking-wider px-6 py-3">Booking Ref</th>
                  <th className="text-left font-body text-xs font-medium text-warm-400 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left font-body text-xs font-medium text-warm-400 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right font-body text-xs font-medium text-warm-400 uppercase tracking-wider px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <React.Fragment key={inv.invoiceNo}>
                    <tr
                      onClick={() => toggleExpand(inv.invoiceNo)}
                      className={cn(
                        'border-b border-warm-50 last:border-0 hover:bg-warm-50 transition-colors cursor-pointer',
                        expandedInvoice === inv.invoiceNo && 'bg-warm-50'
                      )}
                    >
                      <td className="px-6 py-4 font-body text-sm font-medium text-forest-600">{inv.invoiceNo}</td>
                      <td className="px-6 py-4 font-body text-sm text-warm-500">{inv.dateIssued}</td>
                      <td className="px-6 py-4 font-body text-sm text-warm-500">{inv.bookingRef}</td>
                      <td className="px-6 py-4 font-body text-sm font-semibold text-forest-600">{format(inv.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-body font-medium ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>{inv.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="rounded-pill" onClick={e => e.stopPropagation()}>
                            <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                          </Button>
                          {expandedInvoice === inv.invoiceNo
                            ? <ChevronUp className="w-4 h-4 text-warm-400" />
                            : <ChevronDown className="w-4 h-4 text-warm-400" />
                          }
                        </div>
                      </td>
                    </tr>
                    {expandedInvoice === inv.invoiceNo && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <InvoiceExpandedPreview inv={inv} onClose={() => setExpandedInvoice(null)} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {invoices.map(inv => (
              <div key={inv.invoiceNo} className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleExpand(inv.invoiceNo)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-body text-xs text-warm-400">{inv.invoiceNo}</span>
                      <h4 className="font-body font-semibold text-forest-600">{inv.tourName}</h4>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-body font-medium ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>{inv.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-body text-sm text-warm-500">{inv.dateIssued}</span>
                      <span className="font-body text-sm font-semibold text-forest-600 ml-4">{format(inv.amount)}</span>
                    </div>
                    {expandedInvoice === inv.invoiceNo
                      ? <ChevronUp className="w-4 h-4 text-warm-400" />
                      : <ChevronDown className="w-4 h-4 text-warm-400" />
                    }
                  </div>
                </div>
                {expandedInvoice === inv.invoiceNo && (
                  <InvoiceExpandedPreview inv={inv} onClose={() => setExpandedInvoice(null)} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
