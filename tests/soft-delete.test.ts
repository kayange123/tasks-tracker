import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler as deleteBoard } from "@/actions/delete-board/action";
import { handler as deleteCard } from "@/actions/delete-card/action";
import { handler as deleteList } from "@/actions/delete-list/action";
import { handler as restoreBoard } from "@/actions/restore-board/action";
import { handler as restoreCard } from "@/actions/restore-card/action";
import { handler as restoreList } from "@/actions/restore-list/action";
import { releaseBoardSlot, reserveBoardSlot } from "@/lib/orgLimit";
import { checkSubscription } from "@/lib/subscription";
import { dbMock } from "./mocks/db";

vi.mock("@/lib/orgLimit", () => ({
  reserveBoardSlot: vi.fn(),
  releaseBoardSlot: vi.fn(),
}));
vi.mock("@/lib/subscription", () => ({ checkSubscription: vi.fn() }));
vi.mock("@/lib/createAuditLogs", () => ({ createAuditLog: vi.fn() }));

const ACTIVE = { deletedAt: { isSet: false } };
const RESTORED = { deletedAt: { unset: true } };
const DELETED_AT = new Date("2026-10-01T12:00:00Z");

const dataOf = (mock: { mock: { calls: unknown[][] } }) =>
  (mock.mock.calls[0][0] as { data: { deletedAt: Date } }).data.deletedAt;

beforeEach(() => {
  vi.mocked(checkSubscription).mockResolvedValue(false);
  vi.mocked(reserveBoardSlot).mockResolvedValue(true);
  // $transaction receives the queued operations; resolve with stand-ins
  dbMock.$transaction.mockImplementation(async (operations: unknown[]) =>
    operations.map((_, index) =>
      index === 0
        ? { id: "entity_1", title: "Spec", orgId: "org_1" }
        : { count: 2 }
    )
  );
});

describe("deleting", () => {
  it("soft-deletes a card instead of removing it", async () => {
    dbMock.card.update.mockResolvedValue({ id: "card_1", title: "Spec" });

    const result = await deleteCard({ id: "card_1", boardId: "board_1" });

    expect(result.data).toEqual({ id: "card_1", title: "Spec" });
    expect(dbMock.card.delete).not.toHaveBeenCalled();
    expect(dbMock.card.update).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: "card_1", ...ACTIVE }),
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("stamps a list and its cards with the same time", async () => {
    await deleteList({ id: "list_1", boardId: "board_1" });

    expect(dbMock.list.delete).not.toHaveBeenCalled();
    expect(dbMock.card.updateMany).toHaveBeenCalledWith({
      where: { listId: "list_1", ...ACTIVE },
      data: { deletedAt: expect.any(Date) },
    });
    expect(dataOf(dbMock.card.updateMany)).toBe(dataOf(dbMock.list.update));
  });

  it("stamps a board, its lists and cards together and frees the slot", async () => {
    const result = await deleteBoard({ id: "board_1" });

    expect(result.data).toMatchObject({ id: "entity_1" });
    expect(dbMock.board.delete).not.toHaveBeenCalled();
    const stamp = dataOf(dbMock.board.update);
    expect(dataOf(dbMock.list.updateMany)).toBe(stamp);
    expect(dataOf(dbMock.card.updateMany)).toBe(stamp);
    expect(releaseBoardSlot).toHaveBeenCalledOnce();
  });

  it("keeps the slot for pro organizations", async () => {
    vi.mocked(checkSubscription).mockResolvedValue(true);

    await deleteBoard({ id: "board_1" });

    expect(releaseBoardSlot).not.toHaveBeenCalled();
  });
});

describe("restoring", () => {
  it("brings back a deleted card", async () => {
    dbMock.card.findFirst.mockResolvedValue({
      id: "card_1",
      deletedAt: DELETED_AT,
      list: { deletedAt: null },
    });
    dbMock.card.update.mockResolvedValue({ id: "card_1", title: "Spec" });

    const result = await restoreCard({ id: "card_1", boardId: "board_1" });

    expect(result.data).toEqual({ id: "card_1", title: "Spec" });
    expect(dbMock.card.update).toHaveBeenCalledWith({
      where: { id: "card_1" },
      data: RESTORED,
    });
  });

  it("won't restore a card into a deleted list", async () => {
    dbMock.card.findFirst.mockResolvedValue({
      id: "card_1",
      deletedAt: DELETED_AT,
      list: { deletedAt: DELETED_AT },
    });

    const result = await restoreCard({ id: "card_1", boardId: "board_1" });

    expect(result.error).toMatch(/list/);
    expect(dbMock.card.update).not.toHaveBeenCalled();
  });

  it("restores only the cards deleted with the list", async () => {
    dbMock.list.findFirst.mockResolvedValue({
      id: "list_1",
      deletedAt: DELETED_AT,
      board: { deletedAt: null },
    });

    await restoreList({ id: "list_1", boardId: "board_1" });

    expect(dbMock.card.updateMany).toHaveBeenCalledWith({
      where: { listId: "list_1", deletedAt: DELETED_AT },
      data: RESTORED,
    });
  });

  it("restores a board with the lists and cards deleted with it", async () => {
    dbMock.board.findFirst.mockResolvedValue({
      id: "board_1",
      deletedAt: DELETED_AT,
    });

    const result = await restoreBoard({ id: "board_1" });

    expect(result.error).toBeUndefined();
    expect(reserveBoardSlot).toHaveBeenCalledOnce();
    expect(dbMock.list.updateMany).toHaveBeenCalledWith({
      where: { boardId: "board_1", deletedAt: DELETED_AT },
      data: RESTORED,
    });
    expect(dbMock.card.updateMany).toHaveBeenCalledWith({
      where: { list: { boardId: "board_1" }, deletedAt: DELETED_AT },
      data: RESTORED,
    });
  });

  it("explains the limit when no free slot is left", async () => {
    dbMock.board.findFirst.mockResolvedValue({
      id: "board_1",
      deletedAt: DELETED_AT,
    });
    vi.mocked(reserveBoardSlot).mockResolvedValue(false);

    const result = await restoreBoard({ id: "board_1" });

    expect(result.error).toMatch(/upgrade/);
    expect(dbMock.$transaction).not.toHaveBeenCalled();
  });

  it("gives the slot back when the restore fails", async () => {
    dbMock.board.findFirst.mockResolvedValue({
      id: "board_1",
      deletedAt: DELETED_AT,
    });
    dbMock.$transaction.mockRejectedValue(new Error("write failed"));

    const result = await restoreBoard({ id: "board_1" });

    expect(result.error).toBe("Failed to restore board");
    expect(releaseBoardSlot).toHaveBeenCalledOnce();
  });
});
