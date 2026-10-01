import { describe, expect, it } from "vitest";
import { handler } from "@/actions/update-card-order/action";
import { dbMock } from "./mocks/db";

const card = (id: string, listId: string, order: number) => ({
  id,
  title: id,
  order,
  listId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("update-card-order handler", () => {
  it("rejects moves into lists outside the board", async () => {
    dbMock.list.count.mockResolvedValue(1);

    const result = await handler({
      boardId: "board_1",
      items: [card("card_1", "list_1", 1), card("card_2", "list_other", 2)],
    });

    expect(result.error).toBe("List Not Found");
    expect(dbMock.list.count).toHaveBeenCalledWith({
      where: {
        id: { in: ["list_1", "list_other"] },
        boardId: "board_1",
        board: { orgId: "org_1" },
      },
    });
    expect(dbMock.$transaction).not.toHaveBeenCalled();
  });

  it("reorders cards when every target list is on the board", async () => {
    dbMock.list.count.mockResolvedValue(1);
    dbMock.$transaction.mockResolvedValue(["updated"]);

    const result = await handler({
      boardId: "board_1",
      items: [card("card_1", "list_1", 1), card("card_2", "list_1", 2)],
    });

    expect(result.data).toEqual(["updated"]);
    expect(dbMock.card.update).toHaveBeenCalledTimes(2);
  });
});
