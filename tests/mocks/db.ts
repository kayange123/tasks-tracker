import { vi } from "vitest";

const model = () => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
});

// Stands in for the Prisma client exported from @/lib/prisma
export const dbMock = {
  board: model(),
  list: model(),
  card: model(),
  auditLog: model(),
  orgLimit: model(),
  orgSubscription: model(),
  $transaction: vi.fn(),
};
