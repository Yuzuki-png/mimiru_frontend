"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { audioContentApi, playlistApi } from "../../../lib/api";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ListBulletIcon,
  XMarkIcon,
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


interface Playlist {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
}

export default function LikedPage() {
  const { user } = useAuth();
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const [likedContents, setLikedContents] = useState<AudioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<AudioContent | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categories = [
    "all",
    "ビジネス",
    "ライフスタイル",
    "テクノロジー",
    "教育",
    "健康",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [result, playlistsResult] = await Promise.all([
          audioContentApi.getAll({ isLiked: true }),
          playlistApi.getAll()
        ]);
        setLikedContents(result.data);
        setPlaylists(playlistsResult.data);
      } catch {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredContents = likedContents.filter(
    (content) =>
      selectedCategory === "all" ||
      content.category.name === selectedCategory
  );

  const togglePlay = useCallback(
    async (content: AudioContent) => {
      const isCurrentlyPlaying =
        audioPlayerState.currentAudio?.id === content.id.toString() &&
        audioPlayerState.isPlaying;

      if (isCurrentlyPlaying) {
        await pauseAudio();
      } else {
        // バックエンドサーバーのベースURLを使ってaudioUrlを構築
        console.log("元のcontent.audioUrl:", content.audioUrl);
        console.log("content全体:", content);

        // バックエンドサーバーのベースURLを使ってaudioUrlを構築
        let audioUrl;

        if (content.audioUrl && content.audioUrl.startsWith("http")) {
          audioUrl = content.audioUrl;
        } else if (content.audioUrl) {
          // スラッシュが先頭にない場合は追加
          const path = content.audioUrl.startsWith("/")
            ? content.audioUrl
            : `/${content.audioUrl}`;
          audioUrl = `http://localhost:4003${path}`;
        } else {
          console.error("audioUrlが提供されていません:", content);
          return; // audioUrlがない場合は再生を中止
        }

        const audioContent = {
          id: content.id.toString(),
          title: content.title,
          description: content.description,
          audioUrl: audioUrl,
          duration: content.duration,
        };

        console.log("再生しようとしているオーディオURL:", audioUrl);
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

  const toggleLike = useCallback(
    async (contentId: number) => {
      try {
        const result = await audioContentApi.toggleLike(contentId.toString());
        setLikedContents((prev) =>
          prev
            .map((content) =>
              content.id === contentId
                ? {
                    ...content,
                    isLiked: result.isLiked,
                    _count: { ...content._count, likes: result.totalLikes },
                  }
                : content,
            )
            .filter((content) => content.isLiked),
        );
      } catch {}
    },
    [setLikedContents],
  );

  const handleAddToPlaylist = async (playlistId: number, audioContent: AudioContent) => {
    try {
      await playlistApi.addItem(playlistId.toString(), audioContent.id);
      
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId
          ? { ...playlist, _count: { items: playlist._count.items + 1 } }
          : playlist
      ));
      
      setSuccessMessage(`「${audioContent.title}」をプレイリストに追加しました！`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowAddToPlaylist(null);
    } catch {
      setError("プレイリストへの追加に失敗しました");
    }
  };

  const handleShareContent = async (content: AudioContent) => {
    try {
      const contentUrl = `${window.location.origin}/content/${content.id}`;
      await navigator.clipboard.writeText(contentUrl);
      setSuccessMessage("コンテンツのURLをクリップボードにコピーしました！");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError("URLのコピーに失敗しました");
    }
  };

  const handleDelete = async (content: AudioContent) => {
    if (window.confirm("このコンテンツを削除しますか？")) {
      try {
        await audioContentApi.delete(content.id.toString());
        setLikedContents(prev => prev.filter(c => c.id !== content.id));
        setSuccessMessage(`「${content.title}」を削除しました`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch {
        setError("コンテンツの削除に失敗しました");
      }
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
                  onClick={() => {}}
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

      <h4 className="text-gray-900 dark:text-white text-lg font-semibold mb-2 line-clamp-2">
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
            onClick={() => toggleLike(content.id)}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
          >
            {content.isLiked ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span className="text-sm">{content._count.likes}</span>
          </button>

          <button 
            onClick={() => handleShareContent(content)}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <HeartSolidIcon className="h-8 w-8" />
          <h2 className="text-3xl font-bold">お気に入り</h2>
        </div>
        <p className="text-red-100 text-lg">
          あなたがいいねしたコンテンツをまとめて管理できます
        </p>
        <div className="mt-6 flex items-center space-x-6 text-red-100">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{likedContents.length}</span>
            <span>コンテンツ</span>
          </div>
        </div>
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {category === "all" ? "すべて" : category}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            お気に入りコンテンツ
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredContents.length}件
          </span>
        </div>

        {filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              まだお気に入りがありません
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              気に入ったコンテンツにいいねして、ここに保存しましょう
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content, index) => (
              <ContentCard key={content.id} content={content} index={index} />
            ))}
          </div>
        )}
      </motion.div>

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
