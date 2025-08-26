/**
 * プレイリスト関連の型定義
 */

import { AudioContent } from './AudioContent';

// プレイリストアイテム型
export interface PlaylistItem {
  id: number;
  playlistId: number;
  audioContentId: number;
  position: number;
  addedAt: string;
  audioContent: AudioContent;
}

// 基本プレイリスト型
export interface BasePlaylist {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
}

// アイテムを含むプレイリスト型
export interface PlaylistWithItems extends BasePlaylist {
  items: PlaylistItem[];
}