import { z } from "zod";

export const DeleteOrganization = z.object({
  organizationId: z.string(),
  confirmation: z.string(),
});
