import z from "zod";

export const postSchema = z.object({
  title: z.string().min(3).max(50),
  content: z.string().min(10),
  imageStorageId: z.instanceof(File),
});

export type IPostSchema = z.infer<typeof postSchema>;
