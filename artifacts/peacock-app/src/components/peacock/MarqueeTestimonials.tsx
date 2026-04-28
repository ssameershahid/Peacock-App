import React from 'react';
import { Star, Quote, MapPin } from 'lucide-react';
import { Review } from '@/content/reviews';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MarqueeTestimonialsProps {
  reviews: Review[];
}

// Desktop card
const EditorialReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="w-[380px] h-[280px] shrink-0 bg-[rgba(232,230,227,1)] rounded-2xl border border-border/60 p-6 shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-full font-medium text-[11px] uppercase tracking-wider px-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {review.tripLength || 'Trip'}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground border-border rounded-full font-medium text-[11px] uppercase tracking-wider px-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {review.travelerType || 'Traveler'}
          </Badge>
          <div className="ml-auto flex text-amber-200 gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
          </div>
        </div>
        <div className="relative">
          <Quote className="absolute -left-2 -top-2 h-6 w-6 text-primary/10 -scale-x-100" />
          <p className="font-body text-base leading-relaxed text-foreground line-clamp-4 relative z-10 pl-2">
            "{review.text}"
          </p>
        </div>
      </div>
      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
        <div>
          <div className="font-bold text-sm text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>{review.author}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <MapPin className="h-3 w-3" /> {review.origin || 'International Guest'}
          </div>
        </div>
        {review.itineraryName && (
          <div className="text-xs text-muted-foreground font-medium text-right" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Verified Booking <br />
            <span className="text-primary">{review.itineraryName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile card — compact, narrow, text-only
const MobileReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="w-[195px] h-[230px] shrink-0 bg-[rgba(232,230,227,1)] rounded-2xl border border-border/60 p-4 shadow-soft flex flex-col gap-2.5">
      {/* Name + origin row */}
      <div>
        <div className="font-bold text-xs text-foreground leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {review.author}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{review.origin}</span>
        </div>
      </div>

      {/* Stars */}
      <div className="flex text-amber-200 gap-0.5">
        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
      </div>

      {/* Quote text — more lines */}
      <p className="font-body text-[13px] leading-relaxed text-foreground line-clamp-5 flex-1">
        "{review.text}"
      </p>

      {/* Badges */}
      <div className="flex gap-1 flex-wrap mt-auto">
        {review.tripLength && (
          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-full text-[9px] font-medium uppercase tracking-wider px-2 py-0 h-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {review.tripLength}
          </Badge>
        )}
        {review.travelerType && (
          <Badge variant="outline" className="text-muted-foreground border-border rounded-full text-[9px] font-medium uppercase tracking-wider px-2 py-0 h-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {review.travelerType}
          </Badge>
        )}
      </div>
    </div>
  );
};

const MarqueeTestimonials: React.FC<MarqueeTestimonialsProps> = ({ reviews }) => {
  const marqueeReviews = [...reviews, ...reviews, ...reviews];

  return (
    <>
      {/* ── Mobile: two rows, opposite directions ── */}
      <div className="md:hidden relative w-full overflow-hidden bg-transparent py-6 group">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex flex-col gap-4">
          {/* Row 1 — scrolls left */}
          <div className="flex gap-3 animate-marquee group-hover:[animation-play-state:paused] w-max px-3">
            {marqueeReviews.map((review, index) => (
              <MobileReviewCard key={`mob-r1-${review.id}-${index}`} review={review} />
            ))}
          </div>
          {/* Row 2 — scrolls right */}
          <div className="flex gap-3 animate-marquee-reverse group-hover:[animation-play-state:paused] w-max px-3">
            {marqueeReviews.map((review, index) => (
              <MobileReviewCard key={`mob-r2-${review.id}-${index}`} review={review} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop: single row marquee — unchanged ── */}
      <div className="hidden md:block relative w-full overflow-hidden bg-transparent py-10 group">
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex gap-8 animate-marquee group-hover:[animation-play-state:paused] w-max px-8">
          {marqueeReviews.map((review, index) => (
            <EditorialReviewCard key={`${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>
    </>
  );
};

export default MarqueeTestimonials;
