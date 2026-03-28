import { Router } from "express";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { db, savedTripsTable } from "@workspace/db";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/saved-trips — list user's saved trips
router.get("/", authenticate, async (req, res) => {
  try {
    const trips = await db
      .select()
      .from(savedTripsTable)
      .where(eq(savedTripsTable.userId, req.user!.userId))
      .orderBy(desc(savedTripsTable.updatedAt));
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch saved trips" });
  }
});

// GET /api/saved-trips/:id — get single saved trip
router.get("/:id", authenticate, async (req, res) => {
  try {
    const [trip] = await db
      .select()
      .from(savedTripsTable)
      .where(
        and(
          eq(savedTripsTable.id, req.params.id as string),
          eq(savedTripsTable.userId, req.user!.userId)
        )
      )
      .limit(1);

    if (!trip) {
      res.status(404).json({ error: "Saved trip not found" });
      return;
    }
    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch saved trip" });
  }
});

// POST /api/saved-trips — create saved trip
router.post("/", authenticate, async (req, res) => {
  const schema = z.object({
    tripData: z.any(),
    currentStep: z.number().int().min(1).max(5),
    isComplete: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  try {
    const [trip] = await db
      .insert(savedTripsTable)
      .values({
        userId: req.user!.userId,
        tripData: parsed.data.tripData,
        currentStep: parsed.data.currentStep,
        isComplete: parsed.data.isComplete ?? false,
      })
      .returning();

    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save trip" });
  }
});

// PUT /api/saved-trips/:id — update saved trip (auto-save)
router.put("/:id", authenticate, async (req, res) => {
  const schema = z.object({
    tripData: z.any().optional(),
    currentStep: z.number().int().min(1).max(5).optional(),
    isComplete: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  try {
    const [updated] = await db
      .update(savedTripsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(savedTripsTable.id, req.params.id as string),
          eq(savedTripsTable.userId, req.user!.userId)
        )
      )
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Saved trip not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update saved trip" });
  }
});

// DELETE /api/saved-trips/:id — delete saved trip
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(savedTripsTable)
      .where(
        and(
          eq(savedTripsTable.id, req.params.id as string),
          eq(savedTripsTable.userId, req.user!.userId)
        )
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Saved trip not found" });
      return;
    }
    res.json({ message: "Saved trip deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete saved trip" });
  }
});

export default router;
