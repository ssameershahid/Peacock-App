import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, usersTable, verificationTokensTable } from "@workspace/db";
import {
  hashPassword,
  comparePassword,
  signToken,
  generateResetToken,
} from "../lib/auth.js";
import { sendWelcomeEmail, sendPasswordReset } from "../lib/email.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  country: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { email, password, firstName, lastName, phone, country } = parsed.data;

  try {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(usersTable)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        country,
        role: "TOURIST",
      })
      .returning();

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Fire and forget welcome email
    sendWelcomeEmail(user.email, user.firstName || "there").catch(console.error);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        phone: usersTable.phone,
        country: usersTable.country,
        role: usersTable.role,
        profileImageUrl: usersTable.profileImageUrl,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PUT /api/auth/profile
router.put("/profile", authenticate, async (req, res) => {
  const schema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    profileImageUrl: z.string().url().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  try {
    const [updated] = await db
      .update(usersTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.userId))
      .returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Profile update failed" });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", authenticate, async (req, res) => {
  const schema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId))
      .limit(1);
    if (!user || !user.passwordHash) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const valid = await comparePassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await db
      .update(usersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.userId));
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Password update failed" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    // Always return 200 to avoid user enumeration
    if (!user) {
      res.json({ message: "If that email exists, a reset link has been sent" });
      return;
    }

    const token = generateResetToken();
    const expires = new Date(Date.now() + 3600_000); // 1 hour

    await db
      .insert(verificationTokensTable)
      .values({ identifier: user.email, token, expires })
      .onConflictDoNothing();

    sendPasswordReset({
      to: user.email,
      firstName: user.firstName || "there",
      resetToken: token,
    }).catch(console.error);

    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) {
    res.status(500).json({ error: "Request failed" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  const schema = z.object({
    token: z.string(),
    password: z.string().min(8),
  });
  const { token, password } = schema.parse(req.body);
  try {
    const [vtRecord] = await db
      .select()
      .from(verificationTokensTable)
      .where(eq(verificationTokensTable.token, token))
      .limit(1);

    if (!vtRecord || vtRecord.expires < new Date()) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const passwordHash = await hashPassword(password);
    await db
      .update(usersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.email, vtRecord.identifier));

    // Clean up token
    await db
      .delete(verificationTokensTable)
      .where(eq(verificationTokensTable.token, token));

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Reset failed" });
  }
});

export default router;
