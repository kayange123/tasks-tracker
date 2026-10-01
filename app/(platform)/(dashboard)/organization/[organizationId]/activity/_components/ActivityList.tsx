import ActivityItem from "@/components/ActivityItem";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AuditLog } from "@prisma/client";
import { redirect } from "next/navigation";

const ActivityList = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    redirect("/select-org");
  }
  let auditLogs: AuditLog[] = [];
  try {
    auditLogs = await db.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.log(error);
  }

  //   console.log(auditLogs);
  return (
    <ol className="mt-4 space-y-4">
      <li className="hidden last:block text-xs text-center text-muted-foreground">
        No activity found inside this organization
      </li>
      {auditLogs &&
        auditLogs.map((log) => <ActivityItem log={log} key={log.id} />)}
    </ol>
  );
};

ActivityList.Skeleton = function ActivityListSkeleton() {
  return (
    <ol className="mt-4 space-y-4 w-full">
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[50%] h-14" />
      <Skeleton className="w-[70%] h-14" />
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[75%] h-14" />
    </ol>
  );
};

export default ActivityList;
