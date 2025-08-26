/**
 * 音声コンテンツ関連の型定義
 */

// 基本音声コンテンツ型
export interface AudioContent {
  id: number;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId: number;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
  };
  _count: {
    likes: number;
  };
  isLiked: boolean;
}

// カテゴリ型
export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

// 音声コンテンツ作成用型
export interface CreateAudioContentData {
  title: string;
  description: string;
  categoryId: number;
  duration: number;
}