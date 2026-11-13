// Importe les aires de fitness du canton de Genève depuis OpenStreetMap (Overpass).
// Données © les contributeurs d'OpenStreetMap, licence ODbL.
import { writeFile } from "node:fs/promises";

const query = `[out:json][timeout:40];area["ISO3166-2"="CH-GE"]->.a;(nwr["leisure"="fitness_station"](area.a););out center tags;`;
const response = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "User-Agent": "spots-demo/0.1" },
  body: new URLSearchParams({ data: query }),
});
if (!response.ok) throw new Error(`Overpass a répondu ${response.status}`);
const { elements, osm3s } = await response.json();

const spots = elements
  .map((element) => ({
    id: `${element.type}/${element.id}`,
    name: element.tags?.name ?? null,
    lat: element.lat ?? element.center?.lat,
    lng: element.lon ?? element.center?.lon,
    // Valeur brute d'OSM : c'est le modèle de l'app qui l'interprète.
    fitnessStation: element.tags?.fitness_station ?? null,
  }))
  .filter((spot) => typeof spot.lat === "number" && typeof spot.lng === "number")
  .sort((a, b) => a.id.localeCompare(b.id));

const file = new URL("../app/features/spots/api/spots.geneve.json", import.meta.url);
await writeFile(file, `${JSON.stringify({ source: "OpenStreetMap", fetchedAt: osm3s.timestamp_osm_base, spots }, null, 2)}\n`);
console.log(`${spots.length} aires écrites`);
