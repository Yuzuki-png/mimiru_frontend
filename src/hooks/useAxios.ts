import { useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { StorageManager } from '../lib/storage';
import { config } from '../lib/config';
import { useToast } from './useToast';

interface UseAxiosOptions extends Omit<AxiosRequestConfig, 'url'> {
  skipAuth?: boolean;
  showError?: boolean;
}

export default function useAxios() {
  const { showError: showToastError } = useToast();

  return useCallback(async <T = unknown>(
    url: string, 
    options: UseAxiosOptions = {}
  ): Promise<AxiosResponse<T>> => {
    const {
      skipAuth = false,
      showError = true,
      headers: customHeaders = {},
      ...restOptions
    } = options;

    // URLの正規化
    const fullUrl = url.startsWith('http') 
      ? url 
      : `${config.apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;

    // ヘッダーの構築
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers: any = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // 認証ヘッダーの付与
    if (!skipAuth) {
      const token = StorageManager.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await axios({
        url: fullUrl,
        ...restOptions,
        headers,
        timeout: config.apiTimeout || 10000,
      });

      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // 認証エラーハンドリング
      if (axiosError.response?.status === 401) {
        StorageManager.clearAuth();
        
        // ダッシュボードページからのリクエストでは自動リダイレクトしない
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login';
        }
        
        throw new Error('Unauthorized');
      }

      // HTTPエラー
      if (axiosError.response) {
        const errorData = axiosError.response.data as { message?: string };
        const errorMessage = errorData?.message || 
          `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
        
        if (showError) {
          showToastError(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      // ネットワークエラー
      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
        const networkError = 'ネットワーク接続に問題があります。';
        if (showError) {
          showToastError(networkError);
        }
        throw new Error(networkError);
      }

      // タイムアウトエラー
      if (axiosError.code === 'ECONNABORTED') {
        const timeoutError = 'リクエストがタイムアウトしました。';
        if (showError) {
          showToastError(timeoutError);
        }
        throw new Error(timeoutError);
      }
      
      throw error;
    }
  }, [showToastError]);
}