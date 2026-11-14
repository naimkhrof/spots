import { EQUIPMENT, type Equipment } from "./equipment";
import type { SpotFilter } from "./spot";

/** Lit le filtre dans l'URL. Les valeurs inconnues sont ignorées : un lien abîmé ne casse pas la page. */
export function filterFromSearchParams(params: URLSearchParams): SpotFilter {
  const equipment = params.getAll("equipment").filter((value): value is Equipment => (EQUIPMENT as readonly string[]).includes(value));
  // Le formulaire envoie « unknown=0 » (champ caché) puis « unknown=1 » si la case est cochée : la dernière valeur décide.
  return { equipment: [...new Set(equipment)], includeUnknown: params.getAll("unknown").at(-1) !== "0" };
}

/** Paramètre d'URL qui porte l'aire sélectionnée. */
export const SELECTED_PARAM = "spot";

/** L'aire désignée par l'URL, si elle fait partie des aires affichées. Un identifiant inconnu ou filtré ne sélectionne rien. */
export function selectedSpotFromSearchParams<T extends { id: string }>(params: URLSearchParams, spots: T[]): T | null {
  const id = params.get(SELECTED_PARAM);
  return (id && spots.find((spot) => spot.id === id)) || null;
}

/** Copie des paramètres avec l'aire sélectionnée remplacée ; le filtre est conservé. */
export function withSelectedSpot(params: URLSearchParams, id: string | null): URLSearchParams {
  const next = new URLSearchParams(params);
  if (id) next.set(SELECTED_PARAM, id);
  else next.delete(SELECTED_PARAM);
  return next;
}

/** Vrai si deux URL ne diffèrent que par l'aire sélectionnée : les données du serveur sont alors les mêmes. */
export function onlySelectionChanged(current: URL, next: URL): boolean {
  if (current.pathname !== next.pathname) return false;
  const filterOf = (url: URL) => withSelectedSpot(url.searchParams, null).toString();
  return filterOf(current) === filterOf(next);
}
