import { build } from 'esbuild';
import { mkdir } from 'fs/promises';

await mkdir('api', { recursive: true });

// Build a self-contained CJS bundle for Vercel serverless functions.
// - Entry: src/app.ts (exports the Express app as default)
// - Format: CJS so Node.js loads it without "type":"module" in package.json
// - external: only pg-native (optional native addon, not needed at runtime)
// - Everything else (pg, drizzle-orm, express, stripe, etc.) is bundled in,
//   so the function has zero runtime npm dependencies on Vercel.
await build({
  entryPoints: ['artifacts/api-server/src/app.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'api/index.js',
  external: ['pg-native'],
  logLevel: 'info',
});
