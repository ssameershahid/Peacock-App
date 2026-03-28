import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const globalSeasonalPricingTable = pgTable("global_seasonal_pricing", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  multiplier: real("multiplier").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertGlobalSeasonalPricingSchema = createInsertSchema(
  globalSeasonalPricingTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GlobalSeasonalPricing =
  typeof globalSeasonalPricingTable.$inferSelect;
export type InsertGlobalSeasonalPricing = z.infer<
  typeof insertGlobalSeasonalPricingSchema
>;
