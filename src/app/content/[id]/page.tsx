"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { audioContentApi } from "../../../lib/api";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  ShareIcon,
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

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

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const [content, setContent] = useState<AudioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const contentId = params.id as string;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const result = await audioContentApi.getById(contentId);
        setContent(result);
        setError(null);
      } catch (error) {
        console.error('Content fetch error:', error);
        if (error instanceof Error) {
          setError(`コンテンツの取得に失敗しました: ${error.message}`);
        } else {
          setError("コンテンツの取得に失敗しました");
        }
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

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

  const handleShare = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          読み込み中...
        </span>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 成功メッセージ */}
      {copySuccess && (
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
          <span className="font-medium">URLをコピーしました</span>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>戻る</span>
        </motion.button>

        <div className="max-w-4xl mx-auto">
          {/* メインコンテンツカード */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8"
          >
            {/* カテゴリバッジ */}
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                <TagIcon className="h-4 w-4 mr-1" />
                {content.category.name}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ShareIcon className="h-5 w-5" />
                <span>共有</span>
              </button>
            </div>

            {/* タイトル */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {content.title}
            </h1>

            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>{content.author.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4" />
                <span>{formatDuration(content.duration)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(content.createdAt).toLocaleDateString("ja-JP")}</span>
              </div>
            </div>

            {/* 説明 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                説明
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {content.description}
              </p>
            </div>

            {/* 再生ボタン */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => togglePlay(content)}
                disabled={audioPlayerState.isLoading}
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-xl transition-colors text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {audioPlayerState.isLoading &&
                audioPlayerState.currentAudio?.id === content.id.toString() ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : audioPlayerState.currentAudio?.id === content.id.toString() &&
                  audioPlayerState.isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
                <span>
                  {audioPlayerState.currentAudio?.id === content.id.toString() &&
                  audioPlayerState.isPlaying
                    ? "一時停止"
                    : "再生する"}
                </span>
              </button>
            </div>
          </motion.div>

          {/* 投稿者情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              投稿者について
            </h2>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {content.author.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  コンテンツ投稿者
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}