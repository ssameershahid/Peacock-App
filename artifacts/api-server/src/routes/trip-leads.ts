import { Router } from "express";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db, tripLeadsTable } from "@workspace/db";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { sendTripPlanEmail } from "../lib/email.js";

const router = Router();

// POST /api/trip-leads — capture email + trip data (public, no auth)
router.post("/", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    tripData: z.any(),
    currentStep: z.number().int().min(1).max(5).optional(),
    source: z.string().optional(),
    utmParams: z
      .object({
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
      })
      .optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  try {
    const [lead] = await db
      .insert(tripLeadsTable)
      .values({
        email: parsed.data.email,
        name: parsed.data.name || null,
        tripData: parsed.data.tripData,
        currentStep: parsed.data.currentStep ?? 1,
        source: parsed.data.source ?? "cyo_wizard",
        utmSource: parsed.data.utmParams?.utmSource || null,
        utmMedium: parsed.data.utmParams?.utmMedium || null,
        utmCampaign: parsed.data.utmParams?.utmCampaign || null,
        emailSentAt: new Date(),
      })
      .returning();

    // Send trip plan email async
    sendTripPlanEmail({
      to: parsed.data.email,
      name: parsed.data.name || null,
      tripData: parsed.data.tripData,
      leadId: lead.id,
    }).catch(console.error);

    res.status(201).json({ id: lead.id, emailSent: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to capture lead" });
  }
});

// GET /api/trip-leads/:id/trip-data — get trip data for resume link (public, no PII)
router.get("/:id/trip-data", async (req, res) => {
  try {
    const [lead] = await db
      .select({
        id: tripLeadsTable.id,
        tripData: tripLeadsTable.tripData,
        currentStep: tripLeadsTable.currentStep,
      })
      .from(tripLeadsTable)
      .where(eq(tripLeadsTable.id, req.params.id as string))
      .limit(1);

    if (!lead) {
      res.status(404).json({ error: "Trip data not found" });
      return;
    }
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trip data" });
  }
});

// GET /api/admin/trip-leads — list all leads (admin only)
router.get("/admin/all", authenticate, requireAdmin, async (_req, res) => {
  try {
    const leads = await db
      .select()
      .from(tripLeadsTable)
      .orderBy(desc(tripLeadsTable.createdAt));
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// GET /api/admin/trip-leads/:id — view lead details (admin)
router.get("/admin/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const [lead] = await db
      .select()
      .from(tripLeadsTable)
      .where(eq(tripLeadsTable.id, req.params.id as string))
      .limit(1);

    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// PUT /api/trip-leads/admin/:id — update lead (admin, e.g. mark converted)
router.put("/admin/:id", authenticate, requireAdmin, async (req, res) => {
  const schema = z.object({
    convertedAt: z.string().optional(),
    convertedRequestId: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const updateData: any = { updatedAt: new Date() };
    if (parsed.data.convertedAt) updateData.convertedAt = new Date(parsed.data.convertedAt);
    if (parsed.data.convertedRequestId) updateData.convertedRequestId = parsed.data.convertedRequestId;

    const [updated] = await db
      .update(tripLeadsTable)
      .set(updateData)
      .where(eq(tripLeadsTable.id, req.params.id as string))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

export default router;
