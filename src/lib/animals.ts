import type { Animal } from "@/types/animal";
import animalsJson from "@/data/animals.json";

/** IUCN cache: scientificName -> { status, narrative?, fetchedAt } */
export type IUCNCache = Record<string, { status: string; narrative?: string | null; fetchedAt?: string }>;

/** Load animals and merge in IUCN cache when present. */
export function getAnimals(iucnCache: IUCNCache | null): Animal[] {
  const base = animalsJson as Animal[];
  if (!iucnCache || Object.keys(iucnCache).length === 0) {
    return base;
  }
  return base.map((a) => {
    const entry = iucnCache[a.scientificName];
    if (!entry) return a;
    const merged: Animal = {
      ...a,
      status: entry.status,
    };
    if (entry.narrative && !a.fullDesc) {
      merged.fullDesc = entry.narrative;
    }
    return merged;
  });
}
