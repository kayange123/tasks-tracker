import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/organizations/[organizationId]/usage/route";
import { getAvailableCount } from "@/lib/orgLimit";
import { checkSubscription } from "@/lib/subscription";
import { authMock } from "./mocks/services";

vi.mock("@/lib/orgLimit", () => ({ getAvailableCount: vi.fn() }));
vi.mock("@/lib/subscription", () => ({ checkSubscription: vi.fn() }));

const get = (organizationId: string) =>
  GET(new Request("http://localhost/api/organizations/x/usage"), {
    params: Promise.resolve({ organizationId }),
  });

describe("organization usage", () => {
  it("requires a signed-in user with an organization", async () => {
    authMock.mockResolvedValue({ userId: null, orgId: null });

    expect((await get("org_1")).status).toBe(401);
  });

  it("refuses another organization than the active one", async () => {
    const response = await get("org_other");

    expect(response.status).toBe(409);
    expect(getAvailableCount).not.toHaveBeenCalled();
  });

  it("returns board usage for the active organization", async () => {
    vi.mocked(getAvailableCount).mockResolvedValue(3);
    vi.mocked(checkSubscription).mockResolvedValue(false);

    const response = await get("org_1");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      orgId: "org_1",
      boards: 3,
      limit: 5,
      isPro: false,
    });
  });
});
