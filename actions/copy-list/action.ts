"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType } from "./types";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { CopyList } from "./schema";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { createAuditLog } from "@/lib/createAuditLogs";

export const handler = async (data: InputType) => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { id, boardId } = data;
  let list;
  try {
    //Find the list to be copied
    const listToCopy = await db.list.findUnique({
      where: {
        id,
        boardId,
        board: {
          orgId,
        },
      },
      include: {
        cards: true,
      },
    });

    if (!listToCopy) {
      // exit if there's no list
      return {
        error: "List Not Found",
      };
    }

    //Find the last inserted list
    const lastList = await db.list.findFirst({
      where: { boardId: listToCopy.boardId },
      orderBy: { order: "desc" },
      select: { order: true }, //include the card
    });

    //Find the order of the list and increment by 1
    const newOrder = lastList ? lastList.order + 1 : 1;

    //Create new list from the found list properties
    const cardsCopy = listToCopy.cards.map((card) => ({
      title: card.title,
      description: card.description,
      order: card.order,
    }));

    list = await db.list.create({
      data: {
        boardId: listToCopy.boardId,
        title: `${listToCopy.title} - Copy`,
        order: newOrder,
        cards: {
          createMany: {
            data: cardsCopy,
          },
        },
      },
    });
    await createAuditLog({
      entityTitle: list.title,
      entityType: ENTITY_TYPE.LIST,
      entityId: list.id,
      action: ACTION.CREATE,
    });
  } catch (error) {
    //in case of error, return an error object and exit
    return {
      error: "Failed to copy",
    };
  }
  //let next update the page
  revalidatePath(`/board/${boardId}`);
  return { data: list }; // return the list and exit
};

export const copyList = createActions(CopyList, handler);
