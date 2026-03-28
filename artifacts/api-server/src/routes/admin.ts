import { Router } from "express";
import { z } from "zod";
import { eq, desc, like, sql, and, gte, lte, or, inArray } from "drizzle-orm";
import {
  db,
  bookingsTable,
  usersTable,
  driversTable,
  driverVehiclesTable,
  driverDocumentsTable,
  driverRatingsTable,
  driverUnavailableDatesTable,
  toursTable,
  transferRoutesTable,
  customTourRequestsTable,
  globalSeasonalPricingTable,
} from "@workspace/db";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── GET /api/admin/today ────────────────────────────────────────────────────
router.get("/today", authenticate, requireAdmin, async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Trips in progress
    const inProgress = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.status, "IN_PROGRESS"));

    // Pickups today (confirmed bookings starting today)
    const todayBookings = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          gte(bookingsTable.startDate, today),
          lte(bookingsTable.startDate, tomorrow),
          eq(bookingsTable.status, "CONFIRMED")
        )
      );

    // Enrich pickups with customer/driver names
    const customerIds = [...new Set(todayBookings.map((b) => b.customerId))];
    const customers =
      customerIds.length > 0
        ? await db
            .select({
              id: usersTable.id,
              firstName: usersTable.firstName,
              lastName: usersTable.lastName,
            })
            .from(usersTable)
            .where(inArray(usersTable.id, customerIds))
        : [];
    const custMap: Record<string, string> = {};
    for (const c of customers)
      custMap[c.id] = [c.firstName, c.lastName].filter(Boolean).join(" ");

    const driverIds = [
      ...new Set(todayBookings.filter((b) => b.driverId).map((b) => b.driverId!)),
    ];
    const driverMap: Record<string, string> = {};
    if (driverIds.length > 0) {
      const driverRows = await db.select().from(driversTable).where(inArray(driversTable.id, driverIds));
      const driverUserIds = driverRows.map((d) => d.userId);
      const driverUsers =
        driverUserIds.length > 0
          ? await db
              .select({
                id: usersTable.id,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
              })
              .from(usersTable)
              .where(inArray(usersTable.id, driverUserIds))
          : [];
      const duMap: Record<string, any> = {};
      for (const u of driverUsers) duMap[u.id] = u;
      for (const d of driverRows) {
        const u = duMap[d.userId];
        driverMap[d.id] = u
          ? [u.firstName, u.lastName].filter(Boolean).join(" ")
          : d.id;
      }
    }

    const pickupsToday = todayBookings
      .filter((b) => b.type !== "TRANSFER")
      .map((b) => ({
        id: b.id,
        referenceCode: b.referenceCode,
        touristName: custMap[b.customerId] || "Unknown",
        pickupTime: b.pickupTime || "TBC",
        pickupLocation: b.pickupLocation || "TBC",
        driverName: b.driverId ? driverMap[b.driverId] || "Unassigned" : "Unassigned",
      }));

    const transfersToday = todayBookings
      .filter((b) => b.type === "TRANSFER")
      .map((b) => ({
        id: b.id,
        referenceCode: b.referenceCode,
        touristName: custMap[b.customerId] || "Unknown",
        pickupTime: b.pickupTime || "TBC",
        pickupLocation: b.pickupLocation || "TBC",
        driverName: b.driverId ? driverMap[b.driverId] || "Unassigned" : "Unassigned",
      }));

    // Count needs attention
    const unassigned = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          sql`${bookingsTable.driverId} IS NULL`,
          or(eq(bookingsTable.status, "PENDING"), eq(bookingsTable.status, "CONFIRMED"))
        )
      );
    const newRequests = await db
      .select()
      .from(customTourRequestsTable)
      .where(eq(customTourRequestsTable.status, "NEW"));

    res.json({
      tripsInProgress: inProgress.length,
      pickupsToday,
      transfersToday,
      needsAttentionCount: unassigned.length + newRequests.length,
    });
  } catch (err) {
    console.error("Admin today error:", err);
    res.status(500).json({ error: "Failed to fetch today's operations" });
  }
});

// ── GET /api/admin/attention ────────────────────────────────────────────────
router.get("/attention", authenticate, requireAdmin, async (_req, res) => {
  try {
    const items: any[] = [];
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Unassigned bookings
    const unassigned = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          sql`${bookingsTable.driverId} IS NULL`,
          or(eq(bookingsTable.status, "PENDING"), eq(bookingsTable.status, "CONFIRMED"))
        )
      );
    if (unassigned.length > 0) {
      const urgent = unassigned.filter(
        (b) => b.startDate <= sevenDaysFromNow
      ).length;
      items.push({
        type: "unassigned_bookings",
        count: unassigned.length,
        urgentCount: urgent,
        title: `${unassigned.length} booking${unassigned.length > 1 ? "s" : ""} without drivers`,
        description:
          urgent > 0
            ? `${urgent} departing within 7 days`
            : "No urgent departures",
        link: "/admin/bookings?driver=unassigned",
      });
    }

    // Overdue CYO requests (NEW status for > 48 hours)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const overdueRequests = await db
      .select()
      .from(customTourRequestsTable)
      .where(
        and(
          or(
            eq(customTourRequestsTable.status, "NEW"),
            eq(customTourRequestsTable.status, "REVIEWING")
          ),
          lte(customTourRequestsTable.createdAt, twoDaysAgo)
        )
      );
    if (overdueRequests.length > 0) {
      items.push({
        type: "overdue_requests",
        count: overdueRequests.length,
        title: `${overdueRequests.length} custom request${overdueRequests.length > 1 ? "s" : ""} overdue`,
        description: "Response SLA exceeded",
        link: "/admin/requests?overdue=true",
      });
    }

    // Expired driver documents
    const expiredDocs = await db
      .select()
      .from(driverDocumentsTable)
      .where(
        and(
          lte(driverDocumentsTable.expiresAt, now),
          sql`${driverDocumentsTable.expiresAt} IS NOT NULL`
        )
      );
    if (expiredDocs.length > 0) {
      const driverIdsWithExpired = [...new Set(expiredDocs.map((d) => d.driverId))];
      items.push({
        type: "expired_documents",
        count: driverIdsWithExpired.length,
        title: `${driverIdsWithExpired.length} driver${driverIdsWithExpired.length > 1 ? "s have" : " has"} expired documents`,
        description: `${expiredDocs.length} document${expiredDocs.length > 1 ? "s" : ""} expired`,
        link: "/admin/drivers",
      });
    }

    // New CYO requests (for sidebar badge)
    const newRequests = await db
      .select()
      .from(customTourRequestsTable)
      .where(eq(customTourRequestsTable.status, "NEW"));

    res.json({
      items: items.slice(0, 5),
      badges: {
        bookings: unassigned.length,
        customRequests: newRequests.length,
        drivers: expiredDocs.length > 0 ? 1 : 0,
      },
    });
  } catch (err) {
    console.error("Admin attention error:", err);
    res.status(500).json({ error: "Failed to fetch attention items" });
  }
});

// ── GET /api/admin/search ───────────────────────────────────────────────────
router.get("/search", authenticate, requireAdmin, async (req, res) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (q.length < 2) {
      res.json({ bookings: [], customers: [], drivers: [], tours: [], customRequests: [] });
      return;
    }

    const pattern = `%${q}%`;

    // Search bookings by reference code
    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(like(bookingsTable.referenceCode, pattern))
      .limit(5);

    // Enrich bookings with customer name
    const bookingCustIds = [...new Set(bookings.map((b) => b.customerId))];
    const bookingCusts =
      bookingCustIds.length > 0
        ? await db
            .select({
              id: usersTable.id,
              firstName: usersTable.firstName,
              lastName: usersTable.lastName,
            })
            .from(usersTable)
            .where(inArray(usersTable.id, bookingCustIds))
        : [];
    const bcMap: Record<string, string> = {};
    for (const c of bookingCusts)
      bcMap[c.id] = [c.firstName, c.lastName].filter(Boolean).join(" ");

    // Search customers by name or email
    const customers = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        country: usersTable.country,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.role, "TOURIST"),
          or(
            like(usersTable.firstName, pattern),
            like(usersTable.lastName, pattern),
            like(usersTable.email, pattern)
          )
        )
      )
      .limit(5);

    // Count bookings per customer
    const customerBookingCounts: Record<string, number> = {};
    if (customers.length > 0) {
      const allBookings = await db.select({ customerId: bookingsTable.customerId }).from(bookingsTable);
      for (const b of allBookings) {
        customerBookingCounts[b.customerId] = (customerBookingCounts[b.customerId] || 0) + 1;
      }
    }

    // Search drivers by name
    const allDrivers = await db.select().from(driversTable);
    const allUsers = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        phone: usersTable.phone,
      })
      .from(usersTable)
      .where(eq(usersTable.role, "DRIVER"));
    const duMap: Record<string, any> = {};
    for (const u of allUsers) duMap[u.id] = u;

    const driverResults = allDrivers
      .map((d) => {
        const u = duMap[d.userId];
        const name = u ? [u.firstName, u.lastName].filter(Boolean).join(" ") : "";
        return { id: d.id, name, phone: u?.phone || "", isActive: d.isActive };
      })
      .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5);

    // Search tours by name
    const tours = await db
      .select({ id: toursTable.id, name: toursTable.name, slug: toursTable.slug, durationDays: toursTable.durationDays, isActive: toursTable.isActive })
      .from(toursTable)
      .where(like(toursTable.name, pattern))
      .limit(5);

    // Search custom requests by reference code
    const customRequests = await db
      .select()
      .from(customTourRequestsTable)
      .where(like(customTourRequestsTable.referenceCode, pattern))
      .limit(5);

    // Also search customers by name in bookings
    const bookingsByCustomerName = bookings.length < 5
      ? await db
          .select()
          .from(bookingsTable)
          .orderBy(desc(bookingsTable.createdAt))
          .limit(20)
      : [];
    const nameMatchBookings = bookingsByCustomerName.filter((b) => {
      const name = bcMap[b.customerId] || "";
      return name.toLowerCase().includes(q.toLowerCase());
    }).slice(0, 5 - bookings.length);

    const allMatchedBookings = [...bookings, ...nameMatchBookings.filter(nb => !bookings.find(b => b.id === nb.id))].slice(0, 5);

    res.json({
      bookings: allMatchedBookings.map((b) => ({
        id: b.id,
        referenceCode: b.referenceCode,
        customerName: bcMap[b.customerId] || "Unknown",
        status: b.status,
        date: b.startDate,
      })),
      customers: customers.map((c) => ({
        id: c.id,
        name: [c.firstName, c.lastName].filter(Boolean).join(" "),
        email: c.email,
        country: c.country,
        bookingCount: customerBookingCounts[c.id] || 0,
      })),
      drivers: driverResults,
      tours: tours.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        durationDays: t.durationDays,
        isActive: t.isActive,
      })),
      customRequests: customRequests.map((r) => ({
        id: r.id,
        referenceCode: r.referenceCode,
        status: r.status,
      })),
    });
  } catch (err) {
    console.error("Admin search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// ── GET /api/admin/stats ────────────────────────────────────────────────────
router.get("/stats", authenticate, requireAdmin, async (_req, res) => {
  try {
    const allBookings = await db.select().from(bookingsTable);
    const now = new Date();

    // Revenue by month for last 6 months
    const months: { month: string; total: number; tours: number; transfers: number; custom: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const monthBookings = allBookings.filter(
        (b) =>
          b.paymentStatus === "PAID" &&
          b.createdAt >= d &&
          b.createdAt < nextMonth
      );

      const tours = monthBookings.filter((b) => b.type === "READY_MADE").reduce((s, b) => s + b.totalGBP, 0);
      const transfers = monthBookings.filter((b) => b.type === "TRANSFER").reduce((s, b) => s + b.totalGBP, 0);
      const custom = monthBookings.filter((b) => b.type === "CUSTOM").reduce((s, b) => s + b.totalGBP, 0);

      months.push({ month: monthStr, total: tours + transfers + custom, tours, transfers, custom });
    }

    const totalRevenue = months.reduce((s, m) => s + m.total, 0);
    const prevTotal = months.slice(0, 3).reduce((s, m) => s + m.total, 0);
    const recentTotal = months.slice(3).reduce((s, m) => s + m.total, 0);
    const revenueTrend = prevTotal > 0 ? ((recentTotal - prevTotal) / prevTotal) * 100 : 0;

    // Active drivers count
    const activeDrivers = await db.select().from(driversTable).where(eq(driversTable.isActive, true));

    res.json({
      revenueByMonth: months,
      totalRevenue,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
      totalBookings: allBookings.length,
      activeDrivers: activeDrivers.length,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ── GET /api/admin/customers ────────────────────────────────────────────────
router.get("/customers", authenticate, requireAdmin, async (req, res) => {
  try {
    const search = (req.query.search as string) || "";
    const country = (req.query.country as string) || "";

    // Get all tourists
    let tourists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "TOURIST"));

    if (search) {
      const q = search.toLowerCase();
      tourists = tourists.filter(
        (t) =>
          (t.firstName || "").toLowerCase().includes(q) ||
          (t.lastName || "").toLowerCase().includes(q) ||
          (t.email || "").toLowerCase().includes(q)
      );
    }
    if (country) {
      tourists = tourists.filter((t) => t.country === country);
    }

    // Get all bookings for stats
    const allBookings = await db.select().from(bookingsTable);

    const customerData = tourists.map((t) => {
      const userBookings = allBookings.filter((b) => b.customerId === t.id);
      const totalSpend = userBookings
        .filter((b) => b.paymentStatus === "PAID")
        .reduce((s, b) => s + b.totalGBP, 0);
      const dates = userBookings.map((b) => b.createdAt).sort((a, b) => a.getTime() - b.getTime());

      return {
        id: t.id,
        name: [t.firstName, t.lastName].filter(Boolean).join(" "),
        email: t.email,
        country: t.country,
        phone: t.phone,
        bookingCount: userBookings.length,
        totalSpend,
        firstBooking: dates[0] || null,
        lastBooking: dates[dates.length - 1] || null,
        memberSince: t.createdAt,
      };
    });

    // Sort by last booking date (newest first)
    customerData.sort((a, b) => {
      if (!a.lastBooking && !b.lastBooking) return 0;
      if (!a.lastBooking) return 1;
      if (!b.lastBooking) return -1;
      return b.lastBooking.getTime() - a.lastBooking.getTime();
    });

    res.json(customerData);
  } catch (err) {
    console.error("Admin customers error:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// ── GET /api/admin/customers/:id ────────────────────────────────────────────
router.get("/customers/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.params.id as string))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.customerId, user.id))
      .orderBy(desc(bookingsTable.createdAt));

    // Enrich bookings with tour names
    const tourIds = [...new Set(bookings.filter((b) => b.tourId).map((b) => b.tourId!))];
    const tours = tourIds.length > 0 ? await db.select({ id: toursTable.id, name: toursTable.name }).from(toursTable) : [];
    const tourMap: Record<string, string> = {};
    for (const t of tours) tourMap[t.id] = t.name;

    const cyoRequests = await db
      .select()
      .from(customTourRequestsTable)
      .where(eq(customTourRequestsTable.customerId, user.id))
      .orderBy(desc(customTourRequestsTable.createdAt));

    const totalSpend = bookings
      .filter((b) => b.paymentStatus === "PAID")
      .reduce((s, b) => s + b.totalGBP, 0);

    const vehicleCounts: Record<string, number> = {};
    for (const b of bookings) {
      vehicleCounts[b.vehicleType] = (vehicleCounts[b.vehicleType] || 0) + 1;
    }
    const favouriteVehicle =
      Object.entries(vehicleCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    res.json({
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" "),
      email: user.email,
      phone: user.phone,
      country: user.country,
      memberSince: user.createdAt,
      bookings: bookings.map((b) => ({
        ...b,
        tourName: b.tourId ? tourMap[b.tourId] || null : null,
      })),
      cyoRequests,
      stats: {
        totalBookings: bookings.length,
        totalSpend,
        averageBookingValue: bookings.length > 0 ? Math.round(totalSpend / bookings.length) : 0,
        favouriteVehicle,
        lastBooked: bookings[0]?.createdAt || null,
      },
    });
  } catch (err) {
    console.error("Admin customer detail error:", err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// ── GET /api/admin/drivers/:id/detail ───────────────────────────────────────
router.get("/drivers/:id/detail", authenticate, requireAdmin, async (req, res) => {
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

    const [driverUser, vehicles, ratings, documents, availability] =
      await Promise.all([
        db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, driver.userId))
          .limit(1)
          .then((r) => r[0]),
        db
          .select()
          .from(driverVehiclesTable)
          .where(eq(driverVehiclesTable.driverId, driver.id)),
        db
          .select()
          .from(driverRatingsTable)
          .where(eq(driverRatingsTable.driverId, driver.id))
          .orderBy(desc(driverRatingsTable.createdAt)),
        db
          .select()
          .from(driverDocumentsTable)
          .where(eq(driverDocumentsTable.driverId, driver.id)),
        db
          .select()
          .from(driverUnavailableDatesTable)
          .where(eq(driverUnavailableDatesTable.driverId, driver.id)),
      ]);

    // Trips
    const trips = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.driverId, driver.id))
      .orderBy(desc(bookingsTable.startDate));

    // Enrich trips with customer names
    const tripCustIds = [...new Set(trips.map((t) => t.customerId))];
    const tripCusts =
      tripCustIds.length > 0
        ? await db
            .select({
              id: usersTable.id,
              firstName: usersTable.firstName,
              lastName: usersTable.lastName,
            })
            .from(usersTable)
            .where(inArray(usersTable.id, tripCustIds))
        : [];
    const tcMap: Record<string, string> = {};
    for (const c of tripCusts)
      tcMap[c.id] = [c.firstName, c.lastName].filter(Boolean).join(" ");

    // Tour names
    const tourIds = [...new Set(trips.filter((t) => t.tourId).map((t) => t.tourId!))];
    const tours =
      tourIds.length > 0
        ? await db.select({ id: toursTable.id, name: toursTable.name }).from(toursTable)
        : [];
    const tourMap: Record<string, string> = {};
    for (const t of tours) tourMap[t.id] = t.name;

    const completedTrips = trips.filter((t) => t.status === "COMPLETED");
    const totalEarnings = completedTrips.reduce(
      (s, t) => s + t.totalGBP * 0.7,
      0
    );
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
        : 0;

    // Rating distribution
    const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of ratings) {
      ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1;
    }

    res.json({
      ...driver,
      user: driverUser
        ? {
            firstName: driverUser.firstName,
            lastName: driverUser.lastName,
            email: driverUser.email,
            phone: driverUser.phone,
            profileImageUrl: driverUser.profileImageUrl,
          }
        : null,
      vehicles,
      documents,
      availability,
      performance: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalTrips: completedTrips.length,
        totalEarnings: Math.round(totalEarnings),
        ratingDistribution: ratingDist,
      },
      ratings: ratings.slice(0, 5).map((r) => ({
        ...r,
        touristName: tcMap[r.touristId] || "Anonymous",
      })),
      currentTrips: trips
        .filter((t) => ["CONFIRMED", "IN_PROGRESS"].includes(t.status))
        .slice(0, 5)
        .map((t) => ({
          ...t,
          tourName: t.tourId ? tourMap[t.tourId] || null : null,
          customerName: tcMap[t.customerId] || "Unknown",
        })),
      tripHistory: completedTrips.slice(0, 10).map((t) => ({
        ...t,
        tourName: t.tourId ? tourMap[t.tourId] || null : null,
        customerName: tcMap[t.customerId] || "Unknown",
        earnings: Math.round(t.totalGBP * 0.7),
      })),
    });
  } catch (err) {
    console.error("Admin driver detail error:", err);
    res.status(500).json({ error: "Failed to fetch driver details" });
  }
});

// ── Seasonal Pricing CRUD ───────────────────────────────────────────────────
router.get("/pricing/seasons", authenticate, requireAdmin, async (_req, res) => {
  try {
    const seasons = await db
      .select()
      .from(globalSeasonalPricingTable)
      .orderBy(globalSeasonalPricingTable.startDate);
    res.json(seasons);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
});

router.post("/pricing/seasons", authenticate, requireAdmin, async (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    startDate: z.string(),
    endDate: z.string(),
    multiplier: z.number().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [season] = await db
      .insert(globalSeasonalPricingTable)
      .values({
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        multiplier: parsed.data.multiplier,
      })
      .returning();
    res.status(201).json(season);
  } catch (err) {
    res.status(500).json({ error: "Failed to create season" });
  }
});

router.put("/pricing/seasons/:id", authenticate, requireAdmin, async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    multiplier: z.number().min(1).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const update: any = { ...parsed.data, updatedAt: new Date() };
    if (update.startDate) update.startDate = new Date(update.startDate);
    if (update.endDate) update.endDate = new Date(update.endDate);
    const [season] = await db
      .update(globalSeasonalPricingTable)
      .set(update)
      .where(eq(globalSeasonalPricingTable.id, req.params.id as string))
      .returning();
    if (!season) {
      res.status(404).json({ error: "Season not found" });
      return;
    }
    res.json(season);
  } catch (err) {
    res.status(500).json({ error: "Failed to update season" });
  }
});

router.delete("/pricing/seasons/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(globalSeasonalPricingTable)
      .where(eq(globalSeasonalPricingTable.id, req.params.id as string))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Season not found" });
      return;
    }
    res.json({ message: "Season deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete season" });
  }
});

// ── PUT /api/admin/drivers/:driverId/documents/:docId/verify ────────────────
router.put("/drivers/:driverId/documents/:docId/verify", authenticate, requireAdmin, async (req, res) => {
  const { action, reason } = req.body; // action: "verify" | "reject"
  try {
    const status = action === "verify" ? "VERIFIED" : "REJECTED";
    const [updated] = await db
      .update(driverDocumentsTable)
      .set({ status, verifiedAt: status === "VERIFIED" ? new Date() : undefined })
      .where(eq(driverDocumentsTable.id, req.params.docId as string))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update document" });
  }
});

export default router;
