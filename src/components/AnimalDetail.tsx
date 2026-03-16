"use client";

import { type Animal, getStatusLevel } from "@/types/animal";
import { cn } from "@/lib/utils";
import { X, ExternalLink, AlertTriangle } from "lucide-react";
import Image from "next/image";

/* IUCN-style: higher risk = red, middle = yellow, lower risk = green */
const statusColors: Record<string, string> = {
  critical: "bg-red-600/30 text-red-300 border-red-500/60",
  endangered: "bg-red-500/25 text-red-300 border-red-400/50",
  vulnerable: "bg-amber-500/25 text-amber-300 border-amber-400/50",
  near_threatened: "bg-yellow-500/25 text-yellow-300 border-yellow-400/50",
  least_concern: "bg-emerald-600/25 text-emerald-300 border-emerald-500/50",
  other: "bg-muted text-muted-foreground border-border",
};

interface AnimalDetailProps {
  animal: Animal;
  onClose: () => void;
}

export function AnimalDetail({ animal, onClose }: AnimalDetailProps) {
  const level = getStatusLevel(animal.status);
  const statusClass = statusColors[level] ?? statusColors.other;

  return (
    <div className="absolute inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col z-10 overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold truncate">{animal.name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Image */}
        {animal.images?.[0] && (
          <div className="relative w-full aspect-[16/10] bg-muted">
            <Image
              src={animal.images[0]}
              alt={animal.name}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
              unoptimized
            />
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("px-2.5 py-1 rounded-md border text-sm font-medium", statusClass)}>
              {animal.status}
            </span>
          </div>

          <p className="text-sm text-muted-foreground italic">{animal.scientificName}</p>
          <p className="text-foreground">{animal.shortDesc}</p>

          {animal.fullDesc && (
            <p className="text-sm text-muted-foreground leading-relaxed">{animal.fullDesc}</p>
          )}

          {/* Video */}
          {animal.videoUrl && (
            <div className="rounded-lg overflow-hidden bg-black aspect-video">
              <iframe
                src={animal.videoUrl}
                title={`${animal.name} video`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          {/* Conservation efforts */}
          {animal.conservationEfforts && animal.conservationEfforts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                Conservation efforts
              </h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {animal.conservationEfforts.map((effort, i) => (
                  <li key={i}>{effort}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Local org link */}
          {animal.localOrganizationUrl && (
            <a
              href={animal.localOrganizationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Local wildlife organization
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
