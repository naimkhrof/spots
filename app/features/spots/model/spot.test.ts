import { describe, expect, it } from "vitest";
import { distanceInMeters, formatDistance, sortByDistance } from "./distance";
import { parseOsmEquipment } from "./equipment";
import { filterSpots, type Spot } from "./spot";

const spot = (id: string, equipment: Spot["equipment"], lat = 46.2, lng = 6.14): Spot => ({ id, name: null, lat, lng, equipment });

describe("parseOsmEquipment", () => {
  it("traduit les valeurs connues et ignore les autres", () => {
    expect(parseOsmEquipment("horizontal_bar; rings;slackline")).toEqual(["pull_up_bar", "rings"]);
  });
  it("renvoie null quand la source ne dit rien d'exploitable", () => {
    expect(parseOsmEquipment(null)).toBeNull();
    expect(parseOsmEquipment("yes")).toBeNull();
  });
  it("ne répète pas un équipement", () => {
    expect(parseOsmEquipment("horizontal_bar;horizontal_bar")).toEqual(["pull_up_bar"]);
  });
});

describe("filterSpots", () => {
  const spots = [spot("a", ["pull_up_bar", "rings"]), spot("b", ["pull_up_bar"]), spot("c", null)];

  it("exige tous les équipements demandés", () => {
    expect(filterSpots(spots, { equipment: ["pull_up_bar", "rings"], includeUnknown: false }).map((s) => s.id)).toEqual(["a"]);
  });
  it("garde les spots non renseignés seulement sur demande", () => {
    expect(filterSpots(spots, { equipment: ["rings"], includeUnknown: true }).map((s) => s.id)).toEqual(["a", "c"]);
    expect(filterSpots(spots, { equipment: [], includeUnknown: false }).map((s) => s.id)).toEqual(["a", "b"]);
  });
  it("sans filtre, renvoie tout", () => {
    expect(filterSpots(spots, { equipment: [], includeUnknown: true })).toHaveLength(3);
  });
});

describe("distance", () => {
  const plainpalais = { lat: 46.1983, lng: 6.1409 };
  const cornavin = { lat: 46.2102, lng: 6.1424 };

  it("mesure environ 1,3 km entre Plainpalais et Cornavin", () => {
    expect(distanceInMeters(plainpalais, cornavin)).toBeGreaterThan(1_250);
    expect(distanceInMeters(plainpalais, cornavin)).toBeLessThan(1_400);
  });
  it("trie du plus proche au plus loin sans modifier l'entrée", () => {
    const items = [spot("loin", null, 46.3, 6.2), spot("près", null, 46.199, 6.141)];
    expect(sortByDistance(items, plainpalais).map((s) => s.id)).toEqual(["près", "loin"]);
    expect(items[0].id).toBe("loin");
  });
});

describe("filterFromSearchParams", () => {
  it("ignore les valeurs inconnues et les doublons", async () => {
    const { filterFromSearchParams } = await import("./search");
    const filter = filterFromSearchParams(new URLSearchParams("equipment=rings&equipment=rings&equipment=jacuzzi&unknown=0"));
    expect(filter).toEqual({ equipment: ["rings"], includeUnknown: false });
  });
});

describe("formatDistance", () => {
  it("donne des mètres arrondis sous le kilomètre, des kilomètres au-delà", () => {
    expect(formatDistance(847)).toBe("850 m");
    expect(formatDistance(4)).toBe("0 m");
    expect(formatDistance(999)).toMatch(/^1 km$/);
    expect(formatDistance(2340)).toMatch(/^2[.,]3 km$/);
  });
});
