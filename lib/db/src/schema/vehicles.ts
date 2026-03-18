import { pgTable, text, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const vehiclesTable = pgTable("vehicles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  type: text("type").notNull().unique(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url").notNull(),
  capacityMin: integer("capacity_min").notNull(),
  capacityMax: integer("capacity_max").notNull(),
  description: text("description").notNull(),
  features: text("features").array().notNull().default([]),
  pricePerDay: real("price_per_day").notNull(),
  pricePerKm: real("price_per_km").notNull(),
  countInFleet: integer("count_in_fleet").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({
  id: true,
});

export type Vehicle = typeof vehiclesTable.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
