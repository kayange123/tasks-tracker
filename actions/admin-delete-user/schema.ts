import { z } from "zod";

export const AdminDeleteUser = z.object({
  userId: z.string(),
  confirmation: z.string(),
});
