import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import PostCard from "@/features/posts/components/PostCard";
import { PostsAPI } from "@/features/posts/api/posts.api";
import type { Post } from "@/features/posts/types/post.types";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      if (!id) {
        setPost(null);
        setError("The post URL is missing a post ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await PostsAPI.getPostById(id);

        if (!cancelled) {
          setPost(result);
          
          PostsAPI.incrementViewCount(id)
            .then((viewResult) => {
              if (!cancelled && viewResult.recorded) {
                setPost((previous) =>
                  previous
                    ? { ...previous, viewCount: viewResult.viewCount }
                    : previous,
                );
              }
            })
            .catch((err: unknown) => {
              // View tracking must never break the page.
              console.error("View tracking failed:", err);
            });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setPost(null);
          setError(
            err instanceof Error
              ? err.message
              : "We couldn't load this post. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchPost();

    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  const handlePostDeleted = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  const handleEditPost = useCallback((_post: Post) => {
    // The edit flow will be connected to CreatePostEditor
    // in the post creation/editing batch.
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {isLoading && (
          <div
            className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-8 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle size={30} className="animate-spin" />
            <p>Loading post...</p>
          </div>
        )}

        {!isLoading && error && (
          <section
            className="rounded-xl border border-red-200 bg-white p-6 text-center dark:border-red-900 dark:bg-gray-900"
            role="alert"
          >
            <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />

            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Unable to load this post
            </h1>

            <p className="mt-2 wrap-break-words text-sm text-gray-600 dark:text-gray-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </section>
        )}

        {!isLoading && !error && post && (
          <PostCard
            post={post}
            currentUserId={user?.id}
            viewMode="detail"
            onEdit={handleEditPost}
            onPostDeleted={handlePostDeleted}
          />
        )}
      </div>
    </main>
  );
}
