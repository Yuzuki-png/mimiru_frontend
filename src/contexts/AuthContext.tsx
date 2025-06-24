"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setAuthToken } from '../lib/api';
import { AxiosError } from 'axios';

// ユーザータイプの定義
interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

// 認証コンテキストの型定義
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// デフォルト値の作成
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  error: null
};

// コンテキスト作成
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// AuthProviderコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // アプリ起動時にユーザー情報を読み込み
  useEffect(() => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // ユーザープロファイルの読み込み
  const loadUserProfile = async () => {
    try {
      const userData = await authApi.getProfile();
      console.log('User profile loaded:', userData);
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        name: userData.name,
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);

      // プロフィール取得に失敗した場合、認証エラーならログアウト
      if (error instanceof AxiosError && error.response?.status === 401) {
        // 認証エラーの場合はログアウト
        setAuthToken('');
        setUser(null);
        return;
      }

      // その他のエラーの場合は基本的なユーザー情報を保持
      const token = localStorage.getItem('token');
      if (token) {
        const savedUserEmail = localStorage.getItem('userEmail');
        setUser({
          id: 'unknown',
          email: savedUserEmail || 'user@example.com',
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ログイン処理
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await authApi.login(email, password);
      console.log('Login response:', data);

      // JWTトークンの処理（APIから返される形式: access_token）
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userEmail', email);
        setAuthToken(data.access_token);
        await loadUserProfile();
        router.push('/dashboard');
      } else {
        throw new Error('トークンが取得できませんでした');
      }
    } catch (error: unknown) {
      console.error('Login error in context:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ログインに失敗しました');
      }
      throw error;
    }
  };

  // 新規登録処理
  const register = async (email: string, password: string, name?: string) => {
    setError(null);
    try {
      const data = await authApi.register(email, password, name);
      console.log('Register response:', data);

      // JWTトークンの処理（APIから返される形式: access_token）
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userEmail', email);
        setAuthToken(data.access_token);
        await loadUserProfile();
        router.push('/dashboard');
      } else {
        throw new Error('トークンが取得できませんでした');
      }
    } catch (error: unknown) {
      console.error('Register error in context:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('登録に失敗しました');
      }
      throw error;
    }
  };

  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setAuthToken('');
    setUser(null);
    router.push('/login');
  };

  // コンテキスト値
  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    register,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext); 