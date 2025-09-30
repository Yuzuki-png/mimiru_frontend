/**
 * 通知の種別
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type 通知種別 = '成功' | 'エラー' | '警告' | '情報';

/**
 * 通知の表示位置
 */
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type 通知位置 = '右上' | '左上' | '右下' | '左下' | '中央上' | '中央下';

/**
 * 音声プレイヤーの状態
 */
export interface AudioPlayerState {
  currentAudio: PlayerAudioContent | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

/**
 * HTTPステータスコード
 */
export type HttpStatusCode = 
  | 200
  | 201
  | 400
  | 401
  | 403
  | 404
  | 422
  | 500;

/**
 * API レスポンスの型定義
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * ページネーション結果の型定義
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * アプリケーションエラーの型定義
 */
export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  details?: Record<string, unknown>;
}

/**
 * 読み込み状態の型定義
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * プレイヤー用音声コンテンツの型定義
 */
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