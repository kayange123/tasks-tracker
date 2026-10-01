import { Skeleton } from "@/components/ui/skeleton";

// Placeholder for organization pages while they load or while the
// organization in the URL is being activated
const OrganizationSkeleton = () => {
  return (
    <div className="w-full mb-20" aria-busy="true">
      <div className="flex items-center gap-x-4">
        <Skeleton className="w-[60px] h-[60px]" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-px w-full my-4" />
      <div className="px-2 md:px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="aspect-video w-full" />
        ))}
      </div>
    </div>
  );
};

export default OrganizationSkeleton;
