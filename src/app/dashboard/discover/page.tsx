"use client";

import { useEffect, useState, useCallback } from "react";
import { audioContentApi } from "../../../lib/api";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FireIcon,
  SparklesIcon,
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

export default function DiscoverPage() {
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const [audioContents, setAudioContents] = useState<AudioContent[]>([]);
  const [trendingContents, setTrendingContents] = useState<AudioContent[]>([]);
  const [newContents, setNewContents] = useState<AudioContent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const trendingResult: PaginatedResult = await audioContentApi.getAll({
          limit: 6,
        });
        setTrendingContents(trendingResult.data);

        const newResult: PaginatedResult = await audioContentApi.getAll({
          limit: 6,
        });
        setNewContents(newResult.data);

        setError(null);
      } catch {
        setError("コンテンツの取得に失敗しました");
        setAudioContents([]);
        setTrendingContents([]);
        setNewContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [selectedCategory]);

  const filteredContents = audioContents.filter(
    (content) =>
      (selectedCategory === "all" ||
        content.category.name === selectedCategory) &&
      (searchQuery === "" ||
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.author.name.toLowerCase().includes(searchQuery.toLowerCase())),
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
        let audioUrl;

        console.log("コンテンツのaudioUrl:", content.audioUrl);

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

        console.log("構築されたaudioURL:", audioUrl);

        // ファイルの存在とアクセス可能性をチェック
        try {
          const response = await fetch(audioUrl, {
            method: "HEAD",
            mode: "cors",
          });
          console.log(
            "ファイルアクセステスト:",
            response.status,
            response.headers.get("content-type"),
          );
          if (!response.ok) {
            console.error(`ファイルにアクセスできません: ${response.status}`);
            if (response.status === 404) {
              alert(
                "音声ファイルが見つかりません。バックエンドの静的ファイル配信設定を確認してください。",
              );
              return;
            }
          }
        } catch (error) {
          console.error("ファイルアクセスエラー:", error);
          alert(
            "音声ファイルにアクセスできません。バックエンドサーバーの設定を確認してください。",
          );
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
        <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
          <ClockIcon className="h-4 w-4 mr-1" />
          {Math.floor(content.duration / 60)}:
          {(content.duration % 60).toString().padStart(2, "0")}
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
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {content.author.name}
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {new Date(content.createdAt).toLocaleDateString("ja-JP")}
        </span>
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

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="コンテンツ、作者、キーワードで検索..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-colors"
          />
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content, index) => (
            <ContentCard key={content.id} content={content} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
