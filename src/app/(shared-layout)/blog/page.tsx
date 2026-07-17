import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { fetchAuthQuery } from "@/lib/auth-server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { Id } from "../../../../convex/_generated/dataModel";
import { cacheLife, cacheTag } from "next/cache";
// import { connection } from "next/server";

interface IBlogDataProps {
  dataPosts?: {
    imageUrl: string | null;
    _id: Id<"posts">;
    _creationTime: number;
    imageStorageId?: Id<"_storage"> | undefined;
    title: string;
    content: string;
    authorId: string;
  }[];
}

export const metadata: Metadata = {
  title: "Blog | Next 16 on board project",
  description:
    'Blog listing with PPR streaming using Suspense boundaries, private cache directive (use cache: private), cacheLife("hours") for time-based revalidation, and cacheTag("blog") for on-demand invalidation via Convex fetchAuthQuery',
  category: "PPR Streaming + Cache Components",
  keywords: [
    "Next.js 16",
    "PPR",
    "partial prerendering",
    "Suspense",
    "use cache",
    "cacheLife",
    "cacheTag",
    "Convex",
    "fetchAuthQuery",
  ],
  authors: [{ name: "noidilin" }],
};

export default function BlogPage() {
  return (
    <div className="py-12">
      <div className="text-center pb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          All Blog Post
        </h1>
        <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          The list of posts are partial pre-rendering with Next.js 16 cache
          components
        </p>
      </div>
      <Suspense fallback={<SkeletonLoading />}>
        {/* <LoadingBlogListWrapper /> */}
        <LoadingBlogList />
      </Suspense>
    </div>
  );
}

async function LoadingBlogListWrapper() {
  const data = await fetchAuthQuery(api.posts.getPosts);
  return <LoadingBlogList dataPosts={data} />;
}

async function LoadingBlogList({ dataPosts }: IBlogDataProps) {
  "use cache: private";
  // await connection();
  const data = await fetchAuthQuery(api.posts.getPosts);
  cacheLife("seconds");
  cacheTag("blog");

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((post) => (
        <Card className="pt-0" key={post._id}>
          <div className=" relative h-48 w-full overflow-hidden">
            <Image
              src={
                post.imageUrl ??
                "https://images.unsplash.com/photo-1782241594334-42fcca7cd3e0?q=80&w=874&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              alt=""
              fill
              className="rounded-t-lg"
            />
          </div>
          <CardContent>
            <Link href={`/blog/${post._id}`}>
              <h1 className="text-2xl font-bold hover:text-primary">
                {post.title}
              </h1>
            </Link>
            <p className="text-muted-foreground line-clamp-3">{post.content}</p>
          </CardContent>
          <CardFooter>
            <Link
              className={buttonVariants({
                className: "w-full",
              })}
              href={`/blog/${post._id}`}
            >
              Read more
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="space-y-2 flex flex-col">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
