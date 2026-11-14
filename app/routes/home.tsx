import { useMemo, useState } from "react";
import { useSearchParams, type ShouldRevalidateFunctionArgs } from "react-router";
import { listSpots } from "~/features/spots/api/spots.server";
import { EquipmentFilter } from "~/features/spots/components/EquipmentFilter";
import { NearMeButton } from "~/features/spots/components/NearMeButton";
import { SpotList } from "~/features/spots/components/SpotList";
import { SpotMap } from "~/features/spots/components/SpotMap";
import { sortByDistance, type Coordinates } from "~/features/spots/model/distance";
import { filterFromSearchParams, onlySelectionChanged, selectedSpotFromSearchParams, withSelectedSpot } from "~/features/spots/model/search";
import { filterSpots } from "~/features/spots/model/spot";
import type { Route } from "./+types/home";

const TITLE = "Spots — aires de street workout à Genève";
const DESCRIPTION = "Trouver une aire de street workout à Genève selon l’équipement disponible : barres de traction, parallèles, anneaux.";

export function meta() {
  return [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  const filter = filterFromSearchParams(new URL(request.url).searchParams);
  const { spots, fetchedAt } = listSpots();
  return { filter, spots: filterSpots(spots, filter), total: spots.length, knownTotal: spots.filter((spot) => spot.equipment !== null).length, fetchedAt };
}

/** Sélectionner une aire change l'URL mais pas les données : inutile de rappeler le loader. */
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return onlySelectionChanged(currentUrl, nextUrl) ? false : defaultShouldRevalidate;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { filter, spots, total, knownTotal, fetchedAt } = loaderData;
  // L'aire sélectionnée est un état d'URL, lu ici et nulle part ailleurs : la carte et la liste le reçoivent en props.
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = selectedSpotFromSearchParams(searchParams, spots);
  const select = (id: string) => setSearchParams((current) => withSelectedSpot(current, id), { replace: true, preventScrollReset: true });
  // La position de l'utilisateur ne quitte pas le navigateur : état local, jamais dans l'URL.
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const ordered = useMemo(() => (origin ? sortByDistance(spots, origin) : spots), [spots, origin]);

  return (
    // Sans carte : une colonne centrée. Avec carte : sur mobile la carte reste collée en haut,
    // sur grand écran un panneau défilant à gauche et la carte sur toute la hauteur.
    <main className="group mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 has-data-map:max-w-none lg:has-data-map:grid lg:has-data-map:h-dvh lg:has-data-map:grid-cols-[30rem_1fr] lg:has-data-map:gap-0 lg:has-data-map:p-0 noscript:max-w-2xl! lg:noscript:flex! lg:noscript:h-auto! lg:noscript:px-4! lg:noscript:py-6!">
      <div className="contents lg:group-has-data-map:flex lg:group-has-data-map:flex-col lg:group-has-data-map:gap-6 lg:group-has-data-map:overflow-y-auto lg:group-has-data-map:px-6 lg:group-has-data-map:py-7 lg:noscript:contents!">
        <header className="order-1">
          <p className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight">
            <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-lime-400 text-lime-950">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V5m16 16V5M2 8h20M9 8v5a3 3 0 0 0 6 0V8" />
              </svg>
            </span>
            Spots
          </p>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance">
            Le bon spot de <span className="bg-lime-400 box-decoration-clone px-1.5 text-lime-950">street workout</span> à Genève.
          </h1>
          <p className="mt-3 text-stone-600 dark:text-stone-400">Choisissez votre équipement, la carte montre où s’entraîner.</p>
          <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              [total, "aires dans le canton"],
              [knownTotal, "avec équipement détaillé"],
              ["0", "pub, compte ou abonnement"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse rounded-2xl bg-stone-200/70 px-2 py-3 dark:bg-stone-900">
                <dt className="text-xs leading-tight text-stone-600 dark:text-stone-400">{label}</dt>
                <dd className="font-display text-2xl font-extrabold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </header>
        <div className="order-2">
          <EquipmentFilter filter={filter} selectedId={selected?.id ?? null} />
        </div>
        <section aria-labelledby="results" className="order-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h2 id="results" className="scroll-mt-4 font-display text-xl font-bold" aria-live="polite">
              {spots.length} aire{spots.length > 1 ? "s" : ""} <span className="text-base font-medium text-stone-500 dark:text-stone-400">sur {total}</span>
            </h2>
            <NearMeButton active={origin !== null} onChange={setOrigin} />
          </div>
          <SpotList spots={ordered} selectedId={selected?.id ?? null} origin={origin} />
        </section>
        <footer className="order-5 text-xs text-stone-500 dark:text-stone-400">
          Données © les contributeurs d’
          <a className="underline underline-offset-2" href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">
            OpenStreetMap
          </a>{" "}
          (ODbL), relevées le {new Date(fetchedAt).toLocaleDateString("fr-CH", { timeZone: "UTC" })}. Code sur{" "}
          <a className="underline underline-offset-2" href="https://github.com/naimkhrof/spots" rel="noreferrer" target="_blank">
            GitHub
          </a>
          .
        </footer>
      </div>
      <SpotMap
        token={import.meta.env.VITE_MAPBOX_TOKEN}
        spots={spots}
        selected={selected}
        onSelect={select}
        className="sticky top-0 z-10 order-3 h-[42dvh] min-h-52 bg-stone-100 pt-2 lg:static lg:order-none lg:h-dvh lg:pt-0 dark:bg-stone-950"
        fallbackClassName="order-3"
      />
    </main>
  );
}
