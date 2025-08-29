/**
 * 音声コンテンツカードのアクションボタン群
 */

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AudioContent } from '../../../types';
import { Button } from '../../ui';

interface AudioContentCardActionsProps {
  content: AudioContent & { isLiked?: boolean };
  showActions: {
    like?: boolean;
    share?: boolean;
    addToPlaylist?: boolean;
    edit?: boolean;
    delete?: boolean;
    removeFromPlaylist?: boolean;
  };
  onEdit?: (content: AudioContent) => void;
  onDelete?: (content: AudioContent) => void;
  onRemoveFromPlaylist?: (contentId: number) => void;
  onAddToPlaylist?: (content: AudioContent) => void;
  onShare?: () => void;
  onToggleLike?: () => void;
  isLikeLoading?: boolean;
}

const AudioContentCardActions: React.FC<AudioContentCardActionsProps> = ({
  content,
  showActions,
  onEdit,
  onDelete,
  onRemoveFromPlaylist,
  onAddToPlaylist,
  onShare,
  onToggleLike,
  isLikeLoading = false,
}) => {
  const handleEdit = () => {
    onEdit?.(content);
  };

  const handleDelete = () => {
    if (window.confirm('この音声コンテンツを削除しますか？')) {
      onDelete?.(content);
    }
  };

  const handleRemoveFromPlaylist = () => {
    if (window.confirm('このアイテムをプレイリストから削除しますか？')) {
      onRemoveFromPlaylist?.(content.id);
    }
  };

  const handleAddToPlaylist = () => {
    onAddToPlaylist?.(content);
  };

  return (
    <div className="flex items-center space-x-2">
      {showActions.like && (
        <motion.button
          onClick={() => onToggleLike?.()}
          disabled={isLikeLoading}
          className={`p-2 rounded-full transition-colors ${
            content.isLiked
              ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          } disabled:opacity-50`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLikeLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill={content.isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </motion.button>
      )}

      {showActions.share && (
        <motion.button
          onClick={onShare}
          className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
        </motion.button>
      )}

      {showActions.addToPlaylist && (
        <motion.button
          onClick={handleAddToPlaylist}
          className="p-2 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </motion.button>
      )}

      {showActions.edit && (
        <Button
          onClick={handleEdit}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-blue-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Button>
      )}

      {showActions.delete && (
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-red-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      )}

      {showActions.removeFromPlaylist && (
        <Button
          onClick={handleRemoveFromPlaylist}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-red-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      )}
    </div>
  );
};

export default AudioContentCardActions;