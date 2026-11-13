import { z } from "zod";
import { EQUIPMENT, type Equipment } from "./equipment";

export const spotSchema = z.object({
  id: z.string().min(1),
  name: z.string().nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  /** `null` : équipement non renseigné dans la source. */
  equipment: z.array(z.enum(EQUIPMENT)).nullable(),
});
export type Spot = z.infer<typeof spotSchema>;

export interface SpotFilter {
  /** Le spot doit avoir tous ces équipements. */
  equipment: Equipment[];
  /** Garder aussi les spots dont l'équipement n'est pas renseigné. */
  includeUnknown: boolean;
}

export function filterSpots(spots: Spot[], filter: SpotFilter): Spot[] {
  if (filter.equipment.length === 0) {
    return filter.includeUnknown ? spots : spots.filter((spot) => spot.equipment !== null);
  }
  return spots.filter((spot) => {
    if (spot.equipment === null) return filter.includeUnknown;
    const available = spot.equipment;
    return filter.equipment.every((wanted) => available.includes(wanted));
  });
}
