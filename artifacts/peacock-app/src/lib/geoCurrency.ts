/**
 * Rough IP-country → display currency for first-time visitors (Vercel geo).
 * Not exact FX territories; OK for “good enough” defaults per product decision.
 */

/** UK + closely associated territories typically priced in GBP */
const GBP_ISO = new Set(['GB', 'GG', 'JE', 'IM', 'GI']);

/**
 * Broad geographic Europe (excluding GBP territories above). Norway etc. → EUR for display only.
 * Intentionally approximate — VPN / edge cases are acceptable.
 */
const EUROPE_ISO = new Set(
  [
    'AD', 'AL', 'AT', 'AX', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES',
    'FI', 'FO', 'FR', 'GE', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MC',
    'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SK', 'SM',
    'SJ', 'TR', 'UA', 'VA', 'XK', 'GL',
  ]
);

export function suggestedCurrencyCodeFromCountry(country: string | null | undefined): string | null {
  if (!country || country.length !== 2) return null;
  const cc = country.toUpperCase();

  if (GBP_ISO.has(cc)) return 'GBP';
  if (cc === 'US') return 'USD';
  if (cc === 'CA') return 'CAD';
  if (cc === 'AU') return 'AUD';
  if (cc === 'LK') return 'LKR';
  if (EUROPE_ISO.has(cc)) return 'EUR';

  return null;
}
