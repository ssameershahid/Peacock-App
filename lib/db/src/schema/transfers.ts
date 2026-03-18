import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const transferRoutesTable = pgTable("transfer_routes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  fromLat: real("from_lat").notNull(),
  fromLng: real("from_lng").notNull(),
  toLat: real("to_lat").notNull(),
  toLng: real("to_lng").notNull(),
  distanceKm: real("distance_km").notNull(),
  estimatedMins: integer("estimated_mins").notNull(),
  isAirport: boolean("is_airport").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
});

export const transferFixedPricesTable = pgTable(
  "transfer_fixed_prices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    transferRouteId: text("transfer_route_id").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    priceGBP: real("price_gbp").notNull(),
  },
  (table) => [
    uniqueIndex("transfer_fixed_prices_route_vehicle_idx").on(
      table.transferRouteId,
      table.vehicleType
    ),
  ]
);

export const insertTransferRouteSchema = createInsertSchema(
  transferRoutesTable
).omit({ id: true });
export const insertTransferFixedPriceSchema = createInsertSchema(
  transferFixedPricesTable
).omit({ id: true });

export type TransferRoute = typeof transferRoutesTable.$inferSelect;
export type InsertTransferRoute = z.infer<typeof insertTransferRouteSchema>;
export type TransferFixedPrice = typeof transferFixedPricesTable.$inferSelect;
export type InsertTransferFixedPrice = z.infer<
  typeof insertTransferFixedPriceSchema
>;
