export interface Animal {
  id: string;
  name: string;
  scientificName: string;
  coordinates: [number, number]; // [lng, lat]
  starRating: number; // 1-5, used for sort/detail priority
  status: string; // IUCN or official status e.g. "Critically Endangered", "Least Concern"
  shortDesc: string;
  fullDesc: string | null;
  images: string[];
  videoUrl: string | null;
  conservationEfforts: string[];
  localOrganizationUrl: string | null;
  aiConservation: string | null; // How AI is being used to help protect this species
}

export type AnimalStatusLevel = "critical" | "endangered" | "vulnerable" | "near_threatened" | "least_concern" | "other";

export function getStatusLevel(status: string): AnimalStatusLevel {
  const s = status.toLowerCase();
  if (s.includes("critically endangered") || s.includes("extinct in the wild")) return "critical";
  if (s.includes("endangered")) return "endangered";
  if (s.includes("vulnerable")) return "vulnerable";
  if (s.includes("near threatened")) return "near_threatened";
  if (s.includes("least concern")) return "least_concern";
  return "other";
}
