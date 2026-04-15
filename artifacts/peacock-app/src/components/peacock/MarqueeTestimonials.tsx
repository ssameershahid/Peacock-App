import React from 'react';
import { Star, Quote, MapPin } from 'lucide-react';
import { Review } from '@/content/reviews';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MarqueeTestimonialsProps {
  reviews: Review[];
}

const EditorialReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="w-[350px] md:w-[500px] h-[300px] shrink-0 bg-[rgba(232,230,227,1)] rounded-2xl border border-border/60 p-5 shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row gap-5 group">
      {/* Editorial Image Side */}
      <div className="shrink-0 w-full md:w-36 h-48 md:h-full relative overflow-hidden rounded-xl bg-secondary">
        <img src={review.avatar} alt={review.author} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <div className="md:hidden absolute bottom-2 left-2 right-2">
          <div className="flex text-amber-200 gap-0.5 drop-shadow-md">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 flex flex-col justify-between py-1 pr-2">
        <div>
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-full font-medium text-[11px] uppercase tracking-wider px-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {review.tripLength || 'Trip'}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground border-border rounded-full font-medium text-[11px] uppercase tracking-wider px-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {review.travelerType || 'Traveler'}
            </Badge>
            <div className="hidden md:flex ml-auto text-amber-200 gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
            </div>
          </div>
          <div className="relative mb-4">
            <Quote className="absolute -left-2 -top-2 h-6 w-6 text-primary/10 -scale-x-100" />
            <p className="font-display text-lg leading-relaxed text-foreground line-clamp-4 relative z-10 pl-2">
              "{review.text}"
            </p>
          </div>
        </div>
        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>{review.author}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
              <MapPin className="h-3 w-3" /> {review.origin || 'International Guest'}
            </div>
          </div>
          {review.itineraryName && (
            <div className="text-xs text-muted-foreground font-medium text-right max-w-[120px] truncate" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Verified Booking <br />
              <span className="text-primary">{review.itineraryName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MarqueeTestimonials: React.FC<MarqueeTestimonialsProps> = ({ reviews }) => {
  const marqueeReviews = [...reviews, ...reviews, ...reviews];
  return (
    <div className="relative w-full overflow-hidden bg-transparent py-10 group">
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="flex gap-8 animate-marquee group-hover:[animation-play-state:paused] w-max px-8">
        {marqueeReviews.map((review, index) => (
          <EditorialReviewCard key={`${review.id}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
};

export default MarqueeTestimonials;
