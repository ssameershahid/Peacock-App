import {
  pgTable,
  text,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const driverUnavailableDatesTable = pgTable(
  "driver_unavailable_dates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    driverId: text("driver_id").notNull(),
    date: date("date", { mode: "string" }).notNull(),
  },
  (table) => [
    uniqueIndex("driver_unavailable_date_idx").on(table.driverId, table.date),
  ]
);

export type DriverUnavailableDate =
  typeof driverUnavailableDatesTable.$inferSelect;
