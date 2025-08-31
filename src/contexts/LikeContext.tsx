"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { audioContentApi } from '../lib/api';
import { AudioContent } from '../types/AudioContent';

interface LikeContextType {
  likedContents: Set<number>;
  isLiked: (contentId: number) => boolean;
  toggleLike: (contentId: number) => Promise<{ isLiked: boolean; totalLikes: number }>;
  refreshLikedContents: () => Promise<void>;
  initializeLikedContents: (contentIds: number[]) => void;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

interface LikeProviderProps {
  children: ReactNode;
}

export const LikeProvider: React.FC<LikeProviderProps> = ({ children }) => {
  const [likedContents, setLikedContents] = useState<Set<number>>(new Set());

  const isLiked = useCallback((contentId: number): boolean => {
    return likedContents.has(contentId);
  }, [likedContents]);

  const toggleLike = useCallback(async (contentId: number) => {
    try {
      const result = await audioContentApi.toggleLike(contentId.toString());
      
      setLikedContents(prev => {
        const newSet = new Set(prev);
        if (result.isLiked) {
          newSet.add(contentId);
        } else {
          newSet.delete(contentId);
        }
        return newSet;
      });

      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const refreshLikedContents = useCallback(async () => {
    try {
      const result = await audioContentApi.getAll({ isLiked: 'true' });
      const likedIds = result.data.map((content: AudioContent) => content.id);
      setLikedContents(new Set(likedIds));
    } catch {
    }
  }, []);

  const initializeLikedContents = useCallback((contentIds: number[]) => {
    setLikedContents(new Set(contentIds));
  }, []);

  const contextValue = useMemo(() => ({
    likedContents,
    isLiked,
    toggleLike,
    refreshLikedContents,
    initializeLikedContents,
  }), [likedContents, isLiked, toggleLike, refreshLikedContents, initializeLikedContents]);

  return <LikeContext.Provider value={contextValue}>{children}</LikeContext.Provider>;
};

export const useLike = (): LikeContextType => {
  const context = useContext(LikeContext);
  if (context === undefined) {
    throw new Error('useLike must be used within a LikeProvider');
  }
  return context;
};