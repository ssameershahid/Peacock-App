import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const reviewsTable = pgTable("reviews", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  bookingId: text("booking_id").notNull(),
  userId: text("user_id").notNull(),
  driverId: text("driver_id"),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  wouldRecommend: boolean("would_recommend"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Review = typeof reviewsTable.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
