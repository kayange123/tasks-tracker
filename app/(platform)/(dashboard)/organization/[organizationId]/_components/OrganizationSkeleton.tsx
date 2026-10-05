import BoardList from "./BoardList";
import OrganizationHeaderSkeleton from "./OrganizationHeaderSkeleton";
import RecentActivity from "./RecentActivity";

// Placeholder for organization pages while they load or while the
// organization in the URL is being activated
const OrganizationSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 pb-12" aria-busy="true">
      <OrganizationHeaderSkeleton />
      <BoardList.Skeleton />
      <RecentActivity.Skeleton />
    </div>
  );
};

export default OrganizationSkeleton;
