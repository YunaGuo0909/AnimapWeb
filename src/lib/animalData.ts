/**
 * Data fetching layer for species / animal data.
 *
 * Phase 1 (current): Loads from our API which reads animals.json + optional IUCN cache.
 * Phase 2: Swap implementation to read from Supabase/Firebase or your own DB.
 * Phase 3: Or call external APIs (IUCN, GBIF, etc.) and merge with local data.
 *
 * All UI (map, sidebar, detail) should use getAnimalData() so we can change
 * the source in one place.
 */

import type { Animal } from "@/types/animal";

/** Base URL for API requests (empty when same origin). */
const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Fetches the full list of animals for the map and list.
 * Currently calls our /api/animals (JSON + IUCN cache). Later: replace with
 * Supabase client, fetch(IUCN_API), or your backend.
 */
export async function getAnimalData(): Promise<Animal[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/animals`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to load species data");
  const data = (await res.json()) as Animal[];
  return data;
}
