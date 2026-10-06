"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType } from "./types";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { CopyCard } from "./schema";
import { createAuditLog } from "@/lib/createAuditLogs";
import { ENTITY_TYPE, ACTION } from "@prisma/client";

export const handler = async (data: InputType) => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { id, boardId } = data;
  let card;
  try {
    const cardToCopy = await db.card.findUnique({
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

    if (!cardToCopy) {
      return {
        error: "Card not found",
      };
    }

    const lastCard = await db.card.findFirst({
      where: { listId: cardToCopy.listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastCard ? lastCard.order + 1 : 1;

    card = await db.card.create({
      data: {
        title: `${cardToCopy.title} -Copy`,
        description: cardToCopy.description,
        order: newOrder,
        listId: cardToCopy.listId,
      },
    });

    await createAuditLog({
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      entityId: card.id,
      action: ACTION.CREATE,
    });
  } catch (error) {
    //in case of error, return an error object and exit
    return {
      error: "Failed to copy card",
    };
  }
  //let next update the page
  revalidatePath(`/board/${boardId}`);
  return { data: card }; // return the list and exit
};

export const copyCard = createActions(CopyCard, handler);
