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
    <main className="w-full h-full bg-transparent pb-10">
      <div className="mx-auto w-full max-w-3xl">
        
        {/* Back Button  */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-500 transition-colors hover:text-orange-500 dark:text-stone-400 dark:hover:text-orange-400 "
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Loading State */}
        {isLoading && (
          <div
            className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-8 text-stone-600 shadow-[0_8px_30px_rgb(249,115,22,0.06)] backdrop-blur-md dark:border-white/10 dark:bg-[#15233B]/70 dark:text-stone-300"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle size={30} className="animate-spin text-orange-500" />
            <p className="font-medium">Loading post...</p>
          </div>
        )}

        {/* Error State  */}
        {!isLoading && error && (
          <section
            className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center backdrop-blur-md shadow-lg"
            role="alert"
          >
            <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />

            <h1 className="text-lg font-bold text-[#0B192C] dark:text-white">
              Unable to load this post
            </h1>

            <p className="mt-2 wrap-break-words text-sm text-stone-600 dark:text-stone-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </section>
        )}

        {/* Post Content */}
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