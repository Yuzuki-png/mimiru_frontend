"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { audioContentApi } from "../../../lib/api";
import SearchBar from "../../../components/SearchBar";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayIcon,
  HeartIcon,
  ClockIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface AudioContent {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  audioUrl: string;
  thumbnailUrl?: string;
  isLiked?: boolean;
  createdAt: string;
  author?: {
    name: string;
  };
}

interface SearchFilters {
  category: string;
  duration: string;
  sortBy: string;
}

const categories = [
  { value: "", label: "すべてのカテゴリ" },
  { value: "education", label: "教育" },
  { value: "entertainment", label: "エンターテイメント" },
  { value: "news", label: "ニュース" },
  { value: "music", label: "音楽" },
  { value: "podcast", label: "ポッドキャスト" },
  { value: "language", label: "語学" },
  { value: "business", label: "ビジネス" },
  { value: "health", label: "健康" },
  { value: "technology", label: "テクノロジー" },
  { value: "lifestyle", label: "ライフスタイル" }
];

const durationFilters = [
  { value: "", label: "すべての長さ" },
  { value: "short", label: "短時間 (5分未満)" },
  { value: "medium", label: "中時間 (5-20分)" },
  { value: "long", label: "長時間 (20分以上)" }
];

const sortOptions = [
  { value: "relevance", label: "関連度順" },
  { value: "newest", label: "新着順" },
  { value: "oldest", label: "古い順" },
  { value: "duration_asc", label: "短い順" },
  { value: "duration_desc", label: "長い順" },
  { value: "title", label: "タイトル順" }
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<AudioContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const [filters, setFilters] = useState<SearchFilters>({
    category: "",
    duration: "",
    sortBy: "relevance"
  });

  // URLパラメータから検索クエリを取得
  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery, filters, 1);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters, page: number = 1) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        search: searchQuery,
        page,
        limit: 20
      };

      if (searchFilters.category) {
        params.category = searchFilters.category;
      }

      // 期間フィルタを適用
      if (searchFilters.duration) {
        switch (searchFilters.duration) {
          case 'short':
            params.maxDuration = 300; // 5分
            break;
          case 'medium':
            params.minDuration = 300;
            params.maxDuration = 1200; // 20分
            break;
          case 'long':
            params.minDuration = 1200;
            break;
        }
      }

      // ソート順を適用
      if (searchFilters.sortBy !== 'relevance') {
        params.sortBy = searchFilters.sortBy;
      }

      const response = await audioContentApi.getAll(params);
      
      if (page === 1) {
        setSearchResults(response.data || []);
      } else {
        setSearchResults(prev => [...prev, ...(response.data || [])]);
      }
      
      setTotalResults(response.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError('検索中にエラーが発生しました。もう一度お試しください。');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    if (query) {
      performSearch(query, updatedFilters, 1);
    }
  };

  const handleLoadMore = () => {
    if (query && !loading) {
      performSearch(query, filters, currentPage + 1);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: "",
      duration: "",
      sortBy: "relevance"
    };
    setFilters(defaultFilters);
    if (query) {
      performSearch(query, defaultFilters, 1);
    }
  };

  const hasActiveFilters = filters.category || filters.duration || filters.sortBy !== "relevance";

  return (
    <div className="space-y-6">
      {/* 検索バー */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <SearchBar
          initialQuery={query}
          placeholder="音声コンテンツを検索..."
          showHistory={true}
          onSearch={(searchQuery) => {
            setQuery(searchQuery);
            performSearch(searchQuery, filters, 1);
          }}
          className="max-w-2xl mx-auto"
        />
      </div>

      {/* 検索結果とフィルター */}
      {query && (
        <>
          {/* 検索結果ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  「{query}」の検索結果
                </h2>
                {totalResults > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    約 {totalResults.toLocaleString()} 件見つかりました
                  </p>
                )}
              </div>
            </div>

            {/* フィルターボタン */}
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>フィルターをクリア</span>
                </button>
              )}
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                <span>フィルター</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    {[filters.category, filters.duration, filters.sortBy !== "relevance" ? filters.sortBy : ""].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* フィルターパネル */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                検索フィルター
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* カテゴリ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange({ category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 期間 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    長さ
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange({ duration: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    {durationFilters.map((dur) => (
                      <option key={dur.value} value={dur.value}>
                        {dur.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ソート */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    並び順
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    {sortOptions.map((sort) => (
                      <option key={sort.value} value={sort.value}>
                        {sort.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* 検索結果 */}
          {loading && searchResults.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">検索中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => performSearch(query, filters, 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                再試行
              </button>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                検索結果が見つかりませんでした
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                別のキーワードで検索してみてください
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  フィルターをクリアして再検索
                </button>
              )}
            </div>
          ) : (
            <>
              {/* 検索結果一覧 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* サムネイル */}
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                      {content.thumbnailUrl ? (
                        <img
                          src={content.thumbnailUrl}
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <PlayIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* 再生時間 */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(content.duration)}
                      </div>
                    </div>

                    {/* コンテンツ情報 */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 flex-1">
                          {content.title}
                        </h3>
                        <button className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                          {content.isLiked ? (
                            <HeartSolidIcon className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {content.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {categories.find(cat => cat.value === content.category)?.label || content.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{formatDate(content.createdAt)}</span>
                        </div>
                      </div>

                      {content.author && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          by {content.author.name}
                        </div>
                      )}

                      {/* 再生ボタン */}
                      <button className="w-full mt-3 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                        <PlayIcon className="h-4 w-4" />
                        <span>再生</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* もっと読み込むボタン */}
              {searchResults.length < totalResults && (
                <div className="text-center pt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>読み込み中...</span>
                      </div>
                    ) : (
                      'さらに表示'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 初期状態（検索クエリがない場合） */}
      {!query && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            音声コンテンツを検索
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            上の検索バーにキーワードを入力して、お探しのコンテンツを見つけましょう
          </p>
          
          {/* 人気のカテゴリ */}
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              人気のカテゴリ
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.slice(1, 7).map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setQuery(category.label);
                    performSearch(category.label, filters, 1);
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors"
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">読み込み中...</span>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}