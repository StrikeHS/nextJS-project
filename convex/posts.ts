import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { Doc } from "./_generated/dataModel";

interface ISearchResultTypes {
  [key: string]: string;
}

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    console.log("Server identity:", await ctx.auth.getUserIdentity());

    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const blogArticle = await ctx.db.insert("posts", {
      authorId: user._id,
      ...args,
    });
    return blogArticle;
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    return await Promise.all(
      posts.map(async (post) => {
        const resolvedImageUrl = post.imageStorageId
          ? await ctx.storage.getUrl(post.imageStorageId)
          : null;
        return {
          ...post,
          imageUrl: resolvedImageUrl,
        };
      }),
    );
  },
});

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    return ctx.storage.generateUploadUrl();
  },
});

export const getPostImageById = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      return null;
    }

    const resolvedImageUrl =
      post?.imageStorageId !== undefined
        ? await ctx.storage.getUrl(post.imageStorageId)
        : null;
    return {
      ...post,
      imageUrl: resolvedImageUrl,
    };
  },
});

export const searchPost = query({
  args: {
    term: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args): Promise<ISearchResultTypes[]> => {
    const limit = args.limit;

    const result: Array<ISearchResultTypes> = [];

    const seen = new Set();

    const pushDoc = async (docs: Array<Doc<"posts">>) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) continue;
        seen.add(doc._id);
        result.push({
          _id: doc._id,
          title: doc.title,
          content: doc.content,
        });
        if (result.length >= limit) break;
      }
    };

    const titleMatches = await ctx.db
      .query("posts")
      .withSearchIndex("search_title", (q) => q.search("title", args.term))
      .take(limit);

    await pushDoc(titleMatches);

    if (result.length < limit) {
      const bodyMatches = await ctx.db
        .query("posts")
        .withSearchIndex("search_content", (q) =>
          q.search("content", args.term),
        )
        .take(limit);

      await pushDoc(bodyMatches);
    }

    return result;
  },
});
