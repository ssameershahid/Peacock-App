export const VEHICLES = [
  { id: "v1", name: "Car", model: "Toyota Prius", capacity: "1-3 pax", pricePerDay: 45, pricePerKm: 0.55, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80" },
  { id: "v2", name: "Minivan", model: "Toyota HiAce", capacity: "4-6 pax", pricePerDay: 65, pricePerKm: 0.75, image: "https://images.unsplash.com/photo-1559311648-d46f5d8593d6?w=400&q=80" },
  { id: "v3", name: "Large Van", model: "Toyota HiAce HR", capacity: "7-10 pax", pricePerDay: 85, pricePerKm: 0.95, image: "https://images.unsplash.com/photo-1517524285303-d6fc683dddf8?w=400&q=80" },
  { id: "v4", name: "Small Bus", model: "Toyota Coaster", capacity: "11-20 pax", pricePerDay: 120, pricePerKm: 1.20, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&q=80" },
  { id: "v5", name: "Medium Bus", model: "King Long", capacity: "21-35 pax", pricePerDay: 175, pricePerKm: 1.50, image: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&q=80" },
];

export const TOURS = [
  {
    id: "t1",
    slug: "classic-sri-lanka",
    title: "Classic Sri Lanka",
    tagline: "The perfect introduction to the island's highlights.",
    durationDays: 10,
    durationNights: 9,
    basePrice: 450,
    difficulty: "Easy",
    category: "Cultural",
    regions: ["Cultural Triangle", "Hill Country", "South Coast"],
    image: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?w=1200&q=80",
      "https://images.unsplash.com/photo-1578637387939-43c525550085?w=1200&q=80",
      "https://images.unsplash.com/photo-1625736300986-6ab28700ef58?w=1200&q=80"
    ],
    included: ["Private A/C vehicle", "English speaking driver/guide", "Fuel & highway tolls", "Driver accommodation & meals", "Airport pickup/drop-off"],
    notIncluded: ["Entrance tickets to attractions", "Client accommodation", "Meals & drinks", "Gratuities"],
    itinerary: [
      { day: 1, title: "Arrival & Negombo", location: "Negombo", description: "Ayubowan! Welcome to Sri Lanka. Your driver will meet you at the airport and transfer you to the coastal town of Negombo to recover from your flight.", drivingTime: "30 mins", stops: ["Bandaranaike Airport", "Negombo Beach"] },
      { day: 2, title: "Journey to the Cultural Triangle", location: "Sigiriya", description: "Head inland towards the ancient city of Sigiriya. En route, visit the Dambulla Cave Temple, a UNESCO World Heritage site.", drivingTime: "4 hrs", stops: ["Dambulla Cave Temple"] },
      { day: 3, title: "The Lion Rock", location: "Sigiriya", description: "Climb the iconic Sigiriya Rock Fortress early morning. In the afternoon, enjoy a safari in Minneriya National Park to see wild elephants.", drivingTime: "1 hr", stops: ["Sigiriya Rock", "Minneriya Safari"] },
      { day: 4, title: "Spice Gardens & Kandy", location: "Kandy", description: "Travel to the hill capital, Kandy. Visit a fragrant spice garden in Matale and the sacred Temple of the Tooth Relic in the evening.", drivingTime: "3 hrs", stops: ["Matale Spice Garden", "Temple of the Tooth"] },
    ]
  },
  {
    id: "t2",
    slug: "wild-sri-lanka",
    title: "Wild Sri Lanka",
    tagline: "Leopards, elephants, and untouched wilderness.",
    durationDays: 8,
    durationNights: 7,
    basePrice: 380,
    difficulty: "Moderate",
    category: "Wildlife",
    regions: ["South Coast", "East Coast"],
    image: "https://images.unsplash.com/photo-1549474198-466d3a43dd1a?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1549474198-466d3a43dd1a?w=1200&q=80"],
    included: ["Private A/C vehicle", "Driver guide", "Fuel"],
    notIncluded: ["Safari jeeps", "Park entrances", "Accommodation"],
    itinerary: [
      { day: 1, title: "Arrival", location: "Colombo", description: "Arrive in Colombo.", drivingTime: "1 hr", stops: [] }
    ]
  },
  {
    id: "t3",
    slug: "hill-country-explorer",
    title: "Hill Country Explorer",
    tagline: "Rolling tea estates and misty mountain peaks.",
    durationDays: 7,
    durationNights: 6,
    basePrice: 320,
    difficulty: "Easy",
    category: "Scenic",
    regions: ["Hill Country"],
    image: "https://images.unsplash.com/photo-1625736300986-6ab28700ef58?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1625736300986-6ab28700ef58?w=1200&q=80"],
    included: ["Private vehicle", "Driver"],
    notIncluded: ["Train tickets", "Accommodation"],
    itinerary: [
      { day: 1, title: "Kandy", location: "Kandy", description: "Start in Kandy.", drivingTime: "3 hrs", stops: [] }
    ]
  },
  {
    id: "t4",
    slug: "beaches-and-culture",
    title: "Beaches & Culture",
    tagline: "Ancient ruins followed by pristine southern sands.",
    durationDays: 12,
    durationNights: 11,
    basePrice: 540,
    difficulty: "Easy",
    category: "Mix",
    regions: ["Cultural Triangle", "South Coast"],
    image: "https://images.unsplash.com/photo-1559406041-c7d2b2e98690?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1559406041-c7d2b2e98690?w=1200&q=80"],
    included: ["Vehicle", "Driver"],
    notIncluded: ["Hotels", "Meals"],
    itinerary: [
      { day: 1, title: "Arrival", location: "Negombo", description: "Arrive.", drivingTime: "30 mins", stops: [] }
    ]
  }
];

export const TRANSFERS = [
  { id: "tr1", from: "Bandaranaike Airport (CMB)", to: "Colombo City", distance: "35 km", time: "1 hr", price: 28 },
  { id: "tr2", from: "Bandaranaike Airport (CMB)", to: "Negombo", distance: "12 km", time: "25 mins", price: 15 },
  { id: "tr3", from: "Bandaranaike Airport (CMB)", to: "Kandy", distance: "115 km", time: "3 hrs", price: 65 },
  { id: "tr4", from: "Bandaranaike Airport (CMB)", to: "Galle", distance: "155 km", time: "2.5 hrs", price: 85 },
  { id: "tr5", from: "Bandaranaike Airport (CMB)", to: "Mirissa", distance: "165 km", time: "2.75 hrs", price: 95 },
  { id: "tr6", from: "Bandaranaike Airport (CMB)", to: "Sigiriya", distance: "145 km", time: "3.5 hrs", price: 80 },
];

export const BOOKINGS = [
  { id: "BK-1042", type: "tour", title: "Classic Sri Lanka", date: "Oct 12 - Oct 22, 2024", status: "Upcoming", vehicle: "Minivan", price: 715, driver: { name: "Dudley Silva", phone: "+94 77 123 4567" } },
  { id: "BK-0988", type: "transfer", title: "CMB to Galle", date: "Sep 05, 2024", status: "Completed", vehicle: "Car", price: 85, driver: { name: "Nuwan Kumara", phone: "+94 71 987 6543" } },
  { id: "CYO-014", type: "cyo", title: "Custom Hill Country", date: "Nov 10 - Nov 18, 2024", status: "Quote Ready", vehicle: "Minivan", price: 540, driver: null },
];

export const CYO_REQUESTS = [
  { id: "CYO-015", customer: "Sarah Jenkins", locations: ["Colombo", "Kandy", "Ella", "Yala"], dates: "Jan 12 - Jan 20, 2025", status: "New", submittedAt: "2 hours ago" },
  { id: "CYO-014", customer: "Thomas Weber", locations: ["Negombo", "Sigiriya", "Kandy"], dates: "Nov 10 - Nov 18, 2024", status: "Quoted", submittedAt: "2 days ago" },
  { id: "CYO-012", customer: "Amelia Pond", locations: ["Galle", "Mirissa", "Tangalle"], dates: "Dec 05 - Dec 15, 2024", status: "Paid", submittedAt: "1 week ago" },
];
