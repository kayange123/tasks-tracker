import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { POST } from "@/app/api/webhooks/clerk/route";
import { anonymizeUser, purgeOrganization } from "@/lib/dataDeletion";

vi.mock("@clerk/nextjs/webhooks", () => ({ verifyWebhook: vi.fn() }));
vi.mock("@/lib/dataDeletion", () => ({
  purgeOrganization: vi.fn(),
  anonymizeUser: vi.fn(),
}));

const request = () =>
  new NextRequest("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body: "{}",
  });

const receive = (type: string, id = "id_1") =>
  vi.mocked(verifyWebhook).mockResolvedValue({
    type,
    data: { id },
  } as unknown as Awaited<ReturnType<typeof verifyWebhook>>);

describe("Clerk webhook", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("rejects requests without a valid signature", async () => {
    vi.mocked(verifyWebhook).mockRejectedValue(new Error("bad signature"));

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(purgeOrganization).not.toHaveBeenCalled();
    expect(anonymizeUser).not.toHaveBeenCalled();
  });

  it("purges a deleted organization's data", async () => {
    receive("organization.deleted", "org_1");

    expect((await POST(request())).status).toBe(200);
    expect(purgeOrganization).toHaveBeenCalledWith("org_1");
  });

  it("anonymizes a deleted user's activity", async () => {
    receive("user.deleted", "user_1");

    expect((await POST(request())).status).toBe(200);
    expect(anonymizeUser).toHaveBeenCalledWith("user_1");
  });

  it("acknowledges other events without doing anything", async () => {
    receive("user.created");

    expect((await POST(request())).status).toBe(200);
    expect(purgeOrganization).not.toHaveBeenCalled();
    expect(anonymizeUser).not.toHaveBeenCalled();
  });

  it("fails so Clerk retries when cleanup fails", async () => {
    receive("organization.deleted", "org_1");
    vi.mocked(purgeOrganization).mockRejectedValue(new Error("db down"));

    expect((await POST(request())).status).toBe(500);
  });
});
