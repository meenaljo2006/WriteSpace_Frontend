import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, FileText } from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { UsersAPI } from "@/features/users/api/users.api";
import type { UserSearchResult } from "@/features/users/api/users.api";
import { SearchAPI } from "@/features/search/api/search.api";
import type { SearchPostResult } from "@/features/search/types/search.types";

interface SearchComponentProps {
  isMobile?: boolean;
  autoFocus?: boolean;
  onCloseMobile?: () => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ isMobile, autoFocus, onCloseMobile }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [postResults, setPostResults] = useState<SearchPostResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const iconColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.6)";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API Call
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const q = searchQuery.trim();

      if (q.length < 2) {
        setUserResults([]);
        setPostResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);

      // Users search is required — the existing experience depends on it.
      // Post search uses the AI backend and can fail independently (Ollama
      // down, no embeddings yet, etc.). Never let it break user search.
      const [usersOutcome, postsOutcome] = await Promise.allSettled([
        UsersAPI.searchUsers(q),
        SearchAPI.searchPosts({ q, limit: 5 }),
      ]);

      if (usersOutcome.status === "fulfilled") {
        setUserResults(usersOutcome.value);
      } else {
        console.error("User search failed", usersOutcome.reason);
        setUserResults([]);
      }

      if (postsOutcome.status === "fulfilled") {
        setPostResults(postsOutcome.value.results);
      } else {
        console.error("Post search failed", postsOutcome.reason);
        setPostResults([]);
      }

      setShowDropdown(true);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (username: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (onCloseMobile) onCloseMobile();
    navigate(`/profile/${username}`);
  };

  const handlePostClick = (postId: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (onCloseMobile) onCloseMobile();
    navigate(`/post/${postId}`);
  };

  return (
    <div ref={searchContainerRef} style={{ position: "relative", width: "100%", flex: isMobile ? 1 : "unset" }}>
      
      {/* THE INPUT FIELD */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: isMobile ? "0" : "6px 12px",
          width: "100%",
          background: isMobile ? "transparent" : (isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.04)"),
          borderRadius: "4px",
          border: isMobile ? "none" : (isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)"),
          transition: "background-color 0.3s ease",
        }}
      >
        {!isMobile && <Search size={16} color={iconColor} />}
        <input
          autoFocus={autoFocus}
          type="text"
          placeholder="Search Writespace..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.length >= 2) setShowDropdown(true);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: textColor,
            outline: "none",
            width: "100%",
            fontSize: isMobile ? "1rem" : "0.85rem",
          }}
        />
      </div>

      {/* THE DROPDOWN */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? "calc(100% + 20px)" : "calc(100% + 8px)",
            left: isMobile ? "-40px" : 0, 
            right: 0,
            width: isMobile ? "calc(100vw - 32px)" : "100%", 
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${borderColor}`,
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            overflow: "hidden",
            zIndex: 1001,
            maxHeight: "350px",
            overflowY: "auto",
          }}
        >
          {isSearching ? (
            <div
              style={{
                padding: "16px",
                display: "flex",
                justifyContent: "center",
                color: mutedText,
              }}
            >
              <Loader2
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : userResults.length === 0 && postResults.length === 0 ? (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                color: mutedText,
                fontSize: "0.85rem",
              }}
            >
              No results for "{searchQuery}"
            </div>
          ) : (
            <div>
              {/* ---------- Users section ---------- */}
              {userResults.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: "8px 16px 4px 16px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: mutedText,
                    }}
                  >
                    People
                  </div>

                  {userResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result.username)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 16px",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.02)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: "#e2e8f0",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={
                            result.profileImageUrl ||
                            `https://ui-avatars.com/api/?name=${result.username}`
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          alt={result.username}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: textColor,
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                        >
                          {result.fullname}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: mutedText }}>
                          @{result.username}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------- Posts section ---------- */}
              {postResults.length > 0 && (
                <div
                  style={{
                    borderTop:
                      userResults.length > 0
                        ? `1px solid ${borderColor}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 16px 4px 16px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: mutedText,
                    }}
                  >
                    Posts
                  </div>

                  {postResults.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "10px 16px",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.02)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          backgroundColor: isDark
                            ? "rgba(99,102,241,0.15)"
                            : "rgba(99,102,241,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <FileText size={13} color="#6366f1" />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          minWidth: 0,
                          gap: "2px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: textColor,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {post.title}
                        </span>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: mutedText,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {post.excerpt || post.subtitle || "—"}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: mutedText }}>
                          by {post.author.fullname || post.author.username}
                          {post.readTime ? ` · ${post.readTime} min read` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------- View all footer ---------- */}
              <div
                onClick={() => {
                  setShowDropdown(false);
                  if (onCloseMobile) onCloseMobile();
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }}
                style={{
                  padding: "10px 16px",
                  textAlign: "center",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#6366f1",
                  cursor: "pointer",
                  borderTop: `1px solid ${borderColor}`,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = isDark
                    ? "rgba(99,102,241,0.08)"
                    : "rgba(99,102,241,0.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                View all results for "{searchQuery.trim()}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;