"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType } from "./types";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createActions } from "@/lib/createActions";
import { DeleteBoard } from "./schema";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/createAuditLogs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { releaseBoardSlot } from "@/lib/orgLimit";
import { checkSubscription } from "@/lib/subscription";

export const handler = async (data: InputType) => {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const { id } = data;

  try {
    const isPro = await checkSubscription();
    const board = await db.board.delete({
      where: {
        id,
        orgId,
      },
    });

    if (!isPro) {
      await releaseBoardSlot();
    }

    await createAuditLog({
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      entityId: board.id,
      action: ACTION.DELETE,
    });
  } catch (error) {
    return {
      error: "Failed to delete",
    };
  }

  revalidatePath(`/organization/${orgId}`);
  redirect(`/organization/${orgId}`);
};

export const deleteBoard = createActions(DeleteBoard, handler);
