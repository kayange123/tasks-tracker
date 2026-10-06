import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler as stripeRedirect } from "@/actions/stripe-redirect/action";
import { POST } from "@/app/api/webhook/route";
import { checkSubscription } from "@/lib/subscription";
import { dbMock } from "./mocks/db";
import { currentUserMock, headersMock, stripeMock } from "./mocks/services";

vi.mock("@/lib/subscription", () => ({ checkSubscription: vi.fn() }));

const subscription = {
  id: "sub_1",
  customer: "cus_1",
  items: { data: [{ price: { id: "price_1" } }] },
  current_period_end: 1_700_000_000,
};

const webhook = () =>
  POST(
    new Request("http://localhost/api/webhook", { method: "POST", body: "{}" })
  );

describe("Stripe webhook", () => {
  beforeEach(() => {
    headersMock.mockResolvedValue(new Headers({ "stripe-signature": "sig" }));
    stripeMock.subscriptions.retrieve.mockResolvedValue(subscription);
  });

  it("rejects requests with an invalid signature", async () => {
    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const response = await webhook();

    expect(response.status).toBe(400);
  });

  it("upserts the subscription on checkout so repeat checkouts succeed", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { subscription: "sub_1", metadata: { orgId: "org_1" } } },
    });

    const response = await webhook();

    expect(response.status).toBe(200);
    expect(dbMock.orgSubscription.upsert).toHaveBeenCalledWith({
      where: { orgId: "org_1" },
      create: expect.objectContaining({
        orgId: "org_1",
        stripeSubscriptionId: "sub_1",
      }),
      update: expect.objectContaining({ stripePriceId: "price_1" }),
    });
  });

  it("rejects checkout sessions without an org id", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { subscription: "sub_1", metadata: {} } },
    });

    const response = await webhook();

    expect(response.status).toBe(400);
    expect(dbMock.orgSubscription.upsert).not.toHaveBeenCalled();
  });

  it("extends the period on paid invoices without requiring the record", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: { object: { subscription: "sub_1" } },
    });

    const response = await webhook();

    expect(response.status).toBe(200);
    expect(dbMock.orgSubscription.updateMany).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: "sub_1" },
      data: {
        stripePriceId: "price_1",
        stripeCurrentPeriodEnd: new Date(1_700_000_000 * 1000),
      },
    });
  });

  it("ignores invoices that are not tied to a subscription", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: { object: { subscription: null } },
    });

    const response = await webhook();

    expect(response.status).toBe(200);
    expect(stripeMock.subscriptions.retrieve).not.toHaveBeenCalled();
  });
});

describe("stripe-redirect handler", () => {
  beforeEach(() => {
    currentUserMock.mockResolvedValue({
      emailAddresses: [{ emailAddress: "jane@example.com" }],
    });
    stripeMock.billingPortal.sessions.create.mockResolvedValue({
      url: "https://portal",
    });
    stripeMock.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout",
    });
  });

  it("sends active subscribers to the billing portal", async () => {
    vi.mocked(checkSubscription).mockResolvedValue(true);
    dbMock.orgSubscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_1",
    });

    const result = await stripeRedirect();

    expect(result.data).toBe("https://portal");
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("sends lapsed subscribers back through checkout with their customer", async () => {
    vi.mocked(checkSubscription).mockResolvedValue(false);
    dbMock.orgSubscription.findUnique.mockResolvedValue({
      stripeCustomerId: "cus_1",
    });

    const result = await stripeRedirect();

    expect(result.data).toBe("https://checkout");
    const params = stripeMock.checkout.sessions.create.mock.calls[0][0];
    expect(params.customer).toBe("cus_1");
    expect(params).not.toHaveProperty("customer_email");
    expect(params.metadata).toEqual({ orgId: "org_1" });
  });

  it("starts new orgs in checkout using the user's email", async () => {
    vi.mocked(checkSubscription).mockResolvedValue(false);
    dbMock.orgSubscription.findUnique.mockResolvedValue(null);

    await stripeRedirect();

    const params = stripeMock.checkout.sessions.create.mock.calls[0][0];
    expect(params.customer_email).toBe("jane@example.com");
    expect(params).not.toHaveProperty("customer");
  });
});

describe("stripe-redirect failures", () => {
  it("logs the Stripe error and returns a clear message", async () => {
    vi.mocked(checkSubscription).mockResolvedValue(false);
    currentUserMock.mockResolvedValue({ emailAddresses: [] });
    dbMock.orgSubscription.findUnique.mockResolvedValue(null);
    stripeMock.checkout.sessions.create.mockRejectedValue(
      new Error("Invalid API Key")
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await stripeRedirect();

    expect(result.error).toBe("Couldn’t open Stripe. Try again in a moment.");
    expect(consoleError).toHaveBeenCalledWith(
      "Stripe redirect failed",
      expect.any(Error)
    );
  });
});
