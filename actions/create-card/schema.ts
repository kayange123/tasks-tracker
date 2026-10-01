import { z } from "zod";

export const CreateCard = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title is invalid",
    })
    .min(3, {
      message: "Title should be more than 3 characters",
    })
    .max(100, { message: "Title should be at most 100 characters" }),
  boardId: z.string(),
  listId: z.string(),
});
