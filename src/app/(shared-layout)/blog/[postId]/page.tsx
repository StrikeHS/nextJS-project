import { buttonVariants } from "@/components/ui/button";
import {
  fetchAuthQuery,
  isAuthenticated,
  preloadAuthQuery,
} from "@/lib/auth-server";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import CommentSection from "@/components/web/CommentSection";
import { Metadata } from "next";
import PostPresence from "@/components/web/PostPresence";
import { redirect } from "next/navigation";

interface IPostIdPageProps {
  params: Promise<{ postId: Id<"posts"> }>;
}

export async function generateMetadata({
  params,
}: IPostIdPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchAuthQuery(api.posts.getPostImageById, { postId });

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.content,
  };
}

export default async function PostIdPage({ params }: IPostIdPageProps) {
  const { postId } = await params;
  if (!(await isAuthenticated())) {
    return redirect("/auth/login");
  }
  const [post, preloadedComments, userId] = await Promise.all([
    await fetchAuthQuery(api.posts.getPostImageById, {
      postId: postId,
    }),
    await preloadAuthQuery(api.comments.getCommentsByPostId, { postId }),
    await fetchAuthQuery(api.presence.getUserId),
  ]);

  if (!post) {
    <div>
      <h1>No post found</h1>
    </div>;
  }
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">
      <Link
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
        href={"/blog"}
      >
        <ArrowLeft className="size-4" />
        Go Back
      </Link>
      <div className="relative w-full h-100 mb-8 rounded-xl overflow-hidden">
        <Image
          src={
            post!.imageUrl ??
            "https://images.unsplash.com/photo-1782241594334-42fcca7cd3e0?q=80&w=874&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          fill
          alt={post!.title}
          className="object-cover hover:scale-105 transition-transform duration-100"
        />
      </div>
      <div>
        <div className="space-y-4 flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {post?.title}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Posted on: {new Date(post!._creationTime).toLocaleDateString()}
            </p>
            {userId && <PostPresence roomId={post!._id} userId={userId} />}
          </div>
        </div>
        <Separator className="my-8" />
        <div className="space-y-4">
          <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {post?.content}
          </p>
          <CommentSection preloadedComments={preloadedComments} />
        </div>
      </div>
    </div>
  );
}
