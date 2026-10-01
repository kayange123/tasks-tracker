import { describe, expect, it, vi } from "vitest";
import { handler as copyList } from "@/actions/copy-list/action";
import { handler as createCard } from "@/actions/create-card/action";
import { dbMock } from "./mocks/db";

vi.mock("@/lib/createAuditLogs", () => ({ createAuditLog: vi.fn() }));

describe("copy-list handler", () => {
  it("appends the copy after the last list on the board", async () => {
    dbMock.list.findUnique.mockResolvedValue({
      id: "list_1",
      boardId: "board_1",
      title: "To do",
      cards: [{ title: "Spec", description: null, order: 1 }],
    });
    dbMock.list.findFirst.mockResolvedValue({ order: 4 });
    dbMock.list.create.mockResolvedValue({
      id: "list_2",
      title: "To do - Copy",
    });

    const result = await copyList({ id: "list_1", boardId: "board_1" });

    expect(result.error).toBeUndefined();
    expect(dbMock.list.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { boardId: "board_1" } }),
    );
    expect(dbMock.list.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ order: 5, title: "To do - Copy" }),
    });
  });
});

describe("create-card handler", () => {
  it("returns the created card", async () => {
    dbMock.list.findUnique.mockResolvedValue({ id: "list_1" });
    dbMock.card.findFirst.mockResolvedValue(null);
    const card = { id: "card_1", title: "Spec", order: 1 };
    dbMock.card.create.mockResolvedValue(card);

    const result = await createCard({
      title: "Spec",
      boardId: "board_1",
      listId: "list_1",
    });

    expect(result.data).toBe(card);
    expect(dbMock.card.create).toHaveBeenCalledWith({
      data: { title: "Spec", listId: "list_1", order: 1 },
    });
  });
});
