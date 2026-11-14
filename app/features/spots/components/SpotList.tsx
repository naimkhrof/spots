import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { distanceInMeters, formatDistance, type Coordinates } from "../model/distance";
import { EQUIPMENT_LABEL } from "../model/equipment";
import { withSelectedSpot } from "../model/search";
import type { Spot } from "../model/spot";

interface SpotListProps {
  spots: Spot[];
  selectedId: string | null;
  /** Position de l'utilisateur, si elle est connue : affiche la distance à chaque aire. */
  origin: Coordinates | null;
}

/**
 * Chaque aire est un lien qui la sélectionne dans l'URL : la liste se parcourt au clavier
 * et fonctionne sans JavaScript ni carte.
 */
export function SpotList({ spots, selectedId, origin }: SpotListProps) {
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
    <ul className="flex flex-col gap-2.5">
      {spots.map((spot) => {
        const selected = spot.id === selectedId;
        return (
          <li
            key={spot.id}
            ref={selected ? selectedRef : undefined}
            // Marge de défilement : sur mobile la carte reste collée en haut et ne doit pas masquer l'aire.
            className={`relative scroll-mt-[calc(42dvh+1.5rem)] rounded-2xl border p-4 transition-colors lg:scroll-mt-4 ${
              selected
                ? "border-lime-500 bg-lime-50 shadow-sm ring-2 ring-lime-400/40 dark:bg-lime-950/60"
                : "border-stone-200 bg-white hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-600"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-semibold">
                {/* Le lien couvre toute la carte ; les liens secondaires repassent au-dessus. */}
                <Link
                  to={{ search: withSelectedSpot(searchParams, spot.id).toString() }}
                  replace
                  preventScrollReset
                  aria-current={selected ? "true" : undefined}
                  className="rounded-2xl outline-offset-4 after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-lime-500"
                >
                  {spot.name ?? "Aire de fitness"}
                </Link>
              </h3>
              {origin && <span className="shrink-0 text-sm font-medium text-stone-600 tabular-nums dark:text-stone-300">{formatDistance(distanceInMeters(origin, spot))}</span>}
            </div>
            {spot.equipment ? (
              <ul aria-label="Équipement" className="mt-2 flex flex-wrap gap-1.5">
                {spot.equipment.map((equipment) => (
                  <li key={equipment} className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-medium text-lime-900 dark:bg-lime-400/15 dark:text-lime-300">
                    {EQUIPMENT_LABEL[equipment]}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Équipement non renseigné</p>
            )}
            <p className="relative z-10 mt-3 flex w-fit gap-4 text-sm text-stone-600 dark:text-stone-400">
              <a className="underline underline-offset-4 hover:text-stone-950 dark:hover:text-white" href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`} rel="noreferrer" target="_blank">
                Itinéraire
              </a>
              <a className="underline underline-offset-4 hover:text-stone-950 dark:hover:text-white" href={`https://www.openstreetmap.org/${spot.id}`} rel="noreferrer" target="_blank">
                OpenStreetMap
              </a>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
