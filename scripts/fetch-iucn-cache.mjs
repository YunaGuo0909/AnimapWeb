/**
 * Fetches IUCN Red List data for each species in animals.json and writes
 * src/data/iucn-cache.json. Run: IUCN_REDLIST_API_TOKEN=your_token node scripts/fetch-iucn-cache.mjs
 * Rate limit: 0.5s between requests (IUCN requirement).
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ANIMALS_PATH = join(ROOT, "src/data/animals.json");
const CACHE_PATH = join(ROOT, "src/data/iucn-cache.json");

const IUCN_BASE = "https://apiv3.iucnredlist.org/api/v3";
const CATEGORY_TO_STATUS = {
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

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchSpecies(token, scientificName) {
  const name = encodeURIComponent(scientificName.trim());
  const url = `${IUCN_BASE}/species/${name}?token=${token}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.result?.[0];
    if (!result?.category) return null;
    return {
      status: CATEGORY_TO_STATUS[result.category] ?? result.category,
      narrative: result.narrative ?? null,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error(`  Error for ${scientificName}:`, e.message);
    return null;
  }
}

async function main() {
  const token = process.env.IUCN_REDLIST_API_TOKEN;
  if (!token) {
    console.error("Set IUCN_REDLIST_API_TOKEN in the environment. Get a free token at https://api.iucnredlist.org/");
    process.exit(1);
  }

  const animals = JSON.parse(readFileSync(ANIMALS_PATH, "utf-8"));
  const seen = new Set();
  const cache = {};

  for (const a of animals) {
    const name = a.scientificName;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    process.stdout.write(`Fetching ${name}... `);
    const entry = await fetchSpecies(token, name);
    if (entry) {
      cache[name] = entry;
      console.log(entry.status);
    } else {
      console.log("not found");
    }
    await delay(600);
  }

  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
  console.log(`\nWrote ${Object.keys(cache).length} entries to src/data/iucn-cache.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
