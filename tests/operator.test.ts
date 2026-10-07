import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOperatorId, isOperatorRole } from "@/lib/operator";
import { findOrphanedOrganizations } from "@/lib/operatorData";
import { GET as exportUser } from "@/app/api/admin/users/[userId]/export/route";
import { GET as exportOrganization } from "@/app/api/admin/organizations/[orgId]/export/route";
import { handler as adminDeleteUser } from "@/actions/admin-delete-user/action";
import { handler as adminDeleteOrganization } from "@/actions/admin-delete-organization/action";
import { deleteAccount } from "@/lib/accountDeletion";
import { purgeOrganization } from "@/lib/dataDeletion";
import { buildOrgExport, buildUserExport } from "@/lib/dataExport";
import { dbMock } from "./mocks/db";
import { authMock, clerkClientMock, currentUserMock } from "./mocks/services";

vi.mock("@/lib/accountDeletion", () => ({ deleteAccount: vi.fn() }));
vi.mock("@/lib/dataDeletion", () => ({ purgeOrganization: vi.fn() }));
vi.mock("@/lib/dataExport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/dataExport")>()),
  buildUserExport: vi.fn(),
  buildOrgExport: vi.fn(),
}));

const OPERATOR = "user_operator";
// Operators have { role: "admin" } in their Clerk public metadata
const signedInAs = (userId: string | null) => {
  authMock.mockResolvedValue({ userId, orgId: null, sessionClaims: {} });
  currentUserMock.mockResolvedValue(
    userId
      ? {
          id: userId,
          publicMetadata: userId === OPERATOR ? { role: "admin" } : {},
        }
      : null,
  );
};

describe("operator access", () => {
  it("recognizes only the admin role", () => {
    expect(isOperatorRole({ role: "admin" })).toBe(true);
    expect(isOperatorRole({ role: "member" })).toBe(false);
    expect(isOperatorRole({})).toBe(false);
    expect(isOperatorRole(null)).toBe(false);
  });

  it("reads the role from Clerk's public metadata", async () => {
    signedInAs(OPERATOR);
    expect(await getOperatorId()).toBe(OPERATOR);

    signedInAs("user_other");
    expect(await getOperatorId()).toBeNull();

    signedInAs(null);
    expect(await getOperatorId()).toBeNull();
  });

  it("uses the session token's metadata when it carries it", async () => {
    authMock.mockResolvedValue({
      userId: OPERATOR,
      sessionClaims: { metadata: { role: "admin" } },
    });
    expect(await getOperatorId()).toBe(OPERATOR);

    authMock.mockResolvedValue({
      userId: OPERATOR,
      sessionClaims: { metadata: {} },
    });
    expect(await getOperatorId()).toBeNull();
    expect(currentUserMock).not.toHaveBeenCalled();
  });

  it("hides the export routes from everyone else", async () => {
    signedInAs("user_other");

    const user = await exportUser(
      new Request("http://localhost/api/admin/users/user_x/export?format=json"),
      { params: Promise.resolve({ userId: "user_x" }) },
    );
    const organization = await exportOrganization(
      new Request("http://localhost/api/admin/organizations/org_x/export?format=json"),
      { params: Promise.resolve({ orgId: "org_x" }) },
    );

    expect(user.status).toBe(404);
    expect(organization.status).toBe(404);
    expect(buildUserExport).not.toHaveBeenCalled();
    expect(buildOrgExport).not.toHaveBeenCalled();
  });

  it("refuses console actions for everyone else", async () => {
    signedInAs("user_other");

    expect(
      (await adminDeleteUser({ userId: "user_x", confirmation: "user_x" })).error,
    ).toBe("Not found");
    expect(
      (await adminDeleteOrganization({ orgId: "org_x", confirmation: "org_x" }))
        .error,
    ).toBe("Not found");
    expect(deleteAccount).not.toHaveBeenCalled();
    expect(purgeOrganization).not.toHaveBeenCalled();
  });
});

describe("operator exports", () => {
  it("logs each export", async () => {
    signedInAs(OPERATOR);
    vi.mocked(buildUserExport).mockResolvedValue({
      exportedAt: new Date(),
      profile: {
        id: "user_x",
        firstName: null,
        lastName: null,
        username: null,
        emailAddresses: [],
        imageUrl: "",
        createdAt: new Date(),
        lastSignInAt: null,
      },
      memberships: [],
      activity: [],
    });

    const response = await exportUser(
      new Request("http://localhost/api/admin/users/user_x/export?format=csv"),
      { params: Promise.resolve({ userId: "user_x" }) },
    );

    expect(response.status).toBe(200);
    expect(dbMock.adminAction.create).toHaveBeenCalledWith({
      data: {
        adminUserId: OPERATOR,
        action: "EXPORT_USER",
        targetType: "USER",
        targetId: "user_x",
        details: "CSV",
      },
    });
  });
});

describe("operator deletions", () => {
  beforeEach(() => signedInAs(OPERATOR));

  it("requires the exact target ID", async () => {
    const result = await adminDeleteUser({ userId: "user_x", confirmation: "x" });

    expect(result.fieldErrors?.confirmation).toBeDefined();
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("won't delete the operator's own account", async () => {
    const result = await adminDeleteUser({
      userId: OPERATOR,
      confirmation: OPERATOR,
    });

    expect(result.error).toMatch(/Data & privacy/);
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("deletes a user even when organizations lose their only admin, and logs it", async () => {
    vi.mocked(deleteAccount).mockResolvedValue({ deletedOrganizations: [] });

    const result = await adminDeleteUser({
      userId: "user_x",
      confirmation: "user_x",
    });

    expect(result.data).toEqual({ deletedOrganizations: [] });
    expect(deleteAccount).toHaveBeenCalledWith("user_x", { allowBlocked: true });
    expect(dbMock.adminAction.create.mock.calls[0][0].data).toMatchObject({
      action: "DELETE_USER",
      targetId: "user_x",
    });
  });

  it("purges organizations already gone from Clerk", async () => {
    clerkClientMock.organizations.deleteOrganization.mockRejectedValue({
      status: 404,
    });
    vi.mocked(purgeOrganization).mockResolvedValue({
      boards: 2,
      lists: 3,
      cards: 4,
      activity: 5,
    });

    const result = await adminDeleteOrganization({
      orgId: "org_gone",
      confirmation: "org_gone",
    });

    expect(result.data).toEqual({ orgId: "org_gone" });
    expect(purgeOrganization).toHaveBeenCalledWith("org_gone");
    expect(dbMock.adminAction.create.mock.calls[0][0].data.details).toMatch(
      /Already gone from Clerk; removed 2 boards, 4 cards, 5 activity entries/,
    );
  });

  it("keeps the data when Clerk fails for another reason", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    clerkClientMock.organizations.deleteOrganization.mockRejectedValue({
      status: 500,
    });

    const result = await adminDeleteOrganization({
      orgId: "org_x",
      confirmation: "org_x",
    });

    expect(result.error).toBe("Failed to delete organization");
    expect(purgeOrganization).not.toHaveBeenCalled();
  });
});

describe("orphaned organizations", () => {
  it("lists organizations with data that Clerk no longer has", async () => {
    dbMock.board.findMany.mockResolvedValue([{ orgId: "org_live" }, { orgId: "org_gone" }]);
    dbMock.auditLog.findMany.mockResolvedValue([{ orgId: "org_gone" }, { orgId: "org_logs" }]);
    dbMock.orgLimit.findMany.mockResolvedValue([]);
    dbMock.orgSubscription.findMany.mockResolvedValue([]);
    clerkClientMock.organizations.getOrganizationList.mockResolvedValue({
      data: [{ id: "org_live" }],
    });
    dbMock.board.count.mockResolvedValue(1);
    dbMock.auditLog.count.mockResolvedValue(2);

    const orphans = await findOrphanedOrganizations();

    expect(clerkClientMock.organizations.getOrganizationList).toHaveBeenCalledWith({
      organizationId: ["org_gone", "org_live", "org_logs"],
      limit: 100,
    });
    expect(orphans).toEqual([
      { orgId: "org_gone", boards: 1, activity: 2 },
      { orgId: "org_logs", boards: 1, activity: 2 },
    ]);
  });
});
