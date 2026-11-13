import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl/esm";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { boundsOf, GENEVA_CENTER, spotsToGeoJson } from "../model/map";
import type { Spot } from "../model/spot";

const SPOTS = "spots";
const SELECTED = "selected";
const CLUSTERS_LAYER = "clusters";
const SPOTS_LAYER = "spots";
/** Au-delà de ce zoom, plus de regroupement : chaque aire est un point. */
const CLUSTER_MAX_ZOOM = 13;
const SELECTED_ZOOM = 15;

interface SpotMapProps {
  /** Jeton public Mapbox. Absent : le composant affiche un message à la place de la carte. */
  token: string | undefined;
  spots: Spot[];
  selected: Spot | null;
  onSelect: (id: string) => void;
  /** Dimensions et position, décidées par la page. */
  className?: string;
}

/**
 * Carte des aires. Le rendu serveur ne produit que le cadre : `mapbox-gl` a besoin de WebGL
 * et n'est chargé que dans le navigateur, par un `import()` dans un effet (voir ADR 0002).
 * La carte complète la liste, elle ne la remplace pas : sans jeton ou sans WebGL, un message suffit.
 */
export function SpotMap({ token, spots, selected, onSelect, className = "" }: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const select = useEffectEvent(onSelect);

  // Cycle de vie de la carte : créée une fois, détruite au démontage.
  useEffect(() => {
    const container = containerRef.current;
    if (!token || !container) return;
    let cancelled = false;
    let map: MapboxMap | undefined;
    const fail = () => {
      map?.remove();
      map = undefined;
      mapRef.current = null;
      if (!cancelled) setStatus("failed");
    };

    void (async () => {
      try {
        const [mapboxgl] = await Promise.all([import("mapbox-gl/esm"), import("mapbox-gl/dist/mapbox-gl.css")]);
        if (cancelled) return;
        if (!mapboxgl.supported()) return fail();

        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const created = new mapboxgl.Map({
          accessToken: token,
          container,
          style: dark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
          center: GENEVA_CENTER,
          zoom: 11,
          language: "fr",
          // La molette fait défiler la page ; zoomer demande Ctrl/⌘ ou deux doigts.
          cooperativeGestures: true,
        });
        map = created;
        created.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        let loaded = false;
        // Avant le premier affichage, une erreur (jeton refusé, style introuvable) rend la carte inutilisable.
        // Après, ce sont des tuiles manquées : la carte reste en place.
        created.on("error", () => {
          if (!loaded) queueMicrotask(fail);
        });
        created.on("load", () => {
          if (cancelled) return;
          loaded = true;
          const empty = spotsToGeoJson([]);
          created.addSource(SPOTS, {
            type: "geojson",
            data: empty,
            cluster: true,
            clusterMaxZoom: CLUSTER_MAX_ZOOM,
            clusterRadius: 40,
            attribution: "Aires © les contributeurs d’OpenStreetMap",
          });
          // Source à part, non regroupée : l'aire sélectionnée reste visible même au milieu d'un groupe.
          created.addSource(SELECTED, { type: "geojson", data: empty });
          created.addLayer({
            id: CLUSTERS_LAYER,
            type: "circle",
            source: SPOTS,
            filter: ["has", "point_count"],
            paint: {
              "circle-color": "#292524",
              "circle-radius": ["step", ["get", "point_count"], 15, 10, 19, 50, 24],
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2,
            },
          });
          created.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: SPOTS,
            filter: ["has", "point_count"],
            layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 12 },
            paint: { "text-color": "#ffffff" },
          });
          // Équipement connu : disque plein. Non renseigné : anneau creux. La forme porte l'information, pas seulement la couleur.
          created.addLayer({
            id: SPOTS_LAYER,
            type: "circle",
            source: SPOTS,
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": ["case", ["get", "known"], "#4d7c0f", dark ? "#1c1917" : "#ffffff"],
              "circle-radius": ["case", ["get", "known"], 7, 5],
              "circle-stroke-color": ["case", ["get", "known"], "#ffffff", dark ? "#e7e5e4" : "#57534e"],
              "circle-stroke-width": 2,
            },
          });
          created.addLayer({
            id: "selected-ring",
            type: "circle",
            source: SELECTED,
            paint: {
              "circle-radius": 13,
              "circle-opacity": 0,
              "circle-stroke-color": dark ? "#fafaf9" : "#1c1917",
              "circle-stroke-width": 3,
            },
          });

          created.addInteraction("spot-click", {
            type: "click",
            target: { layerId: SPOTS_LAYER },
            handler: (event) => {
              const id: unknown = event.feature?.properties.id;
              if (typeof id === "string") select(id);
            },
          });
          created.addInteraction("cluster-click", {
            type: "click",
            target: { layerId: CLUSTERS_LAYER },
            handler: (event) => {
              const clusterId: unknown = event.feature?.properties.cluster_id;
              if (typeof clusterId !== "number") return;
              created.getSource<GeoJSONSource>(SPOTS)?.getClusterExpansionZoom(clusterId, (error, zoom) => {
                if (!error && zoom != null) created.easeTo({ center: event.lngLat, zoom });
              });
            },
          });
          for (const layerId of [SPOTS_LAYER, CLUSTERS_LAYER]) {
            created.addInteraction(`${layerId}-enter`, {
              type: "mouseenter",
              target: { layerId },
              handler: () => {
                created.getCanvas().style.cursor = "pointer";
              },
            });
            created.addInteraction(`${layerId}-leave`, {
              type: "mouseleave",
              target: { layerId },
              handler: () => {
                created.getCanvas().style.cursor = "";
              },
            });
          }

          mapRef.current = created;
          setStatus("ready");
        });
      } catch {
        // Chargement du module échoué ou contexte WebGL refusé.
        fail();
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Les aires suivent le loader : à chaque changement de filtre, mêmes données que la liste, vue recadrée.
  const framedOnce = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;
    map.getSource<GeoJSONSource>(SPOTS)?.setData(spotsToGeoJson(spots));
    const bounds = boundsOf(spots);
    if (bounds) map.fitBounds(bounds, { padding: 48, maxZoom: SELECTED_ZOOM, animate: framedOnce.current });
    framedOnce.current = true;
  }, [status, spots]);

  // Sélection : anneau sur l'aire, et la carte s'y rend (clic dans la liste ou lien partagé).
  useEffect(() => {
    const map = mapRef.current;
    if (status !== "ready" || !map) return;
    map.getSource<GeoJSONSource>(SELECTED)?.setData(spotsToGeoJson(selected ? [selected] : []));
    if (selected) map.easeTo({ center: [selected.lng, selected.lat], zoom: Math.max(map.getZoom(), SELECTED_ZOOM) });
  }, [status, selected]);

  if (!token || status === "failed") {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
        {token ? "La carte n’a pas pu s’afficher." : "La carte n’est pas configurée."} La liste ci-dessous contient toutes les aires.
      </p>
    );
  }

  return (
    // `data-map` : la page s'en sert pour passer en deux colonnes seulement quand la carte existe.
    <section aria-label="Carte des aires" data-map="on" className={`flex flex-col gap-2 bg-white noscript:hidden dark:bg-gray-950 ${className}`}>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
        {/* Deux éléments : la feuille de style de Mapbox impose `position: relative` à son conteneur, ce qui annulerait `absolute`. */}
        <div className="absolute inset-0">
          <div ref={containerRef} className="size-full" />
        </div>
        {status === "loading" && <p className="absolute inset-0 grid place-items-center text-sm text-stone-600 dark:text-stone-400">Chargement de la carte…</p>}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-400" aria-label="Légende">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-full bg-lime-700 ring-2 ring-white" />
          Équipement renseigné
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full border-2 border-stone-600 bg-white dark:border-stone-200 dark:bg-stone-900" />
          Équipement non renseigné
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="grid size-4 place-items-center rounded-full bg-stone-800 text-[9px] font-medium text-white">3</span>
          Plusieurs aires proches
        </li>
      </ul>
    </section>
  );
}
