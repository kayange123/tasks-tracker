"use server";

import { auth } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { createActions } from "@/lib/createActions";
import {
  AccountDeletionBlockedError,
  deleteAccount,
} from "@/lib/accountDeletion";
import { DeleteAccount } from "./schema";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    return { data: await deleteAccount(userId) };
  } catch (error) {
    if (error instanceof AccountDeletionBlockedError) {
      return { error: error.message };
    }
    console.error(`Failed to delete account ${userId}`, error);
    return { error: "Failed to delete your account" };
  }
};

export const deleteAccountAction = createActions(DeleteAccount, handler);
