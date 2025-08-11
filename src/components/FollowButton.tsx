'use client';

import React, { useState } from 'react';
import { useFollow } from '../contexts/FollowContext';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

interface FollowButtonProps {
  userId: string;
  userName?: string;
  variant?: 'default' | 'small' | 'large';
  className?: string;
  onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  variant = 'default',
  className = '',
  onFollowChange,
}) => {
  const { isFollowing, toggleFollow, state } = useFollow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const following = isFollowing(userId);

  const handleToggleFollow = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await toggleFollow(userId);
      
      // 成功時のコールバック
      if (onFollowChange) {
        onFollowChange(result.isFollowing, result.followersCount);
      }

      // 成功メッセージ（オプション）

    } catch {
      setError('フォローの切り替えに失敗しました');
      
      // エラーを3秒後にクリア
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // バリアントに応じたスタイルを取得
  const getVariantStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'small':
        return `${baseStyles} px-3 py-1.5 text-xs`;
      case 'large':
        return `${baseStyles} px-6 py-3 text-base`;
      default:
        return `${baseStyles} px-4 py-2 text-sm`;
    }
  };

  // フォロー状態に応じたスタイルとアイコンを取得
  const getFollowStyles = () => {
    if (following) {
      return {
        styles: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 focus:ring-red-500',
        icon: <UserMinusIcon className={variant === 'small' ? 'h-3 w-3' : variant === 'large' ? 'h-5 w-5' : 'h-4 w-4'} />,
        text: 'フォロー中',
        hoverText: 'フォロー解除',
      };
    } else {
      return {
        styles: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
        icon: <UserPlusIcon className={variant === 'small' ? 'h-3 w-3' : variant === 'large' ? 'h-5 w-5' : 'h-4 w-4'} />,
        text: 'フォロー',
        hoverText: 'フォロー',
      };
    }
  };

  const variantStyles = getVariantStyles();
  const { styles, icon, text, hoverText } = getFollowStyles();

  return (
    <div className="relative">
      <button
        onClick={handleToggleFollow}
        disabled={isLoading || state.isLoading}
        className={`${variantStyles} ${styles} ${className} disabled:opacity-50 disabled:cursor-not-allowed group`}
        title={isLoading ? '処理中...' : hoverText}
      >
        {isLoading ? (
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${
            variant === 'small' ? 'h-3 w-3' : variant === 'large' ? 'h-5 w-5' : 'h-4 w-4'
          }`} />
        ) : (
          <>
            <span className="mr-2">{icon}</span>
            <span className="group-hover:hidden">{text}</span>
            <span className="hidden group-hover:inline">{hoverText}</span>
          </>
        )}
      </button>

      {/* エラーメッセージ */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-md shadow-lg z-10 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default FollowButton;