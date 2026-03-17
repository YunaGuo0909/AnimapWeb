# Animap — Global Endangered Wildlife Distribution Map

A Next.js + Mapbox site for exploring endangered and protected species worldwide: click the map to see species nearby, view details (photos, video, IUCN status, conservation efforts), and links to local wildlife organizations.

## Tech stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Map**: Mapbox GL JS (react-map-gl), dark minimal basemap
- **Data**: `src/data/animals.json` + optional **IUCN Red List API** (status and narrative via cache)

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Mapbox token: copy `.env.example` to `.env.local` and set your public Mapbox token:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx
   ```
   Free at https://account.mapbox.com/

3. Run dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Deploy to Vercel (share with others)

The quickest way to make the site publicly accessible is to deploy it on [Vercel](https://vercel.com) — free for personal projects.

1. Push this repo to GitHub (create a new repo on github.com, then `git remote add origin <url> && git push -u origin main`).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
3. In the **Environment Variables** panel, add:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = pk.xxx...your token
   ```
4. Click **Deploy**. Vercel will build and give you a live public URL (e.g. `animap.vercel.app`).

Any future `git push` to `main` triggers an automatic rebuild and redeploy — no manual steps needed.

> **Note**: Your Mapbox token is only used on the client side (it starts with `NEXT_PUBLIC_`). Mapbox tokens can be scope-restricted (allowed URLs) in the Mapbox dashboard — set the allowed URL to your Vercel domain for security.

---

## Features

- **63 species, 7 regions**: Asia, Africa, Americas, Europe, Oceania, Polar and Marine — plus 18 UK species
- **World map**: All species as markers; list sorted by IUCN status and distance
- **Click map**: Left panel shows species near the clicked area (distance + IUCN priority)
- **Click marker/list item**: Right panel shows species details:
  - Real wildlife photographs
  - Scientific name, IUCN status badge
  - Full scientific description
  - YouTube video (where available)
  - Current conservation efforts
  - **AI-powered conservation** — how machine learning and computer vision are being used for each species
  - Link to local wildlife organisation
- **Status colors**: IUCN-style red (highest risk) → yellow (middle) → green (least concern)

## Data format

See `src/types/animal.ts` and `src/data/animals.json`. Each animal has: coordinates, starRating (sort priority), status (IUCN or official), shortDesc, fullDesc, images, videoUrl, conservationEfforts, localOrganizationUrl. The list is a **flat array** `[{...}, {...}]` — this is intentional and matches the shape that a real database or API would return later.

## Data flow: one place to change the source

All species data is loaded via **`getAnimalData()`** in `src/lib/animalData.ts`. The map and sidebar call this; they do not read JSON or API directly. To switch to a database or external API later, you only change that function (and/or the `/api/animals` route it calls).

- **Phase 1 (current)**: Mock data in `animals.json` → API route merges IUCN cache → `getAnimalData()` fetches from `/api/animals`.
- **Phase 2**: Point `getAnimalData()` at Supabase/Firebase, or make `/api/animals` read from your DB.
- **Phase 3**: Call external APIs (IUCN, GBIF) inside the API route or inside `getAnimalData()`, and merge with your own data.

## How to use external data sources (e.g. IUCN, wildlife sites)

1. **Official API (recommended)**  
   Use the site’s API (e.g. IUCN Red List API). We already support this via `npm run fetch-iucn` and `iucn-cache.json`. You can add more APIs in `src/app/api/animals/route.ts` or in `getAnimalData()` and merge results.

2. **Scraping**  
   If a site has no API, you can run a one-off script (Node or Python) to scrape pages and output JSON, then import that into `animals.json` or into your database. Respect the site’s terms and robots.txt.

3. **Your own “cloud table” (e.g. Supabase)**  
   Put species in a Supabase table (like a spreadsheet). Then in `getAnimalData()` or in `/api/animals`, query Supabase instead of reading `animals.json`. The UI stays the same; only the data layer changes.

## Is using a JSON file normal?

Yes. Using a static **JSON (or CSV/TSV) file** for data is a common and valid approach when:

- **Prototyping or MVP**: You want to ship quickly without a backend or database.
- **Small or curated datasets**: The list is edited by hand or by a small team (e.g. dozens to a few hundred species).
- **Content as code**: Data lives in the repo, so it’s versioned, reviewable, and deployable with the app.

As the product grows, many teams then:

- Move to a **database** (e.g. PostgreSQL, Supabase) or **CMS** (e.g. Strapi, Contentful) and keep the same front-end structure.
- Or add an **API** (e.g. IUCN Red List, GBIF) and merge API data with your JSON, or replace the file entirely.

So: starting with `animals.json` is a standard pattern; you can later swap the data source without changing the whole app.

## Data sources (UK)

- **Local org link for all UK species**: [The Wildlife Trusts](https://www.wildlifetrusts.org/) — one main, UK-wide site (47 trusts) with species info, where to see wildlife (e.g. natterjack toads, red squirrels), adopt schemes (dormouse, hedgehog, red squirrel, pine marten), and [Wildlife Explorer](https://www.wildlifetrusts.org/wildlife-explorer/mammals) (mammals, [amphibians](https://www.wildlifetrusts.org/wildlife-explorer/amphibians), [reptiles](https://www.wildlifetrusts.org/wildlife-explorer/reptiles)). UK species in `animals.json` are aligned with these categories and protection status (e.g. Water Vole, European Otter, Great Crested Newt, Grass Snake, European Badger, Eurasian Beaver added from Wildlife Explorer).
- **Authoritative UK data** (for future API or fact-checking): [NBN Atlas](https://nbnatlas.org/) (UK’s largest biodiversity database), [NatureScot Species at Risk](https://www.nature.scot/species-risk), [Conservation Designations for UK Taxa](https://www.data.gov.uk/dataset/1fcd0f54-2337-4e4a-ab43-721ce6250d0e/conservation-designations-for-uk-taxa) (JNCC, data.gov.uk).

## IUCN Red List API (official status)

The app can use the **official [IUCN Red List API](https://apiv3.iucnredlist.org/api/v3/docs)** to pull the latest threat status and (when available) narrative text.

1. **Get a free token** (non-commercial): [api.iucnredlist.org](https://api.iucnredlist.org/) — agree to the terms and request a token.
2. **Build the cache** (rate limit: ~0.5s per species, so run occasionally):
   ```bash
   IUCN_REDLIST_API_TOKEN=your_token npm run fetch-iucn
   ```
   This writes `src/data/iucn-cache.json` (scientific name → status + narrative).
3. **How it works**: The frontend calls `GET /api/animals`, which reads `animals.json` and merges in `iucn-cache.json`. Any species in the cache gets its **status** (and **fullDesc** when missing) from IUCN. Species not in the cache keep the status from `animals.json`.

No token or cache? The site still works: it uses only `animals.json`. Add the token and run `fetch-iucn` when you want up-to-date IUCN categories and descriptions.

## Later

- GBIF for distribution data
- Backend / DB (e.g. Supabase) for species and org data
