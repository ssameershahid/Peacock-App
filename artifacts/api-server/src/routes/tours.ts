import { Router } from "express";
import { z } from "zod";
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

async function getTourWithRelations(tourId: string) {
  const [tour] = await db
    .select()
    .from(toursTable)
    .where(eq(toursTable.id, tourId))
    .limit(1);
  if (!tour) return null;

  const [vehicleRates, itinerary, addOns, seasonalPricing] = await Promise.all([
    db
      .select()
      .from(tourVehicleRatesTable)
      .where(eq(tourVehicleRatesTable.tourId, tourId)),
    db
      .select()
      .from(itineraryDaysTable)
      .where(eq(itineraryDaysTable.tourId, tourId))
      .orderBy(asc(itineraryDaysTable.dayNumber)),
    db
      .select()
      .from(tourAddOnsTable)
      .where(eq(tourAddOnsTable.tourId, tourId)),
    db
      .select()
      .from(seasonalPricingTable)
      .where(eq(seasonalPricingTable.tourId, tourId)),
  ]);

  return { ...tour, vehicleRates, itinerary, addOns, seasonalPricing };
}

// GET /api/tours
router.get("/", async (req, res) => {
  try {
    const { search, region, difficulty, active } = req.query as Record<string, string>;

    const conditions = [];
    if (active !== "false") conditions.push(eq(toursTable.isActive, true));
    if (difficulty) conditions.push(eq(toursTable.difficulty, difficulty));

    const tours = await (conditions.length
      ? db.select().from(toursTable).where(and(...conditions)).orderBy(asc(toursTable.sortOrder))
      : db.select().from(toursTable).orderBy(asc(toursTable.sortOrder)));

    // Filter by search/region in JS (small dataset)
    const filtered = tours.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (region && !t.regions.some((r) => r.toLowerCase().includes(region.toLowerCase()))) return false;
      return true;
    });

    // Attach vehicle rates for pricing display
    const tourIds = filtered.map((t) => t.id);
    const allRates = tourIds.length
      ? await db
          .select()
          .from(tourVehicleRatesTable)
          .where(inArray(tourVehicleRatesTable.tourId, tourIds))
      : [];

    const ratesByTour = allRates.reduce<Record<string, typeof allRates>>(
      (acc, r) => {
        if (!acc[r.tourId]) acc[r.tourId] = [];
        acc[r.tourId].push(r);
        return acc;
      },
      {}
    );

    res.json(
      filtered.map((t) => ({ ...t, vehicleRates: ratesByTour[t.id] || [] }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// GET /api/tours/:idOrSlug
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
    const { vehicleRates, itinerary, addOns, seasonalPricing, ...tourData } =
      req.body;
    const [tour] = await db
      .insert(toursTable)
      .values(tourData)
      .returning();

    if (vehicleRates?.length) {
      await db
        .insert(tourVehicleRatesTable)
        .values(vehicleRates.map((r: any) => ({ ...r, tourId: tour.id })));
    }
    if (itinerary?.length) {
      await db
        .insert(itineraryDaysTable)
        .values(itinerary.map((d: any) => ({ ...d, tourId: tour.id })));
    }
    if (addOns?.length) {
      await db
        .insert(tourAddOnsTable)
        .values(addOns.map((a: any) => ({ ...a, tourId: tour.id })));
    }
    if (seasonalPricing?.length) {
      await db
        .insert(seasonalPricingTable)
        .values(seasonalPricing.map((s: any) => ({ ...s, tourId: tour.id })));
    }

    res.status(201).json(await getTourWithRelations(tour.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create tour" });
  }
});

// PUT /api/tours/:id (admin)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { vehicleRates, itinerary, addOns, seasonalPricing, ...tourData } =
      req.body;
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
