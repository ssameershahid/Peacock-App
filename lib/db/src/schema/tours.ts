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

export const toursTable = pgTable("tours", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  slug: text("slug").notNull().unique(),
  // Group fields — all variants of the same tour share groupId + groupSlug
  groupId: text("group_id"),
  groupSlug: text("group_slug"),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description").notNull(),
  durationDays: integer("duration_days").notNull(),
  durationNights: integer("duration_nights").notNull(),
  highlights: text("highlights").array().notNull().default([]),
  regions: text("regions").array().notNull().default([]),
  difficulty: text("difficulty").notNull().default("Easy"),
  heroImages: text("hero_images").array().notNull().default([]),
  bestMonths: integer("best_months").array().notNull().default([]),
  whatsIncluded: text("whats_included").array().notNull().default([]),
  whatsNotIncluded: text("whats_not_included").array().notNull().default([]),
  minLeadTimeDays: integer("min_lead_time_days").notNull().default(7),
  maxExtraDays: integer("max_extra_days").notNull().default(3),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const tourVehicleRatesTable = pgTable(
  "tour_vehicle_rates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tourId: text("tour_id").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    pricePerDay: real("price_per_day").notNull(),
  },
  (table) => [
    uniqueIndex("tour_vehicle_rates_tour_vehicle_idx").on(
      table.tourId,
      table.vehicleType
    ),
  ]
);

export const itineraryDaysTable = pgTable(
  "itinerary_days",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tourId: text("tour_id").notNull(),
    dayNumber: integer("day_number").notNull(),
    title: text("title").notNull(),
    location: text("location").notNull(),
    lat: real("lat"),
    lng: real("lng"),
    description: text("description").notNull(),
    drivingTime: text("driving_time"),
    keyStops: text("key_stops").array().notNull().default([]),
  },
  (table) => [
    uniqueIndex("itinerary_days_tour_day_idx").on(
      table.tourId,
      table.dayNumber
    ),
  ]
);

export const tourAddOnsTable = pgTable("tour_add_ons", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  tourId: text("tour_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priceGBP: real("price_gbp").notNull(),
});

export const seasonalPricingTable = pgTable("seasonal_pricing", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  tourId: text("tour_id").notNull(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  multiplier: real("multiplier").notNull(),
});

export const insertTourSchema = createInsertSchema(toursTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertTourVehicleRateSchema = createInsertSchema(
  tourVehicleRatesTable
).omit({ id: true });
export const insertItineraryDaySchema = createInsertSchema(
  itineraryDaysTable
).omit({ id: true });
export const insertTourAddOnSchema = createInsertSchema(tourAddOnsTable).omit({
  id: true,
});
export const insertSeasonalPricingSchema = createInsertSchema(
  seasonalPricingTable
).omit({ id: true });

export type Tour = typeof toursTable.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type TourVehicleRate = typeof tourVehicleRatesTable.$inferSelect;
export type InsertTourVehicleRate = z.infer<typeof insertTourVehicleRateSchema>;
export type ItineraryDay = typeof itineraryDaysTable.$inferSelect;
export type InsertItineraryDay = z.infer<typeof insertItineraryDaySchema>;
export type TourAddOn = typeof tourAddOnsTable.$inferSelect;
export type InsertTourAddOn = z.infer<typeof insertTourAddOnSchema>;
export type SeasonalPricing = typeof seasonalPricingTable.$inferSelect;
export type InsertSeasonalPricing = z.infer<typeof insertSeasonalPricingSchema>;
