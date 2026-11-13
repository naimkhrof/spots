import { EQUIPMENT_LABEL } from "../model/equipment";
import type { Spot } from "../model/spot";

export function SpotList({ spots }: { spots: Spot[] }) {
  if (spots.length === 0) {
    return <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm dark:border-stone-700">Aucune aire ne correspond. Retirez un équipement ou incluez les aires non renseignées.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {spots.map((spot) => (
        <li key={spot.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
          <h3 className="font-medium">{spot.name ?? "Aire de fitness"}</h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {spot.equipment ? spot.equipment.map((equipment) => EQUIPMENT_LABEL[equipment]).join(" · ") : "Équipement non renseigné"}
          </p>
          <a className="mt-2 inline-block text-sm underline" href={`https://www.openstreetmap.org/${spot.id}`} rel="noreferrer" target="_blank">
            Voir sur OpenStreetMap
          </a>
        </li>
      ))}
    </ul>
  );
}
