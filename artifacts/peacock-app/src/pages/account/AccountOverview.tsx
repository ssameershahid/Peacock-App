import React from 'react';
import { Link } from 'wouter';
import { useUserBookings, useCYORequests } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { BookingCard } from '@/components/shared/BookingCard';
import { Map, FileText, User, Sparkles, ArrowRight } from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'My Trips', desc: 'View upcoming and past bookings', href: '/account/bookings', icon: Map, color: 'bg-forest-50 text-forest-500' },
  { label: 'Invoices', desc: 'Download receipts and invoices', href: '/account/invoices', icon: FileText, color: 'bg-blue-50 text-blue-500' },
  { label: 'Profile', desc: 'Update your personal details', href: '/account/profile', icon: User, color: 'bg-violet-50 text-violet-500' },
  { label: 'Book a New Trip', desc: 'Explore tours and transfers', href: '/tours', icon: Sparkles, color: 'bg-amber-50 text-amber-200' },
];

export default function AccountOverview() {
  const { data: bookings, isLoading } = useUserBookings();
  const { data: cyoRequests } = useCYORequests();

  const upcoming = bookings?.filter(b => ['Upcoming', 'Pending', 'In Progress', 'Quote Paid'].includes(b.status)) || [];
  const past = bookings?.filter(b => ['Completed', 'Cancelled'].includes(b.status)) || [];
  const quotedCYO = cyoRequests?.filter(r => r.status === 'Quoted') || [];
  const invoiceCount = bookings?.filter(b => ['Upcoming', 'Completed', 'Quote Paid'].includes(b.status)).length || 0;
  const mostRecent = bookings?.[0];

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-warm-100 p-5 text-center">
          <p className="font-display text-3xl text-forest-600">{upcoming.length + quotedCYO.length}</p>
          <p className="font-body text-sm text-warm-500 mt-1">Upcoming trips</p>
        </div>
        <div className="bg-white rounded-2xl border border-warm-100 p-5 text-center">
          <p className="font-display text-3xl text-forest-600">{past.length}</p>
          <p className="font-body text-sm text-warm-500 mt-1">Past trips</p>
        </div>
        <div className="bg-white rounded-2xl border border-warm-100 p-5 text-center">
          <p className="font-display text-3xl text-forest-600">{invoiceCount}</p>
          <p className="font-body text-sm text-warm-500 mt-1">Invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {QUICK_ACTIONS.map(action => (
          <Link key={action.href} href={action.href}>
            <div className="bg-white rounded-2xl border border-warm-100 p-5 hover:shadow-md transition-shadow cursor-pointer group flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-semibold text-forest-600 group-hover:text-forest-500 transition-colors">{action.label}</h3>
                <p className="font-body text-sm text-warm-400 mt-0.5">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-warm-300 group-hover:text-forest-500 transition-colors mt-1 shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {mostRecent && (
        <div>
          <h3 className="font-display text-xl text-forest-600 mb-4">Most recent booking</h3>
          <Link href={`/account/bookings/${mostRecent.id}`}>
            <BookingCard booking={mostRecent} />
          </Link>
        </div>
      )}

      {quotedCYO.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-xl text-forest-600 mb-4">Pending quote</h3>
          {quotedCYO.map(cyo => (
            <Link key={cyo.id} href={`/account/bookings/${cyo.id}`}>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span className="font-body text-xs font-medium text-amber-600 uppercase tracking-wider">Custom Trip Quote Ready</span>
                  </div>
                  <h4 className="font-body font-semibold text-forest-600">{cyo.locations.join(" \u2192 ")}</h4>
                  <p className="font-body text-sm text-warm-500 mt-1">{cyo.dates}</p>
                </div>
                <div className="text-right">
                  <span className="font-body font-bold text-amber-600">View & Pay</span>
                  <ArrowRight className="w-4 h-4 text-amber-200 ml-2 inline" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
