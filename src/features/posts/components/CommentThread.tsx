import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Heart,
  LoaderCircle,
  MessageSquare,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "@/app/providers/AuthProvider";
import type { CommentData } from "@/types/api.types";
import { InteractionsAPI } from "@/features/interactions/interactions.api";

interface CommentThreadProps {
  comment: CommentData;
  postId: string;
  postAuthorId: string;
  depth?: number;
  onDelete?: (commentId: string) => void;
}

const actionButtonClass =
  "inline-flex items-center gap-1 rounded-md py-1 text-xs font-semibold text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-blue-300";

export default function CommentThread({
  comment,
  postId,
  postAuthorId,
  depth = 0,
  onDelete,
}: CommentThreadProps) {
  const { user: authUser } = useAuth();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 480;
  const maxDepth = isMobile ? 3 : 5;
  const isOwner = authUser?.id === comment.author.id;
   const isPostAuthor = authUser?.id === postAuthorId;

    const canDelete = isOwner || isPostAuthor;

  const [isLiked, setIsLiked] = useState(
    comment.isReacted === true && comment.reactionType === "like",
  );
  const [likeCount, setLikeCount] = useState(comment.likeCount ?? 0);
  const [isReacting, setIsReacting] = useState(false);
  const reactingRef = useRef(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [currentContent, setCurrentContent] = useState(comment.content);
  const [isEditedState, setIsEditedState] = useState(comment.isEdited);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [replies, setReplies] = useState<CommentData[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const loadingRepliesRef = useRef(false);

  const handleToggleLike = async () => {
    if (!authUser) {
      toast.info("Please sign in to react to comments");
      return;
    }

    // Ref prevents two rapid clicks before React updates the state.
    if (reactingRef.current) return;

    reactingRef.current = true;
    setIsReacting(true);

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;
    const nextIsLiked = !previousIsLiked;

    setIsLiked(nextIsLiked);
    setLikeCount((count) => Math.max(0, count + (nextIsLiked ? 1 : -1)));

    try {
      const result = nextIsLiked
        ? await InteractionsAPI.setCommentReaction(comment.id, "like")
        : await InteractionsAPI.removeCommentReaction(comment.id);

      const backendLiked = result.isReacted && result.reactionType === "like";

      setIsLiked(backendLiked);

      // ReactionResult has no likeCount field. Reconcile only the
      // optimistic difference if the server's reaction state differs.
      if (backendLiked !== nextIsLiked) {
        setLikeCount((count) => Math.max(0, count + (backendLiked ? 1 : -1)));
      }
    } catch (error: unknown) {
      console.error("Error while updating comment reaction:", error);
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      toast.error("Failed to update comment reaction");
    } finally {
      reactingRef.current = false;
      setIsReacting(false);
    }
  };

  const handleFetchReplies = async (cursor?: string) => {
    if (loadingRepliesRef.current) return;

    loadingRepliesRef.current = true;
    setIsLoadingReplies(true);
    setShowReplies(true);

    try {
      const response = await InteractionsAPI.getCommentReplies(
        comment.id,
        cursor,
      );

      setReplies((previous) => {
        if (!cursor) return response.replies;

        const existingIds = new Set(previous.map((reply) => reply.id));
        return [
          ...previous,
          ...response.replies.filter((reply) => !existingIds.has(reply.id)),
        ];
      });

      setNextCursor(response.nextCursor);
    } catch (error: unknown) {
      console.error("Failed to load replies:", error);
      toast.error("Failed to load replies");
    } finally {
      loadingRepliesRef.current = false;
      setIsLoadingReplies(false);
    }
  };

  const handleSubmitReply = async () => {
    const content = replyText.trim();

    if (isSubmittingReply) return;

    if (!authUser) {
      toast.info("Please sign in to reply");
      return;
    }

    if (!content) return;

    setIsSubmittingReply(true);

    try {
      const newReply = await InteractionsAPI.addComment(
        postId,
        content,
        comment.id,
      );

      setReplies((previous) => [
        newReply,
        ...previous.filter((reply) => reply.id !== newReply.id),
      ]);

      setReplyText("");
      setIsReplying(false);
      setShowReplies(true);
    } catch (error: unknown) {
      console.error("Failed to post reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditSubmit = async () => {
    const content = editContent.trim();

    if (!content || isSubmittingEdit) return;

    if (content === currentContent) {
      setIsEditing(false);
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const updatedComment = await InteractionsAPI.updateComment(
        comment.id,
        content,
      );

      setCurrentContent(updatedComment.content);
      setEditContent(updatedComment.content);
      setIsEditedState(true);
      setIsEditing(false);
      toast.success("Comment updated");
    } catch (error: unknown) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteSelf = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await InteractionsAPI.deleteComment(comment.id);
      toast.success("Comment deleted");
      onDelete?.(comment.id);
    } catch (error: unknown) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleChildDeleted = (deletedCommentId: string) => {
    setReplies((previous) =>
      previous.filter((reply) => reply.id !== deletedCommentId),
    );
  };

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    },
  );

  const avatarSize = depth === 0 ? (isMobile ? "size-8" : "size-9") : "size-7";
  const iconSize = depth === 0 ? (isMobile ? 15 : 17) : 14;

  return (
    <div
      className="mt-4 flex min-w-0 items-start gap-2 sm:gap-2.5"
      style={{
        marginLeft: depth > 0 ? (isMobile ? "12px" : "20px") : undefined,
      }}
    >
      <div
        className={`${avatarSize} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300`}
      >
        {comment.author.profileImageUrl ? (
          <img
            src={comment.author.profileImageUrl}
            alt={`${comment.author.username}'s profile`}
            className="size-full object-cover"
          />
        ) : (
          <User size={iconSize} aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="rounded-r-xl rounded-bl-xl border border-blue-100/80 bg-slate-50 px-3 py-2 sm:px-3.5 sm:py-2.5 dark:border-slate-700 dark:bg-slate-800/70">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <span className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
              {comment.author.fullname || comment.author.username}
            </span>

            <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {isEditedState && <span className="italic">(edited)</span>}
              <time dateTime={comment.createdAt}>{formattedDate}</time>
            </span>
          </div>

          {isEditing ? (
            <form
              className="mt-2 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                void handleEditSubmit();
              }}
            >
              <label htmlFor={`edit-comment-${comment.id}`} className="sr-only">
                Edit comment
              </label>

              <textarea
                id={`edit-comment-${comment.id}`}
                autoFocus
                value={editContent}
                maxLength={2500}
                onChange={(event) => setEditContent(event.target.value)}
                disabled={isSubmittingEdit}
                className="min-h-20 w-full resize-y rounded-lg border border-blue-200 bg-white p-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-700 dark:focus:ring-blue-950"
              />

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(currentContent);
                  }}
                  disabled={isSubmittingEdit}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <X size={13} aria-hidden="true" />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingEdit || !editContent.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
                >
                  {isSubmittingEdit ? (
                    <LoaderCircle
                      size={13}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Check size={13} aria-hidden="true" />
                  )}
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="relative">
              {/* SHADOWBAN WARNING LOGIC */}
              {comment.status === "shadowbanned" && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 mb-1 font-semibold">
                  <AlertTriangle size={12} />
                  <span>Hidden from public (Shadowbanned)</span>
                </div>
              )}
              
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-200">
                {currentContent}
              </p>
            </div>
          )}
        </div>

        <div className="mt-1.5 ml-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => void handleToggleLike()}
            disabled={isReacting}
            aria-pressed={isLiked}
            aria-label={`${isLiked ? "Unlike" : "Like"} comment`}
            className={`${actionButtonClass} disabled:cursor-not-allowed disabled:opacity-50 ${
              isLiked ? "text-blue-700 dark:text-blue-300" : ""
            }`}
          >
            <Heart
              size={iconSize}
              aria-hidden="true"
              className={isLiked ? "fill-current" : ""}
            />
            {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
          </button>

          {depth < maxDepth && (
            <button
              type="button"
              onClick={() => setIsReplying((current) => !current)}
              aria-expanded={isReplying}
              className={actionButtonClass}
            >
              <MessageSquare size={iconSize} aria-hidden="true" />
              {isReplying ? "Cancel reply" : "Reply"}
            </button>
          )}

          {canDelete && !isEditing && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditContent(currentContent);
                  setIsEditing(true);
                }}
                className={actionButtonClass}
              >
                <Pencil size={iconSize} aria-hidden="true" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => void handleDeleteSelf()}
                className={actionButtonClass}
              >
                <Trash2 size={iconSize} aria-hidden="true" />
                Delete
              </button>
            </>
          )}
        </div>

        {isReplying && (
          <form
            className="mt-3 flex min-w-0 items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmitReply();
            }}
          >
            <label htmlFor={`reply-comment-${comment.id}`} className="sr-only">
              Reply to {comment.author.username}
            </label>

            <input
              id={`reply-comment-${comment.id}`}
              autoFocus
              type="text"
              placeholder={`Reply to ${comment.author.username}…`}
              value={replyText}
              maxLength={2500}
              onChange={(event) => setReplyText(event.target.value)}
              disabled={isSubmittingReply}
              className="min-w-0 flex-1 rounded-full border border-blue-100 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-700 dark:focus:ring-blue-950"
            />

            <button
              type="submit"
              disabled={!replyText.trim() || isSubmittingReply}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900 sm:px-4"
            >
              {isSubmittingReply ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <span>Post</span>
              )}
            </button>
          </form>
        )}

        {comment.replyCount > 0 && !showReplies && (
          <button
            type="button"
            onClick={() => void handleFetchReplies()}
            disabled={isLoadingReplies}
            className="mt-2 inline-flex items-center gap-2 rounded-md py-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 dark:text-blue-300 dark:hover:text-blue-200"
          >
            <span className="h-px w-5 bg-blue-300 dark:bg-blue-700" />
            {isLoadingReplies ? (
              <>
                <LoaderCircle size={13} className="animate-spin" />
                Loading replies…
              </>
            ) : (
              `View ${comment.replyCount} ${
                comment.replyCount === 1 ? "reply" : "replies"
              }`
            )}
          </button>
        )}

        {showReplies && (
          <div className="mt-1">
            {replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                postId={postId}
                postAuthorId={postAuthorId}
                depth={depth + 1}
                onDelete={handleChildDeleted}
              />
            ))}

            {isLoadingReplies && replies.length === 0 && (
              <div
                className="flex items-center gap-2 py-3 text-xs text-slate-500 dark:text-slate-400"
                role="status"
              >
                <LoaderCircle
                  size={14}
                  className="animate-spin text-blue-600 dark:text-blue-300"
                />
                Loading replies…
              </div>
            )}

            {nextCursor && (
              <button
                type="button"
                onClick={() => void handleFetchReplies(nextCursor)}
                disabled={isLoadingReplies}
                className="mt-2 rounded-md px-1 py-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 dark:text-blue-300 dark:hover:text-blue-200"
              >
                {isLoadingReplies ? "Loading…" : "Show more replies"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
