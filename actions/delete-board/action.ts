"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { DeleteBoard } from "./schema";
import { createAuditLog } from "@/lib/createAuditLogs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { releaseBoardSlot } from "@/lib/orgLimit";
import { checkSubscription } from "@/lib/subscription";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { id } = data;
  // One timestamp for the board, its lists and their cards, so a restore
  // brings back exactly what was deleted here
  const deletedAt = new Date();

  let board;
  try {
    [board] = await db.$transaction([
      db.board.update({
        where: {
          id,
          orgId,
          ...active,
        },
        data: { deletedAt },
      }),
      db.list.updateMany({
        where: { boardId: id, ...active },
        data: { deletedAt },
      }),
      db.card.updateMany({
        where: { list: { boardId: id }, ...active },
        data: { deletedAt },
      }),
    ]);
  } catch (error) {
    return {
      error: "Failed to delete",
    };
  }

  // Deleted boards don't count toward the free plan; restoring takes a
  // slot again
  if (!(await checkSubscription())) {
    await releaseBoardSlot();
  }

  await createAuditLog({
    entityTitle: board.title,
    entityType: ENTITY_TYPE.BOARD,
    entityId: board.id,
    action: ACTION.DELETE,
  });

  // The client navigates back to the organization and offers undo
  revalidatePath(`/organization/${orgId}`);
  return { data: board };
};

export const deleteBoard = createActions(DeleteBoard, handler);
