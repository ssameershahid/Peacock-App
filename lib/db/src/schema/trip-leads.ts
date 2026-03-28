import {
  pgTable,
  text,
  integer,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const tripLeadsTable = pgTable("trip_leads", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  email: text("email").notNull(),
  name: text("name"),
  tripData: json("trip_data").notNull(),
  currentStep: integer("current_step").notNull().default(1),
  source: text("source").notNull().default("cyo_wizard"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  emailSentAt: timestamp("email_sent_at", { mode: "date" }),
  followUp1SentAt: timestamp("follow_up_1_sent_at", { mode: "date" }),
  followUp2SentAt: timestamp("follow_up_2_sent_at", { mode: "date" }),
  convertedAt: timestamp("converted_at", { mode: "date" }),
  convertedRequestId: text("converted_request_id"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export type TripLead = typeof tripLeadsTable.$inferSelect;
export type InsertTripLead = typeof tripLeadsTable.$inferInsert;
