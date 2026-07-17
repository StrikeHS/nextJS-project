import z from "zod";
import { Id } from "../../../convex/_generated/dataModel";

export const commentSchema = z.object({
  body: z.string().min(5).max(50),
  postId: z.custom<Id<"posts">>(),
});

export type commentSchemaType = z.infer<typeof commentSchema>;
