import vehiclesData from '../data/vehicles.json';
import toursData from '../data/tours.json';
import transfersData from '../data/transfers.json';
import currenciesData from '../data/currencies.json';
import bookingsData from '../data/bookings.json';

export const VEHICLES = vehiclesData;

export const TOURS = toursData.map(tour => ({
  id: tour.id,
  slug: tour.slug,
  title: tour.name,
  tagline: tour.tagline,
  description: tour.description,
  durationDays: tour.duration,
  durationNights: tour.nights,
  basePrice: tour.vehicleRates.car * tour.duration,
  difficulty: tour.difficulty,
  category: tour.type,
  regions: tour.regions,
  startEnd: tour.startEnd,
  highlights: tour.highlights,
  image: tour.image,
  images: tour.gallery,
  included: tour.included,
  notIncluded: tour.notIncluded,
  vehicleRates: tour.vehicleRates,
  addOns: tour.addOns,
  seasonalPricing: tour.seasonalPricing,
  leadTimeDays: tour.leadTimeDays,
  maxExtraDays: tour.maxExtraDays,
  itinerary: tour.itinerary.map(day => ({
    day: day.day,
    title: day.title,
    location: day.location,
    description: day.description,
    drivingTime: day.drivingTime,
    stops: day.keyStops,
  })),
}));

export const TRANSFERS = transfersData.airportRoutes.map(route => ({
  id: route.id,
  from: route.from,
  to: route.to,
  distance: `${route.distance} km`,
  time: route.estimatedTime,
  price: route.prices.car,
  prices: route.prices,
}));

export const POPULAR_ROUTES = transfersData.popularRoutes;

export const CURRENCIES = currenciesData;

export const BOOKINGS = bookingsData.bookings.map(b => ({
  id: b.id,
  type: b.type === 'custom' ? 'cyo' : b.type,
  title: b.tourName,
  tourId: (b as any).tourId || null,
  date: `${b.dates.start} \u2013 ${b.dates.end}`,
  startDate: b.dates.start,
  endDate: b.dates.end,
  rawStatus: b.status,
  status: b.status === 'confirmed' ? 'Upcoming' : b.status === 'completed' ? 'Completed' : b.status === 'pending' ? 'Pending' : b.status === 'in-progress' ? 'In Progress' : b.status === 'quote-paid' ? 'Quote Paid' : b.status === 'cancelled' ? 'Cancelled' : b.status,
  vehicle: b.vehicleName,
  vehicleId: b.vehicleId,
  price: b.pricing.total,
  passengers: b.passengers,
  addOns: b.addOns,
  driver: b.driver,
  customer: b.customer,
  pricing: b.pricing,
  createdAt: b.createdAt,
  pickupTime: (b as any).pickupTime || null,
  pickupLocation: (b as any).pickupLocation || null,
  dropoffLocation: (b as any).dropoffLocation || null,
  specialRequests: (b as any).specialRequests || null,
  adminNotes: (b as any).adminNotes || null,
  driverStatus: (b as any).driverStatus || null,
  driverEarnings: (b as any).driverEarnings || 0,
  plateNumber: (b as any).plateNumber || null,
  rating: (b as any).rating || null,
}));

export const CYO_REQUESTS = bookingsData.cyoRequests.map(r => ({
  id: r.id,
  customer: r.customer.name,
  customerData: r.customer,
  locations: r.destinations,
  startDate: r.dates.start,
  duration: r.dates.duration,
  flexible: r.dates.flexible,
  dates: `${r.dates.start} (${r.dates.duration} days)`,
  status: r.status === 'new' ? 'New' : r.status === 'quoted' ? 'Quoted' : r.status === 'abandoned' ? 'Abandoned' : r.status,
  submittedAt: r.submittedAt,
  tripType: r.tripType,
  travellers: r.travellers,
  vehiclePreference: r.vehiclePreference,
  budget: r.budget,
  travelStyle: r.travelStyle,
  interests: r.interests,
  specialRequests: r.specialRequests,
  quotedAmount: (r as any).quotedAmount,
  quotedItems: (r as any).quotedItems || [],
}));

export const DRIVER_PROFILE = {
  id: 'DRV-001',
  name: 'Dudley Perera',
  phone: '+94 77 123 4567',
  email: 'dudley.p@peacockdrivers.lk',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  bio: 'Experienced driver with 8 years of touring across Sri Lanka. I know every hidden gem, the best local restaurants, and the safest mountain roads. My guests always leave with unforgettable memories.',
  languages: ['English', 'Sinhala'],
  experience: '8 years',
  available: true,
  joinedDate: '2018-06-15',
  totalTrips: 342,
  avgRating: 4.9,
  vehicles: [
    {
      id: 'v1',
      type: 'Minivan',
      model: 'Toyota HiAce',
      plate: 'WP-CAB-1234',
      year: '2022',
      image: '/vehicles/minivan.jpg',
      features: ['AC', 'WiFi', 'Cooler box', 'USB charging'],
    },
    {
      id: 'v2',
      type: 'Car',
      model: 'Toyota Prius',
      plate: 'WP-CAB-5678',
      year: '2023',
      image: '/vehicles/car.jpg',
      features: ['AC', 'USB charging', 'Bluetooth'],
    },
  ],
};

export const DRIVER_BOOKINGS = BOOKINGS.filter(b => b.driver?.name === 'Dudley Perera');
