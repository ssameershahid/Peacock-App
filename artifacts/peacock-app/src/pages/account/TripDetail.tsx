import React, { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { useBooking, useTour, useCYORequests, useReview, useCreateReview, useUpdateBookingDetails, useCreateShareLink } from '@/hooks/use-app-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { PriceSummary } from '@/components/shared/PriceSummary';
import { MapView } from '@/components/shared/MapView';
import { getCoords } from '@/lib/mapbox';
import { downloadInvoicePDF, type InvoiceData } from '@/components/shared/InvoicePDF';
import { formatDateRange, formatDateRangeWithDay } from '@/lib/date-utils';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Calendar, Users, Car, Phone, Globe, ChevronDown, ChevronUp,
  Download, FileText, MessageCircle, RotateCcw, X, Sparkles, Check, Clock,
  Plane, CreditCard, Building2, MessageSquare, Heart, Share2, Copy, Mail,
  Star, AlertTriangle, UserCircle, MapPin
} from 'lucide-react';

const STATUS_STEPS = ['Booked', 'Confirmed', 'Upcoming', 'In Progress', 'Completed'];

// ── Refined Status Timeline ─────────────────────────────────────────────────

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const statusMap: Record<string, number> = {
    'Pending': 0, 'Upcoming': 2, 'confirmed': 2,
    'In Progress': 3, 'Completed': 4, 'Quote Paid': 1, 'Cancelled': -1,
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
        {/* Track lines */}
        <div className="absolute top-5 left-0 right-0 h-[2px]">
          {/* Future dashed line */}
          <div className="w-full h-full border-t-2 border-dashed border-warm-100" />
        </div>
        {/* Completed solid line */}
        <div
          className="absolute top-5 left-0 h-[2px] bg-forest-500 transition-all"
          style={{ width: `${Math.max(0, ((currentIdx - 0.5) / (STATUS_STEPS.length - 1)) * 100)}%` }}
        />
        {/* Current amber segment */}
        {currentIdx > 0 && currentIdx < STATUS_STEPS.length && (
          <div
            className="absolute top-5 h-[2px] bg-amber-200 transition-all"
            style={{
              left: `${((currentIdx - 0.5) / (STATUS_STEPS.length - 1)) * 100}%`,
              width: `${(0.5 / (STATUS_STEPS.length - 1)) * 100}%`,
            }}
          />
        )}

        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="relative flex flex-col items-center z-10">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
              i < currentIdx && 'bg-forest-500 border-forest-500 text-white',
              i === currentIdx && 'bg-amber-200 border-amber-200 text-warm-900 scale-110 shadow-md',
              i > currentIdx && 'bg-white border-warm-200 text-warm-300'
            )}>
              {i < currentIdx ? <Check className="w-4 h-4" /> :
               i === currentIdx ? <Clock className="w-4 h-4" /> :
               <span className="text-xs font-body">{i + 1}</span>}
            </div>
            <span className={cn(
              'font-body text-xs mt-2 whitespace-nowrap',
              i < currentIdx && 'text-forest-600 font-medium',
              i === currentIdx && 'text-amber-600 font-medium',
              i > currentIdx && 'text-warm-300'
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Enhanced Driver Card ────────────────────────────────────────────────────

function DriverCard({ driver, tripDaysUntil }: { driver: any; tripDaysUntil?: number }) {
  if (!driver) {
    const isUrgent = tripDaysUntil !== undefined && tripDaysUntil <= 3;
    return (
      <div className={cn(
        'relative rounded-2xl border-2 border-dashed p-6 mb-6',
        isUrgent ? 'border-amber-300 bg-amber-50' : 'border-warm-200 bg-white'
      )}>
        {isUrgent && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-400 rounded-l-2xl" />}
        <div className="flex items-center gap-4">
          <UserCircle className={cn('w-12 h-12', isUrgent ? 'text-amber-400' : 'text-warm-300')} />
          <div>
            <h4 className="font-body text-base font-medium text-warm-700">
              {isUrgent ? 'We\'re finalizing your driver assignment' : 'Your driver will be confirmed soon'}
            </h4>
            <p className="font-body text-sm text-warm-500 mt-1">
              {isUrgent
                ? 'If you have any concerns, please contact us.'
                : 'We typically assign drivers 3-7 days before your trip. You\'ll be notified when your driver is confirmed.'}
            </p>
            {isUrgent && (
              <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer">
                <button className="mt-3 border border-warm-300 text-warm-600 font-body text-sm font-medium px-4 py-2 rounded-full hover:bg-warm-50 transition-colors">
                  Contact support
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-100 border-l-[3px] border-l-sage p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 font-display text-2xl shrink-0">
          {driver.photo
            ? <img src={driver.photo} alt="" className="w-full h-full rounded-full object-cover" />
            : driver.name?.charAt(0)
          }
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-body text-[12px] font-medium tracking-[0.08em] uppercase text-warm-400 block">Your driver</span>
          <h4 className="font-body text-lg font-semibold text-warm-900">{driver.name}</h4>
          {driver.experienceYears > 0 && (
            <p className="font-body text-sm text-warm-500">{driver.experienceYears} years experience</p>
          )}
          {driver.languages && driver.languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {driver.languages.map((lang: string) => (
                <span key={lang} className="font-body text-xs bg-sage text-forest-700 px-2.5 py-1 rounded-full">
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <a href={`tel:${driver.phone}`}>
            <button className="bg-forest-500 text-white rounded-full h-11 px-5 font-body text-sm font-medium hover:bg-forest-400 transition-colors inline-flex items-center gap-2">
              <Phone className="w-4 h-4" /> Call
            </button>
          </a>
          <a href={`https://wa.me/${driver.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
            <button className="bg-[#25D366] text-white rounded-full h-11 px-5 font-body text-sm font-medium hover:bg-[#20BD5A] transition-colors inline-flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Preparation Checklist (Accordion) ───────────────────────────────────────

function PreparationSection({ booking, bookingId }: { booking: any; bookingId: string }) {
  const { toast } = useToast();
  const updateDetails = useUpdateBookingDetails();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [flight, setFlight] = useState(booking?.flightNumber || '');
  const [passport, setPassport] = useState(booking?.passportNumber || '');
  const [hotels, setHotels] = useState(booking?.hotelDetails || '');
  const [specialReq, setSpecialReq] = useState(booking?.specialRequests || '');
  const [ecName, setEcName] = useState(booking?.emergencyContactName || '');
  const [ecPhone, setEcPhone] = useState(booking?.emergencyContactPhone || '');
  const [ecRelation, setEcRelation] = useState(booking?.emergencyContactRelationship || '');

  const sections = [
    {
      key: 'flight', icon: Plane, label: 'Flight details',
      done: !!flight,
      help: 'Your driver can track your flight and adjust pickup time if your flight is delayed',
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Flight number (arrival)</label>
            <input value={flight} onChange={e => setFlight(e.target.value)} placeholder="e.g. BA 2081"
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
          </div>
        </div>
      ),
      save: () => updateDetails.mutateAsync({ id: bookingId, data: { flightNumber: flight } }),
    },
    {
      key: 'passport', icon: CreditCard, label: 'Passport / ID',
      done: !!passport,
      help: 'Required for hotel check-ins and some attraction entries',
      content: (
        <div>
          <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Passport number</label>
          <input value={passport} onChange={e => setPassport(e.target.value)} placeholder="Enter your passport number"
            className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
        </div>
      ),
      save: () => updateDetails.mutateAsync({ id: bookingId, data: { passportNumber: passport } }),
    },
    {
      key: 'hotels', icon: Building2, label: 'Hotels & accommodation',
      done: !!hotels,
      help: 'List the hotels you\'ve booked so your driver can plan routes and dropoffs',
      content: (
        <div>
          <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Hotel names and addresses</label>
          <textarea value={hotels} onChange={e => setHotels(e.target.value)} rows={3} placeholder="List the hotels you have booked along the route"
            className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
        </div>
      ),
      save: () => updateDetails.mutateAsync({ id: bookingId, data: { hotelDetails: hotels } }),
    },
    {
      key: 'requests', icon: MessageSquare, label: 'Special requests',
      done: !!specialReq,
      help: 'Child seats, dietary needs, specific stops — tell us anything',
      content: (
        <div>
          <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Special requests</label>
          <textarea value={specialReq} onChange={e => setSpecialReq(e.target.value)} rows={3} placeholder="Child seats, dietary needs, specific stops..."
            className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none" />
        </div>
      ),
      save: () => updateDetails.mutateAsync({ id: bookingId, data: { specialRequests: specialReq } }),
    },
    {
      key: 'emergency', icon: Heart, label: 'Emergency contact',
      done: !!ecName,
      help: 'In case of emergency, we\'ll contact this person on your behalf',
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Emergency contact name</label>
            <input value={ecName} onChange={e => setEcName(e.target.value)} placeholder="Full name"
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Phone number</label>
            <input value={ecPhone} onChange={e => setEcPhone(e.target.value)} placeholder="+44 7700 900123"
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Relationship</label>
            <select value={ecRelation} onChange={e => setEcRelation(e.target.value)}
              className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-white appearance-none">
              <option value="">Select relationship</option>
              <option value="Partner">Partner</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      ),
      save: () => updateDetails.mutateAsync({ id: bookingId, data: { emergencyContactName: ecName, emergencyContactPhone: ecPhone, emergencyContactRelationship: ecRelation } }),
    },
  ];

  const completedCount = sections.filter(s => s.done).length;
  const pct = (completedCount / sections.length) * 100;

  const handleSave = async (section: typeof sections[0]) => {
    try {
      await section.save();
      toast({ title: `${section.label} saved` });
      setExpanded(null);
    } catch {
      toast({ title: 'Error saving', variant: 'destructive' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-warm-100 mb-6 overflow-hidden">
      <div className="p-6 pb-0">
        <h4 className="font-display text-xl text-warm-900 mb-4">
          Prepare for your <em className="italic">trip</em>
        </h4>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-body text-xs text-warm-500">{completedCount} of {sections.length} completed</span>
            <span className="font-body text-xs font-medium text-forest-600">{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
            <div className="h-full bg-forest-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      <div>
        {sections.map(section => {
          const isOpen = expanded === section.key;
          const Icon = section.icon;
          return (
            <div key={section.key} className="border-t border-warm-100">
              <button
                onClick={() => setExpanded(isOpen ? null : section.key)}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-warm-50 transition-colors"
              >
                <Icon className={cn('w-5 h-5 shrink-0', section.done ? 'text-forest-500' : 'text-warm-400')} />
                <span className="font-body text-sm font-medium text-warm-700 flex-1 text-left">{section.label}</span>
                <span className={cn('font-body text-xs', section.done ? 'text-emerald-600' : 'text-amber-600')}>
                  {section.done ? 'Added ✓' : 'Not yet added'}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-warm-400" /> : <ChevronDown className="w-4 h-4 text-warm-400" />}
              </button>
              {isOpen && (
                <div className="px-6 pb-5 space-y-3">
                  {section.content}
                  <p className="font-body text-xs text-warm-400">{section.help}</p>
                  <Button onClick={() => handleSave(section)} className="rounded-pill" disabled={updateDetails.isPending}>
                    {updateDetails.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Review Section ──────────────────────────────────────────────────────────

function ReviewSection({ bookingId }: { bookingId: string }) {
  const { data: existingReview } = useReview(bookingId);
  const createReview = useCreateReview();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Show submitted review
  if (existingReview || submitted) {
    const review = existingReview || { rating, reviewText, wouldRecommend };
    return (
      <div className="bg-[#F8F5F0] rounded-2xl border-l-[3px] border-amber-200 p-6 mb-6">
        <h4 className="font-display text-lg text-warm-900 mb-3">Your review</h4>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={cn('w-6 h-6', i <= review.rating ? 'text-amber-200 fill-amber-200' : 'text-warm-200')} />
          ))}
        </div>
        {review.reviewText && <p className="font-body text-sm text-warm-600">{review.reviewText}</p>}
        <p className="font-body text-xs text-warm-400 mt-2">Thank you for your feedback!</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await createReview.mutateAsync({
        bookingId,
        rating,
        reviewText: reviewText || undefined,
        wouldRecommend: wouldRecommend ?? undefined,
      });
      setSubmitted(true);
      toast({ title: 'Thank you for your review!' });
    } catch {
      toast({ title: 'Failed to submit review', variant: 'destructive' });
    }
  };

  return (
    <div className="bg-[#F8F5F0] rounded-2xl border-l-[3px] border-amber-200 p-6 mb-6" id="review-section">
      <h4 className="font-display text-xl text-warm-900 mb-1">How was your trip?</h4>
      <p className="font-body text-sm text-warm-500 mb-4">Your feedback helps us improve and helps future travelers</p>

      {/* Star rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
            className="focus:outline-none"
          >
            <Star className={cn(
              'w-8 h-8 transition-colors',
              i <= (hoverRating || rating)
                ? 'text-amber-200 fill-amber-200'
                : 'text-warm-200'
            )} />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Tell us about your experience (optional)"
            className="w-full border border-warm-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none mb-1 bg-white"
          />
          <p className="font-body text-xs text-warm-400 text-right mb-4">{reviewText.length}/500</p>

          <div className="mb-5">
            <p className="font-body text-sm text-warm-600 mb-2">Would you recommend Peacock Drivers to a friend?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setWouldRecommend(true)}
                className={cn(
                  'px-5 py-2 rounded-full font-body text-sm font-medium transition-colors border',
                  wouldRecommend === true ? 'bg-forest-500 text-white border-forest-500' : 'border-warm-200 text-warm-600 hover:bg-warm-50'
                )}
              >Yes</button>
              <button
                onClick={() => setWouldRecommend(false)}
                className={cn(
                  'px-5 py-2 rounded-full font-body text-sm font-medium transition-colors border',
                  wouldRecommend === false ? 'bg-red-500 text-white border-red-500' : 'border-warm-200 text-warm-600 hover:bg-warm-50'
                )}
              >No</button>
            </div>
          </div>

          <Button onClick={handleSubmit} className="rounded-pill" disabled={createReview.isPending}>
            {createReview.isPending ? 'Submitting...' : 'Submit review'}
          </Button>
          <button className="ml-3 font-body text-sm text-warm-400 hover:text-warm-500 transition-colors">
            Maybe later
          </button>
        </>
      )}
    </div>
  );
}

// ── Share Modal ─────────────────────────────────────────────────────────────

function ShareModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const createShareLink = useCreateShareLink();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    createShareLink.mutateAsync(booking.id).then(res => {
      setShareUrl(`${window.location.origin}${res.shareUrl}`);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!' });
  };

  const whatsappText = encodeURIComponent(`I'm going on a ${booking.title} tour with Peacock Drivers! 🇱🇰 ${formatDateRange(booking.startDate, booking.endDate)}\n${shareUrl}`);
  const emailSubject = encodeURIComponent(`My Sri Lanka trip — ${booking.title}`);
  const emailBody = encodeURIComponent(`I'm going on a ${booking.title} tour with Peacock Drivers!\n\nDates: ${formatDateRange(booking.startDate, booking.endDate)}\n\n${shareUrl}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-forest-600">Share your <em className="italic">trip</em></h3>
          <button onClick={onClose} className="p-1.5 bg-warm-50 rounded-full text-warm-500 hover:text-warm-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview card */}
        <div className="bg-warm-50 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-forest-100 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-forest-400" />
          </div>
          <div>
            <h4 className="font-body font-semibold text-forest-600 text-sm">{booking.title}</h4>
            <p className="font-body text-xs text-warm-500">{formatDateRange(booking.startDate, booking.endDate)}</p>
            <p className="font-body text-xs text-warm-400">via Peacock Drivers</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={copyLink}
            disabled={!shareUrl}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-warm-200 hover:bg-warm-50 transition-colors"
          >
            <Copy className="w-5 h-5 text-forest-500" />
            <span className="font-body text-sm font-medium text-warm-700">Copy link</span>
          </button>

          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-warm-200 hover:bg-warm-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <span className="font-body text-sm font-medium text-warm-700">WhatsApp</span>
          </a>

          <a
            href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-warm-200 hover:bg-warm-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-blue-500" />
            <span className="font-body text-sm font-medium text-warm-700">Email</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Modals ───────────────────────────────────────────────────────────────────

function RescheduleModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-2xl text-forest-600 mb-4">Request Reschedule</h3>
        <div className="bg-warm-50 rounded-xl p-4 mb-4 font-body text-sm text-warm-600 space-y-2">
          <p><strong>Reschedule Policy:</strong></p>
          <p>Free reschedule if more than 10 days before departure.</p>
          <p>A fee of £50 applies if less than 10 days before departure.</p>
        </div>
        <div className="mb-4">
          <label className="text-[13px] font-medium text-warm-600 mb-1.5 block">Preferred new date</label>
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
          <p>7–14 days before: 50% refund</p>
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

// ── Main Component ──────────────────────────────────────────────────────────

export default function TripDetail() {
  const [, params] = useRoute('/account/bookings/:id');
  const bookingId = params?.id || '';
  const { data: booking, isLoading: loadingBooking } = useBooking(bookingId);
  const { data: cyoRequests } = useCYORequests();
  const { format } = useCurrency();
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [itineraryExpanded, setItineraryExpanded] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleDownloadInvoice = async () => {
    setDownloadingPDF(true);
    try {
      let invoiceData: InvoiceData | null = null;
      try {
        const inv = await api.get<any>(`/invoices?bookingId=${bookingId}`);
        const realInv = Array.isArray(inv) ? inv[0] : inv;
        if (realInv) {
          invoiceData = {
            invoiceNumber: realInv.invoiceNumber ?? `INV-${bookingId}`,
            issueDate: realInv.issuedAt ? new Date(realInv.issuedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
            status: realInv.status ?? 'PAID',
            customer: {
              name: booking?.customer?.name ?? 'Guest',
              email: booking?.customer?.email ?? '',
            },
            booking: {
              referenceCode: booking?.id ?? bookingId,
              title: booking?.title ?? '',
              startDate: booking?.startDate ?? '',
              endDate: booking?.endDate,
              vehicleType: booking?.vehicle ?? '',
              numDays: booking?.pricing ? Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000) : undefined,
            },
            lineItems: [
              { description: `${booking?.vehicle} — tour package`, amount: booking?.pricing?.vehicleTotal ?? booking?.price ?? 0 },
              ...(booking?.pricing?.addOnsTotal > 0 ? [{ description: 'Add-ons', amount: booking.pricing.addOnsTotal }] : []),
              ...(booking?.pricing?.taxesAndFees > 0 ? [{ description: 'Taxes & fees', amount: booking.pricing.taxesAndFees }] : []),
            ],
            subtotal: booking?.price ?? 0,
            totalGBP: booking?.price ?? 0,
          };
        }
      } catch { /* fall through */ }

      if (!invoiceData && booking) {
        const durationDays = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000);
        invoiceData = {
          invoiceNumber: `INV-${booking.id}`,
          issueDate: new Date().toLocaleDateString('en-GB'),
          status: 'PAID',
          customer: { name: booking.customer?.name ?? 'Guest', email: booking.customer?.email ?? '' },
          booking: { referenceCode: booking.id, title: booking.title, startDate: booking.startDate, endDate: booking.endDate, vehicleType: booking.vehicle, numDays: durationDays },
          lineItems: [
            { description: `${booking.vehicle} — ${durationDays} days`, amount: booking.pricing?.vehicleTotal ?? booking.price ?? 0 },
            ...(booking.pricing?.addOnsTotal > 0 ? [{ description: 'Add-ons', amount: booking.pricing.addOnsTotal }] : []),
            ...(booking.pricing?.taxesAndFees > 0 ? [{ description: 'Taxes & fees', amount: booking.pricing.taxesAndFees }] : []),
          ],
          subtotal: booking.price ?? 0,
          totalGBP: booking.price ?? 0,
        };
      }
      if (invoiceData) await downloadInvoicePDF(invoiceData);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const isCYO = bookingId.startsWith('CTR') || bookingId.startsWith('CYO');
  const cyoData = isCYO ? cyoRequests?.find((r: any) => r.id === bookingId) : null;

  const tourSlug = booking?.tourSlug || '';
  const { data: tour } = useTour(tourSlug);

  // Loading state
  if ((isCYO && !cyoData) || loadingBooking) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-warm-100 rounded-xl animate-pulse w-48" />
        <div className="h-32 bg-white border border-warm-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white border border-warm-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // CYO detail view
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
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-body font-medium bg-amber-100 text-amber-700">Quote Ready</span>
          </div>
          <h2 className="font-display text-3xl text-forest-600 mb-1">Custom Trip Quote</h2>
          <p className="font-body text-warm-500">{cyoData.locations?.join(' → ')} · {cyoData.duration || cyoData.durationDays} days</p>
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
          <h4 className="font-body font-bold text-forest-600 mb-4">Quote Breakdown</h4>
          <div className="space-y-3">
            {(cyoData.quotedItems || []).map((item: any, i: number) => (
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

        <Button className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-forest-800 text-lg py-6 font-body font-semibold transition-all duration-200">
          Pay Now — {format(cyoData.quotedAmount)}
        </Button>
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
  const tripDaysUntil = Math.ceil((startDate.getTime() - Date.now()) / 86400000);
  const isCompleted = booking.status === 'Completed';
  const isUpcoming = booking.status === 'Upcoming' || booking.status === 'Pending';

  // Tour image for header
  const heroImage = tour?.images?.[0] || tour?.image;

  return (
    <div>
      <Link href="/account/bookings">
        <button className="flex items-center gap-2 font-body text-sm text-warm-500 hover:text-forest-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Trips
        </button>
      </Link>

      {/* 1. Status Timeline */}
      <StatusTimeline currentStatus={booking.status} />

      {/* 2. Review section for completed trips */}
      {isCompleted && <ReviewSection bookingId={bookingId} />}

      {/* 3. Driver Info Card */}
      <DriverCard driver={booking.driver} tripDaysUntil={isUpcoming ? tripDaysUntil : undefined} />

      {/* 4. Booking Header with tour image */}
      <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden mb-6">
        {heroImage && (
          <div
            className="h-40 md:h-52 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent 40%, rgba(27,60,52,0.7) 100%), url(${heroImage})`,
            }}
          />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-3xl text-forest-600 mb-1">{booking.title}</h2>
              <p className="font-body text-warm-500">
                {formatDateRangeWithDay(booking.startDate, booking.endDate)} · {durationDays} days
              </p>
            </div>
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

          {/* Itinerary section */}
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
                      <span className="font-body text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-pill whitespace-nowrap h-fit">Day {day.day}</span>
                      <div>
                        <span className="font-body text-sm text-forest-600 font-medium">{day.title}</span>
                        {day.description && <p className="font-body text-xs text-warm-500 mt-0.5">{day.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Preparation checklist (for upcoming bookings) */}
      {isUpcoming && <PreparationSection booking={booking} bookingId={bookingId} />}

      {/* 6. Route Map */}
      {tour && (tour.stops || tour.itinerary) && (() => {
        const locs: string[] = tour.stops
          ? tour.stops.map((s: any) => s.name || s)
          : (tour.itinerary || []).map((d: any) => d.location).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
        const tripMarkers = locs.reduce((acc: any[], loc: string, i: number) => {
          const coords = getCoords(loc);
          if (coords) acc.push({ id: loc, lng: coords[0], lat: coords[1], label: loc, index: i });
          return acc;
        }, []);
        return tripMarkers.length >= 2 ? (
          <div className="mb-6">
            <h4 className="font-display text-lg text-warm-900 mb-3">Your <em className="italic">journey</em></h4>
            <MapView markers={tripMarkers} showRoute height="400px" className="mb-2" />
            <p className="font-body text-[13px] text-warm-500">
              Your journey across Sri Lanka · {tripMarkers.length} destinations
            </p>
          </div>
        ) : null;
      })()}

      {/* Price summary */}
      <PriceSummary
        items={[
          { label: `${booking.vehicle} – ${durationDays} days`, amount: booking.pricing?.vehicleTotal || booking.price },
          ...(booking.pricing?.addOnsTotal > 0 ? [{ label: 'Add-ons', amount: booking.pricing.addOnsTotal }] : []),
          ...(booking.pricing?.taxesAndFees > 0 ? [{ label: 'Taxes & fees', amount: booking.pricing.taxesAndFees }] : []),
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

      {/* 7. Actions */}
      <div className="flex flex-wrap gap-3">
        {booking.status === 'Upcoming' && (
          <>
            <Button variant="outline" className="rounded-pill" onClick={() => setShowReschedule(true)}>
              <RotateCcw className="w-4 h-4 mr-2" /> Request Reschedule
            </Button>
            <button
              onClick={() => setShowCancel(true)}
              className="px-4 py-2 rounded-full font-body text-sm font-medium text-[#C4382A] border-[1.5px] border-[#C4382A] bg-transparent hover:bg-[#FDECEA] transition-all duration-200"
            >
              <X className="w-4 h-4 mr-1 inline" /> Cancel Booking
            </button>
          </>
        )}
        <Button variant="outline" className="rounded-pill" onClick={handleDownloadInvoice} disabled={downloadingPDF}>
          <Download className="w-4 h-4 mr-2" /> {downloadingPDF ? 'Generating…' : 'Download Invoice'}
        </Button>
        <Button variant="outline" className="rounded-pill">
          <FileText className="w-4 h-4 mr-2" /> Download Itinerary
        </Button>
        <button
          onClick={() => setShowShare(true)}
          className="px-4 py-2 rounded-pill font-body text-sm font-medium text-warm-500 hover:bg-warm-50 transition-colors border border-transparent hover:border-warm-200 inline-flex items-center gap-1.5"
        >
          <Share2 className="w-4 h-4" /> Share trip
        </button>
        <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer">
          <button className="px-4 py-2 rounded-pill font-body text-sm font-medium text-warm-500 hover:bg-warm-50 transition-colors border border-transparent hover:border-warm-200">
            <MessageCircle className="w-4 h-4 mr-1 inline" /> Contact Support
          </button>
        </a>
      </div>

      {showReschedule && <RescheduleModal onClose={() => setShowReschedule(false)} />}
      {showCancel && <CancelModal onClose={() => setShowCancel(false)} total={booking.price} />}
      {showShare && <ShareModal booking={booking} onClose={() => setShowShare(false)} />}
    </div>
  );
}
