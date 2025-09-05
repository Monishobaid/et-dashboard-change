export interface Message {
  creditsUsed: number;
  modelUsed: string;
  query: string;
  timestamp: number;
  toolUsed: string;
  totalCostInr: number;
  userAction: 'like' | 'dislike' | null;
  userReview: string | null;
}

export interface Session {
  createdAt: number;
  dislikeCount: number;
  emailId: string;
  lastUpdatedAt: number;
  likeCount: number;
  messageCount: number;
  messages: Message[];
  reviewCount: number;
  sessionId: string;
  sessionUrl: string;
  ssoID?: string;
  title: string;
  userId: string;
}

export interface Filters {
  userIds?: string[];
  sessionIds?: string[];
  emailIds?: string[];
  liked?: boolean;
  disliked?: boolean;
  userReviewed?: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  hasMore?: boolean;
  totalCount?: number;
  totalPages?: number;
}

export interface SessionDataRequest {
  filters: Filters;
  pagination: Pagination;
}

export interface SessionDataResponse {
  filters: Filters;
  pagination: Pagination;
  sessions: Session[];
}