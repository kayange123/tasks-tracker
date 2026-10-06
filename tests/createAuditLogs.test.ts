import { describe, expect, it, vi } from "vitest";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { createAuditLog } from "@/lib/createAuditLogs";
import { dbMock } from "./mocks/db";
import { currentUserMock } from "./mocks/services";

const entry = {
  entityId: "card_1",
  entityTitle: "Spec",
  entityType: ENTITY_TYPE.CARD,
  action: ACTION.CREATE,
};

describe("createAuditLog", () => {
  it("logs only the name parts that exist", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_1",
      firstName: "Jane",
      lastName: null,
      username: null,
      imageUrl: "https://img.clerk.com/jane",
    });

    await createAuditLog(entry);

    expect(dbMock.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userName: "Jane", orgId: "org_1" }),
    });
  });

  it("never throws when the log cannot be written", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    currentUserMock.mockResolvedValue({
      id: "user_1",
      firstName: "Jane",
      imageUrl: "",
    });
    dbMock.auditLog.create.mockRejectedValue(new Error("write failed"));

    await expect(createAuditLog(entry)).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
  });
});
