import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { randomUUID } from "node:crypto";

export const userRoleEnum = pgEnum("user_role", ["TOURIST", "DRIVER", "ADMIN"]);

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("TOURIST"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  country: text("country"),
  googleId: text("google_id").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const accountsTable = pgTable(
  "accounts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => [
    uniqueIndex("accounts_provider_account_idx").on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

export const sessionsTable = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokensTable = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("verification_tokens_identifier_token_idx").on(
      table.identifier,
      table.token
    ),
  ]
);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertAccountSchema = createInsertSchema(accountsTable).omit({
  id: true,
});
export const insertSessionSchema = createInsertSchema(sessionsTable).omit({
  id: true,
});
export const insertVerificationTokenSchema = createInsertSchema(
  verificationTokensTable
);

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accountsTable.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Session = typeof sessionsTable.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type VerificationToken = typeof verificationTokensTable.$inferSelect;
export type InsertVerificationToken = z.infer<
  typeof insertVerificationTokenSchema
>;
