export interface SearchPostResult {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[] | null;
  readTime: number | null;
  publishDate: string | null;   // backend sends Date; over JSON it's ISO string
  author: {
    id: string;
    username: string;
    fullname: string;
    profileImageUrl: string | null;
  };
  score: number;                // RRF fused score — internal use only
  matchedChunk: string | null;  // best-matching vector chunk
}

export interface SearchPostsResponse {
  query: string;
  count: number;
  results: SearchPostResult[];
}

export interface SearchPostsParams {
  q: string;
  limit?: number;
  offset?: number;
  tags?: string[];
  authorId?: string;
  fromDate?: string;            // ISO 8601
  toDate?: string;
}