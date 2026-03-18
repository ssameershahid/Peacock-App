import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, transferRoutesTable, transferFixedPricesTable, vehiclesTable } from "@workspace/db";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/transfers
router.get("/", async (_req, res) => {
  try {
    const routes = await db
      .select()
      .from(transferRoutesTable)
      .where(eq(transferRoutesTable.isActive, true));

    const allPrices = await db.select().from(transferFixedPricesTable);
    const pricesByRoute = allPrices.reduce<Record<string, typeof allPrices>>(
      (acc, p) => {
        if (!acc[p.transferRouteId]) acc[p.transferRouteId] = [];
        acc[p.transferRouteId].push(p);
        return acc;
      },
      {}
    );

    res.json(
      routes.map((r) => ({ ...r, fixedPrices: pricesByRoute[r.id] || [] }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transfers" });
  }
});

// GET /api/transfers/calculate
// Query: vehicleType, distanceKm (for custom, non-fixed routes)
router.get("/calculate", async (req, res) => {
  try {
    const { vehicleType, distanceKm } = req.query as Record<string, string>;
    if (!vehicleType || !distanceKm) {
      res.status(400).json({ error: "vehicleType and distanceKm required" });
      return;
    }

    const [vehicle] = await db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.type, vehicleType))
      .limit(1);

    if (!vehicle) {
      res.status(404).json({ error: "Vehicle type not found" });
      return;
    }

    const km = parseFloat(distanceKm);
    const price = vehicle.pricePerKm * km;
    const minimumCharge = vehicle.pricePerDay;

    res.json({
      vehicleType,
      distanceKm: km,
      priceGBP: Math.max(price, minimumCharge),
      breakdown: {
        ratePerKm: vehicle.pricePerKm,
        calculatedPrice: price,
        minimumCharge,
        applied: price < minimumCharge ? "minimum" : "distance",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Calculation failed" });
  }
});

// GET /api/transfers/:id
router.get("/:id", async (req, res) => {
  try {
    const [route] = await db
      .select()
      .from(transferRoutesTable)
      .where(eq(transferRoutesTable.id, req.params.id as string))
      .limit(1);
    if (!route) {
      res.status(404).json({ error: "Transfer route not found" });
      return;
    }

    const prices = await db
      .select()
      .from(transferFixedPricesTable)
      .where(eq(transferFixedPricesTable.transferRouteId, route.id));

    res.json({ ...route, fixedPrices: prices });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transfer" });
  }
});

// POST /api/transfers (admin)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { fixedPrices, ...routeData } = req.body;
    const [route] = await db
      .insert(transferRoutesTable)
      .values(routeData)
      .returning();

    if (fixedPrices?.length) {
      await db.insert(transferFixedPricesTable).values(
        fixedPrices.map((p: any) => ({ ...p, transferRouteId: route.id }))
      );
    }

    res.status(201).json(route);
  } catch (err) {
    res.status(500).json({ error: "Failed to create transfer route" });
  }
});

// PUT /api/transfers/:id (admin)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { fixedPrices, ...routeData } = req.body;
    const [updated] = await db
      .update(transferRoutesTable)
      .set(routeData)
      .where(eq(transferRoutesTable.id, req.params.id as string))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Route not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update transfer route" });
  }
});

export default router;
