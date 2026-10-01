import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ListContainer from "./_components/ListContainer";
import { ListWithCards } from "@/types";

interface BoardIdPageProps {
  params: {
    boardId: string;
  };
}
const BoardIdPage = async ({ params: { boardId } }: BoardIdPageProps) => {
  const { orgId } = auth();
  if (!orgId) redirect("/select-org");
  const list: Array<ListWithCards> = await db.list.findMany({
    where: {
      boardId,
      board: {
        orgId,
      },
    },
    include: {
      cards: {
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
    <div className="p-4 h-full overflow-x-auto">
      <ListContainer boardId={boardId} list={list} />
    </div>
  );
};

export default BoardIdPage;
