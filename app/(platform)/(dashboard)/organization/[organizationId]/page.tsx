import Info from "./_components/Info";
import BoardList from "./_components/BoardList";
import { Suspense } from "react";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";

const OrganizationPage = async () => {
  // The organization layout only renders this once the active org
  // matches the URL
  const { orgId } = await auth();
  const [isPro, boardCount] = await Promise.all([
    checkSubscription(),
    db.board.count({ where: { orgId: orgId!, ...active } }),
  ]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <Info isPro={isPro} boardCount={boardCount} />
      <Suspense fallback={<BoardList.Skeleton />}>
        <BoardList />
      </Suspense>
    </div>
  );
};

export default OrganizationPage;
