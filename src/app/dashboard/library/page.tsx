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
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon
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

interface PaginatedResult {
  data: AudioContent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [myContents, setMyContents] = useState<AudioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "ビジネス", "ライフスタイル", "テクノロジー", "教育", "健康"];

  useEffect(() => {
    const fetchMyContents = async () => {
      try {
        setLoading(true);
        const result: PaginatedResult = await audioContentApi.getAll({});
        setMyContents(result.data);
        setError(null);
      } catch {
        setError('コンテンツの取得に失敗しました');
        setMyContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyContents();
  }, []);

  const filteredContents = selectedCategory === "all" 
    ? myContents 
    : myContents.filter(content => content.category.name === selectedCategory);

  const togglePlay = (contentId: number) => {
    setCurrentPlaying(currentPlaying === contentId.toString() ? null : contentId.toString());
  };

  const toggleLike = async (contentId: number) => {
    try {
      const result = await audioContentApi.toggleLike(contentId.toString());
      setMyContents(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, isLiked: result.isLiked, _count: { ...content._count, likes: result.totalLikes } }
            : content
        )
      );
    } catch {
    }
  };

  const handleEdit = () => {
  };

  const handleDelete = async () => {
    if (window.confirm('このコンテンツを削除しますか？')) {
      try {
      } catch {
      }
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
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {content.duration}分
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleEdit()}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title="編集"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete()}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="削除"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
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
          <span className="text-gray-600 dark:text-gray-400 text-sm">{content.author.name}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <EyeIcon className="h-4 w-4" />
            <span className="text-sm">0</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {new Date(content.createdAt).toLocaleDateString('ja-JP')}
          </span>
        </div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              マイライブラリ
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              あなたが投稿したコンテンツを管理できます
            </p>
          </div>
          <button
            onClick={() => router.push('/upload')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            <span>新規投稿</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">総投稿数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{myContents.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PlayIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">総いいね数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {myContents.reduce((total, content) => total + content._count.likes, 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">総再生時間</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.floor(myContents.reduce((total, content) => total + content.duration, 0) / 60)}時間
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {category === "all" ? "すべて" : category}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
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
              onClick={() => router.push('/upload')}
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
      </motion.div>
    </div>
  );
} 