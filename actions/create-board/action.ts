"use server";
import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/prisma";
import { reserveBoardSlot, releaseBoardSlot } from "@/lib/orgLimit";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { createBoardSchema } from "./schema";
import { createAuditLog } from "@/lib/createAuditLogs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { checkSubscription } from "@/lib/subscription";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "User is not authenticated",
    };
  }

  const { title, image } = data;
  const [imageId, imageThumbUrl, imageFullUrl, imageLinkHTML, imageUserName] =
    image.split("|");

  if (
    !title ||
    !imageId ||
    !imageThumbUrl ||
    !imageFullUrl ||
    !imageLinkHTML ||
    !imageUserName
  ) {
    return {
      error: "No image is provided. Failed to create board",
    };
  }

  const isPro = await checkSubscription();

  // Pro orgs are unlimited; free orgs take a slot atomically so concurrent
  // requests can't exceed the limit
  if (!isPro && !(await reserveBoardSlot())) {
    return {
      error:
        "You have reached your limit of free boards. Please upgrade your plan to create more boards",
    };
  }

  let board;
  try {
    board = await db.board.create({
      data: {
        title,
        orgId,
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName,
      },
    });
  } catch (error) {
    if (!isPro) {
      await releaseBoardSlot();
    }
    return {
      error: "Failed to create board",
    };
  }

  await createAuditLog({
    entityTitle: board.title,
    entityType: ENTITY_TYPE.BOARD,
    entityId: board.id,
    action: ACTION.CREATE,
  });

  revalidatePath(`/organization/${orgId}`);
  return { data: board };
};

export const createBoard = createActions(createBoardSchema, handler);
