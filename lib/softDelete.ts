// Boards, lists and cards are soft-deleted: active rows have no deletedAt,
// deleted rows carry the time they were deleted. Everything deleted together
// shares one timestamp, so a restore brings back exactly that set.
export const active = { deletedAt: { isSet: false } } as const;

// Update data that makes a soft-deleted row active again
export const restored = { deletedAt: { unset: true } } as const;

// Soft-deleted rows are purged for good after this many days
export const PURGE_AFTER_DAYS = 7;
