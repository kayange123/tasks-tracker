"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { restored } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { RestoreCard } from "./schema";
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
  let card;
  try {
    const deleted = await db.card.findFirst({
      where: {
        id,
        deletedAt: { isSet: true },
        list: { board: { orgId } },
      },
      include: { list: { select: { deletedAt: true } } },
    });

    if (!deleted) {
      return { error: "Card not found" };
    }
    if (deleted.list.deletedAt) {
      return { error: "Restore the list this card was in first" };
    }

    card = await db.card.update({ where: { id }, data: restored });
  } catch (error) {
    return {
      error: "Failed to restore card",
    };
  }

  await createAuditLog({
    entityTitle: card.title,
    entityType: ENTITY_TYPE.CARD,
    entityId: card.id,
    action: ACTION.RESTORE,
  });

  revalidatePath(`/board/${boardId}`);
  return { data: card };
};

export const restoreCard = createActions(RestoreCard, handler);
