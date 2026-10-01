import { z } from "zod";

export const UpdateCard = z.object({
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
  description: z.optional(
    z
      .string({
        required_error: "Description is required",
        invalid_type_error: "Description is invalid",
      })
      .min(5, {
        message: "Description should be at least 5 characters",
      })
      .max(5000, { message: "Description should be at most 5000 characters" }),
  ),
  id: z.string(),
});
