import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getAnimals, type IUCNCache } from "@/lib/animals";

const CACHE_PATH = join(process.cwd(), "src/data/iucn-cache.json");

export const dynamic = "force-dynamic";

export async function GET() {
  let cache: IUCNCache | null = null;
  if (existsSync(CACHE_PATH)) {
    try {
      const raw = readFileSync(CACHE_PATH, "utf-8");
      cache = JSON.parse(raw) as IUCNCache;
    } catch {
      // ignore invalid cache
    }
  }
  const animals = getAnimals(cache);
  return NextResponse.json(animals);
}
