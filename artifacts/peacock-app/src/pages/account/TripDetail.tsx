import React, { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { useBooking, useTour, useCYORequests } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { PriceSummary } from '@/components/shared/PriceSummary';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MapPlaceholder } from '@/components/shared/MapPlaceholder';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Calendar, Users, Car, Phone, Globe, ChevronDown, ChevronUp,
  Download, FileText, MessageCircle, RotateCcw, X, Sparkles, Check, Clock
} from 'lucide-react';

const STATUS_STEPS = ['Booked', 'Confirmed', 'Upcoming', 'In Progress', 'Completed'];

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const statusMap: Record<string, number> = {
    'Pending': 0,
    'Upcoming': 2,
    'confirmed': 2,
    'In Progress': 3,
    'Completed': 4,
    'Quote Paid': 1,
    'Cancelled': -1,
  };
  const currentIdx = statusMap[currentStatus] ?? 0;

  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="font-body font-semibold text-red-700">Booking Cancelled</h4>
            <p className="font-body text-sm text-red-500">This booking has been cancelled.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-[2px] bg-warm-100" />
        <div
          className="absolute top-5 left-0 h-[2px] bg-forest-500 transition-all"
          style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="relative flex flex-col items-center z-10">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
              i <= currentIdx
                ? 'bg-forest-500 border-forest-500 text-white'
                : 'bg-white border-warm-200 text-warm-300'
            )}>
              {i < currentIdx ? <Check className="w-4 h-4" /> :
               i === currentIdx ? <Clock className="w-4 h-4" /> :
               <span className="text-xs font-body">{i + 1}</span>}
            </div>
            <span className={cn(
              'font-body text-xs mt-2 whitespace-nowrap',
              i <= currentIdx ? 'text-forest-600 font-medium' : 'text-warm-400'
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriverCard({ driver }: { driver: any }) {
  if (!driver) {
    return (
      <div className="bg-warm-50 rounded-2xl border border-warm-100 p-6 mb-6">
        <h4 className="font-body font-semibold text-forest-600 mb-2">Your Driver</h4>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-warm-200 flex items-center justify-center">
            <Car className="w-5 h-5 text-warm-400" />
          </div>
          <p className="font-body text-sm text-warm-500 italic">Your driver will be assigned closer to your trip date</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
      <h4 className="font-body font-semibold text-forest-600 mb-4">Your Driver</h4>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-display text-xl">
          {driver.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h5 className="font-body font-semibold text-forest-600">{driver.name}</h5>
          <div className="flex items-center gap-1 mt-1">
            <Globe className="w-3.5 h-3.5 text-warm-400" />
            <span className="font-body text-sm text-warm-500">{driver.languages.join(", ")}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Phone className="w-3.5 h-3.5 text-warm-400" />
            <span className="font-body text-sm text-warm-500">{driver.phone}</span>
          </div>
        </div>
        <a href={`tel:${driver.phone}`}>
          <Button variant="outline" className="rounded-pill">
            <Phone className="w-4 h-4 mr-2" /> Contact driver
          </Button>
        </a>
      </div>
    </div>
  );
}

function TripDetailsForm() {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passport, setPassport] = useState('');
  const [hotels, setHotels] = useState('');
  const [flight, setFlight] = useState('');

  return (
    <div className="bg-white rounded-2xl border border-warm-100 mb-6 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-warm-50 transition-colors"
      >
        <h4 className="font-body font-semibold text-forest-600">Add trip details</h4>
        {expanded ? <ChevronUp className="w-5 h-5 text-warm-400" /> : <ChevronDown className="w-5 h-5 text-warm-400" />}
      </button>
      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-warm-100 pt-4">
          <p className="font-body text-sm text-warm-500">These details help your driver prepare for your arrival</p>
          <div>
            <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Passport number</label>
            <input
              value={passport}
              onChange={e => { setPassport(e.target.value); setSaved(false); }}
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
              placeholder="Enter your passport number"
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Hotel names</label>
            <textarea
              value={hotels}
              onChange={e => { setHotels(e.target.value); setSaved(false); }}
              rows={3}
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
              placeholder="List the hotels you have booked along the route"
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Flight number (arrival)</label>
            <input
              value={flight}
              onChange={e => { setFlight(e.target.value); setSaved(false); }}
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
              placeholder="e.g. BA 2081"
            />
          </div>
          <Button
            onClick={() => setSaved(true)}
            className="rounded-pill"
          >
            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : 'Save details'}
          </Button>
        </div>
      )}
    </div>
  );
}

function RescheduleModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-2xl text-forest-600 mb-4">Request Reschedule</h3>
        <div className="bg-warm-50 rounded-xl p-4 mb-4 font-body text-sm text-warm-600 space-y-2">
          <p><strong>Reschedule Policy:</strong></p>
          <p>Free reschedule if more than 10 days before departure.</p>
          <p>A fee of {"\u00a3"}50 applies if less than 10 days before departure.</p>
        </div>
        <div className="mb-4">
          <label className="font-body text-sm font-medium text-forest-600 mb-1.5 block">Preferred new date</label>
          <input type="date" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
        </div>
        <div className="flex gap-3">
          <Button className="rounded-pill flex-1" onClick={onClose}>Submit Request</Button>
          <Button variant="outline" className="rounded-pill" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ onClose, total }: { onClose: () => void; total: number }) {
  const { format } = useCurrency();
  const refundAmount = Math.round(total * 0.8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-2xl text-red-600 mb-4">Cancel Booking</h3>
        <div className="bg-red-50 rounded-xl p-4 mb-4 font-body text-sm text-red-700 space-y-2">
          <p><strong>Cancellation Policy:</strong></p>
          <p>More than 14 days before: 90% refund</p>
          <p>7{"\u2013"}14 days before: 50% refund</p>
          <p>Less than 7 days: No refund</p>
        </div>
        <div className="bg-warm-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between font-body text-sm">
            <span className="text-warm-600">Estimated refund</span>
            <span className="font-semibold text-forest-600">{format(refundAmount)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="destructive" className="rounded-pill flex-1" onClick={onClose}>Confirm Cancellation</Button>
          <Button variant="outline" className="rounded-pill" onClick={onClose}>Keep Booking</Button>
        </div>
      </div>
    </div>
  );
}

export default function TripDetail() {
  const [, params] = useRoute('/account/bookings/:id');
  const bookingId = params?.id || 'BK-2026-001';
  const { data: booking, isLoading: loadingBooking } = useBooking(bookingId);
  const { data: cyoRequests } = useCYORequests();
  const { format } = useCurrency();
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [itineraryExpanded, setItineraryExpanded] = useState(false);

  const isCYO = bookingId.startsWith('CTR') || bookingId.startsWith('CYO');
  const cyoData = isCYO ? cyoRequests?.find(r => r.id === bookingId) : null;

  const tourSlug = booking?.tourId || '';
  const { data: tour } = useTour(tourSlug);

  if (isCYO && !cyoData) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-warm-100 rounded-xl animate-pulse w-48" />
        <div className="h-32 bg-white border border-warm-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white border border-warm-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isCYO && cyoData) {
    return (
      <div>
        <Link href="/account/bookings">
          <button className="flex items-center gap-2 font-body text-sm text-warm-500 hover:text-forest-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </button>
        </Link>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-body font-medium bg-amber-100 text-amber-700">Quote Ready</span>
          </div>
          <h2 className="font-display text-3xl text-forest-600 mb-1">Custom Trip Quote</h2>
          <p className="font-body text-warm-500">{cyoData.locations.join(" \u2192 ")} {"\u2022"} {cyoData.duration} days</p>
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
          <h4 className="font-body font-bold text-forest-600 mb-4">Quote Breakdown</h4>
          <div className="space-y-3">
            {cyoData.quotedItems.map((item: any, i: number) => (
              <div key={i} className="flex justify-between font-body text-sm">
                <span className="text-warm-600">{item.label}</span>
                <span className="text-forest-600 font-medium">{format(item.amount)}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-forest-500 pt-4 mt-4 flex justify-between items-end">
            <span className="font-body font-bold text-forest-600">Total</span>
            <span className="font-display text-3xl text-forest-600">{format(cyoData.quotedAmount)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
          <h4 className="font-body font-semibold text-forest-600 mb-3">Trip Details</h4>
          <div className="grid grid-cols-2 gap-4 font-body text-sm">
            <div>
              <span className="text-warm-400 block">Trip type</span>
              <span className="text-forest-600 font-medium">{cyoData.tripType}</span>
            </div>
            <div>
              <span className="text-warm-400 block">Travellers</span>
              <span className="text-forest-600 font-medium">{cyoData.travellers}</span>
            </div>
            <div>
              <span className="text-warm-400 block">Budget</span>
              <span className="text-forest-600 font-medium">{cyoData.budget}</span>
            </div>
            <div>
              <span className="text-warm-400 block">Style</span>
              <span className="text-forest-600 font-medium">{cyoData.travelStyle.join(", ")}</span>
            </div>
          </div>
          {cyoData.specialRequests && (
            <div className="mt-4 pt-4 border-t border-warm-100">
              <span className="font-body text-sm text-warm-400 block mb-1">Special requests</span>
              <p className="font-body text-sm text-forest-600">{cyoData.specialRequests}</p>
            </div>
          )}
        </div>

        <Button className="w-full rounded-pill bg-amber-500 hover:bg-amber-600 text-white text-lg py-6 font-body font-semibold">
          Pay Now {"\u2014"} {format(cyoData.quotedAmount)}
        </Button>
      </div>
    );
  }

  if (loadingBooking) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-warm-100 rounded-xl animate-pulse w-48" />
        <div className="h-32 bg-white border border-warm-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white border border-warm-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16">
        <h2 className="font-display text-2xl text-forest-600 mb-2">Booking not found</h2>
        <Link href="/account/bookings">
          <Button className="rounded-pill mt-4">Back to My Trips</Button>
        </Link>
      </div>
    );
  }

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <Link href="/account/bookings">
        <button className="flex items-center gap-2 font-body text-sm text-warm-500 hover:text-forest-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Trips
        </button>
      </Link>

      <StatusTimeline currentStatus={booking.status} />

      <div className="bg-white rounded-2xl border border-warm-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-3xl text-forest-600 mb-1">{booking.title}</h2>
            <p className="font-body text-warm-500">{formatDate(booking.startDate)} {"\u2013"} {formatDate(booking.endDate)} {"\u2022"} {durationDays} days</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-warm-400" />
            <div>
              <span className="font-body text-xs text-warm-400 block">Vehicle</span>
              <span className="font-body text-sm font-medium text-forest-600">{booking.vehicle}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-warm-400" />
            <div>
              <span className="font-body text-xs text-warm-400 block">Passengers</span>
              <span className="font-body text-sm font-medium text-forest-600">{booking.passengers}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-warm-400" />
            <div>
              <span className="font-body text-xs text-warm-400 block">Duration</span>
              <span className="font-body text-sm font-medium text-forest-600">{durationDays} days</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-warm-400" />
            <div>
              <span className="font-body text-xs text-warm-400 block">Booking ID</span>
              <span className="font-body text-sm font-medium text-forest-600">{booking.id}</span>
            </div>
          </div>
        </div>

        {tour && tour.stops && (
          <MapPlaceholder locations={tour.stops.map((s: any) => s.name || s)} className="mb-4" />
        )}

        {tour && tour.itinerary && (
          <div className="border-t border-warm-100 pt-4">
            <button
              onClick={() => setItineraryExpanded(!itineraryExpanded)}
              className="w-full flex items-center justify-between py-2"
            >
              <h4 className="font-body font-semibold text-forest-600">Itinerary</h4>
              {itineraryExpanded ? <ChevronUp className="w-5 h-5 text-warm-400" /> : <ChevronDown className="w-5 h-5 text-warm-400" />}
            </button>
            {itineraryExpanded && (
              <div className="space-y-2 mt-2">
                {tour.itinerary.map((day: any, i: number) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-warm-50 last:border-0">
                    <span className="font-body text-xs font-medium text-amber-500 bg-amber-50 px-2.5 py-1 rounded-pill whitespace-nowrap h-fit">Day {day.day}</span>
                    <span className="font-body text-sm text-forest-600">{day.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DriverCard driver={booking.driver} />

      {(booking.status === 'Upcoming' || booking.status === 'Pending') && (
        <TripDetailsForm />
      )}

      <PriceSummary
        items={[
          { label: `${booking.vehicle} \u2013 ${durationDays} days`, amount: booking.pricing.vehicleTotal },
          ...(booking.pricing.addOnsTotal > 0 ? [{ label: 'Add-ons', amount: booking.pricing.addOnsTotal }] : []),
          ...(booking.pricing.taxesAndFees > 0 ? [{ label: 'Taxes & fees', amount: booking.pricing.taxesAndFees }] : []),
        ]}
        className="mb-6"
      />

      {(booking.status === 'Upcoming' || booking.status === 'Completed') && (
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-body font-medium bg-emerald-100 text-emerald-700">
            <Check className="w-3.5 h-3.5 mr-1" /> Paid
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {booking.status === 'Upcoming' && (
          <>
            <Button variant="outline" className="rounded-pill" onClick={() => setShowReschedule(true)}>
              <RotateCcw className="w-4 h-4 mr-2" /> Request Reschedule
            </Button>
            <button
              onClick={() => setShowCancel(true)}
              className="px-4 py-2 rounded-pill font-body text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
            >
              <X className="w-4 h-4 mr-1 inline" /> Cancel Booking
            </button>
          </>
        )}
        <Button variant="outline" className="rounded-pill">
          <Download className="w-4 h-4 mr-2" /> Download Invoice
        </Button>
        <Button variant="outline" className="rounded-pill">
          <FileText className="w-4 h-4 mr-2" /> Download Itinerary
        </Button>
        <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer">
          <button className="px-4 py-2 rounded-pill font-body text-sm font-medium text-warm-500 hover:bg-warm-50 transition-colors border border-transparent hover:border-warm-200">
            <MessageCircle className="w-4 h-4 mr-1 inline" /> Contact Support
          </button>
        </a>
      </div>

      {showReschedule && <RescheduleModal onClose={() => setShowReschedule(false)} />}
      {showCancel && <CancelModal onClose={() => setShowCancel(false)} total={booking.price} />}
    </div>
  );
}
