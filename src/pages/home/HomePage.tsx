import { useCallback, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import CreatePostEditor from "@/features/posts/components/CreatePostEditor";
import PostsFeed from "@/features/posts/components/PostsFeed";
import type { Post } from "@/features/posts/types/post.types";

export default function HomePage() {
  const { user } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handlePostCreated = useCallback((_post?: Post) => {
    setRefreshKey((current) => current + 1);
  }, []);

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
  }, []);

  const handlePostUpdated = useCallback((_updatedPost: Post) => {
    setEditingPost(null);
    setRefreshKey((current) => current + 1);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditingPost(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      
      {/* 1. POST COMPOSER  */}
      <div className="shrink-0 pb-4">
        <CreatePostEditor onPostCreated={handlePostCreated} />
      </div>

      {/* 2. POSTS FEED  */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        <PostsFeed
          currentUserId={user?.id}
          refreshKey={refreshKey}
          onEditPost={handleEditPost}
          emptyMessage="No published posts yet. Be the first to share something!"
        />
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <CreatePostEditor
          key={editingPost.id}
          editPost={editingPost}
          onCloseEdit={handleCloseEdit}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}