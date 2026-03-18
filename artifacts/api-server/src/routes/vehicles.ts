import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db, vehiclesTable } from "@workspace/db";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/vehicles
router.get("/", async (_req, res) => {
  try {
    const vehicles = await db
      .select()
      .from(vehiclesTable)
      .orderBy(asc(vehiclesTable.sortOrder));
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// GET /api/vehicles/:id
router.get("/:id", async (req, res) => {
  try {
    const [vehicle] = await db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.id, req.params.id as string))
      .limit(1);
    if (!vehicle) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

// POST /api/vehicles (admin)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const [vehicle] = await db
      .insert(vehiclesTable)
      .values(req.body)
      .returning();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: "Failed to create vehicle" });
  }
});

// PUT /api/vehicles/:id (admin)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const [updated] = await db
      .update(vehiclesTable)
      .set(req.body)
      .where(eq(vehiclesTable.id, req.params.id as string))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update vehicle" });
  }
});

export default router;
