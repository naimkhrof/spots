import { useSearchParams, type ShouldRevalidateFunctionArgs } from "react-router";
import { listSpots } from "~/features/spots/api/spots.server";
import { EquipmentFilter } from "~/features/spots/components/EquipmentFilter";
import { SpotList } from "~/features/spots/components/SpotList";
import { SpotMap } from "~/features/spots/components/SpotMap";
import { filterFromSearchParams, onlySelectionChanged, selectedSpotFromSearchParams, withSelectedSpot } from "~/features/spots/model/search";
import { filterSpots } from "~/features/spots/model/spot";
import type { Route } from "./+types/home";

export function meta() {
  return [{ title: "Spots — aires de callisthénie à Genève" }, { name: "description", content: "Trouver une aire de street workout à Genève selon l’équipement disponible." }];
}

export function loader({ request }: Route.LoaderArgs) {
  const filter = filterFromSearchParams(new URL(request.url).searchParams);
  const { spots, fetchedAt } = listSpots();
  return { filter, spots: filterSpots(spots, filter), total: spots.length, fetchedAt };
}

/** Sélectionner une aire change l'URL mais pas les données : inutile de rappeler le loader. */
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return onlySelectionChanged(currentUrl, nextUrl) ? false : defaultShouldRevalidate;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { filter, spots, total, fetchedAt } = loaderData;
  // L'aire sélectionnée est un état d'URL, lu ici et nulle part ailleurs : la carte et la liste le reçoivent en props.
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = selectedSpotFromSearchParams(searchParams, spots);
  const select = (id: string) => setSearchParams((current) => withSelectedSpot(current, id), { replace: true, preventScrollReset: true });

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 has-data-map:max-w-6xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Spots</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">Aires de callisthénie du canton de Genève, filtrées par équipement.</p>
      </header>
      <EquipmentFilter filter={filter} selectedId={selected?.id ?? null} />
      <a href="#results" className="sr-only self-start rounded-full bg-stone-900 px-4 py-2 text-sm text-white focus:not-sr-only">
        Aller à la liste des aires
      </a>
      {/* Colonne sur mobile (la carte reste collée en haut), deux colonnes sur grand écran si la carte existe. */}
      <div className="flex flex-col gap-6 lg:grid lg:items-start lg:has-data-map:grid-cols-2 lg:noscript:grid-cols-1!">
        <SpotMap token={import.meta.env.VITE_MAPBOX_TOKEN} spots={spots} selected={selected} onSelect={select} className="sticky top-0 z-10 h-[40dvh] min-h-48 pt-2 lg:top-4 lg:h-[calc(100dvh-2rem)] lg:pt-0" />
        <section aria-labelledby="results" className="flex flex-col gap-3">
          <h2 id="results" className="scroll-mt-4 text-sm font-medium" aria-live="polite">
            {spots.length} aire{spots.length > 1 ? "s" : ""} sur {total}
          </h2>
          <SpotList spots={spots} selectedId={selected?.id ?? null} />
        </section>
      </div>
      <footer className="text-xs text-stone-500">
        Données © les contributeurs d’OpenStreetMap (ODbL), relevées le {new Date(fetchedAt).toLocaleDateString("fr-CH", { timeZone: "UTC" })}.
      </footer>
    </main>
  );
}
