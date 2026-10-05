import { describe, expect, it } from "vitest";
import ActivityList, {
  ACTIVITY_PAGE_SIZE,
} from "@/app/(platform)/(dashboard)/organization/[organizationId]/activity/_components/ActivityList";
import { dbMock } from "./mocks/db";

const log = (index: number) => ({
  id: `log_${index}`,
  orgId: "org_1",
  action: "CREATE",
  entityId: "card_1",
  entityType: "CARD",
  entityTitle: "Spec",
  userId: "user_1",
  userImage: "",
  userName: "Taylor Test",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Collects the hrefs rendered by the pagination links
const hrefs = (node: unknown): string[] => {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(hrefs);
  const props = (node as { props?: Record<string, unknown> }).props ?? {};
  const own = typeof props.href === "string" ? [props.href] : [];
  return [...own, ...hrefs(props.children)];
};

describe("activity log", () => {
  it("reads one page plus one row to detect an older page", async () => {
    dbMock.auditLog.findMany.mockResolvedValue([]);

    await ActivityList({ page: 3 });

    expect(dbMock.auditLog.findMany).toHaveBeenCalledWith({
      where: { orgId: "org_1" },
      orderBy: { createdAt: "desc" },
      skip: 2 * ACTIVITY_PAGE_SIZE,
      take: ACTIVITY_PAGE_SIZE + 1,
    });
  });

  it("links to newer and older pages when they exist", async () => {
    dbMock.auditLog.findMany.mockResolvedValue(
      Array.from({ length: ACTIVITY_PAGE_SIZE + 1 }, (_, i) => log(i))
    );

    const links = hrefs(await ActivityList({ page: 2 }));

    expect(links).toEqual([
      "/organization/org_1/activity",
      "/organization/org_1/activity?page=3",
    ]);
  });

  it("shows no pagination on a single page", async () => {
    dbMock.auditLog.findMany.mockResolvedValue([log(1), log(2)]);

    expect(hrefs(await ActivityList({ page: 1 }))).toEqual([]);
  });
});
