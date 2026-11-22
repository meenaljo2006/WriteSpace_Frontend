import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Send, User } from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "@/app/providers/AuthProvider";
import type { CommentData } from "@/types/api.types";
import { InteractionsAPI } from "@/features/interactions/interactions.api";

import CommentThread from "./CommentThread";

interface CommentSectionProps {
  postId: string;
  postAuthorUsername: string;
  postAuthorId: string;
}

export default function CommentSection({ postId, postAuthorId }: CommentSectionProps) {
  const { user: authUser } = useAuth();

  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const loadingMoreRef = useRef(false);
  const requestGenerationRef = useRef(0);

  const fetchTopLevelComments = useCallback(
    async (cursor?: string) => {
      if (cursor && loadingMoreRef.current) return;

      if (cursor) {
        loadingMoreRef.current = true;
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const requestGeneration = requestGenerationRef.current;

      try {
        const response = await InteractionsAPI.getTopLevelComments(postId, cursor);

        if (requestGeneration !== requestGenerationRef.current) return;

        setComments((previous) => {
          if (!cursor) return response.comments;
          const existingIds = new Set(previous.map((comment) => comment.id));
          return [
            ...previous,
            ...response.comments.filter((comment) => !existingIds.has(comment.id)),
          ];
        });

        setNextCursor(response.nextCursor);
      } catch (error: unknown) {
        if (requestGeneration !== requestGenerationRef.current) return;
        console.error("Failed to fetch comments", error);
        toast.error("Failed to load comments");
      } finally {
        if (requestGeneration === requestGenerationRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
        if (cursor) {
          loadingMoreRef.current = false;
        }
      }
    },
    [postId],
  );

  useEffect(() => {
    requestGenerationRef.current += 1;
    loadingMoreRef.current = false;

    setComments([]);
    setNextCursor(null);
    setIsLoading(true);
    setIsLoadingMore(false);
    setCommentText("");

    void fetchTopLevelComments();

    return () => {
      requestGenerationRef.current += 1;
      loadingMoreRef.current = false;
    };
  }, [fetchTopLevelComments]);

  const handleAddTopLevelComment = async () => {
    const content = commentText.trim();
    if (isSubmittingRef.current) return; 
    if (!authUser) {
      toast.info("Please sign in to comment");
      return;
    }

    if (!content) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const newComment = await InteractionsAPI.addComment(postId, content);

      if (newComment.status === "shadowbanned") {
        toast.warning(
          <div>
            <strong>Professional Language Required</strong>
            <p className="text-sm mt-1">Your comment was posted but hidden from the public feed due to inappropriate language or spam.</p>
          </div>,
          { autoClose: 6000 }
        );
      }

      setComments((previous) => [
        newComment,
        ...previous.filter((comment) => comment.id !== newComment.id),
      ]);

      setCommentText("");
    } catch (error: unknown) {
      console.error("Failed to post comment", error);
      toast.error("Failed to post comment");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleTopLevelDelete = (deletedCommentId: string) => {
    setComments((previous) =>
      previous.filter((comment) => comment.id !== deletedCommentId),
    );
  };

  return (
    <section className="mt-4 border-t border-stone-200/60 pt-4 dark:border-white/10">
      <form
        className="flex min-w-0 items-center gap-2 sm:gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (isSubmitting) return;
          void handleAddTopLevelComment();
        }}
      >
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 sm:size-9">
          {authUser?.profileImageUrl ? (
            <img
              src={authUser.profileImageUrl}
              alt="Your profile"
              className="size-full object-cover"
            />
          ) : (
            <User size={18} aria-hidden="true" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-stone-200/80 bg-stone-100/50 py-1 pl-3 pr-1 transition-colors focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/20 dark:border-white/10 dark:bg-black/20 dark:focus-within:border-orange-500/50 sm:pl-4">
          <label htmlFor={`comment-input-${postId}`} className="sr-only">
            Add a comment
          </label>

          <input
            id={`comment-input-${postId}`}
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            maxLength={2500}
            onChange={(event) => setCommentText(event.target.value)}
            disabled={isSubmitting}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 disabled:opacity-60 dark:text-stone-100 dark:placeholder:text-stone-500"
          />

          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            aria-label="Post comment"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-orange-500 transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-orange-400 dark:hover:bg-orange-500/10"
          >
            {isSubmitting ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Send size={17} aria-hidden="true" />
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-1">
        {isLoading ? (
          <div
            className="flex justify-center py-6 text-orange-500 dark:text-orange-400"
            role="status"
            aria-label="Loading comments"
          >
            <LoaderCircle size={24} className="animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-stone-500 dark:text-stone-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                postId={postId}
                postAuthorId={postAuthorId}
                onDelete={handleTopLevelDelete}
              />
            ))}

            {nextCursor && (
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={() => void fetchTopLevelComments(nextCursor)}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/50 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#15233B]/50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                >
                  {isLoadingMore && (
                    <LoaderCircle size={15} className="animate-spin" />
                  )}
                  {isLoadingMore ? "Loading…" : "Load more comments"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}