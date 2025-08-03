"use client";

import { useEffect, useState, useCallback } from "react";
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
  FireIcon,
  SparklesIcon,
  PlusIcon,
  XMarkIcon,
  ListBulletIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
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

interface PaginatedResult {
  data: AudioContent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export default function DiscoverPage() {
  const { user } = useAuth();
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const [audioContents, setAudioContents] = useState<AudioContent[]>([]);
  const [trendingContents, setTrendingContents] = useState<AudioContent[]>([]);
  const [newContents, setNewContents] = useState<AudioContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    const fetchContents = async () => {
      try {
        setLoading(true);

        const params =
          selectedCategory !== "all" ? { category: selectedCategory } : {};
        const result: PaginatedResult = await audioContentApi.getAll(params);

        setAudioContents(result.data);

        const [trendingResult, newResult, playlistsResult] = await Promise.all([
          audioContentApi.getAll({ limit: 6 }),
          audioContentApi.getAll({ limit: 6 }),
          playlistApi.getAll()
        ]);
        setTrendingContents(trendingResult.data);
        setNewContents(newResult.data);
        setPlaylists(playlistsResult.data);

        setError(null);
      } catch {
        setError("データの取得に失敗しました");
        setAudioContents([]);
        setTrendingContents([]);
        setNewContents([]);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [selectedCategory]);

  const filteredContents = audioContents.filter(
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
        // audioUrlが提供されているかチェック
        if (!content.audioUrl) {
          console.error("audioUrlが提供されていません:", content);
          alert("音声ファイルのURLが取得できません。");
          return;
        }


        const audioContent = {
          id: content.id.toString(),
          title: content.title,
          description: content.description,
          audioUrl: content.audioUrl,
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

  const toggleLike = useCallback(
    async (contentId: number) => {
      try {
        const result = await audioContentApi.toggleLike(contentId.toString());

        const updateContent = (content: AudioContent) =>
          content.id === contentId
            ? {
                ...content,
                isLiked: result.isLiked,
                _count: { ...content._count, likes: result.totalLikes },
              }
            : content;

        setAudioContents((prev) => prev.map(updateContent));
        setTrendingContents((prev) => prev.map(updateContent));
        setNewContents((prev) => prev.map(updateContent));
      } catch {}
    },
    [setAudioContents, setTrendingContents, setNewContents],
  );

  const handleAddToPlaylist = async (playlistId: number, audioContent: AudioContent) => {
    try {
      await playlistApi.addItem(playlistId.toString(), audioContent.id);
      
      // プレイリストのアイテム数を更新
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
        setAudioContents(prev => prev.filter(c => c.id !== content.id));
        setTrendingContents(prev => prev.filter(c => c.id !== content.id));
        setNewContents(prev => prev.filter(c => c.id !== content.id));
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

      <h4 
        className="text-gray-900 dark:text-white text-lg font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-blue-500 transition-colors"
        onClick={() => window.location.href = `/content/${content.id}`}
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


      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          カテゴリ
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
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
            トレンド
          </h3>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            すべて見る
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingContents.map((content, index) => (
            <ContentCard key={content.id} content={content} index={index} />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <SparklesIcon className="h-5 w-5 text-green-500 mr-2" />
            新着
          </h3>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            すべて見る
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newContents.map((content, index) => (
            <ContentCard key={content.id} content={content} index={index} />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            すべてのコンテンツ
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredContents.length}件
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content, index) => (
            <ContentCard key={content.id} content={content} index={index} />
          ))}
        </div>
      </div>

      {/* プレイリスト選択モーダル */}
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
