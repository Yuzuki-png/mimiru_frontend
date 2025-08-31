/**
 * 共通の型定義
 */

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
  /** 現在再生中の音声コンテンツ */
  currentAudio: PlayerAudioContent | null;
  /** 再生中かどうか */
  isPlaying: boolean;
  /** 読み込み中かどうか */
  isLoading: boolean;
  /** 現在の再生時間（秒） */
  currentTime: number;
  /** 音声の総再生時間（秒） */
  duration: number;
  /** エラーメッセージ */
  error: string | null;
  /** 音量（0-1） */
  volume: number;
  /** ミュート状態 */
  isMuted: boolean;
}

/**
 * HTTPステータスコード
 */
export type HttpStatusCode = 
  | 200 // OK
  | 201 // Created
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 422 // Unprocessable Entity
  | 500; // Internal Server Error

/**
 * API レスポンスの型定義
 */
export interface ApiResponse<T> {
  /** レスポンスデータ */
  data: T;
  /** メッセージ */
  message?: string;
  /** エラー詳細 */
  errors?: Record<string, string[]>;
}

/**
 * ページネーション結果の型定義
 */
export interface PaginatedResult<T> {
  /** データ配列 */
  data: T[];
  /** ページネーション情報 */
  pagination: {
    /** 現在のページ番号 */
    page: number;
    /** 1ページあたりの件数 */
    limit: number;
    /** 総件数 */
    total: number;
    /** 総ページ数 */
    totalPages: number;
  };
}

/**
 * アプリケーションエラーの型定義
 */
export interface AppError {
  /** エラーコード */
  code: string;
  /** システム向けメッセージ */
  message: string;
  /** ユーザー向けメッセージ */
  userMessage: string;
  /** エラーの詳細情報 */
  details?: Record<string, unknown>;
}

/**
 * 読み込み状態の型定義
 */
export interface LoadingState {
  /** 読み込み中かどうか */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
}

/**
 * プレイヤー用音声コンテンツの型定義
 */
export interface PlayerAudioContent {
  /** コンテンツID */
  id: string;
  /** タイトル */
  title: string;
  /** 音声ファイルのURL */
  audioUrl: string;
  /** 音声の長さ（秒） */
  duration?: number;
  /** 開始時刻（秒） */
  startTime?: number;
  /** 投稿者情報 */
  user: {
    /** ユーザーID */
    id: string;
    /** ユーザー名 */
    name: string;
  };
}