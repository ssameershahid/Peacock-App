import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import stripeWebhookRouter from "./routes/webhooks/stripe.js";

const app = express();

// Allow all origins in dev; configure FRONTEND_URL in prod
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
  : true;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

// Stripe webhook needs raw body BEFORE express.json()
app.use(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookRouter
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
