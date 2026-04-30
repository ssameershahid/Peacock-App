import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

// Admin-editable vehicle rates for CYO (custom tour) requests — separate from Ready-to-Go tour rates
export const cyoVehicleRatesTable = pgTable("cyo_vehicle_rates", {
  vehicleType: text("vehicle_type").primaryKey(), // 'car', 'minivan', 'large-van', etc.
  pricePerDay: integer("price_per_day").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// Optional upsell items shown in the CYO wizard, manageable from admin
export const cyoUpsellItemsTable = pgTable("cyo_upsell_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  priceGBP: integer("price_gbp").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type CyoVehicleRate = typeof cyoVehicleRatesTable.$inferSelect;
export type CyoUpsellItem = typeof cyoUpsellItemsTable.$inferSelect;
