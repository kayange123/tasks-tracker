import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ListContainer from "./_components/ListContainer";
import { ListWithCards } from "@/types";

interface BoardIdPageProps {
  params: Promise<{
    boardId: string;
  }>;
}
const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const { boardId } = await params;
  const { orgId } = await auth();
  if (!orgId) redirect("/select-org");
  const list: Array<ListWithCards> = await db.list.findMany({
    where: {
      boardId,
      ...active,
      board: {
        orgId,
      },
    },
    include: {
      cards: {
        where: active,
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return (
    // Keyed by board so another board's lists never carry over
    <ListContainer key={boardId} boardId={boardId} list={list} />
  );
};

export default BoardIdPage;
