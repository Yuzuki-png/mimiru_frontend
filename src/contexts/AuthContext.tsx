"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setAuthToken } from '../lib/api';

// ユーザータイプの定義
interface User {
  id: string;
  email: string;
  username?: string;
}

// 認証コンテキストの型定義
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// デフォルト値の作成
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
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
      setUser(userData);
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ログイン処理
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.access_token);
      setAuthToken(data.access_token);
      await loadUserProfile();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('ログインエラー:', error);
      setError(error.response?.data?.message || 'ログインに失敗しました');
      throw error;
    }
  };

  // 新規登録処理
  const register = async (email: string, password: string, username?: string) => {
    setError(null);
    try {
      const data = await authApi.register(email, password, username);
      localStorage.setItem('token', data.access_token);
      setAuthToken(data.access_token);
      await loadUserProfile();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('登録エラー:', error);
      setError(error.response?.data?.message || '登録に失敗しました');
      throw error;
    }
  };

  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('token');
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

// カスタムフックとしてエクスポート
export const useAuth = () => useContext(AuthContext); 