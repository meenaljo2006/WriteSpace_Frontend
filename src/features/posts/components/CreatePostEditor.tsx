import { lazy, Suspense, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { User } from "lucide-react";

import { useAuth } from "@/app/providers/AuthProvider";
import type { Post } from "@/types/api.types";

interface CreatePostEditorProps {
  onPostCreated?: (newPost: Post) => void;
  editPost?: Post;
  onCloseEdit?: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

const CreatePostEditorModal = lazy(() => import("./CreatePostEditorModal"));

function EditorLoadingFallback() {
  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl bg-white/90 dark:bg-[#15233B]/90 backdrop-blur-md px-5 py-4 text-sm text-stone-700 dark:text-stone-200 shadow-xl border border-white/20">
        Opening editor...
      </div>
    </div>
  );
}

export default function CreatePostEditor({
  onPostCreated,
  editPost,
  onCloseEdit,
  onPostUpdated,
}: CreatePostEditorProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (editPost) {
    return (
      <Suspense fallback={<EditorLoadingFallback />}>
        <CreatePostEditorModal
          editPost={editPost}
          onCloseEdit={onCloseEdit}
          onPostUpdated={onPostUpdated}
          initiallyExpanded
        />
      </Suspense>
    );
  }

  return (
    <>
      <div className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-[0_8px_30px_rgb(249,115,22,0.06)] transition-colors duration-300">
        <div className="flex gap-3 items-center">
          <RouterLink
            to={`/profile/${user?.username}`}
            className="shrink-0 no-underline"
            aria-label="View your profile"
          >
            <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center overflow-hidden">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Your profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-stone-400 dark:text-stone-500" />
              )}
            </div>
          </RouterLink>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-full border border-stone-200/60 dark:border-white/10 bg-stone-100/50 dark:bg-black/20 text-stone-500 dark:text-stone-400 text-sm outline-none hover:bg-stone-200/50 dark:hover:bg-black/30 transition-colors"
          >
            Start a post...
          </button>
        </div>
      </div>

      {isOpen && (
        <Suspense fallback={<EditorLoadingFallback />}>
          <CreatePostEditorModal
            initiallyExpanded
            onPostCreated={(post) => {
              onPostCreated?.(post);
              setIsOpen(false);
            }}
            onCloseCreate={() => setIsOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}