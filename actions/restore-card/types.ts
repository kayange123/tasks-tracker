import { ActionState } from "@/lib/createActions";
import { RestoreCard } from "./schema";
import { z } from "zod";
import { Card } from "@prisma/client";

export type InputType = z.infer<typeof RestoreCard>;
export type ReturnType = ActionState<InputType, Card>;
