import { Skeleton } from "@/components/ui/skeleton";

// Server-safe placeholder for the organization header (Info)
const OrganizationHeaderSkeleton = () => {
  return (
    <div className="flex items-center gap-3.5" aria-busy="true">
      <Skeleton className="size-12 shrink-0 rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
};

export default OrganizationHeaderSkeleton;
