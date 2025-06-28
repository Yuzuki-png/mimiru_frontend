"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setAuthToken } from '../lib/api';
import { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  error: null
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await authApi.getProfile();
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        name: userData.name,
      });
    } catch (error) {

      if (error instanceof AxiosError && error.response?.status === 401) {
        setAuthToken('');
        setUser(null);
        return;
      }

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

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await authApi.login(email, password);

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
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ログインに失敗しました');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setError(null);
    try {
      const data = await authApi.register(email, password, name);

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
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('登録に失敗しました');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setAuthToken('');
    setUser(null);
    router.push('/login');
  };

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