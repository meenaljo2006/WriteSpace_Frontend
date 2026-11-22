import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Heart, LoaderCircle, MessageSquare, Pencil, Trash2, User, X } from "lucide-react";
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

const actionButtonClass = "inline-flex items-center gap-1 rounded-md py-1 text-xs font-semibold text-stone-500 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-stone-400 dark:hover:text-orange-400";

export default function CommentThread({ comment, postId, postAuthorId, depth = 0, onDelete }: CommentThreadProps) {
  const { user: authUser } = useAuth();
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

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

  const [isLiked, setIsLiked] = useState(comment.isReacted === true && comment.reactionType === "like");
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
      const response = await InteractionsAPI.getCommentReplies(comment.id, cursor);
      setReplies((previous) => {
        if (!cursor) return response.replies;
        const existingIds = new Set(previous.map((reply) => reply.id));
        return [...previous, ...response.replies.filter((reply) => !existingIds.has(reply.id))];
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
      const newReply = await InteractionsAPI.addComment(postId, content, comment.id);
      setReplies((previous) => [newReply, ...previous.filter((reply) => reply.id !== newReply.id)]);
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
      const updatedComment = await InteractionsAPI.updateComment(comment.id, content);
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
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
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
    setReplies((previous) => previous.filter((reply) => reply.id !== deletedCommentId));
  };

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const avatarSize = depth === 0 ? (isMobile ? "size-8" : "size-9") : "size-7";
  const iconSize = depth === 0 ? (isMobile ? 15 : 17) : 14;

  return (
    <div className="mt-4 flex min-w-0 items-start gap-2 sm:gap-2.5" style={{ marginLeft: depth > 0 ? (isMobile ? "12px" : "20px") : undefined }}>
      <div className={`${avatarSize} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 text-stone-500 dark:border-white/10 dark:bg-stone-800 dark:text-stone-400`}>
        {comment.author.profileImageUrl ? (
          <img src={comment.author.profileImageUrl} alt={`${comment.author.username}'s profile`} className="size-full object-cover" />
        ) : (
          <User size={iconSize} aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {/* Comment Bubble */}
        <div className="rounded-r-xl rounded-bl-xl border border-stone-200/60 bg-stone-50 px-3 py-2 sm:px-3.5 sm:py-2.5 dark:border-white/10 dark:bg-[#1A2436]/60">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <span className="break-words text-sm font-semibold text-[#0B192C] dark:text-white">
              {comment.author.fullname || comment.author.username}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              {isEditedState && <span className="italic">(edited)</span>}
              <time dateTime={comment.createdAt}>{formattedDate}</time>
            </span>
          </div>

          {isEditing ? (
            <form className="mt-2 space-y-2" onSubmit={(event) => { event.preventDefault(); void handleEditSubmit(); }}>
              <textarea
                autoFocus
                value={editContent}
                maxLength={2500}
                onChange={(event) => setEditContent(event.target.value)}
                disabled={isSubmittingEdit}
                className="min-h-20 w-full resize-y rounded-lg border border-stone-200 bg-white p-2.5 text-sm text-stone-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-60 dark:border-white/10 dark:bg-[#0B192C] dark:text-white dark:focus:border-orange-500/50 dark:focus:ring-orange-500/20"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => { setIsEditing(false); setEditContent(currentContent); }} disabled={isSubmittingEdit} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 disabled:opacity-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5">
                  <X size={13} /> Cancel
                </button>
                <button type="submit" disabled={isSubmittingEdit || !editContent.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50">
                  {isSubmittingEdit ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />} Save
                </button>
              </div>
            </form>
          ) : (
            <div className="relative">
              {comment.status === "shadowbanned" && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 mb-1 font-semibold">
                  <AlertTriangle size={12} /> <span>Hidden from public (Shadowbanned)</span>
                </div>
              )}
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700 dark:text-stone-300">
                {currentContent}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-1.5 ml-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <button type="button" onClick={() => void handleToggleLike()} disabled={isReacting} className={`${actionButtonClass} disabled:opacity-50 ${isLiked ? "text-orange-500 dark:text-orange-400" : ""}`}>
            <Heart size={iconSize} className={isLiked ? "fill-current" : ""} />
            {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
          </button>

          {depth < maxDepth && (
            <button type="button" onClick={() => setIsReplying((current) => !current)} className={actionButtonClass}>
              <MessageSquare size={iconSize} /> {isReplying ? "Cancel reply" : "Reply"}
            </button>
          )}

          {canDelete && !isEditing && (
            <>
              <button type="button" onClick={() => { setEditContent(currentContent); setIsEditing(true); }} className={actionButtonClass}>
                <Pencil size={iconSize} /> Edit
              </button>
              <button type="button" onClick={() => void handleDeleteSelf()} className={actionButtonClass}>
                <Trash2 size={iconSize} /> Delete
              </button>
            </>
          )}
        </div>

        {isReplying && (
          <form className="mt-3 flex min-w-0 items-center gap-2" onSubmit={(event) => { event.preventDefault(); void handleSubmitReply(); }}>
            <input
              autoFocus
              type="text"
              placeholder={`Reply to ${comment.author.username}…`}
              value={replyText}
              maxLength={2500}
              onChange={(event) => setReplyText(event.target.value)}
              disabled={isSubmittingReply}
              className="min-w-0 flex-1 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-60 dark:border-white/10 dark:bg-[#0B192C] dark:text-white dark:focus:border-orange-500/50 dark:focus:ring-orange-500/20"
            />
            <button type="submit" disabled={!replyText.trim() || isSubmittingReply} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50">
              {isSubmittingReply ? <LoaderCircle size={14} className="animate-spin" /> : <span>Post</span>}
            </button>
          </form>
        )}

        {comment.replyCount > 0 && !showReplies && (
          <button type="button" onClick={() => void handleFetchReplies()} disabled={isLoadingReplies} className="mt-2 inline-flex items-center gap-2 rounded-md py-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-60">
            <span className="h-px w-5 bg-orange-300 dark:bg-orange-700" />
            {isLoadingReplies ? <><LoaderCircle size={13} className="animate-spin" /> Loading replies…</> : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
          </button>
        )}

        {showReplies && (
          <div className="mt-1">
            {replies.map((reply) => (
              <CommentThread key={reply.id} comment={reply} postId={postId} postAuthorId={postAuthorId} depth={depth + 1} onDelete={handleChildDeleted} />
            ))}
            {isLoadingReplies && replies.length === 0 && (
              <div className="flex items-center gap-2 py-3 text-xs text-stone-500 dark:text-stone-400">
                <LoaderCircle size={14} className="animate-spin text-orange-500" /> Loading replies…
              </div>
            )}
            {nextCursor && (
              <button type="button" onClick={() => void handleFetchReplies(nextCursor)} disabled={isLoadingReplies} className="mt-2 rounded-md px-1 py-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-60">
                {isLoadingReplies ? "Loading…" : "Show more replies"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}