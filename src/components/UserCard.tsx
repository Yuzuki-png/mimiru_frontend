'use client';

import React from 'react';
import Link from 'next/link';
import { useFollow } from '../contexts/FollowContext';
import FollowButton from './FollowButton';
import { 
  UserCircleIcon, 
  MapPinIcon, 
  LinkIcon,
  CalendarIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

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

interface UserCardProps {
  user: User;
  showBio?: boolean;
  showStats?: boolean;
  showFollowButton?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

interface FollowChangeCallback {
  (isFollowing: boolean, followersCount: number): void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  showBio = true,
  showStats = true,
  showFollowButton = true,
  variant = 'default',
  className = '',
}) => {
  const { getFollowCounts, refreshFollowData } = useFollow();
  
  // フォロー数を取得（ローカルキャッシュから）
  const localCounts = getFollowCounts(user.id);
  const followersCount = localCounts.followers || user._count.followers;
  const followingCount = localCounts.following || user._count.following;

  const handleFollowChange: FollowChangeCallback = () => {
    // フォロー状態変更時の処理（必要に応じて）
    
    // フォローデータを更新
    refreshFollowData(user.id);
  };

  // バリアントに応じたスタイルを取得
  const getCardStyles = () => {
    const baseStyles = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200';
    
    switch (variant) {
      case 'compact':
        return `${baseStyles} p-4`;
      case 'detailed':
        return `${baseStyles} p-6`;
      default:
        return `${baseStyles} p-5`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
    });
  };

  const cardStyles = getCardStyles();

  return (
    <div className={`${cardStyles} ${className}`}>
      <div className="flex items-start space-x-4">
        {/* ユーザーアイコン */}
        <Link 
          href={`/users/${user.id}`}
          className="flex-shrink-0 group"
        >
          <UserCircleIcon className={`${
            variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12'
          } text-gray-400 group-hover:text-gray-500 transition-colors`} />
        </Link>

        <div className="flex-1 min-w-0">
          {/* ユーザー名とフォローボタン */}
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href={`/users/${user.id}`}
                className="block"
              >
                <h3 className={`${
                  variant === 'compact' ? 'text-base' : 'text-lg'
                } font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate`}>
                  {user.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>

            {showFollowButton && (
              <FollowButton
                userId={user.id}
                userName={user.name}
                variant={variant === 'compact' ? 'small' : 'default'}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>

          {/* バイオ */}
          {showBio && user.bio && variant !== 'compact' && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* ユーザー情報 */}
          {variant === 'detailed' && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {user.location && (
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {user.location}
                </div>
              )}
              
              {user.website && (
                <a 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-500 transition-colors"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Website
                </a>
              )}
              
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDate(user.createdAt)}に参加
              </div>
            </div>
          )}

          {/* 統計情報 */}
          {showStats && (
            <div className={`${variant === 'compact' ? 'mt-2' : 'mt-3'} flex items-center space-x-6 text-sm`}>
              <Link 
                href={`/users/${user.id}/contents`}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                <span className="font-medium">{user._count.audioContents}</span>
                <span className="ml-1">コンテンツ</span>
              </Link>
              
              <Link 
                href={`/users/${user.id}/followers`}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="font-medium">{followersCount}</span>
                <span className="ml-1">フォロワー</span>
              </Link>
              
              <Link 
                href={`/users/${user.id}/following`}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="font-medium">{followingCount}</span>
                <span className="ml-1">フォロー中</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;