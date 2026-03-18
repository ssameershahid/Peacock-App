import { pgTable, text, real, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const invoicesTable = pgTable("invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  invoiceNumber: text("invoice_number").notNull().unique(),
  bookingId: text("booking_id").notNull().unique(),
  customerId: text("customer_id").notNull(),
  issuedAt: timestamp("issued_at", { mode: "date" }).notNull().defaultNow(),
  lineItems: json("line_items").notNull(),
  subtotal: real("subtotal").notNull(),
  tax: real("tax"),
  total: real("total").notNull(),
  currency: text("currency").notNull().default("GBP"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({
  id: true,
  createdAt: true,
  issuedAt: true,
});

export type Invoice = typeof invoicesTable.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
