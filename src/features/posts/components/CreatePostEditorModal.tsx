import React, { useState, useEffect, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Link as RouterLink } from "react-router-dom";
import {
  User,
  Image as ImageIcon,
  CodeXml,
  X,
  Send,
  CheckCircle,
  Loader2,
  Hash,
  Bold,
  Italic,
  Link as LinkIcon,
  Save,
  Sparkles,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { AIAPI, type PostAssistantResult } from "@/features/ai/ai.api";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import type { ApiError } from "@/types/ApiError";
import type { Post } from "@/types/api.types";

import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";

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

import { PostsAPI } from "@/features/posts/posts.api";

interface CreatePostEditorProps {
  onPostCreated?: (newPost: Post) => void;
  editPost?: Post;
  onCloseEdit?: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
  initiallyExpanded?: boolean;
  onCloseCreate?: () => void;
}

interface CodeSnippet {
  id: string;
  language: string;
  code: string;
}

interface DraftState {
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
  codeSnippets: CodeSnippet[];
}

const CreatePostEditor: React.FC<CreatePostEditorProps> = ({
  onPostCreated,
  editPost,
  onCloseEdit,
  onPostUpdated,
  initiallyExpanded = false,
  onCloseCreate,
}) => {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";
  const isEditMode = Boolean(editPost);

  const [isExpanded, setIsExpanded] = useState(isEditMode || initiallyExpanded);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"Saving..." | "Saved" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [postStatus, setPostStatus] = useState<"draft" | "scheduled" | "published">(
    editPost?.status === "scheduled" || editPost?.status === "published"
      ? editPost.status
      : "draft"
  );

  const [scheduledAt, setScheduledAt] = useState(
    editPost?.scheduledAt ? new Date(editPost.scheduledAt).toISOString().slice(0, 16) : ""
  );

  const [title, setTitle] = useState(editPost?.title || "");
  const [subtitle, setSubtitle] = useState(editPost?.subtitle || "");

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiResult, setAiResult] = useState<PostAssistantResult | null>(null);

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>(editPost?.media || []);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(editPost?.coverImageUrl || null);
  const [existingMediaPublicIds, setExistingMediaPublicIds] = useState<string[]>(editPost?.mediaPublicIds || []);

  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>(() =>
    (editPost?.codeSnippets || []).map((snippet) => ({
      id: crypto.randomUUID(),
      language: snippet.language,
      code: snippet.code,
    }))
  );

  const [tags, setTags] = useState<string[]>(editPost?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const linkColor = "#f97316"; 

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: `color: ${linkColor}; font-weight: bold; text-decoration: underline; cursor: pointer;`,
        },
      }),
      Placeholder.configure({
        placeholder: "Share your knowledge, code, or ideas...",
      }),
    ],
    content: editPost?.content || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[200px] text-stone-800 dark:text-stone-200 text-base leading-relaxed",
      },
    },
  });

  // Restore a saved draft when creating a new post.
  useEffect(() => {
    if (isEditMode) {
      setIsDraftLoaded(true);
      return;
    }
    if (!editor || isDraftLoaded) return;

    const savedDraft = localStorage.getItem("writespace_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as DraftState;
        if (parsed.title) setTitle(parsed.title);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
        if (Array.isArray(parsed.tags)) setTags(parsed.tags);
        if (Array.isArray(parsed.codeSnippets)) setCodeSnippets(parsed.codeSnippets);
        if (parsed.content) editor.commands.setContent(parsed.content);

        if (parsed.title || parsed.subtitle || parsed.content || parsed.tags?.length || parsed.codeSnippets?.length) {
          setDraftStatus("Saved");
        }
      } catch (error: unknown) {
        console.error("Failed to parse WriteSpace draft:", error);
        localStorage.removeItem("writespace_draft");
      }
    }
    setIsDraftLoaded(true);
  }, [editor, isDraftLoaded, isEditMode]);

  // Autosave the new-post draft.
  useEffect(() => {
    if (!isExpanded || !isDraftLoaded || isEditMode) return;

    const liveHtml = editor?.getHTML() || "";
    const liveText = editor?.getText() || "";
    const hasContent = Boolean(title.trim() || subtitle.trim() || liveText.trim() || codeSnippets.length || tags.length);

    if (!hasContent) {
      localStorage.removeItem("writespace_draft");
      setDraftStatus("");
      return;
    }

    setDraftStatus("Saving...");
    const saveTimer = window.setTimeout(() => {
      const draft: DraftState = { title, subtitle, content: liveHtml, tags, codeSnippets };
      localStorage.setItem("writespace_draft", JSON.stringify(draft));
      setDraftStatus("Saved");
    }, 1000);

    return () => window.clearTimeout(saveTimer);
  }, [title, subtitle, tags, codeSnippets, isExpanded, isDraftLoaded, isEditMode, editor]);

  // Lock background scrolling
  useEffect(() => {
    if (!isExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isExpanded]);

  const resetForm = () => {
    localStorage.removeItem("writespace_draft");
    setTitle("");
    setSubtitle("");
    setTags([]);
    setTagInput("");
    setPostStatus("draft");
    setScheduledAt("");
    mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    setMediaFiles([]);
    setMediaPreviews([]);
    setExistingMedia([]);
    setExistingMediaPublicIds([]);
    setCodeSnippets([]);
    editor?.commands.setContent("");
    setDraftStatus("");
    setIsExpanded(false);
    if (bannerPreview && bannerFile) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleDiscard = () => {
    if (isSubmitting) return;
    if (isEditMode) {
      onCloseEdit?.();
      return;
    }
    const liveText = editor?.getText() || "";
    const hasUnsavedContent = Boolean(
      title.trim() || subtitle.trim() || liveText.trim() || mediaFiles.length || codeSnippets.length || tags.length || existingMedia.length || bannerFile
    );
    if (hasUnsavedContent && !window.confirm("Discard draft?")) return;
    resetForm();
    onCloseCreate?.();
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!newTag) { setTagInput(""); return; }
      if (tags.includes(newTag)) { setTagInput(""); return; }
      if (tags.length >= 5) { toast.warning("Maximum 5 tags allowed."); return; }
      setTags((previous) => [...previous, newTag]);
      setTagInput("");
    } else if (event.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((previous) => previous.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((previous) => previous.filter((tag) => tag !== tagToRemove));
  };

  const handleGenerateAiSuggestions = async () => {
    const content = editor?.getText().trim() ?? "";
    if (!content) { toast.info("Write some content before generating AI suggestions."); return; }

    setIsAiLoading(true);
    setAiResult(null);
    try {
      const result = await AIAPI.generatePostAssistant({
        title: title.trim() || undefined,
        content,
        instruction: aiInstruction.trim() || undefined,
      });
      setAiResult(result);
      toast.success("AI suggestions generated.");
    } catch (error) {
      const message = error instanceof AxiosError ? (error.response?.data as { message?: string } | undefined)?.message : undefined;
      toast.error(message || "Unable to generate AI suggestions. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const finalHtml = editor?.getHTML() || "";
    const finalText = editor?.getText() || "";
    const finalTitle = title.trim();

    if (finalTitle.length < 5) { toast.error("Title must be at least 5 characters."); return; }
    if (finalText.trim().length < 10 && codeSnippets.length === 0 && mediaFiles.length === 0 && existingMedia.length === 0) {
      toast.error("Content must be at least 10 characters or include media/code."); return;
    }
    if (postStatus === "scheduled") {
      if (!scheduledAt) { toast.error("Please select a schedule date and time."); return; }
      const scheduledDate = new Date(scheduledAt);
      if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        toast.error("Scheduled time must be in the future."); return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", finalTitle);
      if (subtitle.trim()) formData.append("subtitle", subtitle.trim());
      formData.append("content", finalHtml);
      formData.append("status", postStatus);
      if (postStatus === "scheduled") formData.append("scheduledAt", new Date(scheduledAt).toISOString());
      if (bannerFile) formData.append("banner", bannerFile);
      if (tags.length > 0) formData.append("tags", JSON.stringify(tags));
      if (codeSnippets.length > 0) {
        const cleanSnippets = codeSnippets.map(({ language, code }) => ({ language, code }));
        formData.append("codeSnippets", JSON.stringify(cleanSnippets));
      }
      if (isEditMode) {
        existingMedia.forEach((url) => formData.append("existingMedia", url));
        existingMediaPublicIds.forEach((publicId) => formData.append("existingMediaPublicIds", publicId));
        if (existingMedia.length === 0 && existingMediaPublicIds.length === 0) {
          formData.append("existingMedia", JSON.stringify([]));
          formData.append("existingMediaPublicIds", JSON.stringify([]));
        }
      }
      mediaFiles.forEach((file) => formData.append("media", file));

      if (isEditMode && editPost) {
        const updatedPost = await PostsAPI.updatePost(editPost.id, formData);
        toast.success("Post updated successfully!");
        onPostUpdated?.(updatedPost);
        onCloseEdit?.();
      } else {
        const newPost = await PostsAPI.createPost(formData);
        if (postStatus === "draft") toast.success("Draft saved successfully!");
        else if (postStatus === "scheduled") toast.success("Post scheduled successfully!");
        else toast.success("Post published successfully!");
        resetForm();
        onPostCreated?.(newPost);
        onCloseCreate?.();
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      const actionText = postStatus === "draft" ? "save draft" : postStatus === "scheduled" ? "schedule post" : isEditMode ? "update post" : "publish post";
      toast.error(axiosError.response?.data?.message || `Failed to ${actionText}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    if (mediaFiles.length + existingMedia.length + newFiles.length > 10) {
      toast.warning("You can only attach a maximum of 10 images per post.");
      event.target.value = "";
      return;
    }
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setMediaFiles((previous) => [...previous, ...newFiles]);
    setMediaPreviews((previous) => [...previous, ...newPreviews]);
    event.target.value = "";
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }
    if (bannerPreview && bannerFile) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const removeNewMedia = (indexToRemove: number) => {
    const preview = mediaPreviews[indexToRemove];
    if (preview) URL.revokeObjectURL(preview);
    setMediaFiles((previous) => previous.filter((_, index) => index !== indexToRemove));
    setMediaPreviews((previous) => previous.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingMedia = (indexToRemove: number) => {
    setExistingMedia((previous) => previous.filter((_, index) => index !== indexToRemove));
    setExistingMediaPublicIds((previous) => previous.filter((_, index) => index !== indexToRemove));
  };

  const getLanguageExtension = (language: string) => {
    switch (language.toLowerCase()) {
      case "python": return [python()];
      case "typescript": return [javascript({ typescript: true })];
      case "java": return [java()];
      case "cpp": return [cpp()];
      case "rust": return [rust()];
      case "go": return [go()];
      case "sql": return [sql()];
      default: return [javascript()];
    }
  };

  const addCodeSnippet = () => {
    setCodeSnippets((previous) => [...previous, { id: crypto.randomUUID(), language: "typescript", code: "" }]);
  };

  if (!isExpanded && !isEditMode) {
    return (
      <div className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-sm transition-colors duration-300">
        <div className="flex gap-3 items-center">
          <RouterLink to={`/profile/${authUser?.username}`} className="shrink-0 no-underline">
            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center overflow-hidden">
              {authUser?.profileImageUrl ? (
                <img src={authUser.profileImageUrl} alt="You" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-stone-400 dark:text-stone-500" />
              )}
            </div>
          </RouterLink>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-full border border-stone-200/60 dark:border-white/10 bg-stone-100/50 dark:bg-black/20 text-stone-500 dark:text-stone-400 text-sm outline-none hover:bg-stone-200/50 dark:hover:bg-black/30 transition-colors"
          >
            Start a post...
          </button>
        </div>
      </div>
    );
  }
  
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative flex h-auto max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#15233B]/95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================= HEADER ================= */}
          <div className="flex shrink-0 items-center justify-between border-b border-stone-200/60 px-5 py-3 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center overflow-hidden font-bold text-sm">
                {authUser?.profileImageUrl ? (
                  <img src={authUser.profileImageUrl} alt="You" className="w-full h-full object-cover" />
                ) : (
                  authUser?.fullname?.charAt(0) || "U"
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0B192C] dark:text-white">{authUser?.fullname || "User"}</h2>
                <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  {isEditMode ? "Editing..." : draftStatus === "Saved" ? <><CheckCircle size={12} className="text-green-500" /> Saved</> : draftStatus || "Draft"}
                </div>
              </div>
            </div>
            <button onClick={handleDiscard} disabled={isSubmitting} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* ================= SCROLLABLE BODY ================= */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 sm:px-10">
            <div className="mx-auto w-full max-w-2xl">
              
              {/* Title & Subtitle */}
              <input
                type="text"
                placeholder="Post Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-transparent border-none text-3xl font-extrabold text-[#0B192C] placeholder-stone-300 outline-none dark:text-white dark:placeholder-stone-600 mb-2"
              />
              <input
                type="text"
                placeholder="Add a subtitle (optional)..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={300}
                disabled={isSubmitting}
                className="w-full bg-transparent border-none text-base text-stone-500 placeholder-stone-400 outline-none dark:text-stone-400 dark:placeholder-stone-500 mb-6"
              />

              {/* AI Assistant Collapsible Panel */}
              <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-50/50 dark:border-orange-500/20 dark:bg-orange-500/5">
                <button
                  type="button"
                  onClick={() => setIsAiOpen(!isAiOpen)}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-between p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-white shadow-sm">
                      <Sparkles size={14} />
                    </div>
                    <span className="text-sm font-bold text-[#0B192C] dark:text-white">AI Assistant</span>
                  </div>
                  <ChevronDown size={16} className={`text-orange-500 transition-transform ${isAiOpen ? "rotate-180" : ""}`} />
                </button>

                {isAiOpen && (
                  <div className="px-3 pb-3">
                    <textarea
                      value={aiInstruction}
                      onChange={(e) => setAiInstruction(e.target.value)}
                      maxLength={1000}
                      rows={2}
                      placeholder="e.g. Make it beginner friendly with examples..."
                      disabled={isAiLoading || isSubmitting}
                      className="w-full resize-none rounded-lg border border-stone-200 bg-white p-2.5 text-sm text-stone-800 outline-none focus:border-orange-500/50 dark:border-white/10 dark:bg-[#0B192C] dark:text-white mb-2"
                    />
                    <button
                      onClick={handleGenerateAiSuggestions}
                      disabled={isAiLoading || isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      Generate
                    </button>

                    {aiResult && (
                      <div className="mt-4 space-y-4 rounded-lg bg-white/50 p-3 dark:bg-black/20">
                        <div>
                          <strong className="text-xs font-bold text-stone-700 dark:text-stone-300">Suggested Title</strong>
                          <p className="mt-1 mb-2 text-sm text-stone-800 dark:text-white">{aiResult.suggestedTitle}</p>
                          <button onClick={() => { setTitle(aiResult.suggestedTitle); toast.success("Title applied"); }} className="text-xs font-semibold text-orange-500 hover:underline">Apply title</button>
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-stone-700 dark:text-stone-300">Summary</strong>
                          <p className="mt-1 mb-2 text-sm text-stone-800 dark:text-white">{aiResult.summary}</p>
                          <button onClick={() => { editor?.chain().focus().insertContent({ type: 'paragraph', content: [{ type: 'text', text: aiResult.summary }] }).run(); toast.success("Summary inserted"); }} className="text-xs font-semibold text-orange-500 hover:underline">Insert summary</button>
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-stone-700 dark:text-stone-300">Suggested Topics</strong>
                          <div className="mt-1 mb-2 flex flex-wrap gap-2">
                            {aiResult.topics.map((topic, i) => (
                              <span key={i} className="rounded-full bg-orange-100 text-orange-600 px-2 py-1 text-xs dark:bg-orange-500/20 dark:text-orange-400">#{topic.replace(/^#+/, "")}</span>
                            ))}
                          </div>
                          <button onClick={() => { const merged = Array.from(new Set([...tags, ...aiResult.topics.map(t => t.replace(/^#+/, ""))])); setTags(merged.slice(0,5)); toast.success("Topics added"); }} className="text-xs font-semibold text-orange-500 hover:underline">Add topics</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tiptap Editor */}
              <div className="min-h-[200px] cursor-text" onClick={() => editor?.commands.focus()}>
                {editor && <EditorContent editor={editor} />}
              </div>

              {/* Cover Image Preview */}
              {bannerPreview && (
                <div className="relative mt-4 overflow-hidden rounded-xl border border-stone-200 dark:border-white/10">
                  <img src={bannerPreview} alt="Cover" className="block h-[150px] w-full object-cover" />
                  <button
                    onClick={() => {
                      if (bannerPreview && bannerFile) URL.revokeObjectURL(bannerPreview);
                      setBannerFile(null);
                      setBannerPreview(editPost?.coverImageUrl || null);
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Code Snippets */}
              {codeSnippets.map((snippet) => (
                <div key={snippet.id} className="mt-4 overflow-hidden rounded-xl border border-stone-800 bg-[#161312] dark:border-white/10">
                  <div className="flex items-center justify-between border-b border-stone-800 px-4 py-2">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <select
                      value={snippet.language}
                      onChange={(e) => setCodeSnippets(prev => prev.map(item => item.id === snippet.id ? { ...item, language: e.target.value } : item))}
                      className="bg-transparent text-xs font-semibold text-stone-400 outline-none cursor-pointer"
                    >
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="rust">Rust</option>
                      <option value="go">Go</option>
                      <option value="cpp">C / C++</option>
                      <option value="java">Java</option>
                      <option value="sql">SQL</option>
                    </select>
                    <button onClick={() => setCodeSnippets(prev => prev.filter(item => item.id !== snippet.id))} className="text-red-400 hover:text-red-300">
                      <X size={16} />
                    </button>
                  </div>
                  <CodeMirror
                    value={snippet.code}
                    height="auto"
                    minHeight="100px"
                    maxHeight="300px"
                    theme={isDark ? vscodeDark : githubLight}
                    extensions={getLanguageExtension(snippet.language)}
                    onChange={(value) => setCodeSnippets(prev => prev.map(item => item.id === snippet.id ? { ...item, code: value } : item))}
                  />
                </div>
              ))}

              {/* Media Previews */}
              {(existingMedia.length > 0 || mediaPreviews.length > 0) && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {existingMedia.map((url, i) => (
                    <div key={`exist-${i}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-stone-200 dark:border-white/10">
                      <img src={url} alt="media" className="h-full w-full object-cover" />
                      <button onClick={() => removeExistingMedia(i)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button>
                    </div>
                  ))}
                  {mediaPreviews.map((url, i) => (
                    <div key={`new-${i}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-stone-200 dark:border-white/10">
                      <img src={url} alt="media" className="h-full w-full object-cover" />
                      <button onClick={() => removeNewMedia(i)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-stone-200/60 pt-4 dark:border-white/10">
                <Hash size={16} className="text-stone-400" />
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                    #{tag}
                    <button onClick={() => removeTag(tag)}><X size={12} /></button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    type="text"
                    placeholder={tags.length === 0 ? "Add tags (e.g. javascript)..." : "Add another..."}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    disabled={isSubmitting}
                    className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder-stone-400 dark:text-white"
                  />
                )}
              </div>

            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="shrink-0 border-t border-stone-200/60 bg-white/80 px-5 py-3 backdrop-blur-md dark:border-white/10 dark:bg-[#15233B]/80">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
              
              {/* Toolbar Icons */}
              <div className="flex items-center gap-0.5 text-stone-400">
                <button onClick={() => editor?.chain().focus().toggleBold().run()} disabled={isSubmitting} className={`p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10 ${editor?.isActive('bold') ? 'text-orange-500' : ''}`}><Bold size={16} /></button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={isSubmitting} className={`p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10 ${editor?.isActive('italic') ? 'text-orange-500' : ''}`}><Italic size={16} /></button>
                <button onClick={() => { const url = window.prompt("URL:"); if (url && editor) editor.chain().focus().setLink({ href: url }).run(); }} disabled={isSubmitting} className={`p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10 ${editor?.isActive('link') ? 'text-orange-500' : ''}`}><LinkIcon size={16} /></button>
                <div className="mx-1.5 h-4 w-px bg-stone-300 dark:bg-white/20" />
                <label htmlFor="banner-up" className="cursor-pointer p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10"><ImageIcon size={16} /></label>
                <input type="file" id="banner-up" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={isSubmitting} />
                <label htmlFor="media-up" className="cursor-pointer p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10"><ImageIcon size={16} /></label>
                <input type="file" id="media-up" className="hidden" accept="image/*" multiple onChange={handleMediaUpload} disabled={isSubmitting} />
                <button onClick={addCodeSnippet} disabled={isSubmitting} className="p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-white/10"><CodeXml size={16} /></button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {postStatus === "scheduled" && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-medium text-stone-700 outline-none dark:border-white/10 dark:bg-[#0B192C] dark:text-white"
                  />
                )}
                <select
                  value={postStatus}
                  onChange={(e) => {
                    const val = e.target.value as "draft" | "scheduled" | "published";
                    setPostStatus(val);
                    if (val !== "scheduled") setScheduledAt("");
                  }}
                  disabled={isSubmitting}
                  className="rounded-lg border border-stone-200 bg-transparent px-3 py-1.5 text-xs font-semibold text-stone-700 outline-none dark:border-white/10 dark:text-stone-300"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Schedule</option>
                  <option value="published">Publish</option>
                </select>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : (
                    <>
                      {postStatus === "draft" ? "Save Draft" : postStatus === "scheduled" ? "Schedule" : isEditMode ? "Save Changes" : "Publish"}
                      {postStatus === "draft" ? <Save size={14} /> : <Send size={14} />}
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CreatePostEditor;