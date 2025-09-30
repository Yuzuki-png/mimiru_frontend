"use client";

import React from 'react';
import { AudioContent } from '../../../types';
import { AudioContentCard } from '../audio';

interface DiscoverSectionProps {
  title: string;
  contents: AudioContent[];
  isLoading?: boolean;
  showActions?: {
    play?: boolean;
    like?: boolean;
    share?: boolean;
    addToPlaylist?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
  onAddToPlaylist?: (content: AudioContent) => void;
  onEdit?: (content: AudioContent) => void;
  onDelete?: (content: AudioContent) => void;
  emptyMessage?: string;
}

const DiscoverSection: React.FC<DiscoverSectionProps> = ({
  title,
  contents,
  isLoading = false,
  showActions = {
    play: true,
    like: true,
    share: true,
    addToPlaylist: true,
  },
  onAddToPlaylist,
  onEdit,
  onDelete,
  emptyMessage = 'コンテンツがありません',
}) => {
  // ローディングスケルトン
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      
      {contents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {contents.map((content) => (
            <AudioContentCard
              key={content.id}
              content={content}
              variant="default"
              showActions={showActions}
              onAddToPlaylist={onAddToPlaylist}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverSection;