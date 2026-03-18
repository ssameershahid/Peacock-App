import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const customRequestStatusEnum = pgEnum("custom_request_status", [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "AWAITING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "ABANDONED",
]);

export const customTourRequestsTable = pgTable("custom_tour_requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  referenceCode: text("reference_code").notNull().unique(),
  status: customRequestStatusEnum("status").notNull().default("NEW"),
  customerId: text("customer_id").notNull(),
  tripType: text("trip_type"),
  locations: text("locations").array().notNull().default([]),
  preferredDates: text("preferred_dates"),
  durationDays: integer("duration_days"),
  flexibility: boolean("flexibility").notNull().default(false),
  vehiclePreference: text("vehicle_preference"),
  passengers: integer("passengers"),
  budgetRange: text("budget_range"),
  travelStyle: text("travel_style").array().notNull().default([]),
  interests: text("interests").array().notNull().default([]),
  specialRequests: text("special_requests"),
  quote: json("quote"),
  abandonReason: text("abandon_reason"),
  bookingId: text("booking_id"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertCustomTourRequestSchema = createInsertSchema(
  customTourRequestsTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CustomTourRequest = typeof customTourRequestsTable.$inferSelect;
export type InsertCustomTourRequest = z.infer<
  typeof insertCustomTourRequestSchema
>;
