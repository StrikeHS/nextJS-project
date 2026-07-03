import z from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3, { error: "Need min 3 characters" }),
  email: z.email(),
  password: z.string().min(5),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(5),
});

export type signUpType = z.infer<typeof signUpSchema>;
export type loginType = z.infer<typeof loginSchema>;
