import { Skeleton } from "@/components/ui/skeleton";

const LISTS = [3, 2, 1, 2];

// Shown immediately when opening a board so the previous board's lists
// never stay on screen while the next one loads
export default function Loading() {
  return (
    <div className="flex h-full flex-col pt-14" aria-busy="true">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b bg-card px-4 md:px-7">
        <Skeleton className="hidden h-3.5 w-12 sm:block" />
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-5 w-44" />
        <Skeleton className="ml-auto size-9" />
      </div>
      <div className="flex min-h-0 flex-1 items-start gap-4 overflow-hidden px-4 py-6 md:px-7">
        {LISTS.map((cards, index) => (
          <div
            key={index}
            className="flex w-72 shrink-0 flex-col gap-2 rounded-[14px] border border-border/70 bg-surface-2 p-2.5"
          >
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: cards }, (_, card) => (
              <Skeleton key={card} className="h-11 rounded-[10px] bg-card" />
            ))}
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
