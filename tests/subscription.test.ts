import { describe, expect, it } from "vitest";
import { checkSubscription, getSubscription } from "@/lib/subscription";
import { dbMock } from "./mocks/db";

const HOUR = 3_600_000;
const subscription = (offsetMs: number) => ({
  stripePriceId: "price_1",
  stripeCurrentPeriodEnd: new Date(Date.now() + offsetMs),
});

describe("getSubscription", () => {
  it("is free without a subscription record", async () => {
    dbMock.orgSubscription.findUnique.mockResolvedValue(null);

    expect(await getSubscription()).toEqual({ isPro: false, periodEnd: null });
  });

  it("is pro during the current period and returns its end", async () => {
    const record = subscription(10 * 24 * HOUR);
    dbMock.orgSubscription.findUnique.mockResolvedValue(record);

    expect(await getSubscription()).toEqual({
      isPro: true,
      periodEnd: record.stripeCurrentPeriodEnd,
    });
  });

  it("stays pro for a day after the period ends to absorb webhook delays", async () => {
    dbMock.orgSubscription.findUnique.mockResolvedValue(
      subscription(-12 * HOUR)
    );

    expect(await checkSubscription()).toBe(true);
  });

  it("is free once the grace day has passed", async () => {
    dbMock.orgSubscription.findUnique.mockResolvedValue(
      subscription(-25 * HOUR)
    );

    expect(await getSubscription()).toEqual({ isPro: false, periodEnd: null });
  });
});
