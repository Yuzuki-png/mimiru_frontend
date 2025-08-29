/**
 * 共通の型定義
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  details?: Record<string, unknown>;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PlayerAudioContent {
  id: string;
  title: string;
  audioUrl: string;
  duration?: number;
  startTime?: number;
  user: {
    id: string;
    name: string;
  };
}