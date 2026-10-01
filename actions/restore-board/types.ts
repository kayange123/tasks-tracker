import { ActionState } from "@/lib/createActions";
import { RestoreBoard } from "./schema";
import { z } from "zod";
import { Board } from "@prisma/client";

export type InputType = z.infer<typeof RestoreBoard>;
export type ReturnType = ActionState<InputType, Board>;
