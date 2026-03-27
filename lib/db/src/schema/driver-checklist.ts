import {
  pgTable,
  text,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const driverChecklistTable = pgTable(
  "driver_checklist",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    driverId: text("driver_id").notNull(),
    bookingId: text("booking_id").notNull(),
    itemKey: text("item_key").notNull(),
    checked: boolean("checked").notNull().default(false),
  },
  (table) => [
    uniqueIndex("driver_checklist_unique_idx").on(
      table.driverId,
      table.bookingId,
      table.itemKey
    ),
  ]
);

export type DriverChecklistItem = typeof driverChecklistTable.$inferSelect;
