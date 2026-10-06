import { z } from "zod";

export const RestoreBoard = z.object({
  id: z.string(),
});
