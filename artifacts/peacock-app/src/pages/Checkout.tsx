import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCreateBooking } from '@/hooks/use-app-data';
import { useToast } from '@/hooks/use-toast';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { mutate: createBooking, isPending } = useCreateBooking();
  const { toast } = useToast();

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  
  const handleSubmit = () => {
    createBooking({}, {
      onSuccess: (res) => {
        toast({ title: "Booking Confirmed!", description: "Your journey is locked in. Redirecting..." });
        setTimeout(() => setLocation('/account/bookings'), 2000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Stepper */}
        <div className="flex items-center justify-center mb-16">
          {[1, 2, 3].map((n, i) => (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-body font-semibold transition-colors z-10 ${
                  step > n ? 'bg-forest-500 text-white' : step === n ? 'bg-amber-400 text-forest-600 ring-4 ring-amber-100' : 'bg-warm-200 text-warm-500'
                }`}>
                  {step > n ? <Check className="w-5 h-5" /> : n}
                </div>
                <span className={`absolute top-12 text-xs font-body font-medium whitespace-nowrap ${step >= n ? 'text-forest-600' : 'text-warm-400'}`}>
                  {n === 1 ? 'Contact Details' : n === 2 ? 'Review' : 'Payment'}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-24 sm:w-32 h-1 -ml-2 -mr-2 z-0 ${step > n ? 'bg-forest-500' : 'bg-warm-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-[24px] shadow-sm border border-warm-100 p-8 md:p-12">
            
            {step === 1 && (
              <div className="animate-in fade-in">
                <h2 className="font-display text-3xl text-forest-600 mb-8">Who is travelling?</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-2 font-body">First Name</label>
                    <input type="text" className="w-full bg-white border-1.5 border-warm-200 rounded-xl py-3 px-4 font-body focus:border-forest-500 focus:ring-0 outline-none" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Last Name</label>
                    <input type="text" className="w-full bg-white border-1.5 border-warm-200 rounded-xl py-3 px-4 font-body focus:border-forest-500 focus:ring-0 outline-none" placeholder="Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Email Address</label>
                    <input type="email" className="w-full bg-white border-1.5 border-warm-200 rounded-xl py-3 px-4 font-body focus:border-forest-500 focus:ring-0 outline-none" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Phone Number (with country code)</label>
                    <input type="tel" className="w-full bg-white border-1.5 border-warm-200 rounded-xl py-3 px-4 font-body focus:border-forest-500 focus:ring-0 outline-none" placeholder="+44 7700 900000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2 font-body">Special Requests (Optional)</label>
                  <textarea rows={4} className="w-full bg-white border-1.5 border-warm-200 rounded-xl py-3 px-4 font-body focus:border-forest-500 focus:ring-0 outline-none" placeholder="Flight arriving at 2AM, require child seat, etc." />
                </div>
                <div className="mt-10 flex justify-end">
                  <Button size="lg" onClick={handleNext} className="h-14 px-10 text-lg group">
                    Continue to Review <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in">
                <h2 className="font-display text-3xl text-forest-600 mb-8">Review your journey</h2>
                <div className="bg-sage/40 rounded-2xl p-6 mb-8 border border-sage">
                  <h4 className="font-display text-xl text-forest-600 mb-4">Cancellation Policy</h4>
                  <p className="font-body text-sm text-warm-600 leading-relaxed">
                    Free cancellation until 10 days before your trip starts. Cancellations made within 10 days of the start date are subject to a 50% fee. No-shows will be charged the full amount.
                  </p>
                </div>
                <div className="flex items-start gap-3 mb-10">
                  <input type="checkbox" id="terms" className="mt-1 w-5 h-5 text-forest-600 rounded focus:ring-forest-500 accent-forest-600" />
                  <label htmlFor="terms" className="font-body text-warm-600 text-sm">
                    I agree to the <a href="#" className="text-forest-500 underline">Terms & Conditions</a> and acknowledge the cancellation policy.
                  </label>
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button size="lg" onClick={handleNext} className="h-14 px-10 text-lg group bg-amber-400 text-forest-600 hover:bg-amber-300">
                    Continue to Payment <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in">
                <h2 className="font-display text-3xl text-forest-600 mb-2">Secure Payment</h2>
                <p className="font-body text-warm-500 flex items-center gap-2 mb-8">
                  <Lock className="w-4 h-4" /> Payments processed securely via Stripe.
                </p>
                
                <div className="bg-warm-50 rounded-2xl p-8 border border-warm-200 mb-8 relative overflow-hidden">
                  {/* Mock Stripe Element */}
                  <div className="absolute top-4 right-4 text-warm-300">
                    <CreditCard className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div>
                      <label className="block text-xs font-medium text-warm-600 uppercase tracking-wide mb-2 font-body">Card Number</label>
                      <div className="w-full bg-white border border-warm-200 rounded-xl h-12 flex items-center px-4 text-warm-400 font-mono text-sm shadow-inner">
                        **** **** **** 4242
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-warm-600 uppercase tracking-wide mb-2 font-body">Expiry</label>
                        <div className="w-full bg-white border border-warm-200 rounded-xl h-12 flex items-center px-4 text-warm-400 font-mono text-sm shadow-inner">
                          MM / YY
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-warm-600 uppercase tracking-wide mb-2 font-body">CVC</label>
                        <div className="w-full bg-white border border-warm-200 rounded-xl h-12 flex items-center px-4 text-warm-400 font-mono text-sm shadow-inner">
                          123
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button 
                    size="lg" 
                    onClick={handleSubmit} 
                    disabled={isPending}
                    className="h-14 px-12 text-lg bg-forest-600 hover:bg-forest-500 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isPending ? "Processing..." : `Pay ${formatCurrency(715)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-[24px] shadow-sm border border-warm-100 p-8 sticky top-32">
              <h3 className="font-display text-2xl text-forest-600 mb-6">Booking Summary</h3>
              
              <div className="flex gap-4 pb-6 border-b border-warm-100 mb-6">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1586227740560-8cf2732c1531?w=200&q=80" className="w-full h-full object-cover" alt="Tour" />
                </div>
                <div>
                  <h4 className="font-display text-xl text-forest-600">Classic Sri Lanka</h4>
                  <p className="font-body text-sm text-warm-500">10 Days • Minivan</p>
                  <p className="font-body text-sm text-warm-500">Oct 12 - Oct 22, 2024</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 font-body text-sm text-warm-600">
                <div className="flex justify-between">
                  <span>Vehicle & Driver (10 days)</span>
                  <span className="font-medium text-forest-600">£650</span>
                </div>
                <div className="flex justify-between">
                  <span>Airport Pickup Add-on</span>
                  <span className="font-medium text-forest-600">£28</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span className="font-medium text-forest-600">£37</span>
                </div>
              </div>

              <div className="pt-6 border-t border-warm-100 flex justify-between items-end">
                <span className="font-display text-xl text-forest-600">Total</span>
                <div className="text-right">
                  <span className="font-display text-3xl text-forest-600">{formatCurrency(715)}</span>
                  <p className="text-xs text-warm-400 font-body">~$908 USD</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
