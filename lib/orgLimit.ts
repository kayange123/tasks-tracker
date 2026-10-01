import { auth } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";
import { db } from "./prisma";
import { MAX_FREE_BOARDS } from "@/constants/boards";

const getOrgId = () => {
  const { orgId } = auth();

  if (!orgId) {
    throw new Error("Unauthorized");
  }
  return orgId;
};

const ensureOrgLimit = async (orgId: string) => {
  try {
    await db.orgLimit.upsert({
      where: { orgId },
      create: { orgId, count: 0 },
      update: {},
    });
  } catch (error) {
    // A concurrent request created the record first
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }
  }
};

// Atomically takes a free board slot. Returns false when the org is at its limit.
export const reserveBoardSlot = async (): Promise<boolean> => {
  const orgId = getOrgId();
  await ensureOrgLimit(orgId);

  const { count } = await db.orgLimit.updateMany({
    where: { orgId, count: { lt: MAX_FREE_BOARDS } },
    data: { count: { increment: 1 } },
  });

  return count === 1;
};

export const releaseBoardSlot = async () => {
  const orgId = getOrgId();

  await db.orgLimit.updateMany({
    where: { orgId, count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
};

export const getAvailableCount = async (): Promise<number> => {
  const orgId = getOrgId();

  const orgLimit = await db.orgLimit.findUnique({ where: { orgId } });

  if (!orgLimit) {
    return 0;
  }

  return orgLimit.count;
};
