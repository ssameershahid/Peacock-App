import { build } from 'esbuild';
import { mkdir } from 'fs/promises';

await mkdir('api', { recursive: true });

await build({
  entryPoints: ['artifacts/api-server/api/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'api/index.js',
  external: ['bcryptjs', 'pg', 'pg-native', 'stripe', 'resend', 'dotenv'],
  logLevel: 'info',
});
