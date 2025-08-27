"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { audioContentApi, playlistApi } from "../../../lib/api";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useLike } from "../../../contexts/LikeContext";
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ListBulletIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

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

interface PlaylistItem {
  id: number;
  playlistId: number;
  audioContentId: number;
  position: number;
  addedAt: string;
  audioContent: AudioContent;
}

export default function LibraryPage() {
  const router = useRouter();
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const { user } = useAuth();
  const { toggleLike } = useLike();
  const [myContents, setMyContents] = useState<AudioContent[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<'contents' | 'playlists'>('contents');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<AudioContent | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<number | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  const categories = [
    "all",
    "ビジネス",
    "教育",
    "エンターテイメント",
    "ニュース",
    "健康",
    "テクノロジー",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contentsResult, playlistsResult] = await Promise.all([
          audioContentApi.getAll({}),
          playlistApi.getAll()
        ]) as [{ data: AudioContent[] }, { data: Playlist[] }];
        setMyContents(contentsResult.data);
        setPlaylists(playlistsResult.data); 
        setError(null);
      } catch {
        setError("データの取得に失敗しました");
        setMyContents([]);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredContents =
    selectedCategory === "all"
      ? myContents
      : myContents.filter(
          (content) => content.category.name === selectedCategory,
        );

  const togglePlay = useCallback(
    async (content: AudioContent) => {
      const isCurrentlyPlaying =
        audioPlayerState.currentAudio?.id === content.id.toString() &&
        audioPlayerState.isPlaying;

      if (isCurrentlyPlaying) {
        await pauseAudio();
      } else {
        // S3署名付きURLまたはHTTPSのURLを直接使用
        const audioUrl = content.audioUrl;
        if (!audioUrl || !audioUrl.startsWith("http")) {
          return; // audioUrlがない場合は再生を中止
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
    [
      audioPlayerState.currentAudio,
      audioPlayerState.isPlaying,
      pauseAudio,
      playAudio,
    ],
  );

  const handleToggleLike = useCallback(
    async (contentId: number) => {
      setLikeLoading(contentId);
      setLikeError(null);
      
      try {
        const result = await toggleLike(contentId);
        
        // ローカルstateのいいね数を更新
        const updateContent = (content: AudioContent) =>
          content.id === contentId
            ? {
                ...content,
                isLiked: result.isLiked,
                _count: { ...content._count, likes: result.totalLikes },
              }
            : content;

        setMyContents(prev => prev.map(updateContent));
      } catch {
        setLikeError('いいねの更新に失敗しました。もう一度お試しください。');
        setTimeout(() => setLikeError(null), 5000);
      } finally {
        setLikeLoading(null);
      }
    },
    [toggleLike]
  );

  const handleEdit = () => {};

  const handleDelete = async (content: AudioContent) => {
    if (window.confirm("このコンテンツを削除しますか？")) {
      try {
        await audioContentApi.delete(content.id.toString());
        setMyContents(prev => prev.filter(c => c.id !== content.id));
        setSuccessMessage(`「${content.title}」を削除しました`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch {
        setError("コンテンツの削除に失敗しました");
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    try {
      // バックエンドAPI実装完了により有効化
      const newPlaylist = await playlistApi.create({
        name: newPlaylistName,
        description: newPlaylistDescription
      });
      
      setPlaylists(prev => [...prev, newPlaylist]);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreatePlaylist(false);
    } catch {
      setError("プレイリストの作成に失敗しました");
    }
  };

  const handleDeletePlaylist = useCallback(async (playlistId: number) => {
    if (window.confirm("このプレイリストを削除しますか？")) {
      try {
        // バックエンドAPI実装完了により有効化
        await playlistApi.delete(playlistId.toString());
        
        setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      } catch {
        setError("プレイリストの削除に失敗しました");
      }
    }
  }, []);

  const handleAddToPlaylist = async (playlistId: number, audioContent: AudioContent) => {
    try {
      // バックエンドAPI実装完了により有効化
      await playlistApi.addItem(playlistId.toString(), audioContent.id);
      
      // UI更新
      const selectedPlaylist = playlists.find(p => p.id === playlistId);
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId
          ? {
              ...playlist,
              _count: { items: playlist._count.items + 1 }
            }
          : playlist
      ));
      
      // 成功メッセージを表示
      setSuccessMessage(`「${audioContent.title}」を「${selectedPlaylist?.name}」に追加しました！`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      setShowAddToPlaylist(null);
    } catch {
      setError("プレイリストへの追加に失敗しました");
    }
  };

  const ContentCard = ({
    content,
  }: {
    content: AudioContent;
    index?: number;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
          {content.category.name}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {Math.floor(content.duration / 60)}:
            {(content.duration % 60).toString().padStart(2, "0")}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowAddToPlaylist(content)}
              className="p-1 text-gray-400 hover:text-green-500 transition-colors"
              title="プレイリストに追加"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            {/* 投稿者本人のみに編集・削除ボタンを表示 */}
            {user && user.id === content.author.id.toString() && (
              <>
                <button
                  onClick={() => handleEdit()}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="編集"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(content)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="削除"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <h4 
        className="text-gray-900 dark:text-white text-lg font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-blue-500 transition-colors"
        onClick={() => router.push(`/content/${content.id}`)}
      >
        {content.title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {content.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {content.author.name}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <EyeIcon className="h-4 w-4" />
            <span className="text-sm">0</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {new Date(content.createdAt).toLocaleDateString("ja-JP")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => togglePlay(content)}
          disabled={audioPlayerState.isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {audioPlayerState.isLoading &&
          audioPlayerState.currentAudio?.id === content.id.toString() ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : audioPlayerState.currentAudio?.id === content.id.toString() &&
            audioPlayerState.isPlaying ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          <span>
            {audioPlayerState.currentAudio?.id === content.id.toString() &&
            audioPlayerState.isPlaying
              ? "一時停止"
              : "再生"}
          </span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleToggleLike(content.id)}
            disabled={likeLoading === content.id}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {likeLoading === content.id ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
            ) : content.isLiked ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
            <span className={`text-sm ${content.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {content._count.likes}
            </span>
          </button>

          <button 
            onClick={() => {
              const url = `${window.location.origin}/content/${content.id}`;
              navigator.clipboard.writeText(url);
            }}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
            title="URLをコピー"
          >
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              マイライブラリ
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              あなたが投稿したコンテンツとプレイリストを管理できます
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreatePlaylist(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
              <ListBulletIcon className="h-5 w-5" />
              <span>プレイリスト作成</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/upload")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              <span>新規投稿</span>
            </button>
          </div>
        </div>
        
        {/* タブ切り替え */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('contents')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'contents'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            コンテンツ ({myContents.length})
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'playlists'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            プレイリスト ({playlists.length})
          </button>
        </div>
      </motion.div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {activeTab === 'contents' ? '総投稿数' : 'プレイリスト数'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {activeTab === 'contents' ? myContents.length : playlists.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              {activeTab === 'contents' ? (
                <PlayIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <ListBulletIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {activeTab === 'contents' ? '総いいね数' : 'プレイリスト内アイテム数'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {activeTab === 'contents' 
                  ? myContents.reduce((total, content) => total + content._count.likes, 0)
                  : playlists.reduce((total, playlist) => total + playlist._count.items, 0)
                }
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* カテゴリフィルター（コンテンツタブの場合のみ表示） */}
      {activeTab === 'contents' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            カテゴリフィルター
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category === "all" ? "すべて" : category}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* メインコンテンツエリア */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        {activeTab === 'contents' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                投稿したコンテンツ
              </h3>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {filteredContents.length}件
              </span>
            </div>

            {filteredContents.length === 0 ? (
              <div className="text-center py-12">
                <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  まだコンテンツがありません
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  最初のコンテンツを投稿して、あなたの知識を共有しましょう
                </p>
                <button
                  onClick={() => router.push("/dashboard/upload")}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>コンテンツを投稿</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((content, index) => (
                  <ContentCard key={content.id} content={content} index={index} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                マイプレイリスト
              </h3>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {playlists.length}件
              </span>
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-12">
                <ListBulletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  まだプレイリストがありません
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  プレイリストを作成して、お気に入りのコンテンツをまとめましょう
                </p>
                <button
                  onClick={() => setShowCreatePlaylist(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                >
                  <ListBulletIcon className="h-5 w-5" />
                  <span>プレイリストを作成</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} onDelete={handleDeletePlaylist} />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* プレイリスト作成モーダル */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                新しいプレイリスト
              </h3>
              <button
                onClick={() => setShowCreatePlaylist(false)}
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
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="プレイリスト名を入力"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  説明（オプション）
                </label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="プレイリストの説明を入力"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreatePlaylist(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* プレイリストに追加モーダル */}
      {showAddToPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                プレイリストに追加
              </h3>
              <button
                onClick={() => setShowAddToPlaylist(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                「{showAddToPlaylist.title}」を追加するプレイリストを選択してください
              </p>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id, showAddToPlaylist)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ListBulletIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{playlist.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{playlist._count.items}アイテム</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {playlists.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                プレイリストがありません
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// プレイリストカードコンポーネント
const PlaylistCard = ({ playlist, onDelete }: { playlist: Playlist; onDelete: (id: number) => void }) => {
  const router = useRouter();
  
  return (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-2">
        <ListBulletIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
          プレイリスト
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => {}}
          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
          title="編集"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(playlist.id)}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="削除"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>

    <h4 className="text-gray-900 dark:text-white text-lg font-semibold mb-2 line-clamp-2">
      {playlist.name}
    </h4>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
      {playlist.description || "説明はありません"}
    </p>

    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Bars3Icon className="h-4 w-4 text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {playlist._count.items}アイテム
        </span>
      </div>
      <span className="text-gray-500 dark:text-gray-400 text-xs">
        {new Date(playlist.createdAt).toLocaleDateString("ja-JP")}
      </span>
    </div>


      <div className="flex items-end space-x-3">
        <button
          onClick={() => router.push(`/dashboard/library/playlist/${playlist.id}`)}
          className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
        >
          <EyeIcon className="h-5 w-5" />
          <span className="text-sm">詳細</span>
        </button>

        <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
