import { z } from "zod";

export const UpdateList = z.object({
  title: z
    .string({
      required_error: "Enter a title.",
      invalid_type_error: "Enter a title.",
    })
    .min(3, {
      message: "Title must be at least 3 characters.",
    })
    .max(100, { message: "Title must be at most 100 characters." }),
  id: z.string(),
  boardId: z.string(),
});
