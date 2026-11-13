import { listSpots } from "~/features/spots/api/spots.server";
import { EquipmentFilter } from "~/features/spots/components/EquipmentFilter";
import { SpotList } from "~/features/spots/components/SpotList";
import { filterFromSearchParams } from "~/features/spots/model/search";
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

export default function Home({ loaderData }: Route.ComponentProps) {
  const { filter, spots, total, fetchedAt } = loaderData;
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Spots</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">Aires de callisthénie du canton de Genève, filtrées par équipement.</p>
      </header>
      <EquipmentFilter filter={filter} />
      <section aria-labelledby="results" className="flex flex-col gap-3">
        <h2 id="results" className="text-sm font-medium" aria-live="polite">
          {spots.length} aire{spots.length > 1 ? "s" : ""} sur {total}
        </h2>
        <SpotList spots={spots} />
      </section>
      <footer className="text-xs text-stone-500">
        Données © les contributeurs d’OpenStreetMap (ODbL), relevées le {new Date(fetchedAt).toLocaleDateString("fr-CH", { timeZone: "UTC" })}.
      </footer>
    </main>
  );
}
