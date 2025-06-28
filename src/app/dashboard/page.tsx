"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { audioContentApi } from "../../lib/api";
import { 
  PlayIcon, 
  PauseIcon, 
  ClockIcon, 
  UserIcon,
  HeartIcon,
  ShareIcon,
  ChartBarIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  StarIcon
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

export default function Dashboard() {
  const { user } = useAuth();
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [audioContents, setAudioContents] = useState<AudioContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioContents = async () => {
      try {
        setLoading(true);
        const params = selectedCategory !== "all" ? { category: selectedCategory } : {};
        const result: PaginatedResult = await audioContentApi.getAll(params);
        setAudioContents(result.data);
      } catch {
        setError('音声コンテンツの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchAudioContents();
  }, [selectedCategory]);

  const categories = ["all", "ビジネス", "ライフスタイル", "テクノロジー", "教育", "健康"];

  const filteredContents = selectedCategory === "all" 
    ? audioContents 
    : audioContents.filter(content => content.category.name === selectedCategory);

  const togglePlay = (contentId: number) => {
    setCurrentPlaying(currentPlaying === contentId.toString() ? null : contentId.toString());
  };

  const toggleLike = async (contentId: number) => {
    try {
      const result = await audioContentApi.toggleLike(contentId.toString());
      setAudioContents(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, isLiked: result.isLiked, _count: { ...content._count, likes: result.totalLikes } }
            : content
        )
      );
    } catch {
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white"
      >
        <h2 className="text-3xl font-bold mb-2">
          おかえりなさい、{user?.name || user?.email?.split('@')[0]}さん！
        </h2>
        <p className="text-blue-100 text-lg">
          今日も新しい学びを始めましょう。質の高い音声コンテンツがあなたを待っています。
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">今日の学習時間</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">2時間 15分</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400 font-medium">+12%</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">昨日より</span>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">完了コンテンツ</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">24</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-orange-600 dark:text-orange-400 font-medium">3日連続</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">達成中</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">お気に入り</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">18</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">高評価</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">コンテンツ</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">学習ストリーク</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">7日</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400 font-medium">継続中</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">素晴らしい！</span>
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">カテゴリ</h3>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">おすすめコンテンツ</h3>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            すべて見る
          </button>
            </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">読み込み中...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-red-500 dark:text-red-400">{error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                    {content.category.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {content.duration}分
                  </span>
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
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{content.author.name}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(content.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => togglePlay(content.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {currentPlaying === content.id.toString() ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                    <span>{currentPlaying === content.id.toString() ? "停止" : "再生"}</span>
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

                    <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                      <ShareIcon className="h-5 w-5" />
                    </button>
              </div>
        </div>
      </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 