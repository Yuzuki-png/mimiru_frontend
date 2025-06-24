// APIレスポンスの基本型
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from './config';

// Axiosインスタンスの作成
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.apiTimeout,
});

// トークンを設定する関数
export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
  }
};

// リクエスト時にトークンを設定するインターセプター
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// レスポンスのインターセプター
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 認証エラー時の処理
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// 認証関連のAPI
export const authApi = {
  // ユーザー登録
  register: async (email: string, password: string, name?: string) => {
    const userData = { email, password, name };
    
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Register API response:', response.data);
      
      // JWTトークンをレスポンスから取得して設定
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        
        // ユーザー情報をローカルストレージに保存
        localStorage.setItem('userEmail', email);
      }
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('予期しないエラーが発生しました');
      }
    }
  },
  
  // ログイン
  login: async (email: string, password: string) => {
    const loginData = { email, password };
    
    try {
      const response = await api.post('/auth/login', loginData);
      console.log('Login API response:', response.data);
      
      // JWTトークンをレスポンスから取得して設定
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        
        // ユーザー情報をローカルストレージに保存
        localStorage.setItem('userEmail', email);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('予期しないエラーが発生しました');
      }
    }
  },
  
  // プロファイル取得
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get profile from /auth/me:', error);
      throw error;
    }
  },


};

// 音声コンテンツ関連のAPI
export const audioContentApi = {
  // 音声コンテンツ一覧取得
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => {
    const response = await api.get('/audio-contents', { params });
    return response.data;
  },

  // 特定の音声コンテンツ取得
  getById: async (id: string) => {
    const response = await api.get(`/audio-contents/${id}`);
    return response.data;
  },

  // 音声コンテンツ投稿
  create: async (audioData: {
    title: string;
    description: string;
    category: string;
    duration?: number;
    audioFile: File;
  }) => {
    const formData = new FormData();
    formData.append('title', audioData.title);
    formData.append('description', audioData.description);
    formData.append('category', audioData.category);
    if (audioData.duration) {
      formData.append('duration', audioData.duration.toString());
    }
    formData.append('audioFile', audioData.audioFile);

    const response = await api.post('/audio-contents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // いいね切り替え
  toggleLike: async (id: string) => {
    const response = await api.post(`/audio-contents/${id}/like`);
    return response.data;
  }
};

// 認証状態の確認
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export default api; 