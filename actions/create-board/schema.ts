import { z } from "zod";

export const createBoardSchema = z.object({
  title: z
    .string({
      required_error: "Enter a title.",
      invalid_type_error: "Enter a title.",
    })
    .min(3, {
      message: "Title must be at least 3 characters.",
    })
    .max(100, { message: "Title must be at most 100 characters." }),
  image: z.string({
    required_error: "Choose a background.",
    invalid_type_error: "Choose a background.",
  }),
});
