import api from "@/lib/api/api";
import type {
  CommentData,
  PaginatedCommentsResponse,
  PaginatedRepliesResponse,
  Post,
} from "@/types/api.types";

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export type ReactionType =
  | "like"
  | "love"
  | "laugh"
  | "celebrate"
  | "support"
  | "sad"
  | "angry";

export interface ReactionResult {
  targetId: string;
  targetType: "POST" | "COMMENT";
  reactionType: ReactionType | null;
  isReacted: boolean;
}

export interface ToggleLikeResponse {
  status: "liked" | "unliked";
}

export interface FollowResult {
  followerId: string;
  followingId: string;
  isFollowing: boolean;
}

export interface SaveResult {
  userId: string;
  postId: string;
  isSaved: boolean;
}

export interface ShareResult {
  id: number;
  userId: string;
  postId: string;
  platform: string;
  createdAt: string;
}

export interface SavedPostsResponse {
  posts: Post[];
  nextCursor: string | null;
}

export const InteractionsAPI = {
  // ---------------------------------------
  // COMMENTS
  // ---------------------------------------

  getTopLevelComments: async (
    postId: string,
    cursor?: string,
    limit = 20
  ): Promise<PaginatedCommentsResponse> => {
    const response = await api.get<
      BackendResponse<PaginatedCommentsResponse>
    >(`/interactions/comments/${postId}`, {
      params: {
        cursor,
        limit,
      },
    });

    return response.data.data;
  },

  getCommentReplies: async (
    commentId: string,
    cursor?: string,
    limit = 20
  ): Promise<PaginatedRepliesResponse> => {
    const response = await api.get<
      BackendResponse<PaginatedRepliesResponse>
    >(`/interactions/comments/${commentId}/replies`, {
      params: {
        cursor,
        limit,
      },
    });

    return response.data.data;
  },

  getCommentById: async (commentId: string): Promise<CommentData> => {
    const response = await api.get<BackendResponse<CommentData>>(
      `/interactions/comments/${commentId}`
    );

    return response.data.data;
  },

  addComment: async (
    postId: string,
    content: string,
    parentCommentId?: string | null
  ): Promise<CommentData> => {
    const response = await api.post<BackendResponse<CommentData>>(
      `/interactions/comments/${postId}`,
      {
        content,
        parentCommentId: parentCommentId ?? null,
      }
    );

    return response.data.data;
  },

  updateComment: async (
    commentId: string,
    content: string
  ): Promise<CommentData> => {
    const response = await api.put<BackendResponse<CommentData>>(
      `/interactions/comments/${commentId}`,
      {
        content,
      }
    );

    return response.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete<BackendResponse<null>>(
      `/interactions/comments/${commentId}`
    );
  },

  // ---------------------------------------
  // REACTIONS
  // ---------------------------------------

  setPostReaction: async (
    postId: string,
    reactionType: ReactionType
  ): Promise<ReactionResult> => {
    const response = await api.post<BackendResponse<ReactionResult>>(
      `/interactions/posts/${postId}/reaction`,
      {
        reactionType,
      }
    );

    return response.data.data;
  },

  removePostReaction: async (
    postId: string
  ): Promise<ReactionResult> => {
    const response = await api.delete<BackendResponse<ReactionResult>>(
      `/interactions/posts/${postId}/reaction`
    );

    return response.data.data;
  },

  setCommentReaction: async (
    commentId: string,
    reactionType: ReactionType
  ): Promise<ReactionResult> => {
    const response = await api.post<BackendResponse<ReactionResult>>(
      `/interactions/comments/${commentId}/reaction`,
      {
        reactionType,
      }
    );

    return response.data.data;
  },

  removeCommentReaction: async (
    commentId: string
  ): Promise<ReactionResult> => {
    const response = await api.delete<BackendResponse<ReactionResult>>(
      `/interactions/comments/${commentId}/reaction`
    );

    return response.data.data;
  },

  // ---------------------------------------
  // FOLLOW
  // ---------------------------------------

  followUser: async (userId: string): Promise<FollowResult> => {
    const response = await api.post<BackendResponse<FollowResult>>(
      `/interactions/users/${userId}/follow`
    );

    return response.data.data;
  },

  unfollowUser: async (userId: string): Promise<FollowResult> => {
    const response = await api.delete<BackendResponse<FollowResult>>(
      `/interactions/users/${userId}/follow`
    );

    return response.data.data;
  },

  checkFollowing: async (
    userId: string
  ): Promise<{ isFollowing: boolean }> => {
    const response = await api.get<
      BackendResponse<{ isFollowing: boolean }>
    >(`/interactions/users/${userId}/follow`);

    return response.data.data;
  },

  // ---------------------------------------
  // SAVED POSTS
  // ---------------------------------------

  savePost: async (postId: string): Promise<SaveResult> => {
    const response = await api.post<BackendResponse<SaveResult>>(
      `/interactions/posts/${postId}/save`
    );

    return response.data.data;
  },

  unsavePost: async (postId: string): Promise<SaveResult> => {
    const response = await api.delete<BackendResponse<SaveResult>>(
      `/interactions/posts/${postId}/save`
    );

    return response.data.data;
  },

  getSavedPosts: async (
    cursor?: string,
    limit = 20
  ): Promise<SavedPostsResponse> => {
    const response = await api.get<BackendResponse<SavedPostsResponse>>(
      `/interactions/saved-posts`,
      {
        params: {
          cursor,
          limit,
        },
      }
    );

    return response.data.data;
  },

  // ---------------------------------------
  // SHARES
  // ---------------------------------------

  createShare: async (
    postId: string,
    platform: string
  ): Promise<ShareResult> => {
    const response = await api.post<BackendResponse<ShareResult>>(
      `/interactions/posts/${postId}/share`,
      {
        platform,
      }
    );

    return response.data.data;
  },

  getPostShares: async (
    postId: string,
    cursor?: string,
    limit = 20
  ): Promise<ShareResult[]> => {
    const response = await api.get<BackendResponse<ShareResult[]>>(
      `/interactions/posts/${postId}/shares`,
      {
        params: {
          cursor,
          limit,
        },
      }
    );

    return response.data.data;
  },

  getUserPostShares: async (
    postId: string
  ): Promise<ShareResult[]> => {
    const response = await api.get<BackendResponse<ShareResult[]>>(
      `/interactions/posts/${postId}/my-shares`
    );

    return response.data.data;
  },
};