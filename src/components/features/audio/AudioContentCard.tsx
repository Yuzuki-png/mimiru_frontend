/**
 * 統一された音声コンテンツカードコンポーネント
 */

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AudioContent } from '../../../types';
import { useAudioPlayer } from '../../../contexts/AudioPlayerContext';
import { useLike } from '../../../contexts/LikeContext';
import { useToastContext } from '../../../contexts/ToastContext';
import { ErrorHandler } from '../../../lib/errorHandler';
import { Button, Card } from '../../ui';
import AudioContentCardActions from './AudioContentCardActions';

type CardVariant = 'compact' | 'default' | 'detailed' | 'playlist-item';
type PlayButtonStyle = 'circle' | 'rectangle';

interface AudioContentCardProps {
  content: AudioContent;
  variant?: CardVariant;
  playButtonStyle?: PlayButtonStyle;
  className?: string;
  showActions?: {
    play?: boolean;
    like?: boolean;
    share?: boolean;
    addToPlaylist?: boolean;
    edit?: boolean;
    delete?: boolean;
    removeFromPlaylist?: boolean;
  };
  
  // プレイリスト関連
  playlistPosition?: number;
  showPosition?: boolean;
  
  // イベントハンドラ
  onEdit?: (content: AudioContent) => void;
  onDelete?: (content: AudioContent) => void;
  onRemoveFromPlaylist?: (contentId: number) => void;
  onAddToPlaylist?: (content: AudioContent) => void;
}

const AudioContentCard: React.FC<AudioContentCardProps> = ({
  content,
  variant = 'default',
  playButtonStyle = 'circle',
  className = '',
  showActions = {
    play: true,
    like: true,
    share: true,
    addToPlaylist: false,
    edit: false,
    delete: false,
    removeFromPlaylist: false,
  },
  playlistPosition,
  showPosition = false,
  onEdit,
  onDelete,
  onRemoveFromPlaylist,
  onAddToPlaylist,
}) => {
  const { state, playAudio, pauseAudio } = useAudioPlayer();
  const { currentAudio, isPlaying } = state;
  const { toggleLike, isLiked } = useLike();
  const { showSuccess, showError } = useToastContext();
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const contentIsLiked = isLiked(content.id);

  const isCurrentlyPlaying = currentAudio?.id === content.id.toString() && isPlaying;
  
  const handleTogglePlay = () => {
    if (isCurrentlyPlaying) {
      pauseAudio();
    } else {
      playAudio({
        id: content.id.toString(),
        title: content.title,
        description: content.description,
        audioUrl: content.audioUrl,
        duration: content.duration,
      });
    }
  };

  const handleToggleLike = async () => {
    if (isLikeLoading) return;
    
    setIsLikeLoading(true);
    try {
      const result = await toggleLike(content.id);
      showSuccess(result.isLiked ? 'いいねしました' : 'いいねを解除しました');
    } catch (error) {
      showError('いいね処理に失敗しました', error instanceof Error ? error.message : '不明なエラー');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/content/${content.id}`;
    await ErrorHandler.handleAsyncOperation(
      () => navigator.clipboard.writeText(url),
      {
        onError: (error) => showError('共有に失敗しました', error.userMessage),
      }
    );
    showSuccess('URLをコピーしました', 'クリップボードにURLがコピーされました');
  };

  const renderPlayButton = () => {
    if (playButtonStyle === 'circle') {
      return (
        <Button
          onClick={handleTogglePlay}
          variant="primary"
          size="sm"
          className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
          animated
        >
          {isCurrentlyPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zM14 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a1 1 0 011.35-.814l9 4.5a1 1 0 010 1.628l-9 4.5A1 1 0 015 12V4z" clipRule="evenodd" />
            </svg>
          )}
        </Button>
      );
    }

    return (
      <Button
        onClick={handleTogglePlay}
        variant="primary"
        size="sm"
        animated
      >
        {isCurrentlyPlaying ? '一時停止' : '再生'}
      </Button>
    );
  };

  const categoryTag = (
    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
      {content.category.name}
    </span>
  );

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className="flex items-center space-x-4">
            {showPosition && playlistPosition && (
              <div className="flex-shrink-0 text-gray-500 text-sm font-medium w-6">
                {playlistPosition}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/content/${content.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {content.title}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {content.author.name} • {formatDuration(content.duration)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {showActions.play && renderPlayButton()}
              <AudioContentCardActions
                content={{ ...content, isLiked: contentIsLiked }}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
                onRemoveFromPlaylist={onRemoveFromPlaylist}
                onAddToPlaylist={onAddToPlaylist}
                onShare={handleShare}
                onToggleLike={handleToggleLike}
                isLikeLoading={isLikeLoading}
              />
            </div>
          </div>
        );

      case 'playlist-item':
        return (
          <div className="flex items-center space-x-4">
            {showPosition && playlistPosition && (
              <div className="flex-shrink-0 text-gray-500 text-lg font-bold w-8">
                {playlistPosition}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/content/${content.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {content.title}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {content.description}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {content.author.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDuration(content.duration)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {showActions.play && renderPlayButton()}
              <AudioContentCardActions
                content={{ ...content, isLiked: contentIsLiked }}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
                onRemoveFromPlaylist={onRemoveFromPlaylist}
                onAddToPlaylist={onAddToPlaylist}
                onShare={handleShare}
                onToggleLike={handleToggleLike}
                isLikeLoading={isLikeLoading}
              />
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              {categoryTag}
              <AudioContentCardActions
                content={{ ...content, isLiked: contentIsLiked }}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
                onRemoveFromPlaylist={onRemoveFromPlaylist}
                onAddToPlaylist={onAddToPlaylist}
                onShare={handleShare}
                onToggleLike={handleToggleLike}
                isLikeLoading={isLikeLoading}
              />
            </div>
            
            <div>
              <Link href={`/content/${content.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {content.title}
                </h3>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {content.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{content.author.name}</span>
                <span>{formatDuration(content.duration)}</span>
                <span>{content._count.likes} いいね</span>
              </div>
              {showActions.play && renderPlayButton()}
            </div>
          </div>
        );

      default: // 'default'
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              {categoryTag}
              <div className="flex items-center space-x-1">
                <AudioContentCardActions
                  content={{ ...content, isLiked: contentIsLiked }}
                  showActions={showActions}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRemoveFromPlaylist={onRemoveFromPlaylist}
                  onAddToPlaylist={onAddToPlaylist}
                  onShare={handleShare}
                  onToggleLike={handleToggleLike}
                  isLikeLoading={isLikeLoading}
                />
              </div>
            </div>
            
            <div>
              <Link href={`/content/${content.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {content.title}
                </h3>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {content.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <span>{content.author.name}</span>
                <span>{formatDuration(content.duration)}</span>
              </div>
              {showActions.play && renderPlayButton()}
            </div>
          </div>
        );
    }
  };

  return (
    <Card
      variant="default"
      padding={variant === 'compact' || variant === 'playlist-item' ? 'sm' : 'md'}
      className={`transition-all duration-200 hover:shadow-md ${className}`}
      animated
      hoverable
    >
      {renderContent()}
    </Card>
  );
};

export default AudioContentCard;
export type { AudioContentCardProps, CardVariant, PlayButtonStyle };