/**
 * Seed script for Peacock Drivers database
 * Run with: npx tsx src/seed.ts (from lib/db directory)
 * Or: pnpm --filter @workspace/db seed
 */

import { db } from "./index.js";
import { eq } from "drizzle-orm";
import {
  usersTable,
  driversTable,
  driverVehiclesTable,
  driverPayoutRatesTable,
  toursTable,
  tourVehicleRatesTable,
  itineraryDaysTable,
  tourAddOnsTable,
  seasonalPricingTable,
  vehiclesTable,
  transferRoutesTable,
  transferFixedPricesTable,
  bookingsTable,
  invoicesTable,
  customTourRequestsTable,
  bookingActivitiesTable,
  globalSeasonalPricingTable,
  cyoVehicleRatesTable,
  cyoUpsellItemsTable,
} from "./schema/index.js";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────────────────────────
  console.log("  Creating admin user...");
  const adminPasswordHash = await bcrypt.hash("admin123!", 12);
  const driverPasswordHash = await bcrypt.hash("driver123!", 12);
  const touristPasswordHash = await bcrypt.hash("tourist123!", 12);

  const [admin] = await db
    .insert(usersTable)
    .values({
      email: "sameer@artyreal.com",
      passwordHash: adminPasswordHash,
      firstName: "Sameer",
      lastName: "Admin",
      role: "ADMIN",
      country: "GB",
    })
    .onConflictDoNothing()
    .returning();

  const [driver1User] = await db
    .insert(usersTable)
    .values({
      email: "kumara@peacockdrivers.com",
      passwordHash: driverPasswordHash,
      firstName: "Kumara",
      lastName: "Perera",
      phone: "+94771234567",
      role: "DRIVER",
      country: "LK",
    })
    .onConflictDoNothing()
    .returning();

  const [driver2User] = await db
    .insert(usersTable)
    .values({
      email: "nimal@peacockdrivers.com",
      passwordHash: driverPasswordHash,
      firstName: "Nimal",
      lastName: "Silva",
      phone: "+94779876543",
      role: "DRIVER",
      country: "LK",
    })
    .onConflictDoNothing()
    .returning();

  const [tourist1] = await db
    .insert(usersTable)
    .values({
      email: "xyz@example.com",
      passwordHash: touristPasswordHash,
      firstName: "Sarah",
      lastName: "Johnson",
      country: "GB",
      role: "TOURIST",
    })
    .onConflictDoNothing()
    .returning();

  // Re-fetch users in case they already existed (onConflictDoNothing returns nothing for conflicts)
  const [resolvedTourist] = await db.select().from(usersTable).where(eq(usersTable.email, "xyz@example.com")).limit(1);
  const [resolvedDriver1] = await db.select().from(usersTable).where(eq(usersTable.email, "kumara@peacockdrivers.com")).limit(1);
  const [resolvedDriver2] = await db.select().from(usersTable).where(eq(usersTable.email, "nimal@peacockdrivers.com")).limit(1);

  console.log("  ✓ Users created");

  // ─── Drivers ─────────────────────────────────────────────────────────────
  if (driver1User) {
    const [driver1] = await db
      .insert(driversTable)
      .values({
        userId: driver1User.id,
        bio: "10+ years experience driving tourists across Sri Lanka. Specialised in cultural tours and wildlife safaris. English and German speaker.",
        languages: ["English", "Sinhala", "German"],
        experienceYears: 12,
        isActive: true,
        regionPreferences: ["Cultural Triangle", "Hill Country", "South Coast"],
      })
      .onConflictDoNothing()
      .returning();

    if (driver1) {
      await db
        .insert(driverVehiclesTable)
        .values({
          driverId: driver1.id,
          vehicleType: "minivan",
          plateNumber: "WP CAR-1234",
          year: 2022,
          features: ["Air conditioning", "USB charging", "Luggage space for 4 bags"],
        })
        .onConflictDoNothing();
    }
  }

  if (driver2User) {
    const [driver2] = await db
      .insert(driversTable)
      .values({
        userId: driver2User.id,
        bio: "Certified professional driver with 8 years experience. Expert knowledge of Sri Lanka's hidden gems and local cuisine.",
        languages: ["English", "Sinhala", "Tamil"],
        experienceYears: 8,
        isActive: true,
        regionPreferences: ["South Coast", "East Coast", "Colombo"],
      })
      .onConflictDoNothing()
      .returning();

    if (driver2) {
      await db
        .insert(driverVehiclesTable)
        .values({
          driverId: driver2.id,
          vehicleType: "car",
          plateNumber: "WP CAR-5678",
          year: 2023,
          features: ["Air conditioning", "USB charging"],
        })
        .onConflictDoNothing();
    }
  }

  console.log("  ✓ Drivers created");

  // ─── Vehicles ─────────────────────────────────────────────────────────────
  console.log("  Creating vehicles...");
  await db
    .insert(vehiclesTable)
    .values([
      {
        type: "car",
        name: "Car",
        model: "Toyota Prius",
        slug: "car",
        imageUrl: "/vehicles/car-new.png",
        capacityMin: 1,
        capacityMax: 3,
        description:
          "Comfortable sedan perfect for solo travellers or couples. Air-conditioned with ample luggage space.",
        features: ["Air conditioning", "USB charging", "Luggage space for 2 bags"],
        pricePerDay: 45,
        pricePerKm: 0.55,
        countInFleet: 5,
        sortOrder: 1,
      },
      {
        type: "minivan",
        name: "Minivan",
        model: "Toyota HiAce",
        slug: "minivan",
        imageUrl: "/vehicles/minivan-new.png",
        capacityMin: 4,
        capacityMax: 6,
        description:
          "Spacious minivan ideal for families or small groups. Comfortable seating with excellent visibility.",
        features: ["Air conditioning", "USB charging", "Luggage space for 4 bags", "Sliding doors"],
        pricePerDay: 65,
        pricePerKm: 0.75,
        countInFleet: 8,
        sortOrder: 2,
      },
      {
        type: "large-van",
        name: "Large Van",
        model: "Toyota HiAce HR",
        slug: "large-van",
        imageUrl: "/vehicles/large-minivan-new.png",
        capacityMin: 7,
        capacityMax: 10,
        description:
          "High-roof van with generous legroom for larger groups. Perfect for extended tours with lots of luggage.",
        features: ["Air conditioning", "USB charging", "Large luggage compartment", "High roof clearance"],
        pricePerDay: 85,
        pricePerKm: 0.95,
        countInFleet: 4,
        sortOrder: 3,
      },
      {
        type: "small-bus",
        name: "Small Bus",
        model: "Toyota Coaster",
        slug: "small-bus",
        imageUrl: "/vehicles/small-bus-new.png",
        capacityMin: 11,
        capacityMax: 20,
        description:
          "Comfortable coach for medium-sized groups. Reclining seats and panoramic windows for the best views.",
        features: ["Air conditioning", "Reclining seats", "Overhead storage", "PA system"],
        pricePerDay: 120,
        pricePerKm: 1.2,
        countInFleet: 3,
        sortOrder: 4,
      },
      {
        type: "medium-bus",
        name: "Medium Bus",
        model: "King Long",
        slug: "medium-bus",
        imageUrl: "/vehicles/medium-bus-new.png",
        capacityMin: 21,
        capacityMax: 35,
        description:
          "Full-size touring coach for large groups. Premium comfort with entertainment system and ample storage.",
        features: ["Air conditioning", "Reclining seats", "Entertainment system", "Large luggage hold", "PA system"],
        pricePerDay: 175,
        pricePerKm: 1.5,
        countInFleet: 2,
        sortOrder: 5,
      },
    ])
    .onConflictDoNothing();

  console.log("  ✓ Vehicles created");

  // ─── Transfer Routes ──────────────────────────────────────────────────────
  console.log("  Creating transfer routes...");
  const airportRoutes = [
    {
      name: "Airport → Colombo",
      fromLocation: "Bandaranaike Int. Airport (CMB)",
      toLocation: "Colombo City",
      fromLat: 7.1808,
      fromLng: 79.8841,
      toLat: 6.9271,
      toLng: 79.8612,
      distanceKm: 35,
      estimatedMins: 75,
      isAirport: true,
      prices: { car: 28, minivan: 38, "large-van": 48, "small-bus": 65, "medium-bus": 95 },
    },
    {
      name: "Airport → Kandy",
      fromLocation: "Bandaranaike Int. Airport (CMB)",
      toLocation: "Kandy",
      fromLat: 7.1808,
      fromLng: 79.8841,
      toLat: 7.2906,
      toLng: 80.6337,
      distanceKm: 120,
      estimatedMins: 195,
      isAirport: true,
      prices: { car: 66, minivan: 90, "large-van": 114, "small-bus": 144, "medium-bus": 180 },
    },
    {
      name: "Airport → Galle",
      fromLocation: "Bandaranaike Int. Airport (CMB)",
      toLocation: "Galle",
      fromLat: 7.1808,
      fromLng: 79.8841,
      toLat: 6.0535,
      toLng: 80.221,
      distanceKm: 165,
      estimatedMins: 210,
      isAirport: true,
      prices: { car: 91, minivan: 124, "large-van": 157, "small-bus": 198, "medium-bus": 248 },
    },
    {
      name: "Airport → Sigiriya",
      fromLocation: "Bandaranaike Int. Airport (CMB)",
      toLocation: "Sigiriya",
      fromLat: 7.1808,
      fromLng: 79.8841,
      toLat: 7.9573,
      toLng: 80.7601,
      distanceKm: 175,
      estimatedMins: 255,
      isAirport: true,
      prices: { car: 96, minivan: 131, "large-van": 166, "small-bus": 210, "medium-bus": 263 },
    },
    {
      name: "Airport → Ella",
      fromLocation: "Bandaranaike Int. Airport (CMB)",
      toLocation: "Ella",
      fromLat: 7.1808,
      fromLng: 79.8841,
      toLat: 6.8667,
      toLng: 81.0467,
      distanceKm: 270,
      estimatedMins: 390,
      isAirport: true,
      prices: { car: 149, minivan: 203, "large-van": 257, "small-bus": 324, "medium-bus": 405 },
    },
    {
      name: "Airport → Negombo",
      fromLocation: "Bandaranaike Int. Airport (CMB)",
      toLocation: "Negombo",
      fromLat: 7.1808,
      fromLng: 79.8841,
      toLat: 7.2096,
      toLng: 79.8378,
      distanceKm: 10,
      estimatedMins: 25,
      isAirport: true,
      prices: { car: 12, minivan: 16, "large-van": 20, "small-bus": 28, "medium-bus": 38 },
    },
  ];

  for (const route of airportRoutes) {
    const { prices, ...routeData } = route;
    const [inserted] = await db
      .insert(transferRoutesTable)
      .values(routeData)
      .onConflictDoNothing()
      .returning();

    if (inserted) {
      await db
        .insert(transferFixedPricesTable)
        .values(
          Object.entries(prices).map(([vehicleType, priceGBP]) => ({
            transferRouteId: inserted.id,
            vehicleType,
            priceGBP,
          }))
        )
        .onConflictDoNothing();
    }
  }

  console.log("  ✓ Transfer routes created");

  // ─── Tours ────────────────────────────────────────────────────────────────
  console.log("  Creating tours...");

  // NOTE: groupSlugs MUST match MOCK_TOUR_GROUPS in mock-data.ts:
  //   classic-sri-lanka | south-coast-beaches | wildlife-safari
  //   hill-country-explorer | cultural-triangle | east-coast-escape
  // Each group has 4 duration variants: 5, 7, 10, 14 days.
  // slug is unique per variant; groupSlug is shared across durations in the same group.

  const _sharedRates = { car: 45, minivan: 65, "large-van": 85, "small-bus": 120, "medium-bus": 175 };
  const _safariRates = { car: 50, minivan: 70, "large-van": 90, "small-bus": 130, "medium-bus": 185 };

  const tours = [
    // ── CLASSIC SRI LANKA ──────────────────────────────────────────────────
    {
      slug: "classic-sri-lanka-5d",
      groupSlug: "classic-sri-lanka",
      groupId: "classic-sri-lanka",
      name: "Classic Sri Lanka",
      tagline: "The perfect introduction to the island's highlights.",
      description: "A swift 5-day sweep of Sri Lanka's greatest hits — ancient rock fortresses, the cultural capital Kandy, and a finale on the golden south coast.",
      durationDays: 5,
      durationNights: 4,
      highlights: ["Sigiriya Rock Fortress", "Temple of the Tooth", "Galle Fort", "Mirissa Beach"],
      regions: ["Cultural Triangle", "Kandy", "South Coast"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80"],
      bestMonths: [1, 2, 3, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals", "Airport pickup & drop-off"],
      whatsNotIncluded: ["Hotel accommodation", "Meals for travellers", "Entrance fees", "Travel insurance"],
      minLeadTimeDays: 3, maxExtraDays: 3, sortOrder: 1,
    },
    {
      slug: "classic-sri-lanka-7d",
      groupSlug: "classic-sri-lanka", groupId: "classic-sri-lanka",
      name: "Classic Sri Lanka", tagline: "The perfect introduction to the island's highlights.",
      description: "Seven days covering Sri Lanka's greatest hits — ancient fortresses, the cultural capital Kandy, misty tea country, and the iconic Nine Arches Bridge at Ella.",
      durationDays: 7, durationNights: 6,
      highlights: ["Sigiriya Rock Fortress", "Temple of the Tooth", "Nine Arches Bridge", "Nuwara Eliya tea estates", "Galle Fort"],
      regions: ["Cultural Triangle", "Hill Country", "South Coast"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80"],
      bestMonths: [1, 2, 3, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals", "Airport pickup & drop-off"],
      whatsNotIncluded: ["Hotel accommodation", "Meals for travellers", "Entrance fees", "Travel insurance"],
      minLeadTimeDays: 3, maxExtraDays: 3, sortOrder: 1,
    },
    {
      slug: "classic-sri-lanka",
      groupSlug: "classic-sri-lanka", groupId: "classic-sri-lanka",
      name: "Classic Sri Lanka", tagline: "The perfect introduction to the island's highlights.",
      description: "Discover the very best of Sri Lanka on this comprehensive 10-day journey. From the ancient cities of the Cultural Triangle to the misty tea plantations of the Hill Country and the golden beaches of the south coast.",
      durationDays: 10, durationNights: 9,
      highlights: ["Sigiriya Rock Fortress", "Temple of the Tooth", "Tea plantation visit", "Yala National Park safari", "Galle Fort", "Nine Arches Bridge"],
      regions: ["Cultural Triangle", "Hill Country", "South Coast"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80", "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800&q=80"],
      bestMonths: [1, 2, 3, 11, 12],
      whatsIncluded: ["Private vehicle & driver for 10 days", "All fuel & tolls", "Driver accommodation & meals", "Airport pickup & drop-off", "Bottled water daily"],
      whatsNotIncluded: ["Hotel accommodation", "Meals for travellers", "Entrance fees to sites", "Tips for driver", "Travel insurance"],
      minLeadTimeDays: 3, maxExtraDays: 3, sortOrder: 1,
    },
    {
      slug: "classic-sri-lanka-14d",
      groupSlug: "classic-sri-lanka", groupId: "classic-sri-lanka",
      name: "Classic Sri Lanka", tagline: "The ultimate grand tour of the island.",
      description: "The full 14-day grand tour — cultural triangle, hill country, wildlife safari in Yala, the south coast's finest beaches, and a relaxing finale in Colombo.",
      durationDays: 14, durationNights: 13,
      highlights: ["Sigiriya Rock Fortress", "Kandy Temple of the Tooth", "Yala leopard safari", "Galle Fort UNESCO", "Mirissa whale watching", "Nine Arches Bridge", "Trincomalee Fort"],
      regions: ["Cultural Triangle", "Hill Country", "South Coast", "Colombo"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80"],
      bestMonths: [1, 2, 3, 11, 12],
      whatsIncluded: ["Private vehicle & driver for 14 days", "All fuel & tolls", "Driver accommodation & meals", "Airport pickup & drop-off", "Bottled water daily"],
      whatsNotIncluded: ["Hotel accommodation", "Meals for travellers", "Entrance fees", "Travel insurance"],
      minLeadTimeDays: 7, maxExtraDays: 4, sortOrder: 1,
    },

    // ── SOUTH COAST BEACHES ─────────────────────────────────────────────────
    {
      slug: "south-coast-beaches-5d",
      groupSlug: "south-coast-beaches", groupId: "south-coast-beaches",
      name: "South Coast Beaches", tagline: "Sun, surf and colonial charm.",
      description: "Five days on Sri Lanka's gorgeous southern coast — Galle Fort, Unawatuna's turquoise waters, and Mirissa's famous whale-watching.",
      durationDays: 5, durationNights: 4,
      highlights: ["Galle Fort (UNESCO)", "Mirissa whale watching", "Unawatuna Beach", "Stilt fishermen at sunset", "Turtle hatchery visit"],
      regions: ["South Coast", "Galle"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"],
      bestMonths: [11, 12, 1, 2, 3, 4],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotels", "Meals", "Whale watching boat fees", "Entry fees"],
      minLeadTimeDays: 3, maxExtraDays: 4, sortOrder: 2,
    },
    {
      slug: "south-coast-beaches-7d",
      groupSlug: "south-coast-beaches", groupId: "south-coast-beaches",
      name: "South Coast Beaches", tagline: "The full southern coastline experience.",
      description: "Seven days exploring the entire southern coast — Koggala lagoon, Galle Fort, Mirissa, whale watching, Tangalle's remote beaches, and a sunset at Rekawa turtle lagoon.",
      durationDays: 7, durationNights: 6,
      highlights: ["Galle Fort (UNESCO)", "Mirissa whale watching", "Tangalle beach", "Rekawa turtle sanctuary", "Stilt fishermen"],
      regions: ["South Coast", "Galle"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"],
      bestMonths: [11, 12, 1, 2, 3, 4],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotels", "Meals", "Whale watching boat fees", "Entry fees"],
      minLeadTimeDays: 3, maxExtraDays: 4, sortOrder: 2,
    },
    {
      slug: "south-coast-beaches-10d",
      groupSlug: "south-coast-beaches", groupId: "south-coast-beaches",
      name: "South Coast Beaches", tagline: "Coast, culture and hill country.",
      description: "Ten days blending southern coastline bliss with a hill country detour — Ella's mountain scenery, Nine Arches Bridge, then back down to white sand beaches.",
      durationDays: 10, durationNights: 9,
      highlights: ["Galle Fort", "Mirissa whale watching", "Nine Arches Bridge Ella", "Tangalle", "Rekawa turtles", "Sinharaja buffer zone"],
      regions: ["South Coast", "Hill Country", "Galle"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"],
      bestMonths: [11, 12, 1, 2, 3, 4],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotels", "Meals", "Boat fees", "Entry fees"],
      minLeadTimeDays: 5, maxExtraDays: 4, sortOrder: 2,
    },
    {
      slug: "south-coast-beaches-14d",
      groupSlug: "south-coast-beaches", groupId: "south-coast-beaches",
      name: "South Coast Beaches", tagline: "Two weeks of coastal paradise.",
      description: "The ultimate two-week beach odyssey — starting at Negombo, swooping through Galle, across the south coast, up to Ella, then surfing at Arugam Bay on the east coast.",
      durationDays: 14, durationNights: 13,
      highlights: ["Galle Fort", "Mirissa whale watching", "Ella Nine Arches", "Arugam Bay surfing", "Yala safari"],
      regions: ["South Coast", "East Coast", "Hill Country"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"],
      bestMonths: [4, 5, 6, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotels", "Meals", "Boat fees", "Entry fees"],
      minLeadTimeDays: 7, maxExtraDays: 4, sortOrder: 2,
    },

    // ── WILDLIFE SAFARI ─────────────────────────────────────────────────────
    {
      slug: "wildlife-safari-5d",
      groupSlug: "wildlife-safari", groupId: "wildlife-safari",
      name: "Wildlife & Safari", tagline: "Encounter leopards, elephants and rare birds.",
      description: "Five days at Sri Lanka's finest national parks — track leopards in Yala, witness the elephant gathering at Minneriya, and spot endemic birds.",
      durationDays: 5, durationNights: 4,
      highlights: ["Yala leopard safari", "Minneriya elephant gathering", "Sinharaja rainforest", "Bundala flamingos"],
      regions: ["South Coast", "Cultural Triangle"],
      difficulty: "Moderate",
      heroImages: ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80"],
      bestMonths: [6, 7, 8, 9, 10],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Safari jeep fees", "Park entrance fees", "Hotels", "Meals"],
      minLeadTimeDays: 7, maxExtraDays: 2, sortOrder: 3,
    },
    {
      slug: "wildlife-safari",
      groupSlug: "wildlife-safari", groupId: "wildlife-safari",
      name: "Wildlife & Safari", tagline: "The classic Sri Lanka safari circuit.",
      description: "Seven days encompassing Sri Lanka's safari circuit — Minneriya, Sigiriya, Yala, and the Sinharaja rainforest for endemic birdlife.",
      durationDays: 7, durationNights: 6,
      highlights: ["Yala leopard safari", "Minneriya elephant gathering", "Sigiriya Rock Fortress", "Sinharaja forest birds", "Bundala flamingos"],
      regions: ["South Coast", "Cultural Triangle", "Hill Country"],
      difficulty: "Moderate",
      heroImages: ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80"],
      bestMonths: [6, 7, 8, 9, 10],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Safari jeep fees", "Park entrance fees", "Hotels", "Meals"],
      minLeadTimeDays: 7, maxExtraDays: 2, sortOrder: 3,
    },
    {
      slug: "wildlife-safari-10d",
      groupSlug: "wildlife-safari", groupId: "wildlife-safari",
      name: "Wildlife & Safari", tagline: "Ten days deep in Sri Lanka's wild places.",
      description: "An immersive 10-day wildlife journey — from the elephant gathering at Minneriya to leopards in Yala, hippos in Udawalawe, and birds in Sinharaja.",
      durationDays: 10, durationNights: 9,
      highlights: ["Yala leopard safari", "Udawalawe elephants", "Minneriya gathering", "Sinharaja rainforest", "Bundala wetlands", "Sigiriya"],
      regions: ["South Coast", "Cultural Triangle", "Hill Country"],
      difficulty: "Moderate",
      heroImages: ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80"],
      bestMonths: [6, 7, 8, 9, 10],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Safari jeep fees", "Park entrance fees", "Hotels", "Meals"],
      minLeadTimeDays: 7, maxExtraDays: 3, sortOrder: 3,
    },
    {
      slug: "wildlife-safari-14d",
      groupSlug: "wildlife-safari", groupId: "wildlife-safari",
      name: "Wildlife & Safari", tagline: "The complete Sri Lanka wildlife odyssey.",
      description: "Fourteen days covering every major wildlife sanctuary on the island — plus a river boat safari, birdwatching at Kumana, and the chance to spot blue whales off Mirissa.",
      durationDays: 14, durationNights: 13,
      highlights: ["Yala leopard safari", "Minneriya elephant gathering", "Udawalawe", "Sinharaja birds", "Kumana national park", "Mirissa whale watching"],
      regions: ["South Coast", "East Coast", "Cultural Triangle"],
      difficulty: "Moderate",
      heroImages: ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80"],
      bestMonths: [6, 7, 8, 9, 10],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Safari jeep fees", "Park entrance fees", "Hotels", "Meals"],
      minLeadTimeDays: 10, maxExtraDays: 3, sortOrder: 3,
    },

    // ── HILL COUNTRY EXPLORER ───────────────────────────────────────────────
    {
      slug: "hill-country-explorer-5d",
      groupSlug: "hill-country-explorer", groupId: "hill-country-explorer",
      name: "Hill Country Explorer", tagline: "Tea, trains and breathtaking scenery.",
      description: "Five days in the misty highlands — Kandy's cultural gems, emerald tea estates above Nuwara Eliya, and the iconic Nine Arches Bridge in Ella.",
      durationDays: 5, durationNights: 4,
      highlights: ["Temple of the Tooth Kandy", "Pedro Tea Estate", "Nine Arches Bridge", "Ravana Falls"],
      regions: ["Kandy", "Hill Country"],
      difficulty: "Moderate",
      heroImages: ["https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800&q=80"],
      bestMonths: [1, 2, 3, 4, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotel accommodation", "Meals", "Train tickets", "Entrance fees"],
      minLeadTimeDays: 5, maxExtraDays: 2, sortOrder: 4,
    },
    {
      slug: "hill-country-escape",
      groupSlug: "hill-country-explorer", groupId: "hill-country-explorer",
      name: "Hill Country Explorer", tagline: "Tea, trains and breathtaking scenery.",
      description: "Journey deep into Sri Lanka's verdant highlands on this 7-day escape. Wind through emerald tea plantations, ride the legendary train from Ella to Kandy, and discover colonial-era towns nestled in misty mountains.",
      durationDays: 7, durationNights: 6,
      highlights: ["Nuwara Eliya tea country", "Nine Arches Bridge", "Adam's Peak sunrise", "Gregory Lake", "Lipton's Seat"],
      regions: ["Hill Country", "Kandy"],
      difficulty: "Moderate",
      heroImages: ["https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800&q=80"],
      bestMonths: [1, 2, 3, 4, 11, 12],
      whatsIncluded: ["Private vehicle & driver for 7 days", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotel accommodation", "Meals for travellers", "Train tickets", "Entrance fees"],
      minLeadTimeDays: 5, maxExtraDays: 2, sortOrder: 4,
    },
    {
      slug: "hill-country-explorer-10d",
      groupSlug: "hill-country-explorer", groupId: "hill-country-explorer",
      name: "Hill Country Explorer", tagline: "The complete highland experience.",
      description: "Ten days losing yourself in the highlands — Kandy, Pinnawala elephants, tea estates, Horton Plains, Ella, and a sunrise climb of Adam's Peak.",
      durationDays: 10, durationNights: 9,
      highlights: ["Pinnawala Elephant Orphanage", "Kandy Temple of the Tooth", "Horton Plains World's End", "Nine Arches Bridge", "Adam's Peak sunrise", "Lipton's Seat"],
      regions: ["Kandy", "Hill Country"],
      difficulty: "Moderate",
      heroImages: ["https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800&q=80"],
      bestMonths: [1, 2, 3, 4, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotel accommodation", "Meals", "Train tickets", "Entrance fees"],
      minLeadTimeDays: 5, maxExtraDays: 3, sortOrder: 4,
    },
    {
      slug: "hill-country-explorer-14d",
      groupSlug: "hill-country-explorer", groupId: "hill-country-explorer",
      name: "Hill Country Explorer", tagline: "Two weeks in the misty mountains.",
      description: "The definitive highland journey — two weeks covering Kandy, every major tea estate, scenic waterfalls, Horton Plains, Ella, Adam's Peak, and a final beach day on the south coast.",
      durationDays: 14, durationNights: 13,
      highlights: ["Kandy Temple of the Tooth", "Horton Plains", "Nine Arches Bridge", "Adam's Peak sunrise", "Lipton's Seat", "Kitulgala white water"],
      regions: ["Kandy", "Hill Country", "South Coast"],
      difficulty: "Moderate",
      heroImages: ["https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800&q=80"],
      bestMonths: [1, 2, 3, 4, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotel accommodation", "Meals", "Train tickets", "Entrance fees"],
      minLeadTimeDays: 7, maxExtraDays: 3, sortOrder: 4,
    },

    // ── CULTURAL TRIANGLE ───────────────────────────────────────────────────
    {
      slug: "cultural-triangle-5d",
      groupSlug: "cultural-triangle", groupId: "cultural-triangle",
      name: "Cultural Triangle", tagline: "Ancient kingdoms and sacred temples.",
      description: "Five days through Sri Lanka's UNESCO-listed ancient cities — Anuradhapura, the Dambulla cave temples, and the iconic Sigiriya rock fortress.",
      durationDays: 5, durationNights: 4,
      highlights: ["Sigiriya Rock Fortress", "Dambulla Cave Temple", "Anuradhapura ruins", "Polonnaruwa ancient city"],
      regions: ["Cultural Triangle"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80"],
      bestMonths: [1, 2, 3, 4, 5, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotel accommodation", "Meals", "Entrance fees", "Travel insurance"],
      minLeadTimeDays: 3, maxExtraDays: 2, sortOrder: 5,
    },
    {
      slug: "cultural-triangle-7d",
      groupSlug: "cultural-triangle", groupId: "cultural-triangle",
      name: "Cultural Triangle", tagline: "Ancient kingdoms and sacred temples.",
      description: "Seven days immersed in ancient Sri Lanka — from the sacred Bo Tree in Anuradhapura to the frescoed caves of Dambulla, the fortress at Sigiriya, and the royal city of Polonnaruwa.",
      durationDays: 7, durationNights: 6,
      highlights: ["Sigiriya Rock Fortress", "Dambulla Cave Temple", "Anuradhapura", "Polonnaruwa", "Kandy Temple of the Tooth"],
      regions: ["Cultural Triangle", "Kandy"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80"],
      bestMonths: [1, 2, 3, 4, 5, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotel accommodation", "Meals", "Entrance fees", "Travel insurance"],
      minLeadTimeDays: 3, maxExtraDays: 2, sortOrder: 5,
    },
    {
      slug: "cultural-triangle-10d",
      groupSlug: "cultural-triangle", groupId: "cultural-triangle",
      name: "Cultural Triangle", tagline: "An epic journey through ancient Lanka.",
      description: "Ten days tracing Sri Lanka's rich 2,500-year history — ancient capitals, rock fortresses, cave temples, sacred teeth relics, and colonial Dutch forts.",
      durationDays: 10, durationNights: 9,
      highlights: ["Sigiriya", "Dambulla", "Anuradhapura", "Polonnaruwa", "Kandy", "Galle Fort", "Mihintale"],
      regions: ["Cultural Triangle", "Kandy", "South Coast"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80"],
      bestMonths: [1, 2, 3, 4, 5, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotel accommodation", "Meals", "Entrance fees", "Travel insurance"],
      minLeadTimeDays: 5, maxExtraDays: 3, sortOrder: 5,
    },
    {
      slug: "cultural-triangle-14d",
      groupSlug: "cultural-triangle", groupId: "cultural-triangle",
      name: "Cultural Triangle", tagline: "The complete ancient heritage tour.",
      description: "Two weeks encompassing every significant historical site in Sri Lanka, from Jaffna in the north to the Portuguese-era fortresses of the south.",
      durationDays: 14, durationNights: 13,
      highlights: ["Sigiriya", "Dambulla", "Anuradhapura", "Polonnaruwa", "Kandy", "Jaffna", "Galle Fort", "Mihintale"],
      regions: ["Cultural Triangle", "Jaffna", "Kandy", "South Coast"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80"],
      bestMonths: [1, 2, 3, 4, 5, 11, 12],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotel accommodation", "Meals", "Entrance fees", "Travel insurance"],
      minLeadTimeDays: 7, maxExtraDays: 4, sortOrder: 5,
    },

    // ── EAST COAST ESCAPE ───────────────────────────────────────────────────
    {
      slug: "east-coast-escape-5d",
      groupSlug: "east-coast-escape", groupId: "east-coast-escape",
      name: "East Coast Escape", tagline: "Untouched beaches and turquoise lagoons.",
      description: "Five days on Sri Lanka's sun-drenched east coast — Trincomalee's natural harbour, Nilaveli's crystal-clear waters, and the marine sanctuary at Pigeon Island.",
      durationDays: 5, durationNights: 4,
      highlights: ["Trincomalee Fort Frederick", "Nilaveli Beach", "Pigeon Island snorkelling", "Marble Beach"],
      regions: ["East Coast"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80"],
      bestMonths: [4, 5, 6, 7, 8, 9],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotels", "Meals", "Snorkelling gear", "Boat fees", "Entry fees"],
      minLeadTimeDays: 5, maxExtraDays: 2, sortOrder: 6,
    },
    {
      slug: "east-coast-escape-7d",
      groupSlug: "east-coast-escape", groupId: "east-coast-escape",
      name: "East Coast Escape", tagline: "Untouched beaches and turquoise lagoons.",
      description: "Seven days exploring the full east coast — from Trincomalee's harbour and beaches north of town down to the world-famous surf breaks at Arugam Bay.",
      durationDays: 7, durationNights: 6,
      highlights: ["Trincomalee", "Nilaveli Beach", "Pigeon Island", "Passikudah Bay", "Arugam Bay surfing"],
      regions: ["East Coast"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80"],
      bestMonths: [4, 5, 6, 7, 8, 9],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotels", "Meals", "Snorkelling gear", "Boat fees", "Entry fees"],
      minLeadTimeDays: 5, maxExtraDays: 3, sortOrder: 6,
    },
    {
      slug: "east-coast-escape-10d",
      groupSlug: "east-coast-escape", groupId: "east-coast-escape",
      name: "East Coast Escape", tagline: "The full east coast experience.",
      description: "Ten days on the quieter, wilder side of the island — ancient ruins at Polonnaruwa, whale watching at Trincomalee, reef snorkelling, surfing at Arugam Bay, and the birds of Kumana.",
      durationDays: 10, durationNights: 9,
      highlights: ["Trincomalee", "Nilaveli", "Passikudah", "Arugam Bay surfing", "Kumana national park", "Polonnaruwa"],
      regions: ["East Coast", "Cultural Triangle"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80"],
      bestMonths: [4, 5, 6, 7, 8, 9],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotels", "Meals", "Snorkelling gear", "Boat fees", "Entry fees"],
      minLeadTimeDays: 5, maxExtraDays: 3, sortOrder: 6,
    },
    {
      slug: "east-coast-escape-14d",
      groupSlug: "east-coast-escape", groupId: "east-coast-escape",
      name: "East Coast Escape", tagline: "Two weeks on the untouched east coast.",
      description: "The ultimate east coast adventure — 14 days weaving between ancient temples, pristine bays, surf breaks, and untouched wildlife sanctuaries far from the tourist trail.",
      durationDays: 14, durationNights: 13,
      highlights: ["Trincomalee", "Nilaveli", "Passikudah", "Batticaloa lagoon", "Arugam Bay surfing", "Kumana national park", "Polonnaruwa"],
      regions: ["East Coast", "Cultural Triangle"],
      difficulty: "Easy",
      heroImages: ["https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80"],
      bestMonths: [4, 5, 6, 7, 8, 9],
      whatsIncluded: ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals"],
      whatsNotIncluded: ["Hotels", "Meals", "Snorkelling gear", "Boat fees", "Entry fees"],
      minLeadTimeDays: 7, maxExtraDays: 4, sortOrder: 6,
    },
  ];

  // All safari-group slugs use slightly higher rates; everything else uses standard rates.
  const _safariSlugs = new Set(["wildlife-safari-5d", "wildlife-safari", "wildlife-safari-10d", "wildlife-safari-14d"]);
  const _getRates = (slug: string) => _safariSlugs.has(slug) ? _safariRates : _sharedRates;

  // Itinerary data keyed by tour slug.
  // Shorter variants share the same core locations; longer ones extend the route.
  type ItinDay = { dayNumber: number; title: string; location: string; lat: number; lng: number; description: string; drivingTime: string; keyStops: string[] };
  const itineraryBySlug: Record<string, ItinDay[]> = {
    // ── Classic Sri Lanka ──────────────────────────────────────────────────
    "classic-sri-lanka-5d": [
      { dayNumber: 1, title: "Airport to Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Your driver meets you at Bandaranaike International Airport and transfers you to your beachside hotel in Negombo. Relax after your flight.", drivingTime: "30 minutes", keyStops: ["Bandaranaike Airport", "Negombo Beach"] },
      { dayNumber: 2, title: "Negombo to Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Head northeast to the Cultural Triangle. Climb the iconic Sigiriya Lion Rock fortress — a 5th-century palace perched atop a 200-metre column.", drivingTime: "3.5 hours", keyStops: ["Dambulla Cave Temple", "Sigiriya Rock Fortress"] },
      { dayNumber: 3, title: "Sigiriya to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Wind south through the lush countryside to Kandy, Sri Lanka's cultural capital. Visit the sacred Temple of the Tooth Relic.", drivingTime: "3 hours", keyStops: ["Temple of the Tooth", "Kandy Lake", "Royal Botanical Gardens Peradeniya"] },
      { dayNumber: 4, title: "Kandy to Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Drive south to Galle, pausing at a turtle hatchery on the coast. Explore the UNESCO-listed Dutch fort at leisure.", drivingTime: "3.5 hours", keyStops: ["Kosgoda Turtle Hatchery", "Galle Fort", "Dutch Reformed Church"] },
      { dayNumber: 5, title: "Galle to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning at leisure on the coast before your driver transfers you back to Colombo for your departure flight.", drivingTime: "2 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],
    "classic-sri-lanka-7d": [
      { dayNumber: 1, title: "Airport to Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Your driver meets you at Bandaranaike International Airport and transfers you to your beachside hotel in Negombo.", drivingTime: "30 minutes", keyStops: ["Bandaranaike Airport", "Negombo Beach"] },
      { dayNumber: 2, title: "Negombo to Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Journey north to the ancient capital of Anuradhapura, one of the world's oldest continuously inhabited cities.", drivingTime: "4 hours", keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba", "Jetavanaramaya"] },
      { dayNumber: 3, title: "Anuradhapura to Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb the iconic Lion Rock fortress. Stop at the Dambulla Cave Temple with its 153 Buddha statues.", drivingTime: "2 hours", keyStops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
      { dayNumber: 4, title: "Sigiriya to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Wind south to Kandy, Sri Lanka's cultural capital. Visit the Temple of the Tooth Relic.", drivingTime: "3 hours", keyStops: ["Temple of the Tooth", "Kandy Lake"] },
      { dayNumber: 5, title: "Kandy to Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Drive into the misty highlands past emerald tea estates. Visit a working tea factory and taste fresh Ceylon tea.", drivingTime: "2.5 hours", keyStops: ["Pedro Tea Estate", "Gregory Lake"] },
      { dayNumber: 6, title: "Nuwara Eliya to Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Scenic mountain drive to Ella. Stop at Ravana Falls and the iconic Nine Arches Bridge.", drivingTime: "2 hours", keyStops: ["Nine Arches Bridge", "Ravana Falls", "Little Adam's Peak"] },
      { dayNumber: 7, title: "Ella to Galle to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Descend to the coast, passing through Galle Fort before heading back to Colombo Airport.", drivingTime: "4.5 hours", keyStops: ["Galle Fort", "Bandaranaike Airport"] },
    ],
    "classic-sri-lanka": [
      { dayNumber: 1, title: "Airport to Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Your driver meets you at Bandaranaike Airport and transfers you to your beachside hotel in Negombo.", drivingTime: "30 minutes", keyStops: ["Bandaranaike Airport", "Negombo Beach"] },
      { dayNumber: 2, title: "Negombo to Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Journey north to the ancient capital of Anuradhapura, a UNESCO World Heritage Site.", drivingTime: "4 hours", keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba"] },
      { dayNumber: 3, title: "Anuradhapura to Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb the iconic Lion Rock fortress, a 5th-century palace perched atop a 200-metre rock column.", drivingTime: "2 hours", keyStops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
      { dayNumber: 4, title: "Sigiriya to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Wind through the lush countryside to Kandy, Sri Lanka's cultural capital.", drivingTime: "3 hours", keyStops: ["Temple of the Tooth", "Kandy Lake"] },
      { dayNumber: 5, title: "Kandy to Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Drive into the misty highlands past emerald tea plantations. Visit a working tea factory.", drivingTime: "2.5 hours", keyStops: ["Tea Factory", "Gregory Lake"] },
      { dayNumber: 6, title: "Nuwara Eliya to Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "One of the most scenic drives in Sri Lanka. Stop at the famous Nine Arches Bridge.", drivingTime: "2 hours", keyStops: ["Nine Arches Bridge", "Ravana Falls"] },
      { dayNumber: 7, title: "Ella to Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Descend from the highlands to Yala, home to the highest density of leopards in the world.", drivingTime: "3 hours", keyStops: ["Yala National Park Safari"] },
      { dayNumber: 8, title: "Yala to Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Continue along the south coast to the gorgeous beach town of Mirissa.", drivingTime: "1.5 hours", keyStops: ["Mirissa Beach", "Stilt Fishermen"] },
      { dayNumber: 9, title: "Mirissa to Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Visit the UNESCO-listed Dutch fort of Galle, filled with colonial architecture and boutique shops.", drivingTime: "45 minutes", keyStops: ["Galle Fort", "Dutch Reformed Church", "Lighthouse"] },
      { dayNumber: 10, title: "Galle to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Final drive back to Colombo for your departure flight.", drivingTime: "2 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],
    "classic-sri-lanka-14d": [
      { dayNumber: 1, title: "Airport to Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Arrive at Bandaranaike Airport. Your driver transfers you to Negombo for a first night by the beach.", drivingTime: "30 minutes", keyStops: ["Bandaranaike Airport", "Negombo Beach"] },
      { dayNumber: 2, title: "Negombo to Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Drive north to the ancient sacred city of Anuradhapura — sacred Bo Tree, colossal dagobas, moonstone carvings.", drivingTime: "4 hours", keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba", "Mihintale"] },
      { dayNumber: 3, title: "Anuradhapura to Polonnaruwa", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Drive east to the medieval capital Polonnaruwa — the Gal Vihara's colossal Buddha statues are unmissable.", drivingTime: "2 hours", keyStops: ["Gal Vihara", "Vatadage", "Parakrama Samudraya"] },
      { dayNumber: 4, title: "Polonnaruwa to Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb the iconic Lion Rock fortress and visit the frescoed caves at Dambulla.", drivingTime: "1.5 hours", keyStops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
      { dayNumber: 5, title: "Sigiriya to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Wind south to Kandy — Temple of the Tooth, Peradeniya Botanical Gardens, cultural show.", drivingTime: "3 hours", keyStops: ["Temple of the Tooth", "Kandy Lake", "Peradeniya Gardens"] },
      { dayNumber: 6, title: "Kandy to Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, description: "Drive up into the tea highlands. Visit a working factory and taste freshly rolled Ceylon tea.", drivingTime: "2.5 hours", keyStops: ["Pedro Tea Estate", "Gregory Lake"] },
      { dayNumber: 7, title: "Nuwara Eliya to Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Scenic drive through tea country. Nine Arches Bridge, Ravana Falls, Little Adam's Peak hike.", drivingTime: "2 hours", keyStops: ["Nine Arches Bridge", "Ravana Falls", "Little Adam's Peak"] },
      { dayNumber: 8, title: "Ella to Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Descend to Yala, the world's highest density of leopards. Evening game drive.", drivingTime: "3 hours", keyStops: ["Yala Block 1 Evening Safari"] },
      { dayNumber: 9, title: "Yala — Full Day Safari", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Full day on safari — leopards, elephants, crocodiles, sloth bears, and hundreds of bird species.", drivingTime: "Safari jeep all day", keyStops: ["Yala Block 1", "Palatupana Lagoon"] },
      { dayNumber: 10, title: "Yala to Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Early morning drive to the idyllic beach at Mirissa. Afternoon whale-watching (seasonal).", drivingTime: "1.5 hours", keyStops: ["Mirissa Beach", "Whale Watching Boat", "Stilt Fishermen at Weligama"] },
      { dayNumber: 11, title: "Mirissa to Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Explore the UNESCO-listed Galle Dutch Fort — ramparts, lighthouse, boutique shops and cafés.", drivingTime: "45 minutes", keyStops: ["Galle Fort Ramparts", "Dutch Reformed Church", "Lighthouse"] },
      { dayNumber: 12, title: "Galle to Unawatuna to Tangalle", location: "Tangalle", lat: 6.025, lng: 80.7994, description: "Drive east along the coast through the fishing town of Tangalle. Afternoon at the beach.", drivingTime: "1.5 hours", keyStops: ["Unawatuna Beach", "Tangalle Beach", "Rekawa Turtle Lagoon"] },
      { dayNumber: 13, title: "Tangalle to Udawalawe", location: "Udawalawe", lat: 6.4401, lng: 80.8997, description: "Morning game drive at Udawalawe National Park — famous for its large resident elephant herds.", drivingTime: "1.5 hours", keyStops: ["Udawalawe Elephant Safari", "Elephant Transit Home"] },
      { dayNumber: 14, title: "Udawalawe to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Final morning at leisure, then your driver transfers you to Colombo for your departure flight.", drivingTime: "3 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],

    // ── South Coast Beaches ────────────────────────────────────────────────
    "south-coast-beaches-5d": [
      { dayNumber: 1, title: "Airport to Galle", location: "Galle", lat: 6.0535, lng: 80.217, description: "Head south from the airport along the coast road to Galle, stopping at a turtle hatchery along the way.", drivingTime: "2 hours", keyStops: ["Kosgoda Turtle Hatchery", "Galle Fort"] },
      { dayNumber: 2, title: "Galle Fort Day", location: "Galle", lat: 6.0535, lng: 80.217, description: "Full day exploring Galle Fort — a UNESCO World Heritage Site packed with Dutch colonial architecture, cafés, and boutiques.", drivingTime: "Local walks", keyStops: ["Galle Fort Ramparts", "Dutch Reformed Church", "Lighthouse"] },
      { dayNumber: 3, title: "Galle to Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Short drive east to Mirissa. Afternoon on the beach, evening at the beachfront restaurants.", drivingTime: "45 minutes", keyStops: ["Mirissa Beach", "Parrot Rock", "Unawatuna Beach"] },
      { dayNumber: 4, title: "Mirissa — Whale Watching", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Morning whale-watching boat trip (blue whales and sperm whales common Dec–Apr), afternoon at leisure.", drivingTime: "Boat trip", keyStops: ["Whale Watching Boat", "Stilt Fishermen at Weligama"] },
      { dayNumber: 5, title: "Mirissa to Tangalle to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Drive east along the coast through Tangalle before heading back to Colombo for your departure.", drivingTime: "3.5 hours", keyStops: ["Tangalle Beach", "Hummanaya Blowhole", "Bandaranaike Airport"] },
    ],
    "south-coast-beaches-7d": [
      { dayNumber: 1, title: "Airport to Galle", location: "Galle", lat: 6.0535, lng: 80.217, description: "Arrive at Bandaranaike Airport and drive south to Galle, stopping at the Kosgoda turtle hatchery.", drivingTime: "2 hours", keyStops: ["Kosgoda Turtle Hatchery", "Galle Fort"] },
      { dayNumber: 2, title: "Galle Fort Day", location: "Galle", lat: 6.0535, lng: 80.217, description: "Explore Galle Fort's ramparts, Dutch Reformed Church, and colonial-era boutiques.", drivingTime: "Local walks", keyStops: ["Galle Fort Ramparts", "Dutch Reformed Church", "Lighthouse"] },
      { dayNumber: 3, title: "Galle to Unawatuna & Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Morning at Unawatuna's turquoise bay, afternoon drive to Mirissa for sunset on the beach.", drivingTime: "1 hour", keyStops: ["Unawatuna Beach", "Mirissa Beach", "Parrot Rock"] },
      { dayNumber: 4, title: "Mirissa — Whale Watching", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Early morning whale-watching boat trip, afternoon at leisure or visit the stilt fishermen at Weligama.", drivingTime: "Boat trip", keyStops: ["Whale Watching Boat", "Weligama Stilt Fishermen"] },
      { dayNumber: 5, title: "Mirissa to Tangalle", location: "Tangalle", lat: 6.025, lng: 80.7994, description: "Drive east to the quieter, wilder beaches around Tangalle. Afternoon swimming in the lagoon.", drivingTime: "1 hour", keyStops: ["Tangalle Beach", "Rekawa Turtle Lagoon"] },
      { dayNumber: 6, title: "Tangalle — Rekawa & Hummanaya", location: "Tangalle", lat: 6.025, lng: 80.7994, description: "Morning visit to Rekawa turtle sanctuary (five species nest here). Afternoon at Hummanaya Blowhole.", drivingTime: "Local drives", keyStops: ["Rekawa Turtle Sanctuary", "Hummanaya Blowhole", "Mulkirigala Rock Temple"] },
      { dayNumber: 7, title: "Tangalle to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning at leisure before your driver takes you back to Colombo for your departure flight.", drivingTime: "3.5 hours", keyStops: ["Bundala National Park (en route)", "Bandaranaike Airport"] },
    ],
    "south-coast-beaches-10d": [
      { dayNumber: 1, title: "Airport to Galle", location: "Galle", lat: 6.0535, lng: 80.217, description: "Arrive at Bandaranaike Airport and drive south to Galle via the coastal turtle hatchery.", drivingTime: "2 hours", keyStops: ["Kosgoda Turtle Hatchery", "Galle Fort"] },
      { dayNumber: 2, title: "Galle Fort", location: "Galle", lat: 6.0535, lng: 80.217, description: "Full day in Galle Fort — ramparts walk, Dutch church, local boutiques and excellent cafés.", drivingTime: "Local walks", keyStops: ["Galle Fort Ramparts", "Dutch Reformed Church", "Lighthouse"] },
      { dayNumber: 3, title: "Galle to Mirissa via Unawatuna", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Morning snorkelling at Unawatuna, afternoon relaxing at Mirissa Beach.", drivingTime: "1 hour", keyStops: ["Unawatuna Coral Reef", "Mirissa Beach"] },
      { dayNumber: 4, title: "Mirissa Whale Watching", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Early morning whale watching (blue whales, sperm whales, spinner dolphins). Afternoon at leisure.", drivingTime: "Boat trip", keyStops: ["Whale Watching Boat", "Weligama Stilt Fishermen"] },
      { dayNumber: 5, title: "Mirissa to Tangalle", location: "Tangalle", lat: 6.025, lng: 80.7994, description: "Drive east to Tangalle's quieter beaches and the turtle sanctuary at Rekawa lagoon.", drivingTime: "1 hour", keyStops: ["Tangalle Beach", "Rekawa Turtle Lagoon"] },
      { dayNumber: 6, title: "Tangalle to Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Dramatic drive up from the coast into the hill country. Arrive in Ella, the backpackers' paradise.", drivingTime: "2.5 hours", keyStops: ["Ravana Falls", "Ella Rock viewpoint"] },
      { dayNumber: 7, title: "Ella — Nine Arches & Little Adam's Peak", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Morning hike to the iconic Nine Arches Bridge, afternoon walk up Little Adam's Peak.", drivingTime: "Local walks", keyStops: ["Nine Arches Bridge", "Little Adam's Peak", "Ella town"] },
      { dayNumber: 8, title: "Ella to Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Descend from the highlands to Yala for an evening game drive — leopards, elephants, crocodiles.", drivingTime: "3 hours", keyStops: ["Yala Block 1 Evening Safari"] },
      { dayNumber: 9, title: "Yala — Full Day Safari", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Full day on safari in Yala National Park.", drivingTime: "Safari jeep all day", keyStops: ["Yala Block 1", "Palatupana Lagoon"] },
      { dayNumber: 10, title: "Yala to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Early morning final game drive, then transfer to Colombo Airport for departure.", drivingTime: "4 hours", keyStops: ["Morning Safari", "Bandaranaike Airport"] },
    ],
    "south-coast-beaches-14d": [
      { dayNumber: 1, title: "Airport to Negombo", location: "Negombo", lat: 7.2096, lng: 79.8378, description: "Arrive and relax at Negombo beach hotel after your flight.", drivingTime: "30 minutes", keyStops: ["Bandaranaike Airport", "Negombo Beach"] },
      { dayNumber: 2, title: "Negombo to Galle", location: "Galle", lat: 6.0535, lng: 80.217, description: "Long coastal drive south. Stop at Kosgoda turtle hatchery before arriving at Galle Fort.", drivingTime: "3 hours", keyStops: ["Kosgoda Turtle Hatchery", "Galle Fort"] },
      { dayNumber: 3, title: "Galle Fort Day", location: "Galle", lat: 6.0535, lng: 80.217, description: "Full day inside Galle Fort — history, architecture, boutique shopping, and the best coffee on the south coast.", drivingTime: "Local walks", keyStops: ["Galle Fort Ramparts", "Dutch Reformed Church", "Lighthouse"] },
      { dayNumber: 4, title: "Galle to Mirissa via Unawatuna", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Morning snorkelling at Unawatuna coral reef. Afternoon at Mirissa.", drivingTime: "1 hour", keyStops: ["Unawatuna Coral Reef", "Mirissa Beach", "Parrot Rock"] },
      { dayNumber: 5, title: "Mirissa — Whale Watching", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Dawn whale-watching trip, afternoon relaxing.", drivingTime: "Boat trip", keyStops: ["Whale Watching Boat", "Weligama Stilt Fishermen"] },
      { dayNumber: 6, title: "Mirissa to Tangalle", location: "Tangalle", lat: 6.025, lng: 80.7994, description: "Drive east to the wild beaches around Tangalle. Rekawa turtle lagoon by night.", drivingTime: "1 hour", keyStops: ["Tangalle Beach", "Rekawa Turtle Lagoon"] },
      { dayNumber: 7, title: "Tangalle to Ella", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Dramatic drive up from the coast. Arrive Ella in time for sunset at the viewpoint.", drivingTime: "2.5 hours", keyStops: ["Ravana Falls", "Ella Rock"] },
      { dayNumber: 8, title: "Ella — Nine Arches & Hikes", location: "Ella", lat: 6.8667, lng: 81.0467, description: "Nine Arches Bridge and Little Adam's Peak morning hike. Afternoon at leisure.", drivingTime: "Local walks", keyStops: ["Nine Arches Bridge", "Little Adam's Peak"] },
      { dayNumber: 9, title: "Ella to Yala", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Drive to Yala for an evening leopard-spotting game drive.", drivingTime: "3 hours", keyStops: ["Yala Block 1 Evening Safari"] },
      { dayNumber: 10, title: "Yala Full Day Safari", location: "Yala", lat: 6.3529, lng: 81.5236, description: "Full day on safari — leopards, elephants, crocodiles, sloth bears.", drivingTime: "Safari jeep all day", keyStops: ["Yala Block 1", "Palatupana Lagoon"] },
      { dayNumber: 11, title: "Yala to Arugam Bay", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Long scenic drive up the coast to Arugam Bay, one of the world's top surfing destinations.", drivingTime: "3 hours", keyStops: ["Kumana National Park viewpoint", "Arugam Bay main point"] },
      { dayNumber: 12, title: "Arugam Bay — Surf & Lagoon", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Morning surf lesson on the main break. Afternoon boat trip on Pottuvil lagoon — elephants and birds.", drivingTime: "Local", keyStops: ["Arugam Bay Main Point", "Pottuvil Lagoon boat trip"] },
      { dayNumber: 13, title: "Arugam Bay to Passikudah", location: "Passikudah", lat: 7.929, lng: 81.5597, description: "Drive north to Passikudah Bay, with its famously shallow turquoise lagoon perfect for swimming.", drivingTime: "2 hours", keyStops: ["Passikudah Bay", "Kalkudah Beach"] },
      { dayNumber: 14, title: "Passikudah to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Long final transfer west to Colombo for your departure flight.", drivingTime: "5 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],

    // ── Wildlife Safari ────────────────────────────────────────────────────
    "wildlife-safari-5d": [
      { dayNumber: 1, title: "Airport to Minneriya", location: "Sigiriya", lat: 7.9572, lng: 80.7597, description: "Drive north from the airport to the Cultural Triangle. Afternoon game drive at Minneriya to see the famous elephant gathering.", drivingTime: "3.5 hours", keyStops: ["Minneriya National Park", "Elephant Gathering"] },
      { dayNumber: 2, title: "Sigiriya & Dambulla", location: "Sigiriya", lat: 7.9572, lng: 80.7597, description: "Morning climb of Sigiriya Rock Fortress, then visit the Dambulla Cave Temple complex.", drivingTime: "Local drives", keyStops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
      { dayNumber: 3, title: "Sigiriya to Yala", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Long drive south to Yala, the world's best place to spot leopards. Evening game drive at dusk.", drivingTime: "5 hours", keyStops: ["Yala National Park Evening Safari"] },
      { dayNumber: 4, title: "Yala Full Day Safari", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Full day on safari in Yala — leopards, elephants, crocodiles, and hundreds of bird species.", drivingTime: "Safari jeep all day", keyStops: ["Yala Block 1", "Leopard spotting", "Elephants at the water hole"] },
      { dayNumber: 5, title: "Yala to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Early morning final game drive, then transfer back to Colombo for your departure flight.", drivingTime: "4 hours", keyStops: ["Morning Safari", "Bandaranaike Airport"] },
    ],
    "wildlife-safari": [
      { dayNumber: 1, title: "Airport to Minneriya", location: "Sigiriya", lat: 7.9572, lng: 80.7597, description: "Drive north to the Cultural Triangle for an afternoon game drive at Minneriya — the famous elephant gathering.", drivingTime: "3.5 hours", keyStops: ["Minneriya National Park", "Elephant Gathering"] },
      { dayNumber: 2, title: "Sigiriya — Rock Fortress & Dambulla", location: "Sigiriya", lat: 7.9572, lng: 80.7597, description: "Climb the iconic Sigiriya Rock Fortress and visit the painted cave temples at Dambulla.", drivingTime: "Local drives", keyStops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
      { dayNumber: 3, title: "Sigiriya to Sinharaja", location: "Sinharaja", lat: 6.3949, lng: 80.4756, description: "Drive deep into the Sinharaja Rainforest — a UNESCO Biosphere Reserve — for endemic birdwatching.", drivingTime: "5 hours", keyStops: ["Sinharaja Rainforest Trail", "Purple-faced Langur spotting"] },
      { dayNumber: 4, title: "Sinharaja to Yala", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Drive to Yala for an evening leopard-spotting game drive at dusk.", drivingTime: "3 hours", keyStops: ["Bundala National Park (en route)", "Yala Block 1 Evening Safari"] },
      { dayNumber: 5, title: "Yala Full Day Safari", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Full day on safari in Yala — leopards, elephants, crocodiles, and hundreds of bird species.", drivingTime: "Safari jeep all day", keyStops: ["Yala Block 1", "Palatupana Lagoon"] },
      { dayNumber: 6, title: "Yala to Udawalawe", location: "Udawalawe", lat: 6.4401, lng: 80.8997, description: "Morning in Yala, afternoon game drive at Udawalawe — famous for its large resident elephant herds.", drivingTime: "2 hours", keyStops: ["Udawalawe Elephant Safari", "Elephant Transit Home"] },
      { dayNumber: 7, title: "Udawalawe to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Dawn game drive, then transfer to Colombo for your departure flight.", drivingTime: "3 hours", keyStops: ["Dawn Safari", "Bandaranaike Airport"] },
    ],
    "wildlife-safari-10d": [
      { dayNumber: 1, title: "Airport to Wilpattu", location: "Wilpattu", lat: 8.454, lng: 80.0199, description: "Drive north-west to Wilpattu — Sri Lanka's oldest and largest national park, famous for leopards.", drivingTime: "3 hours", keyStops: ["Wilpattu National Park Evening Safari"] },
      { dayNumber: 2, title: "Wilpattu Full Day Safari", location: "Wilpattu", lat: 8.454, lng: 80.0199, description: "Full day safari at Wilpattu — leopards, sloth bears, elephants, crocodiles in villus (natural pools).", drivingTime: "Safari jeep all day", keyStops: ["Villu pools", "Leopard spotting", "Sloth bear territory"] },
      { dayNumber: 3, title: "Wilpattu to Minneriya", location: "Minneriya", lat: 8.0318, lng: 80.9024, description: "Drive across to Minneriya for the famous elephant gathering — hundreds of elephants at the reservoir.", drivingTime: "3.5 hours", keyStops: ["Minneriya National Park", "Elephant Gathering"] },
      { dayNumber: 4, title: "Sigiriya & Dambulla", location: "Sigiriya", lat: 7.9572, lng: 80.7597, description: "Climb Sigiriya Rock Fortress and explore the Dambulla Cave Temple.", drivingTime: "Local", keyStops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
      { dayNumber: 5, title: "Sigiriya to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive to Kandy, stopping at Pinnawala Elephant Orphanage.", drivingTime: "3 hours", keyStops: ["Pinnawala Elephant Orphanage", "Temple of the Tooth"] },
      { dayNumber: 6, title: "Kandy to Sinharaja", location: "Sinharaja", lat: 6.3949, lng: 80.4756, description: "Drive to the Sinharaja UNESCO Rainforest Reserve for endemic birdwatching guided walks.", drivingTime: "4 hours", keyStops: ["Sinharaja Rainforest", "Bird watching trail"] },
      { dayNumber: 7, title: "Sinharaja to Yala", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Drive to Yala for an evening game drive.", drivingTime: "3 hours", keyStops: ["Bundala National Park", "Yala Block 1 Evening Safari"] },
      { dayNumber: 8, title: "Yala Full Day Safari", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Full day on safari in Yala Block 1 — Sri Lanka's best for leopards.", drivingTime: "Safari jeep all day", keyStops: ["Yala Block 1", "Palatupana Lagoon"] },
      { dayNumber: 9, title: "Yala to Udawalawe", location: "Udawalawe", lat: 6.4401, lng: 80.8997, description: "Morning final game drive in Yala, afternoon safari at Udawalawe elephant park.", drivingTime: "2 hours", keyStops: ["Udawalawe Elephant Safari", "Elephant Transit Home"] },
      { dayNumber: 10, title: "Udawalawe to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Dawn game drive, then transfer to Colombo Airport.", drivingTime: "3 hours", keyStops: ["Dawn Safari", "Bandaranaike Airport"] },
    ],
    "wildlife-safari-14d": [
      { dayNumber: 1, title: "Airport to Wilpattu", location: "Wilpattu", lat: 8.454, lng: 80.0199, description: "Arrive at Bandaranaike Airport and drive to Wilpattu National Park.", drivingTime: "3 hours", keyStops: ["Wilpattu National Park"] },
      { dayNumber: 2, title: "Wilpattu Safari", location: "Wilpattu", lat: 8.454, lng: 80.0199, description: "Full day safari at Wilpattu — leopards and sloth bears in natural villu pools.", drivingTime: "Safari jeep all day", keyStops: ["Villu pools", "Leopard territory", "Sloth bear spots"] },
      { dayNumber: 3, title: "Wilpattu to Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Morning at Wilpattu, afternoon at the ancient sacred city of Anuradhapura.", drivingTime: "1.5 hours", keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba"] },
      { dayNumber: 4, title: "Anuradhapura to Minneriya", location: "Minneriya", lat: 8.0318, lng: 80.9024, description: "Drive to Minneriya for the famous elephant gathering at the reservoir.", drivingTime: "2 hours", keyStops: ["Minneriya Elephant Gathering"] },
      { dayNumber: 5, title: "Sigiriya & Dambulla", location: "Sigiriya", lat: 7.9572, lng: 80.7597, description: "Climb Sigiriya Rock Fortress and explore the Dambulla Cave Temples.", drivingTime: "Local", keyStops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"] },
      { dayNumber: 6, title: "Sigiriya to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive south to Kandy, stopping at Pinnawala Elephant Orphanage.", drivingTime: "3 hours", keyStops: ["Pinnawala Elephant Orphanage", "Temple of the Tooth"] },
      { dayNumber: 7, title: "Kandy to Sinharaja", location: "Sinharaja", lat: 6.3949, lng: 80.4756, description: "Drive to the Sinharaja Rainforest UNESCO Biosphere Reserve.", drivingTime: "4 hours", keyStops: ["Sinharaja Rainforest", "Endemic bird trail"] },
      { dayNumber: 8, title: "Sinharaja Birdwatching", location: "Sinharaja", lat: 6.3949, lng: 80.4756, description: "Full day guided birdwatching with local expert. Sri Lanka's 6 endemic birds possible here.", drivingTime: "Forest walks", keyStops: ["Sinharaja core zone", "Blue Magpie trail"] },
      { dayNumber: 9, title: "Sinharaja to Yala", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Drive through Bundala wetlands to Yala. Afternoon game drive.", drivingTime: "3 hours", keyStops: ["Bundala National Park", "Yala Block 1 Evening Safari"] },
      { dayNumber: 10, title: "Yala Safari Day 1", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Full day on safari in Yala — leopards are the headline act.", drivingTime: "Safari jeep all day", keyStops: ["Yala Block 1", "Palatupana Lagoon"] },
      { dayNumber: 11, title: "Yala Safari Day 2", location: "Yala", lat: 6.3718, lng: 81.5256, description: "Second full day at Yala — more of the park explored.", drivingTime: "Safari jeep all day", keyStops: ["Yala Blocks 2 & 5", "Crocodile lagoon"] },
      { dayNumber: 12, title: "Yala to Udawalawe", location: "Udawalawe", lat: 6.4401, lng: 80.8997, description: "Drive to Udawalawe for elephant-focused afternoon safari.", drivingTime: "2 hours", keyStops: ["Udawalawe Elephant Safari", "Elephant Transit Home"] },
      { dayNumber: 13, title: "Udawalawe to Mirissa", location: "Mirissa", lat: 5.9474, lng: 80.459, description: "Drive to Mirissa for a final beach day and evening whale-watching (seasonal).", drivingTime: "2 hours", keyStops: ["Mirissa Beach", "Whale Watching Boat"] },
      { dayNumber: 14, title: "Mirissa to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Final morning at the beach, then transfer to Colombo Airport.", drivingTime: "2.5 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],

    // ── Hill Country Explorer ──────────────────────────────────────────────
    "hill-country-explorer-5d": [
      { dayNumber: 1, title: "Airport to Kandy", location: "Kandy", lat: 7.2906, lng: 80.635, description: "Your driver collects you at Bandaranaike Airport and winds up into the hills to Kandy, Sri Lanka's cultural capital.", drivingTime: "3.5 hours", keyStops: ["Pinnawala Elephant Orphanage", "Temple of the Tooth"] },
      { dayNumber: 2, title: "Kandy to Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7718, description: "Wind through emerald tea estates to Little England. Visit a working tea factory and taste freshly rolled Ceylon tea.", drivingTime: "2.5 hours", keyStops: ["Pedro Tea Estate", "Gregory Lake", "Nuwara Eliya Post Office"] },
      { dayNumber: 3, title: "Nuwara Eliya to Ella", location: "Ella", lat: 6.8667, lng: 81.047, description: "One of the most scenic mountain drives on the island. Stop at Ravana Falls and the iconic Nine Arches Bridge.", drivingTime: "2 hours", keyStops: ["Nine Arches Bridge", "Ravana Falls", "Little Adam's Peak"] },
      { dayNumber: 4, title: "Ella to Haputale", location: "Haputale", lat: 6.7636, lng: 80.9486, description: "Morning hike to Little Adam's Peak, then drive to Haputale. Afternoon visit to Lipton's Seat viewpoint.", drivingTime: "1 hour", keyStops: ["Lipton's Seat (Haputale)", "Dambetenna Tea Factory"] },
      { dayNumber: 5, title: "Haputale to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning at leisure in the highlands, then your driver takes you back to Colombo for your departure.", drivingTime: "4 hours", keyStops: ["Bandaranaike Airport"] },
    ],
    "hill-country-escape": [
      { dayNumber: 1, title: "Airport to Kandy", location: "Kandy", lat: 7.2906, lng: 80.635, description: "Your driver collects you from Bandaranaike Airport and winds up into the hills to Kandy.", drivingTime: "3.5 hours", keyStops: ["Pinnawala Elephant Orphanage", "Temple of the Tooth"] },
      { dayNumber: 2, title: "Kandy Day", location: "Kandy", lat: 7.2906, lng: 80.635, description: "Explore Kandy at leisure — Royal Botanical Gardens, Kandy Lake, and a kandyan cultural show.", drivingTime: "Local drives", keyStops: ["Royal Botanical Gardens", "Kandy Lake", "Cultural Show"] },
      { dayNumber: 3, title: "Kandy to Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7718, description: "Wind through emerald tea estates to Little England. Visit a working tea factory.", drivingTime: "2.5 hours", keyStops: ["Pedro Tea Estate", "Gregory Lake", "Nuwara Eliya Post Office"] },
      { dayNumber: 4, title: "Nuwara Eliya to Ella", location: "Ella", lat: 6.8667, lng: 81.047, description: "Scenic drive through tea country. Nine Arches Bridge, Ravana Falls, Little Adam's Peak.", drivingTime: "2 hours", keyStops: ["Nine Arches Bridge", "Ravana Falls", "Little Adam's Peak"] },
      { dayNumber: 5, title: "Ella to Haputale", location: "Haputale", lat: 6.7636, lng: 80.9486, description: "Drive to Haputale for the sweeping Lipton's Seat panorama and Dambetenna tea factory.", drivingTime: "1 hour", keyStops: ["Lipton's Seat", "Dambetenna Tea Factory"] },
      { dayNumber: 6, title: "Haputale to Adam's Peak (Sri Pada)", location: "Adam's Peak", lat: 6.8096, lng: 80.4994, description: "Drive to Adam's Peak. Midnight start for the pre-dawn summit climb — sacred 'Sri Pada' footprint.", drivingTime: "2 hours", keyStops: ["Adam's Peak Summit (Sri Pada)", "Sunrise from the summit"] },
      { dayNumber: 7, title: "Adam's Peak to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Rest after the night climb, then transfer to Colombo for your departure flight.", drivingTime: "3 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],
    "hill-country-explorer-10d": [
      { dayNumber: 1, title: "Airport to Kandy", location: "Kandy", lat: 7.2906, lng: 80.635, description: "Arrive at Bandaranaike Airport. Drive to Kandy, Sri Lanka's cultural capital.", drivingTime: "3.5 hours", keyStops: ["Pinnawala Elephant Orphanage", "Temple of the Tooth"] },
      { dayNumber: 2, title: "Kandy — Gardens & Lake", location: "Kandy", lat: 7.2906, lng: 80.635, description: "Full day in Kandy — Royal Botanical Gardens, Kandy Lake, Kandy Cultural Show.", drivingTime: "Local", keyStops: ["Royal Botanical Gardens", "Kandy Lake", "Kandyan Cultural Show"] },
      { dayNumber: 3, title: "Kandy to Matale & Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7718, description: "Stop at Matale spice gardens, then wind up to Nuwara Eliya.", drivingTime: "3 hours", keyStops: ["Matale Spice Garden", "Pedro Tea Estate", "Gregory Lake"] },
      { dayNumber: 4, title: "Nuwara Eliya — Tea Country", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7718, description: "Full day visiting tea estates, the tea factory, and Horton Plains at dawn.", drivingTime: "Local drives", keyStops: ["Horton Plains World's End", "Lovers Leap Waterfall", "Tea factory tour"] },
      { dayNumber: 5, title: "Nuwara Eliya to Ella", location: "Ella", lat: 6.8667, lng: 81.047, description: "Scenic drive to Ella. Nine Arches Bridge, Ravana Falls, Little Adam's Peak hike.", drivingTime: "2 hours", keyStops: ["Nine Arches Bridge", "Ravana Falls", "Little Adam's Peak"] },
      { dayNumber: 6, title: "Ella — Hike Day", location: "Ella", lat: 6.8667, lng: 81.047, description: "Full day hiking — Ella Rock for panoramic views or the jungle path to Demodara loop.", drivingTime: "Forest walks", keyStops: ["Ella Rock Summit", "Demodara Loop Bridge"] },
      { dayNumber: 7, title: "Ella to Haputale", location: "Haputale", lat: 6.7636, lng: 80.9486, description: "Morning at Ella, afternoon drive to Haputale and Lipton's Seat viewpoint.", drivingTime: "1 hour", keyStops: ["Lipton's Seat", "Dambetenna Tea Factory"] },
      { dayNumber: 8, title: "Haputale to Adam's Peak", location: "Adam's Peak", lat: 6.8096, lng: 80.4994, description: "Drive to Adam's Peak. Midnight start for the pre-dawn summit climb.", drivingTime: "2 hours", keyStops: ["Adam's Peak Summit (Sri Pada)", "Sunrise from the summit"] },
      { dayNumber: 9, title: "Adam's Peak to Kitulgala", location: "Kitulgala", lat: 6.9922, lng: 80.4167, description: "Afternoon white-water rafting on the Kelani River at Kitulgala after recovering from the climb.", drivingTime: "2 hours", keyStops: ["Kelani River Rafting", "Bridge on the River Kwai filming location"] },
      { dayNumber: 10, title: "Kitulgala to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Final morning at Kitulgala, then transfer to Colombo Airport.", drivingTime: "1.5 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],
    "hill-country-explorer-14d": [
      { dayNumber: 1, title: "Airport to Kandy", location: "Kandy", lat: 7.2906, lng: 80.635, description: "Arrive at Bandaranaike Airport. Drive to Kandy.", drivingTime: "3.5 hours", keyStops: ["Pinnawala Elephant Orphanage", "Temple of the Tooth"] },
      { dayNumber: 2, title: "Kandy Day 1", location: "Kandy", lat: 7.2906, lng: 80.635, description: "Royal Botanical Gardens, Kandy Lake, and a Kandyan cultural dance show.", drivingTime: "Local", keyStops: ["Royal Botanical Gardens Peradeniya", "Kandy Lake", "Kandyan Cultural Show"] },
      { dayNumber: 3, title: "Kandy Day 2 — Temples", location: "Kandy", lat: 7.2906, lng: 80.635, description: "Explore Kandy's lesser-known temples and the gem museum.", drivingTime: "Local", keyStops: ["Lankatilaka Temple", "Embekke Devale", "Gadaladeniya Temple", "Gem Museum"] },
      { dayNumber: 4, title: "Kandy to Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7718, description: "Drive through Matale spice gardens and up to Nuwara Eliya via Pedro Tea Estate.", drivingTime: "3 hours", keyStops: ["Matale Spice Garden", "Pedro Tea Estate", "Gregory Lake"] },
      { dayNumber: 5, title: "Nuwara Eliya — Horton Plains", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7718, description: "Pre-dawn drive to Horton Plains National Park. World's End cliff and Lovers Leap waterfall.", drivingTime: "1.5 hours", keyStops: ["Horton Plains World's End", "Lovers Leap Waterfall", "Baker's Falls"] },
      { dayNumber: 6, title: "Nuwara Eliya Tea Estates", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7718, description: "Full day visiting multiple tea estates — pick tea, tour the factory, taste single-origin teas.", drivingTime: "Local", keyStops: ["Mackwoods Labookellie Estate", "Bluefield Tea Garden", "Tea factory tour"] },
      { dayNumber: 7, title: "Nuwara Eliya to Ella", location: "Ella", lat: 6.8667, lng: 81.047, description: "Scenic drive to Ella via Nanu Oya train station area. Nine Arches Bridge, Ravana Falls.", drivingTime: "2 hours", keyStops: ["Nine Arches Bridge", "Ravana Falls"] },
      { dayNumber: 8, title: "Ella — Hikes", location: "Ella", lat: 6.8667, lng: 81.047, description: "Ella Rock summit hike and Little Adam's Peak — both reward with 360-degree views.", drivingTime: "Forest walks", keyStops: ["Ella Rock Summit", "Little Adam's Peak"] },
      { dayNumber: 9, title: "Ella to Haputale", location: "Haputale", lat: 6.7636, lng: 80.9486, description: "Drive to Haputale. Lipton's Seat at sunset over the vast tea estate panorama.", drivingTime: "1 hour", keyStops: ["Lipton's Seat", "Dambetenna Tea Factory"] },
      { dayNumber: 10, title: "Haputale to Adam's Peak", location: "Adam's Peak", lat: 6.8096, lng: 80.4994, description: "Night drive to Adam's Peak. Midnight start for the summit climb to see sunrise from Sri Pada.", drivingTime: "2 hours", keyStops: ["Adam's Peak Summit (Sri Pada)", "Sunrise from the summit"] },
      { dayNumber: 11, title: "Adam's Peak to Kitulgala", location: "Kitulgala", lat: 6.9922, lng: 80.4167, description: "Rest after the climb, afternoon white-water rafting on the Kelani River.", drivingTime: "2 hours", keyStops: ["Kelani River White-water Rafting", "Bridge on the River Kwai site"] },
      { dayNumber: 12, title: "Kitulgala to Sinharaja", location: "Sinharaja", lat: 6.3949, lng: 80.4756, description: "Drive to Sinharaja Rainforest for endemic birdwatching guided by a local naturalist.", drivingTime: "2 hours", keyStops: ["Sinharaja Rainforest Trail", "Endemic bird spotting"] },
      { dayNumber: 13, title: "Sinharaja to Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Drive out of the rainforest and west to Galle Fort for a final evening on the coast.", drivingTime: "2 hours", keyStops: ["Galle Fort Ramparts", "Lighthouse"] },
      { dayNumber: 14, title: "Galle to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Final morning at Galle, then transfer to Colombo Airport for departure.", drivingTime: "2 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],

    // ── Cultural Triangle ──────────────────────────────────────────────────
    "cultural-triangle-5d": [
      { dayNumber: 1, title: "Airport to Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Drive north from the airport to the sacred ancient city of Anuradhapura.", drivingTime: "4 hours", keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba", "Jetavanaramaya"] },
      { dayNumber: 2, title: "Anuradhapura to Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Visit the 5th-century Lion Rock fortress at Sigiriya before checking in near Dambulla.", drivingTime: "2 hours", keyStops: ["Sigiriya Rock Fortress", "Sigiriya Frescoes"] },
      { dayNumber: 3, title: "Dambulla & Polonnaruwa", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Morning at Dambulla Cave Temple, afternoon exploring the medieval capital Polonnaruwa.", drivingTime: "1.5 hours", keyStops: ["Dambulla Cave Temple", "Gal Vihara", "Polonnaruwa Vatadage"] },
      { dayNumber: 4, title: "Polonnaruwa to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive south-west to Kandy — Temple of the Tooth Relic, Kandy Lake walk, cultural show.", drivingTime: "3 hours", keyStops: ["Temple of the Tooth", "Kandy Lake", "Kandyan Cultural Show"] },
      { dayNumber: 5, title: "Kandy to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning at Peradeniya Botanical Gardens, then transfer to Colombo Airport.", drivingTime: "3.5 hours", keyStops: ["Peradeniya Botanical Gardens", "Bandaranaike Airport"] },
    ],
    "cultural-triangle-7d": [
      { dayNumber: 1, title: "Airport to Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Drive north to the ancient capital of Anuradhapura — the world's third oldest city.", drivingTime: "4 hours", keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba", "Jetavanaramaya"] },
      { dayNumber: 2, title: "Anuradhapura — Full Day", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Full day exploring Anuradhapura's vast ancient city complex. Visit Mihintale — the birthplace of Buddhism in Sri Lanka.", drivingTime: "Local", keyStops: ["Mihintale", "Abhayagiriya Dagoba", "Twin Ponds (Kuttam Pokuna)"] },
      { dayNumber: 3, title: "Anuradhapura to Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb the iconic Lion Rock fortress. Afternoon exploring the Sigiriya gardens and moats.", drivingTime: "2 hours", keyStops: ["Sigiriya Rock Fortress", "Sigiriya Water Gardens", "Sigiriya Frescoes"] },
      { dayNumber: 4, title: "Dambulla & Polonnaruwa", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Morning at Dambulla Cave Temple. Afternoon at the medieval capital Polonnaruwa.", drivingTime: "1.5 hours", keyStops: ["Dambulla Cave Temple", "Gal Vihara Polonnaruwa", "Vatadage"] },
      { dayNumber: 5, title: "Polonnaruwa to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive south-west to Kandy, Sri Lanka's cultural capital.", drivingTime: "3 hours", keyStops: ["Temple of the Tooth", "Kandy Lake"] },
      { dayNumber: 6, title: "Kandy — Culture Day", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Royal Botanical Gardens, gem museum, and a Kandyan cultural dance performance.", drivingTime: "Local", keyStops: ["Peradeniya Royal Botanical Gardens", "Gem Museum", "Kandyan Cultural Show"] },
      { dayNumber: 7, title: "Kandy to Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning at leisure, then transfer to Colombo Airport for departure.", drivingTime: "3.5 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],
    "cultural-triangle-10d": [
      { dayNumber: 1, title: "Airport to Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Drive north to the ancient sacred city of Anuradhapura.", drivingTime: "4 hours", keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba"] },
      { dayNumber: 2, title: "Anuradhapura Full Day", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Comprehensive exploration of Anuradhapura and the nearby hilltop monastery at Mihintale.", drivingTime: "Local", keyStops: ["Mihintale", "Abhayagiriya", "Twin Ponds"] },
      { dayNumber: 3, title: "Anuradhapura to Polonnaruwa", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Drive east to the medieval capital, with its superb stone sculptures and royal bathing pool.", drivingTime: "2 hours", keyStops: ["Gal Vihara", "Vatadage", "Parakrama Samudraya"] },
      { dayNumber: 4, title: "Polonnaruwa to Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Climb Sigiriya Rock Fortress. Explore the water gardens and the famous frescoes.", drivingTime: "1.5 hours", keyStops: ["Sigiriya Rock Fortress", "Sigiriya Water Gardens"] },
      { dayNumber: 5, title: "Dambulla — Cave Temple", location: "Dambulla", lat: 7.8567, lng: 80.6492, description: "Full morning at Dambulla Cave Temple — 153 Buddha statues in five extraordinary caves.", drivingTime: "30 minutes", keyStops: ["Dambulla Cave Temple Complex", "Golden Temple of Dambulla"] },
      { dayNumber: 6, title: "Dambulla to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive south to Kandy, passing spice gardens at Matale.", drivingTime: "2.5 hours", keyStops: ["Matale Spice Garden", "Temple of the Tooth", "Kandy Lake"] },
      { dayNumber: 7, title: "Kandy — Full Day", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Peradeniya Botanical Gardens, gem museum, Kandy Lake walk, evening cultural show.", drivingTime: "Local", keyStops: ["Peradeniya Gardens", "Gem Museum", "Cultural Show"] },
      { dayNumber: 8, title: "Kandy to Galle via Hill Country", location: "Galle", lat: 6.0535, lng: 80.221, description: "Long scenic drive south via Kitulgala and the Sinharaja rainforest buffer zone.", drivingTime: "5 hours", keyStops: ["Kitulgala Bridge", "Galle Fort"] },
      { dayNumber: 9, title: "Galle Fort Day", location: "Galle", lat: 6.0535, lng: 80.221, description: "Full day in Galle Fort — ramparts, Dutch history, boutiques and cafés.", drivingTime: "Local walks", keyStops: ["Galle Fort Ramparts", "Dutch Reformed Church", "Lighthouse"] },
      { dayNumber: 10, title: "Galle to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning on the coast, then transfer to Colombo Airport.", drivingTime: "2 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],
    "cultural-triangle-14d": [
      { dayNumber: 1, title: "Airport to Colombo", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Arrive and settle into Colombo. Brief city tour — Pettah bazaar, Galle Face Green, National Museum.", drivingTime: "30 minutes", keyStops: ["Galle Face Green", "Pettah Market", "National Museum Colombo"] },
      { dayNumber: 2, title: "Colombo to Anuradhapura", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Drive north to the ancient capital of Anuradhapura.", drivingTime: "4 hours", keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba"] },
      { dayNumber: 3, title: "Anuradhapura — Mihintale", location: "Anuradhapura", lat: 8.3114, lng: 80.4037, description: "Full day in Anuradhapura including Mihintale — the cradle of Buddhism in Sri Lanka.", drivingTime: "Local", keyStops: ["Mihintale", "Abhayagiriya", "Twin Ponds"] },
      { dayNumber: 4, title: "Anuradhapura to Jaffna", location: "Jaffna", lat: 9.6615, lng: 80.0255, description: "Drive north to Jaffna — Sri Lanka's northern capital and Tamil heartland.", drivingTime: "3 hours", keyStops: ["Jaffna Fort", "Nallur Kandaswamy Temple"] },
      { dayNumber: 5, title: "Jaffna — Islands & Temples", location: "Jaffna", lat: 9.6615, lng: 80.0255, description: "Boat trip to Nainativu Island (Nagapooshani Amman Temple) and Neduntivu Island (white sand beach).", drivingTime: "Boat trips", keyStops: ["Nainativu Island", "Neduntivu Beach", "Jaffna Peninsula"] },
      { dayNumber: 6, title: "Jaffna to Polonnaruwa", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Long drive south to Polonnaruwa. Arrive for the evening light at the Gal Vihara.", drivingTime: "5 hours", keyStops: ["Gal Vihara", "Vatadage"] },
      { dayNumber: 7, title: "Polonnaruwa Full Day", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Comprehensive tour of the medieval royal city — palace ruins, royal baths, sacred temples.", drivingTime: "Local", keyStops: ["Royal Palace ruins", "Parakrama Samudraya", "Kiri Vehera"] },
      { dayNumber: 8, title: "Polonnaruwa to Sigiriya", location: "Sigiriya", lat: 7.9573, lng: 80.7601, description: "Morning drive to Sigiriya for the early-morning climb before the heat.", drivingTime: "1.5 hours", keyStops: ["Sigiriya Rock Fortress", "Sigiriya Water Gardens"] },
      { dayNumber: 9, title: "Dambulla & Ritigala", location: "Dambulla", lat: 7.8567, lng: 80.6492, description: "Dambulla Cave Temple then the off-the-beaten-track forest monastery at Ritigala.", drivingTime: "1.5 hours", keyStops: ["Dambulla Cave Temple", "Ritigala Forest Monastery"] },
      { dayNumber: 10, title: "Dambulla to Kandy", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Drive south, stopping at Matale spice garden. Arrive Kandy for the Temple of the Tooth.", drivingTime: "2.5 hours", keyStops: ["Matale Spice Garden", "Temple of the Tooth"] },
      { dayNumber: 11, title: "Kandy — Culture Full Day", location: "Kandy", lat: 7.2906, lng: 80.6337, description: "Peradeniya Gardens, Lankatilaka temple, Embekke Devale, gem museum.", drivingTime: "Local", keyStops: ["Peradeniya Gardens", "Lankatilaka Temple", "Embekke Devale"] },
      { dayNumber: 12, title: "Kandy to Nuwara Eliya", location: "Nuwara Eliya", lat: 6.9497, lng: 80.7718, description: "Drive into the tea highlands — Pedro Tea Estate, Gregory Lake.", drivingTime: "2.5 hours", keyStops: ["Pedro Tea Estate", "Gregory Lake"] },
      { dayNumber: 13, title: "Nuwara Eliya to Galle", location: "Galle", lat: 6.0535, lng: 80.221, description: "Descend from the highlands to Galle — the finest Dutch fort in Asia.", drivingTime: "4 hours", keyStops: ["Galle Fort Ramparts", "Dutch Reformed Church"] },
      { dayNumber: 14, title: "Galle to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Morning on the coast, then transfer to Colombo Airport.", drivingTime: "2 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],

    // ── East Coast Escape ──────────────────────────────────────────────────
    "east-coast-escape-5d": [
      { dayNumber: 1, title: "Airport to Trincomalee", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Long drive across the island to Trincomalee — Sri Lanka's natural harbour and east coast gateway.", drivingTime: "5 hours", keyStops: ["Dambulla (lunch stop)", "Trincomalee Fort Frederick"] },
      { dayNumber: 2, title: "Trincomalee — Beaches & Fort", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Morning at Uppuveli or Nilaveli Beach. Afternoon at Fort Frederick and Koneswaram Hindu Temple.", drivingTime: "Local", keyStops: ["Nilaveli Beach", "Fort Frederick", "Koneswaram Temple"] },
      { dayNumber: 3, title: "Pigeon Island Snorkelling", location: "Nilaveli", lat: 8.7037, lng: 81.1978, description: "Boat trip to Pigeon Island National Park — one of Sri Lanka's best snorkelling spots with blacktip reef sharks.", drivingTime: "Boat trip", keyStops: ["Pigeon Island Marine National Park", "Coral gardens", "Blacktip reef sharks"] },
      { dayNumber: 4, title: "Trincomalee to Passikudah", location: "Passikudah", lat: 7.929, lng: 81.5597, description: "Drive south to Passikudah Bay — a famously shallow lagoon with crystal-clear water perfect for swimming.", drivingTime: "2 hours", keyStops: ["Passikudah Bay", "Kalkudah Beach"] },
      { dayNumber: 5, title: "Passikudah to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Long drive west to Colombo Airport for your departure flight.", drivingTime: "5 hours", keyStops: ["Colombo City", "Bandaranaike Airport"] },
    ],
    "east-coast-escape-7d": [
      { dayNumber: 1, title: "Airport to Trincomalee", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Drive across the island to Trincomalee — Sri Lanka's finest natural harbour.", drivingTime: "5 hours", keyStops: ["Dambulla (lunch stop)", "Trincomalee Fort Frederick"] },
      { dayNumber: 2, title: "Trincomalee — Fort & Temple", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Fort Frederick, Koneswaram Temple (built on the clifftop), and whale watching boat trip (May–Oct).", drivingTime: "Local", keyStops: ["Fort Frederick", "Koneswaram Temple", "Whale Watching Boat"] },
      { dayNumber: 3, title: "Pigeon Island Snorkelling", location: "Nilaveli", lat: 8.7037, lng: 81.1978, description: "Boat trip to Pigeon Island Marine National Park — coral gardens and blacktip reef sharks.", drivingTime: "Boat trip", keyStops: ["Pigeon Island coral gardens", "Nilaveli Beach"] },
      { dayNumber: 4, title: "Trincomalee to Passikudah", location: "Passikudah", lat: 7.929, lng: 81.5597, description: "Drive south to Passikudah's famously calm, shallow lagoon.", drivingTime: "2 hours", keyStops: ["Passikudah Bay", "Kalkudah Beach"] },
      { dayNumber: 5, title: "Passikudah to Arugam Bay", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Drive south to Arugam Bay — one of the world's top surfing destinations (best May–Oct).", drivingTime: "2.5 hours", keyStops: ["Arugam Bay Main Point", "Pottuvil Lagoon"] },
      { dayNumber: 6, title: "Arugam Bay — Surf & Wildlife", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Morning surf session on the main break. Afternoon boat trip on Pottuvil lagoon — elephants and crocodiles.", drivingTime: "Local", keyStops: ["Arugam Bay Main Point", "Pottuvil Lagoon boat trip", "Kumana National Park fringe"] },
      { dayNumber: 7, title: "Arugam Bay to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Long transfer west across the island back to Colombo Airport.", drivingTime: "7 hours", keyStops: ["Monaragala (lunch stop)", "Bandaranaike Airport"] },
    ],
    "east-coast-escape-10d": [
      { dayNumber: 1, title: "Airport to Trincomalee", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Drive across the island to Trincomalee.", drivingTime: "5 hours", keyStops: ["Dambulla Cave Temple", "Trincomalee Fort"] },
      { dayNumber: 2, title: "Trincomalee Beaches & Fort", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Fort Frederick, Koneswaram Temple, Uppuveli Beach.", drivingTime: "Local", keyStops: ["Fort Frederick", "Koneswaram Temple", "Uppuveli Beach"] },
      { dayNumber: 3, title: "Pigeon Island Snorkelling", location: "Nilaveli", lat: 8.7037, lng: 81.1978, description: "Boat trip to Pigeon Island coral reef and blacktip shark territory.", drivingTime: "Boat trip", keyStops: ["Pigeon Island Marine National Park", "Coral gardens"] },
      { dayNumber: 4, title: "Trincomalee to Polonnaruwa", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Drive south to the medieval capital Polonnaruwa — superb stone sculptures.", drivingTime: "3 hours", keyStops: ["Gal Vihara", "Vatadage", "Polonnaruwa Museum"] },
      { dayNumber: 5, title: "Polonnaruwa to Passikudah", location: "Passikudah", lat: 7.929, lng: 81.5597, description: "Morning at Polonnaruwa, afternoon at the calm, shallow Passikudah lagoon.", drivingTime: "1.5 hours", keyStops: ["Passikudah Bay", "Kalkudah Beach"] },
      { dayNumber: 6, title: "Passikudah — Lazy Beach Day", location: "Passikudah", lat: 7.929, lng: 81.5597, description: "Full day relaxing on the beach — swimming, snorkelling, and fresh seafood.", drivingTime: "Local", keyStops: ["Passikudah lagoon swimming", "Local seafood restaurant"] },
      { dayNumber: 7, title: "Passikudah to Arugam Bay", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Drive south to Arugam Bay, one of the world's top surf breaks.", drivingTime: "2.5 hours", keyStops: ["Arugam Bay Main Point"] },
      { dayNumber: 8, title: "Arugam Bay — Surf & Lagoon", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Morning surf. Afternoon Pottuvil lagoon boat trip — elephants, crocodiles, water birds.", drivingTime: "Local", keyStops: ["Arugam Bay Main Point", "Pottuvil Lagoon boat trip"] },
      { dayNumber: 9, title: "Arugam Bay to Kumana", location: "Kumana", lat: 6.5874, lng: 81.6863, description: "Day trip to Kumana National Park — 255 species of birds and a remote leopard population.", drivingTime: "1 hour", keyStops: ["Kumana National Park", "Kumana Lagoon", "Wading birds colony"] },
      { dayNumber: 10, title: "Arugam Bay to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Final morning at the beach, then long transfer to Colombo Airport.", drivingTime: "7 hours", keyStops: ["Monaragala (lunch stop)", "Bandaranaike Airport"] },
    ],
    "east-coast-escape-14d": [
      { dayNumber: 1, title: "Airport to Trincomalee", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Drive across the island to Trincomalee — Sri Lanka's finest natural harbour.", drivingTime: "5 hours", keyStops: ["Dambulla Cave Temple", "Trincomalee Fort"] },
      { dayNumber: 2, title: "Trincomalee — Fort & Temple", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Fort Frederick, Koneswaram clifftop temple, and the beaches at Uppuveli.", drivingTime: "Local", keyStops: ["Fort Frederick", "Koneswaram Temple", "Uppuveli Beach"] },
      { dayNumber: 3, title: "Trincomalee Whale Watching", location: "Trincomalee", lat: 8.5674, lng: 81.2335, description: "Morning whale-watching boat trip (blue whales pass close to Trincomalee May–Oct).", drivingTime: "Boat trip", keyStops: ["Whale Watching Boat Trip", "Pigeon Island viewpoint"] },
      { dayNumber: 4, title: "Pigeon Island Snorkelling", location: "Nilaveli", lat: 8.7037, lng: 81.1978, description: "Full day snorkelling at Pigeon Island — one of Sri Lanka's best reefs.", drivingTime: "Boat trip", keyStops: ["Pigeon Island Marine National Park", "Coral gardens", "Nilaveli Beach"] },
      { dayNumber: 5, title: "Trincomalee to Polonnaruwa", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Drive south to Polonnaruwa, the medieval capital with superb stone carvings.", drivingTime: "3 hours", keyStops: ["Gal Vihara", "Vatadage", "Parakrama Samudraya"] },
      { dayNumber: 6, title: "Polonnaruwa Full Day", location: "Polonnaruwa", lat: 7.9397, lng: 81.0003, description: "Full day exploring the medieval royal city by bicycle — palace ruins, royal baths, temples.", drivingTime: "Bicycle/Local", keyStops: ["Polonnaruwa Museum", "Royal Palace", "Kiri Vehera"] },
      { dayNumber: 7, title: "Polonnaruwa to Passikudah", location: "Passikudah", lat: 7.929, lng: 81.5597, description: "Morning at Polonnaruwa, afternoon arrive at Passikudah's stunning lagoon.", drivingTime: "1.5 hours", keyStops: ["Passikudah Bay", "Kalkudah Beach"] },
      { dayNumber: 8, title: "Passikudah — Beach Day", location: "Passikudah", lat: 7.929, lng: 81.5597, description: "Full day relaxing — swimming, snorkelling the fringe reef, and fresh lagoon seafood.", drivingTime: "Local", keyStops: ["Passikudah lagoon", "Snorkelling reef"] },
      { dayNumber: 9, title: "Passikudah to Batticaloa", location: "Batticaloa", lat: 7.7102, lng: 81.6924, description: "Drive south to Batticaloa — famous for its singing fish lagoon and the Dutch fort.", drivingTime: "1 hour", keyStops: ["Batticaloa Dutch Fort", "Kallady Bridge", "Singing fish lagoon"] },
      { dayNumber: 10, title: "Batticaloa to Arugam Bay", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Drive south to Arugam Bay, one of the world's most celebrated surf breaks.", drivingTime: "2 hours", keyStops: ["Arugam Bay Main Point"] },
      { dayNumber: 11, title: "Arugam Bay — Surf & Lagoon", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Morning surf session. Afternoon Pottuvil lagoon boat trip.", drivingTime: "Local", keyStops: ["Arugam Bay Main Point", "Pottuvil Lagoon boat trip"] },
      { dayNumber: 12, title: "Arugam Bay to Kumana", location: "Kumana", lat: 6.5874, lng: 81.6863, description: "Full day at Kumana National Park — 255 bird species, leopards, and elephants.", drivingTime: "1 hour", keyStops: ["Kumana National Park", "Kumana Lagoon birds"] },
      { dayNumber: 13, title: "Arugam Bay — Rest Day", location: "Arugam Bay", lat: 6.8395, lng: 81.8349, description: "Final beach day at Arugam Bay — surf, swim, or relax at a beachfront café.", drivingTime: "Local", keyStops: ["Arugam Bay beach", "Whisky Point surf break"] },
      { dayNumber: 14, title: "Arugam Bay to Colombo Airport", location: "Colombo", lat: 6.9271, lng: 79.8612, description: "Long final transfer across the island to Colombo Airport.", drivingTime: "7 hours", keyStops: ["Monaragala (lunch stop)", "Bandaranaike Airport"] },
    ],
  };

  for (const tourData of tours) {
    // onConflictDoUpdate patches groupSlug/groupId on existing rows; inserts new rows
    const [tour] = await db
      .insert(toursTable)
      .values(tourData)
      .onConflictDoUpdate({
        target: toursTable.slug,
        set: {
          groupSlug: tourData.groupSlug,
          groupId: tourData.groupId,
          durationDays: tourData.durationDays,
          durationNights: tourData.durationNights,
          description: tourData.description,
          highlights: tourData.highlights,
        },
      })
      .returning();

    if (!tour) continue;

    const rates = _getRates(tour.slug);
    await db
      .insert(tourVehicleRatesTable)
      .values(
        Object.entries(rates).map(([vehicleType, pricePerDay]) => ({
          tourId: tour.id,
          vehicleType,
          pricePerDay,
        }))
      )
      .onConflictDoNothing();

    // Add ons
    await db
      .insert(tourAddOnsTable)
      .values([
        {
          tourId: tour.id,
          name: "Airport Pickup",
          description: "Meet & greet at Bandaranaike International Airport",
          priceGBP: 28,
        },
        {
          tourId: tour.id,
          name: "Welcome Pack",
          description: "Local SIM card, bottled water, snacks & guidebook",
          priceGBP: 15,
        },
      ])
      .onConflictDoNothing();

    // Seasonal pricing
    await db
      .insert(seasonalPricingTable)
      .values([
        {
          tourId: tour.id,
          startDate: new Date("2025-12-15"),
          endDate: new Date("2026-01-15"),
          multiplier: 1.25,
        },
        {
          tourId: tour.id,
          startDate: new Date("2026-07-01"),
          endDate: new Date("2026-08-31"),
          multiplier: 1.15,
        },
      ])
      .onConflictDoNothing();

    // Seed itinerary days from the lookup table (onConflictDoNothing preserves any admin edits)
    const days = itineraryBySlug[tour.slug];
    if (days && days.length > 0) {
      await db
        .insert(itineraryDaysTable)
        .values(days.map((d) => ({ ...d, tourId: tour.id })))
        .onConflictDoNothing();
    }
  }

  console.log("  ✓ Tours created");

  // ─── Driver Payout Rates ───────────────────────────────────────────────────
  console.log("  Creating driver payout rates...");
  // Get driver records
  const allDrivers = await db.select().from(driversTable);
  for (const d of allDrivers) {
    await db
      .insert(driverPayoutRatesTable)
      .values([
        { driverId: d.id, vehicleType: "car", dailyFee: 25, commissionPct: 15 },
        { driverId: d.id, vehicleType: "minivan", dailyFee: 35, commissionPct: 15 },
      ])
      .onConflictDoNothing();
  }
  console.log("  ✓ Driver payout rates created");

  // ─── Bookings ──────────────────────────────────────────────────────────────
  console.log("  Creating sample bookings...");

  // Get the first tour for bookings
  const allTours = await db.select().from(toursTable);
  const classicTour = allTours.find((t) => t.slug === "classic-sri-lanka");
  const hillTour = allTours.find((t) => t.slug === "hill-country-escape");
  const beachTour = allTours.find((t) => t.slug === "south-coast-beaches-5d");
  const allTransfers = await db.select().from(transferRoutesTable);
  const airportColombo = allTransfers.find((r) => r.name.includes("Colombo"));

  if (resolvedTourist && classicTour && hillTour && allDrivers.length > 0) {
    const driver1Rec = allDrivers[0];
    const driver2Rec = allDrivers.length > 1 ? allDrivers[1] : allDrivers[0];

    // Booking 1: Completed tour (past)
    const [booking1] = await db
      .insert(bookingsTable)
      .values({
        referenceCode: "PKD-2026-001",
        type: "READY_MADE",
        status: "COMPLETED",
        customerId: resolvedTourist.id,
        tourId: classicTour.id,
        vehicleType: "minivan",
        driverId: driver1Rec.id,
        startDate: new Date("2026-02-10"),
        endDate: new Date("2026-02-19"),
        numDays: 10,
        pickupTime: "08:00",
        pickupLocation: "Bandaranaike Int. Airport (CMB)",
        dropoffLocation: "Bandaranaike Int. Airport (CMB)",
        passengers: 2,
        specialRequests: "Vegetarian meals preferred. We celebrate our anniversary on Feb 14th!",
        totalGBP: 650,
        paymentStatus: "PAID",
        pricingBreakdown: {
          vehicleTotal: 650,
          addOnsTotal: 43,
          taxesAndFees: 0,
        },
        addOns: [
          { name: "Airport Pickup", price: 28 },
          { name: "Welcome Pack", price: 15 },
        ],
        hotelDetails: "Cinnamon Grand Colombo, then Heritance Kandalama",
      })
      .onConflictDoNothing()
      .returning();

    // Booking 2: Upcoming confirmed tour
    const [booking2] = await db
      .insert(bookingsTable)
      .values({
        referenceCode: "PKD-2026-002",
        type: "READY_MADE",
        status: "CONFIRMED",
        customerId: resolvedTourist.id,
        tourId: hillTour.id,
        vehicleType: "car",
        driverId: driver2Rec.id,
        startDate: new Date("2026-04-15"),
        endDate: new Date("2026-04-21"),
        numDays: 7,
        pickupTime: "09:00",
        pickupLocation: "Colombo Fort Railway Station",
        dropoffLocation: "Kandy Queens Hotel",
        passengers: 2,
        specialRequests: "Would love to stop at a tea factory along the way.",
        totalGBP: 315,
        paymentStatus: "PAID",
        pricingBreakdown: {
          vehicleTotal: 315,
          addOnsTotal: 0,
          taxesAndFees: 0,
        },
        hotelDetails: "Hotel & Boutique Nuwara Eliya",
        flightNumber: "BA2069",
      })
      .onConflictDoNothing()
      .returning();

    // Booking 3: Completed transfer (past)
    const [booking3] = await db
      .insert(bookingsTable)
      .values({
        referenceCode: "PKD-2026-003",
        type: "TRANSFER",
        status: "COMPLETED",
        customerId: resolvedTourist.id,
        transferRouteId: airportColombo?.id,
        vehicleType: "car",
        driverId: driver1Rec.id,
        startDate: new Date("2026-02-09"),
        endDate: new Date("2026-02-09"),
        numDays: 1,
        pickupTime: "14:30",
        pickupLocation: "Bandaranaike Int. Airport (CMB)",
        dropoffLocation: "Colombo Hilton Hotel",
        passengers: 2,
        totalGBP: 28,
        paymentStatus: "PAID",
      })
      .onConflictDoNothing()
      .returning();

    // Booking 4: Pending tour (another tourist or same, waiting payment)
    await db
      .insert(bookingsTable)
      .values({
        referenceCode: "PKD-2026-004",
        type: "READY_MADE",
        status: "PENDING",
        customerId: resolvedTourist.id,
        tourId: beachTour?.id,
        vehicleType: "minivan",
        startDate: new Date("2026-05-20"),
        endDate: new Date("2026-05-25"),
        numDays: 6,
        pickupTime: "07:30",
        pickupLocation: "Colombo City Hotel",
        dropoffLocation: "Galle Fort Hotel",
        passengers: 4,
        specialRequests: "Travelling with 2 children (ages 6 and 9). Need child-safe seats.",
        totalGBP: 390,
        paymentStatus: "PENDING",
      })
      .onConflictDoNothing();

    console.log("  ✓ Bookings created");

    // ─── Invoices ──────────────────────────────────────────────────────────────
    console.log("  Creating invoices...");

    if (booking1) {
      await db
        .insert(invoicesTable)
        .values({
          invoiceNumber: "INV-2026-001",
          bookingId: booking1.id,
          customerId: resolvedTourist.id,
          lineItems: [
            { description: "Classic Sri Lanka (10 days, Minivan)", quantity: 1, price: 650 },
            { description: "Airport Pickup", quantity: 1, price: 28 },
            { description: "Welcome Pack", quantity: 1, price: 15 },
          ],
          subtotal: 693,
          tax: 0,
          total: 693,
        })
        .onConflictDoNothing();
    }

    if (booking2) {
      await db
        .insert(invoicesTable)
        .values({
          invoiceNumber: "INV-2026-002",
          bookingId: booking2.id,
          customerId: resolvedTourist.id,
          lineItems: [
            { description: "Hill Country Escape (7 days, Car)", quantity: 1, price: 315 },
          ],
          subtotal: 315,
          tax: 0,
          total: 315,
        })
        .onConflictDoNothing();
    }

    if (booking3) {
      await db
        .insert(invoicesTable)
        .values({
          invoiceNumber: "INV-2026-003",
          bookingId: booking3.id,
          customerId: resolvedTourist.id,
          lineItems: [
            { description: "Airport Transfer → Colombo (Car)", quantity: 1, price: 28 },
          ],
          subtotal: 28,
          tax: 0,
          total: 28,
        })
        .onConflictDoNothing();
    }

    console.log("  ✓ Invoices created");

    // ─── Booking Activities ───────────────────────────────────────────────────
    console.log("  Creating booking activities...");
    if (booking1) {
      await db.insert(bookingActivitiesTable).values([
        { bookingId: booking1.id, action: "created", details: { referenceCode: "PKD-2026-001" }, performedByName: "Sarah Johnson", createdAt: new Date("2026-02-01T10:00:00Z") },
        { bookingId: booking1.id, action: "payment_received", details: { amount: 650, currency: "GBP" }, performedByName: "System", createdAt: new Date("2026-02-01T10:05:00Z") },
        { bookingId: booking1.id, action: "status_changed", details: { fromStatus: "PENDING", toStatus: "CONFIRMED" }, performedByName: "Admin", createdAt: new Date("2026-02-02T09:00:00Z") },
        { bookingId: booking1.id, action: "driver_assigned", details: { driverName: "Kumara Perera" }, performedByName: "Admin", createdAt: new Date("2026-02-02T09:05:00Z") },
        { bookingId: booking1.id, action: "status_changed", details: { fromStatus: "CONFIRMED", toStatus: "IN_PROGRESS" }, performedByName: "System", createdAt: new Date("2026-02-10T08:00:00Z") },
        { bookingId: booking1.id, action: "status_changed", details: { fromStatus: "IN_PROGRESS", toStatus: "COMPLETED" }, performedByName: "System", createdAt: new Date("2026-02-19T18:00:00Z") },
      ]).onConflictDoNothing();
    }
    if (booking2) {
      await db.insert(bookingActivitiesTable).values([
        { bookingId: booking2.id, action: "created", details: { referenceCode: "PKD-2026-002" }, performedByName: "Sarah Johnson", createdAt: new Date("2026-03-15T14:00:00Z") },
        { bookingId: booking2.id, action: "payment_received", details: { amount: 315, currency: "GBP" }, performedByName: "System", createdAt: new Date("2026-03-15T14:05:00Z") },
        { bookingId: booking2.id, action: "status_changed", details: { fromStatus: "PENDING", toStatus: "CONFIRMED" }, performedByName: "Admin", createdAt: new Date("2026-03-16T09:00:00Z") },
        { bookingId: booking2.id, action: "driver_assigned", details: { driverName: "Nimal Silva" }, performedByName: "Admin", createdAt: new Date("2026-03-16T09:10:00Z") },
      ]).onConflictDoNothing();
    }
    console.log("  ✓ Booking activities created");
  }

  // ─── Global Seasonal Pricing ────────────────────────────────────────────────
  console.log("  Creating global seasonal pricing...");
  await db
    .insert(globalSeasonalPricingTable)
    .values([
      {
        name: "Peak season",
        startDate: new Date("2026-12-15"),
        endDate: new Date("2027-01-15"),
        multiplier: 1.3,
      },
      {
        name: "High season",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-08-31"),
        multiplier: 1.2,
      },
      {
        name: "Shoulder season",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-06-30"),
        multiplier: 1.1,
      },
    ])
    .onConflictDoNothing();
  console.log("  ✓ Global seasonal pricing created");

  // ─── Custom Tour Requests ──────────────────────────────────────────────────
  console.log("  Creating custom tour requests...");

  if (resolvedTourist) {
    // A quoted custom request (tourist will see "quote ready")
    await db
      .insert(customTourRequestsTable)
      .values({
        referenceCode: "CTR-2026-001",
        status: "QUOTED",
        customerId: resolvedTourist.id,
        tripType: "Honeymoon",
        locations: ["Colombo", "Kandy", "Ella", "Mirissa"],
        preferredDates: "June 2026",
        durationDays: 12,
        flexibility: true,
        vehiclePreference: "car",
        passengers: 2,
        budgetRange: "£800–£1200",
        travelStyle: ["Luxury", "Romantic"],
        interests: ["Cultural sites", "Beaches", "Wildlife", "Fine dining"],
        specialRequests:
          "This is our honeymoon trip. Would love special dinner arrangements on the first night.",
        quote: {
          totalGBP: 980,
          breakdown: [
            { item: "Private car & driver (12 days)", amount: 540 },
            { item: "Honeymoon experience package", amount: 180 },
            { item: "Whale watching excursion", amount: 65 },
            { item: "Airport transfers", amount: 56 },
            { item: "Welcome & farewell dinners", amount: 139 },
          ],
          validUntil: "2026-04-30",
          notes:
            "Includes a surprise beach dinner setup in Mirissa and spa vouchers at Heritance Tea Factory.",
        },
      })
      .onConflictDoNothing();

    // A new custom request (admin will see as pending)
    await db
      .insert(customTourRequestsTable)
      .values({
        referenceCode: "CTR-2026-002",
        status: "NEW",
        customerId: resolvedTourist.id,
        tripType: "Family Adventure",
        locations: ["Sigiriya", "Dambulla", "Minneriya", "Kandy"],
        preferredDates: "August 2026",
        durationDays: 8,
        flexibility: false,
        vehiclePreference: "minivan",
        passengers: 5,
        budgetRange: "£600–£900",
        travelStyle: ["Adventure", "Family-friendly"],
        interests: ["Wildlife safari", "Ancient ruins", "Nature walks"],
        specialRequests:
          "Travelling with 3 kids (ages 4, 7, 11). Need child-safe transport and kid-friendly activities.",
      })
      .onConflictDoNothing();
  }

  console.log("  ✓ Custom tour requests created");

  // ─── CYO Vehicle Rates ────────────────────────────────────────────────────
  console.log("  Creating CYO vehicle rates...");
  await db
    .insert(cyoVehicleRatesTable)
    .values([
      { vehicleType: "car", pricePerDay: 45 },
      { vehicleType: "minivan", pricePerDay: 65 },
      { vehicleType: "large-van", pricePerDay: 85 },
      { vehicleType: "small-bus", pricePerDay: 120 },
      { vehicleType: "medium-bus", pricePerDay: 175 },
    ])
    .onConflictDoNothing();
  console.log("  ✓ CYO vehicle rates created");

  // ─── CYO Upsell Items ─────────────────────────────────────────────────────
  console.log("  Creating CYO upsell items...");
  await db
    .insert(cyoUpsellItemsTable)
    .values([
      { name: "Airport Pickup", description: "Meet & greet at Bandaranaike International Airport (BIA)", priceGBP: 35, sortOrder: 1 },
      { name: "Welcome Pack", description: "Local SIM card, bottled water, snacks & destination guidebook", priceGBP: 15, sortOrder: 2 },
      { name: "Tuk-tuk Day Trip", description: "Private tuk-tuk for a half-day local exploration", priceGBP: 25, sortOrder: 3 },
      { name: "Professional Photography", description: "Dedicated photographer for one full day of your tour", priceGBP: 120, sortOrder: 4 },
    ])
    .onConflictDoNothing();
  console.log("  ✓ CYO upsell items created");

  console.log("\n✅ Seed complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin:   sameer@artyreal.com / admin123!");
  console.log("  Driver:  kumara@peacockdrivers.com / driver123!");
  console.log("  Tourist: xyz@example.com / tourist123!");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
