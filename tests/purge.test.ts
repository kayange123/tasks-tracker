import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/cron/purge/route";
import { PURGE_AFTER_DAYS } from "@/lib/softDelete";
import { dbMock } from "./mocks/db";

const request = (authorization?: string) =>
  new Request("http://localhost/api/cron/purge", {
    headers: authorization ? { authorization } : {},
  });

describe("purge cron", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    for (const model of [dbMock.card, dbMock.list, dbMock.board]) {
      model.deleteMany.mockResolvedValue({ count: 1 });
    }
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects calls without the cron secret", async () => {
    expect((await GET(request())).status).toBe(401);
    expect((await GET(request("Bearer wrong"))).status).toBe(401);
    expect(dbMock.card.deleteMany).not.toHaveBeenCalled();
  });

  it("refuses to run when no secret is configured", async () => {
    vi.stubEnv("CRON_SECRET", "");

    expect((await GET(request("Bearer "))).status).toBe(401);
  });

  it("removes rows deleted before the retention cutoff, children first", async () => {
    const response = await GET(request("Bearer test-secret"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ cards: 1, lists: 1, boards: 1 });

    const cutoff = dbMock.card.deleteMany.mock.calls[0][0].where.deletedAt.lt;
    const expected = Date.now() - PURGE_AFTER_DAYS * 86_400_000;
    expect(Math.abs(cutoff.getTime() - expected)).toBeLessThan(5_000);

    const order = (mock: { mock: { invocationCallOrder: number[] } }) =>
      mock.mock.invocationCallOrder[0];
    expect(order(dbMock.card.deleteMany)).toBeLessThan(
      order(dbMock.list.deleteMany)
    );
    expect(order(dbMock.list.deleteMany)).toBeLessThan(
      order(dbMock.board.deleteMany)
    );
  });
});
