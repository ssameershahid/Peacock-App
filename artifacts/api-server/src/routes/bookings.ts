import { Router } from "express";
import { z } from "zod";
import { eq, and, desc, like, sql, inArray } from "drizzle-orm";
import {
  db,
  bookingsTable,
  bookingActivitiesTable,
  toursTable,
  transferRoutesTable,
  usersTable,
  driversTable,
  reviewsTable,
} from "@workspace/db";
import { authenticate, requireAdmin, requireDriver } from "../middleware/auth.js";
import { createCheckoutSession } from "../lib/stripe.js";
import {
  sendDriverAssigned,
  sendCancellationConfirmation,
} from "../lib/email.js";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

async function generateReferenceCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PKD-${year}-`;
  const [result] = await db
    .select({ code: bookingsTable.referenceCode })
    .from(bookingsTable)
    .where(like(bookingsTable.referenceCode, `${prefix}%`))
    .orderBy(desc(bookingsTable.referenceCode))
    .limit(1);
  let next = 1;
  if (result?.code) {
    const num = parseInt(result.code.replace(prefix, ""), 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `${prefix}${String(next).padStart(3, "0")}`;
}

async function logBookingActivity(
  bookingId: string,
  action: string,
  details?: Record<string, any>,
  performedBy?: string,
  performedByName?: string
) {
  await db.insert(bookingActivitiesTable).values({
    bookingId,
    action,
    details: details || null,
    performedBy: performedBy || null,
    performedByName: performedByName || null,
  });
}

// Enrich bookings with tour name, customer name, etc.
async function enrichBookings(bookings: any[]) {
  if (bookings.length === 0) return [];

  // Gather unique IDs
  const customerIds = [...new Set(bookings.map((b) => b.customerId))];
  const tourIds = [
    ...new Set(bookings.filter((b) => b.tourId).map((b) => b.tourId!)),
  ];

  // Batch-fetch customers
  const customers =
    customerIds.length > 0
      ? await db
          .select({
            id: usersTable.id,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            email: usersTable.email,
            phone: usersTable.phone,
            country: usersTable.country,
            createdAt: usersTable.createdAt,
          })
          .from(usersTable)
          .where(inArray(usersTable.id, customerIds))
      : [];
  // Simple map approach — works for small datasets
  const customerMap: Record<string, any> = {};
  for (const c of customers) customerMap[c.id] = c;

  // Batch-fetch tours (include slug + hero image for tourist portal)
  const tours =
    tourIds.length > 0
      ? await db.select({ id: toursTable.id, name: toursTable.name, slug: toursTable.slug, heroImages: toursTable.heroImages }).from(toursTable)
      : [];
  const tourMap: Record<string, { name: string; slug: string; heroImage: string | null }> = {};
  for (const t of tours) tourMap[t.id] = { name: t.name, slug: t.slug, heroImage: t.heroImages?.[0] || null };

  // Batch-fetch drivers for enrichment
  const driverIds = [...new Set(bookings.filter(b => b.driverId).map(b => b.driverId!))];
  const driverMap: Record<string, any> = {};
  if (driverIds.length > 0) {
    const driverRows = await db.select().from(driversTable).where(inArray(driversTable.id, driverIds));
    const driverUserIds = driverRows.map(d => d.userId);
    const driverUsers = driverUserIds.length > 0
      ? await db.select({ id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName, phone: usersTable.phone, profileImageUrl: usersTable.profileImageUrl }).from(usersTable).where(inArray(usersTable.id, driverUserIds))
      : [];
    const duMap: Record<string, any> = {};
    for (const u of driverUsers) duMap[u.id] = u;
    for (const d of driverRows) {
      const u = duMap[d.userId];
      driverMap[d.id] = {
        id: d.id,
        name: u ? [u.firstName, u.lastName].filter(Boolean).join(" ") : d.id,
        phone: u?.phone || "",
        photo: u?.profileImageUrl || null,
        languages: d.languages || [],
        experienceYears: d.experienceYears || 0,
      };
    }
  }

  // Check which bookings have reviews
  const bookingIds = bookings.map(b => b.id);
  const reviewedRows = bookingIds.length > 0
    ? await db.select({ bookingId: reviewsTable.bookingId }).from(reviewsTable).where(inArray(reviewsTable.bookingId, bookingIds))
    : [];
  const reviewedSet = new Set(reviewedRows.map(r => r.bookingId));

  return bookings.map((b) => {
    const cust = customerMap[b.customerId];
    const tourData = b.tourId ? tourMap[b.tourId] : null;
    return {
      ...b,
      tourName: tourData?.name || null,
      tourSlug: tourData?.slug || null,
      tourImage: tourData?.heroImage || null,
      reviewed: reviewedSet.has(b.id),
      customer: cust
        ? {
            id: cust.id,
            name: [cust.firstName, cust.lastName].filter(Boolean).join(" "),
            email: cust.email,
            phone: cust.phone,
            country: cust.country,
            memberSince: cust.createdAt,
          }
        : { name: "Unknown", email: "", phone: "" },
      driver: b.driverId ? driverMap[b.driverId] || null : null,
    };
  });
}

// GET /api/bookings
router.get("/", authenticate, async (req, res) => {
  try {
    const { role, userId } = req.user!;

    let bookings;
    if (role === "ADMIN") {
      bookings = await db
        .select()
        .from(bookingsTable)
        .orderBy(desc(bookingsTable.createdAt));
    } else if (role === "DRIVER") {
      const [driver] = await db
        .select()
        .from(driversTable)
        .where(eq(driversTable.userId, userId))
        .limit(1);
      if (!driver) {
        res.json([]);
        return;
      }
      bookings = await db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.driverId, driver.id))
        .orderBy(desc(bookingsTable.startDate));
    } else {
      bookings = await db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.customerId, userId))
        .orderBy(desc(bookingsTable.createdAt));
    }

    const enriched = await enrichBookings(bookings);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET /api/bookings/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, req.params.id as string))
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    const { role, userId } = req.user!;
    if (role !== "ADMIN" && booking.customerId !== userId) {
      // Check if driver
      if (role === "DRIVER") {
        const [driver] = await db
          .select()
          .from(driversTable)
          .where(eq(driversTable.userId, userId))
          .limit(1);
        if (!driver || booking.driverId !== driver.id) {
          res.status(403).json({ error: "Access denied" });
          return;
        }
      } else {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    // Enrich with driver and tour info
    const enriched = (await enrichBookings([booking]))[0];
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// POST /api/bookings
router.post("/", authenticate, async (req, res) => {
  const schema = z.object({
    type: z.enum(["READY_MADE", "CUSTOM", "TRANSFER"]),
    tourId: z.string().optional(),
    transferRouteId: z.string().optional(),
    vehicleType: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    numDays: z.number().optional(),
    pickupTime: z.string().optional(),
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    passengers: z.number().int().min(1),
    specialRequests: z.string().max(500).optional(),
    addOns: z.any().optional(),
    pricingBreakdown: z.any().optional(),
    totalGBP: z.number().positive(),
    passportNumber: z.string().optional(),
    hotelDetails: z.string().optional(),
    flightNumber: z.string().optional(),
    arrivalTime: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  try {
    const referenceCode = await generateReferenceCode();
    const [booking] = await db
      .insert(bookingsTable)
      .values({
        ...parsed.data,
        referenceCode,
        customerId: req.user!.userId,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
        status: "PENDING",
        paymentStatus: "PENDING",
      })
      .returning();

    // Log booking creation activity
    const [cust] = await db.select({ firstName: usersTable.firstName, lastName: usersTable.lastName }).from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    const custName = cust ? [cust.firstName, cust.lastName].filter(Boolean).join(" ") : "Customer";
    await logBookingActivity(booking.id, "created", { referenceCode }, req.user!.userId, custName);

    // Get tour name for checkout description
    let description = "Peacock Drivers — ";
    if (parsed.data.tourId) {
      const [tour] = await db
        .select({ name: toursTable.name })
        .from(toursTable)
        .where(eq(toursTable.id, parsed.data.tourId))
        .limit(1);
      description += tour?.name || "Tour";
    } else if (parsed.data.transferRouteId) {
      const [route] = await db
        .select({ name: transferRoutesTable.name })
        .from(transferRoutesTable)
        .where(eq(transferRoutesTable.id, parsed.data.transferRouteId))
        .limit(1);
      description += route?.name || "Transfer";
    } else {
      description += "Custom Tour";
    }

    const [customer] = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId))
      .limit(1);

    const session = await createCheckoutSession({
      referenceCode,
      bookingId: booking.id,
      customerId: req.user!.userId,
      customerEmail: customer.email,
      description,
      amountGBP: booking.totalGBP,
      successUrl: `${FRONTEND_URL}/confirmation?ref=${referenceCode}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${FRONTEND_URL}/checkout?cancelled=true`,
    });

    // Store stripe session ID
    await db
      .update(bookingsTable)
      .set({ stripeSessionId: session.id, updatedAt: new Date() })
      .where(eq(bookingsTable.id, booking.id));

    res.status(201).json({
      booking,
      checkoutUrl: session.url,
    });
  } catch (err) {
    console.error("Booking create error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// PUT /api/bookings/:id (admin: assign driver, update status, notes)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const schema = z.object({
      status: z.enum(["PENDING","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"]).optional(),
      driverId: z.string().optional(),
      driverNotes: z.string().optional(),
      paymentStatus: z.enum(["PENDING","PAID","REFUNDED","FAILED"]).optional(),
    });
    const data = schema.parse(req.body);
    // Fetch old booking for activity logging
    const [oldBooking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, req.params.id as string)).limit(1);

    const [updated] = await db
      .update(bookingsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookingsTable.id, req.params.id as string))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    // Log activity for status change
    if (data.status && oldBooking && data.status !== oldBooking.status) {
      await logBookingActivity(updated.id, "status_changed", { fromStatus: oldBooking.status, toStatus: data.status }, req.user!.userId, "Admin");
    }

    // Log activity for driver assignment
    if (data.driverId && (!oldBooking || data.driverId !== oldBooking.driverId)) {
      const [drvUser] = await db.select().from(driversTable).where(eq(driversTable.id, data.driverId)).limit(1);
      let driverName = data.driverId;
      if (drvUser) {
        const [u] = await db.select({ firstName: usersTable.firstName, lastName: usersTable.lastName }).from(usersTable).where(eq(usersTable.id, drvUser.userId)).limit(1);
        if (u) driverName = [u.firstName, u.lastName].filter(Boolean).join(" ");
      }
      await logBookingActivity(updated.id, "driver_assigned", { driverId: data.driverId, driverName }, req.user!.userId, "Admin");
    }

    // If driver was just assigned, send notification emails
    if (data.driverId && data.status === "CONFIRMED") {
      const [[customer], [driver]] = await Promise.all([
        db
          .select({ email: usersTable.email, firstName: usersTable.firstName })
          .from(usersTable)
          .where(eq(usersTable.id, updated.customerId))
          .limit(1),
        db
          .select({ userId: driversTable.userId })
          .from(driversTable)
          .where(eq(driversTable.id, data.driverId))
          .limit(1),
      ]);

      if (customer && driver) {
        const [driverUser] = await db
          .select({ email: usersTable.email, firstName: usersTable.firstName, phone: usersTable.phone })
          .from(usersTable)
          .where(eq(usersTable.id, driver.userId))
          .limit(1);

        sendDriverAssigned({
          to: customer.email,
          firstName: customer.firstName || "there",
          referenceCode: updated.referenceCode,
          driverName: `${driverUser?.firstName || "Your driver"}`,
          driverPhone: driverUser?.phone || undefined,
          vehicleDetails: updated.vehicleType,
          startDate: updated.startDate.toDateString(),
        }).catch(console.error);
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// PUT /api/bookings/:id/cancel
router.put("/:id/cancel", authenticate, async (req, res) => {
  try {
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, req.params.id as string))
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    const { role, userId } = req.user!;
    if (role !== "ADMIN" && booking.customerId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const { reason } = req.body;
    const [cancelled] = await db
      .update(bookingsTable)
      .set({
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(bookingsTable.id, req.params.id as string))
      .returning();

    await logBookingActivity(cancelled.id, "cancelled", { reason }, req.user!.userId, role === "ADMIN" ? "Admin" : "Customer");

    const [customer] = await db
      .select({ email: usersTable.email, firstName: usersTable.firstName })
      .from(usersTable)
      .where(eq(usersTable.id, booking.customerId))
      .limit(1);

    if (customer) {
      sendCancellationConfirmation({
        to: customer.email,
        firstName: customer.firstName || "there",
        referenceCode: booking.referenceCode,
        refundAmount: booking.refundAmountGBP || undefined,
      }).catch(console.error);
    }

    res.json(cancelled);
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

// GET /api/bookings/:id/activities
router.get("/:id/activities", authenticate, async (req, res) => {
  try {
    const activities = await db
      .select()
      .from(bookingActivitiesTable)
      .where(eq(bookingActivitiesTable.bookingId, req.params.id as string))
      .orderBy(desc(bookingActivitiesTable.createdAt));
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

export default router;
