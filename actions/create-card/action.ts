"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { CreateCard } from "./schema";
import { createAuditLog } from "@/lib/createAuditLogs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { title, boardId, listId } = data;
  let card;
  try {
    const list = await db.list.findUnique({
      where: {
        id: listId,
        ...active,
        board: {
          orgId,
        },
      },
    });
    if (!list)
      return {
        error: "List Not Found",
      };

    //Find the last card in the order
    const lastCard = await db.card.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    //Prepare the order of next card
    const newOrder: number = lastCard ? lastCard.order + 1 : 1;

    //Create the card
    card = await db.card.create({
      data: {
        title,
        listId,
        order: newOrder,
      },
    });
    await createAuditLog({
      action: ACTION.CREATE,
      entityType: ENTITY_TYPE.CARD,
      entityTitle: card.title,
      entityId: card.id,
    });
  } catch (error) {
    return {
      error: "Failed to create card",
    };
  }

  revalidatePath(`/board/${boardId}`);
  return { data: card };
};

export const createCard = createActions(CreateCard, handler);
