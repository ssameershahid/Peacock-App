import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Check, Download, ArrowRight, Mail, ClipboardList, UserCheck } from 'lucide-react';

export default function Confirmation() {
  const { format } = useCurrency();
  const refId = 'BK-2026-006';

  return (
    <div className="min-h-screen bg-cream pt-24 pb-32">
      <div className="max-w-[700px] mx-auto px-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>

        <h1 className="font-display text-5xl text-forest-600 mb-3">Booking confirmed!</h1>
        <p className="font-body text-warm-500 text-lg mb-2">Your booking reference:</p>
        <p className="font-mono text-3xl text-forest-600 bg-white px-8 py-4 rounded-2xl border border-warm-200 inline-block mb-10 shadow-sm tracking-wider">
          {refId}
        </p>

        <div className="bg-white rounded-[24px] p-8 border border-warm-200 mb-10 text-left shadow-sm">
          <h3 className="font-display text-xl text-forest-600 mb-4">Summary</h3>
          <div className="grid grid-cols-2 gap-4 font-body text-sm">
            <div>
              <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1">Tour</span>
              <span className="text-forest-600 font-medium">Classic Sri Lanka</span>
            </div>
            <div>
              <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1">Dates</span>
              <span className="text-forest-600 font-medium">Oct 12 – Oct 22, 2026</span>
            </div>
            <div>
              <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1">Vehicle</span>
              <span className="text-forest-600 font-medium">Minivan</span>
            </div>
            <div>
              <span className="text-warm-400 block text-xs uppercase tracking-wider mb-1">Total Paid</span>
              <span className="text-forest-600 font-medium font-display text-xl">{format(715)}</span>
            </div>
          </div>
        </div>

        <div className="bg-sage rounded-[24px] p-8 mb-10 text-left">
          <h3 className="font-display text-xl text-forest-600 mb-6">What happens next</h3>
          <div className="space-y-5">
            {[
              { icon: <Mail className="w-5 h-5" />, title: 'Check your email', desc: "You\u2019ll receive a confirmation email with your invoice and booking details." },
              { icon: <ClipboardList className="w-5 h-5" />, title: 'Add trip details', desc: "Add your passport info, hotel details, and flight numbers anytime before your trip." },
              { icon: <UserCheck className="w-5 h-5" />, title: 'Driver assignment', desc: "Your personal driver will be assigned and you\u2019ll be notified via email." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-forest-500">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-body font-semibold text-forest-600 text-sm">{item.title}</h4>
                  <p className="font-body text-sm text-warm-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account/bookings">
            <Button className="font-body h-12 px-6">
              View booking <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" className="font-body h-12 px-6">
            <Download className="w-4 h-4 mr-2" /> Download invoice
          </Button>
          <Link href="/">
            <Button variant="ghost" className="font-body h-12 px-6">
              Book another trip
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
