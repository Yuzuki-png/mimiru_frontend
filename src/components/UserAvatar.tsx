"use client";

import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface UserAvatarProps {
  avatar?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const iconSizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

export default function UserAvatar({ avatar, name, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];

  if (avatar) {
    return (
      <div className={`${sizeClass} relative rounded-full overflow-hidden ${className}`}>
        <Image
          src={avatar}
          alt={name || 'ユーザーアバター'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          onError={(e) => {
            // 画像読み込みエラー時はデフォルトアバターに切り替え
            const target = e.target as HTMLElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg class="${iconSizeClass} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  // デフォルトアバター
  return (
    <div className={`${sizeClass} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${className}`}>
      <UserIcon className={`${iconSizeClass} text-white`} />
    </div>
  );
}