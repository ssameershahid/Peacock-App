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

  const tours = [
    {
      slug: "classic-sri-lanka",
      name: "Classic Sri Lanka",
      tagline: "The perfect introduction to the island's highlights.",
      description:
        "Discover the very best of Sri Lanka on this comprehensive 10-day journey. From the ancient cities of the Cultural Triangle to the misty tea plantations of the Hill Country and the golden beaches of the south coast.",
      durationDays: 10,
      durationNights: 9,
      highlights: [
        "Sigiriya Rock Fortress",
        "Temple of the Tooth",
        "Tea plantation visit",
        "Yala National Park safari",
        "Galle Fort",
        "Nine Arches Bridge",
      ],
      regions: ["Cultural Triangle", "Hill Country", "South Coast"],
      difficulty: "Easy",
      heroImages: [
        "https://images.unsplash.com/photo-1586523969032-b4d0db38124f?w=800&q=80",
        "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800&q=80",
      ],
      bestMonths: [1, 2, 3, 11, 12],
      whatsIncluded: [
        "Private vehicle & driver for 10 days",
        "All fuel & tolls",
        "Driver accommodation & meals",
        "Airport pickup & drop-off",
        "Bottled water daily",
      ],
      whatsNotIncluded: [
        "Hotel accommodation",
        "Meals for travellers",
        "Entrance fees to sites",
        "Tips for driver",
        "Travel insurance",
      ],
      minLeadTimeDays: 3,
      maxExtraDays: 3,
      sortOrder: 1,
    },
    {
      slug: "hill-country-escape",
      name: "Hill Country Escape",
      tagline: "Tea, trains and breathtaking scenery.",
      description:
        "Journey deep into Sri Lanka's verdant highlands on this 7-day escape. Wind through emerald tea plantations, ride the legendary train from Ella to Kandy, and discover colonial-era towns nestled in misty mountains.",
      durationDays: 7,
      durationNights: 6,
      highlights: [
        "Nuwara Eliya tea country",
        "Ella–Kandy scenic train",
        "Nine Arches Bridge",
        "Adam's Peak sunrise",
        "Gregory Lake",
      ],
      regions: ["Hill Country", "Kandy"],
      difficulty: "Moderate",
      heroImages: [
        "https://images.unsplash.com/photo-1567157577867-05ccb1388e13?w=800&q=80",
      ],
      bestMonths: [1, 2, 3, 4, 11, 12],
      whatsIncluded: [
        "Private vehicle & driver for 7 days",
        "All fuel & tolls",
        "Driver accommodation & meals",
      ],
      whatsNotIncluded: [
        "Hotel accommodation",
        "Meals for travellers",
        "Train tickets",
        "Entrance fees",
      ],
      minLeadTimeDays: 5,
      maxExtraDays: 2,
      sortOrder: 2,
    },
    {
      slug: "south-coast-beach",
      name: "South Coast & Beaches",
      tagline: "Sun, surf and colonial charm.",
      description:
        "Explore Sri Lanka's stunning southern coastline over 6 days. From the historic Dutch fort of Galle to the surf beaches of Arugam Bay, discover golden sands, colourful coral reefs, and some of the best seafood on the island.",
      durationDays: 6,
      durationNights: 5,
      highlights: [
        "Galle Fort (UNESCO)",
        "Mirissa whale watching",
        "Unawatuna Beach",
        "Stilt fishermen at sunset",
        "Turtle hatchery visit",
      ],
      regions: ["South Coast", "Galle"],
      difficulty: "Easy",
      heroImages: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      ],
      bestMonths: [11, 12, 1, 2, 3, 4],
      whatsIncluded: [
        "Private vehicle & driver for 6 days",
        "All fuel & tolls",
        "Driver accommodation & meals",
      ],
      whatsNotIncluded: ["Hotels", "Meals", "Whale watching boat fees", "Entry fees"],
      minLeadTimeDays: 3,
      maxExtraDays: 4,
      sortOrder: 3,
    },
    {
      slug: "wildlife-safari",
      name: "Wildlife & Safari",
      tagline: "Encounter leopards, elephants and rare birds.",
      description:
        "A 5-day safari adventure exploring Sri Lanka's finest national parks. Track leopards in Yala, witness the elephant gathering at Minneriya, and spot endemic birds in Sinharaja rainforest.",
      durationDays: 5,
      durationNights: 4,
      highlights: [
        "Yala leopard safari",
        "Minneriya elephant gathering",
        "Sinharaja rainforest",
        "Bundala flamingos",
      ],
      regions: ["South Coast", "Cultural Triangle"],
      difficulty: "Moderate",
      heroImages: [
        "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80",
      ],
      bestMonths: [6, 7, 8, 9, 10],
      whatsIncluded: [
        "Private vehicle & driver",
        "All fuel & tolls",
        "Driver accommodation & meals",
      ],
      whatsNotIncluded: ["Safari jeep fees", "Park entrance fees", "Hotels", "Meals"],
      minLeadTimeDays: 7,
      maxExtraDays: 2,
      sortOrder: 4,
    },
  ];

  const vehicleRatesByTour: Record<
    string,
    Record<string, number>
  > = {
    "classic-sri-lanka": {
      car: 45,
      minivan: 65,
      "large-van": 85,
      "small-bus": 120,
      "medium-bus": 175,
    },
    "hill-country-escape": {
      car: 45,
      minivan: 65,
      "large-van": 85,
      "small-bus": 120,
      "medium-bus": 175,
    },
    "south-coast-beach": {
      car: 45,
      minivan: 65,
      "large-van": 85,
      "small-bus": 120,
      "medium-bus": 175,
    },
    "wildlife-safari": {
      car: 50,
      minivan: 70,
      "large-van": 90,
      "small-bus": 130,
      "medium-bus": 185,
    },
  };

  for (const tourData of tours) {
    const [tour] = await db
      .insert(toursTable)
      .values(tourData)
      .onConflictDoNothing()
      .returning();

    if (!tour) continue;

    const rates = vehicleRatesByTour[tour.slug] || {};
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

    // Basic itinerary for Classic Sri Lanka
    if (tour.slug === "classic-sri-lanka") {
      await db
        .insert(itineraryDaysTable)
        .values([
          {
            tourId: tour.id,
            dayNumber: 1,
            title: "Airport to Negombo",
            location: "Negombo",
            lat: 7.2096,
            lng: 79.8378,
            description:
              "Your driver meets you at Bandaranaike International Airport and transfers you to your beachside hotel in Negombo.",
            drivingTime: "30 minutes",
            keyStops: ["Bandaranaike Airport", "Negombo Beach"],
          },
          {
            tourId: tour.id,
            dayNumber: 2,
            title: "Negombo to Anuradhapura",
            location: "Anuradhapura",
            lat: 8.3114,
            lng: 80.4037,
            description:
              "Journey north to the ancient capital of Anuradhapura, a UNESCO World Heritage Site.",
            drivingTime: "4 hours",
            keyStops: ["Sri Maha Bodhi", "Ruwanwelisaya Dagoba"],
          },
          {
            tourId: tour.id,
            dayNumber: 3,
            title: "Anuradhapura to Sigiriya",
            location: "Sigiriya",
            lat: 7.9573,
            lng: 80.7601,
            description:
              "Climb the iconic Lion Rock fortress, a 5th-century palace perched atop a 200-metre rock column.",
            drivingTime: "2 hours",
            keyStops: ["Sigiriya Rock Fortress", "Dambulla Cave Temple"],
          },
          {
            tourId: tour.id,
            dayNumber: 4,
            title: "Sigiriya to Kandy",
            location: "Kandy",
            lat: 7.2906,
            lng: 80.6337,
            description:
              "Wind through the lush countryside to Kandy, Sri Lanka's cultural capital.",
            drivingTime: "3 hours",
            keyStops: ["Temple of the Tooth", "Kandy Lake"],
          },
          {
            tourId: tour.id,
            dayNumber: 5,
            title: "Kandy to Nuwara Eliya",
            location: "Nuwara Eliya",
            lat: 6.9497,
            lng: 80.7891,
            description:
              "Drive into the misty highlands past emerald tea plantations. Visit a working tea factory.",
            drivingTime: "2.5 hours",
            keyStops: ["Tea Factory", "Gregory Lake"],
          },
          {
            tourId: tour.id,
            dayNumber: 6,
            title: "Nuwara Eliya to Ella",
            location: "Ella",
            lat: 6.8667,
            lng: 81.0467,
            description:
              "One of the most scenic drives in Sri Lanka. Stop at the famous Nine Arches Bridge.",
            drivingTime: "2 hours",
            keyStops: ["Nine Arches Bridge", "Ravana Falls"],
          },
          {
            tourId: tour.id,
            dayNumber: 7,
            title: "Ella to Yala",
            location: "Yala",
            lat: 6.3529,
            lng: 81.5236,
            description:
              "Descend from the highlands to Yala, home to the highest density of leopards in the world.",
            drivingTime: "3 hours",
            keyStops: ["Yala National Park Safari"],
          },
          {
            tourId: tour.id,
            dayNumber: 8,
            title: "Yala to Mirissa",
            location: "Mirissa",
            lat: 5.9474,
            lng: 80.459,
            description:
              "Continue along the south coast to the gorgeous beach town of Mirissa.",
            drivingTime: "1.5 hours",
            keyStops: ["Mirissa Beach", "Stilt Fishermen"],
          },
          {
            tourId: tour.id,
            dayNumber: 9,
            title: "Mirissa to Galle",
            location: "Galle",
            lat: 6.0535,
            lng: 80.221,
            description:
              "Visit the UNESCO-listed Dutch fort of Galle, filled with colonial architecture and boutique shops.",
            drivingTime: "45 minutes",
            keyStops: ["Galle Fort", "Dutch Reformed Church", "Lighthouse"],
          },
          {
            tourId: tour.id,
            dayNumber: 10,
            title: "Galle to Colombo Airport",
            location: "Colombo",
            lat: 6.9271,
            lng: 79.8612,
            description:
              "Final drive back to Colombo for your departure flight.",
            drivingTime: "2 hours",
            keyStops: ["Colombo City", "Bandaranaike Airport"],
          },
        ])
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
  const beachTour = allTours.find((t) => t.slug === "south-coast-beach");
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
