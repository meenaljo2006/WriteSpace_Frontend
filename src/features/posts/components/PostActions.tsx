import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";

interface PostActionsProps {
  isLiked: boolean;
  isSaved?: boolean;
  isLiking?: boolean;
  isSaving?: boolean;
  isSharing?: boolean;
  onLike: () => void;
  onSave?: () => void;
  onComment: () => void;
  onShare: () => void;
}

const actionClass =
  "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3";

const inactiveActionClass =
  "text-stone-500 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 bg-transparent";

export default function PostActions({
  isLiked,
  isSaved = false,
  isLiking = false,
  isSaving = false,
  isSharing = false,
  onLike,
  onSave,
  onComment,
  onShare,
}: PostActionsProps) {
  const actionsClass = onSave ? "grid-cols-4" : "grid-cols-3";

  return (
    <div
      className={`grid ${actionsClass} gap-1 border-t border-stone-200/60 pt-3 dark:border-white/10 sm:gap-2`}
      aria-label="Post actions"
    >
      <button
        type="button"
        onClick={onLike}
        disabled={isLiking}
        aria-pressed={isLiked}
        className={`${actionClass} ${
          isLiked
            ? "text-orange-500 bg-transparent dark:text-orange-400"
            : inactiveActionClass
        }`}
      >
        <Heart
          size={18}
          aria-hidden="true"
          className={`shrink-0 ${isLiked ? "fill-current" : ""}`}
        />
        <span>{isLiking ? "Liking…" : "Like"}</span>
      </button>

      <button
        type="button"
        onClick={onComment}
        className={`${actionClass} ${inactiveActionClass}`}
      >
        <MessageCircle size={18} aria-hidden="true" className="shrink-0" />
        <span>Comment</span>
      </button>

      <button
        type="button"
        onClick={onShare}
        disabled={isSharing}
        className={`${actionClass} ${inactiveActionClass}`}
      >
        <Share2 size={18} aria-hidden="true" className="shrink-0" />
        <span>{isSharing ? "Sharing…" : "Share"}</span>
      </button>

      {onSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          aria-pressed={isSaved}
          className={`${actionClass} ${
            isSaved
              ? "text-orange-500 bg-transparent dark:text-orange-400"
              : inactiveActionClass
          }`}
        >
          <Bookmark
            size={18}
            aria-hidden="true"
            className={`shrink-0 ${isSaved ? "fill-current" : ""}`}
          />
          <span>{isSaving ? "Saving…" : isSaved ? "Saved" : "Save"}</span>
        </button>
      )}
    </div>
  );
}