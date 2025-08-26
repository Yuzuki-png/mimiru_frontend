/**
 * 共通の型定義
 */

// API レスポンスの基本型
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ページネーション用の型
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// エラー情報型
export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  details?: Record<string, unknown>;
}

// ローディング状態型
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// 音声プレーヤー用の軽量オーディオコンテンツ型
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