"use client";

import type { Animal } from "@/types/animal";
import { getStatusLevel } from "@/types/animal";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

const statusDotColors: Record<string, string> = {
  critical: "bg-red-500 border-red-400",
  endangered: "bg-red-400 border-red-300",
  vulnerable: "bg-amber-500 border-amber-400",
  near_threatened: "bg-yellow-500 border-yellow-400",
  least_concern: "bg-emerald-500 border-emerald-400",
  other: "bg-muted border-border",
};

interface AnimalListPanelProps {
  animals: Animal[];
  selectedAnimal: Animal | null;
  onSelect: (a: Animal) => void;
  clickedLngLat: [number, number] | null;
  onClearClick: () => void;
}

export function AnimalListPanel({
  animals,
  selectedAnimal,
  onSelect,
  clickedLngLat,
  onClearClick,
}: AnimalListPanelProps) {
  return (
    <div className="absolute top-4 left-4 bottom-4 w-72 max-h-[calc(100vh-6rem)] flex flex-col bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden z-[5]">
      <div className="flex-shrink-0 px-3 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {clickedLngLat ? "Species near this area" : "All species"}
        </span>
        {clickedLngLat && (
          <button
            type="button"
            onClick={onClearClick}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear area
          </button>
        )}
      </div>
      <ul className="flex-1 overflow-y-auto divide-y divide-border">
        {animals.map((animal) => (
          <li key={animal.id}>
            <button
              type="button"
              onClick={() => onSelect(animal)}
              className={cn(
                "w-full px-3 py-2.5 text-left hover:bg-muted/50 transition flex items-center gap-3",
                selectedAnimal?.id === animal.id && "bg-muted/80"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-3 h-3 rounded-full border",
                  statusDotColors[getStatusLevel(animal.status)] ?? statusDotColors.other
                )}
                title={animal.status}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{animal.name}</p>
                <p className="text-xs text-muted-foreground truncate">{animal.status}</p>
              </div>
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex-shrink-0 px-3 py-2 border-t border-border text-xs text-muted-foreground">
        Sorted by IUCN status and distance
      </div>
    </div>
  );
}
