"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { UpdateListOrder } from "./schema";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { items, boardId } = data;
  let lists;
  try {
    const transaction = items.map((list) =>
      db.list.update({
        data: {
          order: list.order,
        },
        where: {
          id: list.id,
          boardId,
          board: {
            orgId,
          },
        },
      }),
    );

    lists = await db.$transaction(transaction);
  } catch (error) {
    return {
      error: "Failed to reorder list",
    };
  }

  revalidatePath(`/board/${boardId}`);
  return { data: lists };
};

export const updateListOrder = createActions(UpdateListOrder, handler);
