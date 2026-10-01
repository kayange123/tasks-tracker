import { vi } from "vitest";

export const authMock = vi.fn();
export const currentUserMock = vi.fn();
export const headersMock = vi.fn();

export const stripeMock = {
  webhooks: { constructEvent: vi.fn() },
  subscriptions: { retrieve: vi.fn() },
  billingPortal: { sessions: { create: vi.fn() } },
  checkout: { sessions: { create: vi.fn() } },
};
