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

    const fullUrl = url.startsWith('http') 
      ? url 
      : `${config.apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // customHeaders を手動でマージ（null値をスキップ）
    if (customHeaders) {
      for (const [key, value] of Object.entries(customHeaders)) {
        if (value !== null && value !== undefined) {
          headers[key] = String(value);
        }
      }
    }

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
      
      if (axiosError.response?.status === 401) {
        StorageManager.clearAuth();
        
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login';
        }
        
        throw new Error('Unauthorized');
      }

      if (axiosError.response) {
        const errorData = axiosError.response.data as { message?: string };
        const errorMessage = errorData?.message || 
          `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
        
        if (showError) {
          showToastError(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
        const networkError = 'ネットワーク接続に問題があります。';
        if (showError) {
          showToastError(networkError);
        }
        throw new Error(networkError);
      }

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