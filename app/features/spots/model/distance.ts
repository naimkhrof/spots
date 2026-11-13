export interface Coordinates {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Distance à vol d'oiseau en mètres (formule de haversine). */
export function distanceInMeters(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function sortByDistance<T extends Coordinates>(items: T[], origin: Coordinates): T[] {
  return [...items].sort((a, b) => distanceInMeters(origin, a) - distanceInMeters(origin, b));
}
