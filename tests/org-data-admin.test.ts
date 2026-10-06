import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/organizations/[organizationId]/export/route";
import { handler as deleteOrganization } from "@/actions/delete-organization/action";
import { buildOrgExport } from "@/lib/dataExport";
import { purgeOrganization } from "@/lib/dataDeletion";
import { authMock, clerkClientMock } from "./mocks/services";

vi.mock("@/lib/dataDeletion", () => ({ purgeOrganization: vi.fn() }));
vi.mock("@/lib/dataExport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/dataExport")>()),
  buildOrgExport: vi.fn(),
}));

const ADMIN = { userId: "user_1", orgId: "org_1", orgRole: "org:admin" };
const MEMBER = { ...ADMIN, orgRole: "org:member" };

const exportOrg = (format = "json", organizationId = "org_1") =>
  GET(
    new Request(
      `http://localhost/api/organizations/${organizationId}/export?format=${format}`
    ),
    { params: Promise.resolve({ organizationId }) }
  );

describe("organization export route", () => {
  beforeEach(() => {
    vi.mocked(buildOrgExport).mockResolvedValue({
      exportedAt: new Date(),
      organization: {
        id: "org_1",
        name: "Acme",
        slug: "acme",
        createdAt: new Date(),
      },
      plan: { name: "Free", currentPeriodEnd: null },
      boards: [],
      activity: [],
    });
  });

  it("requires a signed-in user with an active organization", async () => {
    authMock.mockResolvedValue({ userId: null, orgId: null });
    expect((await exportOrg()).status).toBe(401);
  });

  it("refuses while another organization is active", async () => {
    authMock.mockResolvedValue(ADMIN);
    expect((await exportOrg("json", "org_2")).status).toBe(409);
    expect(buildOrgExport).not.toHaveBeenCalled();
  });

  it("is limited to organization admins", async () => {
    authMock.mockResolvedValue(MEMBER);
    expect((await exportOrg()).status).toBe(403);
    expect(buildOrgExport).not.toHaveBeenCalled();
  });

  it("rejects unknown formats", async () => {
    authMock.mockResolvedValue(ADMIN);
    expect((await exportOrg("xml")).status).toBe(400);
  });

  it("downloads the active organization's data", async () => {
    authMock.mockResolvedValue(ADMIN);

    const response = await exportOrg("csv");

    expect(response.status).toBe(200);
    expect(buildOrgExport).toHaveBeenCalledWith("org_1");
    expect(response.headers.get("Content-Disposition")).toMatch(
      /filename="taskier-acme-\d{4}-\d{2}-\d{2}\.zip"/
    );
  });
});

describe("delete organization", () => {
  const input = { organizationId: "org_1", confirmation: "Acme" };

  beforeEach(() => {
    clerkClientMock.organizations.getOrganization.mockResolvedValue({
      id: "org_1",
      name: "Acme",
    });
  });

  it("is limited to admins of the active organization", async () => {
    authMock.mockResolvedValue(MEMBER);
    expect((await deleteOrganization(input)).error).toMatch(/admins/);

    authMock.mockResolvedValue(ADMIN);
    expect(
      (await deleteOrganization({ ...input, organizationId: "org_2" })).error
    ).toBeTruthy();

    expect(clerkClientMock.organizations.deleteOrganization).not.toHaveBeenCalled();
  });

  it("requires the organization's exact name", async () => {
    authMock.mockResolvedValue(ADMIN);

    const result = await deleteOrganization({ ...input, confirmation: "acme" });

    expect(result.fieldErrors?.confirmation).toBeDefined();
    expect(clerkClientMock.organizations.deleteOrganization).not.toHaveBeenCalled();
  });

  it("deletes the organization in Clerk, then purges its data", async () => {
    authMock.mockResolvedValue(ADMIN);

    const result = await deleteOrganization({ ...input, confirmation: " Acme " });

    expect(result.data).toEqual({ name: "Acme" });
    expect(clerkClientMock.organizations.deleteOrganization).toHaveBeenCalledWith(
      "org_1"
    );
    expect(purgeOrganization).toHaveBeenCalledWith("org_1");
  });

  it("keeps the data when Clerk can't delete the organization", async () => {
    authMock.mockResolvedValue(ADMIN);
    clerkClientMock.organizations.deleteOrganization.mockRejectedValue(
      new Error("Clerk down")
    );

    const result = await deleteOrganization(input);

    expect(result.error).toBe("Failed to delete organization");
    expect(purgeOrganization).not.toHaveBeenCalled();
  });

  it("still succeeds when the purge fails, leaving it to the webhook", async () => {
    authMock.mockResolvedValue(ADMIN);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(purgeOrganization).mockRejectedValue(new Error("db down"));

    expect((await deleteOrganization(input)).data).toEqual({ name: "Acme" });
  });
});
