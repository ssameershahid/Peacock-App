export interface Review {
  id: string;
  author: string;
  origin: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
  itineraryName?: string;
  tripLength?: string;
  travelerType?: string;
}

export const reviews: Review[] = [
  {
    id: 'rev1',
    author: 'Sarah Jenkins',
    origin: 'London, UK',
    rating: 5,
    date: '2023-10-15',
    text: 'Our driver was incredibly professional. The car was spotless, and he knew all the best hidden spots in Ella that weren\'t on any blogs. We felt safe and pampered the entire time.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    itineraryName: 'Cultural Triangle Odyssey',
    tripLength: '10 Days',
    travelerType: 'Couple'
  },
  {
    id: 'rev2',
    author: 'Michael Chen',
    origin: 'Singapore',
    rating: 5,
    date: '2023-09-22',
    text: 'Seamless booking process. The KDH van was perfect for our family of 6. Comfortable driving through the winding hill country roads is no easy feat, but our driver handled it perfectly.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    itineraryName: 'Hill Country Tea Trails',
    tripLength: '7 Days',
    travelerType: 'Family'
  },
  {
    id: 'rev3',
    author: 'Emma & Tom',
    origin: 'Melbourne, AU',
    rating: 5,
    date: '2023-11-05',
    text: 'We customized our own itinerary and the team was very accommodating with last-minute changes when we decided to stay an extra night in Mirissa. The flexibility was a game changer.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
    itineraryName: 'Custom South Coast Trip',
    tripLength: '14 Days',
    travelerType: 'Honeymoon'
  }
];
