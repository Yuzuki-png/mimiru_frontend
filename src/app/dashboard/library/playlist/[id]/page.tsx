"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { playlistApi, audioContentApi } from "../../../../../lib/api";
import { config } from "../../../../../lib/config";
import { useAudioPlayer } from "../../../../../contexts/AudioPlayerContext";
import { useLike } from "../../../../../contexts/LikeContext";
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  Bars3Icon,
  XMarkIcon,
  ListBulletIcon,
  PlusIcon,
  LinkIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface AudioContent {
  id: number;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
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

interface PlaylistItem {
  id: number;
  playlistId: number;
  audioContentId: number;
  position: number;
  addedAt: string;
  audioContent: AudioContent;
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
  items: PlaylistItem[];
}

export default function PlaylistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const playlistId = params.id as string;
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const { toggleLike } = useLike();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [availableContents, setAvailableContents] = useState<AudioContent[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        const result = await playlistApi.getById(playlistId);
        setPlaylist(result);
        setEditName(result.name);
        setEditDescription(result.description || "");
        setError(null);
      } catch {
        setError("プレイリストの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId]);

  const fetchAvailableContents = useCallback(async () => {
    try {
      setLoadingContents(true);
      const result = await audioContentApi.getAll({});
      // プレイリストに既に追加されているコンテンツを除外
      const existingContentIds = playlist?.items.map(item => item.audioContent.id) || [];
      const availableContents = result.data.filter(
        (content: AudioContent) => !existingContentIds.includes(content.id)
      );
      setAvailableContents(availableContents);
    } catch {
      setError("コンテンツの取得に失敗しました");
    } finally {
      setLoadingContents(false);
    }
  }, [playlist]);

  const handleOpenAddContentModal = useCallback(() => {
    setShowAddContentModal(true);
    fetchAvailableContents();
  }, [fetchAvailableContents]);

  // クエリパラメータで add=true が設定されている場合、コンテンツ追加モーダルを開く
  useEffect(() => {
    const shouldOpenAddModal = searchParams.get('add') === 'true';
    if (shouldOpenAddModal && playlist) {
      handleOpenAddContentModal();
      // URLからクエリパラメータを削除
      const url = new URL(window.location.href);
      url.searchParams.delete('add');
      router.replace(url.pathname);
    }
  }, [searchParams, playlist, router, handleOpenAddContentModal]);

  const togglePlay = useCallback(
    async (content: AudioContent) => {
      const isCurrentlyPlaying =
        audioPlayerState.currentAudio?.id === content.id.toString() &&
        audioPlayerState.isPlaying;

      if (isCurrentlyPlaying) {
        await pauseAudio();
      } else {
        let audioUrl;
        if (content.audioUrl && content.audioUrl.startsWith("http")) {
          audioUrl = content.audioUrl;
        } else if (content.audioUrl) {
          const path = content.audioUrl.startsWith("/")
            ? content.audioUrl
            : `/${content.audioUrl}`;
          // 開発環境では現在のホスト（localhost:4000）を使用、本番環境では環境変数を使用
          const baseUrl = process.env.NODE_ENV === 'development' 
            ? `${window.location.protocol}//${window.location.host}`
            : config.apiBaseUrl;
          audioUrl = `${baseUrl}${path}`;
        } else {
          return;
        }

        const audioContent = {
          id: content.id.toString(),
          title: content.title,
          description: content.description,
          audioUrl: audioUrl,
          duration: content.duration,
        };

        await playAudio(audioContent);
      }
    },
    [audioPlayerState.currentAudio, audioPlayerState.isPlaying, pauseAudio, playAudio]
  );

  const handleToggleLike = useCallback(
    async (contentId: number) => {
      setLikeLoading(contentId);
      setLikeError(null);
      
      try {
        const result = await toggleLike(contentId);
        
        // ローカルstateのいいね数を更新
        setPlaylist(prev => prev ? {
          ...prev,
          items: prev.items.map(item =>
            item.audioContent.id === contentId
              ? {
                  ...item,
                  audioContent: {
                    ...item.audioContent,
                    isLiked: result.isLiked,
                    _count: { ...item.audioContent._count, likes: result.totalLikes }
                  }
                }
              : item
          )
        } : null);
      } catch {
        setLikeError('いいねの更新に失敗しました。もう一度お試しください。');
        setTimeout(() => setLikeError(null), 5000);
      } finally {
        setLikeLoading(null);
      }
    },
    [toggleLike]
  );

  const handleRemoveFromPlaylist = async (itemId: number) => {
    if (window.confirm("このアイテムをプレイリストから削除しますか？")) {
      try {
        await playlistApi.removeItem(playlistId, itemId.toString());
        setPlaylist(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId),
          _count: { items: prev._count.items - 1 }
        } : null);
      } catch {
        setError("アイテムの削除に失敗しました");
      }
    }
  };

  const handleEditPlaylist = async () => {
    if (!editName.trim()) return;
    
    try {
      const updatedPlaylist = await playlistApi.update(playlistId, {
        name: editName,
        description: editDescription
      });
      setPlaylist(prev => prev ? { ...prev, ...updatedPlaylist } : null);
      setShowEditModal(false);
    } catch {
      setError("プレイリストの更新に失敗しました");
    }
  };

  const handlePlayAll = async () => {
    if (!playlist || playlist.items.length === 0) return;
    
    const firstItem = playlist.items[0];
    await togglePlay(firstItem.audioContent);
  };

  const handleAddContent = async (contentId: number) => {
    try {
      await playlistApi.addItem(playlistId, contentId);
      
      // プレイリストを再取得して更新
      const updatedPlaylist = await playlistApi.getById(playlistId);
      setPlaylist(updatedPlaylist);
      
      // 利用可能コンテンツリストから削除
      const addedContent = availableContents.find(content => content.id === contentId);
      setAvailableContents(prev => prev.filter(content => content.id !== contentId));
      
      // 成功メッセージを表示
      setSuccessMessage(`「${addedContent?.title}」をプレイリストに追加しました！`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError("コンテンツの追加に失敗しました");
    }
  };

  const handleSharePlaylist = () => {
    const currentUrl = window.location.href.replace('?add=true', '');
    setShareUrl(currentUrl);
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSuccessMessage("URLをクリップボードにコピーしました！");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch {
      setSuccessMessage("URLのコピーに失敗しました");
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const ItemCard = ({ item, index }: { item: PlaylistItem; index: number }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {index + 1}
            </span>
          </div>
          <div>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
              {item.audioContent.category.name}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {Math.floor(item.audioContent.duration / 60)}:
            {(item.audioContent.duration % 60).toString().padStart(2, "0")}
          </span>
          <button
            onClick={() => handleRemoveFromPlaylist(item.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="プレイリストから削除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h4 className="text-gray-900 dark:text-white text-lg font-semibold mb-2 line-clamp-2">
        {item.audioContent.title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {item.audioContent.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {item.audioContent.author.name}
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {new Date(item.addedAt).toLocaleDateString("ja-JP")}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => togglePlay(item.audioContent)}
          disabled={audioPlayerState.isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {audioPlayerState.isLoading &&
          audioPlayerState.currentAudio?.id === item.audioContent.id.toString() ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : audioPlayerState.currentAudio?.id === item.audioContent.id.toString() &&
            audioPlayerState.isPlaying ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          <span>
            {audioPlayerState.currentAudio?.id === item.audioContent.id.toString() &&
            audioPlayerState.isPlaying
              ? "一時停止"
              : "再生"}
          </span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleToggleLike(item.audioContent.id)}
            disabled={likeLoading === item.audioContent.id}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {likeLoading === item.audioContent.id ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
            ) : item.audioContent.isLiked ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
            <span className={`text-sm ${item.audioContent.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {item.audioContent._count.likes}
            </span>
          </button>

          <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          読み込み中...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          プレイリストが見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 成功メッセージ */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        >
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{successMessage}</span>
        </motion.div>
      )}

      {/* エラーメッセージ */}
      {likeError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        >
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{likeError}</span>
          <button 
            onClick={() => setLikeError(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>戻る</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAddContentModal}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>コンテンツを追加</span>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
              <span>編集</span>
            </button>
            <button
              onClick={handlePlayAll}
              disabled={playlist.items.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 rounded-lg transition-colors"
            >
              <PlayIcon className="h-5 w-5" />
              <span>すべて再生</span>
            </button>
            <button
              onClick={handleSharePlaylist}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              <span>共有</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
            <ListBulletIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
            <p className="text-green-100 mt-1">
              {playlist.description || "説明はありません"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-green-100">
          <div className="flex items-center space-x-2">
            <Bars3Icon className="h-5 w-5" />
            <span className="text-lg font-medium">{playlist._count.items}</span>
            <span>アイテム</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span className="text-lg font-medium">
              {Math.floor(
                playlist.items.reduce(
                  (total, item) => total + item.audioContent.duration,
                  0
                ) / 60
              )}
            </span>
            <span>分</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              作成日: {new Date(playlist.createdAt).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* プレイリストアイテム */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            プレイリストアイテム
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {playlist.items.length}件
          </span>
        </div>

        {playlist.items.length === 0 ? (
          <div className="text-center py-12">
            <ListBulletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              プレイリストは空です
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ライブラリページからコンテンツを追加してください
            </p>
            <button
              onClick={() => router.push("/dashboard/library")}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>ライブラリに戻る</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {playlist.items
              .sort((a, b) => a.position - b.position)
              .map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
          </div>
        )}
      </motion.div>

      {/* 編集モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                プレイリストを編集
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  プレイリスト名
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  説明
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleEditPlaylist}
                  disabled={!editName.trim()}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* コンテンツ追加モーダル */}
      {showAddContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                コンテンツを追加
              </h3>
              <button
                onClick={() => setShowAddContentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                プレイリストに追加するコンテンツを選択してください
              </p>
            </div>
            
            {loadingContents ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">読み込み中...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* 成功メッセージ */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center space-x-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-green-700 dark:text-green-300 font-medium text-sm">{successMessage}</span>
                  </motion.div>
                )}
                
                {availableContents.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    追加可能なコンテンツがありません
                  </p>
                ) : (
                  availableContents.map((content) => (
                    <div
                      key={content.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <PlayIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {content.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{content.category.name}</span>
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}
                            </span>
                            <span>{content.author.name}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddContent(content.id)}
                        className="flex items-center space-x-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm font-medium"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>追加</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 共有モーダル */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                プレイリストを共有
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                このプレイリストを共有するためのURLです
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  <span>コピー</span>
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>※ このURLを知っている人なら誰でもプレイリストを閲覧できます</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}