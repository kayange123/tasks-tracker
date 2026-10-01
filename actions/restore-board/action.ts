"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { restored } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { RestoreBoard } from "./schema";
import { createAuditLog } from "@/lib/createAuditLogs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { releaseBoardSlot, reserveBoardSlot } from "@/lib/orgLimit";
import { checkSubscription } from "@/lib/subscription";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { id } = data;

  const deleted = await db.board.findFirst({
    where: { id, orgId, deletedAt: { isSet: true } },
  });
  if (!deleted?.deletedAt) {
    return { error: "Board not found" };
  }

  // A restored board counts toward the free plan again
  const isPro = await checkSubscription();
  if (!isPro && !(await reserveBoardSlot())) {
    return {
      error:
        "You have reached your limit of free boards. Please upgrade your plan to restore this board",
    };
  }

  let board;
  try {
    // Only lists and cards deleted together with the board come back
    [board] = await db.$transaction([
      db.board.update({ where: { id }, data: restored }),
      db.list.updateMany({
        where: { boardId: id, deletedAt: deleted.deletedAt },
        data: restored,
      }),
      db.card.updateMany({
        where: { list: { boardId: id }, deletedAt: deleted.deletedAt },
        data: restored,
      }),
    ]);
  } catch (error) {
    if (!isPro) {
      await releaseBoardSlot();
    }
    return {
      error: "Failed to restore board",
    };
  }

  await createAuditLog({
    entityTitle: board.title,
    entityType: ENTITY_TYPE.BOARD,
    entityId: board.id,
    action: ACTION.RESTORE,
  });

  revalidatePath(`/organization/${orgId}`);
  return { data: board };
};

export const restoreBoard = createActions(RestoreBoard, handler);
