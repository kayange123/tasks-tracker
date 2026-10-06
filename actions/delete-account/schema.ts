import { z } from "zod";

export const CONFIRMATION_PHRASE = "delete my account";

export const DeleteAccount = z.object({
  confirmation: z
    .string()
    .refine((value) => value.trim().toLowerCase() === CONFIRMATION_PHRASE, {
      message: `Type “${CONFIRMATION_PHRASE}” to confirm.`,
    }),
});
