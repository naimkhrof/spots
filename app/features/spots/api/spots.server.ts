import { z } from "zod";
import { parseOsmEquipment } from "../model/equipment";
import { spotSchema, type Spot } from "../model/spot";
import raw from "./spots.geneve.json";

// Frontière de validation : le format de la source est converti ici, une seule fois.
const sourceSchema = z.object({
  fetchedAt: z.string(),
  spots: z.array(z.object({ id: z.string(), name: z.string().nullable(), lat: z.number(), lng: z.number(), fitnessStation: z.string().nullable() })),
});

const source = sourceSchema.parse(raw);
const spots: Spot[] = source.spots.map(({ fitnessStation, ...spot }) => spotSchema.parse({ ...spot, equipment: parseOsmEquipment(fitnessStation) }));

export function listSpots(): { spots: Spot[]; fetchedAt: string } {
  return { spots, fetchedAt: source.fetchedAt };
}
