import {
  pgTable,
  pgEnum,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const docTypeEnum = pgEnum("doc_type", [
  "DRIVING_LICENSE",
  "TOUR_GUIDE_CERTIFICATE",
  "VEHICLE_INSURANCE",
  "VEHICLE_REGISTRATION",
]);

export const docStatusEnum = pgEnum("doc_status", [
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
]);

export const driverDocumentsTable = pgTable("driver_documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  driverId: text("driver_id").notNull(),
  docType: docTypeEnum("doc_type").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  status: docStatusEnum("status").notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
});

export const insertDriverDocumentSchema = createInsertSchema(
  driverDocumentsTable
).omit({ id: true, uploadedAt: true });

export type DriverDocument = typeof driverDocumentsTable.$inferSelect;
export type InsertDriverDocument = z.infer<typeof insertDriverDocumentSchema>;
