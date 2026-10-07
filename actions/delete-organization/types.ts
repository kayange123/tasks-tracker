import { ActionState } from "@/lib/createActions";
import { DeleteOrganization } from "./schema";
import { z } from "zod";

export type InputType = z.infer<typeof DeleteOrganization>;
export type ReturnType = ActionState<InputType, { name: string }>;
