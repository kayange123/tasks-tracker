import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { MAX_FREE_BOARDS } from "@/constants/boards";
import { releaseBoardSlot, reserveBoardSlot } from "@/lib/orgLimit";
import { dbMock } from "./mocks/db";
import { authMock } from "./mocks/services";

describe("reserveBoardSlot", () => {
  it("takes a slot only while the org is under the limit", async () => {
    dbMock.orgLimit.updateMany.mockResolvedValue({ count: 1 });

    await expect(reserveBoardSlot()).resolves.toBe(true);
    expect(dbMock.orgLimit.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: { orgId: "org_1", count: 0 } }),
    );
    expect(dbMock.orgLimit.updateMany).toHaveBeenCalledWith({
      where: { orgId: "org_1", count: { lt: MAX_FREE_BOARDS } },
      data: { count: { increment: 1 } },
    });
  });

  it("refuses when the org is at the limit", async () => {
    dbMock.orgLimit.updateMany.mockResolvedValue({ count: 0 });

    await expect(reserveBoardSlot()).resolves.toBe(false);
  });

  it("tolerates a concurrent request creating the limit record", async () => {
    dbMock.orgLimit.upsert.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );
    dbMock.orgLimit.updateMany.mockResolvedValue({ count: 1 });

    await expect(reserveBoardSlot()).resolves.toBe(true);
  });

  it("rethrows other database errors", async () => {
    dbMock.orgLimit.upsert.mockRejectedValue(new Error("connection lost"));

    await expect(reserveBoardSlot()).rejects.toThrow("connection lost");
  });

  it("requires an active organization", async () => {
    authMock.mockResolvedValue({ userId: "user_1", orgId: null });

    await expect(reserveBoardSlot()).rejects.toThrow("Unauthorized");
  });
});

describe("releaseBoardSlot", () => {
  it("decrements without going below zero", async () => {
    await releaseBoardSlot();

    expect(dbMock.orgLimit.updateMany).toHaveBeenCalledWith({
      where: { orgId: "org_1", count: { gt: 0 } },
      data: { count: { decrement: 1 } },
    });
  });
});
