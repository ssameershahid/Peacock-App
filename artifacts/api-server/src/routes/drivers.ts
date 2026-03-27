import { Router } from "express";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import {
  db,
  driversTable,
  driverVehiclesTable,
  driverPayoutRatesTable,
  usersTable,
  bookingsTable,
} from "@workspace/db";
import { authenticate, requireAdmin, requireDriver } from "../middleware/auth.js";
import { hashPassword } from "../lib/auth.js";

const router = Router();

// GET /api/drivers (admin)
router.get("/", authenticate, requireAdmin, async (_req, res) => {
  try {
    const drivers = await db.select().from(driversTable);
    const driverIds = drivers.map((d) => d.id);

    const allVehicles = await db.select().from(driverVehiclesTable);
    const vehiclesByDriver = allVehicles.reduce<Record<string, typeof allVehicles>>(
      (acc, v) => {
        if (!acc[v.driverId]) acc[v.driverId] = [];
        acc[v.driverId].push(v);
        return acc;
      },
      {}
    );

    // Get user info
    const userIds = drivers.map((d) => d.userId);
    const users = userIds.length
      ? await db.select({
          id: usersTable.id,
          email: usersTable.email,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          phone: usersTable.phone,
        }).from(usersTable)
      : [];
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));

    res.json(
      drivers.map((d) => ({
        ...d,
        vehicles: vehiclesByDriver[d.id] || [],
        user: usersById[d.userId],
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

// GET /api/drivers/me (driver's own profile)
router.get("/me", authenticate, requireDriver, async (req, res) => {
  try {
    const [driver] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.userId, req.user!.userId))
      .limit(1);

    if (!driver) {
      res.status(404).json({ error: "Driver profile not found" });
      return;
    }

    const [vehicles, driverUser] = await Promise.all([
      db.select().from(driverVehiclesTable).where(eq(driverVehiclesTable.driverId, driver.id)),
      db.select({
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        phone: usersTable.phone,
        email: usersTable.email,
        profileImageUrl: usersTable.profileImageUrl,
      }).from(usersTable).where(eq(usersTable.id, driver.userId)).limit(1),
    ]);

    res.json({ ...driver, vehicles, user: driverUser[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch driver profile" });
  }
});

// PUT /api/drivers/me (driver updates own profile)
router.put("/me", authenticate, requireDriver, async (req, res) => {
  const schema = z.object({
    bio: z.string().optional(),
    languages: z.array(z.string()).optional(),
    experienceYears: z.number().optional(),
    regionPreferences: z.array(z.string()).optional(),
    available: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [updated] = await db
      .update(driversTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(driversTable.userId, req.user!.userId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Driver profile not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update driver profile" });
  }
});

// GET /api/drivers/:id (admin)
router.get("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const [driver] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.id, req.params.id as string))
      .limit(1);

    if (!driver) {
      res.status(404).json({ error: "Driver not found" });
      return;
    }

    const [vehicles, payoutRates, driverUser] = await Promise.all([
      db.select().from(driverVehiclesTable).where(eq(driverVehiclesTable.driverId, driver.id)),
      db.select().from(driverPayoutRatesTable).where(eq(driverPayoutRatesTable.driverId, driver.id)),
      db.select().from(usersTable).where(eq(usersTable.id, driver.userId)).limit(1),
    ]);

    res.json({ ...driver, vehicles, payoutRates, user: driverUser[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch driver" });
  }
});

// POST /api/drivers (admin: create driver account + user)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    languages: z.array(z.string()).optional(),
    experienceYears: z.number().optional(),
    regionPreferences: z.array(z.string()).optional(),
    vehicles: z
      .array(
        z.object({
          vehicleType: z.string(),
          plateNumber: z.string(),
          year: z.number().optional(),
          features: z.array(z.string()).optional(),
          photoUrl: z.string().optional(),
        })
      )
      .optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  try {
    const { email, password, firstName, lastName, phone, vehicles, ...driverData } = parsed.data;

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(usersTable)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        role: "DRIVER",
      })
      .returning();

    const [driver] = await db
      .insert(driversTable)
      .values({
        userId: user.id,
        ...driverData,
        languages: driverData.languages || [],
        regionPreferences: driverData.regionPreferences || [],
      })
      .returning();

    if (vehicles?.length) {
      await db.insert(driverVehiclesTable).values(
        vehicles.map((v) => ({
          ...v,
          driverId: driver.id,
          features: v.features || [],
        }))
      );
    }

    res.status(201).json({ ...driver, user });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create driver" });
  }
});

// PUT /api/drivers/:id (admin)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const [updated] = await db
      .update(driversTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(driversTable.id, req.params.id as string))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Driver not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update driver" });
  }
});

// GET /api/driver/trips (driver's own trips)
router.get("/trips/mine", authenticate, requireDriver, async (req, res) => {
  try {
    const [driver] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.userId, req.user!.userId))
      .limit(1);

    if (!driver) {
      res.status(404).json({ error: "Driver profile not found" });
      return;
    }

    const trips = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.driverId, driver.id))
      .orderBy(desc(bookingsTable.startDate));

    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

// PUT /api/driver/trips/:id (driver updates trip status — accept, decline, start, complete)
router.put("/trips/:id", authenticate, requireDriver, async (req, res) => {
  const allowedStatuses = ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
  const schema = z.object({
    status: z.enum(allowedStatuses),
    reason: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  try {
    const [driver] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.userId, req.user!.userId))
      .limit(1);

    if (!driver) {
      res.status(404).json({ error: "Driver profile not found" });
      return;
    }

    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, req.params.id as string))
      .limit(1);

    if (!booking || booking.driverId !== driver.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const updateData: any = { status: parsed.data.status, updatedAt: new Date() };

    // If declining (CANCELLED), record reason and unassign driver
    if (parsed.data.status === "CANCELLED" && parsed.data.reason) {
      updateData.cancellationReason = parsed.data.reason;
      updateData.cancelledAt = new Date();
      updateData.driverId = null;
    }

    const [updated] = await db
      .update(bookingsTable)
      .set(updateData)
      .where(eq(bookingsTable.id, req.params.id as string))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update trip" });
  }
});

// GET /api/driver/earnings
router.get("/earnings/summary", authenticate, requireDriver, async (req, res) => {
  try {
    const [driver] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.userId, req.user!.userId))
      .limit(1);

    if (!driver) {
      res.status(404).json({ error: "Driver profile not found" });
      return;
    }

    const trips = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.driverId, driver.id));

    const completed = trips.filter((t) => t.status === "COMPLETED");
    const totalEarnings = completed.reduce((sum, t) => sum + t.totalGBP * 0.7, 0); // 70% driver share
    const thisMonth = completed.filter(
      (t) => t.startDate.getMonth() === new Date().getMonth()
    );
    const monthlyEarnings = thisMonth.reduce(
      (sum, t) => sum + t.totalGBP * 0.7,
      0
    );

    res.json({
      totalTrips: trips.length,
      completedTrips: completed.length,
      totalEarningsGBP: totalEarnings,
      monthlyEarningsGBP: monthlyEarnings,
      pendingTrips: trips.filter((t) =>
        ["PENDING", "CONFIRMED"].includes(t.status)
      ).length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
});

export default router;
