import { describe, expect, it } from "vitest";
import { findConflicts, overlaps, type Slot } from "./slot";

const at = (hour: number, minute = 0) => Date.UTC(2026, 10, 14, hour, minute);
const slot = (id: string, start: number, end: number): Slot => ({ id, spotId: "node/1", start, end });

describe("overlaps", () => {
  it("détecte un chevauchement partiel", () => {
    expect(overlaps({ start: at(18), end: at(19) }, { start: at(18, 30), end: at(19, 30) })).toBe(true);
  });
  it("accepte deux créneaux qui se touchent", () => {
    expect(overlaps({ start: at(18), end: at(19) }, { start: at(19), end: at(20) })).toBe(false);
  });
  it("détecte un créneau contenu dans un autre", () => {
    expect(overlaps({ start: at(18), end: at(20) }, { start: at(18, 30), end: at(19) })).toBe(true);
  });
});

describe("findConflicts", () => {
  it("ignore le créneau lui-même, utile quand on le déplace", () => {
    const moved = slot("a", at(18), at(19));
    expect(findConflicts(moved, [slot("a", at(17), at(18, 30)), slot("b", at(18, 45), at(20))]).map((s) => s.id)).toEqual(["b"]);
  });
});
