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
  register: async (email: string, password: string, username?: string) => {
    // バックエンドが期待する形式に整形
    const userData = {
      email: email,
      password: password,
      ...(username ? { username: username } : {}) // usernameがある場合のみ送信
    };
    
    console.log('Register request payload:', userData);
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  // ログイン
  login: async (email: string, password: string) => {
    const loginData = { email, password };
    console.log('Login request payload:', loginData);
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },
  
  // プロファイル取得
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// 認証状態の確認
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export default api; 