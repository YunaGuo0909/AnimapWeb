import { WildlifeMap } from "@/components/WildlifeMap";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col">
      <header className="flex-shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Animap
          </span>
          <span className="text-muted-foreground text-sm hidden sm:inline">
            Global endangered wildlife distribution
          </span>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Click map or markers to see species nearby · Sorted by IUCN status
        </p>
      </header>
      <div className="flex-1 min-h-0">
        <WildlifeMap />
      </div>
    </main>
  );
}
