/** Équipements utiles à la callisthénie, tels que l'app les expose. */
export const EQUIPMENT = ["pull_up_bar", "parallel_bars", "rings", "monkey_bars", "wall_bars", "sit_up_bench"] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  pull_up_bar: "Barre de traction",
  parallel_bars: "Barres parallèles",
  rings: "Anneaux",
  monkey_bars: "Échelle horizontale",
  wall_bars: "Espalier",
  sit_up_bench: "Banc à abdominaux",
};

/** Valeurs du tag OSM `fitness_station` que l'app sait interpréter. */
const FROM_OSM: Record<string, Equipment> = {
  horizontal_bar: "pull_up_bar",
  parallel_bars: "parallel_bars",
  rings: "rings",
  horizontal_ladder: "monkey_bars",
  wall_bars: "wall_bars",
  "sit-up": "sit_up_bench",
};

/**
 * Interprète le tag OSM `fitness_station` (valeurs séparées par `;`).
 * Renvoie `null` quand OSM ne dit rien d'exploitable : « inconnu » n'est pas
 * « aucun équipement », et l'interface doit pouvoir faire la différence.
 */
export function parseOsmEquipment(tag: string | null): Equipment[] | null {
  if (!tag) return null;
  const known = tag
    .split(";")
    .map((value) => FROM_OSM[value.trim()])
    .filter((value): value is Equipment => value !== undefined);
  return known.length > 0 ? [...new Set(known)] : null;
}
