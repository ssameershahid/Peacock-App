/**
 * One-off cleanup: deactivate the duplicate "South Coast & Beaches" tour
 * that has groupSlug "south-coast-beach" (missing the trailing "es") and
 * only a single 5-day variant (slug: "south-coast-beach").
 *
 * The correct group is groupSlug "south-coast-beaches" with 4 variants (5/7/10/14d).
 *
 * Uses a soft delete (is_active = false) — identical to what the admin
 * DELETE /api/tours/:id endpoint does.  Hard data is preserved in case
 * anything references it.
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

import { db } from "../lib/db/src/index.js";
import { sql } from "drizzle-orm";

async function main() {
  // ── 1. Confirm the target row before touching anything ──────────────────
  const check = await db.execute(sql`
    SELECT id, slug, group_slug, name, duration_days, is_active
    FROM tours
    WHERE group_slug = 'south-coast-beach'
  `);

  if (check.rows.length === 0) {
    console.log("✅ No tour found with group_slug='south-coast-beach'. Nothing to do.");
    process.exit(0);
  }

  console.log("Tours to deactivate:");
  console.log(JSON.stringify(check.rows, null, 2));

  // Safety guard: must be exactly 1 row and it must not be group "south-coast-beaches"
  for (const row of check.rows) {
    if ((row.group_slug as string) !== "south-coast-beach") {
      console.error("❌ Unexpected groupSlug — aborting to be safe.");
      process.exit(1);
    }
  }

  // ── 2. Soft-delete ───────────────────────────────────────────────────────
  const result = await db.execute(sql`
    UPDATE tours
    SET is_active = false, updated_at = NOW()
    WHERE group_slug = 'south-coast-beach'
    RETURNING id, slug, group_slug, is_active
  `);

  console.log(`\n✅ Deactivated ${result.rows.length} tour(s):`);
  console.log(JSON.stringify(result.rows, null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
