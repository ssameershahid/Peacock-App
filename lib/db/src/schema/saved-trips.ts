import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const savedTripsTable = pgTable("saved_trips", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  tripData: json("trip_data").notNull(),
  currentStep: integer("current_step").notNull().default(1),
  isComplete: boolean("is_complete").notNull().default(false),
  routeMapUrl: text("route_map_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export type SavedTrip = typeof savedTripsTable.$inferSelect;
export type InsertSavedTrip = typeof savedTripsTable.$inferInsert;
