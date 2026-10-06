import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import BoardNavbar from "./_components/BoardNavbar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const { orgId } = await auth();
  if (!orgId) {
    return { title: "Board" };
  }
  const board = await db.board.findUnique({
    where: {
      id: boardId,
      orgId,
      ...active,
    },
  });
  return { title: board?.title || "Board" };
}

const BoardIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ boardId: string }>;
}) => {
  const { boardId } = await params;
  const { orgId } = await auth();
  if (!orgId) redirect("/select-org");
  if (!boardId) redirect(`/organization/${orgId}`);

  const board = await db.board.findUnique({
    where: {
      id: boardId,
      orgId,
      ...active,
    },
  });

  if (!board) notFound();

  return (
    <div className="flex h-full flex-col pt-14">
      <BoardNavbar board={board} />
      <main className="relative min-h-0 flex-1">{children}</main>
    </div>
  );
};

export default BoardIdLayout;
