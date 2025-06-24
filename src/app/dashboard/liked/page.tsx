"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { audioContentApi } from "../../../lib/api";
import { 
  PlayIcon, 
  PauseIcon, 
  ClockIcon, 
  UserIcon,
  HeartIcon,
  ShareIcon,
  MagnifyingGlassIcon
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

export default function LikedPage() {
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [likedContents, setLikedContents] = useState<AudioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "ビジネス", "ライフスタイル", "テクノロジー", "教育", "健康"];

  // いいねしたコンテンツを取得
  useEffect(() => {
    const fetchLikedContents = async () => {
      try {
        setLoading(true);
        const result: PaginatedResult = await audioContentApi.getAll({});
        const liked = result.data.filter(content => content.isLiked);
        setLikedContents(liked);
      } catch {
        setError('いいねしたコンテンツの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedContents();
  }, []);

  const filteredContents = likedContents.filter(content => 
    (selectedCategory === "all" || content.category.name === selectedCategory) &&
    (searchQuery === "" || 
     content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     content.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const togglePlay = (contentId: number) => {
    setCurrentPlaying(currentPlaying === contentId.toString() ? null : contentId.toString());
  };

  const toggleLike = async (contentId: number) => {
    try {
      const result = await audioContentApi.toggleLike(contentId.toString());
      setLikedContents(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, isLiked: result.isLiked, _count: { ...content._count, likes: result.totalLikes } }
            : content
        ).filter(content => content.isLiked)
      );
    } catch {
      // エラーハンドリング
    }
  };

  const ContentCard = ({ content, index = 0 }: { content: AudioContent; index?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
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
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">読み込み中...</span>
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
      {/* Header */}
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
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              {Math.floor(likedContents.reduce((total, content) => total + content.duration, 0) / 60)}
            </span>
            <span>時間</span>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="お気に入りのコンテンツを検索..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-colors"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">カテゴリフィルター</h3>
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

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            お気に入りコンテンツ
            {searchQuery && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                「{searchQuery}」の検索結果
              </span>
            )}
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredContents.length}件
          </span>
        </div>

        {filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "検索結果が見つかりません" : "まだお気に入りがありません"}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? "別のキーワードで検索してみてください" 
                : "気に入ったコンテンツにいいねして、ここに保存しましょう"
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                <span>検索をクリア</span>
              </button>
            )}
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