import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AccountDeletionBlockedError,
  deleteAccount,
  getAccountDeletionPlan,
} from "@/lib/accountDeletion";
import { anonymizeUser, purgeOrganization } from "@/lib/dataDeletion";
import { handler as deleteAccountAction } from "@/actions/delete-account/action";
import { DeleteAccount } from "@/actions/delete-account/schema";
import { GET as exportMyData } from "@/app/api/me/export/route";
import { GET as getDeletionPlan } from "@/app/api/me/deletion-plan/route";
import { buildUserExport } from "@/lib/dataExport";
import { authMock, clerkClientMock } from "./mocks/services";

vi.mock("@/lib/dataDeletion", () => ({
  purgeOrganization: vi.fn(),
  anonymizeUser: vi.fn(),
}));
vi.mock("@/lib/dataExport", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/dataExport")>()),
  buildUserExport: vi.fn(),
}));

const ME = "user_me";
const member = (userId: string, role = "org:member") => ({
  publicUserData: { userId },
  role,
});

// Organizations the person belongs to, with their role and all members
const belongsTo = (
  organizations: {
    id: string;
    role: string;
    members: ReturnType<typeof member>[];
  }[]
) => {
  clerkClientMock.users.getOrganizationMembershipList.mockResolvedValue({
    data: organizations.map(({ id, role }) => ({
      organization: { id, name: `Org ${id}` },
      role,
    })),
  });
  clerkClientMock.organizations.getOrganizationMembershipList.mockImplementation(
    async ({ organizationId }: { organizationId: string }) => ({
      data: organizations.find((o) => o.id === organizationId)!.members,
    })
  );
};

describe("account deletion plan", () => {
  it("deletes organizations where the person is the only member", async () => {
    belongsTo([
      { id: "solo", role: "org:admin", members: [member(ME, "org:admin")] },
    ]);

    expect(await getAccountDeletionPlan(ME)).toEqual({
      soleMemberOrganizations: [{ id: "solo", name: "Org solo" }],
      blockingOrganizations: [],
    });
  });

  it("blocks while the person is the only admin of a shared organization", async () => {
    belongsTo([
      {
        id: "shared",
        role: "org:admin",
        members: [member(ME, "org:admin"), member("user_other")],
      },
    ]);

    expect((await getAccountDeletionPlan(ME)).blockingOrganizations).toEqual([
      { id: "shared", name: "Org shared" },
    ]);
  });

  it("allows it when another admin remains or the person is a member", async () => {
    belongsTo([
      {
        id: "two-admins",
        role: "org:admin",
        members: [member(ME, "org:admin"), member("user_b", "org:admin")],
      },
      {
        id: "as-member",
        role: "org:member",
        members: [member(ME), member("user_c", "org:admin")],
      },
    ]);

    expect(await getAccountDeletionPlan(ME)).toEqual({
      soleMemberOrganizations: [],
      blockingOrganizations: [],
    });
  });
});

describe("deleteAccount", () => {
  it("refuses while blocked and changes nothing", async () => {
    belongsTo([
      {
        id: "shared",
        role: "org:admin",
        members: [member(ME, "org:admin"), member("user_other")],
      },
    ]);

    await expect(deleteAccount(ME)).rejects.toBeInstanceOf(
      AccountDeletionBlockedError
    );
    expect(clerkClientMock.users.deleteUser).not.toHaveBeenCalled();
    expect(anonymizeUser).not.toHaveBeenCalled();
  });

  it("deletes sole-member organizations, anonymizes, then deletes the user", async () => {
    belongsTo([
      { id: "solo", role: "org:admin", members: [member(ME, "org:admin")] },
    ]);

    const result = await deleteAccount(ME);

    expect(result.deletedOrganizations).toEqual([
      { id: "solo", name: "Org solo" },
    ]);
    expect(clerkClientMock.organizations.deleteOrganization).toHaveBeenCalledWith(
      "solo"
    );
    expect(purgeOrganization).toHaveBeenCalledWith("solo");
    expect(anonymizeUser).toHaveBeenCalledWith(ME);
    expect(clerkClientMock.users.deleteUser).toHaveBeenCalledWith(ME);
    const order = (fn: unknown) =>
      vi.mocked(fn as () => void).mock.invocationCallOrder[0];
    expect(order(anonymizeUser)).toBeLessThan(
      order(clerkClientMock.users.deleteUser)
    );
  });
});

describe("delete account action", () => {
  it("needs the exact confirmation phrase", () => {
    expect(DeleteAccount.safeParse({ confirmation: "yes" }).success).toBe(false);
    expect(
      DeleteAccount.safeParse({ confirmation: " Delete my account " }).success
    ).toBe(true);
  });

  it("explains which organizations block the deletion", async () => {
    authMock.mockResolvedValue({ userId: ME });
    belongsTo([
      {
        id: "shared",
        role: "org:admin",
        members: [member(ME, "org:admin"), member("user_other")],
      },
    ]);

    const result = await deleteAccountAction({
      confirmation: "delete my account",
    });

    expect(result.error).toMatch(/Org shared/);
  });

  it("requires a signed-in user", async () => {
    authMock.mockResolvedValue({ userId: null });

    expect(
      (await deleteAccountAction({ confirmation: "delete my account" })).error
    ).toBe("Unauthorized");
  });
});

describe("personal routes", () => {
  beforeEach(() => {
    vi.mocked(buildUserExport).mockResolvedValue({
      exportedAt: new Date(),
      profile: {
        id: ME,
        firstName: "Ada",
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
  });

  it("exports the signed-in person's data without an active organization", async () => {
    authMock.mockResolvedValue({ userId: ME, orgId: null });

    const response = await exportMyData(
      new Request("http://localhost/api/me/export?format=json")
    );

    expect(response.status).toBe(200);
    expect(buildUserExport).toHaveBeenCalledWith(ME);
  });

  it("rejects signed-out requests and unknown formats", async () => {
    authMock.mockResolvedValue({ userId: null });
    expect(
      (await exportMyData(new Request("http://localhost/api/me/export?format=json")))
        .status
    ).toBe(401);
    expect((await getDeletionPlan()).status).toBe(401);

    authMock.mockResolvedValue({ userId: ME });
    expect(
      (await exportMyData(new Request("http://localhost/api/me/export?format=pdf")))
        .status
    ).toBe(400);
  });

  it("returns the deletion plan", async () => {
    authMock.mockResolvedValue({ userId: ME });
    belongsTo([]);

    const response = await getDeletionPlan();

    expect(await response.json()).toEqual({
      soleMemberOrganizations: [],
      blockingOrganizations: [],
    });
  });
});
