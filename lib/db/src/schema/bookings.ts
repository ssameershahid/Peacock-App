import {
  pgTable,
  pgEnum,
  text,
  integer,
  real,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const bookingTypeEnum = pgEnum("booking_type", [
  "READY_MADE",
  "CUSTOM",
  "TRANSFER",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "REFUNDED",
  "FAILED",
]);

export const bookingsTable = pgTable("bookings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  referenceCode: text("reference_code").notNull().unique(),
  type: bookingTypeEnum("type").notNull(),
  status: bookingStatusEnum("status").notNull().default("PENDING"),
  customerId: text("customer_id").notNull(),
  tourId: text("tour_id"),
  transferRouteId: text("transfer_route_id"),
  vehicleType: text("vehicle_type").notNull(),
  driverId: text("driver_id"),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }),
  numDays: integer("num_days"),
  pickupTime: text("pickup_time"),
  pickupLocation: text("pickup_location"),
  dropoffLocation: text("dropoff_location"),
  passengers: integer("passengers").notNull(),
  specialRequests: text("special_requests"),
  addOns: json("add_ons"),
  pricingBreakdown: json("pricing_breakdown"),
  totalGBP: real("total_gbp").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("PENDING"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  passportNumber: text("passport_number"),
  hotelDetails: text("hotel_details"),
  flightNumber: text("flight_number"),
  driverNotes: text("driver_notes"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  cancelledAt: timestamp("cancelled_at", { mode: "date" }),
  cancellationReason: text("cancellation_reason"),
  refundAmountGBP: real("refund_amount_gbp"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Booking = typeof bookingsTable.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
