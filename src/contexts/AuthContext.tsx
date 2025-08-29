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
  login: (emailOrToken: string, password?: string) => Promise<void>;
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
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);

      
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth/');
      
      if (!isAuthPage && pathname) {
        loadUserProfile();
      } else {
        const savedUserEmail = localStorage.getItem('userEmail');
        const savedUserName = localStorage.getItem('userName');
        setUser({
          id: 'dashboard_user',
          email: savedUserEmail || 'user@example.com',
          name: (savedUserName && savedUserName !== 'null') ? savedUserName : 'Google User',
        });
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async (skipAuthReset = false) => {
    
    try {
      const userData = await authApi.getProfile();

      
      localStorage.setItem('userEmail', userData.email);
      if (userData.name) {
        localStorage.setItem('userName', userData.name);
      }
      
      setUser({
        id: userData.id.toString(),
        email: userData.email,
        name: userData.name,
      });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {

        
        if (!skipAuthReset) {
          setAuthToken('');
          setUser(null);
          return;
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            const savedUserEmail = localStorage.getItem('userEmail');
            const savedUserName = localStorage.getItem('userName');
            setUser({
              id: 'google_user',
              email: savedUserEmail || 'user@example.com',
              name: (savedUserName && savedUserName !== 'null') ? savedUserName : 'Google User',
            });
          }
          return;
        }
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        const savedUserEmail = localStorage.getItem('userEmail');
        const savedUserName = localStorage.getItem('userName');
        setUser({
          id: 'unknown',
          email: savedUserEmail || 'user@example.com',
          name: (savedUserName && savedUserName !== 'null') ? savedUserName : 'Google User',
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrToken: string, password?: string) => {
    
    setError(null);
    try {
      let token: string;
      
      if (password) {
        const data = await authApi.login(emailOrToken, password);
        if (data.access_token) {
          token = data.access_token;
          localStorage.setItem('userEmail', emailOrToken);
        } else {
          throw new Error('トークンが取得できませんでした');
        }
      } else {
        token = emailOrToken;
      }
      localStorage.setItem('token', token);
      setAuthToken(token);
      
      if (password) {
        await loadUserProfile();
      } else {
        await loadUserProfile(true);
      }
      router.push('/dashboard');
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