import { z } from "zod";

export const RestoreCard = z.object({
  id: z.string(),
  boardId: z.string(),
});
