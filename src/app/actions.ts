"use server";

import { redirect } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { IPostSchema, postSchema } from "./schemas/blog";
import { fetchAuthMutation } from "@/lib/auth-server";
import { commentSchema, commentSchemaType } from "./schemas/comments";
import { updateTag } from "next/cache";

export async function createPostAction(value: IPostSchema) {
  const parsed = postSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("something went wrong");
  } else {
    try {
      const imageUrl = await fetchAuthMutation(
        api.posts.generateImageUploadUrl,
      );

      console.log("image url:" + imageUrl);
      const uploadResult = await fetch(imageUrl, {
        method: "POST",
        headers: {
          "Content-Type": parsed.data.imageStorageId.type,
        },
        body: parsed.data.imageStorageId,
      });

      if (!uploadResult.ok) {
        return {
          error: "Failed to upload image",
        };
      }

      const { storageId } = await uploadResult.json();

      await fetchAuthMutation(api.posts.createPost, {
        content: parsed.data.content,
        title: parsed.data.title,
        imageStorageId: storageId,
      });
    } catch {
      throw new Error("generation failed");
    }
  }
  updateTag("blog");
  // revalidateTag("blog", "max");
  return redirect("/blog");
}

export async function createCommentAction(value: commentSchemaType) {
  const parsed = commentSchema.safeParse(value);

  if (!parsed.success) {
    throw new Error("something went wrong");
  }

  try {
    await fetchAuthMutation(api.comments.createComment, {
      body: parsed.data.body,
      postId: parsed.data.postId,
    });
  } catch {
    throw new Error("comment creation failed");
  }
}
