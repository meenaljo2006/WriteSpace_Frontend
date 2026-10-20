import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, LoaderCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { InteractionsAPI } from "@/features/interactions/interactions.api";
import PostCard from "@/features/posts/components/PostCard";
import ProfileSidebar from "@/features/users/components/profile/ProfileSidebar"; // ADDED
import TrendingSidebar from "@/features/posts/components/TrendingSidebar"; // ADDED
import type { Post } from "@/types/api.types";

const PAGE_SIZE = 20;

export default function SavedPostsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const mountedRef = useRef(false);
  const cursorRef = useRef<string | null>(null);

  const fetchPage = useCallback(async (reset: boolean) => {
    if (reset) {
      setIsLoading(true);
    } else {
      if (!cursorRef.current) return;
      setIsLoadingMore(true);
    }

    setError(null);

    try {
      const response = await InteractionsAPI.getSavedPosts(
        reset ? undefined : cursorRef.current ?? undefined,
        PAGE_SIZE,
      );

      if (!mountedRef.current) return;

      // Handle both array and object shapes
      const isArrayShape = Array.isArray(response);
      const incomingPosts = isArrayShape
        ? (response as any)
        : Array.isArray(response.posts)
        ? response.posts
        : [];
      const incomingCursor = isArrayShape ? null : response.nextCursor ?? null;

      setPosts((prev) => {
        if (reset) return incomingPosts;
        const existingIds = new Set(prev.map((p) => p.id));
        const fresh = incomingPosts.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...fresh];
      });

      cursorRef.current = incomingCursor;
      setNextCursor(incomingCursor);
    } catch (err: unknown) {
      console.error("Failed to load saved posts:", err);
      if (mountedRef.current) {
        setError("Couldn't load your saved posts. Please try again.");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    cursorRef.current = null;
    void fetchPage(true);

    return () => {
      mountedRef.current = false;
    };
  }, [fetchPage]);

  const handleUnsaved = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="min-h-screen bg-blue-50/40 dark:bg-slate-950">
      {/* USING THE SAME LAYOUT AS HOMEPAGE */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <ProfileSidebar />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <section className="min-w-0 space-y-6 lg:col-span-6">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: isDark
                    ? "rgba(99,102,241,0.15)"
                    : "rgba(99,102,241,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bookmark size={20} color="#6366f1" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                  Saved posts
                </h1>
                <p
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "0.85rem",
                    color: mutedText,
                  }}
                >
                  Posts you've bookmarked
                </p>
              </div>
            </div>

            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "60px 20px",
                  color: mutedText,
                }}
              >
                <LoaderCircle
                  size={28}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {!isLoading && error && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "12px",
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  textAlign: "center",
                }}
              >
                <p style={{ margin: "0 0 12px 0", color: "#ef4444" }}>{error}</p>
                <button
                  onClick={() => void fetchPage(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    backgroundColor: "transparent",
                    color: textColor,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !error && posts.length === 0 && (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "12px",
                  color: mutedText,
                }}
              >
                <Bookmark
                  size={40}
                  style={{ margin: "0 auto 12px auto", opacity: 0.3 }}
                />
                <p style={{ margin: 0, fontWeight: 600, color: textColor }}>
                  No saved posts yet
                </p>
                <p style={{ margin: "6px 0 16px 0", fontSize: "0.88rem" }}>
                  Tap the bookmark icon on any post to save it here.
                </p>
                <button
                  onClick={() => navigate("/home")}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#6366f1",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Browse posts
                </button>
              </div>
            )}

            {!isLoading && !error && posts.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    initialIsSaved
                    onUnsaved={handleUnsaved}
                  />
                ))}
              </div>
            )}

            {!isLoading && !error && nextCursor && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  onClick={() => void fetchPage(false)}
                  disabled={isLoadingMore}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    backgroundColor: "transparent",
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                    fontWeight: 600,
                    cursor: isLoadingMore ? "not-allowed" : "pointer",
                    opacity: isLoadingMore ? 0.6 : 1,
                  }}
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <TrendingSidebar />
            </div>
          </aside>
          
        </div>
      </main>
    </div>
  );
}