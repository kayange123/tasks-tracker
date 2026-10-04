"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { UpdateCard } from "./schema";
import { createAuditLog } from "@/lib/createAuditLogs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { boardId, id, description, ...values } = data;
  let card;
  try {
    card = await db.card.update({
      data: {
        ...values,
        // A blank description clears it rather than storing whitespace
        ...(description !== undefined && {
          description: description.trim() ? description : null,
        }),
      },
      where: {
        id,
        ...active,
        list: {
          board: {
            orgId,
          },
        },
      },
    });
    await createAuditLog({
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      entityId: card.id,
      action: ACTION.UPDATE,
    });
  } catch (error) {
    return {
      error: "Failed to update card",
    };
  }

  revalidatePath(`/board/${boardId}`);
  return { data: card };
};

export const updateCard = createActions(UpdateCard, handler);
