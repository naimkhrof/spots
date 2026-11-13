/** Créneau d'entraînement sur un spot, bornes en millisecondes, fin exclue. */
export interface Slot {
  id: string;
  spotId: string;
  start: number;
  end: number;
}

/** Deux créneaux se chevauchent s'ils partagent au moins un instant. Se toucher ne compte pas. */
export function overlaps(a: Pick<Slot, "start" | "end">, b: Pick<Slot, "start" | "end">): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Créneaux déjà planifiés qui entrent en conflit avec le candidat, quel que soit le spot : une personne ne peut pas être à deux endroits. */
export function findConflicts(candidate: Slot, planned: Slot[]): Slot[] {
  return planned.filter((slot) => slot.id !== candidate.id && overlaps(candidate, slot));
}
