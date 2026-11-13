import { describe, expect, it } from "vitest";
import { boundsOf, spotsToGeoJson } from "./map";
import { onlySelectionChanged, selectedSpotFromSearchParams, withSelectedSpot } from "./search";
import type { Spot } from "./spot";

const spot = (id: string, equipment: Spot["equipment"], lat = 46.2, lng = 6.14): Spot => ({ id, name: null, lat, lng, equipment });

describe("spotsToGeoJson", () => {
  it("place la longitude avant la latitude, comme l'exige GeoJSON", () => {
    const [feature] = spotsToGeoJson([spot("a", ["rings"], 46.2, 6.14)]).features;
    expect(feature?.geometry).toEqual({ type: "Point", coordinates: [6.14, 46.2] });
  });
  it("distingue équipement renseigné et non renseigné", () => {
    const features = spotsToGeoJson([spot("a", ["rings"]), spot("b", null), spot("c", [])]).features;
    expect(features.map((feature) => feature.properties)).toEqual([
      { id: "a", known: true },
      { id: "b", known: false },
      { id: "c", known: true },
    ]);
  });
  it("renvoie une collection vide sans aire", () => {
    expect(spotsToGeoJson([])).toEqual({ type: "FeatureCollection", features: [] });
  });
});

describe("boundsOf", () => {
  it("englobe toutes les aires, au format [ouest, sud, est, nord]", () => {
    expect(boundsOf([spot("a", null, 46.2, 6.1), spot("b", null, 46.3, 6.0), spot("c", null, 46.1, 6.2)])).toEqual([6.0, 46.1, 6.2, 46.3]);
  });
  it("se réduit à un point pour une seule aire", () => {
    expect(boundsOf([spot("a", null, 46.2, 6.1)])).toEqual([6.1, 46.2, 6.1, 46.2]);
  });
  it("renvoie null sans aire", () => {
    expect(boundsOf([])).toBeNull();
  });
});

describe("sélection dans l'URL", () => {
  const spots = [spot("node/1", null), spot("node/2", ["rings"])];

  it("retrouve l'aire désignée par l'URL", () => {
    expect(selectedSpotFromSearchParams(new URLSearchParams("spot=node/2"), spots)?.id).toBe("node/2");
  });
  it("ne sélectionne rien si l'aire est absente des résultats ou du lien", () => {
    expect(selectedSpotFromSearchParams(new URLSearchParams("spot=node/9"), spots)).toBeNull();
    expect(selectedSpotFromSearchParams(new URLSearchParams(""), spots)).toBeNull();
  });
  it("change la sélection sans toucher au filtre ni à l'original", () => {
    const params = new URLSearchParams("equipment=rings&unknown=0&spot=node/1");
    expect(withSelectedSpot(params, "node/2").toString()).toBe("equipment=rings&unknown=0&spot=node%2F2");
    expect(withSelectedSpot(params, null).toString()).toBe("equipment=rings&unknown=0");
    expect(params.get("spot")).toBe("node/1");
  });
  it("reconnaît une navigation qui ne change que la sélection", () => {
    const url = (search: string) => new URL(`https://spots.test/${search}`);
    expect(onlySelectionChanged(url("?equipment=rings"), url("?equipment=rings&spot=node/2"))).toBe(true);
    expect(onlySelectionChanged(url("?spot=node/1"), url("?spot=node/2"))).toBe(true);
    expect(onlySelectionChanged(url("?equipment=rings&spot=node/2"), url("?spot=node/2"))).toBe(false);
  });
});
