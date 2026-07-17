import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getCommentsByPostId = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("desc")
      .collect();
    return data;
  },
});

export const createComment = mutation({
  args: { body: v.string(), postId: v.id("posts") },
  handler: async (ctx, args) => {
    console.log("Server identity:", await ctx.auth.getUserIdentity());
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const comment = await ctx.db.insert("comments", {
      body: args.body,
      postId: args.postId,
      authorId: user._id,
      authorName: user.name,
    });

    return comment;
  },
});
