/**
 * Seed script: 6 premier tour groups × 4 durations (5, 7, 10, 14 days) = 24 variants
 * Run from repo root: pnpm --filter @workspace/scripts tsx scripts/seed-tour-groups.ts
 * Or directly: npx tsx scripts/seed-tour-groups.ts
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

import { db } from "../lib/db/src/index.js";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import {
  toursTable,
  tourVehicleRatesTable,
  itineraryDaysTable,
  tourAddOnsTable,
  seasonalPricingTable,
} from "../lib/db/src/schema/index.js";

const DURATIONS = [5, 7, 10, 14] as const;

// ─── 6 Premier Tour Groups ────────────────────────────────────────────────────

const TOUR_GROUPS = [
  {
    groupSlug: "classic-sri-lanka",
    name: "Classic Sri Lanka",
    tagline: "The perfect introduction to the island's highlights.",
    description:
      "Experience the very best of Sri Lanka on this comprehensive journey. From the ancient cities of the cultural triangle to the misty tea estates of the hill country and the golden beaches of the south coast, this tour covers it all.",
    regions: ["Cultural Triangle", "Hill Country", "South Coast"],
    difficulty: "Easy",
    heroImages: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80",
      "https://images.unsplash.com/photo-1566296440244-0e3e7b3e22ad?w=1200&q=80",
    ],
    highlights: [
      "Sigiriya Lion Rock",
      "Temple of the Tooth",
      "Yala leopard safari",
      "Galle Fort",
      "Tea country",
      "South coast beaches",
    ],
    whatsIncluded: [
      "Private vehicle & driver",
      "All fuel & tolls",
      "Driver accommodation & meals",
      "Airport pickup & drop-off",
      "Bottled water daily",
    ],
    whatsNotIncluded: [
      "Hotel accommodation",
      "Meals for travellers",
      "Entrance fees",
      "Tips",
    ],
    vehicleRates: { car: 55, minivan: 75, "large-van": 100, "small-bus": 140, "medium-bus": 195 },
    sortOrder: 1,
    // itinerary keyed by duration
    itineraries: {
      5: [
        { day: 1, title: "Airport → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Arrive at Bandaranaike International Airport. Transfer to Sigiriya.", drivingTime: "4 hours", stops: ["Bandaranaike Airport", "Sigiriya"] },
        { day: 2, title: "Sigiriya Rock & Dambulla", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb the iconic Lion Rock fortress. Visit Dambulla Cave Temple.", drivingTime: "1 hour", stops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
        { day: 3, title: "Sigiriya → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive to Kandy, Sri Lanka's cultural capital. Visit the Temple of the Tooth.", drivingTime: "3 hours", stops: ["Temple of the Tooth", "Kandy Lake"] },
        { day: 4, title: "Kandy → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Drive south to the UNESCO-listed Dutch fort of Galle.", drivingTime: "4 hours", stops: ["Galle Fort", "Dutch Reformed Church"] },
        { day: 5, title: "Galle → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning at leisure in Galle, then transfer to the airport.", drivingTime: "2.5 hours", stops: ["Unawatuna Beach", "Bandaranaike Airport"] },
      ],
      7: [
        { day: 1, title: "Airport → Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Arrive and transfer to Negombo. Beach evening.", drivingTime: "30 minutes", stops: ["Bandaranaike Airport", "Negombo Beach"] },
        { day: 2, title: "Negombo → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Drive to the cultural triangle. Dambulla Cave Temple.", drivingTime: "4 hours", stops: ["Dambulla Cave Temple", "Sigiriya"] },
        { day: 3, title: "Sigiriya Rock", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb Lion Rock fortress.", drivingTime: "30 minutes", stops: ["Sigiriya Rock Fortress", "Pidurangala Rock"] },
        { day: 4, title: "Sigiriya → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive to Kandy. Temple of the Tooth evening ceremony.", drivingTime: "3 hours", stops: ["Temple of the Tooth", "Kandy Lake", "Kandyan Dance Show"] },
        { day: 5, title: "Kandy → Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Tea country drive. Nine Arches Bridge at sunset.", drivingTime: "4 hours", stops: ["Tea Factory", "Nine Arches Bridge", "Little Adam's Peak"] },
        { day: 6, title: "Ella → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Descend through the south coast to Galle Fort.", drivingTime: "4 hours", stops: ["Ravana Falls", "Galle Fort", "Lighthouse"] },
        { day: 7, title: "Galle → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning at leisure, then transfer to airport.", drivingTime: "2.5 hours", stops: ["Unawatuna Beach", "Bandaranaike Airport"] },
      ],
      10: [
        { day: 1, title: "Airport → Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Arrive, transfer to beachside hotel in Negombo.", drivingTime: "30 minutes", stops: ["Bandaranaike Airport", "Negombo Beach"] },
        { day: 2, title: "Negombo → Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Drive north to the ancient capital, a UNESCO site.", drivingTime: "4 hours", stops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba"] },
        { day: 3, title: "Anuradhapura → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb Lion Rock and explore Dambulla.", drivingTime: "2 hours", stops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
        { day: 4, title: "Sigiriya → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Arrive in Kandy. Temple of the Tooth.", drivingTime: "3 hours", stops: ["Temple of the Tooth", "Kandy Lake"] },
        { day: 5, title: "Kandy → Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Drive through tea estates. Tea factory visit.", drivingTime: "2.5 hours", stops: ["Tea Factory", "Gregory Lake"] },
        { day: 6, title: "Nuwara Eliya → Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Scenic mountain drive. Nine Arches Bridge.", drivingTime: "2 hours", stops: ["Nine Arches Bridge", "Ravana Falls"] },
        { day: 7, title: "Ella → Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Descend to the leopard country of Yala.", drivingTime: "3 hours", stops: ["Yala National Park Safari"] },
        { day: 8, title: "Yala → Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "South coast beach time in Mirissa.", drivingTime: "1.5 hours", stops: ["Mirissa Beach", "Stilt Fishermen"] },
        { day: 9, title: "Mirissa → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "UNESCO Galle Fort exploration.", drivingTime: "45 minutes", stops: ["Galle Fort", "Dutch Reformed Church", "Lighthouse"] },
        { day: 10, title: "Galle → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Final drive to the airport.", drivingTime: "2 hours", stops: ["Colombo City", "Bandaranaike Airport"] },
      ],
      14: [
        { day: 1, title: "Airport → Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Arrive and settle in Negombo.", drivingTime: "30 minutes", stops: ["Bandaranaike Airport", "Negombo Beach"] },
        { day: 2, title: "Negombo → Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Ancient capital, UNESCO site.", drivingTime: "4 hours", stops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba"] },
        { day: 3, title: "Anuradhapura → Jaffna", location: "Jaffna", lat: 9.6615, lng: 80.0255, description: "Explore the Tamil cultural heartland of Jaffna.", drivingTime: "3 hours", stops: ["Nallur Kandaswamy Temple", "Jaffna Fort"] },
        { day: 4, title: "Jaffna → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Drive south to the cultural triangle.", drivingTime: "5 hours", stops: ["Aukana Buddha", "Sigiriya"] },
        { day: 5, title: "Sigiriya Rock & Polonnaruwa", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock fortress and medieval Polonnaruwa.", drivingTime: "1.5 hours", stops: ["Sigiriya Rock", "Polonnaruwa Ruins"] },
        { day: 6, title: "Dambulla → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Dambulla Cave Temple then Kandy.", drivingTime: "2.5 hours", stops: ["Dambulla Cave Temple", "Temple of the Tooth"] },
        { day: 7, title: "Kandy exploration", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Peradeniya Botanical Gardens, Kandyan dance show.", drivingTime: "1 hour", stops: ["Peradeniya Gardens", "Kandyan Dance Show"] },
        { day: 8, title: "Kandy → Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Tea country. Factory visit.", drivingTime: "2.5 hours", stops: ["Tea Factory", "Gregory Lake"] },
        { day: 9, title: "Horton Plains", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Dawn hike to World's End viewpoint.", drivingTime: "1 hour", stops: ["Horton Plains", "World's End", "Baker's Falls"] },
        { day: 10, title: "Nuwara Eliya → Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Nine Arches Bridge, Little Adam's Peak.", drivingTime: "2 hours", stops: ["Nine Arches Bridge", "Little Adam's Peak"] },
        { day: 11, title: "Ella → Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Leopard safari in Yala National Park.", drivingTime: "3 hours", stops: ["Yala National Park Safari"] },
        { day: 12, title: "Yala → South Coast", location: "Tangalle", lat: 6.0247, lng: 80.7957, description: "Secluded beaches of Tangalle and Mirissa.", drivingTime: "2 hours", stops: ["Tangalle Beach", "Mirissa Beach"] },
        { day: 13, title: "Galle Fort & Hikkaduwa", location: "Galle", lat: 6.0535, lng: 80.221, description: "UNESCO Galle Fort and coral reef snorkelling.", drivingTime: "1 hour", stops: ["Galle Fort", "Hikkaduwa Reef"] },
        { day: 14, title: "Galle → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Coastal drive to the airport.", drivingTime: "2.5 hours", stops: ["Turtle Hatchery", "Bandaranaike Airport"] },
      ],
    },
  },
  {
    groupSlug: "south-coast-beaches",
    name: "South Coast & Beaches",
    tagline: "Sun, surf and colonial charm.",
    description:
      "Discover the laid-back beauty of Sri Lanka's south coast. From the UNESCO-listed Galle Fort to the whale-watching waters of Mirissa and the secluded coves of Tangalle, this tour is perfect for beach lovers.",
    regions: ["South Coast", "Galle"],
    difficulty: "Easy",
    heroImages: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80",
    ],
    highlights: [
      "Galle Fort (UNESCO)",
      "Whale watching Mirissa",
      "Stilt fishermen",
      "Hikkaduwa reef",
      "Tangalle beach",
      "Sea turtle hatchery",
    ],
    whatsIncluded: [
      "Private vehicle & driver",
      "All fuel & tolls",
      "Driver accommodation & meals",
      "Airport pickup & drop-off",
      "Bottled water daily",
    ],
    whatsNotIncluded: [
      "Hotel accommodation",
      "Meals for travellers",
      "Entrance fees",
      "Tips",
    ],
    vehicleRates: { car: 45, minivan: 62, "large-van": 82, "small-bus": 115, "medium-bus": 160 },
    sortOrder: 2,
    itineraries: {
      5: [
        { day: 1, title: "Airport → Negombo → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Arrive at the airport and transfer down the coastal highway to Galle.", drivingTime: "3 hours", stops: ["Bandaranaike Airport", "Galle Fort"] },
        { day: 2, title: "Galle Fort & Hikkaduwa", location: "Galle", lat: 6.0535, lng: 80.221, description: "Explore the ramparts and boutiques of Galle Fort. Afternoon snorkelling at Hikkaduwa reef.", drivingTime: "45 minutes", stops: ["Galle Fort", "Dutch Reformed Church", "Hikkaduwa Reef"] },
        { day: 3, title: "Galle → Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Move along the coast to Mirissa's crescent beach. Stilt fishermen at sunset.", drivingTime: "1 hour", stops: ["Mirissa Beach", "Stilt Fishermen"] },
        { day: 4, title: "Mirissa → Tangalle", location: "Tangalle", lat: 6.0247, lng: 80.7957, description: "Secluded Tangalle coves and turtle hatchery.", drivingTime: "1.5 hours", stops: ["Turtle Hatchery", "Tangalle Beach", "Hummanaya Blowhole"] },
        { day: 5, title: "Tangalle → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Coastal drive back to Colombo for departure.", drivingTime: "3 hours", stops: ["Colombo City", "Bandaranaike Airport"] },
      ],
      7: [
        { day: 1, title: "Airport → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Transfer to the charming fort city of Galle.", drivingTime: "2.5 hours", stops: ["Bandaranaike Airport", "Galle Fort"] },
        { day: 2, title: "Galle Fort exploration", location: "Galle", lat: 6.0535, lng: 80.221, description: "Full day in Galle Fort — galleries, lighthouse, rampart sunset.", drivingTime: "Walking", stops: ["Galle Fort", "Lighthouse", "Dutch Reformed Church", "Flag Rock"] },
        { day: 3, title: "Hikkaduwa & Unawatuna", location: "Galle", lat: 6.0535, lng: 80.221, description: "Snorkelling and beach time on the Galle coast.", drivingTime: "30 minutes", stops: ["Hikkaduwa Reef", "Unawatuna Beach"] },
        { day: 4, title: "Galle → Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Whale watching morning. Crescent beach afternoon.", drivingTime: "1 hour", stops: ["Whale Watching", "Mirissa Beach", "Coconut Tree Hill"] },
        { day: 5, title: "Mirissa → Tangalle", location: "Tangalle", lat: 6.0247, lng: 80.7957, description: "Secluded Tangalle and sea turtle hatchery.", drivingTime: "1.5 hours", stops: ["Turtle Hatchery", "Tangalle Beach"] },
        { day: 6, title: "Tangalle → Weligama", location: "Weligama", lat: 5.9741, lng: 80.4297, description: "Learn to surf in Weligama's gentle bay.", drivingTime: "2 hours", stops: ["Weligama Bay", "Stilt Fishermen"] },
        { day: 7, title: "Weligama → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Drive back to Colombo for departure.", drivingTime: "2.5 hours", stops: ["Bandaranaike Airport"] },
      ],
      10: [
        { day: 1, title: "Airport → Colombo", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Arrive and explore Colombo's Pettah market and Gangaramaya Temple.", drivingTime: "45 minutes", stops: ["Pettah Market", "Gangaramaya Temple"] },
        { day: 2, title: "Colombo → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Drive the coastal highway south to Galle Fort.", drivingTime: "2.5 hours", stops: ["Turtle Hatchery", "Galle Fort"] },
        { day: 3, title: "Galle Fort deep dive", location: "Galle", lat: 6.0535, lng: 80.221, description: "Lighthouse, ramparts, boutiques and galleries.", drivingTime: "Walking", stops: ["Galle Fort", "Lighthouse", "Dutch Museum"] },
        { day: 4, title: "Hikkaduwa & Unawatuna", location: "Galle", lat: 6.0535, lng: 80.221, description: "Reef snorkelling and beach.", drivingTime: "30 minutes", stops: ["Hikkaduwa Reef", "Unawatuna Beach"] },
        { day: 5, title: "Galle → Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Early whale watching, crescent beach.", drivingTime: "1 hour", stops: ["Whale Watching", "Mirissa Beach"] },
        { day: 6, title: "Weligama surfing", location: "Weligama", lat: 5.9741, lng: 80.4297, description: "Surf lesson in Weligama bay.", drivingTime: "30 minutes", stops: ["Weligama Bay", "Taprobane Island"] },
        { day: 7, title: "Mirissa → Tangalle", location: "Tangalle", lat: 6.0247, lng: 80.7957, description: "Turtle hatchery and Tangalle's secluded coves.", drivingTime: "1.5 hours", stops: ["Turtle Hatchery", "Tangalle Beach", "Hummanaya Blowhole"] },
        { day: 8, title: "Tangalle → Tissamaharama", location: "Tissamaharama", lat: 6.2867, lng: 81.2953, description: "Birdwatching at Bundala and ancient Tissa dagoba.", drivingTime: "1.5 hours", stops: ["Bundala Bird Sanctuary", "Tissa Dagoba"] },
        { day: 9, title: "Tissamaharama → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Return via the south coast for a farewell Galle sunset.", drivingTime: "3 hours", stops: ["Stilt Fishermen", "Galle Ramparts"] },
        { day: 10, title: "Galle → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Coastal drive to the airport.", drivingTime: "2.5 hours", stops: ["Bandaranaike Airport"] },
      ],
      14: [
        { day: 1, title: "Airport → Colombo", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Arrive and explore Colombo.", drivingTime: "45 minutes", stops: ["Pettah Market", "Gangaramaya Temple"] },
        { day: 2, title: "Colombo → Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Negombo's fish market and lagoon boat trip.", drivingTime: "45 minutes", stops: ["Negombo Fish Market", "Hamilton Canal"] },
        { day: 3, title: "Negombo → Galle (coastal road)", location: "Galle", lat: 6.0535, lng: 80.221, description: "The scenic coastal highway south.", drivingTime: "4 hours", stops: ["Bentota Beach", "Brief Garden", "Galle Fort"] },
        { day: 4, title: "Galle Fort", location: "Galle", lat: 6.0535, lng: 80.221, description: "Full day in Galle.", drivingTime: "Walking", stops: ["Galle Fort", "Lighthouse", "Ramparts"] },
        { day: 5, title: "Hikkaduwa & Unawatuna", location: "Galle", lat: 6.0535, lng: 80.221, description: "Reef snorkelling, beach.", drivingTime: "30 minutes", stops: ["Hikkaduwa Reef", "Unawatuna Beach"] },
        { day: 6, title: "Weligama", location: "Weligama", lat: 5.9741, lng: 80.4297, description: "Surf lesson and Taprobane Island.", drivingTime: "30 minutes", stops: ["Weligama Bay", "Taprobane Island"] },
        { day: 7, title: "Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Whale watching and beach.", drivingTime: "30 minutes", stops: ["Whale Watching", "Mirissa Beach"] },
        { day: 8, title: "Mirissa → Tangalle", location: "Tangalle", lat: 6.0247, lng: 80.7957, description: "Turtle hatchery and Tangalle.", drivingTime: "1.5 hours", stops: ["Turtle Hatchery", "Tangalle Beach"] },
        { day: 9, title: "Hummanaya & Bundala", location: "Tangalle", lat: 6.0247, lng: 80.7957, description: "Blowhole and bird sanctuary.", drivingTime: "1 hour", stops: ["Hummanaya Blowhole", "Bundala Bird Sanctuary"] },
        { day: 10, title: "Tangalle → Tissamaharama", location: "Tissamaharama", lat: 6.2867, lng: 81.2953, description: "Tissa dagoba and lake.", drivingTime: "1 hour", stops: ["Tissa Dagoba", "Tissa Lake"] },
        { day: 11, title: "Yala Safari", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Full day Yala National Park.", drivingTime: "30 minutes", stops: ["Yala National Park Safari"] },
        { day: 12, title: "Yala → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Return along the coast.", drivingTime: "3 hours", stops: ["Stilt Fishermen", "Galle Ramparts"] },
        { day: 13, title: "Galle free day", location: "Galle", lat: 6.0535, lng: 80.221, description: "Leisure day. Shopping or beach.", drivingTime: "Walking", stops: ["Galle Fort Boutiques", "Unawatuna"] },
        { day: 14, title: "Galle → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Departure transfer.", drivingTime: "2.5 hours", stops: ["Bandaranaike Airport"] },
      ],
    },
  },
  {
    groupSlug: "wildlife-safari",
    name: "Wildlife & Safari",
    tagline: "Encounter leopards, elephants and rare birds.",
    description:
      "Sri Lanka is one of Asia's top wildlife destinations. This tour focuses on the island's extraordinary national parks — from the leopard-spotted plains of Yala to the elephant corridors of Minneriya and the flamingo lagoons of Bundala.",
    regions: ["South Coast", "Cultural Triangle", "East Coast"],
    difficulty: "Moderate",
    heroImages: [
      "https://images.unsplash.com/photo-1552812433-d2db5b46e0cb?w=1200&q=80",
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80",
    ],
    highlights: [
      "Yala leopard safari",
      "Minneriya elephant gathering",
      "Bundala flamingos",
      "Udawalawe elephants",
      "Wilpattu leopards",
      "Whale watching Mirissa",
    ],
    whatsIncluded: [
      "Private vehicle & driver",
      "All fuel & tolls",
      "Driver accommodation & meals",
      "Airport pickup & drop-off",
      "Bottled water daily",
    ],
    whatsNotIncluded: [
      "Hotel accommodation",
      "Meals for travellers",
      "Safari jeep & park fees",
      "Tips",
    ],
    vehicleRates: { car: 50, minivan: 70, "large-van": 92, "small-bus": 128, "medium-bus": 178 },
    sortOrder: 3,
    itineraries: {
      5: [
        { day: 1, title: "Airport → Udawalawe", location: "Udawalawe", lat: 6.4688, lng: 80.8988, description: "Transfer to Udawalawe, home to Sri Lanka's largest elephant herds.", drivingTime: "4 hours", stops: ["Bandaranaike Airport", "Udawalawe"] },
        { day: 2, title: "Udawalawe Safari", location: "Udawalawe", lat: 6.4688, lng: 80.8988, description: "Full day in Udawalawe National Park. Elephant herds, crocodiles, birds.", drivingTime: "Park drives", stops: ["Udawalawe National Park", "Elephant Transit Home"] },
        { day: 3, title: "Udawalawe → Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Transfer to Yala, home to the world's highest density of leopards.", drivingTime: "2.5 hours", stops: ["Yala National Park"] },
        { day: 4, title: "Yala Safari", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Dawn and dusk game drives in search of leopards, sloth bears, and elephants.", drivingTime: "Park drives", stops: ["Yala Block 1 Safari", "Bundala Bird Sanctuary"] },
        { day: 5, title: "Yala → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Transfer to Colombo for departure.", drivingTime: "5 hours", stops: ["Bandaranaike Airport"] },
      ],
      7: [
        { day: 1, title: "Airport → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Transfer to the cultural triangle.", drivingTime: "4 hours", stops: ["Bandaranaike Airport", "Sigiriya"] },
        { day: 2, title: "Minneriya Elephant Gathering", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Morning Sigiriya Rock, afternoon Minneriya elephant gathering.", drivingTime: "1.5 hours", stops: ["Sigiriya Rock", "Minneriya National Park"] },
        { day: 3, title: "Sigiriya → Udawalawe", location: "Udawalawe", lat: 6.4688, lng: 80.8988, description: "Drive south to elephant country.", drivingTime: "5 hours", stops: ["Udawalawe"] },
        { day: 4, title: "Udawalawe Safari", location: "Udawalawe", lat: 6.4688, lng: 80.8988, description: "Elephant herds, crocodiles, raptors.", drivingTime: "Park drives", stops: ["Udawalawe National Park", "Elephant Transit Home"] },
        { day: 5, title: "Udawalawe → Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Transfer to Yala.", drivingTime: "2.5 hours", stops: ["Yala National Park"] },
        { day: 6, title: "Yala Safari & Bundala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Leopards in Yala, flamingos in Bundala.", drivingTime: "Park drives", stops: ["Yala Block 1", "Bundala Bird Sanctuary"] },
        { day: 7, title: "Yala → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Coastal drive to airport.", drivingTime: "5 hours", stops: ["Bandaranaike Airport"] },
      ],
      10: [
        { day: 1, title: "Airport → Wilpattu", location: "Wilpattu", lat: 8.4353, lng: 80.0353, description: "Drive north to Wilpattu, Sri Lanka's largest national park.", drivingTime: "3.5 hours", stops: ["Wilpattu National Park"] },
        { day: 2, title: "Wilpattu Safari", location: "Wilpattu", lat: 8.4353, lng: 80.0353, description: "Dawn game drive in Wilpattu's villa lake system.", drivingTime: "Park drives", stops: ["Wilpattu Villus Safari"] },
        { day: 3, title: "Wilpattu → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Drive to the cultural triangle.", drivingTime: "3 hours", stops: ["Sigiriya"] },
        { day: 4, title: "Minneriya Elephants", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Sigiriya Rock, then Minneriya elephant gathering.", drivingTime: "1.5 hours", stops: ["Sigiriya Rock", "Minneriya National Park"] },
        { day: 5, title: "Sigiriya → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Kandy and Temple of the Tooth.", drivingTime: "3 hours", stops: ["Temple of the Tooth", "Kandy Lake"] },
        { day: 6, title: "Kandy → Udawalawe", location: "Udawalawe", lat: 6.4688, lng: 80.8988, description: "Drive south to elephant country.", drivingTime: "4.5 hours", stops: ["Udawalawe"] },
        { day: 7, title: "Udawalawe Safari", location: "Udawalawe", lat: 6.4688, lng: 80.8988, description: "Elephant herds and Elephant Transit Home.", drivingTime: "Park drives", stops: ["Udawalawe National Park", "Elephant Transit Home"] },
        { day: 8, title: "Udawalawe → Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Transfer to Yala.", drivingTime: "2.5 hours", stops: ["Yala National Park"] },
        { day: 9, title: "Yala Safari & Bundala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Leopards and flamingos.", drivingTime: "Park drives", stops: ["Yala Block 1", "Bundala Bird Sanctuary"] },
        { day: 10, title: "Yala → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Transfer to airport.", drivingTime: "5 hours", stops: ["Bandaranaike Airport"] },
      ],
      14: [
        { day: 1, title: "Airport → Wilpattu", location: "Wilpattu", lat: 8.4353, lng: 80.0353, description: "Transfer to Wilpattu, Sri Lanka's largest park.", drivingTime: "3.5 hours", stops: ["Wilpattu National Park"] },
        { day: 2, title: "Wilpattu Safari", location: "Wilpattu", lat: 8.4353, lng: 80.0353, description: "Dawn game drives among the villus.", drivingTime: "Park drives", stops: ["Wilpattu Villus Safari"] },
        { day: 3, title: "Wilpattu → Mannar", location: "Mannar", lat: 8.9771, lng: 79.9038, description: "Mannar's flamingo lagoon and baobab tree.", drivingTime: "2 hours", stops: ["Mannar Flamingo Lagoon", "Giant's Baobab"] },
        { day: 4, title: "Mannar → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Cultural triangle.", drivingTime: "4 hours", stops: ["Sigiriya"] },
        { day: 5, title: "Sigiriya Rock & Polonnaruwa", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock and medieval ruins.", drivingTime: "2 hours", stops: ["Sigiriya Rock", "Polonnaruwa Ruins"] },
        { day: 6, title: "Minneriya Elephants", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Minneriya elephant gathering.", drivingTime: "1 hour", stops: ["Minneriya National Park"] },
        { day: 7, title: "Sigiriya → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Temple of the Tooth.", drivingTime: "3 hours", stops: ["Temple of the Tooth", "Kandy Lake"] },
        { day: 8, title: "Kandy → Horton Plains", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "World's End viewpoint dawn hike.", drivingTime: "2.5 hours", stops: ["Horton Plains", "World's End"] },
        { day: 9, title: "Nuwara Eliya → Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Nine Arches Bridge and hill country.", drivingTime: "2 hours", stops: ["Nine Arches Bridge", "Little Adam's Peak"] },
        { day: 10, title: "Ella → Udawalawe", location: "Udawalawe", lat: 6.4688, lng: 80.8988, description: "Descend to elephant country.", drivingTime: "3 hours", stops: ["Udawalawe"] },
        { day: 11, title: "Udawalawe Safari", location: "Udawalawe", lat: 6.4688, lng: 80.8988, description: "Elephant herds and transit home.", drivingTime: "Park drives", stops: ["Udawalawe National Park", "Elephant Transit Home"] },
        { day: 12, title: "Udawalawe → Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Transfer to Yala.", drivingTime: "2.5 hours", stops: ["Yala National Park"] },
        { day: 13, title: "Yala Safari & Bundala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Leopards, sloth bears, flamingos.", drivingTime: "Park drives", stops: ["Yala Block 1", "Bundala Bird Sanctuary"] },
        { day: 14, title: "Yala → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Final transfer.", drivingTime: "5 hours", stops: ["Bandaranaike Airport"] },
      ],
    },
  },
  {
    groupSlug: "hill-country-explorer",
    name: "Hill Country Explorer",
    tagline: "Rolling tea estates and misty mountain peaks.",
    description:
      "A focused journey through Sri Lanka's breathtaking highlands. Wind through emerald tea plantations, hike to stunning viewpoints, ride the world-famous scenic train, and discover charming colonial towns.",
    regions: ["Hill Country", "Cultural Triangle"],
    difficulty: "Moderate",
    heroImages: [
      "https://images.unsplash.com/photo-1580715911453-35e13f8b3ff5?w=1200&q=80",
      "https://images.unsplash.com/photo-1566296440244-0e3e7b3e22ad?w=1200&q=80",
    ],
    highlights: [
      "World's End (Horton Plains)",
      "Scenic train Nuwara Eliya → Ella",
      "Nine Arches Bridge",
      "Adam's Peak sunrise",
      "Knuckles Range trek",
      "Tea factory tours",
    ],
    whatsIncluded: [
      "Private vehicle & driver",
      "All fuel & tolls",
      "Driver accommodation & meals",
      "Airport pickup & drop-off",
      "Bottled water daily",
    ],
    whatsNotIncluded: [
      "Hotel accommodation",
      "Meals for travellers",
      "Train tickets",
      "Entrance fees",
      "Tips",
    ],
    vehicleRates: { car: 48, minivan: 65, "large-van": 88, "small-bus": 122, "medium-bus": 170 },
    sortOrder: 4,
    itineraries: {
      5: [
        { day: 1, title: "Airport → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Transfer to Kandy, gateway to the highlands.", drivingTime: "3.5 hours", stops: ["Temple of the Tooth", "Kandy Lake"] },
        { day: 2, title: "Kandy → Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Drive through tea estates. Tea factory visit.", drivingTime: "2.5 hours", stops: ["Tea Factory", "Gregory Lake"] },
        { day: 3, title: "Horton Plains", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Pre-dawn drive to World's End viewpoint.", drivingTime: "1 hour", stops: ["Horton Plains", "World's End", "Baker's Falls"] },
        { day: 4, title: "Nuwara Eliya → Ella (Train)", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Scenic train ride through the highlands. Nine Arches Bridge.", drivingTime: "Train: 3 hours", stops: ["Scenic Train", "Nine Arches Bridge"] },
        { day: 5, title: "Ella → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Little Adam's Peak morning, then drive to airport.", drivingTime: "5 hours", stops: ["Little Adam's Peak", "Bandaranaike Airport"] },
      ],
      7: [
        { day: 1, title: "Airport → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Temple of the Tooth evening.", drivingTime: "3.5 hours", stops: ["Temple of the Tooth", "Kandy Lake"] },
        { day: 2, title: "Kandy & Knuckles", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Peradeniya Botanical Gardens and Knuckles cloud forest trek.", drivingTime: "1.5 hours", stops: ["Peradeniya Gardens", "Knuckles Mountain Range"] },
        { day: 3, title: "Kandy → Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Tea country. Factory visit.", drivingTime: "2.5 hours", stops: ["Tea Factory", "Ramboda Falls", "Gregory Lake"] },
        { day: 4, title: "Horton Plains", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "World's End dawn hike.", drivingTime: "1 hour", stops: ["Horton Plains", "World's End", "Baker's Falls"] },
        { day: 5, title: "Nuwara Eliya → Ella (Train)", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Scenic train through the highlands.", drivingTime: "Train: 3 hours", stops: ["Scenic Train", "Nine Arches Bridge"] },
        { day: 6, title: "Ella exploration", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Little Adam's Peak, Ravana Falls and Ella's cafés.", drivingTime: "30 minutes", stops: ["Little Adam's Peak", "Ravana Falls", "Ella Rock"] },
        { day: 7, title: "Ella → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Drive back to airport.", drivingTime: "5 hours", stops: ["Bandaranaike Airport"] },
      ],
      10: [
        { day: 1, title: "Airport → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Transfer to Kandy.", drivingTime: "3.5 hours", stops: ["Temple of the Tooth", "Kandy Lake"] },
        { day: 2, title: "Kandy sights", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Peradeniya Botanical Gardens, Kandyan dance.", drivingTime: "1 hour", stops: ["Peradeniya Gardens", "Kandyan Dance Show"] },
        { day: 3, title: "Knuckles Trek", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Knuckles cloud forest trekking.", drivingTime: "1.5 hours", stops: ["Knuckles Mountain Range"] },
        { day: 4, title: "Kandy → Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Tea estates, factory tour.", drivingTime: "2.5 hours", stops: ["Tea Factory", "Ramboda Falls"] },
        { day: 5, title: "Horton Plains", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "World's End dawn hike.", drivingTime: "1 hour", stops: ["Horton Plains", "World's End"] },
        { day: 6, title: "Adam's Peak", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Pre-dawn pilgrimage hike for sunrise.", drivingTime: "2 hours", stops: ["Adam's Peak Summit"] },
        { day: 7, title: "Nuwara Eliya → Ella (Train)", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Famous scenic train ride.", drivingTime: "Train: 3 hours", stops: ["Scenic Train", "Nine Arches Bridge"] },
        { day: 8, title: "Ella exploration", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Little Adam's Peak, Ravana Falls.", drivingTime: "30 minutes", stops: ["Little Adam's Peak", "Ravana Falls"] },
        { day: 9, title: "Ella → Colombo", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Drive to Colombo, evening exploration.", drivingTime: "6 hours", stops: ["Colombo City", "Gangaramaya Temple"] },
        { day: 10, title: "Colombo → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning in Colombo, then airport.", drivingTime: "45 minutes", stops: ["Pettah Market", "Bandaranaike Airport"] },
      ],
      14: [
        { day: 1, title: "Airport → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Transfer to Kandy.", drivingTime: "3.5 hours", stops: ["Temple of the Tooth"] },
        { day: 2, title: "Kandy sights", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Botanical Gardens, Kandyan dance.", drivingTime: "1 hour", stops: ["Peradeniya Gardens", "Kandyan Dance Show"] },
        { day: 3, title: "Knuckles Range", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Cloud forest trek.", drivingTime: "1.5 hours", stops: ["Knuckles Mountain Range"] },
        { day: 4, title: "Kandy → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock fortress.", drivingTime: "2.5 hours", stops: ["Sigiriya Rock", "Dambulla Cave Temple"] },
        { day: 5, title: "Sigiriya → Kandy (return)", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Return to Kandy.", drivingTime: "2.5 hours", stops: ["Kandy"] },
        { day: 6, title: "Kandy → Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Tea estates.", drivingTime: "2.5 hours", stops: ["Tea Factory", "Gregory Lake"] },
        { day: 7, title: "Horton Plains", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "World's End dawn.", drivingTime: "1 hour", stops: ["Horton Plains", "World's End"] },
        { day: 8, title: "Adam's Peak", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Sunrise pilgrimage.", drivingTime: "2 hours", stops: ["Adam's Peak Summit"] },
        { day: 9, title: "Nuwara Eliya → Ella (Train)", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Scenic train.", drivingTime: "Train: 3 hours", stops: ["Scenic Train", "Nine Arches Bridge"] },
        { day: 10, title: "Ella exploration", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Little Adam's Peak, Ravana Falls.", drivingTime: "30 minutes", stops: ["Little Adam's Peak", "Ravana Falls"] },
        { day: 11, title: "Ella → Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Leopard safari day.", drivingTime: "3 hours", stops: ["Yala National Park Safari"] },
        { day: 12, title: "Yala → Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Drive to the coast.", drivingTime: "3 hours", stops: ["Mirissa Beach", "Galle Fort"] },
        { day: 13, title: "Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Galle Fort leisure day.", drivingTime: "Walking", stops: ["Galle Fort", "Lighthouse"] },
        { day: 14, title: "Galle → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Departure transfer.", drivingTime: "2.5 hours", stops: ["Bandaranaike Airport"] },
      ],
    },
  },
  {
    groupSlug: "cultural-triangle",
    name: "Cultural Triangle",
    tagline: "Ancient kingdoms, rock fortresses and sacred temples.",
    description:
      "Immerse yourself in Sri Lanka's extraordinary ancient history. Explore the UNESCO World Heritage Sites of Anuradhapura, Polonnaruwa, Sigiriya and Dambulla — a region that was once the centre of a great civilisation.",
    regions: ["Cultural Triangle", "North Central"],
    difficulty: "Easy",
    heroImages: [
      "https://images.unsplash.com/photo-1585016495481-91613e26f576?w=1200&q=80",
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=1200&q=80",
    ],
    highlights: [
      "Sigiriya Lion Rock (UNESCO)",
      "Anuradhapura (UNESCO)",
      "Polonnaruwa (UNESCO)",
      "Dambulla Cave Temple",
      "Ritigala Monastery",
      "Aukana Buddha statue",
    ],
    whatsIncluded: [
      "Private vehicle & driver",
      "All fuel & tolls",
      "Driver accommodation & meals",
      "Airport pickup & drop-off",
      "Bottled water daily",
    ],
    whatsNotIncluded: [
      "Hotel accommodation",
      "Meals for travellers",
      "Entrance fees to sites",
      "Tips",
    ],
    vehicleRates: { car: 45, minivan: 62, "large-van": 82, "small-bus": 115, "medium-bus": 160 },
    sortOrder: 5,
    itineraries: {
      5: [
        { day: 1, title: "Airport → Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Transfer to the ancient capital.", drivingTime: "5 hours", stops: ["Bandaranaike Airport", "Anuradhapura"] },
        { day: 2, title: "Anuradhapura exploration", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Sri Maha Bodhi, Ruwanwelisaya, Jetavana — the three great dagobas.", drivingTime: "Cycling/walking", stops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba", "Jetavana Stupa"] },
        { day: 3, title: "Anuradhapura → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock fortress. Dambulla Cave Temple.", drivingTime: "2 hours", stops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
        { day: 4, title: "Polonnaruwa", location: "Polonnaruwa", lat: 7.9403, lng: 81.0188, description: "Medieval capital ruins — Royal Palace, Gal Vihara.", drivingTime: "1.5 hours", stops: ["Polonnaruwa Royal Palace", "Gal Vihara", "Vatadage"] },
        { day: 5, title: "Sigiriya → Kandy → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning Minneriya, then drive to Kandy and airport.", drivingTime: "6 hours", stops: ["Minneriya National Park", "Temple of the Tooth", "Bandaranaike Airport"] },
      ],
      7: [
        { day: 1, title: "Airport → Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Transfer to ancient capital.", drivingTime: "5 hours", stops: ["Bandaranaike Airport", "Anuradhapura"] },
        { day: 2, title: "Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "UNESCO sacred city cycling tour.", drivingTime: "Cycling", stops: ["Sri Maha Bodhi", "Ruwanwelisaya", "Jetavana", "Abhayagiri"] },
        { day: 3, title: "Anuradhapura → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Ritigala ancient monastery ruins, then Sigiriya.", drivingTime: "2 hours", stops: ["Ritigala Monastery", "Sigiriya"] },
        { day: 4, title: "Sigiriya Rock & Dambulla", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb Lion Rock, Dambulla Cave Temple.", drivingTime: "1 hour", stops: ["Sigiriya Rock", "Dambulla Cave Temple"] },
        { day: 5, title: "Polonnaruwa", location: "Polonnaruwa", lat: 7.9403, lng: 81.0188, description: "Medieval capital. Gal Vihara reclining Buddha.", drivingTime: "1.5 hours", stops: ["Polonnaruwa Royal Palace", "Gal Vihara", "Parakrama Samudra"] },
        { day: 6, title: "Minneriya & Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Elephant gathering, then drive to Kandy.", drivingTime: "3 hours", stops: ["Minneriya National Park", "Temple of the Tooth"] },
        { day: 7, title: "Kandy → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Transfer to airport.", drivingTime: "3.5 hours", stops: ["Peradeniya Gardens", "Bandaranaike Airport"] },
      ],
      10: [
        { day: 1, title: "Airport → Colombo", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Arrive in Colombo.", drivingTime: "45 minutes", stops: ["Colombo Fort", "Gangaramaya Temple"] },
        { day: 2, title: "Colombo → Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Drive north to ancient capital.", drivingTime: "4.5 hours", stops: ["Aukana Buddha", "Anuradhapura"] },
        { day: 3, title: "Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Full UNESCO site exploration.", drivingTime: "Cycling", stops: ["Sri Maha Bodhi", "Ruwanwelisaya", "Jetavana", "Abhayagiri"] },
        { day: 4, title: "Anuradhapura → Jaffna", location: "Jaffna", lat: 9.6615, lng: 80.0255, description: "Drive to Jaffna, Tamil cultural heartland.", drivingTime: "3 hours", stops: ["Nallur Kandaswamy Temple", "Jaffna Fort"] },
        { day: 5, title: "Jaffna peninsula", location: "Jaffna", lat: 9.6615, lng: 80.0255, description: "Casuarina Beach, Nagadeepa Island temple.", drivingTime: "2 hours", stops: ["Casuarina Beach", "Nagadeepa Island", "Point Pedro"] },
        { day: 6, title: "Jaffna → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Drive south to Lion Rock.", drivingTime: "5 hours", stops: ["Sigiriya"] },
        { day: 7, title: "Sigiriya Rock & Dambulla", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock, Dambulla Cave Temple.", drivingTime: "1 hour", stops: ["Sigiriya Rock", "Dambulla Cave Temple"] },
        { day: 8, title: "Polonnaruwa", location: "Polonnaruwa", lat: 7.9403, lng: 81.0188, description: "Medieval capital ruins.", drivingTime: "1.5 hours", stops: ["Polonnaruwa Royal Palace", "Gal Vihara"] },
        { day: 9, title: "Minneriya & Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Elephant gathering, Temple of Tooth.", drivingTime: "3 hours", stops: ["Minneriya National Park", "Temple of the Tooth"] },
        { day: 10, title: "Kandy → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Transfer to airport.", drivingTime: "3.5 hours", stops: ["Peradeniya Gardens", "Bandaranaike Airport"] },
      ],
      14: [
        { day: 1, title: "Airport → Colombo", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Arrive in Colombo.", drivingTime: "45 minutes", stops: ["Colombo City"] },
        { day: 2, title: "Colombo → Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Ancient capital drive.", drivingTime: "4.5 hours", stops: ["Aukana Buddha", "Anuradhapura"] },
        { day: 3, title: "Anuradhapura day 2", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Deep dive into UNESCO sites.", drivingTime: "Cycling", stops: ["Sri Maha Bodhi", "Ruwanwelisaya", "Abhayagiri Museum"] },
        { day: 4, title: "Anuradhapura → Jaffna", location: "Jaffna", lat: 9.6615, lng: 80.0255, description: "Tamil cultural heartland.", drivingTime: "3 hours", stops: ["Nallur Kandaswamy Temple", "Jaffna Fort"] },
        { day: 5, title: "Jaffna peninsula", location: "Jaffna", lat: 9.6615, lng: 80.0255, description: "Islands and beaches of Jaffna.", drivingTime: "2 hours", stops: ["Casuarina Beach", "Nagadeepa Island"] },
        { day: 6, title: "Jaffna → Mannar", location: "Mannar", lat: 8.9771, lng: 79.9038, description: "Flamingo lagoon.", drivingTime: "2.5 hours", stops: ["Mannar Flamingo Lagoon", "Adam's Bridge"] },
        { day: 7, title: "Mannar → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Drive to the cultural triangle.", drivingTime: "4 hours", stops: ["Sigiriya"] },
        { day: 8, title: "Sigiriya Rock & Dambulla", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock fortress, cave temple.", drivingTime: "1 hour", stops: ["Sigiriya Rock", "Dambulla Cave Temple"] },
        { day: 9, title: "Polonnaruwa", location: "Polonnaruwa", lat: 7.9403, lng: 81.0188, description: "Medieval capital. Gal Vihara.", drivingTime: "1.5 hours", stops: ["Gal Vihara", "Polonnaruwa Royal Palace"] },
        { day: 10, title: "Minneriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Elephant gathering.", drivingTime: "1 hour", stops: ["Minneriya National Park"] },
        { day: 11, title: "Sigiriya → Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive to Kandy.", drivingTime: "3 hours", stops: ["Temple of the Tooth", "Kandy Lake"] },
        { day: 12, title: "Kandy sights", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Botanical gardens, tea.", drivingTime: "1 hour", stops: ["Peradeniya Gardens", "Tea Factory"] },
        { day: 13, title: "Kandy → Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Tea estate country.", drivingTime: "2.5 hours", stops: ["Tea Factory", "Gregory Lake"] },
        { day: 14, title: "Nuwara Eliya → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Departure transfer.", drivingTime: "5 hours", stops: ["Bandaranaike Airport"] },
      ],
    },
  },
  {
    groupSlug: "east-coast-escape",
    name: "East Coast Escape",
    tagline: "Turquoise waters, quiet coves and ancient temples.",
    description:
      "The east coast is Sri Lanka's best-kept secret — pristine beaches, clear warm water, surf breaks and Hindu temples. This tour combines the east coast's natural beauty with the ancient wonders of the cultural triangle.",
    regions: ["East Coast", "Cultural Triangle"],
    difficulty: "Easy",
    heroImages: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80",
      "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200&q=80",
    ],
    highlights: [
      "Arugam Bay surfing",
      "Pigeon Island snorkelling",
      "Trincomalee harbour",
      "Koneswaram Temple",
      "Passikudah lagoon",
      "Kumana National Park",
    ],
    whatsIncluded: [
      "Private vehicle & driver",
      "All fuel & tolls",
      "Driver accommodation & meals",
      "Airport pickup & drop-off",
      "Bottled water daily",
    ],
    whatsNotIncluded: [
      "Hotel accommodation",
      "Meals for travellers",
      "Entrance fees",
      "Tips",
    ],
    vehicleRates: { car: 48, minivan: 65, "large-van": 88, "small-bus": 122, "medium-bus": 170 },
    sortOrder: 6,
    itineraries: {
      5: [
        { day: 1, title: "Airport → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Transfer to Sigiriya.", drivingTime: "4 hours", stops: ["Bandaranaike Airport", "Sigiriya"] },
        { day: 2, title: "Sigiriya → Trincomalee", location: "Trincomalee", lat: 8.5874, lng: 81.2152, description: "Climb Lion Rock, then drive to Trinco.", drivingTime: "3.5 hours", stops: ["Sigiriya Rock", "Koneswaram Temple"] },
        { day: 3, title: "Trincomalee & Pigeon Island", location: "Trincomalee", lat: 8.5874, lng: 81.2152, description: "Pigeon Island snorkelling and Nilaveli beach.", drivingTime: "30 minutes", stops: ["Pigeon Island", "Nilaveli Beach"] },
        { day: 4, title: "Trincomalee → Passikudah", location: "Passikudah", lat: 7.9258, lng: 81.5606, description: "Passikudah's shallow turquoise lagoon.", drivingTime: "2 hours", stops: ["Passikudah Beach", "Kalkudah"] },
        { day: 5, title: "Passikudah → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Drive to airport via Colombo.", drivingTime: "6 hours", stops: ["Bandaranaike Airport"] },
      ],
      7: [
        { day: 1, title: "Airport → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Transfer to cultural triangle.", drivingTime: "4 hours", stops: ["Bandaranaike Airport", "Sigiriya"] },
        { day: 2, title: "Sigiriya Rock & Polonnaruwa", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock and medieval Polonnaruwa.", drivingTime: "1.5 hours", stops: ["Sigiriya Rock", "Polonnaruwa Ruins"] },
        { day: 3, title: "Sigiriya → Trincomalee", location: "Trincomalee", lat: 8.5874, lng: 81.2152, description: "Drive to Trinco. Koneswaram Temple.", drivingTime: "3 hours", stops: ["Koneswaram Temple", "Fort Frederick"] },
        { day: 4, title: "Pigeon Island & Nilaveli", location: "Trincomalee", lat: 8.5874, lng: 81.2152, description: "Snorkelling and beach.", drivingTime: "30 minutes", stops: ["Pigeon Island", "Nilaveli Beach", "Marble Beach"] },
        { day: 5, title: "Trincomalee → Passikudah", location: "Passikudah", lat: 7.9258, lng: 81.5606, description: "Turquoise lagoon.", drivingTime: "2 hours", stops: ["Passikudah Beach"] },
        { day: 6, title: "Passikudah → Arugam Bay", location: "Arugam Bay", lat: 6.8397, lng: 81.8362, description: "Surf town of Arugam Bay.", drivingTime: "3 hours", stops: ["Arugam Bay Beach", "Pottuvil Lagoon"] },
        { day: 7, title: "Arugam Bay → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Long drive to airport.", drivingTime: "7 hours", stops: ["Bandaranaike Airport"] },
      ],
      10: [
        { day: 1, title: "Airport → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Transfer to cultural triangle.", drivingTime: "4 hours", stops: ["Bandaranaike Airport", "Sigiriya"] },
        { day: 2, title: "Sigiriya Rock & Dambulla", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock and cave temple.", drivingTime: "1 hour", stops: ["Sigiriya Rock", "Dambulla Cave Temple"] },
        { day: 3, title: "Polonnaruwa", location: "Polonnaruwa", lat: 7.9403, lng: 81.0188, description: "Medieval capital ruins.", drivingTime: "1.5 hours", stops: ["Polonnaruwa Royal Palace", "Gal Vihara"] },
        { day: 4, title: "Polonnaruwa → Trincomalee", location: "Trincomalee", lat: 8.5874, lng: 81.2152, description: "East coast. Koneswaram Temple.", drivingTime: "3 hours", stops: ["Koneswaram Temple", "Fort Frederick"] },
        { day: 5, title: "Pigeon Island & Nilaveli", location: "Trincomalee", lat: 8.5874, lng: 81.2152, description: "Snorkelling and beach.", drivingTime: "30 minutes", stops: ["Pigeon Island", "Nilaveli Beach"] },
        { day: 6, title: "Trincomalee → Passikudah", location: "Passikudah", lat: 7.9258, lng: 81.5606, description: "Turquoise lagoon.", drivingTime: "2 hours", stops: ["Passikudah Beach"] },
        { day: 7, title: "Passikudah → Arugam Bay", location: "Arugam Bay", lat: 6.8397, lng: 81.8362, description: "Surf coast.", drivingTime: "3 hours", stops: ["Arugam Bay Beach", "Pottuvil Lagoon"] },
        { day: 8, title: "Arugam Bay", location: "Arugam Bay", lat: 6.8397, lng: 81.8362, description: "Surfing, lagoon safari, Lahugala elephants.", drivingTime: "30 minutes", stops: ["Surf Beach", "Lahugala National Park"] },
        { day: 9, title: "Arugam Bay → Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Drive to Ella highlands.", drivingTime: "3.5 hours", stops: ["Ella", "Nine Arches Bridge"] },
        { day: 10, title: "Ella → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Transfer to airport.", drivingTime: "5 hours", stops: ["Bandaranaike Airport"] },
      ],
      14: [
        { day: 1, title: "Airport → Colombo", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Arrive in Colombo.", drivingTime: "45 minutes", stops: ["Colombo City"] },
        { day: 2, title: "Colombo → Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Ancient capital.", drivingTime: "4.5 hours", stops: ["Anuradhapura"] },
        { day: 3, title: "Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "UNESCO site cycling tour.", drivingTime: "Cycling", stops: ["Sri Maha Bodhi", "Ruwanwelisaya", "Jetavana"] },
        { day: 4, title: "Anuradhapura → Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Lion Rock.", drivingTime: "2 hours", stops: ["Sigiriya Rock", "Dambulla Cave Temple"] },
        { day: 5, title: "Polonnaruwa", location: "Polonnaruwa", lat: 7.9403, lng: 81.0188, description: "Medieval ruins.", drivingTime: "1.5 hours", stops: ["Polonnaruwa Royal Palace", "Gal Vihara"] },
        { day: 6, title: "Sigiriya → Trincomalee", location: "Trincomalee", lat: 8.5874, lng: 81.2152, description: "East coast. Koneswaram Temple.", drivingTime: "3 hours", stops: ["Koneswaram Temple"] },
        { day: 7, title: "Trincomalee & Nilaveli", location: "Trincomalee", lat: 8.5874, lng: 81.2152, description: "Pigeon Island, Nilaveli Beach.", drivingTime: "30 minutes", stops: ["Pigeon Island", "Nilaveli Beach", "Marble Beach"] },
        { day: 8, title: "Trincomalee → Passikudah", location: "Passikudah", lat: 7.9258, lng: 81.5606, description: "Lagoon.", drivingTime: "2 hours", stops: ["Passikudah Beach"] },
        { day: 9, title: "Passikudah leisure", location: "Passikudah", lat: 7.9258, lng: 81.5606, description: "Snorkelling, kayaking.", drivingTime: "Local", stops: ["Passikudah Reef", "Kalkudah"] },
        { day: 10, title: "Passikudah → Arugam Bay", location: "Arugam Bay", lat: 6.8397, lng: 81.8362, description: "Surf coast.", drivingTime: "3 hours", stops: ["Arugam Bay Beach"] },
        { day: 11, title: "Arugam Bay surfing", location: "Arugam Bay", lat: 6.8397, lng: 81.8362, description: "Surf, lagoon, Lahugala elephants.", drivingTime: "30 minutes", stops: ["Surf Beach", "Pottuvil Lagoon", "Lahugala National Park"] },
        { day: 12, title: "Arugam Bay → Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Leopard safari.", drivingTime: "2.5 hours", stops: ["Yala National Park Safari"] },
        { day: 13, title: "Yala → Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Drive to Ella.", drivingTime: "3.5 hours", stops: ["Nine Arches Bridge", "Little Adam's Peak"] },
        { day: 14, title: "Ella → Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Departure transfer.", drivingTime: "5 hours", stops: ["Bandaranaike Airport"] },
      ],
    },
  },
];

// ─── Run seed ─────────────────────────────────────────────────────────────────

async function run() {
  console.log("🦚 Seeding 6 tour groups × 4 durations = 24 variants...\n");

  // Clear existing tour data
  console.log("  Clearing existing tours data...");
  await db.execute(sql`DELETE FROM seasonal_pricing`);
  await db.execute(sql`DELETE FROM tour_add_ons`);
  await db.execute(sql`DELETE FROM itinerary_days`);
  await db.execute(sql`DELETE FROM tour_vehicle_rates`);
  await db.execute(sql`DELETE FROM tours`);
  console.log("  ✓ Cleared\n");

  for (const group of TOUR_GROUPS) {
    console.log(`  Processing: ${group.name}`);
    const groupId = randomUUID();

    for (const days of DURATIONS) {
      const nights = days - 1;
      const slug = `${group.groupSlug}-${days}d`;

      const [tour] = await db
        .insert(toursTable)
        .values({
          slug,
          groupId,
          groupSlug: group.groupSlug,
          name: group.name,
          tagline: group.tagline,
          description: group.description,
          durationDays: days,
          durationNights: nights,
          highlights: group.highlights,
          regions: group.regions,
          difficulty: group.difficulty,
          heroImages: group.heroImages,
          bestMonths: [1, 2, 3, 11, 12],
          whatsIncluded: group.whatsIncluded,
          whatsNotIncluded: group.whatsNotIncluded,
          minLeadTimeDays: 7,
          maxExtraDays: 0,
          isActive: true,
          sortOrder: group.sortOrder * 10 + days,
        })
        .returning();

      // Vehicle rates
      await db.insert(tourVehicleRatesTable).values(
        Object.entries(group.vehicleRates).map(([vehicleType, pricePerDay]) => ({
          tourId: tour.id,
          vehicleType,
          pricePerDay,
        }))
      );

      // Itinerary days
      const itineraryDays = group.itineraries[days as keyof typeof group.itineraries];
      if (itineraryDays?.length) {
        await db.insert(itineraryDaysTable).values(
          itineraryDays.map((d) => ({
            tourId: tour.id,
            dayNumber: d.day,
            title: d.title,
            location: d.location,
            lat: d.lat,
            lng: d.lng,
            description: d.description,
            drivingTime: d.drivingTime,
            keyStops: d.stops,
          }))
        );
      }

      // Add-ons
      await db.insert(tourAddOnsTable).values([
        { tourId: tour.id, name: "Airport Pickup", description: "Meet & greet at Bandaranaike International Airport", priceGBP: 28 },
        { tourId: tour.id, name: "Welcome Pack", description: "Local SIM card, bottled water, snacks & guidebook", priceGBP: 15 },
      ]);

      // Seasonal pricing
      await db.insert(seasonalPricingTable).values([
        { tourId: tour.id, startDate: new Date("2025-12-15"), endDate: new Date("2026-01-15"), multiplier: 1.25 },
        { tourId: tour.id, startDate: new Date("2026-07-01"), endDate: new Date("2026-08-31"), multiplier: 1.15 },
      ]);

      console.log(`    ✓ ${slug} (${days} days, ${nights} nights)`);
    }
  }

  console.log("\n🎉 Done! 24 tour variants seeded.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
