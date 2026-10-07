import { beforeEach, vi } from "vitest";
import { authMock } from "./mocks/services";

// Module mocks registered here apply to every test file
vi.mock("@/lib/prisma", async () => ({
  db: (await import("./mocks/db")).dbMock,
}));
vi.mock("@clerk/nextjs/server", async () => {
  const { authMock, clerkClientMock, currentUserMock } = await import(
    "./mocks/services"
  );
  return {
    auth: authMock,
    currentUser: currentUserMock,
    clerkClient: async () => clerkClientMock,
  };
});
vi.mock("@/lib/stripe", async () => ({
  stripe: (await import("./mocks/services")).stripeMock,
}));
vi.mock("next/headers", async () => ({
  headers: (await import("./mocks/services")).headersMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(), notFound: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  authMock.mockResolvedValue({ userId: "user_1", orgId: "org_1" });
});
