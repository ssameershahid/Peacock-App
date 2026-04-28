/**
 * Wipe all tour data and reseed with the 6 current tour groups.
 * Run: pnpm --filter @workspace/db tsx src/seed-tours.ts
 */

import { db } from "./index.js";
import { sql } from "drizzle-orm";
import {
  toursTable,
  tourVehicleRatesTable,
  itineraryDaysTable,
  tourAddOnsTable,
  seasonalPricingTable,
} from "./schema/index.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const VR = (car: number, minivan: number, largeVan: number, smallBus: number, mediumBus: number) =>
  [
    { vehicleType: "car",         pricePerDay: car },
    { vehicleType: "minivan",     pricePerDay: minivan },
    { vehicleType: "large-van",   pricePerDay: largeVan },
    { vehicleType: "small-bus",   pricePerDay: smallBus },
    { vehicleType: "medium-bus",  pricePerDay: mediumBus },
  ];

const INCLUDED  = ["Private vehicle & driver", "All fuel & tolls", "Driver accommodation & meals", "Airport pickup & drop-off"];
const EXCLUDED  = ["Hotel accommodation", "Meals for travellers", "Entrance fees to sites", "Tips for driver", "Travel insurance"];

const ADD_ONS = [
  { name: "Airport Pickup",  description: "Meet & greet at Bandaranaike International Airport", priceGBP: 28 },
  { name: "Welcome Pack",    description: "Local SIM card, bottled water, snacks & guidebook",  priceGBP: 15 },
];

// ── Tour groups ───────────────────────────────────────────────────────────────

const TOUR_GROUPS = [
  // ── 1. Classic Sri Lanka ──────────────────────────────────────────────────
  {
    groupSlug: "classic-sri-lanka",
    name: "Classic Sri Lanka",
    tagline: "Sri Lanka's bucket list — culture, beaches, wildlife, scenery & food.",
    description: "The definitive Sri Lanka journey. Ancient rock fortresses, misty tea estates, golden southern beaches, wildlife safaris and legendary food — all with your own private driver.",
    regions: ["Cultural Triangle", "Hill Country", "South Coast"],
    difficulty: "Easy",
    heroImages: ["https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f0213d520997a1cb7d8db1_Sigiriya.png"],
    highlights: ["Culture", "Wildlife", "Hill Country", "Beaches", "Food"],
    sortOrder: 1,
    variants: [
      {
        slug: "classic-sri-lanka-5d", durationDays: 5, durationNights: 4,
        rates: VR(55, 75, 100, 140, 195),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Sigiriya/Dambulla",                    location: "Sigiriya",     description: "Drive from Colombo to the Cultural Triangle. Evening village experience and relaxation.",                                                              keyStops: ["Colombo", "Cultural Triangle", "Village experience"] },
          { dayNumber: 2, title: "Sigiriya",                                        location: "Sigiriya",     description: "Early morning climb of Sigiriya Rock Fortress. Afternoon safari in Minneriya National Park.",                                                        keyStops: ["Sigiriya Rock Fortress", "Minneriya National Park"] },
          { dayNumber: 3, title: "Sigiriya → Kandy",                               location: "Kandy",        description: "Visit Dambulla Cave Temple en route. Drive to Kandy. Evening: Temple of the Tooth Relic.",                                                           keyStops: ["Dambulla Cave Temple", "Temple of the Tooth Relic", "Kandy"] },
          { dayNumber: 4, title: "Kandy/Hill Country → Ella",                      location: "Ella",         description: "Scenic train journey from Kandy to Ella (*check availability). Visit Nine Arches Bridge on arrival.",                                                 keyStops: ["Kandy to Ella scenic train (*check availability)", "Nine Arches Bridge"] },
          { dayNumber: 5, title: "Ella → South Coast → Colombo",                   location: "Colombo",      description: "Drive to the south coast (Bentota/Mirissa) with an optional quick beach stop before returning to Colombo / airport.",                                keyStops: ["South Coast (Bentota/Mirissa)", "Optional beach stop", "Colombo / airport"] },
        ],
      },
      {
        slug: "classic-sri-lanka-7d", durationDays: 7, durationNights: 6,
        rates: VR(55, 75, 100, 140, 195),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Sigiriya/Dambulla",                    location: "Sigiriya",      description: "Drive from Colombo to the Cultural Triangle. Evening village experience and relaxation.",                                                              keyStops: ["Colombo", "Cultural Triangle", "Village experience"] },
          { dayNumber: 2, title: "Sigiriya",                                        location: "Sigiriya",      description: "Climb Sigiriya Rock Fortress. Afternoon safari in Minneriya National Park.",                                                                         keyStops: ["Sigiriya Rock Fortress", "Minneriya National Park safari"] },
          { dayNumber: 3, title: "Sigiriya → Kandy",                               location: "Kandy",         description: "Visit Dambulla Cave Temple. Continue to Kandy: Temple of the Tooth, Royal Botanic Gardens, traditional cultural dance show.",                        keyStops: ["Dambulla Cave Temple", "Temple of the Tooth", "Royal Botanic Gardens Peradeniya", "Cultural dance show"] },
          { dayNumber: 4, title: "Kandy → Nuwara Eliya",                           location: "Nuwara Eliya",  description: "Drive into the hill country. Visit tea plantations and a tea factory. Enjoy the cooler climate of Nuwara Eliya.",                                    keyStops: ["Tea plantations", "Tea factory visit", "Nuwara Eliya"] },
          { dayNumber: 5, title: "Nuwara Eliya → Ella",                            location: "Ella",          description: "Scenic Kandy to Ella train journey (*check availability). Visit Nine Arches Bridge. Hike Little Adam's Peak.",                                       keyStops: ["Kandy to Ella scenic train (*check availability)", "Nine Arches Bridge", "Little Adam's Peak hike"] },
          { dayNumber: 6, title: "Ella → South Coast (Mirissa/Bentota)",           location: "South Coast",   description: "Drive to the south coast for beach relaxation. Optional whale watching excursion in Mirissa (seasonal).",                                            keyStops: ["South Coast (Mirissa/Bentota)", "Beach relaxation", "Whale watching Mirissa (seasonal)"] },
          { dayNumber: 7, title: "South Coast → Colombo",                          location: "Colombo",       description: "Return to Colombo with optional stops to explore other beaches along the way.",                                                                      keyStops: ["Optional beach stops en route", "Colombo / airport"] },
        ],
      },
      {
        slug: "classic-sri-lanka-10d", durationDays: 10, durationNights: 9,
        rates: VR(55, 75, 100, 140, 195),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Sigiriya/Dambulla",                   location: "Sigiriya",      description: "Drive from Colombo to the Cultural Triangle. Evening village experience and relaxation.",                                                              keyStops: ["Colombo", "Cultural Triangle", "Village experience"] },
          { dayNumber: 2,  title: "Sigiriya",                                       location: "Sigiriya",      description: "Climb Sigiriya Rock Fortress. Afternoon safari in Minneriya National Park.",                                                                         keyStops: ["Sigiriya Rock Fortress", "Minneriya National Park safari"] },
          { dayNumber: 3,  title: "Sigiriya → Polonnaruwa → Kandy",                location: "Kandy",         description: "Visit the ancient city of Polonnaruwa before continuing to Kandy.",                                                                                  keyStops: ["Polonnaruwa Ancient City", "Kandy"] },
          { dayNumber: 4,  title: "Kandy",                                          location: "Kandy",         description: "Explore Kandy: visit the Temple of the Tooth, walk around the lake, and enjoy the Royal Botanic Gardens.",                                           keyStops: ["Temple of the Tooth", "Kandy Lake walk", "Royal Botanic Gardens"] },
          { dayNumber: 5,  title: "Kandy → Nuwara Eliya",                          location: "Nuwara Eliya",  description: "Immerse in tea country. Visit Gregory Lake for boat rides and walks.",                                                                               keyStops: ["Tea country immersion", "Tea plantations & factory", "Gregory Lake"] },
          { dayNumber: 6,  title: "Nuwara Eliya → Ella",                           location: "Ella",          description: "Scenic Kandy to Ella train (*check availability). Visit Nine Arches Bridge.",                                                                        keyStops: ["Kandy to Ella scenic train (*check availability)", "Nine Arches Bridge"] },
          { dayNumber: 7,  title: "Ella",                                           location: "Ella",          description: "Hike Little Adam's Peak and explore Ella's beautiful waterfalls.",                                                                                   keyStops: ["Little Adam's Peak hike", "Ella waterfalls"] },
          { dayNumber: 8,  title: "Ella → Udawalawe → South Coast",                location: "South Coast",   description: "Safari at Udawalawe National Park, then continue to the south coast.",                                                                              keyStops: ["Udawalawe National Park safari", "South Coast"] },
          { dayNumber: 9,  title: "South Coast (Beach Day)",                       location: "South Coast",   description: "Relax and/or visit other beaches. Whale watching (seasonal). Surfing.",                                                                              keyStops: ["Beach relaxation", "Whale watching (seasonal)", "Surfing"] },
          { dayNumber: 10, title: "South Coast → Colombo",                         location: "Colombo",       description: "Return to Colombo with optional stops along the way.",                                                                                              keyStops: ["Optional stops en route", "Colombo / airport"] },
        ],
      },
      {
        slug: "classic-sri-lanka-14d", durationDays: 14, durationNights: 13,
        rates: VR(55, 75, 100, 140, 195),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Sigiriya",                            location: "Sigiriya",      description: "Drive from Colombo to the Cultural Triangle.",                                                                                                      keyStops: ["Colombo", "Cultural Triangle"] },
          { dayNumber: 2,  title: "Sigiriya",                                       location: "Sigiriya",      description: "Climb Sigiriya Rock Fortress and Pidurangala Rock. Visit Dambulla Cave Temple.",                                                                    keyStops: ["Sigiriya Rock Fortress", "Pidurangala Rock", "Dambulla Cave Temple"] },
          { dayNumber: 3,  title: "Sigiriya (Polonnaruwa)",                        location: "Sigiriya",      description: "Visit Polonnaruwa Ancient City. Afternoon safari in Minneriya National Park.",                                                                       keyStops: ["Polonnaruwa Ancient City", "Minneriya National Park safari"] },
          { dayNumber: 4,  title: "Sigiriya → Kandy",                              location: "Kandy",         description: "Visit Dambulla Cave Temple, then drive to Kandy. Enjoy the lake walk and Royal Botanic Gardens.",                                                    keyStops: ["Dambulla Cave Temple", "Kandy Lake walk", "Royal Botanic Gardens"] },
          { dayNumber: 5,  title: "Kandy",                                          location: "Kandy",         description: "Visit the Temple of the Tooth and hike to Bahirawakanda Buddha Statue.",                                                                             keyStops: ["Temple of the Tooth", "Bahirawakanda Buddha Statue hike", "Udawattakele Sanctuary (bird watching)"] },
          { dayNumber: 6,  title: "Kandy → Nuwara Eliya",                          location: "Nuwara Eliya",  description: "Stop at Ramboda Waterfall. Visit tea plantations and a tea factory. Hike Horton Plains (World's End & Baker's Falls). Relax at Gregory Lake.",     keyStops: ["Ramboda Waterfall", "Tea plantations & factory", "Horton Plains — World's End & Baker's Falls", "Gregory Lake"] },
          { dayNumber: 7,  title: "Nuwara Eliya",                                  location: "Nuwara Eliya",  description: "Visit Seeta Amman Kovil and explore Hakgala Botanical Garden.",                                                                                     keyStops: ["Seeta Amman Kovil", "Hakgala Botanical Garden"] },
          { dayNumber: 8,  title: "Nuwara Eliya → Ella",                           location: "Ella",          description: "Scenic Kandy to Ella train (*check availability). Visit Nine Arches Bridge.",                                                                        keyStops: ["Kandy to Ella scenic train (*check availability)", "Nine Arches Bridge"] },
          { dayNumber: 9,  title: "Ella",                                           location: "Ella",          description: "Hike Little Adam's Peak and explore Ella's beautiful waterfalls.",                                                                                   keyStops: ["Little Adam's Peak hike", "Ella waterfalls"] },
          { dayNumber: 10, title: "Ella → Yala",                                   location: "Yala",          description: "Drive to Yala National Park / Tissamaharama.",                                                                                                      keyStops: ["Yala National Park", "Tissamaharama"] },
          { dayNumber: 11, title: "Yala → South Coast (Mirissa/Unawatuna/Bentota)", location: "South Coast",  description: "Leisurely morning at Yala, then drive to the south coast.",                                                                                         keyStops: ["Yala morning", "South Coast (Mirissa/Unawatuna/Bentota)"] },
          { dayNumber: 12, title: "South Coast (Beach Day)",                       location: "South Coast",   description: "Visit Galle Fort. Surfing. Relax and/or visit other beaches. Whale watching (seasonal).",                                                            keyStops: ["Galle Fort", "Surfing", "Whale watching (seasonal)"] },
          { dayNumber: 13, title: "South Coast (Beach Day)",                       location: "South Coast",   description: "Relax and/or visit other beaches. Turtle watching (seasonal).",                                                                                      keyStops: ["Beach relaxation", "Turtle watching (seasonal — Rekawa Beach, Kosgoda, Mirissa, Bentota)"] },
          { dayNumber: 14, title: "South Coast → Colombo",                         location: "Colombo",       description: "Return to Colombo with optional stops along the way.",                                                                                              keyStops: ["Optional stops en route", "Colombo / airport"] },
        ],
      },
    ],
  },

  // ── 2. North & East Sri Lanka ─────────────────────────────────────────────
  {
    groupSlug: "north-east-sri-lanka",
    name: "North & East Sri Lanka",
    tagline: "Jaffna & Trinco, Nilaveli, Arugam Bay — culture & scenery.",
    description: "Venture off the beaten path to Sri Lanka's untouched north and east — Tamil culture in Jaffna, pristine beaches in Trincomalee and Nilaveli, and the world-famous surf of Arugam Bay.",
    regions: ["North Sri Lanka", "East Coast"],
    difficulty: "Moderate",
    heroImages: ["https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f022e3d67ac0f302daa5f2_Jaffna.png"],
    highlights: ["Untouched Beaches", "Tamil Culture", "Off-the-Beaten-Path"],
    sortOrder: 2,
    variants: [
      {
        slug: "north-east-sri-lanka-5d", durationDays: 5, durationNights: 4,
        rates: VR(50, 70, 92, 128, 178),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Jaffna",                               location: "Jaffna",                description: "Early departure, scenic drive north. Explore Jaffna city on arrival.",                                                                          keyStops: ["Colombo", "Jaffna city"] },
          { dayNumber: 2, title: "Jaffna",                                          location: "Jaffna",                description: "Visit Nallur Kandaswamy Temple and Jaffna Fort. Experience authentic north Sri Lankan cuisine.",                                               keyStops: ["Nallur Kandaswamy Temple", "Jaffna Fort", "North cuisine experience"] },
          { dayNumber: 3, title: "Jaffna → Trincomalee / Nilaveli",                location: "Nilaveli / Trincomalee", description: "Travel to the east coast. Relax on Nilaveli Beach.",                                                                                        keyStops: ["Nilaveli Beach", "Trincomalee"] },
          { dayNumber: 4, title: "Trincomalee (Beaches & Culture)",                 location: "Trincomalee",           description: "Visit Koneswaram Temple. Optional snorkelling near Pigeon Island. Whale watching at Swami Rock.",                                             keyStops: ["Koneswaram Temple", "Pigeon Island snorkelling (optional)", "Whale watching — Swami Rock"] },
          { dayNumber: 5, title: "Trincomalee → Colombo",                           location: "Colombo",               description: "Return to Colombo / airport.",                                                                                                              keyStops: ["Colombo / airport"] },
        ],
      },
      {
        slug: "north-east-sri-lanka-7d", durationDays: 7, durationNights: 6,
        rates: VR(50, 70, 92, 128, 178),
        itinerary: [
          { dayNumber: 1, title: "CMB → Anuradhapura → Jaffna",                    location: "Jaffna",                description: "Drive north with an optional stop at the ancient city of Anuradhapura before continuing to Jaffna.",                                            keyStops: ["Anuradhapura (optional stop)", "Jaffna"] },
          { dayNumber: 2, title: "Jaffna",                                          location: "Jaffna",                description: "Nallur Kandaswamy Temple, Fort & Delft/Nainativu islands. Explore local markets and sample north cuisine.",                                    keyStops: ["Nallur Kandaswamy Temple", "Fort & Delft/Nainativu islands", "Local markets & north cuisine"] },
          { dayNumber: 3, title: "Jaffna → Trincomalee",                           location: "Nilaveli / Trincomalee", description: "Travel along the scenic northeast coast. Relax on Nilaveli or another beach.",                                                               keyStops: ["Scenic northeast drive", "Nilaveli/other beach"] },
          { dayNumber: 4, title: "Trincomalee (Beaches & Culture)",                 location: "Trincomalee",           description: "Visit Koneswaram Temple. Snorkelling excursion. Whale watching at Swami Rock.",                                                               keyStops: ["Koneswaram Temple", "Snorkelling excursion", "Whale watching — Swami Rock"] },
          { dayNumber: 5, title: "Trincomalee → Pasikudah",                        location: "Pasikudah",             description: "Drive to Pasikudah. Beach activities. Visit Batticaloa Fort / Kallady Bridge.",                                                               keyStops: ["Beach activities", "Batticaloa Fort", "Kallady Bridge"] },
          { dayNumber: 6, title: "Pasikudah (Beach Day)",                           location: "Pasikudah",             description: "Relax on the beach or try surfing. Visit the quieter Kalkudah beach.",                                                                        keyStops: ["Pasikudah beach", "Kalkudah beach", "Batticaloa Fort / Kallady Bridge (optional)"] },
          { dayNumber: 7, title: "Pasikudah → Colombo",                             location: "Colombo",               description: "Return to Colombo with optional stops en route. Transfer to airport or continue with other travel.",                                            keyStops: ["Optional stops en route", "Colombo / airport"] },
        ],
      },
      {
        slug: "north-east-sri-lanka-10d", durationDays: 10, durationNights: 9,
        rates: VR(50, 70, 92, 128, 178),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Anuradhapura",                        location: "Anuradhapura",          description: "Travel north to Anuradhapura.",                                                                                                             keyStops: ["Anuradhapura"] },
          { dayNumber: 2,  title: "Anuradhapura → Jaffna",                         location: "Jaffna",                description: "Explore the ancient ruins of Anuradhapura before continuing to Jaffna.",                                                                      keyStops: ["Anuradhapura ancient ruins", "Jaffna"] },
          { dayNumber: 3,  title: "Jaffna",                                         location: "Jaffna",                description: "Nallur Kandaswamy Temple, Fort & Delft/Nainativu islands. Local markets and north cuisine.",                                                  keyStops: ["Nallur Kandaswamy Temple", "Fort & Delft/Nainativu islands", "Local markets & north cuisine"] },
          { dayNumber: 4,  title: "Jaffna → Trincomalee",                          location: "Nilaveli / Trincomalee", description: "Travel along the scenic northeast. Relax on Nilaveli or another beach.",                                                                     keyStops: ["Scenic northeast drive", "Nilaveli/other beach"] },
          { dayNumber: 5,  title: "Trincomalee (Beaches & Culture)",                location: "Trincomalee",           description: "Koneswaram Temple and snorkelling. Whale watching at Swami Rock.",                                                                           keyStops: ["Koneswaram Temple", "Snorkelling", "Whale watching — Swami Rock"] },
          { dayNumber: 6,  title: "Nilaveli (Beach & Marine Activities)",           location: "Nilaveli / Trincomalee", description: "Relax on Nilaveli beach. Visit Pigeon Island Marine Park for snorkelling / diving.",                                                        keyStops: ["Nilaveli beach", "Pigeon Island Marine Park", "Snorkelling / diving"] },
          { dayNumber: 7,  title: "Trincomalee → Pasikudah",                       location: "Pasikudah",             description: "Beach activities. Visit Batticaloa Fort / Kallady Bridge.",                                                                                   keyStops: ["Beach activities", "Batticaloa Fort", "Kallady Bridge"] },
          { dayNumber: 8,  title: "Pasikudah → Arugam Bay (Leisure/Surfing)",      location: "Arugam Bay",            description: "Relax on the beach or try surfing in Arugam Bay.",                                                                                           keyStops: ["Arugam Bay beach", "Surfing"] },
          { dayNumber: 9,  title: "Arugam Bay → Colombo (via Ella or Yala — optional)", location: "Colombo",          description: "Return to Colombo with optional scenic or wildlife stops via Ella or Yala.",                                                                  keyStops: ["Ella (optional)", "Yala (optional)", "Colombo"] },
          { dayNumber: 10, title: "Colombo",                                        location: "Colombo",               description: "Transfer to airport or continue with other travel.",                                                                                          keyStops: ["Colombo / airport"] },
        ],
      },
      {
        slug: "north-east-sri-lanka-14d", durationDays: 14, durationNights: 13,
        rates: VR(50, 70, 92, 128, 178),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Anuradhapura",                        location: "Anuradhapura",          description: "Travel north to Anuradhapura.",                                                                                                             keyStops: ["Anuradhapura"] },
          { dayNumber: 2,  title: "Anuradhapura",                                   location: "Anuradhapura",          description: "Full day exploring the sacred ancient sites of Anuradhapura.",                                                                               keyStops: ["Anuradhapura sacred sites"] },
          { dayNumber: 3,  title: "Anuradhapura → Jaffna",                         location: "Jaffna",                description: "Explore en route to Jaffna.",                                                                                                               keyStops: ["En route stops", "Jaffna"] },
          { dayNumber: 4,  title: "Jaffna",                                         location: "Jaffna",                description: "Nallur Kandaswamy Temple, local markets and north cuisine, Jaffna Fort.",                                                                    keyStops: ["Nallur Kandaswamy Temple", "Local markets & north cuisine", "Jaffna Fort"] },
          { dayNumber: 5,  title: "Jaffna Islands Experience",                     location: "Jaffna",                description: "Private boat excursion to Delft & Nainativu islands.",                                                                                       keyStops: ["Delft Island", "Nainativu Island", "Private boat excursion"] },
          { dayNumber: 6,  title: "Jaffna → Trincomalee",                          location: "Nilaveli / Trincomalee", description: "Travel along the scenic northeast coast. Relax on Nilaveli or another beach.",                                                               keyStops: ["Scenic northeast drive", "Nilaveli/other beach"] },
          { dayNumber: 7,  title: "Trincomalee (Beaches & Culture)",                location: "Trincomalee",           description: "Visit Koneswaram Temple. Snorkelling. Whale watching at Swami Rock.",                                                                       keyStops: ["Koneswaram Temple", "Snorkelling", "Whale watching — Swami Rock"] },
          { dayNumber: 8,  title: "Nilaveli/Uppuveli (Beach Day)",                 location: "Nilaveli / Uppuveli",   description: "Relax on Nilaveli beach and/or explore Uppuveli and surrounding beaches.",                                                                    keyStops: ["Nilaveli beach", "Uppuveli beach", "Surrounding beaches"] },
          { dayNumber: 9,  title: "Trincomalee",                                    location: "Trincomalee",           description: "Visit Fort Frederick (Deer Fort). Kanniya Hot Springs. Red-Sand Beach (Arisimale).",                                                          keyStops: ["Fort Frederick (Deer Fort)", "Kanniya Hot Springs", "Red-Sand Beach Arisimale"] },
          { dayNumber: 10, title: "Trincomalee → Pasikudah",                       location: "Pasikudah",             description: "Beach activities and visit Batticaloa Fort.",                                                                                                 keyStops: ["Batticaloa Fort", "Pasikudah beach"] },
          { dayNumber: 11, title: "Pasikudah → Arugam Bay (Leisure/Surfing)",      location: "Arugam Bay",            description: "Relax on the beach or try surfing in Arugam Bay.",                                                                                           keyStops: ["Arugam Bay beach", "Surfing"] },
          { dayNumber: 12, title: "Arugam Bay → Yala Safari",                      location: "Yala",                  description: "Safari in Yala National Park.",                                                                                                              keyStops: ["Yala National Park safari"] },
          { dayNumber: 13, title: "Yala → South Coast",                            location: "South Coast",           description: "Relax and/or visit other beaches on the south coast.",                                                                                       keyStops: ["South Coast beaches"] },
          { dayNumber: 14, title: "South Coast → Colombo",                         location: "Colombo",               description: "Return to Colombo with optional stops along the way.",                                                                                       keyStops: ["Optional stops en route", "Colombo / airport"] },
        ],
      },
    ],
  },

  // ── 3. Coast & Culture Sri Lanka ─────────────────────────────────────────
  {
    groupSlug: "coast-culture-sri-lanka",
    name: "Coast & Culture Sri Lanka",
    tagline: "Beach, surfing, whale watching & the cultural triangle.",
    description: "The best of both worlds — sun-drenched southern beaches, whale watching in Mirissa, wildlife safaris, Galle Fort and the magnificent cultural sites of the highlands.",
    regions: ["South Coast", "Hill Country", "Cultural Triangle"],
    difficulty: "Easy",
    heroImages: ["https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f0265c2e40cc16c7533e22_Ella.png"],
    highlights: ["Beaches", "Wildlife", "Cultural Highlights"],
    sortOrder: 3,
    variants: [
      {
        slug: "coast-culture-sri-lanka-5d", durationDays: 5, durationNights: 4,
        rates: VR(50, 70, 92, 128, 178),
        itinerary: [
          { dayNumber: 1, title: "Colombo → South Coast (Mirissa/Bentota)",        location: "South Coast",   description: "Travel south and relax by the ocean.",                                                                                                              keyStops: ["South Coast (Mirissa/Bentota)"] },
          { dayNumber: 2, title: "Mirissa: Beach & Whale Watching",                 location: "South Coast",   description: "Whale watching excursion in Mirissa (November–April seasonal).",                                                                                   keyStops: ["Whale watching Mirissa (Nov–Apr)", "Mirissa beach"] },
          { dayNumber: 3, title: "South Coast → Galle → Udawalawe",               location: "Udawalawe / Tissamaharama", description: "Visit Galle Fort. Afternoon safari in Udawalawe National Park.",                                                              keyStops: ["Galle Fort", "Udawalawe National Park safari"] },
          { dayNumber: 4, title: "Udawalawe → Kandy",                              location: "Kandy",         description: "Scenic journey to Kandy. Evening visit to Temple of the Tooth.",                                                                                    keyStops: ["Scenic drive to Kandy", "Temple of the Tooth"] },
          { dayNumber: 5, title: "Kandy → Colombo",                                location: "Colombo",       description: "Return to Colombo / airport.",                                                                                                                      keyStops: ["Colombo / airport"] },
        ],
      },
      {
        slug: "coast-culture-sri-lanka-7d", durationDays: 7, durationNights: 6,
        rates: VR(50, 70, 92, 128, 178),
        itinerary: [
          { dayNumber: 1, title: "Colombo → South Coast",                          location: "South Coast",   description: "Travel south and visit beaches.",                                                                                                                   keyStops: ["South Coast beaches"] },
          { dayNumber: 2, title: "Mirissa: Beach & Whale Watching",                 location: "South Coast",   description: "Whale watching in Mirissa. Beach activities.",                                                                                                     keyStops: ["Whale watching — Mirissa", "Beach activities"] },
          { dayNumber: 3, title: "Galle & Coastal Exploration",                    location: "South Coast",   description: "Visit Galle Fort and explore nearby beaches.",                                                                                                      keyStops: ["Galle Fort", "Nearby beaches"] },
          { dayNumber: 4, title: "South Coast → Udawalawe",                        location: "Udawalawe",     description: "Travel inland for a safari in Udawalawe National Park.",                                                                                            keyStops: ["Udawalawe National Park safari"] },
          { dayNumber: 5, title: "Udawalawe → Ella",                               location: "Ella",          description: "Journey to Ella via scenic mountain roads. Visit Nine Arches Bridge.",                                                                              keyStops: ["Scenic mountain road", "Nine Arches Bridge", "Ella"] },
          { dayNumber: 6, title: "Ella → Kandy",                                   location: "Kandy",         description: "Ella to Kandy train (*check availability). Visit Temple of the Tooth.",                                                                             keyStops: ["Ella to Kandy train (*check availability)", "Temple of the Tooth"] },
          { dayNumber: 7, title: "Kandy → Colombo",                                location: "Colombo",       description: "Return to Colombo / airport.",                                                                                                                      keyStops: ["Colombo / airport"] },
        ],
      },
      {
        slug: "coast-culture-sri-lanka-10d", durationDays: 10, durationNights: 9,
        rates: VR(50, 70, 92, 128, 178),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → South Coast",                         location: "South Coast",   description: "Travel south and visit beaches.",                                                                                                                   keyStops: ["South Coast beaches"] },
          { dayNumber: 2,  title: "Mirissa: Beach & Whale Watching",                location: "South Coast",   description: "Whale watching in Mirissa. Beach activities.",                                                                                                     keyStops: ["Whale watching — Mirissa", "Beach activities"] },
          { dayNumber: 3,  title: "Galle & Coastal Exploration",                   location: "South Coast",   description: "Visit Galle Fort and explore nearby beaches.",                                                                                                      keyStops: ["Galle Fort", "Nearby beaches"] },
          { dayNumber: 4,  title: "South Coast → Udawalawe",                       location: "Udawalawe",     description: "Travel inland for a safari in Udawalawe National Park.",                                                                                            keyStops: ["Udawalawe National Park safari"] },
          { dayNumber: 5,  title: "Udawalawe → Ella",                              location: "Ella",          description: "Journey to Ella via scenic mountain roads. Explore around Ella.",                                                                                   keyStops: ["Scenic mountain road", "Ella exploration"] },
          { dayNumber: 6,  title: "Ella Exploration",                              location: "Ella",          description: "Visit Nine Arches Bridge and Little Adam's Peak.",                                                                                                  keyStops: ["Nine Arches Bridge", "Little Adam's Peak"] },
          { dayNumber: 7,  title: "Ella → Nuwara Eliya",                           location: "Nuwara Eliya",  description: "Scenic train journey into tea country (*check availability).",                                                                                      keyStops: ["Scenic train to Nuwara Eliya (*check availability)"] },
          { dayNumber: 8,  title: "Nuwara Eliya → Kandy",                          location: "Kandy",         description: "Explore tea plantations before continuing to Kandy.",                                                                                               keyStops: ["Tea plantations", "Kandy"] },
          { dayNumber: 9,  title: "Kandy Cultural Experience",                     location: "Kandy",         description: "Visit Temple of the Tooth.",                                                                                                                        keyStops: ["Temple of the Tooth"] },
          { dayNumber: 10, title: "Kandy → Colombo",                               location: "Colombo",       description: "Return to Colombo / airport.",                                                                                                                      keyStops: ["Colombo / airport"] },
        ],
      },
      {
        slug: "coast-culture-sri-lanka-14d", durationDays: 14, durationNights: 13,
        rates: VR(50, 70, 92, 128, 178),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → South Coast",                         location: "South Coast",   description: "Travel south and visit beaches.",                                                                                                                   keyStops: ["South Coast beaches"] },
          { dayNumber: 2,  title: "South Coast: Beach Relaxation",                 location: "South Coast",   description: "Full day relaxing by the ocean.",                                                                                                                   keyStops: ["South Coast beach relaxation"] },
          { dayNumber: 3,  title: "Mirissa: Beach & Whale Watching",                location: "South Coast",   description: "Whale watching in Mirissa. Beach activities.",                                                                                                     keyStops: ["Whale watching — Mirissa", "Beach activities"] },
          { dayNumber: 4,  title: "Galle & Coastal Exploration",                   location: "South Coast",   description: "Visit Galle Fort and explore nearby beaches.",                                                                                                      keyStops: ["Galle Fort", "Nearby beaches"] },
          { dayNumber: 5,  title: "South Coast → Yala Safari",                     location: "Yala",          description: "Travel to Yala National Park for a safari.",                                                                                                        keyStops: ["Yala National Park safari"] },
          { dayNumber: 6,  title: "Yala → Ella",                                   location: "Ella",          description: "Travel into the hill country.",                                                                                                                     keyStops: ["Hill country drive", "Ella"] },
          { dayNumber: 7,  title: "Ella Exploration",                              location: "Ella",          description: "Visit Nine Arches Bridge and Little Adam's Peak.",                                                                                                  keyStops: ["Nine Arches Bridge", "Little Adam's Peak"] },
          { dayNumber: 8,  title: "Ella → Nuwara Eliya",                           location: "Nuwara Eliya",  description: "Scenic train journey into tea country (*check availability).",                                                                                      keyStops: ["Scenic train to Nuwara Eliya (*check availability)"] },
          { dayNumber: 9,  title: "Nuwara Eliya Exploration",                      location: "Nuwara Eliya",  description: "Explore tea plantations.",                                                                                                                          keyStops: ["Tea plantations"] },
          { dayNumber: 10, title: "Nuwara Eliya → Kandy",                          location: "Kandy",         description: "Explore Kandy.",                                                                                                                                    keyStops: ["Kandy"] },
          { dayNumber: 11, title: "Kandy Cultural Experience",                     location: "Kandy",         description: "Visit Temple of the Tooth.",                                                                                                                        keyStops: ["Temple of the Tooth"] },
          { dayNumber: 12, title: "Kandy → Cultural Triangle (Sigiriya)",          location: "Sigiriya",      description: "Travel north with stops en route.",                                                                                                                  keyStops: ["En route stops", "Sigiriya"] },
          { dayNumber: 13, title: "Sigiriya & Safari",                             location: "South Coast",   description: "Climb Sigiriya Rock Fortress. Optional safari. Drive to south coast.",                                                                              keyStops: ["Sigiriya Rock Fortress", "Optional safari", "South Coast"] },
          { dayNumber: 14, title: "Sigiriya → Colombo",                            location: "Colombo",       description: "Return to Colombo with optional stops along the way.",                                                                                              keyStops: ["Optional stops en route", "Colombo / airport"] },
        ],
      },
    ],
  },

  // ── 4. Beach Life: South Coast ────────────────────────────────────────────
  {
    groupSlug: "beach-life-south-coast",
    name: "Beach Life: South Coast",
    tagline: "Just beaches, water-based activities and relaxation.",
    description: "Sun, surf and pure coastal bliss along Sri Lanka's stunning south coast — Bentota, Hikkaduwa, Mirissa, Galle, Weligama and Tangalle, all at your own pace.",
    regions: ["South Coast", "Galle"],
    difficulty: "Easy",
    heroImages: ["https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f02585fd5931666ef0ce1f_Galle%20(1).png"],
    highlights: ["Beach Vibes", "Relaxation", "Water Activities"],
    sortOrder: 4,
    variants: [
      {
        slug: "beach-life-south-coast-5d", durationDays: 5, durationNights: 4,
        rates: VR(45, 62, 82, 115, 160),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Bentota",                              location: "Bentota",       description: "Travel south, relax by the ocean. Boat safari on Madu Ganga River.",                                                                                 keyStops: ["Bentota", "Madu Ganga River boat safari"] },
          { dayNumber: 2, title: "Bentota/Hikkaduwa/Unawatuna — Beach Relaxation & Water Sports", location: "Bentota", description: "Beaches and optional water sports: jet ski, paddleboarding, snorkelling.",                                                 keyStops: ["Bentota / Hikkaduwa / Unawatuna beaches", "Jet ski", "Paddleboarding", "Snorkelling"] },
          { dayNumber: 3, title: "Galle/Mirissa & Surrounds — Beach Leisure & Whale Watching", location: "Mirissa", description: "Whale watching in Mirissa. Beach relaxation. Coconut Tree Hill for sunset.",                                                    keyStops: ["Whale watching — Mirissa", "Coconut Tree Hill sunset"] },
          { dayNumber: 4, title: "Galle & Coastal Exploration",                    location: "Mirissa",       description: "Explore Galle Fort. Relaxed coastal afternoon.",                                                                                                    keyStops: ["Galle Fort", "Coastal afternoon"] },
          { dayNumber: 5, title: "South Coast → Colombo",                          location: "Colombo",       description: "Return to Colombo / airport. Explore en route if time available.",                                                                                  keyStops: ["En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "beach-life-south-coast-7d", durationDays: 7, durationNights: 6,
        rates: VR(45, 62, 82, 115, 160),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Bentota",                              location: "Bentota",           description: "Travel south. Relax and/or boat safari.",                                                                                                        keyStops: ["Bentota", "Boat safari (optional)"] },
          { dayNumber: 2, title: "Unawatuna & Kosgoda — Beaches & Turtles",        location: "Bentota / Galle",   description: "Visit Turtle Conservation Project. Jungle Beach or other beaches.",                                                                             keyStops: ["Turtle Conservation Project", "Jungle Beach"] },
          { dayNumber: 3, title: "Mirissa",                                         location: "Galle / Mirissa",   description: "Whale watching in Mirissa. Beach activities.",                                                                                                  keyStops: ["Whale watching — Mirissa", "Beach activities"] },
          { dayNumber: 4, title: "Galle & Coastal Exploration",                    location: "Galle",             description: "Explore Galle Fort. Relaxed coastal afternoon.",                                                                                                 keyStops: ["Galle Fort", "Coastal afternoon"] },
          { dayNumber: 5, title: "Koggala & Weligama Bay",                         location: "Galle / Weligama",  description: "See stilt fishermen and turtle hatchery en route. Weligama — golden sand and surf.",                                                            keyStops: ["Stilt fishermen", "Turtle hatchery", "Weligama — golden sand & surf"] },
          { dayNumber: 6, title: "Tangalle Beach Relaxation",                      location: "Galle / Tangalle",  description: "Relax at Goyambokka or Silent Beach.",                                                                                                         keyStops: ["Goyambokka Beach", "Silent Beach"] },
          { dayNumber: 7, title: "South Coast → Colombo",                          location: "Colombo",           description: "Return to Colombo / airport. Explore en route if time.",                                                                                        keyStops: ["En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "beach-life-south-coast-10d", durationDays: 10, durationNights: 9,
        rates: VR(45, 62, 82, 115, 160),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Bentota",                             location: "Bentota",           description: "Travel south. Relax and/or boat safari.",                                                                                                        keyStops: ["Bentota", "Boat safari (optional)"] },
          { dayNumber: 2,  title: "Bentota Day & Surrounds",                       location: "Bentota",           description: "Beaches and water sports. Brief Garden. Mask museum / market stalls.",                                                                           keyStops: ["Beaches & water sports", "Brief Garden", "Mask museum / market stalls"] },
          { dayNumber: 3,  title: "Hikkaduwa/Unawatuna",                           location: "Bentota / Galle",   description: "Hikkaduwa National Park coral reef. Beach relaxation and/or exploration. Tsunami museum.",                                                       keyStops: ["Hikkaduwa National Park reef", "Tsunami museum"] },
          { dayNumber: 4,  title: "Unawatuna & Kosgoda",                           location: "Bentota / Galle",   description: "Turtle Conservation Project. Jungle Beach or other beaches.",                                                                                    keyStops: ["Turtle Conservation Project", "Jungle Beach"] },
          { dayNumber: 5,  title: "Mirissa",                                        location: "Galle / Mirissa",   description: "Whale watching in Mirissa. Beach activities.",                                                                                                  keyStops: ["Whale watching — Mirissa", "Beach activities"] },
          { dayNumber: 6,  title: "Galle & Coastal Exploration",                   location: "Galle",             description: "Explore Galle Fort. Relaxed coastal afternoon.",                                                                                                 keyStops: ["Galle Fort", "Coastal afternoon"] },
          { dayNumber: 7,  title: "Koggala & Dikwella",                            location: "South Coast",       description: "Boat safari to Cinnamon Island. Stilt fishermen, turtles, Hiriketiya Bay. Cooking classes.",                                                    keyStops: ["Cinnamon Island boat safari", "Stilt fishermen", "Turtles", "Hiriketiya Bay", "Cooking classes"] },
          { dayNumber: 8,  title: "Dikwella / Weligama Bay",                       location: "South Coast",       description: "Beach relaxation and activities. Blue Beach Island, Nilwella.",                                                                                  keyStops: ["Dikwella / Weligama bay", "Blue Beach Island", "Nilwella"] },
          { dayNumber: 9,  title: "Tangalle Beach Relaxation",                     location: "South Coast",       description: "Relax at Goyambokka or Silent Beach.",                                                                                                          keyStops: ["Goyambokka Beach", "Silent Beach"] },
          { dayNumber: 10, title: "South Coast → Colombo",                         location: "Colombo",           description: "Return to Colombo / airport. Explore en route if time.",                                                                                        keyStops: ["En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "beach-life-south-coast-14d", durationDays: 14, durationNights: 13,
        rates: VR(45, 62, 82, 115, 160),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Bentota",                             location: "Bentota",           description: "Travel south. Relax and/or boat safari.",                                                                                                        keyStops: ["Bentota", "Boat safari (optional)"] },
          { dayNumber: 2,  title: "Bentota Day & Surrounds",                       location: "Bentota",           description: "Beaches and water sports. Brief Garden. Mask museum / market stalls.",                                                                           keyStops: ["Beaches & water sports", "Brief Garden", "Mask museum / market stalls"] },
          { dayNumber: 3,  title: "Bentota/Hikkaduwa/Unawatuna — Beach Relaxation", location: "Bentota",          description: "Full day of beach relaxation and/or activities and exploration.",                                                                                keyStops: ["Bentota / Hikkaduwa / Unawatuna beach relaxation & water sports"] },
          { dayNumber: 4,  title: "Hikkaduwa/Unawatuna",                           location: "Bentota / Galle",   description: "Hikkaduwa National Park coral reef. Tsunami museum.",                                                                                            keyStops: ["Hikkaduwa National Park reef", "Tsunami museum"] },
          { dayNumber: 5,  title: "Unawatuna & Kosgoda",                           location: "Bentota / Galle",   description: "Turtle Conservation Project. Jungle Beach or other beaches.",                                                                                    keyStops: ["Turtle Conservation Project", "Jungle Beach"] },
          { dayNumber: 6,  title: "Mirissa",                                        location: "Galle / Mirissa",   description: "Whale watching in Mirissa. Beach activities.",                                                                                                  keyStops: ["Whale watching — Mirissa", "Beach activities"] },
          { dayNumber: 7,  title: "Galle & Coastal Exploration",                   location: "Galle",             description: "Explore Galle Fort. Relaxed coastal afternoon. Coconut Tree Hill for sunset.",                                                                   keyStops: ["Galle Fort", "Coastal afternoon", "Coconut Tree Hill sunset"] },
          { dayNumber: 8,  title: "Koggala & Dikwella",                            location: "South Coast",       description: "Boat safari to Cinnamon Island. Stilt fishermen, turtles, Hiriketiya Bay. Cooking classes.",                                                    keyStops: ["Cinnamon Island boat safari", "Stilt fishermen", "Turtles", "Hiriketiya Bay", "Cooking classes"] },
          { dayNumber: 9,  title: "Dikwella / Weligama Bay",                       location: "South Coast",       description: "Beach relaxation and activities. Blue Beach Island, Nilwella.",                                                                                  keyStops: ["Dikwella / Weligama bay", "Blue Beach Island", "Nilwella"] },
          { dayNumber: 10, title: "Weligama/Dikwella & Surrounds",                 location: "South Coast",       description: "Beach relaxation and activities.",                                                                                                               keyStops: ["Weligama / Dikwella beach relaxation & activities"] },
          { dayNumber: 11, title: "Weligama Bay/Matara",                           location: "South Coast",       description: "Beach hopping and experiencing local culture.",                                                                                                  keyStops: ["Beach hopping", "Local culture — Matara"] },
          { dayNumber: 12, title: "Tangalle",                                       location: "South Coast",       description: "Beach and surfing.",                                                                                                                             keyStops: ["Tangalle beach", "Surfing"] },
          { dayNumber: 13, title: "Tangalle Beach Relaxation",                     location: "South Coast",       description: "Relax at Goyambokka or Silent Beach.",                                                                                                          keyStops: ["Goyambokka Beach", "Silent Beach"] },
          { dayNumber: 14, title: "South Coast → Colombo",                         location: "Colombo",           description: "Return to Colombo / airport. Explore en route if time.",                                                                                        keyStops: ["En route exploration (if time)", "Colombo / airport"] },
        ],
      },
    ],
  },

  // ── 5. Beach Life: East Coast ─────────────────────────────────────────────
  {
    groupSlug: "beach-life-east-coast",
    name: "Beach Life: East Coast",
    tagline: "Just beaches, water-based activities and relaxation.",
    description: "Crystal-clear waters, world-class marine life, legendary surf and untouched shores — Sri Lanka's east coast is a tropical paradise waiting to be discovered.",
    regions: ["East Coast", "Trincomalee", "Arugam Bay"],
    difficulty: "Easy",
    heroImages: ["https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80"],
    highlights: ["Beach Vibes", "Relaxation", "Water Activities"],
    sortOrder: 5,
    variants: [
      {
        slug: "beach-life-east-coast-5d", durationDays: 5, durationNights: 4,
        rates: VR(48, 65, 88, 122, 170),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Trincomalee",                          location: "Trincomalee",   description: "Travel east with optional stops on the way. Relax at Nilaveli/Uppuveli Beaches.",                                                                    keyStops: ["Optional stops en route", "Nilaveli / Uppuveli beaches"] },
          { dayNumber: 2, title: "Trinco: Pigeon Island & Marine Life",            location: "Trincomalee",   description: "Boat ride to Pigeon Island National Park — snorkelling, diving and swimming with marine life. Visit Red-Sand Beach, Arisimale.",                     keyStops: ["Pigeon Island National Park", "Snorkelling / diving / swim", "Red-Sand Beach Arisimale"] },
          { dayNumber: 3, title: "Trincomalee Sightseeing & Relax",               location: "Trincomalee",   description: "Whale watching at Swami Rock. Koneswaram Temple (optional). Fort Frederick (optional). Kanniya Hot Springs.",                                       keyStops: ["Whale watching — Swami Rock", "Koneswaram Temple (optional)", "Fort Frederick / Deer Fort (optional)", "Kanniya Hot Springs"] },
          { dayNumber: 4, title: "Trincomalee → Pasikudah",                       location: "Pasikudah",     description: "Beach activities. Visit Batticaloa Fort / Kallady Bridge.",                                                                                           keyStops: ["Pasikudah beach activities", "Batticaloa Fort", "Kallady Bridge"] },
          { dayNumber: 5, title: "Pasikudah → Colombo",                           location: "Colombo",       description: "Final morning on the beach (optional). Return to Colombo / airport.",                                                                                keyStops: ["Final beach morning (optional)", "En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "beach-life-east-coast-7d", durationDays: 7, durationNights: 6,
        rates: VR(48, 65, 88, 122, 170),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Trincomalee",                          location: "Trincomalee",   description: "Travel east with optional stops. Relax at Nilaveli/Uppuveli.",                                                                                       keyStops: ["Optional stops en route", "Nilaveli / Uppuveli"] },
          { dayNumber: 2, title: "Trinco: Pigeon Island",                          location: "Trincomalee",   description: "Whale watching at Swami Rock. Boat ride to Pigeon Island — snorkelling, diving, swimming. Red-Sand Beach (Arisimale).",                             keyStops: ["Whale watching — Swami Rock", "Pigeon Island boat ride", "Snorkelling / diving / swim", "Red-Sand Beach Arisimale"] },
          { dayNumber: 3, title: "Nilaveli → Pasikudah",                          location: "Pasikudah",     description: "Morning swim at Nilaveli beach. Beach activities. Drive to Pasikudah.",                                                                              keyStops: ["Nilaveli beach morning swim", "Pasikudah beach activities"] },
          { dayNumber: 4, title: "Pasikudah (Beach Day)",                         location: "Pasikudah",     description: "Relax on the beach. Visit the quieter Kalkudah beach. Optional visit to Batticaloa Fort / Kallady Bridge.",                                          keyStops: ["Pasikudah beach", "Kalkudah beach", "Batticaloa Fort / Kallady Bridge (optional)"] },
          { dayNumber: 5, title: "Pasikudah → Arugam Bay",                        location: "Arugam Bay",    description: "Relax on the beach and enjoy beachfront cafes or seafood shacks.",                                                                                   keyStops: ["Arugam Bay beach", "Beachfront cafes / seafood shacks"] },
          { dayNumber: 6, title: "Arugam Bay — Surf and Sunsets",                 location: "Arugam Bay",    description: "Surf lesson at Main Point or Whiskey Point, or watch the pros. Hike up to Elephant Rock (optional).",                                               keyStops: ["Surf lesson — Main Point / Whiskey Point", "Elephant Rock hike (optional)"] },
          { dayNumber: 7, title: "Arugam Bay → Colombo",                          location: "Colombo",       description: "Final morning on the beach. Return to Colombo / airport.",                                                                                           keyStops: ["Final beach morning", "En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "beach-life-east-coast-10d", durationDays: 10, durationNights: 9,
        rates: VR(48, 65, 88, 122, 170),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Trincomalee",                         location: "Trincomalee",   description: "Travel east with optional stops. Relax at Nilaveli/Uppuveli.",                                                                                       keyStops: ["Optional stops en route", "Nilaveli / Uppuveli"] },
          { dayNumber: 2,  title: "Trinco (Nilaveli & Uppuveli)",                  location: "Trincomalee",   description: "Full beach day at Nilaveli / Uppuveli and other local beaches. Red-Sand Beach (Arisimale).",                                                        keyStops: ["Nilaveli / Uppuveli beaches", "Red-Sand Beach Arisimale"] },
          { dayNumber: 3,  title: "Trinco: Pigeon Island",                         location: "Trincomalee",   description: "Boat ride to Pigeon Island — snorkelling, diving, swimming. Fort Frederick and Kanniya Hot Springs (optional).",                                    keyStops: ["Pigeon Island boat ride", "Snorkelling / diving / swim", "Fort Frederick / Deer Fort (optional)", "Kanniya Hot Springs (optional)"] },
          { dayNumber: 4,  title: "Trinco Exploration — Whale & Dolphin Watching", location: "Trincomalee",   description: "Whale and dolphin watching boat ride. Swami Rock. Snorkelling at Coral Island.",                                                                     keyStops: ["Whale & dolphin watching boat ride", "Swami Rock", "Coral Island snorkelling", "Local cultural sites (optional)"] },
          { dayNumber: 5,  title: "Trincomalee → Pasikudah",                       location: "Pasikudah",     description: "Relax at Pasikudah / Kalkudah. Reef snorkelling and water sports.",                                                                                  keyStops: ["Pasikudah / Kalkudah beaches", "Reef snorkelling", "Water sports"] },
          { dayNumber: 6,  title: "Pasikudah (Beach Day)",                         location: "Pasikudah",     description: "Relax and explore beaches. Visit Batticaloa Fort / Kallady Bridge (optional).",                                                                      keyStops: ["Pasikudah beaches", "Batticaloa Fort / Kallady Bridge (optional)"] },
          { dayNumber: 7,  title: "Pasikudah/Batticaloa & Optional Day Trips",     location: "Pasikudah",     description: "Batticaloa Lagoon boat ride. Batticaloa Fort / Kallady (optional).",                                                                                 keyStops: ["Batticaloa Lagoon boat ride", "Batticaloa Fort / Kallady (optional)"] },
          { dayNumber: 8,  title: "Pasikudah → Arugam Bay",                        location: "Arugam Bay",    description: "Relax on the beach and enjoy beachfront cafes or seafood shacks.",                                                                                   keyStops: ["Arugam Bay beach", "Beachfront cafes / seafood shacks"] },
          { dayNumber: 9,  title: "Arugam Bay",                                    location: "Arugam Bay",    description: "Beach relaxation. Surf lesson or watch the pros. Hike up to Elephant Rock.",                                                                         keyStops: ["Beach relaxation", "Surf lesson / watch pros", "Elephant Rock hike"] },
          { dayNumber: 10, title: "Arugam Bay → Colombo",                          location: "Colombo",       description: "Final morning on the beach. Return to Colombo / airport.",                                                                                           keyStops: ["Final beach morning", "En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "beach-life-east-coast-14d", durationDays: 14, durationNights: 13,
        rates: VR(48, 65, 88, 122, 170),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Trincomalee",                         location: "Trincomalee",   description: "Travel east with optional stops. Relax at Nilaveli/Uppuveli.",                                                                                       keyStops: ["Optional stops en route", "Nilaveli / Uppuveli"] },
          { dayNumber: 2,  title: "Trinco (Nilaveli & Uppuveli)",                  location: "Trincomalee",   description: "Full beach day at Nilaveli / Uppuveli and other local beaches. Red-Sand Beach (Arisimale).",                                                        keyStops: ["Nilaveli / Uppuveli beaches", "Red-Sand Beach Arisimale"] },
          { dayNumber: 3,  title: "Trinco: Pigeon Island",                         location: "Trincomalee",   description: "Boat ride to Pigeon Island — snorkelling, diving, swimming. Fort Frederick. Kanniya Hot Springs (optional).",                                       keyStops: ["Pigeon Island boat ride", "Snorkelling / diving / swim", "Fort Frederick / Deer Fort", "Kanniya Hot Springs (optional)"] },
          { dayNumber: 4,  title: "Trinco: Whale & Dolphin Watching",              location: "Trincomalee",   description: "Boat ride and Swami Rock. Snorkelling at Coral Island. Local cultural and religious sites (optional).",                                              keyStops: ["Boat ride — Swami Rock", "Coral Island snorkelling", "Local cultural & religious sites (optional)"] },
          { dayNumber: 5,  title: "Trincomalee Exploration",                       location: "Trincomalee",   description: "Koneswaram Temple (optional). Fort Frederick (optional). Kanniya Hot Springs (optional).",                                                          keyStops: ["Koneswaram Temple (optional)", "Fort Frederick / Deer Fort (optional)", "Kanniya Hot Springs (optional)"] },
          { dayNumber: 6,  title: "Trincomalee Relaxation",                        location: "Trincomalee",   description: "Relax on Trincomalee and Uppuveli beaches.",                                                                                                         keyStops: ["Trincomalee beaches", "Uppuveli beach"] },
          { dayNumber: 7,  title: "Trincomalee → Pasikudah Bay",                   location: "Pasikudah",     description: "Relax at Pasikudah / Kalkudah. Reef snorkelling and water sports.",                                                                                  keyStops: ["Pasikudah / Kalkudah beaches", "Reef snorkelling", "Water sports"] },
          { dayNumber: 8,  title: "Pasikudah (Beach Day)",                         location: "Pasikudah",     description: "Relax and explore beaches. Visit Batticaloa Fort / Kallady Bridge (optional).",                                                                      keyStops: ["Pasikudah beaches", "Batticaloa Fort / Kallady Bridge (optional)"] },
          { dayNumber: 9,  title: "Pasikudah/Batticaloa & Optional Day Trips",     location: "Pasikudah",     description: "Batticaloa Lagoon boat ride. Batticaloa Fort / Kallady Bridge or day trips inland (optional).",                                                     keyStops: ["Batticaloa Lagoon boat ride", "Batticaloa Fort / Kallady Bridge (optional)", "Day trips inland (optional)"] },
          { dayNumber: 10, title: "Pasikudah → Arugam Bay",                        location: "Arugam Bay",    description: "Relax on the beach and enjoy beachfront cafes or seafood shacks.",                                                                                   keyStops: ["Arugam Bay beach", "Beachfront cafes / seafood shacks"] },
          { dayNumber: 11, title: "Arugam Bay",                                    location: "Arugam Bay",    description: "Beach relaxation. Surf lesson or watch the pros. Hike up to Elephant Rock.",                                                                         keyStops: ["Beach relaxation", "Surf lesson / watch pros", "Elephant Rock hike"] },
          { dayNumber: 12, title: "Arugam Bay / Pottuvil & Local",                 location: "Arugam Bay",    description: "Pottuvil Lagoon boat safari. Kumana National Park and/or local cooking class.",                                                                     keyStops: ["Pottuvil Lagoon boat safari", "Kumana National Park", "Local cooking class"] },
          { dayNumber: 13, title: "Arugam Bay — Final Beach Day",                  location: "Arugam Bay",    description: "Beach relaxation. Surfing and/or local exploration.",                                                                                               keyStops: ["Beach relaxation", "Surfing", "Local exploration"] },
          { dayNumber: 14, title: "Arugam Bay → Colombo",                          location: "Colombo",       description: "Return to Colombo / airport.",                                                                                                                       keyStops: ["Colombo / airport"] },
        ],
      },
    ],
  },

  // ── 6. Scenery & Nature Sri Lanka ─────────────────────────────────────────
  {
    groupSlug: "scenery-nature-sri-lanka",
    name: "Scenery & Nature Sri Lanka",
    tagline: "Waterfalls, mountains, landscapes and wildlife.",
    description: "Sri Lanka's most breathtaking natural wonders — from misty tea country and the Nine Arches Bridge to elephant safaris, the Sinharaja rainforest and whale watching on the south coast.",
    regions: ["Hill Country", "Wildlife Parks", "South Coast"],
    difficulty: "Moderate",
    heroImages: ["https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69838bc1712205ff655de71c_5052216621-ezgif.com-webp-to-jpg-converter.jpg"],
    highlights: ["Mountains", "Waterfalls", "Landscapes", "Wildlife"],
    sortOrder: 6,
    variants: [
      {
        slug: "scenery-nature-sri-lanka-5d", durationDays: 5, durationNights: 4,
        rates: VR(48, 65, 88, 122, 170),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Kandy",                                location: "Kandy",         description: "Travel via scenic countryside. Evening: Temple of the Tooth.",                                                                                       keyStops: ["Scenic countryside drive", "Temple of the Tooth"] },
          { dayNumber: 2, title: "Kandy → Nuwara Eliya",                           location: "Nuwara Eliya",  description: "Tea plantations and factory visit. Cooler climate and beautiful waterfalls.",                                                                        keyStops: ["Tea plantations & factory", "Waterfalls", "Nuwara Eliya"] },
          { dayNumber: 3, title: "Nuwara Eliya → Ella",                            location: "Ella",          description: "Scenic Kandy to Ella train (*check availability). Visit Nine Arches Bridge.",                                                                        keyStops: ["Kandy to Ella scenic train (*check availability)", "Nine Arches Bridge"] },
          { dayNumber: 4, title: "Ella Exploration & Nature Walks",                location: "Ella",          description: "Hike Little Adam's Peak. Explore Ella's beautiful waterfalls.",                                                                                     keyStops: ["Little Adam's Peak hike", "Ella waterfalls"] },
          { dayNumber: 5, title: "Ella → Colombo",                                 location: "Colombo",       description: "Drive back via scenic mountain roads. Optional stops en route.",                                                                                     keyStops: ["Scenic mountain road drive", "Optional stops en route", "Colombo / airport"] },
        ],
      },
      {
        slug: "scenery-nature-sri-lanka-7d", durationDays: 7, durationNights: 6,
        rates: VR(48, 65, 88, 122, 170),
        itinerary: [
          { dayNumber: 1, title: "Colombo → Kandy",                                location: "Kandy",         description: "Travel via scenic countryside. Relax and explore.",                                                                                                  keyStops: ["Scenic countryside drive", "Kandy"] },
          { dayNumber: 2, title: "Kandy Exploration",                               location: "Kandy",         description: "Temple of the Tooth. Royal Botanic Gardens. Cultural dance show.",                                                                                  keyStops: ["Temple of the Tooth", "Royal Botanic Gardens", "Cultural dance show"] },
          { dayNumber: 3, title: "Kandy → Nuwara Eliya",                           location: "Nuwara Eliya",  description: "Tea plantations and factory visit. Cooler climate and waterfalls.",                                                                                  keyStops: ["Tea plantations & factory", "Cooler climate & waterfalls"] },
          { dayNumber: 4, title: "Nuwara Eliya Exploration",                       location: "Nuwara Eliya",  description: "Visit waterfalls, tea estates and scenic viewpoints.",                                                                                               keyStops: ["Waterfalls", "Tea estates", "Scenic viewpoints"] },
          { dayNumber: 5, title: "Nuwara Eliya → Ella",                            location: "Ella",          description: "Scenic train journey to Ella (*check availability).",                                                                                                keyStops: ["Scenic train to Ella (*check availability)"] },
          { dayNumber: 6, title: "Ella Exploration & Nature",                      location: "Ella",          description: "Visit Nine Arches Bridge. Hike Little Adam's Peak. Explore waterfalls.",                                                                             keyStops: ["Nine Arches Bridge", "Little Adam's Peak hike", "Ella waterfalls"] },
          { dayNumber: 7, title: "Ella → Colombo",                                 location: "Colombo",       description: "Drive via scenic route with optional stops en route.",                                                                                               keyStops: ["Scenic route drive", "Optional stops en route", "Colombo / airport"] },
        ],
      },
      {
        slug: "scenery-nature-sri-lanka-10d", durationDays: 10, durationNights: 9,
        rates: VR(48, 65, 88, 122, 170),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Kandy",                               location: "Kandy",         description: "Travel via scenic countryside. Relax and explore.",                                                                                                  keyStops: ["Scenic countryside drive", "Kandy"] },
          { dayNumber: 2,  title: "Kandy Exploration",                              location: "Kandy",         description: "Temple of the Tooth. Royal Botanic Gardens. Cultural dance show.",                                                                                  keyStops: ["Temple of the Tooth", "Royal Botanic Gardens", "Cultural dance show"] },
          { dayNumber: 3,  title: "Kandy → Nuwara Eliya",                          location: "Nuwara Eliya",  description: "Tea plantations and factory visit. Cooler climate and waterfalls.",                                                                                  keyStops: ["Tea plantations & factory", "Cooler climate & waterfalls"] },
          { dayNumber: 4,  title: "Nuwara Eliya Exploration",                      location: "Nuwara Eliya",  description: "Waterfalls, tea estates and scenic viewpoints.",                                                                                                    keyStops: ["Waterfalls", "Tea estates", "Scenic viewpoints"] },
          { dayNumber: 5,  title: "Nuwara Eliya → Ella",                           location: "Ella",          description: "Scenic train journey to Ella (*check availability).",                                                                                                keyStops: ["Scenic train to Ella (*check availability)"] },
          { dayNumber: 6,  title: "Ella Exploration & Nature",                     location: "Ella",          description: "Visit Nine Arches Bridge. Hike Little Adam's Peak. Explore waterfalls.",                                                                             keyStops: ["Nine Arches Bridge", "Little Adam's Peak hike", "Ella waterfalls"] },
          { dayNumber: 7,  title: "Ella → Udawalawe Safari",                       location: "Ella / Udawalawe", description: "Safari at Udawalawe National Park.",                                                                                                           keyStops: ["Udawalawe National Park safari"] },
          { dayNumber: 8,  title: "Udawalawe → Sinharaja Rainforest",              location: "Sinharaja",     description: "Travel to the Sinharaja rainforest region.",                                                                                                        keyStops: ["Sinharaja rainforest"] },
          { dayNumber: 9,  title: "Sinharaja Nature Experience",                   location: "Sinharaja",     description: "Explore Sinharaja biodiversity and trails.",                                                                                                         keyStops: ["Sinharaja biodiversity trails"] },
          { dayNumber: 10, title: "Sinharaja → Colombo",                           location: "Colombo",       description: "Return to Colombo with optional stops along the way.",                                                                                              keyStops: ["Optional stops en route", "Colombo / airport"] },
        ],
      },
      {
        slug: "scenery-nature-sri-lanka-14d", durationDays: 14, durationNights: 13,
        rates: VR(48, 65, 88, 122, 170),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → Kandy",                               location: "Kandy",         description: "Travel via scenic countryside. Relax and explore.",                                                                                                  keyStops: ["Scenic countryside drive", "Kandy"] },
          { dayNumber: 2,  title: "Kandy Exploration",                              location: "Kandy",         description: "Temple of the Tooth. Royal Botanic Gardens. Cultural dance show.",                                                                                  keyStops: ["Temple of the Tooth", "Royal Botanic Gardens", "Cultural dance show"] },
          { dayNumber: 3,  title: "Kandy → Nuwara Eliya",                          location: "Nuwara Eliya",  description: "Tea plantations and factory visit. Cooler climate and waterfalls.",                                                                                  keyStops: ["Tea plantations & factory", "Cooler climate & waterfalls"] },
          { dayNumber: 4,  title: "Nuwara Eliya Exploration",                      location: "Nuwara Eliya",  description: "Waterfalls, tea estates and scenic viewpoints.",                                                                                                    keyStops: ["Waterfalls", "Tea estates", "Scenic viewpoints"] },
          { dayNumber: 5,  title: "Nuwara Eliya → Ella",                           location: "Ella",          description: "Scenic train journey to Ella (*check availability).",                                                                                                keyStops: ["Scenic train to Ella (*check availability)"] },
          { dayNumber: 6,  title: "Ella Exploration & Nature",                     location: "Ella",          description: "Visit Nine Arches Bridge. Hike Little Adam's Peak. Explore waterfalls.",                                                                             keyStops: ["Nine Arches Bridge", "Little Adam's Peak hike", "Ella waterfalls"] },
          { dayNumber: 7,  title: "Ella → Udawalawe Safari",                       location: "Ella / Udawalawe", description: "Safari at Udawalawe National Park.",                                                                                                           keyStops: ["Udawalawe National Park safari"] },
          { dayNumber: 8,  title: "Udawalawe → Yala National Park",                location: "Yala",          description: "Travel to Yala National Park.",                                                                                                                      keyStops: ["Yala National Park"] },
          { dayNumber: 9,  title: "Yala Safari Experience",                        location: "Yala",          description: "Enjoy wildlife encounters in Yala — leopards, elephants, sloth bears and birdlife.",                                                                keyStops: ["Yala wildlife safari — leopards, elephants, sloth bears"] },
          { dayNumber: 10, title: "Yala → Sinharaja Rainforest",                   location: "Sinharaja",     description: "Travel to the Sinharaja rainforest region.",                                                                                                        keyStops: ["Sinharaja rainforest"] },
          { dayNumber: 11, title: "Sinharaja Exploration",                         location: "Sinharaja",     description: "Guided rainforest trekking.",                                                                                                                        keyStops: ["Guided rainforest trekking — Sinharaja"] },
          { dayNumber: 12, title: "Sinharaja → Koggala & Dikwella",                location: "South Coast / Galle", description: "Boat safari to Cinnamon Island. Stilt fishermen, turtles, Hiriketiya Bay.",                                                               keyStops: ["Cinnamon Island boat safari", "Stilt fishermen", "Turtles", "Hiriketiya Bay"] },
          { dayNumber: 13, title: "Mirissa & Galle",                               location: "South Coast / Galle / Mirissa", description: "Whale watching in Mirissa. Coconut Tree Hill for sunset. Beach and local scenery.",                                             keyStops: ["Whale watching — Mirissa", "Coconut Tree Hill sunset", "Beach & local scenery"] },
          { dayNumber: 14, title: "South Coast → Colombo",                         location: "Colombo",       description: "Return to Colombo with optional stops along the way.",                                                                                              keyStops: ["Optional stops en route", "Colombo / airport"] },
        ],
      },
    ],
  },

  // ── 7. Honeymoon, Wedding & Romance ───────────────────────────────────────
  {
    groupSlug: "honeymoon-wedding-romance",
    name: "Honeymoon, Wedding & Romance",
    tagline: "Romantic & scenic — picturesque moments across Sri Lanka.",
    description: "Designed for couples — private sunset walks along golden shores, whale watching in Mirissa, misty tea country, and the most romantic vistas Sri Lanka has to offer.",
    regions: ["South Coast", "Hill Country", "Galle"],
    difficulty: "Easy",
    heroImages: ["https://cdn.prod.website-files.com/68fe492bc39e0e661cce824d/69f027d4583402df5a085c94_Honeymoon.png"],
    highlights: ["Romantic Retreat", "Scenic Views", "Private Moments"],
    sortOrder: 7,
    variants: [
      {
        slug: "honeymoon-wedding-romance-5d", durationDays: 5, durationNights: 4,
        rates: VR(55, 75, 100, 140, 195),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → South Coast (Bentota/Mirissa)",                   location: "Bentota / Mirissa",  description: "Leisure evening — unwind together by the sea.",                                                                                              keyStops: ["South Coast (Bentota/Mirissa)", "Leisurely evening"] },
          { dayNumber: 2,  title: "Bentota/Hikkaduwa/Unawatuna — Beach Relax & Sunset Moments", location: "Bentota / Mirissa",  description: "Beaches and optional water sports. Private sunset walk along the shore.",                                                                   keyStops: ["Bentota / Hikkaduwa / Unawatuna beaches", "Optional water sports", "Private sunset walk"] },
          { dayNumber: 3,  title: "Galle Fort & Coastal Strolls",                              location: "Galle",              description: "Explore Galle Fort, relax in the streets and cafes. Coconut Tree Hill for sunset. Whale watching in Mirissa if time allows.",                  keyStops: ["Galle Fort", "Streets & cafes", "Coconut Tree Hill sunset", "Whale watching — Mirissa (if time)"] },
          { dayNumber: 4,  title: "Tangalle Beach Relaxation",                                 location: "Galle / Tangalle",   description: "Relax at Goyambokka or Silent Beach. Optional spa, massage and boat cruises.",                                                               keyStops: ["Goyambokka Beach", "Silent Beach", "Spa / massage / boat cruises (optional)"] },
          { dayNumber: 5,  title: "South Coast → Colombo",                                     location: "Colombo",            description: "Return to Colombo / airport. Explore en route if time available.",                                                                           keyStops: ["En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "honeymoon-wedding-romance-7d", durationDays: 7, durationNights: 6,
        rates: VR(55, 75, 100, 140, 195),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → South Coast (Bentota/Mirissa)",                   location: "Bentota / Mirissa",  description: "Leisurely evening by the sea.",                                                                                                            keyStops: ["South Coast (Bentota/Mirissa)", "Leisurely evening"] },
          { dayNumber: 2,  title: "Bentota/Hikkaduwa/Unawatuna — Beach Relax & Sunset Moments", location: "Bentota",            description: "Beaches and optional water sports. Private sunset walk along the shore.",                                                                   keyStops: ["Bentota / Hikkaduwa / Unawatuna beaches", "Optional water sports", "Private sunset walk"] },
          { dayNumber: 3,  title: "Mirissa & Galle",                                           location: "Galle",              description: "Whale watching in Mirissa. Relax by the sea. Goyambokka or Silent Beach.",                                                                  keyStops: ["Whale watching — Mirissa", "Relax by the sea", "Goyambokka / Silent Beach"] },
          { dayNumber: 4,  title: "Galle Fort & Coastal Strolls",                              location: "Galle",              description: "Explore Galle Fort — romantic streets, cafes and viewpoints. Coconut Tree Hill for sunset.",                                                 keyStops: ["Galle Fort", "Romantic streets & cafes", "Coconut Tree Hill sunset"] },
          { dayNumber: 5,  title: "South Coast → Nuwara Eliya",                               location: "Nuwara Eliya",       description: "Travel inland to the scenic tea country.",                                                                                                  keyStops: ["Scenic tea country drive", "Nuwara Eliya"] },
          { dayNumber: 6,  title: "Nuwara Eliya Exploration",                                  location: "Nuwara Eliya",       description: "Visit waterfalls, tea estates and panoramic landscapes together.",                                                                          keyStops: ["Waterfalls", "Tea estates", "Panoramic landscapes"] },
          { dayNumber: 7,  title: "Nuwara Eliya → Colombo",                                   location: "Colombo",            description: "Return to Colombo / airport. Explore en route if time.",                                                                                    keyStops: ["En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "honeymoon-wedding-romance-10d", durationDays: 10, durationNights: 9,
        rates: VR(55, 75, 100, 140, 195),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → South Coast (Bentota/Mirissa)",                   location: "Bentota / Mirissa",  description: "Leisurely evening by the sea.",                                                                                                            keyStops: ["South Coast (Bentota/Mirissa)", "Leisurely evening"] },
          { dayNumber: 2,  title: "Bentota Day & Surrounds",                                   location: "Bentota",            description: "Beaches and water sports. Brief Garden. Mask museum / market stalls.",                                                                      keyStops: ["Beaches & water sports", "Brief Garden", "Mask museum / market stalls"] },
          { dayNumber: 3,  title: "Mirissa & Galle",                                           location: "Galle",              description: "Whale watching in Mirissa. Relax by the sea. Explore local life and culture.",                                                              keyStops: ["Whale watching — Mirissa", "Relax by the sea", "Local life & culture"] },
          { dayNumber: 4,  title: "Galle Fort & Coastal Strolls",                              location: "Galle",              description: "Explore Galle Fort — romantic streets, cafes and viewpoints. Coconut Tree Hill for sunset.",                                                 keyStops: ["Galle Fort", "Romantic streets & cafes", "Coconut Tree Hill sunset"] },
          { dayNumber: 5,  title: "South Coast → Nuwara Eliya",                               location: "Nuwara Eliya",       description: "Travel inland to the scenic tea country.",                                                                                                  keyStops: ["Scenic tea country drive", "Nuwara Eliya"] },
          { dayNumber: 6,  title: "Nuwara Eliya Exploration",                                  location: "Nuwara Eliya",       description: "Visit waterfalls, lakes and tea plantations together.",                                                                                    keyStops: ["Waterfalls", "Lakes", "Tea plantations"] },
          { dayNumber: 7,  title: "Nuwara Eliya → Ella",                                      location: "Ella",               description: "Scenic train journey to Ella (*check availability).",                                                                                       keyStops: ["Scenic train to Ella (*check availability)"] },
          { dayNumber: 8,  title: "Ella Exploration",                                          location: "Ella",               description: "Visit Nine Arches Bridge. Hike Little Adam's Peak. Explore waterfalls.",                                                                    keyStops: ["Nine Arches Bridge", "Little Adam's Peak hike", "Ella waterfalls"] },
          { dayNumber: 9,  title: "Ella → Tangalle/South Coast Beach Relaxation",             location: "South Coast",        description: "Relax at Goyambokka or Silent Beach.",                                                                                                     keyStops: ["Goyambokka Beach", "Silent Beach"] },
          { dayNumber: 10, title: "South Coast → Colombo",                                     location: "Colombo",            description: "Return to Colombo / airport. Explore en route if time.",                                                                                    keyStops: ["En route exploration (if time)", "Colombo / airport"] },
        ],
      },
      {
        slug: "honeymoon-wedding-romance-14d", durationDays: 14, durationNights: 13,
        rates: VR(55, 75, 100, 140, 195),
        itinerary: [
          { dayNumber: 1,  title: "Colombo → South Coast (Bentota/Mirissa)",                   location: "Bentota / Mirissa",  description: "Leisurely evening by the sea.",                                                                                                            keyStops: ["South Coast (Bentota/Mirissa)", "Leisurely evening"] },
          { dayNumber: 2,  title: "Bentota Day & Surrounds",                                   location: "Bentota",            description: "Beaches and water sports. Brief Garden. Mask museum / market stalls.",                                                                      keyStops: ["Beaches & water sports", "Brief Garden", "Mask museum / market stalls"] },
          { dayNumber: 3,  title: "Mirissa & Galle",                                           location: "Galle",              description: "Whale watching in Mirissa. Relax by the sea. Explore local life and culture.",                                                              keyStops: ["Whale watching — Mirissa", "Relax by the sea", "Local life & culture"] },
          { dayNumber: 4,  title: "Galle Fort & Coastal Exploration",                          location: "Galle",              description: "Explore Galle Fort — romantic streets, cafes and viewpoints. Coconut Tree Hill for sunset.",                                                 keyStops: ["Galle Fort", "Romantic streets & cafes", "Coconut Tree Hill sunset"] },
          { dayNumber: 5,  title: "South Coast → Nuwara Eliya",                               location: "Nuwara Eliya",       description: "Travel inland to the scenic tea country.",                                                                                                  keyStops: ["Scenic tea country drive", "Nuwara Eliya"] },
          { dayNumber: 6,  title: "Nuwara Eliya Exploration",                                  location: "Nuwara Eliya",       description: "Visit waterfalls, lakes and tea plantations together.",                                                                                    keyStops: ["Waterfalls", "Lakes", "Tea plantations"] },
          { dayNumber: 7,  title: "Nuwara Eliya → Ella",                                      location: "Ella",               description: "Scenic train journey to Ella (*check availability).",                                                                                       keyStops: ["Scenic train to Ella (*check availability)"] },
          { dayNumber: 8,  title: "Ella Nature & Viewpoints",                                  location: "Ella",               description: "Visit Nine Arches Bridge. Hike Little Adam's Peak. Explore waterfalls.",                                                                    keyStops: ["Nine Arches Bridge", "Little Adam's Peak hike", "Ella waterfalls"] },
          { dayNumber: 9,  title: "Ella → Udawalawe Safari",                                  location: "Udawalawe",          description: "Enjoy wildlife together at a safari in Udawalawe National Park.",                                                                           keyStops: ["Udawalawe National Park safari"] },
          { dayNumber: 10, title: "Udawalawe → Yala National Park",                            location: "Yala",               description: "Safari at Yala National Park.",                                                                                                            keyStops: ["Yala National Park safari"] },
          { dayNumber: 11, title: "Yala → Tangalle",                                          location: "South Coast",        description: "Relax at Goyambokka or Silent Beach.",                                                                                                     keyStops: ["Goyambokka Beach", "Silent Beach"] },
          { dayNumber: 12, title: "Tangalle → Dikwella/Weligama",                             location: "South Coast",        description: "Beach and surfing.",                                                                                                                       keyStops: ["Dikwella / Weligama beach", "Surfing"] },
          { dayNumber: 13, title: "Dikwella / Weligama Bay",                                   location: "South Coast",        description: "Beach relaxation and activities. Blue Beach Island, Nilwella.",                                                                            keyStops: ["Dikwella / Weligama bay", "Blue Beach Island", "Nilwella"] },
          { dayNumber: 14, title: "South Coast → Colombo",                                     location: "Colombo",            description: "Return to Colombo / airport. Explore en route if time.",                                                                                    keyStops: ["En route exploration (if time)", "Colombo / airport"] },
        ],
      },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seedTours() {
  console.log("🌱 Reseeding tours...");

  // 1. Wipe all existing tour data
  console.log("  Clearing old tour data...");
  await db.execute(sql`DELETE FROM seasonal_pricing`);
  await db.execute(sql`DELETE FROM tour_add_ons`);
  await db.execute(sql`DELETE FROM itinerary_days`);
  await db.execute(sql`DELETE FROM tour_vehicle_rates`);
  await db.execute(sql`DELETE FROM tours`);
  console.log("  ✓ Old tours cleared");

  // 2. Insert new tour groups
  let totalVariants = 0;
  for (const group of TOUR_GROUPS) {
    console.log(`  Inserting: ${group.name}`);
    for (const variant of group.variants) {
      const [tour] = await db
        .insert(toursTable)
        .values({
          slug:            variant.slug,
          groupSlug:       group.groupSlug,
          groupId:         group.groupSlug,
          name:            group.name,
          tagline:         group.tagline,
          description:     group.description,
          durationDays:    variant.durationDays,
          durationNights:  variant.durationNights,
          highlights:      group.highlights,
          regions:         group.regions,
          difficulty:      group.difficulty,
          heroImages:      group.heroImages,
          bestMonths:      [],
          whatsIncluded:   INCLUDED,
          whatsNotIncluded: EXCLUDED,
          minLeadTimeDays: variant.durationDays <= 5 ? 3 : variant.durationDays <= 10 ? 5 : 7,
          maxExtraDays:    3,
          isActive:        true,
          sortOrder:       group.sortOrder,
        })
        .returning();

      // Vehicle rates
      await db.insert(tourVehicleRatesTable).values(
        variant.rates.map((r) => ({ tourId: tour.id, vehicleType: r.vehicleType, pricePerDay: r.pricePerDay }))
      );

      // Itinerary
      if (variant.itinerary.length > 0) {
        await db.insert(itineraryDaysTable).values(
          variant.itinerary.map((d) => ({
            tourId:      tour.id,
            dayNumber:   d.dayNumber,
            title:       d.title,
            location:    d.location,
            description: d.description,
            keyStops:    d.keyStops,
          }))
        );
      }

      // Add-ons
      await db.insert(tourAddOnsTable).values(
        ADD_ONS.map((a) => ({ tourId: tour.id, name: a.name, description: a.description, priceGBP: a.priceGBP }))
      );

      totalVariants++;
    }
  }

  console.log(`  ✓ ${TOUR_GROUPS.length} tour groups inserted (${totalVariants} variants total)`);
  console.log("✅ Tour reseed complete");
  process.exit(0);
}

seedTours().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
