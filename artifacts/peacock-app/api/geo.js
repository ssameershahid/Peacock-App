/**
 * Vercel-only: exposes `x-vercel-ip-country` for client-side currency hint.
 * No-op useful values when run locally without Vercel headers.
 *
 * Implemented as JS (not TS) so deployment does not inherit app `tsconfig` `noEmit`,
 * which would otherwise cause TypeScript to report “Emit skipped” for this route.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default function geo(req, res) {
  const raw = req.headers['x-vercel-ip-country'];
  const country =
    typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? null : null;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, max-age=0');
  res.end(JSON.stringify({ country }));
}
