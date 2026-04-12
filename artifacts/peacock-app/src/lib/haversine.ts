/** Straight-line distance between two lat/lng points in kilometres (Haversine formula). */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate location surcharge.
 * Free zone: first 50 km.
 * Each additional 50 km block (or part thereof) costs `ratePerBlock`.
 * e.g. 51–100 km → 1 block, 101–150 km → 2 blocks.
 */
export function calcLocationSurcharge(distanceKm: number, ratePerBlock: number): number {
  if (distanceKm <= 50) return 0;
  const blocks = Math.floor((distanceKm - 50) / 50) + 1;
  return blocks * ratePerBlock;
}
