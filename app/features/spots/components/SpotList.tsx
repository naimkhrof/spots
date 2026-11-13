import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { EQUIPMENT_LABEL } from "../model/equipment";
import { withSelectedSpot } from "../model/search";
import type { Spot } from "../model/spot";

/**
 * Chaque aire est un lien qui la sélectionne dans l'URL : la liste se parcourt au clavier
 * et fonctionne sans JavaScript ni carte.
 */
export function SpotList({ spots, selectedId }: { spots: Spot[]; selectedId: string | null }) {
  const [searchParams] = useSearchParams();
  const selectedRef = useRef<HTMLLIElement>(null);

  // Sélection venue de la carte ou d'un lien partagé : amener l'aire à l'écran, sans déplacer le focus.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    selectedRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [selectedId]);

  if (spots.length === 0) {
    return <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm dark:border-stone-700">Aucune aire ne correspond. Retirez un équipement ou incluez les aires non renseignées.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {spots.map((spot) => {
        const selected = spot.id === selectedId;
        return (
          <li
            key={spot.id}
            ref={selected ? selectedRef : undefined}
            // Marge de défilement : sur mobile la carte reste collée en haut et ne doit pas masquer l'aire.
            className={`scroll-mt-[calc(40dvh+1rem)] rounded-2xl border p-4 lg:scroll-mt-4 ${selected ? "border-lime-700 bg-lime-50 dark:bg-lime-950" : "border-stone-200 dark:border-stone-800"}`}
          >
            <h3 className="font-medium">
              <Link
                to={{ search: withSelectedSpot(searchParams, spot.id).toString() }}
                replace
                preventScrollReset
                aria-current={selected ? "true" : undefined}
                className="underline-offset-4 hover:underline"
              >
                {spot.name ?? "Aire de fitness"}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {spot.equipment ? spot.equipment.map((equipment) => EQUIPMENT_LABEL[equipment]).join(" · ") : "Équipement non renseigné"}
            </p>
            <a className="mt-2 inline-block text-sm underline" href={`https://www.openstreetmap.org/${spot.id}`} rel="noreferrer" target="_blank">
              Voir sur OpenStreetMap
            </a>
          </li>
        );
      })}
    </ul>
  );
}
