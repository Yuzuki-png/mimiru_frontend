/**
 * ユーザー関連の型定義
 */

// 基本ユーザー型
export interface BaseUser {
  id: string;
  email: string;
  name: string;
}

// 認証用ユーザー型
export interface AuthUser extends BaseUser {
  username?: string;
}

// プロファイル表示用ユーザー型
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

// プロファイル編集用ユーザー型
export interface UserProfile extends BaseUser {
  id: number; // バックエンドでnumber型の場合
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}