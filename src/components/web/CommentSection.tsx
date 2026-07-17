"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Controller, useForm } from "react-hook-form";
import { commentSchema, commentSchemaType } from "@/app/schemas/comments";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { useParams } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
// import { useMutation } from "convex/react";
// import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { createCommentAction } from "@/app/actions";
import { useTransition } from "react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

export default function CommentSection(props: {
  preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
}) {
  const [isPending, startTransition] = useTransition();
  const data = usePreloadedQuery(props.preloadedComments);
  const params = useParams<{ postId: Id<"posts"> }>();
  const form = useForm<commentSchemaType>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: "",
      postId: params.postId,
    },
  });

  // const mutation = useMutation(api.comments.createComment);
  const onSubmit = (data: commentSchemaType) => {
    startTransition(async () => {
      try {
        await createCommentAction(data);
        toast.success("Comment added successfully!");
        form.reset({
          body: "",
          postId: params.postId,
        });
        // await mutation(data);
      } catch {
        toast.error("Failed to create comment");
      }
    });
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 border-b">
        <MessageSquare className="size-5" />
        <h2 className="text-xl font-bold">{data.length} Comments</h2>
      </CardHeader>
      <CardContent className="space-y-8">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            name="body"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Enter content</FieldLabel>
                <Textarea
                  aria-invalid={fieldState.invalid}
                  placeholder="Share your thoughts"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>Create post</>
            )}
          </Button>
        </form>
        {data.length > 0 && <Separator />}
        <section className="space-y-6">
          {data?.map((comment) => (
            <div className="flex gap-4" key={comment._id}>
              <Avatar>
                <AvatarImage
                  src="https://static.wikia.nocookie.net/the-canny-incredible/images/5/50/Phase_5.png/revision/latest?cb=20230830134900"
                  alt={comment.authorName}
                />
                <AvatarFallback>
                  {comment.authorName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{comment.authorName}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(comment._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}
