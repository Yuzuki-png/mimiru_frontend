'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { userApi } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  _count: {
    followers: number;
    following: number;
    audioContents: number;
  };
}

interface FollowState {
  followingUsers: Set<string>;
  followersCount: Map<string, number>;
  followingCount: Map<string, number>;
  isLoading: boolean;
  error: string | null;
}

interface FollowContextType {
  state: FollowState;
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => Promise<{ isFollowing: boolean; followersCount: number }>;
  getFollowCounts: (userId: string) => { followers: number; following: number };
  refreshFollowData: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  getUserById: (userId: string) => Promise<User>;
  getUserContents: (userId: string, params?: { page?: number; limit?: number }) => Promise<unknown>;
  getFollowing: (userId?: string, params?: { page?: number; limit?: number }) => Promise<User[]>;
  getFollowers: (userId?: string, params?: { page?: number; limit?: number }) => Promise<User[]>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const useFollow = (): FollowContextType => {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};

interface FollowProviderProps {
  children: ReactNode;
}

export const FollowProvider: React.FC<FollowProviderProps> = ({ children }) => {
  const [state, setState] = useState<FollowState>({
    followingUsers: new Set<string>(),
    followersCount: new Map<string, number>(),
    followingCount: new Map<string, number>(),
    isLoading: false,
    error: null,
  });

  // ユーザーをフォローしているかチェック
  const isFollowing = useCallback((userId: string): boolean => {
    return state.followingUsers.has(userId);
  }, [state.followingUsers]);

  // フォロー/アンフォローの切り替え
  const toggleFollow = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await userApi.toggleFollow(userId);
      
      setState(prev => {
        const newFollowingUsers = new Set(prev.followingUsers);
        const newFollowersCount = new Map(prev.followersCount);
        
        if (result.isFollowing) {
          newFollowingUsers.add(userId);
        } else {
          newFollowingUsers.delete(userId);
        }
        
        newFollowersCount.set(userId, result.followersCount || 0);
        
        return {
          ...prev,
          followingUsers: newFollowingUsers,
          followersCount: newFollowersCount,
          isLoading: false,
        };
      });

      return {
        isFollowing: result.isFollowing,
        followersCount: result.followersCount || 0,
      };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'フォローの切り替えに失敗しました' 
      }));
      throw error;
    }
  }, []);

  // フォロー数を取得
  const getFollowCounts = useCallback((userId: string) => {
    return {
      followers: state.followersCount.get(userId) || 0,
      following: state.followingCount.get(userId) || 0,
    };
  }, [state.followersCount, state.followingCount]);

  // フォローデータを更新
  const refreshFollowData = useCallback(async (userId: string) => {
    try {
      const [followingResult, followersResult] = await Promise.all([
        userApi.getFollowing(userId, { limit: 1 }),
        userApi.getFollowers(userId, { limit: 1 }),
      ]);

      setState(prev => {
        const newFollowersCount = new Map(prev.followersCount);
        const newFollowingCount = new Map(prev.followingCount);
        
        newFollowersCount.set(userId, followersResult.total || followersResult.data?.length || 0);
        newFollowingCount.set(userId, followingResult.total || followingResult.data?.length || 0);
        
        return {
          ...prev,
          followersCount: newFollowersCount,
          followingCount: newFollowingCount,
        };
      });
    } catch {
      // エラーは静かに処理し、UIに影響を与えない
    }
  }, []);

  // ユーザー検索
  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    try {
      const result = await userApi.search(query);
      return result.data || result || [];
    } catch (error) {
      throw error;
    }
  }, []);

  // ユーザー情報を取得
  const getUserById = useCallback(async (userId: string): Promise<User> => {
    try {
      const result = await userApi.getById(userId);
      
      // フォロー数を更新
      if (result._count) {
        setState(prev => {
          const newFollowersCount = new Map(prev.followersCount);
          const newFollowingCount = new Map(prev.followingCount);
          
          newFollowersCount.set(userId, result._count.followers || 0);
          newFollowingCount.set(userId, result._count.following || 0);
          
          return {
            ...prev,
            followersCount: newFollowersCount,
            followingCount: newFollowingCount,
          };
        });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // ユーザーのコンテンツを取得
  const getUserContents = useCallback(async (userId: string, params?: { page?: number; limit?: number }) => {
    try {
      const result = await userApi.getContents(userId, params);
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // フォロー中のユーザー一覧を取得
  const getFollowing = useCallback(async (userId?: string, params?: { page?: number; limit?: number }): Promise<User[]> => {
    try {
      const result = await userApi.getFollowing(userId, params);
      return result.data || result || [];
    } catch (error) {
      throw error;
    }
  }, []);

  // フォロワー一覧を取得
  const getFollowers = useCallback(async (userId?: string, params?: { page?: number; limit?: number }): Promise<User[]> => {
    try {
      const result = await userApi.getFollowers(userId, params);
      return result.data || result || [];
    } catch (error) {
      throw error;
    }
  }, []);

  const contextValue: FollowContextType = {
    state,
    isFollowing,
    toggleFollow,
    getFollowCounts,
    refreshFollowData,
    searchUsers,
    getUserById,
    getUserContents,
    getFollowing,
    getFollowers,
  };

  return (
    <FollowContext.Provider value={contextValue}>
      {children}
    </FollowContext.Provider>
  );
};