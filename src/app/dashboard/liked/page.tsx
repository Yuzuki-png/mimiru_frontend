"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { audioContentApi } from "../../../lib/api";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
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

export default function LikedPage() {
  const router = useRouter();
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const { user } = useAuth();
  const [likedContents, setLikedContents] = useState<AudioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "ビジネス",
    "ライフスタイル",
    "テクノロジー",
    "教育",
    "健康",
  ];

  useEffect(() => {
    const fetchLikedContents = async () => {
      try {
        setLoading(true);
        // すべてのコンテンツを取得してクライアントサイドでいいね済みのものをフィルタリング
        const result = await audioContentApi.getAll({});
        const likedOnly = result.data.filter((content: AudioContent) => content.isLiked);
        setLikedContents(likedOnly);
        setError(null);
      } catch {
        setError("お気に入りコンテンツの取得に失敗しました");
        setLikedContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedContents();
  }, []);

  const filteredContents =
    selectedCategory === "all"
      ? likedContents
      : likedContents.filter(
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
        const audioUrl = content.audioUrl;
        if (!audioUrl || !audioUrl.startsWith("http")) {
          console.error("有効なaudioUrlが提供されていません:", content);
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
          prev.map((content) =>
            content.id === contentId
              ? {
                  ...content,
                  isLiked: result.isLiked,
                  _count: { ...content._count, likes: result.totalLikes },
                }
              : content,
          ).filter(content => content.id === contentId ? result.isLiked : true)
        );
      } catch {}
    },
    [setLikedContents],
  );

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              お気に入り
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              あなたがいいねしたコンテンツ一覧です
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {filteredContents.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              お気に入り
            </div>
          </div>
        </div>
      </motion.div>

      {/* カテゴリフィルター */}
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

      {/* メインコンテンツエリア */}
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
              気になるコンテンツにいいねして、お気に入りに追加しましょう
            </p>
            <button
              onClick={() => router.push("/dashboard/discover")}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
            >
              <span>コンテンツを探す</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content, index) => (
              <ContentCard key={content.id} content={content} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}