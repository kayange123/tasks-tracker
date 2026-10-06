import { ACTION, AuditLog } from "@prisma/client";

export const generateLogMessage = (log: AuditLog): string => {
  const { entityTitle, entityType, action } = log;

  switch (action) {
    case ACTION.CREATE:
      return ` created ${entityType.toLowerCase()} “${entityTitle}”`;
    case ACTION.UPDATE:
      return ` updated ${entityType.toLowerCase()} “${entityTitle}”`;
    case ACTION.DELETE:
      return ` deleted ${entityType.toLowerCase()} “${entityTitle}”`;
    case ACTION.RESTORE:
      return ` restored ${entityType.toLowerCase()} “${entityTitle}”`;
    default:
      return ` unknown action ${entityType.toLowerCase()} “${entityTitle}”`;
  }
};
