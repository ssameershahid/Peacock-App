/**
 * Loaded via tsx --import before anything else.
 * Sets process.env from the monorepo root .env file so that
 * lib/db/src/index.ts sees DATABASE_URL at module initialisation.
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });
