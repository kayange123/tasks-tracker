import ActivityItem from "@/components/ActivityItem";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const RecentActivity = async () => {
  const { orgId } = await auth();
  if (!orgId) redirect("/select-org");

  const logs = await db.auditLog.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Recent activity</h2>
        <Link
          href={`/organization/${orgId}/activity`}
          className="rounded-sm text-[13px] font-medium text-primary-text hover:underline"
        >
          View all
        </Link>
      </div>
      {logs.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No activity yet. Changes to boards, lists and cards will show up here.
        </p>
      ) : (
        <ol className="divide-y rounded-xl border bg-card [&>li]:px-4 [&>li]:py-3">
          {logs.map((log) => (
            <ActivityItem key={log.id} log={log} />
          ))}
        </ol>
      )}
    </section>
  );
};

RecentActivity.Skeleton = function RecentActivitySkeleton() {
  return (
    <section className="flex flex-col gap-3.5" aria-busy="true">
      <Skeleton className="h-5 w-32" />
      <div className="divide-y rounded-xl border bg-card">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentActivity;
