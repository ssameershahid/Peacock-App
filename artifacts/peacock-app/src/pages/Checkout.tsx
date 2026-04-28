import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking } from '@/hooks/use-app-data';
import { Check, Lock, ArrowRight, ArrowLeft, Shield, User, Mail, Phone, Globe, AlertCircle, Plane } from 'lucide-react';

interface BookingData {
  type: string;
  tourId?: string;
  transferRouteId?: string;
  tourName: string;
  tourImage?: string;
  vehicleType: string;
  vehicleName: string;
  startDate: string;
  endDate?: string;
  numDays: number;
  passengers: number;
  vehicleRate: number;
  vehicleTotal: number;
  addOnsTotal: number;
  selectedAddOns: { id: string; name: string; price: number }[];
  totalPrice: number;
}

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { format } = useCurrency();
  const { user } = useAuth();
  const createBooking = useCreateBooking();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [error, setError] = useState('');

  const [contact, setContact] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: '', flightNumber: '', requests: ''
  });
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('peacock_booking');
    if (stored) {
      try { setBooking(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setContact(c => ({
        ...c,
        firstName: c.firstName || user.firstName || '',
        lastName: c.lastName || user.lastName || '',
        email: c.email || user.email || '',
        phone: c.phone || user.phone || '',
        country: c.country || user.country || '',
      }));
    }
  }, [user]);

  const taxes = booking ? Math.round(booking.totalPrice * 0.05) : 0;
  const grandTotal = booking ? booking.totalPrice + taxes : 0;

  const handlePay = async () => {
    if (!booking) return;
    setError('');

    const mockConfirm = () => {
      const ref = 'PKD-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      sessionStorage.removeItem('peacock_booking');
      setLocation(`/checkout/confirmation?ref=${ref}`);
    };

    try {
      const result = await createBooking.mutateAsync({
        type: booking.type as any,
        tourId: booking.tourId,
        transferRouteId: booking.transferRouteId,
        vehicleType: booking.vehicleType,
        startDate: booking.startDate,
        endDate: booking.endDate,
        numDays: booking.numDays,
        passengers: booking.passengers,
        flightNumber: contact.flightNumber.trim() || undefined,
        specialRequests: contact.requests || undefined,
        addOns: booking.selectedAddOns,
        pricingBreakdown: {
          vehicleTotal: booking.vehicleTotal,
          addOnsTotal: booking.addOnsTotal,
          taxes,
        },
        totalGBP: grandTotal,
      });
      // Redirect to Stripe Checkout if available, otherwise mock confirmation
      if (result.checkoutUrl) {
        sessionStorage.removeItem('peacock_booking');
        window.location.href = result.checkoutUrl;
      } else {
        mockConfirm();
      }
    } catch {
      // Backend unavailable — use mock confirmation flow
      mockConfirm();
    }
  };

  const stepNames = ['Contact Details', 'Review & Pay'];

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream pt-32 text-center">
        <p className="font-body text-warm-500 mb-4">No booking details found.</p>
        <Link href="/tours"><Button variant="outline" className="font-body">Browse Tours</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6">

        <div className="flex items-center justify-center mb-16">
          {[1, 2].map((n, i) => (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-body font-semibold transition-colors z-10 ${
                  step > n ? 'bg-forest-500 text-white' : step === n ? 'bg-amber-400 text-forest-600 ring-4 ring-amber-100' : 'bg-warm-200 text-warm-500'
                }`}>
                  {step > n ? <Check className="w-5 h-5" /> : n}
                </div>
                <span className={`absolute top-12 text-xs font-body font-medium whitespace-nowrap ${step >= n ? 'text-forest-600' : 'text-warm-400'}`}>
                  {stepNames[i]}
                </span>
              </div>
              {i < 1 && (
                <div className={`w-20 sm:w-32 h-1 -ml-1 -mr-1 z-0 rounded-full ${step > n ? 'bg-forest-500' : 'bg-warm-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-warm-100 p-8 md:p-10">

            {step === 1 && (
              <div className="animate-in fade-in">
                <h2 className="font-display text-3xl text-forest-600 mb-8">Who is travelling?</h2>
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-2 font-body">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                      <input type="text" value={contact.firstName} onChange={e => setContact({ ...contact, firstName: e.target.value })} className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none" placeholder="Jane" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Last Name</label>
                    <input type="text" value={contact.lastName} onChange={e => setContact({ ...contact, lastName: e.target.value })} className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none" placeholder="Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                      <input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none" placeholder="jane@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                      <input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none" placeholder="+44 7700 900000" />
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                    <select value={contact.country} onChange={e => setContact({ ...contact, country: e.target.value })} className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none appearance-none">
                      <option value="">Select country</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="AU">Australia</option>
                      <option value="CA">Canada</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="LK">Sri Lanka</option>
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Flight number <span className="text-warm-400">(optional)</span></label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                    <input
                      type="text"
                      value={contact.flightNumber}
                      onChange={e => setContact({ ...contact, flightNumber: e.target.value })}
                      maxLength={80}
                      className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                      placeholder="Provide your flight number if available so we can track your arrival and adjust pickup time."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Special Requests <span className="text-warm-400">(optional)</span></label>
                  <textarea rows={3} maxLength={500} value={contact.requests} onChange={e => setContact({ ...contact, requests: e.target.value })} className="w-full bg-white border border-warm-200 rounded-xl py-3 px-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none resize-none" placeholder="Flight arriving at 2AM, require child seat, etc." />
                  <p className="font-body text-xs text-warm-400 text-right mt-1">{contact.requests.length}/500</p>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button size="lg" onClick={() => setStep(2)} disabled={!contact.firstName || !contact.email} className="h-14 px-10 text-lg group font-body">
                    Continue to Review <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in">
                <h2 className="font-display text-3xl text-forest-600 mb-8">Review your journey</h2>

                <div className="bg-warm-50 rounded-2xl p-6 mb-6 border border-warm-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-forest-100 rounded-pill text-xs font-medium text-forest-600 font-body capitalize">{booking.type.replace('_', ' ')}</span>
                    <h3 className="font-display text-xl text-forest-600">{booking.tourName}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 font-body text-sm">
                    <div><span className="text-warm-400">Start date</span><p className="text-forest-600 font-medium">{booking.startDate}</p></div>
                    <div><span className="text-warm-400">Vehicle</span><p className="text-forest-600 font-medium">{booking.vehicleName}</p></div>
                    <div><span className="text-warm-400">Passengers</span><p className="text-forest-600 font-medium">{booking.passengers}</p></div>
                    <div><span className="text-warm-400">Duration</span><p className="text-forest-600 font-medium">{booking.numDays} days</p></div>
                    {contact.flightNumber.trim() && (
                      <div className="sm:col-span-2"><span className="text-warm-400">Flight number</span><p className="text-forest-600 font-medium">{contact.flightNumber.trim()}</p></div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-warm-200 space-y-2 font-body text-sm">
                    <div className="flex justify-between"><span className="text-warm-500">Vehicle & Driver ({booking.numDays} days)</span><span className="text-forest-600 font-medium">{format(booking.vehicleTotal)}</span></div>
                    {booking.selectedAddOns.map(a => (
                      <div key={a.id} className="flex justify-between"><span className="text-warm-500">{a.name}</span><span className="text-forest-600 font-medium">{format(a.price)}</span></div>
                    ))}
                    <div className="flex justify-between"><span className="text-warm-500">Taxes & Fees (5%)</span><span className="text-forest-600 font-medium">{format(taxes)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-warm-200">
                      <span className="font-display text-lg text-forest-600">Total</span>
                      <span className="font-display text-2xl text-forest-600">{format(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 mb-6 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="font-body text-sm text-emerald-800">
                    <strong>Cancellation Policy:</strong> Free cancellation until 14 days before your trip starts. Cancellations within 14 days are subject to a 50% fee.
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-6">
                  <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 rounded accent-forest-600" />
                  <label htmlFor="terms" className="font-body text-sm text-warm-600">
                    I agree to the <a href="#" className="text-forest-500 underline">Terms & Conditions</a> and acknowledge the cancellation policy.
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="font-body text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} className="font-body"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                  <Button
                    size="lg"
                    onClick={handlePay}
                    disabled={!agreed || createBooking.isPending}
                    className="h-14 px-10 text-lg bg-forest-600 hover:bg-forest-500 text-white shadow-lg font-body"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {createBooking.isPending ? 'Redirecting to Stripe…' : `Pay ${format(grandTotal)} securely`}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-[360px] shrink-0">
            <div className="bg-white rounded-[24px] shadow-sm border border-warm-100 p-7 sticky top-32">
              <h3 className="font-display text-xl text-forest-600 mb-5">Booking Summary</h3>
              {booking.tourImage && (
                <div className="flex gap-4 pb-5 border-b border-warm-100 mb-5">
                  <div className="w-16 h-16 rounded-xl bg-warm-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={booking.tourImage} className="w-full h-full object-cover" alt="Tour" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-forest-600">{booking.tourName}</h4>
                    <p className="font-body text-xs text-warm-500">{booking.numDays} Days · {booking.vehicleName}</p>
                    <p className="font-body text-xs text-warm-500">{booking.startDate}</p>
                  </div>
                </div>
              )}
              <div className="space-y-3 mb-5 font-body text-sm text-warm-600">
                <div className="flex justify-between">
                  <span>Vehicle & Driver ({booking.numDays}d)</span>
                  <span className="font-medium text-forest-600">{format(booking.vehicleTotal)}</span>
                </div>
                {booking.selectedAddOns.map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span>{a.name}</span>
                    <span className="font-medium text-forest-600">{format(a.price)}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span className="font-medium text-forest-600">{format(taxes)}</span>
                </div>
              </div>
              <div className="pt-5 border-t border-warm-100 flex justify-between items-end">
                <span className="font-display text-lg text-forest-600">Total</span>
                <span className="font-display text-3xl text-forest-600">{format(grandTotal)}</span>
              </div>
              <p className="font-body text-xs text-warm-400 mt-3 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Secured by Stripe · SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
