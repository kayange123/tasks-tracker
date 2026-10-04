import { describe, expect, it, vi } from "vitest";
import { handler } from "@/actions/update-card/action";
import { UpdateCard } from "@/actions/update-card/schema";
import { dbMock } from "./mocks/db";

vi.mock("@/lib/createAuditLogs", () => ({ createAuditLog: vi.fn() }));

const base = { id: "card_1", boardId: "board_1", title: "Spec" };

describe("update-card", () => {
  it("accepts an empty description so it can be cleared", () => {
    expect(UpdateCard.safeParse({ ...base, description: "" }).success).toBe(
      true
    );
  });

  it("rejects descriptions over 5,000 characters", () => {
    const result = UpdateCard.safeParse({
      ...base,
      description: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("stores a blank description as cleared", async () => {
    dbMock.card.update.mockResolvedValue({ id: "card_1", title: "Spec" });

    await handler({ ...base, description: "   " });

    expect(dbMock.card.update.mock.calls[0][0].data).toEqual({
      title: "Spec",
      description: null,
    });
  });

  it("leaves the description alone when only the title changes", async () => {
    dbMock.card.update.mockResolvedValue({ id: "card_1", title: "Spec" });

    await handler(base);

    expect(dbMock.card.update.mock.calls[0][0].data).toEqual({
      title: "Spec",
    });
  });
});
