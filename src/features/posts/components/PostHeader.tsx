import { Link } from "react-router-dom";
import { CalendarDays, LoaderCircle } from "lucide-react";

import type { Post } from "@/features/posts/types/post.types";

interface PostHeaderProps {
  post: Post;
  isFollowing?: boolean;
  isFollowingLoading?: boolean;
  onFollowToggle?: () => void;
  isOwnPost?: boolean;
}

function formatPostDate(value?: string | Date | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function PostHeader({
  post,
  isFollowing = false,
  isFollowingLoading = false,
  onFollowToggle,
  isOwnPost = false,
}: PostHeaderProps) {
  const author = post.author;
  const displayName = author?.fullname || author?.username || "Writer";
  const username = author?.username;
  const avatarUrl = author?.profileImageUrl;
  const publishedAt = formatPostDate(post.publishDate || post.createdAt);

  return (
    <header className="flex min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {/* Avatar Wrapper - Warm colors */}
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100 dark:border-white/10 dark:bg-stone-800">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${displayName}'s profile`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-stone-600 dark:text-stone-300">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
              {displayName}
            </span>

            {username && (
              <Link
                to={`/profile/${encodeURIComponent(username)}`}
                className="truncate text-sm text-orange-500 transition hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                @{username}
              </Link>
            )}
          </div>

          {publishedAt && (
            <div className="mt-1 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <CalendarDays size={13} aria-hidden="true" />
              <time dateTime={String(post.publishDate || post.createdAt)}>
                {publishedAt}
              </time>

              {typeof post.readTime === "number" && post.readTime > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime} min read</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {!isOwnPost && onFollowToggle && (
        <button
          type="button"
          onClick={onFollowToggle}
          disabled={isFollowingLoading}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isFollowing
              ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
              : "border-orange-500 bg-orange-500 text-white hover:bg-orange-600 dark:border-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600 shadow-sm shadow-orange-500/20"
          }`}
        >
          {isFollowingLoading ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : isFollowing ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      )}
    </header>
  );
}