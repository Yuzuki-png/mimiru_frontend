/**
 * API基盤クラス - 統一されたエラーハンドリングとレスポンス型管理
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, AppError } from '../../types';
import { StorageManager } from '../storage';
import { config } from '../config';

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = config.apiBaseUrl) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: config.apiTimeout,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // リクエストインターセプター
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = StorageManager.getToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // レスポンスインターセプター
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          StorageManager.clearAuth();
          // 認証エラー時のリダイレクトは呼び出し元で処理
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): AppError {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        userMessage: 'サーバーに接続できません。ネットワーク接続を確認してください。',
        details: { originalError: error }
      };
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as Record<string, unknown>;

      switch (status) {
        case 400:
          return {
            code: 'BAD_REQUEST',
            message: (data?.message as string) || 'Bad request',
            userMessage: (data?.message as string) || 'リクエストに問題があります。',
            details: (data?.errors as Record<string, unknown>) || {}
          };
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
            userMessage: '認証が必要です。ログインしてください。',
            details: { status }
          };
        case 403:
          return {
            code: 'FORBIDDEN',
            message: 'Forbidden',
            userMessage: 'この操作を実行する権限がありません。',
            details: { status }
          };
        case 404:
          return {
            code: 'NOT_FOUND',
            message: 'Resource not found',
            userMessage: '要求されたリソースが見つかりません。',
            details: { status }
          };
        case 422:
          return {
            code: 'VALIDATION_ERROR',
            message: (data?.message as string) || 'Validation failed',
            userMessage: '入力データに問題があります。',
            details: (data?.errors as Record<string, unknown>) || {}
          };
        case 500:
          return {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
            userMessage: 'サーバーでエラーが発生しました。しばらく後に再試行してください。',
            details: { status }
          };
        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: (data?.message as string) || `HTTP ${status}`,
            userMessage: '予期しないエラーが発生しました。',
            details: { status, data }
          };
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error',
      userMessage: '予期しないエラーが発生しました。',
      details: { originalError: error }
    };
  }

  // GET リクエスト
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(endpoint, { params });
    return response.data;
  }

  // POST リクエスト
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(endpoint, data);
    return response.data;
  }

  // PUT リクエスト
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(endpoint, data);
    return response.data;
  }

  // PATCH リクエスト
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(endpoint, data);
    return response.data;
  }

  // DELETE リクエスト
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(endpoint);
    return response.data;
  }

  // マルチパートフォームデータ用POST
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 認証トークンを設定
  setAuthToken(token: string): void {
    StorageManager.setToken(token);
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // 認証トークンを削除
  clearAuthToken(): void {
    StorageManager.clearAuth();
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

// デフォルトAPIクライアントインスタンス
export const apiClient = new ApiClient();