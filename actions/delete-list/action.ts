"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { DeleteList } from "./schema";
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
  // One timestamp for the list and its cards, so a restore brings back
  // exactly what was deleted here
  const deletedAt = new Date();

  let list;
  try {
    [list] = await db.$transaction([
      db.list.update({
        where: {
          id,
          boardId,
          ...active,
          board: {
            orgId,
          },
        },
        data: { deletedAt },
      }),
      db.card.updateMany({
        where: { listId: id, ...active },
        data: { deletedAt },
      }),
    ]);
  } catch (error) {
    return {
      error: "Failed to delete",
    };
  }

  await createAuditLog({
    entityTitle: list.title,
    entityType: ENTITY_TYPE.LIST,
    entityId: list.id,
    action: ACTION.DELETE,
  });

  revalidatePath(`/board/${boardId}`);
  return { data: list };
};

export const deleteList = createActions(DeleteList, handler);
