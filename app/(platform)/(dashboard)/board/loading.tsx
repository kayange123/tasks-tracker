import { Skeleton } from "@/components/ui/skeleton";

const LIST_HEIGHTS = ["h-56", "h-40", "h-72", "h-32"];

// Shown immediately when opening a board so the previous board's lists
// never stay on screen while the next one loads
export default function Loading() {
  return (
    <div className="relative h-full bg-neutral-100" aria-busy="true">
      <div className="w-full h-14 z-50 bg-black/10 flex items-center fixed top-14 px-6">
        <Skeleton className="h-6 w-48" />
      </div>
      <main className="w-full pt-8 relative">
        <div className="p-4 h-full">
          <div className="pt-24 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {LIST_HEIGHTS.map((height) => (
              <Skeleton
                key={height}
                className={`w-full rounded-md ${height}`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
