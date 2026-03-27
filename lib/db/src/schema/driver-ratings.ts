import {
  pgTable,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const driverRatingsTable = pgTable("driver_ratings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  driverId: text("driver_id").notNull(),
  bookingId: text("booking_id").notNull(),
  touristId: text("tourist_id").notNull(),
  touristName: text("tourist_name").notNull(),
  touristCountry: text("tourist_country"),
  tourName: text("tour_name"),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertDriverRatingSchema = createInsertSchema(
  driverRatingsTable
).omit({ id: true, createdAt: true });

export type DriverRating = typeof driverRatingsTable.$inferSelect;
export type InsertDriverRating = z.infer<typeof insertDriverRatingSchema>;
