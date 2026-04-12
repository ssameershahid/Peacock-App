export interface SLCity {
  name: string;
  lat: number;
  lng: number;
  region: string;
}

/** Curated list of Sri Lankan cities/airports with coordinates. */
export const SRI_LANKA_CITIES: SLCity[] = [
  { name: 'Colombo', lat: 6.9271, lng: 79.8612, region: 'Western' },
  { name: 'Bandaranaike Airport (CMB)', lat: 7.1808, lng: 79.8841, region: 'Western' },
  { name: 'Negombo', lat: 7.2083, lng: 79.8358, region: 'Western' },
  { name: 'Gampaha', lat: 7.0873, lng: 80.0144, region: 'Western' },
  { name: 'Kalutara', lat: 6.5854, lng: 79.9607, region: 'Western' },
  { name: 'Beruwala', lat: 6.4787, lng: 79.9828, region: 'Western' },
  { name: 'Bentota', lat: 6.4198, lng: 79.9967, region: 'Western' },
  { name: 'Kandy', lat: 7.2906, lng: 80.6337, region: 'Central' },
  { name: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891, region: 'Central' },
  { name: 'Matale', lat: 7.4675, lng: 80.6234, region: 'Central' },
  { name: 'Horton Plains', lat: 6.8019, lng: 80.7993, region: 'Central' },
  { name: 'Sigiriya', lat: 7.9570, lng: 80.7603, region: 'North Central' },
  { name: 'Dambulla', lat: 7.8731, lng: 80.6517, region: 'North Central' },
  { name: 'Polonnaruwa', lat: 7.9403, lng: 81.0188, region: 'North Central' },
  { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037, region: 'North Central' },
  { name: 'Minneriya', lat: 8.0385, lng: 80.9004, region: 'North Central' },
  { name: 'Kurunegala', lat: 7.4863, lng: 80.3647, region: 'North Western' },
  { name: 'Wilpattu', lat: 8.4167, lng: 80.0167, region: 'North Western' },
  { name: 'Ella', lat: 6.8667, lng: 81.0466, region: 'Uva' },
  { name: 'Haputale', lat: 6.7685, lng: 80.9618, region: 'Uva' },
  { name: 'Badulla', lat: 6.9934, lng: 81.0550, region: 'Uva' },
  { name: 'Ratnapura', lat: 6.6828, lng: 80.3992, region: 'Sabaragamuwa' },
  { name: 'Galle', lat: 6.0535, lng: 80.2210, region: 'Southern' },
  { name: 'Unawatuna', lat: 6.0174, lng: 80.2496, region: 'Southern' },
  { name: 'Hikkaduwa', lat: 6.1395, lng: 80.1054, region: 'Southern' },
  { name: 'Mirissa', lat: 5.9483, lng: 80.4716, region: 'Southern' },
  { name: 'Matara', lat: 5.9549, lng: 80.5550, region: 'Southern' },
  { name: 'Tangalle', lat: 6.0225, lng: 80.7977, region: 'Southern' },
  { name: 'Hambantota', lat: 6.1228, lng: 81.1185, region: 'Southern' },
  { name: 'Yala', lat: 6.3729, lng: 81.5196, region: 'Southern' },
  { name: 'Udawalawe', lat: 6.4398, lng: 80.8996, region: 'Southern' },
  { name: 'Arugam Bay', lat: 6.8397, lng: 81.8362, region: 'Eastern' },
  { name: 'Trincomalee', lat: 8.5874, lng: 81.2152, region: 'Eastern' },
  { name: 'Batticaloa', lat: 7.7102, lng: 81.6924, region: 'Eastern' },
  { name: 'Jaffna', lat: 9.6615, lng: 80.0255, region: 'Northern' },
];

/** Find a city by name (case-insensitive, partial match). */
export function findCity(name: string): SLCity | undefined {
  const lower = name.toLowerCase();
  return SRI_LANKA_CITIES.find(c => c.name.toLowerCase() === lower)
    ?? SRI_LANKA_CITIES.find(c => c.name.toLowerCase().includes(lower))
    ?? SRI_LANKA_CITIES.find(c => lower.includes(c.name.toLowerCase()));
}
