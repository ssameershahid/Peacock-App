import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const driversTable = pgTable("drivers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull().unique(),
  bio: text("bio"),
  languages: text("languages").array().notNull().default([]),
  experienceYears: integer("experience_years"),
  profilePhotoUrl: text("profile_photo_url"),
  isActive: boolean("is_active").notNull().default(true),
  regionPreferences: text("region_preferences").array().notNull().default([]),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const driverVehiclesTable = pgTable("driver_vehicles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  driverId: text("driver_id").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  plateNumber: text("plate_number").notNull(),
  year: integer("year"),
  features: text("features").array().notNull().default([]),
  photoUrl: text("photo_url"),
});

export const driverPayoutRatesTable = pgTable(
  "driver_payout_rates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    driverId: text("driver_id").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    dailyFee: real("daily_fee"),
    commissionPct: real("commission_pct"),
  },
  (table) => [
    uniqueIndex("driver_payout_rates_driver_vehicle_idx").on(
      table.driverId,
      table.vehicleType
    ),
  ]
);

export const insertDriverSchema = createInsertSchema(driversTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertDriverVehicleSchema = createInsertSchema(
  driverVehiclesTable
).omit({ id: true });
export const insertDriverPayoutRateSchema = createInsertSchema(
  driverPayoutRatesTable
).omit({ id: true });

export type Driver = typeof driversTable.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type DriverVehicle = typeof driverVehiclesTable.$inferSelect;
export type InsertDriverVehicle = z.infer<typeof insertDriverVehicleSchema>;
export type DriverPayoutRate = typeof driverPayoutRatesTable.$inferSelect;
export type InsertDriverPayoutRate = z.infer<
  typeof insertDriverPayoutRateSchema
>;
