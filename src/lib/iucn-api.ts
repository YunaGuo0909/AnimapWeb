/**
 * IUCN Red List API v3 client.
 * Docs: https://apiv3.iucnredlist.org/api/v3/docs
 * Token: https://api.iucnredlist.org/ (free, non-commercial).
 * Rate limit: ≥0.5s between requests.
 */

const IUCN_API_BASE = "https://apiv3.iucnredlist.org/api/v3";

const CATEGORY_TO_STATUS: Record<string, string> = {
  EX: "Extinct",
  EW: "Extinct in the Wild",
  CR: "Critically Endangered",
  EN: "Endangered",
  VU: "Vulnerable",
  NT: "Near Threatened",
  LC: "Least Concern",
  DD: "Data Deficient",
  NE: "Not Evaluated",
};

export interface IUCNSpeciesResult {
  taxonid: string;
  scientific_name: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  main_common_name: string | null;
  authority: string | null;
  published_year: number | null;
  category: string;
  criteria: string | null;
  population_trend: string | null;
  marine_system: boolean;
  freshwater_system: boolean;
  terrestrial_system: boolean;
  assessment_date: string | null;
}

export interface IUCNCacheEntry {
  status: string;
  categoryCode: string;
  narrative?: string | null;
  fetchedAt: string;
}

function categoryToStatus(category: string): string {
  return CATEGORY_TO_STATUS[category] ?? category;
}

/** Fetch species assessment by scientific name. Returns null if not found or on error. */
export async function fetchSpeciesByScientificName(
  token: string,
  scientificName: string
): Promise<{ status: string; categoryCode: string; narrative?: string | null } | null> {
  const name = encodeURIComponent(scientificName.trim());
  const url = `${IUCN_API_BASE}/species/${name}?token=${token}`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: IUCNSpeciesResult[] };
    const result = data?.result?.[0];
    if (!result?.category) return null;
    return {
      status: categoryToStatus(result.category),
      categoryCode: result.category,
      narrative: (result as unknown as { narrative?: string })?.narrative ?? null,
    };
  } catch {
    return null;
  }
}

/** Fetch narrative text for a species (separate endpoint if available). */
export async function fetchSpeciesNarrative(
  token: string,
  scientificName: string
): Promise<string | null> {
  const name = encodeURIComponent(scientificName.trim());
  const url = `${IUCN_API_BASE}/species/narrative/${name}?token=${token}`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: Array<{ narrative?: string }> };
    const narrative = data?.result?.[0]?.narrative;
    return narrative ?? null;
  } catch {
    return null;
  }
}
