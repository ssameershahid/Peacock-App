import { Router } from "express";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import {
  db,
  customTourRequestsTable,
  usersTable,
} from "@workspace/db";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { createPaymentLink } from "../lib/stripe.js";
import {
  sendCYORequestReceived,
  sendQuoteToCustomer,
} from "../lib/email.js";

const router = Router();

function generateRefCode() {
  return "CYO-" + Math.random().toString(36).substring(2, 7).toUpperCase();
}

// POST /api/custom-requests
router.post("/", authenticate, async (req, res) => {
  const schema = z.object({
    tripType: z.string().optional(),
    locations: z.array(z.string()),
    preferredDates: z.string().optional(),
    durationDays: z.number().int().optional(),
    flexibility: z.boolean().optional(),
    vehiclePreference: z.string().optional(),
    passengers: z.number().int().optional(),
    budgetRange: z.string().optional(),
    travelStyle: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    specialRequests: z.string().max(500).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  try {
    const referenceCode = generateRefCode();
    const [request] = await db
      .insert(customTourRequestsTable)
      .values({
        ...parsed.data,
        referenceCode,
        customerId: req.user!.userId,
        status: "NEW",
        locations: parsed.data.locations || [],
        travelStyle: parsed.data.travelStyle || [],
        interests: parsed.data.interests || [],
      })
      .returning();

    const [customer] = await db
      .select({ email: usersTable.email, firstName: usersTable.firstName })
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId))
      .limit(1);

    if (customer) {
      sendCYORequestReceived({
        to: customer.email,
        firstName: customer.firstName || "there",
        referenceCode,
        locations: parsed.data.locations,
        durationDays: parsed.data.durationDays,
      }).catch(console.error);
    }

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit request" });
  }
});

// GET /api/custom-requests (admin)
router.get("/", authenticate, requireAdmin, async (_req, res) => {
  try {
    const requests = await db
      .select()
      .from(customTourRequestsTable)
      .orderBy(desc(customTourRequestsTable.createdAt));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// GET /api/custom-requests/mine (tourist's own)
router.get("/mine", authenticate, async (req, res) => {
  try {
    const requests = await db
      .select()
      .from(customTourRequestsTable)
      .where(eq(customTourRequestsTable.customerId, req.user!.userId))
      .orderBy(desc(customTourRequestsTable.createdAt));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// GET /api/custom-requests/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const [request] = await db
      .select()
      .from(customTourRequestsTable)
      .where(eq(customTourRequestsTable.id, req.params.id as string))
      .limit(1);

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    const { role, userId } = req.user!;
    if (role !== "ADMIN" && request.customerId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch request" });
  }
});

// PUT /api/custom-requests/:id (admin: update status/quote)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const schema = z.object({
    status: z
      .enum(["NEW","REVIEWING","QUOTED","AWAITING_PAYMENT","PAID","CONFIRMED","ABANDONED"])
      .optional(),
    quote: z.any().optional(),
    abandonReason: z.string().optional(),
  });
  const data = schema.parse(req.body);

  try {
    const [updated] = await db
      .update(customTourRequestsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customTourRequestsTable.id, req.params.id as string))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update request" });
  }
});

// POST /api/custom-requests/:id/send-quote
router.post("/:id/send-quote", authenticate, requireAdmin, async (req, res) => {
  try {
    const [request] = await db
      .select()
      .from(customTourRequestsTable)
      .where(eq(customTourRequestsTable.id, req.params.id as string))
      .limit(1);

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    if (!request.quote) {
      res.status(400).json({ error: "No quote set on this request" });
      return;
    }

    const quote = request.quote as { totalGBP: number; description?: string };
    const [customer] = await db
      .select({ email: usersTable.email, firstName: usersTable.firstName })
      .from(usersTable)
      .where(eq(usersTable.id, request.customerId))
      .limit(1);

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const paymentLink = await createPaymentLink({
      requestId: request.id,
      referenceCode: request.referenceCode,
      customerEmail: customer.email,
      description: quote.description || `Custom Sri Lanka Tour — ${request.referenceCode}`,
      amountGBP: quote.totalGBP,
    });

    await db
      .update(customTourRequestsTable)
      .set({
        status: "AWAITING_PAYMENT",
        quote: { ...quote, paymentLink: paymentLink.url },
        updatedAt: new Date(),
      })
      .where(eq(customTourRequestsTable.id, request.id));

    await sendQuoteToCustomer({
      to: customer.email,
      firstName: customer.firstName || "there",
      referenceCode: request.referenceCode,
      quoteTotal: quote.totalGBP,
      paymentLink: paymentLink.url!,
    });

    res.json({ message: "Quote sent", paymentLink: paymentLink.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send quote" });
  }
});

export default router;
