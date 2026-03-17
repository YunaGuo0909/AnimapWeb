"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  FullscreenControl,
  MapLayerMouseEvent,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Animal } from "@/types/animal";
import { getStatusLevel } from "@/types/animal";
import { distanceKm } from "@/lib/utils";
import { AnimalDetail } from "./AnimalDetail";
import { AnimalListPanel } from "./AnimalListPanel";
import { getAnimalData } from "@/lib/animalData";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

const markerColors: Record<string, string> = {
  critical: "bg-red-600 border-red-400",
  endangered: "bg-red-500 border-red-300",
  vulnerable: "bg-amber-500 border-amber-400",
  near_threatened: "bg-yellow-500 border-yellow-400",
  least_concern: "bg-emerald-500 border-emerald-400",
  other: "bg-muted border-border",
};

export function WildlifeMap() {
  const [animals, setAnimals] = useState<Animal[] | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 20,
    latitude: 20,
    zoom: 2,
  });
  const [clickedLngLat, setClickedLngLat] = useState<[number, number] | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [hoverAnimalId, setHoverAnimalId] = useState<string | null>(null);

  useEffect(() => {
    getAnimalData()
      .then(setAnimals)
      .catch(() => setAnimals([]));
  }, []);

  const nearbyAnimals = useMemo(() => {
    if (!animals?.length) return [];
    if (!clickedLngLat) {
      return [...animals].sort((a, b) => b.starRating - a.starRating || a.name.localeCompare(b.name));
    }
    return [...animals]
      .map((a) => ({ animal: a, dist: distanceKm(clickedLngLat, a.coordinates) }))
      .sort((x, y) => x.dist - y.dist || y.animal.starRating - x.animal.starRating)
      .map((x) => x.animal);
  }, [animals, clickedLngLat]);

  const onMapClick = useCallback((evt: MapLayerMouseEvent) => {
    evt.originalEvent.stopPropagation();
    setClickedLngLat([evt.lngLat.lng, evt.lngLat.lat]);
    setSelectedAnimal(null);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 text-muted-foreground p-6 text-center">
        <div>
          <p className="font-medium text-foreground mb-2">Mapbox token required</p>
          <p className="text-sm">
            Create <code className="bg-muted px-1 rounded">.env.local</code> in the project root and add:
            <br />
            <code className="text-accent">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token</code>
          </p>
          <p className="text-xs mt-4">
            Get a free token at <a href="https://account.mapbox.com/" className="text-accent underline" target="_blank" rel="noreferrer">mapbox.com</a>
          </p>
        </div>
      </div>
    );
  }

  if (animals === null) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 text-muted-foreground">
        <p>Loading species data…</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={onMapClick}
        style={{ width: "100%", height: "100%" }}
        cursor={clickedLngLat ? "default" : "crosshair"}
      >
        <NavigationControl position="bottom-right" showCompass showZoom />
        <FullscreenControl position="bottom-right" />

        {animals?.map((animal) => (
          <Marker
            key={animal.id}
            longitude={animal.coordinates[0]}
            latitude={animal.coordinates[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedAnimal(animal);
              setClickedLngLat(animal.coordinates);
            }}
            
          >
            <button
              type="button"
              onMouseEnter={() => setHoverAnimalId(animal.id)}  
              onMouseLeave={() => setHoverAnimalId(null)}       
              className={cn(
                "w-2.5 h-2.5 min-w-[10px] min-h-[10px] rounded-full border border-background shadow transition transform",
                selectedAnimal?.id === animal.id
                  ? "scale-125 ring-1 ring-white/60"
                  : hoverAnimalId === animal.id
                    ? "scale-110 opacity-90"
                    : "",
                markerColors[getStatusLevel(animal.status)] ?? markerColors.other
              )}
              aria-label={`${animal.name} — ${animal.status}`}
              title={animal.status}
            />
          </Marker>
        ))}
      </Map>

      {/* Right panel: list of animals (nearby first, sorted by IUCN status) */}
      <AnimalListPanel
        animals={nearbyAnimals}
        selectedAnimal={selectedAnimal}
        onSelect={setSelectedAnimal}
        clickedLngLat={clickedLngLat}
        onClearClick={() => {
          setClickedLngLat(null);
          setSelectedAnimal(null);
        }}
      />

      {/* Detail drawer */}
      {selectedAnimal && (
        <AnimalDetail
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
        />
      )}
    </div>
  );
}