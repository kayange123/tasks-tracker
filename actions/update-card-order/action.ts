"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { UpdateCardOrder } from "./schema";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { items, boardId } = data;
  let updatedCards;
  try {
    // Cards may only move into lists on this board, within this org
    const targetListIds = Array.from(new Set(items.map((card) => card.listId)));
    const validListCount = await db.list.count({
      where: {
        id: { in: targetListIds },
        boardId,
        board: { orgId },
      },
    });

    if (validListCount !== targetListIds.length) {
      return {
        error: "List Not Found",
      };
    }

    const transaction = items.map((card) =>
      db.card.update({
        where: {
          id: card.id,
          list: {
            board: {
              orgId,
            },
          },
        },
        data: {
          order: card.order,
          listId: card.listId,
        },
      }),
    );

    updatedCards = await db.$transaction(transaction);
  } catch (error) {
    return {
      error: "Failed to reorder cards",
    };
  }

  revalidatePath(`/board/${boardId}`);
  return { data: updatedCards };
};

export const updateCardOrder = createActions(UpdateCardOrder, handler);
