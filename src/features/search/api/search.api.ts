import api from "@/lib/api/api";
import type {
  SearchPostsParams,
  SearchPostsResponse,
} from "../types/search.types";

/**
 * The backend search controller returns a slightly different envelope
 * than other endpoints — just `{ success, data }`, no `statusCode` /
 * `message` / `timestamp`.
 */
interface SearchEnvelope {
  success: boolean;
  data: SearchPostsResponse;
}

export const SearchAPI = {
  searchPosts: async (
    params: SearchPostsParams,
  ): Promise<SearchPostsResponse> => {
    const response = await api.get<SearchEnvelope>("/search/posts", {
      params: {
        q: params.q,
        ...(params.limit !== undefined ? { limit: params.limit } : {}),
        ...(params.offset !== undefined ? { offset: params.offset } : {}),
        ...(params.tags && params.tags.length > 0
          ? { tags: params.tags.join(",") }
          : {}),
        ...(params.authorId ? { authorId: params.authorId } : {}),
        ...(params.fromDate ? { fromDate: params.fromDate } : {}),
        ...(params.toDate ? { toDate: params.toDate } : {}),
      },
    });

    return response.data.data;
  },
};