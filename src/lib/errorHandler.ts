/**
 * エラーハンドリングユーティリティ
 */

import { AppError } from '../types';

export class ErrorHandler {
  /**
   * エラーをログに記録し、ユーザーフレンドリーなメッセージを返す
   */
  static handleError(error: unknown): AppError {
    if (error instanceof Error) {
      // カスタムAppErrorの場合
      if ('code' in error && 'userMessage' in error) {
        const appError = error as AppError;
        return appError;
      }

      // 一般的なErrorの場合
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        userMessage: '予期しないエラーが発生しました。',
        details: { originalError: error }
      };
    }

    // unknown型のエラー
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error occurred',
      userMessage: '予期しないエラーが発生しました。',
      details: { originalError: error }
    };
  }

  /**
   * 非同期操作のエラーハンドリング
   */
  static async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    options?: {
      onError?: (error: AppError) => void;
      showToast?: boolean;
      fallbackValue?: T;
    }
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      const appError = this.handleError(error);
      
      if (options?.onError) {
        options.onError(appError);
      }

      if (options?.fallbackValue !== undefined) {
        return options.fallbackValue;
      }

      return undefined;
    }
  }

  /**
   * リトライ機能付きの非同期操作
   */
  static async retryAsyncOperation<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i <= retries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw this.handleError(lastError);
  }
}