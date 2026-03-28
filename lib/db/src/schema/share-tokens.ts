import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const shareTokensTable = pgTable("share_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  bookingId: text("booking_id").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const insertShareTokenSchema = createInsertSchema(shareTokensTable).omit({
  id: true,
  createdAt: true,
});

export type ShareToken = typeof shareTokensTable.$inferSelect;
export type InsertShareToken = z.infer<typeof insertShareTokenSchema>;
