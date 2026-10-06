import { z } from "zod";

export const UpdateCard = z.object({
  title: z
    .string({
      required_error: "Enter a title.",
      invalid_type_error: "Enter a title.",
    })
    .min(3, {
      message: "Title must be at least 3 characters.",
    })
    .max(100, { message: "Title must be at most 100 characters." }),
  boardId: z.string(),
  // Optional; an empty description clears it
  description: z.optional(
    z
      .string({ invalid_type_error: "Enter a description." })
      .max(5000, { message: "Description must be at most 5,000 characters." })
  ),
  id: z.string(),
});
