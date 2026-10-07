import { vi } from "vitest";

export const authMock = vi.fn();
export const currentUserMock = vi.fn();
export const headersMock = vi.fn();

// Stands in for the client returned by clerkClient()
export const clerkClientMock = {
  organizations: {
    getOrganization: vi.fn(),
    deleteOrganization: vi.fn(),
    getOrganizationMembershipList: vi.fn(),
    getOrganizationList: vi.fn(),
  },
  users: {
    getUser: vi.fn(),
    getUserList: vi.fn(),
    deleteUser: vi.fn(),
    getOrganizationMembershipList: vi.fn(),
  },
};

export const stripeMock = {
  webhooks: { constructEvent: vi.fn() },
  subscriptions: { retrieve: vi.fn(), cancel: vi.fn() },
  customers: { del: vi.fn() },
  billingPortal: { sessions: { create: vi.fn() } },
  checkout: { sessions: { create: vi.fn() } },
};
