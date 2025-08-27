/**
 * ユーザー関連の型定義
 */

export interface BaseUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthUser extends BaseUser {
  username?: string;
}

export interface ProfileUser extends BaseUser {
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  _count?: {
    followers: number;
    following: number;
    audioContents: number;
  };
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}