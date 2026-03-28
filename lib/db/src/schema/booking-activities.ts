import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const bookingActivitiesTable = pgTable("booking_activities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  bookingId: text("booking_id").notNull(),
  action: text("action").notNull(), // "created", "status_changed", "driver_assigned", "payment_received", "cancelled", etc.
  details: json("details"), // { fromStatus, toStatus } or { driverId, driverName } etc.
  performedBy: text("performed_by"), // user id, nullable for system actions
  performedByName: text("performed_by_name"), // display name for the actor
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type BookingActivity = typeof bookingActivitiesTable.$inferSelect;
