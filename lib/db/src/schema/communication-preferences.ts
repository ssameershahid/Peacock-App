import {
  pgTable,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const communicationPreferencesTable = pgTable("communication_preferences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull().unique(),
  preTripReminders: boolean("pre_trip_reminders").notNull().default(true),
  reviewRequests: boolean("review_requests").notNull().default(true),
  marketing: boolean("marketing").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertCommunicationPreferencesSchema = createInsertSchema(
  communicationPreferencesTable
).omit({ id: true, createdAt: true, updatedAt: true });

export type CommunicationPreferences = typeof communicationPreferencesTable.$inferSelect;
export type InsertCommunicationPreferences = z.infer<typeof insertCommunicationPreferencesSchema>;
