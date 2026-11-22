import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, ExternalLink, Link2, X } from "lucide-react";
import { usePostShare } from "@/features/posts/hooks/usePostShare";

interface PostShareDialogProps {
  postId: string;
  postTitle?: string;
  open: boolean;
  onClose: () => void;
}

export default function PostShareDialog({ postId, postTitle, open, onClose }: PostShareDialogProps) {
  const { isSharing, sharePost } = usePostShare(postId);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setError(null);
      setShareUrl("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleCopyLink = async () => {
    setError(null);
    setCopied(false);
    try {
      const result = await sharePost("copy");
      await navigator.clipboard.writeText(result.url);
      setShareUrl(result.url);
      setCopied(true);
    } catch (cause) {
      console.error("Failed to copy post link:", cause);
      setError("Could not copy the link.");
    }
  };

  const handleNativeShare = async () => {
    setError(null);
    setCopied(false);
    try {
      const result = await sharePost("native");
      setShareUrl(result.url);
      if (typeof navigator.share !== "function") {
        await navigator.clipboard.writeText(result.url);
        setCopied(true);
        return;
      }
      await navigator.share({
        title: postTitle || "Check out this post",
        url: result.url,
      });
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      console.error("Failed to share post:", cause);
      setError("Sharing failed. Please try copying the link instead.");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-white/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#15233B]/95 sm:p-6 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400">
              <Link2 size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#0B192C] dark:text-white">
                Share post
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Share this post with others
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {postTitle && (
          <p className="mt-4 line-clamp-2 break-words rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 dark:border-white/10 dark:bg-black/20 dark:text-stone-300">
            {postTitle}
          </p>
        )}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            disabled={isSharing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-stone-200 dark:hover:bg-white/5"
          >
            {copied ? (
              <Check size={18} className="text-green-500" aria-hidden="true" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}
            {isSharing ? "Preparing link…" : copied ? "Link copied" : "Copy link"}
          </button>

          <button
            type="button"
            onClick={() => void handleNativeShare()}
            disabled={isSharing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600 shadow-md shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ExternalLink size={18} aria-hidden="true" />
            {isSharing ? "Preparing share…" : "Share using your device"}
          </button>
        </div>

        {shareUrl && (
          <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-white/10 dark:bg-black/20">
            <p className="mb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
              Share link
            </p>
            <p className="break-all text-xs leading-5 text-stone-700 dark:text-stone-300">
              {shareUrl}
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
      </section>
    </div>,
    document.body
  );
}