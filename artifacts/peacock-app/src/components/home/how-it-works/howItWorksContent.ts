import { ShieldCheck, MapPin, Map, Headphones, RefreshCcw, UserCheck } from 'lucide-react';

export const FLOW_CONTENT = [
  {
    id: 'ready-to-go',
    label: 'Ready-to-Go',
    headline: 'Curated routes, expertly paced.',
    subhead: 'Choose a proven itinerary — we handle the driving, timing, and local guidance.',
    steps: [
      {
        title: 'Pick an itinerary',
        desc: 'Browse hand-built routes with must-see stops, realistic travel days, and a full map view. Optional upgrades available based on your vehicle and preferences.'
      },
      {
        title: 'Choose dates + vehicle',
        desc: "Select your start date, group size, and vehicle type. We recommend the best fit for your passengers and luggage — you'll see exactly what's included before you pay."
      },
      {
        title: 'Reserve with a deposit',
        desc: "Secure your booking with a small deposit. You'll receive instant confirmation, a detailed itinerary by email, and human support if you need any changes."
      }
    ],
    primaryCta: { label: 'Browse Ready-to-Go tours', href: '/tours' },
    image: 'https://images.unsplash.com/photo-1546708773-e57c17d72746?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'create-your-own',
    label: 'Create-Your-Own',
    headline: 'Build your trip on the map.',
    subhead: 'Add stops day-by-day and see the route update live — with realistic pacing built in.',
    steps: [
      {
        title: 'Add stops by day',
        desc: 'Choose destinations across Sri Lanka and watch pins appear on the map in real time. Reorder stops anytime, then save and share your itinerary.'
      },
      {
        title: 'Keep it realistic',
        desc: "We flag days that exceed six hours of driving and suggest quick fixes — split a day, reorder, or swap a stop. You stay in control."
      },
      {
        title: 'Reserve with a deposit',
        desc: "Pick your vehicle and lock it in with a deposit. You'll receive a clear itinerary summary, and our team helps with any special requests."
      }
    ],
    primaryCta: { label: 'Start building your tour', href: '/tours/custom' },
    image: 'https://images.unsplash.com/photo-1586616629232-263c95945db8?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'transfers',
    label: 'Island Transfers',
    headline: 'A to B, done properly.',
    subhead: "Book a transfer with instant ETA and a clear price — then you're set.",
    steps: [
      {
        title: 'Enter pickup + drop-off',
        desc: 'Search locations with autocomplete — airports, hotels, or cities. Works for airport pickups, city-to-city transfers, and one-way journeys across the island.'
      },
      {
        title: 'See ETA + price',
        desc: 'Get distance, travel time, and a clear price instantly. Choose your vehicle, set passenger count, and add luggage notes or a preferred pickup time.'
      },
      {
        title: 'Pay in full',
        desc: 'Complete secure checkout and receive instant confirmation with driver details, pickup instructions, and a direct support contact — everything you need in one place.'
      }
    ],
    primaryCta: { label: 'Book a transfer', href: '/transfers' },
    image: 'https://images.unsplash.com/photo-1605218427368-35b86128038e?q=80&w=800&auto=format&fit=crop'
  }
];

export const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Secure checkout (Stripe)' },
  { icon: UserCheck, label: 'Handpicked drivers' },
  { icon: Map, label: 'Route clarity' },
  { icon: Headphones, label: 'Human support' },
  { icon: RefreshCcw, label: 'Clear policies' }
];
