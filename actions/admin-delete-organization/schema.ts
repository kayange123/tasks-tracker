import { z } from "zod";

export const AdminDeleteOrganization = z.object({
  orgId: z.string(),
  confirmation: z.string(),
});
