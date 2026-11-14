import { Form, Link, useSubmit } from "react-router";
import { EQUIPMENT, EQUIPMENT_LABEL } from "../model/equipment";
import { SELECTED_PARAM } from "../model/search";
import type { SpotFilter } from "../model/spot";

/**
 * Formulaire GET : le filtre vit dans l'URL, donc il se partage et fonctionne sans JavaScript.
 * Avec JavaScript, chaque changement envoie le formulaire ; le bouton ne reste que pour le cas sans script.
 */
export function EquipmentFilter({ filter, selectedId }: { filter: SpotFilter; selectedId: string | null }) {
  const submit = useSubmit();
  const active = filter.equipment.length > 0 || !filter.includeUnknown;
  return (
    <Form method="get" onChange={(event) => submit(event.currentTarget, { replace: true, preventScrollReset: true })} className="flex flex-col gap-4">
      {/* L'aire sélectionnée survit au changement de filtre, tant qu'elle reste dans les résultats. */}
      {selectedId && <input type="hidden" name={SELECTED_PARAM} value={selectedId} />}
      <fieldset>
        <legend className="mb-2.5 flex w-full items-center justify-between text-xs font-semibold tracking-wider text-stone-500 uppercase dark:text-stone-400">
          Équipement nécessaire
          {active && (
            <Link to="/" replace preventScrollReset reloadDocument className="font-medium tracking-normal normal-case underline underline-offset-4 hover:text-stone-900 dark:hover:text-stone-100">
              Réinitialiser
            </Link>
          )}
        </legend>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((equipment) => (
            <label
              key={equipment}
              className="cursor-pointer rounded-full border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium transition-colors select-none hover:border-stone-500 has-checked:border-lime-400 has-checked:bg-lime-400 has-checked:text-lime-950 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-lime-500 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-500 dark:has-checked:border-lime-400 dark:has-checked:bg-lime-400"
            >
              <input type="checkbox" name="equipment" value={equipment} defaultChecked={filter.equipment.includes(equipment)} className="sr-only" />
              {EQUIPMENT_LABEL[equipment]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex cursor-pointer items-center justify-between gap-3 text-sm select-none">
        <span>
          Inclure les aires non renseignées
          <span className="block text-xs text-stone-500 dark:text-stone-400">OpenStreetMap ne précise pas toujours l’équipement.</span>
        </span>
        {/* Le champ caché donne « 0 » quand la case est décochée : une case décochée n'envoie rien. */}
        <input type="hidden" name="unknown" value="0" />
        <input type="checkbox" name="unknown" value="1" defaultChecked={filter.includeUnknown} className="peer sr-only" />
        <span
          aria-hidden
          className="relative h-6 w-11 shrink-0 rounded-full bg-stone-300 transition-colors peer-checked:bg-lime-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime-500 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 dark:bg-stone-700"
        />
      </label>
      <button type="submit" className="self-start rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900 [@media(scripting:enabled)]:hidden">
        Filtrer
      </button>
    </Form>
  );
}
