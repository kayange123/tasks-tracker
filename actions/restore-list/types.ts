import { ActionState } from "@/lib/createActions";
import { RestoreList } from "./schema";
import { z } from "zod";
import { List } from "@prisma/client";

export type InputType = z.infer<typeof RestoreList>;
export type ReturnType = ActionState<InputType, List>;
