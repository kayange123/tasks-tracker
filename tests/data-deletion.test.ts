import Stripe from "stripe";
import { beforeEach, describe, expect, it } from "vitest";
import { anonymizeUser, purgeOrganization } from "@/lib/dataDeletion";
import { dbMock } from "./mocks/db";
import { stripeMock } from "./mocks/services";

const missing = () =>
  new Stripe.errors.StripeInvalidRequestError({
    type: "invalid_request_error",
    code: "resource_missing",
    message: "No such subscription",
  });

const callOrder = (mock: { mock: { invocationCallOrder: number[] } }) =>
  mock.mock.invocationCallOrder[0];

describe("purgeOrganization", () => {
  beforeEach(() => {
    dbMock.board.findMany.mockResolvedValue([{ id: "b1" }, { id: "b2" }]);
    for (const model of Object.values(dbMock)) {
      if ("deleteMany" in model) model.deleteMany.mockResolvedValue({ count: 2 });
    }
  });

  it("removes every record of the organization, children first", async () => {
    dbMock.orgSubscription.findUnique.mockResolvedValue(null);

    const result = await purgeOrganization("org_1");

    expect(result).toEqual({ boards: 2, lists: 2, cards: 2, activity: 2 });
    expect(dbMock.card.deleteMany).toHaveBeenCalledWith({
      where: { list: { boardId: { in: ["b1", "b2"] } } },
    });
    expect(dbMock.list.deleteMany).toHaveBeenCalledWith({
      where: { boardId: { in: ["b1", "b2"] } },
    });
    for (const model of [
      dbMock.board,
      dbMock.auditLog,
      dbMock.orgLimit,
      dbMock.orgSubscription,
    ]) {
      expect(model.deleteMany).toHaveBeenCalledWith({
        where: { orgId: "org_1" },
      });
    }
    expect(callOrder(dbMock.card.deleteMany)).toBeLessThan(
      callOrder(dbMock.list.deleteMany)
    );
    expect(callOrder(dbMock.list.deleteMany)).toBeLessThan(
      callOrder(dbMock.board.deleteMany)
    );
    expect(stripeMock.subscriptions.cancel).not.toHaveBeenCalled();
  });

  it("cancels the subscription and removes the customer before any data", async () => {
    dbMock.orgSubscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: "sub_1",
      stripeCustomerId: "cus_1",
    });
    stripeMock.subscriptions.cancel.mockResolvedValue({});
    stripeMock.customers.del.mockResolvedValue({});

    await purgeOrganization("org_1");

    expect(stripeMock.subscriptions.cancel).toHaveBeenCalledWith("sub_1");
    expect(stripeMock.customers.del).toHaveBeenCalledWith("cus_1");
    expect(callOrder(stripeMock.customers.del)).toBeLessThan(
      callOrder(dbMock.card.deleteMany)
    );
  });

  it("treats billing that is already gone as done, so it can run again", async () => {
    dbMock.orgSubscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: "sub_1",
      stripeCustomerId: "cus_1",
    });
    stripeMock.subscriptions.cancel.mockRejectedValue(missing());
    stripeMock.customers.del.mockRejectedValue(missing());

    await expect(purgeOrganization("org_1")).resolves.toBeDefined();
    expect(dbMock.orgSubscription.deleteMany).toHaveBeenCalled();
  });

  it("keeps every record when Stripe fails, so a retry can finish", async () => {
    dbMock.orgSubscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: "sub_1",
      stripeCustomerId: null,
    });
    stripeMock.subscriptions.cancel.mockRejectedValue(new Error("Stripe down"));

    await expect(purgeOrganization("org_1")).rejects.toThrow("Stripe down");
    expect(dbMock.board.deleteMany).not.toHaveBeenCalled();
    expect(dbMock.orgSubscription.deleteMany).not.toHaveBeenCalled();
  });
});

describe("anonymizeUser", () => {
  it("replaces the person's name, photo and id on their activity entries", async () => {
    dbMock.auditLog.updateMany.mockResolvedValue({ count: 3 });

    expect(await anonymizeUser("user_1")).toEqual({ activity: 3 });
    expect(dbMock.auditLog.updateMany).toHaveBeenCalledWith({
      where: { userId: "user_1" },
      data: { userId: "deleted-user", userName: "Deleted user", userImage: "" },
    });
  });
});
