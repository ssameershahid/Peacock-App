import { Router } from "express";

const router = Router();

// Simple in-memory cache with 24-hour TTL
let ratesCache: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const FALLBACK_RATES: Record<string, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  CAD: 1.71,
  AUD: 1.95,
  LKR: 380,
};

async function fetchRates(): Promise<Record<string, number>> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) return FALLBACK_RATES;

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/GBP`
    );
    if (!res.ok) throw new Error("Exchange rate API error");
    const data = (await res.json()) as {
      conversion_rates: Record<string, number>;
    };
    const { GBP, USD, EUR, CAD, AUD, LKR } = data.conversion_rates;
    return { GBP, USD, EUR, CAD, AUD, LKR };
  } catch (err) {
    console.error("Failed to fetch exchange rates, using fallback:", err);
    return FALLBACK_RATES;
  }
}

// GET /api/currencies
router.get("/", async (_req, res) => {
  try {
    const now = Date.now();
    if (!ratesCache || now - ratesCache.fetchedAt > CACHE_TTL) {
      const rates = await fetchRates();
      ratesCache = { rates, fetchedAt: now };
    }
    res.json({
      base: "GBP",
      rates: ratesCache.rates,
      fetchedAt: new Date(ratesCache.fetchedAt).toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch currencies" });
  }
});

export default router;
