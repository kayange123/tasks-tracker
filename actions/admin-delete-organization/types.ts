import { ActionState } from "@/lib/createActions";
import { AdminDeleteOrganization } from "./schema";
import { z } from "zod";

export type InputType = z.infer<typeof AdminDeleteOrganization>;
export type ReturnType = ActionState<InputType, { orgId: string }>;
