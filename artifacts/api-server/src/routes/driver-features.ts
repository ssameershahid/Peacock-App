import { Router } from "express";
import { z } from "zod";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import {
  db,
  driversTable,
  notificationsTable,
  driverDocumentsTable,
  driverUnavailableDatesTable,
  driverRatingsTable,
  driverChecklistTable,
  bookingsTable,
} from "@workspace/db";
import { authenticate, requireDriver } from "../middleware/auth.js";

const router = Router();

// ── Helper: get driver record for current user ──────────────────────────────
async function getDriver(userId: string) {
  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.userId, userId))
    .limit(1);
  return driver;
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/drivers/notifications
router.get("/notifications", authenticate, requireDriver, async (req, res) => {
  try {
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, req.user!.userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PUT /api/drivers/notifications/:id/read
router.put("/notifications/:id/read", authenticate, requireDriver, async (req, res) => {
  try {
    const [updated] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationsTable.id, req.params.id as string),
          eq(notificationsTable.userId, req.user!.userId)
        )
      )
      .returning();
    res.json(updated || { ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// PUT /api/drivers/notifications/read-all
router.put("/notifications/read-all", authenticate, requireDriver, async (req, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationsTable.userId, req.user!.userId),
          eq(notificationsTable.isRead, false)
        )
      );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/drivers/documents
router.get("/documents", authenticate, requireDriver, async (req, res) => {
  try {
    const driver = await getDriver(req.user!.userId);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }

    const docs = await db
      .select()
      .from(driverDocumentsTable)
      .where(eq(driverDocumentsTable.driverId, driver.id));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// POST /api/drivers/documents
router.post("/documents", authenticate, requireDriver, async (req, res) => {
  const schema = z.object({
    docType: z.enum(["DRIVING_LICENSE", "TOUR_GUIDE_CERTIFICATE", "VEHICLE_INSURANCE", "VEHICLE_REGISTRATION"]),
    fileName: z.string(),
    fileUrl: z.string(),
    expiresAt: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const driver = await getDriver(req.user!.userId);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }

    const [doc] = await db
      .insert(driverDocumentsTable)
      .values({
        driverId: driver.id,
        docType: parsed.data.docType,
        fileName: parsed.data.fileName,
        fileUrl: parsed.data.fileUrl,
        status: "PENDING",
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      })
      .returning();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload document" });
  }
});

// DELETE /api/drivers/documents/:id
router.delete("/documents/:id", authenticate, requireDriver, async (req, res) => {
  try {
    const driver = await getDriver(req.user!.userId);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }

    const [doc] = await db
      .select()
      .from(driverDocumentsTable)
      .where(
        and(
          eq(driverDocumentsTable.id, req.params.id as string),
          eq(driverDocumentsTable.driverId, driver.id)
        )
      )
      .limit(1);

    if (!doc) { res.status(404).json({ error: "Document not found" }); return; }

    await db.delete(driverDocumentsTable).where(eq(driverDocumentsTable.id, doc.id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AVAILABILITY
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/drivers/availability?month=2026-04
router.get("/availability", authenticate, requireDriver, async (req, res) => {
  try {
    const driver = await getDriver(req.user!.userId);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }

    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const unavailable = await db
      .select()
      .from(driverUnavailableDatesTable)
      .where(
        and(
          eq(driverUnavailableDatesTable.driverId, driver.id),
          gte(driverUnavailableDatesTable.date, startDate),
          lte(driverUnavailableDatesTable.date, endDate)
        )
      );

    // Also get booked dates from bookings
    const bookings = await db
      .select({ startDate: bookingsTable.startDate, endDate: bookingsTable.endDate })
      .from(bookingsTable)
      .where(eq(bookingsTable.driverId, driver.id));

    const bookedDates: string[] = [];
    for (const b of bookings) {
      if (!b.startDate) continue;
      const start = new Date(b.startDate);
      const end = b.endDate ? new Date(b.endDate) : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().slice(0, 10);
        if (ds >= startDate && ds <= endDate) bookedDates.push(ds);
      }
    }

    res.json({
      unavailableDates: unavailable.map((u) => u.date),
      bookedDates: [...new Set(bookedDates)],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// PUT /api/drivers/availability
router.put("/availability", authenticate, requireDriver, async (req, res) => {
  const schema = z.object({
    unavailableDates: z.array(z.string()),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const driver = await getDriver(req.user!.userId);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }

    // Determine month from first date or clear all
    if (parsed.data.unavailableDates.length > 0) {
      const month = parsed.data.unavailableDates[0].slice(0, 7);
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;

      // Delete existing entries for this month
      await db
        .delete(driverUnavailableDatesTable)
        .where(
          and(
            eq(driverUnavailableDatesTable.driverId, driver.id),
            gte(driverUnavailableDatesTable.date, startDate),
            lte(driverUnavailableDatesTable.date, endDate)
          )
        );

      // Insert new entries
      if (parsed.data.unavailableDates.length > 0) {
        await db.insert(driverUnavailableDatesTable).values(
          parsed.data.unavailableDates.map((date) => ({
            driverId: driver.id,
            date,
          }))
        );
      }
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update availability" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// RATINGS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/drivers/ratings
router.get("/ratings", authenticate, requireDriver, async (req, res) => {
  try {
    const driver = await getDriver(req.user!.userId);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }

    const ratings = await db
      .select()
      .from(driverRatingsTable)
      .where(eq(driverRatingsTable.driverId, driver.id))
      .orderBy(desc(driverRatingsTable.createdAt));

    const total = ratings.length;
    const average = total > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / total : 0;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of ratings) {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
    }

    res.json({
      average: Math.round(average * 10) / 10,
      totalTrips: total,
      breakdown,
      reviews: ratings.slice(0, 10).map((r) => ({
        id: r.id,
        touristName: r.touristName,
        touristCountry: r.touristCountry,
        tourName: r.tourName,
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// CHECKLIST
// ══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CHECKLIST = [
  "vehicle-cleaned",
  "fuel-full",
  "welcome-pack",
  "flight-confirmed",
  "route-reviewed",
  "phone-charged",
];

// GET /api/drivers/trips/:id/checklist
router.get("/trips/:id/checklist", authenticate, requireDriver, async (req, res) => {
  try {
    const driver = await getDriver(req.user!.userId);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }

    const items = await db
      .select()
      .from(driverChecklistTable)
      .where(
        and(
          eq(driverChecklistTable.driverId, driver.id),
          eq(driverChecklistTable.bookingId, req.params.id as string)
        )
      );

    // Build full checklist with defaults
    const checkedMap = new Map(items.map((i) => [i.itemKey, i.checked]));
    const checklist = DEFAULT_CHECKLIST.map((key) => ({
      id: key,
      checked: checkedMap.get(key) ?? false,
    }));

    res.json({ items: checklist });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch checklist" });
  }
});

// PUT /api/drivers/trips/:id/checklist
router.put("/trips/:id/checklist", authenticate, requireDriver, async (req, res) => {
  const schema = z.object({
    items: z.array(z.object({ id: z.string(), checked: z.boolean() })),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const driver = await getDriver(req.user!.userId);
    if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }

    const bookingId = req.params.id as string;

    for (const item of parsed.data.items) {
      // Upsert each item
      const [existing] = await db
        .select()
        .from(driverChecklistTable)
        .where(
          and(
            eq(driverChecklistTable.driverId, driver.id),
            eq(driverChecklistTable.bookingId, bookingId),
            eq(driverChecklistTable.itemKey, item.id)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(driverChecklistTable)
          .set({ checked: item.checked })
          .where(eq(driverChecklistTable.id, existing.id));
      } else {
        await db.insert(driverChecklistTable).values({
          driverId: driver.id,
          bookingId,
          itemKey: item.id,
          checked: item.checked,
        });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update checklist" });
  }
});

export default router;
