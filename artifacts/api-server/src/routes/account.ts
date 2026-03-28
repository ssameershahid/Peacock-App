import { Router } from "express";
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  db,
  bookingsTable,
  toursTable,
  usersTable,
  driversTable,
  notificationsTable,
  reviewsTable,
  communicationPreferencesTable,
  shareTokensTable,
  itineraryDaysTable,
} from "@workspace/db";
import { authenticate } from "../middleware/auth.js";
import { randomUUID } from "node:crypto";

const router = Router();

// ── Dashboard ───────────────────────────────────────────────────────────────

router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Fetch all user bookings
    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.customerId, userId))
      .orderBy(desc(bookingsTable.startDate));

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Enrich bookings with tour data and driver data
    const tourIds = [...new Set(bookings.filter(b => b.tourId).map(b => b.tourId!))];
    const tourMap: Record<string, any> = {};
    if (tourIds.length > 0) {
      const tours = await db.select().from(toursTable);
      for (const t of tours) tourMap[t.id] = t;
    }

    // Fetch itinerary days for tours
    const itineraryMap: Record<string, any[]> = {};
    if (tourIds.length > 0) {
      const days = await db.select().from(itineraryDaysTable);
      for (const d of days) {
        if (!itineraryMap[d.tourId]) itineraryMap[d.tourId] = [];
        itineraryMap[d.tourId].push(d);
      }
      for (const key in itineraryMap) {
        itineraryMap[key].sort((a, b) => a.dayNumber - b.dayNumber);
      }
    }

    const driverIds = [...new Set(bookings.filter(b => b.driverId).map(b => b.driverId!))];
    const driverMap: Record<string, any> = {};
    if (driverIds.length > 0) {
      const driverRows = await db.select().from(driversTable);
      const driverUserIds = driverRows.map(d => d.userId);
      const driverUsers = driverUserIds.length > 0
        ? await db.select().from(usersTable)
        : [];
      const duMap: Record<string, any> = {};
      for (const u of driverUsers) duMap[u.id] = u;
      for (const d of driverRows) {
        const u = duMap[d.userId];
        driverMap[d.id] = {
          id: d.id,
          name: u ? [u.firstName, u.lastName].filter(Boolean).join(" ") : "",
          phone: u?.phone || "",
          languages: d.languages || [],
          experienceYears: d.experienceYears || 0,
          photo: u?.profileImageUrl || null,
        };
      }
    }

    // Fetch existing reviews for this user
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.userId, userId));
    const reviewedBookingIds = new Set(reviews.map(r => r.bookingId));

    // Categorize bookings
    const upcomingTrips: any[] = [];
    const activeTrips: any[] = [];
    const completedTripsNeedingReview: any[] = [];
    let totalSpent = 0;

    for (const b of bookings) {
      const tour = b.tourId ? tourMap[b.tourId] : null;
      const driver = b.driverId ? driverMap[b.driverId] : null;
      const startDate = b.startDate.toISOString().split("T")[0];
      const endDate = b.endDate?.toISOString().split("T")[0] || startDate;
      const daysUntil = Math.ceil((new Date(startDate).getTime() - now.getTime()) / 86400000);
      const daysSinceEnd = Math.ceil((now.getTime() - new Date(endDate).getTime()) / 86400000);

      // Calculate prep status
      const preparation = {
        flightAdded: !!b.flightNumber,
        passportAdded: !!b.passportNumber,
        hotelsAdded: !!b.hotelDetails,
        specialRequestsReviewed: !!b.specialRequests,
        emergencyContactAdded: !!b.emergencyContactName,
        completedCount: [b.flightNumber, b.passportNumber, b.hotelDetails, b.specialRequests, b.emergencyContactName].filter(Boolean).length,
        totalCount: 5,
      };

      const itinerary = b.tourId ? (itineraryMap[b.tourId] || []) : [];

      const enriched = {
        id: b.id,
        referenceCode: b.referenceCode,
        tourName: tour?.name || b.referenceCode,
        tourSlug: tour?.slug || "",
        heroImage: tour?.heroImages?.[0] || "",
        startDate,
        endDate,
        daysUntil,
        vehicleType: b.vehicleType,
        passengers: b.passengers,
        status: b.status,
        totalGBP: b.totalGBP,
        driverAssigned: !!b.driverId,
        driver,
        preparation,
        itinerary: itinerary.map(d => ({
          day: d.dayNumber,
          title: d.title,
          location: d.location,
          description: d.description,
        })),
      };

      if (b.status === "CONFIRMED" || b.status === "PENDING") {
        if (daysUntil >= 0) {
          upcomingTrips.push(enriched);
        }
      } else if (b.status === "IN_PROGRESS") {
        const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
        const currentDay = totalDays - Math.ceil((new Date(endDate).getTime() - now.getTime()) / 86400000) + 1;
        activeTrips.push({ ...enriched, currentDay, totalDays });
      } else if (b.status === "COMPLETED" && !reviewedBookingIds.has(b.id)) {
        completedTripsNeedingReview.push({
          id: b.id,
          referenceCode: b.referenceCode,
          tourName: tour?.name || b.referenceCode,
        });
      }

      if (b.paymentStatus === "PAID") totalSpent += b.totalGBP;
    }

    // Sort upcoming by soonest first
    upcomingTrips.sort((a, b) => a.daysUntil - b.daysUntil);

    res.json({
      upcomingTrips,
      activeTrips,
      completedTripsNeedingReview,
      totalTrips: bookings.length,
      totalSpent: Math.round(totalSpent),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// ── Notifications ───────────────────────────────────────────────────────────

router.get("/notifications", authenticate, async (req, res) => {
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

router.put("/notifications/:id/read", authenticate, async (req, res) => {
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
    res.status(500).json({ error: "Failed to mark notification read" });
  }
});

router.put("/notifications/read-all", authenticate, async (req, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, req.user!.userId));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

// ── Reviews ─────────────────────────────────────────────────────────────────

router.post("/reviews", authenticate, async (req, res) => {
  const schema = z.object({
    bookingId: z.string(),
    rating: z.number().int().min(1).max(5),
    reviewText: z.string().max(500).optional(),
    wouldRecommend: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  try {
    // Verify booking belongs to user
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.id, parsed.data.bookingId),
          eq(bookingsTable.customerId, req.user!.userId)
        )
      )
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    // Check if already reviewed
    const [existing] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.bookingId, parsed.data.bookingId))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "Already reviewed" });
      return;
    }

    const [review] = await db
      .insert(reviewsTable)
      .values({
        bookingId: parsed.data.bookingId,
        userId: req.user!.userId,
        driverId: booking.driverId,
        rating: parsed.data.rating,
        reviewText: parsed.data.reviewText || null,
        wouldRecommend: parsed.data.wouldRecommend ?? null,
      })
      .returning();

    res.status(201).json(review);
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

router.get("/reviews/:bookingId", authenticate, async (req, res) => {
  try {
    const [review] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.bookingId, req.params.bookingId as string))
      .limit(1);
    res.json(review || null);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

router.put("/reviews/:id", authenticate, async (req, res) => {
  const schema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    reviewText: z.string().max(500).optional(),
    wouldRecommend: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const [review] = await db
      .select()
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.id, req.params.id as string),
          eq(reviewsTable.userId, req.user!.userId)
        )
      )
      .limit(1);

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    // Allow edits within 7 days
    const daysSinceCreation = (Date.now() - review.createdAt.getTime()) / 86400000;
    if (daysSinceCreation > 7) {
      res.status(403).json({ error: "Reviews can only be edited within 7 days" });
      return;
    }

    const [updated] = await db
      .update(reviewsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(reviewsTable.id, req.params.id as string))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update review" });
  }
});

// ── Communication Preferences ───────────────────────────────────────────────

router.get("/preferences", authenticate, async (req, res) => {
  try {
    const [prefs] = await db
      .select()
      .from(communicationPreferencesTable)
      .where(eq(communicationPreferencesTable.userId, req.user!.userId))
      .limit(1);

    res.json(prefs || { preTripReminders: true, reviewRequests: true, marketing: false });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

router.put("/preferences", authenticate, async (req, res) => {
  const schema = z.object({
    preTripReminders: z.boolean().optional(),
    reviewRequests: z.boolean().optional(),
    marketing: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    // Upsert
    const [existing] = await db
      .select()
      .from(communicationPreferencesTable)
      .where(eq(communicationPreferencesTable.userId, req.user!.userId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(communicationPreferencesTable)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(communicationPreferencesTable.userId, req.user!.userId))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(communicationPreferencesTable)
        .values({
          userId: req.user!.userId,
          ...parsed.data,
        })
        .returning();
      res.json(created);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// ── Trip Sharing ────────────────────────────────────────────────────────────

router.post("/bookings/:id/share", authenticate, async (req, res) => {
  try {
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.id, req.params.id as string),
          eq(bookingsTable.customerId, req.user!.userId)
        )
      )
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    // Check for existing token
    const [existing] = await db
      .select()
      .from(shareTokensTable)
      .where(eq(shareTokensTable.bookingId, booking.id))
      .limit(1);

    if (existing) {
      res.json({ shareToken: existing.token, shareUrl: `/trips/share/${existing.token}` });
      return;
    }

    const token = randomUUID().replace(/-/g, "").slice(0, 16);
    await db.insert(shareTokensTable).values({
      bookingId: booking.id,
      token,
    });

    res.json({ shareToken: token, shareUrl: `/trips/share/${token}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate share link" });
  }
});

// Public endpoint — no auth required
router.get("/trips/share/:token", async (req, res) => {
  try {
    const [shareToken] = await db
      .select()
      .from(shareTokensTable)
      .where(eq(shareTokensTable.token, req.params.token as string))
      .limit(1);

    if (!shareToken) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, shareToken.bookingId))
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    // Limited public data — no PII
    const tour = booking.tourId
      ? await db.select().from(toursTable).where(eq(toursTable.id, booking.tourId)).limit(1).then(r => r[0])
      : null;

    const itinerary = booking.tourId
      ? await db.select().from(itineraryDaysTable).where(eq(itineraryDaysTable.tourId, booking.tourId))
      : [];

    res.json({
      tourName: tour?.name || "Sri Lanka Trip",
      tourSlug: tour?.slug || "",
      heroImage: tour?.heroImages?.[0] || "",
      startDate: booking.startDate.toISOString().split("T")[0],
      endDate: booking.endDate?.toISOString().split("T")[0] || "",
      highlights: tour?.highlights || [],
      regions: tour?.regions || [],
      itinerary: itinerary.sort((a, b) => a.dayNumber - b.dayNumber).map(d => ({
        day: d.dayNumber,
        title: d.title,
        location: d.location,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

// ── Update booking trip details (tourist self-service) ──────────────────────

router.put("/bookings/:id/details", authenticate, async (req, res) => {
  const schema = z.object({
    passportNumber: z.string().optional(),
    hotelDetails: z.string().optional(),
    flightNumber: z.string().optional(),
    specialRequests: z.string().max(500).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.id, req.params.id as string),
          eq(bookingsTable.customerId, req.user!.userId)
        )
      )
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    const [updated] = await db
      .update(bookingsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(bookingsTable.id, req.params.id as string))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking details" });
  }
});

export default router;
