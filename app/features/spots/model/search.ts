import { EQUIPMENT, type Equipment } from "./equipment";
import type { SpotFilter } from "./spot";

/** Lit le filtre dans l'URL. Les valeurs inconnues sont ignorées : un lien abîmé ne casse pas la page. */
export function filterFromSearchParams(params: URLSearchParams): SpotFilter {
  const equipment = params.getAll("equipment").filter((value): value is Equipment => (EQUIPMENT as readonly string[]).includes(value));
  return { equipment: [...new Set(equipment)], includeUnknown: params.get("unknown") !== "0" };
}
