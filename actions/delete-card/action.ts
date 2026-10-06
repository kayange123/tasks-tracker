"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { DeleteCard } from "./schema";
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
    // Soft delete so the card can be restored from the undo toast
    card = await db.card.update({
      where: {
        id,
        ...active,
        list: {
          board: {
            orgId,
          },
        },
      },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    return {
      error: "Failed to delete card",
    };
  }

  await createAuditLog({
    entityTitle: card.title,
    entityType: ENTITY_TYPE.CARD,
    entityId: card.id,
    action: ACTION.DELETE,
  });

  revalidatePath(`/board/${boardId}`);
  return { data: card };
};

export const deleteCard = createActions(DeleteCard, handler);
