"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { restored } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { RestoreList } from "./schema";
import { createAuditLog } from "@/lib/createAuditLogs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { id, boardId } = data;
  let list;
  try {
    const deleted = await db.list.findFirst({
      where: {
        id,
        boardId,
        deletedAt: { isSet: true },
        board: { orgId },
      },
      include: { board: { select: { deletedAt: true } } },
    });

    if (!deleted?.deletedAt) {
      return { error: "List not found" };
    }
    if (deleted.board.deletedAt) {
      return { error: "Restore the board this list was on first" };
    }

    // Only cards deleted together with the list come back; cards deleted
    // on their own earlier stay deleted
    [list] = await db.$transaction([
      db.list.update({ where: { id }, data: restored }),
      db.card.updateMany({
        where: { listId: id, deletedAt: deleted.deletedAt },
        data: restored,
      }),
    ]);
  } catch (error) {
    return {
      error: "Failed to restore list",
    };
  }

  await createAuditLog({
    entityTitle: list.title,
    entityType: ENTITY_TYPE.LIST,
    entityId: list.id,
    action: ACTION.RESTORE,
  });

  revalidatePath(`/board/${boardId}`);
  return { data: list };
};

export const restoreList = createActions(RestoreList, handler);
