import { useEffect, useRef, useState } from "react";

import type { Post } from "@/features/posts/types/post.types";
import { PostsAPI } from "@/features/posts/api/posts.api";
import { usePostActions } from "@/features/posts/hooks/usePostActions";

import PostHeader from "@/features/posts/components/PostHeader";
import PostContext from "@/features/posts/components/PostContext";
import PostMediaGallery from "@/features/posts/components/PostMediaGallery";
import PostCodeSnippets from "@/features/posts/components/PostCodeSnippets";
import PostMetrics from "@/features/posts/components/PostMetrics";
import PostActions from "@/features/posts/components/PostActions";
import PostOptionsMenu from "@/features/posts/components/PostOptionsMenu";
import PostShareDialog from "@/features/posts/components/PostShareDialog";
import CommentSection from "@/features/posts/components/CommentSection";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  initialIsFollowing?: boolean;
  initialIsSaved?: boolean;
  viewMode?: "feed" | "detail";
  onEdit?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;

  /**
   * Called when the user unsaves a post from a context where saves are
   * the primary list (e.g. the saved-posts page). Not called on the
   * regular feed — feed items stay visible regardless of save state.
  */
  onUnsaved?: (postId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  initialIsFollowing = false,
  initialIsSaved = false,
  viewMode = "feed",
  onEdit,
  onPostDeleted,
  onUnsaved,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const commentsRef = useRef<HTMLDivElement>(null);

  const authorId = post.author?.id ?? "";
  const isOwner = Boolean(currentUserId && currentUserId === authorId);
  const canInteract = Boolean(currentUserId);
  const isDetailView = viewMode === "detail";

  const {
    isLiked,
    isFollowing,
    isSaved,
    isLiking,
    isFollowingLoading,
    isSaving,
    toggleLike,
    toggleFollow,
    toggleSave,
  } = usePostActions({
    postId: post.id,
    authorId,
    initialIsLiked: post.isLikedByMe ?? false,
    initialIsFollowing: post.author?.isFollowingByMe ?? initialIsFollowing,
    initialIsSaved: post.isSavedByMe ?? initialIsSaved,
  });

  useEffect(() => {
    setLikeCount(post.likeCount);
  }, [post.id, post.likeCount]);

  const handleToggleLike = async () => {
    setActionError(null);

    try {
      const wasLiked = isLiked;
      const isLikedAfterRequest = await toggleLike();

      if (isLikedAfterRequest !== wasLiked) {
        setLikeCount((count) =>
          Math.max(0, count + (isLikedAfterRequest ? 1 : -1)),
        );
      }
    } catch {
      setActionError("Couldn't update your reaction. Please try again.");
    }
  };

  const handleToggleFollow = async () => {
    setActionError(null);

    try {
      await toggleFollow();
    } catch {
      setActionError("Couldn't update your follow status. Please try again.");
    }
  };

  const handleToggleSave = async () => {
    setActionError(null);

    try {
      const isSavedNow = await toggleSave();

      // When the card lives inside a "saved posts" list, an unsave
      // should remove it from that list. The parent decides whether
      // to actually filter it out.
      if (!isSavedNow && onUnsaved) {
        onUnsaved(post.id);
      }
    } catch {
      setActionError("Couldn't update your saved posts. Please try again.");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Move this post to the trash? You may not be able to undo this action here.",
    );

    if (!confirmed || isDeleting) return;

    setActionError(null);
    setIsDeleting(true);

    try {
      await PostsAPI.deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch {
      setActionError("Couldn't delete this post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentsClick = () => {
    const shouldOpen = !showComments;
    setShowComments(shouldOpen);

    if (shouldOpen) {
      window.requestAnimationFrame(() => {
        commentsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    }
  };

  return (
    <article
      className={`min-w-0 rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md shadow-[0_8px_30px_rgb(249,115,22,0.06)] transition-all ${
        isDetailView ? "p-6 sm:p-8" : "p-4 hover:shadow-[0_8px_40px_rgb(249,115,22,0.12)] sm:p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <PostHeader
            post={post}
            isFollowing={isFollowing}
            isFollowingLoading={isFollowingLoading}
            onFollowToggle={
              canInteract && !isOwner && authorId
                ? () => void handleToggleFollow()
                : undefined
            }
            isOwnPost={isOwner}
          />
        </div>

        <PostOptionsMenu
          isOwner={isOwner}
          onEdit={onEdit ? () => onEdit(post) : undefined}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>

      <div className={isDetailView ? "mt-5" : "mt-3"}>
        <PostContext
          post={post}
          showFullContent={isDetailView}
          postDetailPath={isDetailView ? undefined : `/post/${post.id}`}
        />

        <PostMediaGallery post={post} />
        <PostCodeSnippets post={post} />
      </div>

      <div className="mt-4">
        <PostMetrics
          post={post}
          likeCount={likeCount}
          onCommentsClick={handleCommentsClick}
        />
      </div>

      <div className="mt-3">
        <PostActions
          isLiked={isLiked}
          isSaved={isSaved}
          isLiking={isLiking}
          isSaving={isSaving}
          onLike={() => void handleToggleLike()}
          onComment={handleCommentsClick}
          onShare={() => setShowShareDialog(true)}
          onSave={canInteract ? () => void handleToggleSave() : undefined}
        />
      </div>

      {actionError && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {actionError}
        </p>
      )}

      {showComments && (
        <div
          ref={commentsRef}
          className="mt-4 border-t border-stone-200/60 dark:border-white/10 pt-4"
        >
          <CommentSection
            postId={post.id}
            postAuthorUsername={post.author?.username ?? ""}
            postAuthorId={post.author?.id ?? ""}
          />
        </div>
      )}

      <PostShareDialog
        postId={post.id}
        postTitle={post.title}
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
    </article>
  );
}
