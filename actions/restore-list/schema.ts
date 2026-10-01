import { z } from "zod";

export const RestoreList = z.object({
  id: z.string(),
  boardId: z.string(),
});
