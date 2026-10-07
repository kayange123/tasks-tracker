import { ActionState } from "@/lib/createActions";
import { OrganizationSummary } from "@/lib/accountDeletion";
import { AdminDeleteUser } from "./schema";
import { z } from "zod";

export type InputType = z.infer<typeof AdminDeleteUser>;
export type ReturnType = ActionState<
  InputType,
  { deletedOrganizations: OrganizationSummary[] }
>;
