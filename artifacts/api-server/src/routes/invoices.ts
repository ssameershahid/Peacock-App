import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, invoicesTable, bookingsTable } from "@workspace/db";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/invoices
router.get("/", authenticate, async (req, res) => {
  try {
    const { role, userId } = req.user!;
    const invoices =
      role === "ADMIN"
        ? await db.select().from(invoicesTable)
        : await db
            .select()
            .from(invoicesTable)
            .where(eq(invoicesTable.customerId, userId));

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// GET /api/invoices/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const [invoice] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, req.params.id as string))
      .limit(1);

    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }

    const { role, userId } = req.user!;
    if (role !== "ADMIN" && invoice.customerId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// GET /api/invoices/:id/pdf
router.get("/:id/pdf", authenticate, async (req, res) => {
  try {
    const [invoice] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, req.params.id as string))
      .limit(1);

    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }

    const { role, userId } = req.user!;
    if (role !== "ADMIN" && invoice.customerId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (!invoice.pdfUrl) {
      res.status(404).json({ error: "PDF not yet generated" });
      return;
    }

    res.redirect(invoice.pdfUrl);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice PDF" });
  }
});

export default router;
