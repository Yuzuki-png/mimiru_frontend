/**
 * 認証API - 統一されたAPIクライアントを使用
 */

import { apiClient } from './base';
import { AuthUser, ApiResponse } from '../../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: AuthUser;
}

export const authApi = {
  /**
   * ユーザー登録
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    if (response.data.access_token) {
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response;
  },

  /**
   * ユーザーログイン
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    if (response.data.access_token) {
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response;
  },

  /**
   * ユーザープロファイル取得
   */
  async getProfile(): Promise<ApiResponse<AuthUser>> {
    return apiClient.get<AuthUser>('/auth/profile');
  },

  /**
   * トークンリフレッシュ
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ access_token: string }>> {
    return apiClient.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
  },

  /**
   * ログアウト
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/logout');
    } finally {
      // サーバーでのログアウトが失敗してもローカルトークンは削除
      apiClient.clearAuthToken();
    }
  },

  /**
   * パスワードリセット要求
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-reset', { email });
  },

  /**
   * パスワードリセット実行
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-reset/confirm', {
      token,
      password: newPassword,
    });
  },

  /**
   * パスワード変更
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-change', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * メールアドレス確認
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/verify-email', { token });
  },

  /**
   * メール確認の再送信
   */
  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/verify-email/resend');
  },
};