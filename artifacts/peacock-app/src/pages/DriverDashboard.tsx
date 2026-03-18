import React from 'react';
import { Link } from 'wouter';
import { MapPin, Phone, MessageSquare, CheckCircle, Navigation, Clock, ArrowRight, Calendar as CalendarIcon, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function DriverDashboard() {
  // Mobile-first design for drivers
  return (
    <div className="min-h-screen bg-warm-50 pb-20 md:pb-0">
      
      {/* Mobile Header */}
      <div className="bg-forest-600 text-white px-5 pt-12 pb-24 rounded-b-[40px] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-forest-600 font-display text-2xl italic pr-1">P</div>
          <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden border border-white/30 backdrop-blur-sm">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Profile" />
          </div>
        </div>
        <p className="font-body text-white/80 text-sm mb-1">Good morning,</p>
        <h1 className="font-display text-4xl mb-4">Dudley Silva</h1>
      </div>

      <div className="px-5 -mt-16 max-w-lg mx-auto">
        {/* Today's Active Trip Card */}
        <div className="bg-white rounded-[24px] shadow-lg border border-warm-100 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Badge variant="amber" className="mb-2">Active Trip</Badge>
              <h2 className="font-display text-2xl text-forest-600">Airport Transfer</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-warm-400 font-body uppercase tracking-wider mb-1">Earn</p>
              <p className="font-body font-bold text-forest-500">{formatCurrency(45)}</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6 relative">
            <div className="absolute left-3.5 top-5 bottom-5 w-px bg-warm-200 border-dashed" />
            <div className="flex gap-4 relative z-10">
              <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
              </div>
              <div>
                <p className="font-body text-xs text-warm-400 mb-0.5">Pickup • 10:30 AM</p>
                <p className="font-body font-medium text-forest-600">Bandaranaike Int. Airport</p>
              </div>
            </div>
            <div className="flex gap-4 relative z-10">
              <div className="w-7 h-7 rounded-full bg-forest-100 border-2 border-white flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-forest-500" />
              </div>
              <div>
                <p className="font-body text-xs text-warm-400 mb-0.5">Dropoff</p>
                <p className="font-body font-medium text-forest-600">Galle Face Hotel, Colombo</p>
              </div>
            </div>
          </div>

          <div className="bg-warm-50 rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-forest-500 font-display text-xl">S</div>
              <div>
                <p className="font-body font-medium text-forest-600 text-sm">Sarah Jenkins</p>
                <p className="font-body text-xs text-warm-500">2 Passengers • +44 7700...</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="tel:+447700" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-forest-500 hover:bg-forest-50">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-forest-600 hover:bg-forest-500 h-14 rounded-2xl shadow-md">
              <Navigation className="w-5 h-5 mr-2" /> Navigate
            </Button>
            <Button variant="outline" className="flex-1 h-14 rounded-2xl text-forest-600 border-warm-200">
              Complete
            </Button>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[20px] p-5 border border-warm-100 shadow-sm">
            <p className="font-body text-sm text-warm-500 mb-2">This Week</p>
            <p className="font-display text-3xl text-forest-600">{formatCurrency(420)}</p>
            <p className="font-body text-xs text-success mt-1">↑ 12% vs last week</p>
          </div>
          <div className="bg-white rounded-[20px] p-5 border border-warm-100 shadow-sm">
            <p className="font-body text-sm text-warm-500 mb-2">Trips</p>
            <p className="font-display text-3xl text-forest-600">8</p>
            <p className="font-body text-xs text-warm-400 mt-1">3 upcoming</p>
          </div>
        </div>

        <h3 className="font-display text-2xl text-forest-600 mb-4">Upcoming</h3>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-warm-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sage flex flex-col items-center justify-center">
                <span className="font-display text-xs text-forest-600 leading-none">OCT</span>
                <span className="font-display text-lg text-forest-600 leading-none mt-1">12</span>
              </div>
              <div>
                <p className="font-body font-medium text-forest-600 text-sm">Classic Sri Lanka (10d)</p>
                <p className="font-body text-xs text-warm-400 mt-0.5">CMB Pickup • 09:00 AM</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-warm-300" />
          </div>
        </div>

      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 px-6 py-3 flex justify-between items-center z-50 md:hidden pb-safe">
        <Link href="/driver" className="flex flex-col items-center text-forest-600">
          <MapPin className="w-6 h-6 mb-1" />
          <span className="font-body text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/driver/trips" className="flex flex-col items-center text-warm-400">
          <CalendarIcon className="w-6 h-6 mb-1" />
          <span className="font-body text-[10px] font-medium">Trips</span>
        </Link>
        <Link href="/driver/earnings" className="flex flex-col items-center text-warm-400">
          <CreditCard className="w-6 h-6 mb-1" />
          <span className="font-body text-[10px] font-medium">Earnings</span>
        </Link>
        <Link href="/driver/profile" className="flex flex-col items-center text-warm-400">
          <User className="w-6 h-6 mb-1" />
          <span className="font-body text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}
