import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "@/actions/create-board/action";
import { releaseBoardSlot, reserveBoardSlot } from "@/lib/orgLimit";
import { checkSubscription } from "@/lib/subscription";
import { dbMock } from "./mocks/db";
import { authMock } from "./mocks/services";

vi.mock("@/lib/orgLimit", () => ({
  reserveBoardSlot: vi.fn(),
  releaseBoardSlot: vi.fn(),
}));
vi.mock("@/lib/subscription", () => ({ checkSubscription: vi.fn() }));
vi.mock("@/lib/createAuditLogs", () => ({ createAuditLog: vi.fn() }));

const image = [
  "img_1",
  "https://images.unsplash.com/thumb",
  "https://images.unsplash.com/full",
  "https://unsplash.com/photos/img_1",
  "Jane Doe",
].join("|");

describe("create-board handler", () => {
  beforeEach(() => {
    vi.mocked(checkSubscription).mockResolvedValue(false);
    vi.mocked(reserveBoardSlot).mockResolvedValue(true);
  });

  it("checks authentication before touching the board limit", async () => {
    authMock.mockResolvedValue({ userId: null, orgId: null });

    const result = await handler({ title: "Roadmap", image });

    expect(result.error).toBe("User is not authenticated");
    expect(checkSubscription).not.toHaveBeenCalled();
    expect(reserveBoardSlot).not.toHaveBeenCalled();
  });

  it("rejects image URLs that are not from Unsplash", async () => {
    const result = await handler({
      title: "Roadmap",
      image: image.replace(
        "https://images.unsplash.com/full",
        "https://evil.example/full",
      ),
    });

    expect(result.error).toMatch(/No image/);
    expect(dbMock.board.create).not.toHaveBeenCalled();
  });

  it("blocks free orgs that have no slot left", async () => {
    vi.mocked(reserveBoardSlot).mockResolvedValue(false);

    const result = await handler({ title: "Roadmap", image });

    expect(result.error).toMatch(/limit of free boards/);
    expect(dbMock.board.create).not.toHaveBeenCalled();
  });

  it("releases the reserved slot when the insert fails", async () => {
    dbMock.board.create.mockRejectedValue(new Error("write failed"));

    const result = await handler({ title: "Roadmap", image });

    expect(result.error).toBe("Failed to create board");
    expect(releaseBoardSlot).toHaveBeenCalledOnce();
  });

  it("lets pro orgs create boards without taking a slot", async () => {
    vi.mocked(checkSubscription).mockResolvedValue(true);
    const board = { id: "board_1", title: "Roadmap" };
    dbMock.board.create.mockResolvedValue(board);

    const result = await handler({ title: "Roadmap", image });

    expect(result.data).toBe(board);
    expect(reserveBoardSlot).not.toHaveBeenCalled();
    expect(dbMock.board.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orgId: "org_1",
        imageFullUrl: "https://images.unsplash.com/full",
      }),
    });
  });
});
