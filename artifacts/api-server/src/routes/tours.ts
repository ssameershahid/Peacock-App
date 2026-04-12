import { Router } from "express";
import { eq, and, asc, inArray } from "drizzle-orm";
import {
  db,
  toursTable,
  tourVehicleRatesTable,
  itineraryDaysTable,
  tourAddOnsTable,
  seasonalPricingTable,
} from "@workspace/db";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

const VALID_DURATIONS = [5, 7, 10, 14];

async function getTourWithRelations(tourId: string) {
  const [tour] = await db
    .select()
    .from(toursTable)
    .where(eq(toursTable.id, tourId))
    .limit(1);
  if (!tour) return null;

  const [vehicleRates, itinerary, addOns, seasonalPricing] = await Promise.all([
    db.select().from(tourVehicleRatesTable).where(eq(tourVehicleRatesTable.tourId, tourId)),
    db.select().from(itineraryDaysTable).where(eq(itineraryDaysTable.tourId, tourId)).orderBy(asc(itineraryDaysTable.dayNumber)),
    db.select().from(tourAddOnsTable).where(eq(tourAddOnsTable.tourId, tourId)),
    db.select().from(seasonalPricingTable).where(eq(seasonalPricingTable.tourId, tourId)),
  ]);

  return { ...tour, vehicleRates, itinerary, addOns, seasonalPricing };
}

// GET /api/tours/groups — return 6 parent groups each with their 4 variants
router.get("/groups", async (_req, res) => {
  try {
    const tours = await db
      .select()
      .from(toursTable)
      .where(and(eq(toursTable.isActive, true)))
      .orderBy(asc(toursTable.sortOrder));

    // Group by groupId
    const groupMap = new Map<string, any>();
    for (const t of tours) {
      if (!t.groupId || !t.groupSlug) continue;
      if (!groupMap.has(t.groupId)) {
        groupMap.set(t.groupId, {
          groupId: t.groupId,
          groupSlug: t.groupSlug,
          name: t.name,
          tagline: t.tagline,
          description: t.description,
          regions: t.regions,
          difficulty: t.difficulty,
          heroImages: t.heroImages,
          highlights: t.highlights,
          sortOrder: t.sortOrder,
          variants: [],
        });
      }
      groupMap.get(t.groupId).variants.push({
        id: t.id,
        slug: t.slug,
        durationDays: t.durationDays,
        durationNights: t.durationNights,
      });
    }

    // Attach vehicle rates for pricing display (cheapest rate per group)
    const allTourIds = tours.map((t) => t.id);
    const allRates = allTourIds.length
      ? await db.select().from(tourVehicleRatesTable).where(inArray(tourVehicleRatesTable.tourId, allTourIds))
      : [];
    const ratesByTour = allRates.reduce<Record<string, typeof allRates>>((acc, r) => {
      if (!acc[r.tourId]) acc[r.tourId] = [];
      acc[r.tourId].push(r);
      return acc;
    }, {});

    // Add vehicle rates to each variant
    const groups = Array.from(groupMap.values()).map((g) => ({
      ...g,
      variants: g.variants
        .map((v: any) => ({ ...v, vehicleRates: ratesByTour[v.id] || [] }))
        .sort((a: any, b: any) => a.durationDays - b.durationDays),
    }));

    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tour groups" });
  }
});

// GET /api/tours — flat list (all active variants)
router.get("/", async (req, res) => {
  try {
    const { search, region, difficulty, duration, active } = req.query as Record<string, string>;

    const conditions = [];
    if (active !== "false") conditions.push(eq(toursTable.isActive, true));
    if (difficulty) conditions.push(eq(toursTable.difficulty, difficulty));

    // Duration filter: only allow 5, 7, 10, 14
    if (duration && VALID_DURATIONS.includes(Number(duration))) {
      conditions.push(eq(toursTable.durationDays, Number(duration)));
    }

    const tours = await (conditions.length
      ? db.select().from(toursTable).where(and(...conditions)).orderBy(asc(toursTable.sortOrder))
      : db.select().from(toursTable).orderBy(asc(toursTable.sortOrder)));

    const filtered = tours.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (region && !t.regions.some((r) => r.toLowerCase().includes(region.toLowerCase()))) return false;
      return true;
    });

    const tourIds = filtered.map((t) => t.id);
    const allRates = tourIds.length
      ? await db.select().from(tourVehicleRatesTable).where(inArray(tourVehicleRatesTable.tourId, tourIds))
      : [];

    const ratesByTour = allRates.reduce<Record<string, typeof allRates>>((acc, r) => {
      if (!acc[r.tourId]) acc[r.tourId] = [];
      acc[r.tourId].push(r);
      return acc;
    }, {});

    res.json(filtered.map((t) => ({ ...t, vehicleRates: ratesByTour[t.id] || [] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// GET /api/tours/:groupSlug/:duration — specific variant by group + duration
router.get("/:groupSlug/:duration", async (req, res) => {
  try {
    const { groupSlug, duration } = req.params;
    const days = Number(duration);
    if (!VALID_DURATIONS.includes(days)) {
      res.status(400).json({ error: "Invalid duration. Must be 5, 7, 10, or 14." });
      return;
    }

    const [variant] = await db
      .select()
      .from(toursTable)
      .where(and(eq(toursTable.groupSlug, groupSlug), eq(toursTable.durationDays, days)))
      .limit(1);

    if (!variant) {
      res.status(404).json({ error: "Tour variant not found" });
      return;
    }

    const full = await getTourWithRelations(variant.id);
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tour variant" });
  }
});

// GET /api/tours/:idOrSlug — by id or full slug (e.g. classic-sri-lanka-7d)
router.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const [bySlug] = await db
      .select()
      .from(toursTable)
      .where(eq(toursTable.slug, idOrSlug))
      .limit(1);
    const tour = bySlug
      ? await getTourWithRelations(bySlug.id)
      : await getTourWithRelations(idOrSlug);

    if (!tour) {
      res.status(404).json({ error: "Tour not found" });
      return;
    }
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tour" });
  }
});

// POST /api/tours (admin)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { vehicleRates, itinerary, addOns, seasonalPricing, ...tourData } = req.body;
    const [tour] = await db.insert(toursTable).values(tourData).returning();

    if (vehicleRates?.length) {
      await db.insert(tourVehicleRatesTable).values(vehicleRates.map((r: any) => ({ ...r, tourId: tour.id })));
    }
    if (itinerary?.length) {
      await db.insert(itineraryDaysTable).values(itinerary.map((d: any) => ({ ...d, tourId: tour.id })));
    }
    if (addOns?.length) {
      await db.insert(tourAddOnsTable).values(addOns.map((a: any) => ({ ...a, tourId: tour.id })));
    }
    if (seasonalPricing?.length) {
      await db.insert(seasonalPricingTable).values(seasonalPricing.map((s: any) => ({ ...s, tourId: tour.id })));
    }

    res.status(201).json(await getTourWithRelations(tour.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create tour" });
  }
});

// PUT /api/tours/:id (admin) — update tour metadata
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { vehicleRates, itinerary, addOns, seasonalPricing, ...tourData } = req.body;
    const [updated] = await db
      .update(toursTable)
      .set({ ...tourData, updatedAt: new Date() })
      .where(eq(toursTable.id, req.params.id as string))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Tour not found" });
      return;
    }

    res.json(await getTourWithRelations(updated.id));
  } catch (err) {
    res.status(500).json({ error: "Failed to update tour" });
  }
});

// PUT /api/tours/:id/itinerary (admin) — replace all itinerary days for a variant
router.put("/:id/itinerary", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body as { days: Array<{
      dayNumber: number;
      title: string;
      location: string;
      lat?: number;
      lng?: number;
      description: string;
      drivingTime?: string;
      keyStops: string[];
    }> };

    if (!Array.isArray(days)) {
      res.status(400).json({ error: "days must be an array" });
      return;
    }

    const tourId = id as string;
    // Delete existing days and re-insert
    await db.delete(itineraryDaysTable).where(eq(itineraryDaysTable.tourId, tourId));

    if (days.length > 0) {
      await db.insert(itineraryDaysTable).values(
        days.map((d) => ({ ...d, tourId }))
      );
    }

    const updatedDays = await db
      .select()
      .from(itineraryDaysTable)
      .where(eq(itineraryDaysTable.tourId, tourId))
      .orderBy(asc(itineraryDaysTable.dayNumber));

    res.json({ itinerary: updatedDays });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update itinerary" });
  }
});

// PUT /api/tours/:id/vehicle-rates (admin) — replace vehicle rates
router.put("/:id/vehicle-rates", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rates } = req.body as { rates: Array<{ vehicleType: string; pricePerDay: number }> };

    const tourId = id as string;
    await db.delete(tourVehicleRatesTable).where(eq(tourVehicleRatesTable.tourId, tourId));
    if (rates?.length) {
      await db.insert(tourVehicleRatesTable).values(rates.map((r) => ({ ...r, tourId })));
    }

    res.json({ vehicleRates: await db.select().from(tourVehicleRatesTable).where(eq(tourVehicleRatesTable.tourId, tourId)) });
  } catch (err) {
    res.status(500).json({ error: "Failed to update vehicle rates" });
  }
});

// DELETE /api/tours/:id (admin)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await db
      .update(toursTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(toursTable.id, req.params.id as string));
    res.json({ message: "Tour deactivated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete tour" });
  }
});

export default router;
