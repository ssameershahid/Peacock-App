export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

// Coordinate lookup for Sri Lankan locations [lng, lat]
export const SRI_LANKA_COORDS: Record<string, [number, number]> = {
  'Colombo': [79.8612, 6.9271],
  'Negombo': [79.8380, 7.2083],
  'Sigiriya': [80.7597, 7.9572],
  'Kandy': [80.6350, 7.2906],
  'Ella': [81.0470, 6.8667],
  'Galle': [80.2170, 6.0535],
  'Yala': [81.5256, 6.3718],
  'Trincomalee': [81.2342, 8.5772],
  'Nuwara Eliya': [80.7718, 6.9497],
  'Tangalle': [80.7967, 6.0248],
  'Anuradhapura': [80.3957, 8.3114],
  'Haputale': [80.9585, 6.7667],
  'Mirissa': [80.4546, 5.9482],
  'Arugam Bay': [81.8381, 6.8397],
  'Jaffna': [80.0137, 9.6615],
  'Dambulla': [80.6519, 7.8731],
  'Polonnaruwa': [81.0177, 7.9403],
  'Hikkaduwa': [80.1001, 6.1395],
  'Bentota': [80.0033, 6.4259],
  'Unawatuna': [80.2496, 6.0105],
  'Weligama': [80.4299, 5.9746],
  'Matara': [80.5353, 5.9549],
  'Hambantota': [81.1198, 6.1241],
  'Tissamaharama': [81.2844, 6.2850],
  'Pinnawala': [80.3501, 7.2967],
  "Adam's Peak": [80.4994, 6.8096],
  'Horton Plains': [80.8021, 6.8024],
  'Udawalawe': [80.8892, 6.4394],
  'Minneriya': [80.9001, 8.0325],
  'Wilpattu': [79.8773, 8.4586],
  'Ratnapura': [80.3832, 6.6828],
  'Badulla': [81.0553, 6.9936],
  'Matale': [80.6247, 7.4675],
  'Puttalam': [79.8283, 8.0321],
  'Batticaloa': [81.6922, 7.7102],
  'Bentota Beach': [80.0033, 6.4259],
  'CMB Airport': [79.8867, 7.1808],
  'Bandaranaike Airport': [79.8867, 7.1808],
};

export function getCoords(locationName: string): [number, number] | null {
  const exact = SRI_LANKA_COORDS[locationName];
  if (exact) return exact;
  const lower = locationName.toLowerCase();
  for (const [key, coords] of Object.entries(SRI_LANKA_COORDS)) {
    if (key.toLowerCase() === lower) return coords;
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return coords;
  }
  return null;
}

/**
 * Geocode a freeform location string using Mapbox Geocoding API,
 * restricted to Sri Lanka. Returns [lng, lat] or null.
 */
export async function geocodeLocation(query: string): Promise<[number, number] | null> {
  if (!query.trim() || !MAPBOX_TOKEN) return null;
  const encoded = encodeURIComponent(query);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?country=LK&proximity=80.6350,7.8731&limit=1&access_token=${MAPBOX_TOKEN}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.center as [number, number];
    return [lng, lat];
  } catch {
    return null;
  }
}

export interface RouteGeoJSON {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export async function fetchRoute(coordinates: [number, number][]): Promise<RouteGeoJSON | null> {
  if (coordinates.length < 2 || !MAPBOX_TOKEN) return null;
  const coordStr = coordinates.slice(0, 25).map(([lng, lat]) => `${lng},${lat}`).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.[0]) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: data.routes[0].geometry,
    };
  } catch {
    return null;
  }
}
