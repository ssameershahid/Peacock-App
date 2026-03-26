import React from 'react';
import { useUserBookings } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceRow {
  invoiceNo: string;
  dateIssued: string;
  bookingRef: string;
  tourName: string;
  amount: number;
  status: string;
}

export default function Invoices() {
  const { data: bookings, isLoading } = useUserBookings();
  const { format } = useCurrency();

  const invoices: InvoiceRow[] = (bookings || [])
    .filter(b => ['Upcoming', 'Completed', 'Quote Paid', 'In Progress'].includes(b.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(b => ({
      invoiceNo: `INV-${b.id.replace('BK-', '')}`,
      dateIssued: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      bookingRef: b.id,
      tourName: b.title,
      amount: b.price,
      status: b.status === 'Completed' ? 'Paid' : 'Issued',
    }));

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
          <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-forest-400" />
          </div>
          <h3 className="font-display text-2xl text-forest-600 mb-2">No invoices yet</h3>
          <p className="font-body text-warm-500">Invoices will appear here once you make a booking.</p>
        </div>
      ) : (
        <>
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
                  <tr key={inv.invoiceNo} className="border-b border-warm-50 last:border-0 hover:bg-warm-50 transition-colors">
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
                      <Button variant="outline" size="sm" className="rounded-pill">
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {invoices.map(inv => (
              <div key={inv.invoiceNo} className="bg-white rounded-2xl border border-warm-100 p-5">
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
                  <Button variant="outline" size="sm" className="rounded-pill">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
