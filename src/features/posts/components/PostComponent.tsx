import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Heart, 
  MessageSquare,
  Share2,
  MoreHorizontal,
  Link as LinkIcon,
  X,
  Trash2,
  UserPlus,
  Pencil,
} from "lucide-react";
import {
  FaXTwitter,
  FaLinkedinIn,
  FaFacebookF,
  FaWhatsapp,
  FaRedditAlien,
} from "react-icons/fa6";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import type { Post } from "@/types/api.types";
import { InteractionsAPI } from "@/features/interactions/interactions.api";
import { PostsAPI } from "@/features/posts/posts.api";
import CommentSection from "./CommentSection";
import CreatePostEditor from "./CreatePostEditor";

import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubLight } from "@uiw/codemirror-theme-github";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { sql } from "@codemirror/lang-sql";
import { java } from "@codemirror/lang-java";

interface ExtendedAuthor {
  id: string;
  username: string;
  fullname?: string;
  profileImageUrl?: string | null;
  headline?: string;
  isFollowingByMe?: boolean;
}

interface ExtendedPost extends Omit<Post, "author"> {
  author: ExtendedAuthor;
  isLiked?: boolean;
}

interface PostComponentProps {
  post: ExtendedPost;
  onPostDeleted?: (postId: string) => void;
}

interface ParsedCodeSnippet {
  language: string;
  code: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const resolveMediaUrl = (url: string): string => {
  if (!url || !url.startsWith("/")) {
    return url;
  }

  try {
    const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
    return `${apiOrigin}${url}`;
  } catch {
    return url;
  }
};

const PostComponent: React.FC<PostComponentProps> = ({
  post,
  onPostDeleted,
}) => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 480;

  const [currentPost, setCurrentPost] = useState<ExtendedPost>(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isLoadingEditPost, setIsLoadingEditPost] = useState(false);

  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

  const [isFollowing, setIsFollowing] = useState(
    currentPost.author?.isFollowingByMe || false,
  );
  const [isLiked, setIsLiked] = useState(
    currentPost.isLikedByMe || currentPost.isLiked || false,
  );
  const [likesCount, setLikesCount] = useState(currentPost.likeCount || 0);
  const [sharesCount, setSharesCount] = useState(currentPost.shareCount || 0);
  const [isLikePending, setIsLikePending] = useState(false);

  useEffect(() => {
    setIsLiked(currentPost.isLikedByMe || currentPost.isLiked || false);
    setLikesCount(currentPost.likeCount || 0);
    setSharesCount(currentPost.shareCount || 0);
    setIsFollowing(currentPost.author?.isFollowingByMe || false);
  }, [
    currentPost.id,
    currentPost.isLikedByMe,
    currentPost.isLiked,
    currentPost.likeCount,
    currentPost.shareCount,
    currentPost.author?.isFollowingByMe,
  ]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    () => `${window.location.origin}/post/${post.id}`,
  );
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFloatingHeart, setShowFloatingHeart] = useState(false);

  const lastTapRef = useRef<number>(0);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const floatingHeartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setShareUrl(`${window.location.origin}/post/${post.id}`);
  }, [post.id]);

  useEffect(() => {
    return () => {
      if (floatingHeartTimeoutRef.current) {
        clearTimeout(floatingHeartTimeoutRef.current);
      }
    };
  }, []);

  const rawTextLength = currentPost.content
    ? currentPost.content.replace(/<[^>]*>?/gm, "").length
    : 0;
  const isLongPost = rawTextLength > 200;
  const [isTextExpanded, setIsTextExpanded] = useState(!isLongPost);

  useEffect(() => {
    setIsTextExpanded(!isLongPost);
  }, [currentPost.id, isLongPost]);

  const isOwnPost = authUser?.id === currentPost.author?.id;

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.08)";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedText = isDark ? "#94a3b8" : "#64748b";
  
  const primaryAction = "#F97316"; 
  const tagBg = isDark ? "rgba(249, 115, 22, 0.15)" : "#ffedd5";

  useEffect(() => {
    document.body.style.overflow =
      isShareModalOpen || isEditing ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isShareModalOpen, isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target as Node)
      ) {
        setIsOptionsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authUser) {
      toast.error("Please log in to follow users.");
      return;
    }

    const authorId = currentPost.author.id;

    if (authUser.id === authorId) {
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      if (previousState) {
        await InteractionsAPI.unfollowUser(authorId);
        toast.success(
          `Unfollowed ${
            currentPost.author.fullname || currentPost.author.username
          }`,
        );
      } else {
        await InteractionsAPI.followUser(authorId);
        toast.success(
          `Following ${
            currentPost.author.fullname || currentPost.author.username
          }`,
        );
      }
    } catch (error) {
      setIsFollowing(previousState);
      console.error("Failed to update follow status:", error);
      toast.error("Failed to update follow status. Please try again.");
    }
  };

  const executeLike = async (forcedLike = false) => {
    if (isLikePending) {
      return;
    }

    if (!authUser) {
      toast.error("Please log in to like posts.");
      return;
    }

    const previousLikedState = isLiked;
    const previousLikesCount = likesCount;
    const willBeLiked = forcedLike ? true : !previousLikedState;

    if (previousLikedState && forcedLike) {
      return;
    }

    setIsLikePending(true);
    setIsLiked(willBeLiked);
    setLikesCount(Math.max(0, previousLikesCount + (willBeLiked ? 1 : -1)));

    try {
      const response = await PostsAPI.likePost(currentPost.id);
      const backendLiked = response.status === "liked";

      setIsLiked(backendLiked);
      setLikesCount(
        Math.max(
          0,
          previousLikesCount +
            (backendLiked === previousLikedState ? 0 : backendLiked ? 1 : -1),
        ),
      );
    } catch (error) {
      console.error("Failed to like post:", error);
      setIsLiked(previousLikedState);
      setLikesCount(previousLikesCount);
      toast.error("Failed to update like. Please try again.");
    } finally {
      setIsLikePending(false);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      void executeLike(true);
      setShowFloatingHeart(true);

      if (floatingHeartTimeoutRef.current) {
        clearTimeout(floatingHeartTimeoutRef.current);
      }

      floatingHeartTimeoutRef.current = setTimeout(() => {
        setShowFloatingHeart(false);
      }, 1000);
    } else {
      lastTapRef.current = now;
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await PostsAPI.deletePost(currentPost.id);
      setIsDeleted(true);
      toast.success("Post moved to trash.");

      onPostDeleted?.(currentPost.id);
    } catch (error: unknown) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post. Please try again.");
    }
  };

  const handleShareSubmit = async (platform: string) => {
    if (!authUser) {
      toast.error("Please log in to share posts.");
      return;
    }

    let popup: Window | null = null;

    if (platform !== "copy") {
      popup = window.open("about:blank", "_blank");

      if (popup) {
        popup.opener = null;
      }
    }

    try {
      const result = await PostsAPI.sharePost(currentPost.id, platform);
      const canonicalUrl = result.url;

      if (!canonicalUrl) {
        throw new Error("The server did not return a share URL.");
      }

      setShareUrl(canonicalUrl);
      setSharesCount((count) => count + 1);

      if (platform === "copy") {
        await navigator.clipboard.writeText(canonicalUrl);
        setIsShareModalOpen(false);
        toast.success("Link copied to clipboard!");
        return;
      }

      const encodedUrl = encodeURIComponent(canonicalUrl);
      const encodedTitle = encodeURIComponent(
        currentPost.title || "Check out this post on WriteSpace",
      );

      const shareTargets: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      };

      const targetUrl = shareTargets[platform];

      if (popup && targetUrl) {
        popup.location.href = targetUrl;
      } else if (popup) {
        popup.close();
      } else if (targetUrl) {
        window.open(
          targetUrl,
          "_blank",
          "noopener,noreferrer,width=600,height=400",
        );
      }

      setIsShareModalOpen(false);
    } catch (error: unknown) {
      if (popup && !popup.closed) {
        popup.close();
      }

      console.error("Failed to share post:", error);
      toast.error("Failed to share this post. Please try again.");
    }
  };

  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "python":
        return [python()];
      case "typescript":
        return [javascript({ typescript: true })];
      case "java":
        return [java()];
      case "cpp":
        return [cpp()];
      case "rust":
        return [rust()];
      case "go":
        return [go()];
      case "sql":
        return [sql()];
      default:
        return [javascript()];
    }
  };

  const renderImageGrid = (media: string[]) => {
    if (!media || media.length === 0) {
      return null;
    }

    const count = media.length;
    let gridTemplate = "1fr";

    if (count === 2) gridTemplate = "1fr 1fr";
    if (count === 3) gridTemplate = "1fr 1fr 1fr";
    if (count >= 4) gridTemplate = "1fr 1fr";

    return (
      <div
        style={{
          display: "grid",
          gap: "4px",
          marginTop: "12px",
          gridTemplateColumns: gridTemplate,
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {media.slice(0, 4).map((img, idx) => {
          const imgSrc = resolveMediaUrl(img);

          return (
            <div
              key={`${img}-${idx}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(imgSrc);
              }}
              style={{
                position: "relative",
                paddingTop: count === 1 ? "56.25%" : "100%",
                backgroundColor: isDark ? "#000" : "#f1f5f9",
                cursor: "pointer",
              }}
            >
              <img
                src={imgSrc}
                alt={`Post media ${idx + 1}`}
                loading="lazy"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {idx === 3 && count > 4 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  +{count - 4}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isDeleted) {
    return null;
  }

  const profileLink = isOwnPost
    ? "/profile"
    : `/profile/${currentPost.author?.username}`;

  const coverImageSrc = currentPost.coverImageUrl
    ? resolveMediaUrl(currentPost.coverImageUrl)
    : null;

  const snippets: ParsedCodeSnippet[] = (currentPost.codeSnippets || []).map(
    (snippet: unknown) => {
      if (typeof snippet === "object" && snippet !== null) {
        const record = snippet as Record<string, unknown>;

        return {
          language:
            typeof record.language === "string" ? record.language : "text",
          code: typeof record.code === "string" ? record.code : "",
        };
      }

      return { language: "text", code: "" };
    },
  );

  return (
    <>
      <div
        style={{
          backgroundColor: cardBg,
          borderRadius: "12px",
          border: `1px solid ${borderColor}`,
          color: textColor,
          padding: isMobile ? "16px" : "20px",
          marginBottom: "16px",
          boxShadow: isDark
            ? "0 4px 6px rgba(0,0,0,0.1)"
            : "0 1px 3px rgba(0,0,0,0.05)",
          fontFamily: "Inter, sans-serif",
          width: "100%",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              minWidth: 0,
              flex: 1,
            }}
          >
            <Link to={profileLink} style={{ textDecoration: "none" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: isDark ? "#334155" : "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={
                    currentPost.author?.profileImageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentPost.author?.username || "User",
                    )}&background=random`
                  }
                  alt={currentPost.author?.username || "User"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </Link>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                flex: 1,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to={profileLink}
                  style={{
                    textDecoration: "none",
                    color: textColor,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {currentPost.author?.fullname ||
                      currentPost.author?.username ||
                      "Unknown User"}
                  </span>
                </Link>

                {!isOwnPost && (
                  <>
                    <span
                      style={{
                        color: mutedText,
                        fontSize: "0.8rem",
                      }}
                    >
                      •
                    </span>

                    <button
                      onClick={handleFollowToggle}
                      style={{
                        background: "none",
                        border: "none",
                        color: primaryAction,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {!isFollowing && <UserPlus size={14} />}
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </>
                )}
              </div>

              <span
                style={{
                  fontSize: "0.85rem",
                  color: mutedText,
                  marginTop: "2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentPost.author?.headline || "Software Engineer"}
              </span>

              <span
                style={{
                  fontSize: "0.75rem",
                  color: mutedText,
                  marginTop: "2px",
                }}
              >
                {new Date(currentPost.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                • {currentPost.readTime || 1} min read
              </span>
            </div>
          </div>

          <div style={{ position: "relative" }} ref={optionsMenuRef}>
            <button
              onClick={() => setIsOptionsMenuOpen((open) => !open)}
              aria-label="Post options"
              style={{
                background: "none",
                border: "none",
                color: mutedText,
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <MoreHorizontal size={20} />
            </button>

            {isOptionsMenuOpen && isOwnPost && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 10,
                  width: "160px",
                  overflow: "hidden",
                }}
              >
                <button
                  disabled={isLoadingEditPost}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setIsOptionsMenuOpen(false);
                    setIsLoadingEditPost(true);

                    try {
                      const fullPost = await PostsAPI.getPostById(
                        currentPost.id,
                      );

                      setEditingPost(fullPost);
                      setIsEditing(true);
                    } catch (error) {
                      console.error("Failed to load post for editing:", error);
                      toast.error("Failed to load post for editing.");
                    } finally {
                      setIsLoadingEditPost(false);
                    }
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    background: "none",
                    border: "none",
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <Pencil size={16} />
                  {isLoadingEditPost ? "Loading..." : "Edit Post"}
                </button>

                <button
                  onClick={() => void handleDeletePost()}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={16} />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* POST BODY */}
        <div
          onClick={handleDoubleTap}
          style={{ position: "relative", cursor: "default" }}
        >
          <AnimatePresence>
            {showFloatingHeart && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 0 }}
                animate={{ opacity: 1, scale: 1.5, y: -20 }}
                exit={{ opacity: 0, scale: 2, y: -40 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "40%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 20,
                  pointerEvents: "none",
                }}
              >
                <Heart fill="#ef4444" color="#ef4444" size={80} />
              </motion.div>
            )}
          </AnimatePresence>

          {currentPost.title && (
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: textColor,
                margin: "0 0 8px 0",
                lineHeight: "1.4",
              }}
            >
              {currentPost.title}
            </h2>
          )}

          {currentPost.subtitle && (
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.5",
                color: mutedText,
                margin: "0 0 12px 0",
                fontWeight: 500,
              }}
            >
              {currentPost.subtitle}
            </p>
          )}

          {coverImageSrc && (
            <div
              style={{
                marginBottom: "14px",
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: isDark ? "#0f172a" : "#f1f5f9",
              }}
            >
              <img
                src={coverImageSrc}
                alt={
                  currentPost.coverImageAltText ||
                  currentPost.title ||
                  "Post cover"
                }
                style={{
                  width: "100%",
                  maxHeight: "320px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          )}

          {currentPost.content && (
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                className="tiptap-content"
                style={{
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  color: isDark ? "rgba(255,255,255,0.9)" : "#334155",
                  wordBreak: "break-word",
                  display: isTextExpanded ? "block" : "-webkit-box",
                  WebkitLineClamp: isTextExpanded ? "unset" : 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                dangerouslySetInnerHTML={{
                  __html: currentPost.content,
                }}
              />

              {!isTextExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTextExpanded(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: mutedText,
                    cursor: "pointer",
                    padding: "4px 0",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  ...see more
                </button>
              )}
            </div>
          )}

          <div style={{ pointerEvents: "auto" }}>
            {renderImageGrid(currentPost.media || [])}
          </div>

          {snippets.length > 0 && (
            <div
              style={{
                pointerEvents: "auto",
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {snippets.map((snippet, index) => (
                <div
                  key={index}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: `1px solid ${borderColor}`,
                    boxShadow: isDark
                      ? "0 4px 6px rgba(0,0,0,0.3)"
                      : "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isDark ? "#0d1117" : "#f1f5f9",
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      color: mutedText,
                      fontWeight: 600,
                      borderBottom: `1px solid ${borderColor}`,
                      textTransform: "uppercase",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{snippet.language}</span>
                  </div>

                  <CodeMirror
                    value={snippet.code}
                    theme={isDark ? vscodeDark : githubLight}
                    extensions={getLanguageExtension(snippet.language)}
                    editable={false}
                    readOnly
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: false,
                      highlightActiveLine: false,
                    }}
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              ))}
            </div>
          )}

          {currentPost.tags && currentPost.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "16px",
                flexWrap: "wrap",
                zIndex: 1,
                position: "relative",
              }}
            >
              {currentPost.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    color: primaryAction,
                    backgroundColor: tagBg,
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* METRICS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            paddingBottom: "8px",
            borderBottom: `1px solid ${borderColor}`,
            fontSize: "0.8rem",
            color: mutedText,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                backgroundColor: primaryAction,
                borderRadius: "50%",
                padding: "4px",
                display: "flex",
              }}
            >
              <Heart size={10} color="#fff" fill="#fff" />
            </div>
            <span>{likesCount}</span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <span>{currentPost.commentCount || 0} comments</span>
            <span>{sharesCount} shares</span>
          </div>
        </div>

        {/* ACTION BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "4px",
            paddingTop: "4px",
          }}
        >
          <button
            disabled={isLikePending}
            onClick={() => void executeLike(false)}
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: isLiked ? primaryAction : mutedText,
              fontSize: "0.9rem",
              fontWeight: 600,
              padding: "12px 8px",
              borderRadius: "8px",
              cursor: isLikePending ? "wait" : "pointer",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = primaryAction;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = isLiked ? primaryAction : mutedText;
            }}
          >
            <Heart
              size={20}
              fill={isLiked ? primaryAction : "none"}
              color={isLiked ? primaryAction : mutedText}
            />
            {!isMobile && <span>Like</span>}
          </button>

          <button
            onClick={() => setShowComments((visible) => !visible)}
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: mutedText,
              fontSize: "0.9rem",
              fontWeight: 600,
              padding: "12px 8px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = primaryAction;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = mutedText;
            }}
          >
            <MessageSquare size={20} />
            {!isMobile && <span>Comment</span>}
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: mutedText,
              fontSize: "0.9rem",
              fontWeight: 600,
              padding: "12px 8px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = primaryAction;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = mutedText;
            }}
          >
            <Share2 size={20} />
            {!isMobile && <span>Share</span>}
          </button>
        </div>

        {/* FIX: Yahan postAuthorId add kar diya hai error hatane ke liye */}
        {showComments && (
          <CommentSection
            postId={currentPost.id}
            postAuthorUsername={currentPost.author?.username || ""}
            postAuthorId={currentPost.author?.id || ""}
          />
        )}
      </div>

      {/* SHARE MODAL */}
      {isShareModalOpen &&
        createPortal(
          <div
            onClick={() => setIsShareModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeIn 0.2s",
              padding: "16px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: cardBg,
                borderRadius: "16px",
                width: "100%",
                maxWidth: "420px",
                padding: "24px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: textColor,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  }}
                >
                  Share Post
                </h3>

                <button
                  onClick={() => setIsShareModalOpen(false)}
                  aria-label="Close share dialog"
                  style={{
                    background: "none",
                    border: "none",
                    color: mutedText,
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "16px",
                  marginBottom: "24px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => void handleShareSubmit("twitter")}
                  style={shareButtonStyle}
                >
                  <div
                    style={{
                      ...shareIconStyle,
                      backgroundColor: isDark ? "#ffffff" : "#000000",
                      color: isDark ? "#000000" : "#ffffff",
                    }}
                  >
                    <FaXTwitter size={24} />
                  </div>
                  <span style={{ ...shareLabelStyle, color: textColor }}>
                    X (Twitter)
                  </span>
                </button>

                <button
                  onClick={() => void handleShareSubmit("linkedin")}
                  style={shareButtonStyle}
                >
                  <div
                    style={{
                      ...shareIconStyle,
                      backgroundColor: "#0A66C2",
                      color: "white",
                    }}
                  >
                    <FaLinkedinIn size={24} />
                  </div>
                  <span style={{ ...shareLabelStyle, color: textColor }}>
                    LinkedIn
                  </span>
                </button>

                <button
                  onClick={() => void handleShareSubmit("facebook")}
                  style={shareButtonStyle}
                >
                  <div
                    style={{
                      ...shareIconStyle,
                      backgroundColor: "#1877F2",
                      color: "white",
                    }}
                  >
                    <FaFacebookF size={24} />
                  </div>
                  <span style={{ ...shareLabelStyle, color: textColor }}>
                    Facebook
                  </span>
                </button>

                <button
                  onClick={() => void handleShareSubmit("whatsapp")}
                  style={shareButtonStyle}
                >
                  <div
                    style={{
                      ...shareIconStyle,
                      backgroundColor: "#25D366",
                      color: "white",
                    }}
                  >
                    <FaWhatsapp size={24} />
                  </div>
                  <span style={{ ...shareLabelStyle, color: textColor }}>
                    WhatsApp
                  </span>
                </button>

                <button
                  onClick={() => void handleShareSubmit("reddit")}
                  style={shareButtonStyle}
                >
                  <div
                    style={{
                      ...shareIconStyle,
                      backgroundColor: "#FF4500",
                      color: "white",
                    }}
                  >
                    <FaRedditAlien size={24} />
                  </div>
                  <span style={{ ...shareLabelStyle, color: textColor }}>
                    Reddit
                  </span>
                </button>
              </div>

              <div
                style={{
                  borderTop: `1px solid ${borderColor}`,
                  paddingTop: "20px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "0.85rem",
                    color: mutedText,
                    fontWeight: 600,
                  }}
                >
                  Or copy link
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    padding: "4px 4px 4px 12px",
                  }}
                >
                  <LinkIcon
                    size={16}
                    color={mutedText}
                    style={{ flexShrink: 0 }}
                  />

                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    aria-label="Post share link"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "transparent",
                      border: "none",
                      color: textColor,
                      outline: "none",
                      padding: "8px",
                      fontSize: "0.85rem",
                      textOverflow: "ellipsis",
                    }}
                  />

                  <button
                    onClick={() => void handleShareSubmit("copy")}
                    style={{
                      backgroundColor: primaryAction,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* IMAGE LIGHTBOX */}
      {selectedImage &&
        createPortal(
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.9)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeIn 0.2s",
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              aria-label="Close image preview"
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                borderRadius: "50%",
                padding: "8px",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>

            <img
              src={selectedImage}
              alt="Expanded post media"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}

      {/* EDIT POST MODAL */}
      {isEditing && editingPost && (
        <CreatePostEditor
          editPost={editingPost}
          onCloseEdit={() => {
            setIsEditing(false);
            setEditingPost(null);
          }}
          onPostUpdated={(updatedPost) => {
            setCurrentPost((previous) => ({
              ...previous,
              ...updatedPost,
            }));
            setEditingPost(null);
            setIsEditing(false);
            toast.success("Post updated successfully.");
          }}
        />
      )}
    </>
  );
};

const shareButtonStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  background: "none",
  border: "none",
  cursor: "pointer",
};

const shareIconStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.2s",
};

const shareLabelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
};

export default PostComponent;