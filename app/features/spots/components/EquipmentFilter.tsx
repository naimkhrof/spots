import { Form } from "react-router";
import { EQUIPMENT, EQUIPMENT_LABEL } from "../model/equipment";
import { SELECTED_PARAM } from "../model/search";
import type { SpotFilter } from "../model/spot";

/** Formulaire GET : le filtre vit dans l'URL, donc il se partage et fonctionne sans JavaScript. */
export function EquipmentFilter({ filter, selectedId }: { filter: SpotFilter; selectedId: string | null }) {
  return (
    <Form method="get" className="flex flex-col gap-4 rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
      {/* L'aire sélectionnée survit au changement de filtre, tant qu'elle reste dans les résultats. */}
      {selectedId && <input type="hidden" name={SELECTED_PARAM} value={selectedId} />}
      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-sm font-medium">Équipement nécessaire</legend>
        {EQUIPMENT.map((equipment) => (
          <label key={equipment} className="cursor-pointer rounded-full border border-stone-300 px-3 py-2 text-sm has-checked:border-lime-600 has-checked:bg-lime-100 has-focus-visible:outline-2 dark:border-stone-700 dark:has-checked:bg-lime-950">
            <input type="checkbox" name="equipment" value={equipment} defaultChecked={filter.equipment.includes(equipment)} className="sr-only" />
            {EQUIPMENT_LABEL[equipment]}
          </label>
        ))}
      </fieldset>
      <label className="flex items-center gap-2 text-sm">
        {/* Le champ caché donne « 0 » quand la case est décochée : une case décochée n'envoie rien. */}
        <input type="hidden" name="unknown" value="0" />
        <input type="checkbox" name="unknown" value="1" defaultChecked={filter.includeUnknown} />
        Inclure les aires dont l’équipement n’est pas renseigné
      </label>
      <button type="submit" className="self-start rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900">
        Filtrer
      </button>
    </Form>
  );
}
