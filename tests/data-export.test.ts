import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import {
  buildOrgExport,
  buildUserExport,
  exportResponse,
  orgExportTables,
  parseExportFormat,
  userExportTables,
} from "@/lib/dataExport";
import { dbMock } from "./mocks/db";
import { clerkClientMock } from "./mocks/services";

const ACTIVE = { deletedAt: { isSet: false } };
const AT = new Date("2026-10-06T08:00:00Z");

const board = {
  id: "b1",
  title: "Roadmap",
  imageFullUrl: "https://images/1",
  imageUserName: "Photographer",
  createdAt: AT,
  updatedAt: AT,
  lists: [
    {
      id: "l1",
      title: "Todo",
      order: 1,
      createdAt: AT,
      updatedAt: AT,
      cards: [
        {
          id: "c1",
          title: "Spec",
          description: "Write it, then ship",
          order: 1,
          createdAt: AT,
          updatedAt: AT,
        },
      ],
    },
  ],
};

describe("organization export", () => {
  it("includes only active boards, lists and cards", async () => {
    clerkClientMock.organizations.getOrganization.mockResolvedValue({
      id: "org_1",
      name: "Acme",
      slug: "acme",
      createdAt: AT.getTime(),
    });
    dbMock.board.findMany.mockResolvedValue([board]);
    dbMock.auditLog.findMany.mockResolvedValue([]);
    dbMock.orgSubscription.findUnique.mockResolvedValue(null);

    const data = await buildOrgExport("org_1");

    const query = dbMock.board.findMany.mock.calls[0][0];
    expect(query.where).toEqual({ orgId: "org_1", ...ACTIVE });
    expect(query.select.lists.where).toEqual(ACTIVE);
    expect(query.select.lists.select.cards.where).toEqual(ACTIVE);
    expect(dbMock.auditLog.findMany.mock.calls[0][0].where).toEqual({
      orgId: "org_1",
    });
    expect(data.organization).toMatchObject({ name: "Acme", slug: "acme" });
    expect(data.plan).toEqual({ name: "Free", currentPeriodEnd: null });
  });

  it("still exports when the organization no longer exists in Clerk", async () => {
    clerkClientMock.organizations.getOrganization.mockRejectedValue(
      new Error("not found")
    );
    dbMock.board.findMany.mockResolvedValue([]);
    dbMock.auditLog.findMany.mockResolvedValue([]);
    dbMock.orgSubscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: "sub_1",
      stripeCurrentPeriodEnd: AT,
    });

    const data = await buildOrgExport("org_gone");

    expect(data.organization).toEqual({
      id: "org_gone",
      name: null,
      slug: null,
      createdAt: null,
    });
    expect(data.plan).toEqual({ name: "Pro", currentPeriodEnd: AT });
  });

  it("flattens boards, lists and cards into linked CSV tables", () => {
    const tables = orgExportTables({
      exportedAt: AT,
      organization: { id: "org_1", name: "Acme", slug: "acme", createdAt: AT },
      plan: { name: "Free", currentPeriodEnd: null },
      boards: [board],
      activity: [],
    });

    expect(Object.keys(tables)).toEqual([
      "organization",
      "boards",
      "lists",
      "cards",
      "activity",
    ]);
    expect(tables.lists.rows).toEqual([
      expect.objectContaining({ id: "l1", boardId: "b1" }),
    ]);
    expect(tables.cards.rows).toEqual([
      expect.objectContaining({ id: "c1", listId: "l1", boardId: "b1" }),
    ]);
  });
});

describe("user export", () => {
  it("collects the profile, memberships and the person's activity", async () => {
    clerkClientMock.users.getUser.mockResolvedValue({
      id: "user_1",
      firstName: "Ada",
      lastName: "Lovelace",
      username: null,
      emailAddresses: [{ emailAddress: "ada@example.com" }],
      imageUrl: "https://img",
      createdAt: AT.getTime(),
      lastSignInAt: null,
    });
    clerkClientMock.users.getOrganizationMembershipList.mockResolvedValue({
      data: [
        {
          organization: { id: "org_1", name: "Acme" },
          role: "org:admin",
          createdAt: AT.getTime(),
        },
      ],
    });
    dbMock.auditLog.findMany.mockResolvedValue([{ id: "log_1" }]);

    const data = await buildUserExport("user_1");

    expect(dbMock.auditLog.findMany.mock.calls[0][0].where).toEqual({
      userId: "user_1",
    });
    expect(data.profile).toMatchObject({
      id: "user_1",
      emailAddresses: ["ada@example.com"],
    });
    expect(data.memberships).toEqual([
      {
        organizationId: "org_1",
        organizationName: "Acme",
        role: "org:admin",
        joinedAt: AT,
      },
    ]);

    const tables = userExportTables(data);
    expect(tables.profile.rows[0].emailAddresses).toBe("ada@example.com");
    expect(tables.activity.rows).toEqual([{ id: "log_1" }]);
  });
});

describe("export responses", () => {
  const tables = { boards: { columns: ["id"], rows: [{ id: "b1" }] } };

  it("accepts only json and csv", () => {
    expect(parseExportFormat("json")).toBe("json");
    expect(parseExportFormat("csv")).toBe("csv");
    expect(parseExportFormat("xml")).toBeNull();
    expect(parseExportFormat(null)).toBeNull();
  });

  it("downloads JSON with a dated, safe file name", async () => {
    const response = exportResponse("Taskier Acme/Inc", "json", { a: 1 }, tables);

    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Content-Disposition")).toMatch(
      /^attachment; filename="taskier-acme-inc-\d{4}-\d{2}-\d{2}\.json"$/
    );
    expect(await response.json()).toEqual({ a: 1 });
  });

  it("downloads CSV files in a zip", async () => {
    const response = exportResponse("taskier-acme", "csv", {}, tables);

    expect(response.headers.get("Content-Type")).toBe("application/zip");
    const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
    expect(strFromU8(files["boards.csv"])).toBe("id\r\nb1\r\n");
  });
});
