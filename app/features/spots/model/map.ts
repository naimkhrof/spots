import type { Spot } from "./spot";

/** Centre de Genève (jet d'eau), en [longitude, latitude] comme l'attend GeoJSON. */
export const GENEVA_CENTER: [lng: number, lat: number] = [6.1432, 46.2044];

/**
 * Sous-ensemble de GeoJSON écrit à la main : le modèle ne dépend d'aucun paquet de types,
 * et le compilateur vérifie quand même la forme attendue par la carte.
 */
export interface SpotFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [lng: number, lat: number] };
  properties: { id: string; known: boolean };
}
export interface SpotFeatureCollection {
  type: "FeatureCollection";
  features: SpotFeature[];
}

/** `known` porte la distinction « équipement renseigné / non renseigné » jusqu'au style de la carte. */
export function spotsToGeoJson(spots: Spot[]): SpotFeatureCollection {
  return {
    type: "FeatureCollection",
    features: spots.map((spot) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [spot.lng, spot.lat] },
      properties: { id: spot.id, known: spot.equipment !== null },
    })),
  };
}

/** Emprise au format [ouest, sud, est, nord]. */
export type Bounds = [west: number, south: number, east: number, north: number];

/** Emprise englobant toutes les aires, ou `null` s'il n'y en a aucune : l'appelant choisit alors la vue par défaut. */
export function boundsOf(spots: Spot[]): Bounds | null {
  if (spots.length === 0) return null;
  let [west, south, east, north] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const { lng, lat } of spots) {
    west = Math.min(west, lng);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    north = Math.max(north, lat);
  }
  return [west, south, east, north];
}
