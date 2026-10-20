import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FileText, LoaderCircle, Search as SearchIcon, AlertCircle } from "lucide-react";

import { useTheme } from "@/app/providers/ThemeProvider";
import { SearchAPI } from "@/features/search/api/search.api";
import type { SearchPostResult } from "@/features/search/types/search.types";

const PAGE_SIZE = 20;

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SearchPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [input, setInput] = useState(query);
  const [results, setResults] = useState<SearchPostResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";

  // Keep the input synced to the URL when the user navigates (e.g. from the header).
  useEffect(() => {
    setInput(query);
  }, [query]);

  const fetchPage = useCallback(
    async (q: string, newOffset: number, append: boolean) => {
      if (!q.trim()) {
        setResults([]);
        setHasMore(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await SearchAPI.searchPosts({
          q,
          limit: PAGE_SIZE,
          offset: newOffset,
        });

        setResults((prev) =>
          append ? [...prev, ...response.results] : response.results,
        );
        setOffset(newOffset);
        setHasMore(response.results.length === PAGE_SIZE);
      } catch (err: unknown) {
        console.error("Search page failed:", err);
        setError("Search is temporarily unavailable. Please try again.");
        if (!append) setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchPage(query, 0, false);
  }, [query, fetchPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        color: textColor,
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          Search
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "10px",
            }}
          >
            <SearchIcon size={18} color={mutedText} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search posts by meaning or keywords..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: textColor,
                fontSize: "0.95rem",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {error && (
          <div
            style={{
              padding: "16px",
              marginBottom: "16px",
              borderRadius: "10px",
              backgroundColor: isDark
                ? "rgba(239,68,68,0.1)"
                : "rgba(239,68,68,0.05)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {!query && (
          <p
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: mutedText,
            }}
          >
            Type a query to search across all posts.
          </p>
        )}

        {query && !isLoading && !error && results.length === 0 && (
          <p
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: mutedText,
            }}
          >
            No posts found for "{query}". Try different keywords.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              style={{
                display: "block",
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                color: textColor,
                textDecoration: "none",
                transition: "border-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#6366f1")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.borderColor = borderColor)
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "6px",
                }}
              >
                <FileText size={14} color="#6366f1" />
                <span style={{ fontSize: "0.75rem", color: mutedText }}>
                  {post.author.fullname || post.author.username}
                  {post.publishDate
                    ? ` · ${formatDate(post.publishDate)}`
                    : ""}
                  {post.readTime ? ` · ${post.readTime} min read` : ""}
                </span>
              </div>
              <h2
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                }}
              >
                {post.title}
              </h2>
              {(post.excerpt || post.subtitle) && (
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "0.88rem",
                    color: mutedText,
                    lineHeight: 1.5,
                  }}
                >
                  {post.excerpt || post.subtitle}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                >
                  {post.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        backgroundColor: isDark
                          ? "rgba(99,102,241,0.15)"
                          : "rgba(99,102,241,0.1)",
                        color: "#6366f1",
                        fontWeight: 600,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "24px",
              color: mutedText,
            }}
          >
            <LoaderCircle
              size={24}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {hasMore && !isLoading && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => void fetchPage(query, offset + PAGE_SIZE, true)}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                backgroundColor: "transparent",
                border: `1px solid ${borderColor}`,
                color: textColor,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Load more
            </button>
          </div>
        )}

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button
            onClick={() => navigate("/home")}
            style={{
              background: "transparent",
              border: "none",
              color: mutedText,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}