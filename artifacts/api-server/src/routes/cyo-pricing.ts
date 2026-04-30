import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { db, cyoVehicleRatesTable, cyoUpsellItemsTable } from "@workspace/db";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/cyo-pricing — public, used by wizard to calculate estimated price
router.get("/", async (_req, res) => {
  try {
    const [rates, upsells] = await Promise.all([
      db.select().from(cyoVehicleRatesTable),
      db.select().from(cyoUpsellItemsTable).orderBy(asc(cyoUpsellItemsTable.sortOrder)),
    ]);

    const vehicleRates = rates.reduce(
      (acc, r) => { acc[r.vehicleType] = r.pricePerDay; return acc; },
      {} as Record<string, number>
    );

    res.json({ vehicleRates, upsells });
  } catch {
    res.status(500).json({ error: "Failed to fetch CYO pricing" });
  }
});

// PUT /api/cyo-pricing/rates/:vehicleType — admin: update a vehicle rate
const rateSchema = z.object({ pricePerDay: z.number().int().positive() });

router.put("/rates/:vehicleType", authenticate, requireAdmin, async (req, res) => {
  const parsed = rateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "pricePerDay must be a positive integer" });
    return;
  }
  const vehicleType = req.params.vehicleType as string;
  try {
    const [updated] = await db
      .insert(cyoVehicleRatesTable)
      .values({ vehicleType, pricePerDay: parsed.data.pricePerDay })
      .onConflictDoUpdate({
        target: cyoVehicleRatesTable.vehicleType,
        set: { pricePerDay: parsed.data.pricePerDay, updatedAt: new Date() },
      })
      .returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update vehicle rate" });
  }
});

// POST /api/cyo-pricing/upsells — admin: add a upsell item
const upsellSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceGBP: z.number().int().positive(),
  sortOrder: z.number().int().default(0),
});

router.post("/upsells", authenticate, requireAdmin, async (req, res) => {
  const parsed = upsellSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const [item] = await db.insert(cyoUpsellItemsTable).values(parsed.data).returning();
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: "Failed to create upsell item" });
  }
});

// PUT /api/cyo-pricing/upsells/:id — admin: edit or toggle a upsell item
const upsellUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceGBP: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

router.put("/upsells/:id", authenticate, requireAdmin, async (req, res) => {
  const parsed = upsellUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const [updated] = await db
      .update(cyoUpsellItemsTable)
      .set(parsed.data)
      .where(eq(cyoUpsellItemsTable.id, req.params.id as string))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Upsell item not found" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update upsell item" });
  }
});

// DELETE /api/cyo-pricing/upsells/:id — admin: remove a upsell item
router.delete("/upsells/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(cyoUpsellItemsTable)
      .where(eq(cyoUpsellItemsTable.id, req.params.id as string))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Upsell item not found" });
      return;
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete upsell item" });
  }
});

export default router;
