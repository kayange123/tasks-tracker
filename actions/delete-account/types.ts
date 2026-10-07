import { ActionState } from "@/lib/createActions";
import { OrganizationSummary } from "@/lib/accountDeletion";
import { DeleteAccount } from "./schema";
import { z } from "zod";

export type InputType = z.infer<typeof DeleteAccount>;
export type ReturnType = ActionState<
  InputType,
  { deletedOrganizations: OrganizationSummary[] }
>;
