"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { listenHistoryApi } from "../../../lib/api";
import { useAudioPlayer } from "../../../contexts/AudioPlayerContext";
import { ListenHistory } from "../../../types/listenHistory";
import {
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  TrashIcon,
  HistoryIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const { state: audioPlayerState, playAudio, pauseAudio } = useAudioPlayer();
  const [history, setHistory] = useState<ListenHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await listenHistoryApi.getAll({ 
        page, 
        limit: 10 
      });
      setHistory(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError("視聴履歴の取得に失敗しました");
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "不明";
    return formatTime(seconds);
  };

  const calculateProgress = (currentTime: number, duration?: number) => {
    if (!duration) return 0;
    return Math.min((currentTime / duration) * 100, 100);
  };

  const togglePlay = useCallback(
    async (historyItem: ListenHistory) => {
      const content = historyItem.audioContent;
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
          startTime: historyItem.currentTime, // 前回の再生位置から開始
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

  const handleDelete = async (historyItem: ListenHistory) => {
    if (window.confirm("この視聴履歴を削除しますか？")) {
      try {
        await listenHistoryApi.delete(historyItem.id);
        setHistory(prev => prev.filter(h => h.id !== historyItem.id));
        setSuccessMessage(`「${historyItem.audioContent.title}」の視聴履歴を削除しました`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError("視聴履歴の削除に失敗しました");
        console.error("Error deleting history:", err);
      }
    }
  };

  const HistoryCard = ({ historyItem }: { historyItem: ListenHistory }) => {
    const progress = calculateProgress(historyItem.currentTime, historyItem.duration);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
        {/* プログレスバー */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-4">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
            {historyItem.audioContent.category.name}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {formatTime(historyItem.currentTime)} / {formatDuration(historyItem.duration)}
            </span>
            <button
              onClick={() => handleDelete(historyItem)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="履歴から削除"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h4 className="text-gray-900 dark:text-white text-lg font-semibold mb-2 line-clamp-2">
          {historyItem.audioContent.title}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {historyItem.audioContent.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {historyItem.audioContent.author.name}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {historyItem.completed && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                完了
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {new Date(historyItem.updatedAt).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => togglePlay(historyItem)}
            disabled={audioPlayerState.isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {audioPlayerState.isLoading &&
            audioPlayerState.currentAudio?.id === historyItem.audioContent.id.toString() ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : audioPlayerState.currentAudio?.id === historyItem.audioContent.id.toString() &&
              audioPlayerState.isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            <span>
              {audioPlayerState.currentAudio?.id === historyItem.audioContent.id.toString() &&
              audioPlayerState.isPlaying
                ? "一時停止"
                : "続きから再生"}
            </span>
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            進捗: {Math.round(progress)}%
          </span>
        </div>
      </div>
    );
  };

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

      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <HistoryIcon className="h-8 w-8 mr-3 text-blue-500" />
              視聴履歴
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              最近視聴したコンテンツを確認し、続きから再生できます
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">合計</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {history.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">コンテンツ</p>
          </div>
        </div>
      </motion.div>

      {/* 視聴履歴一覧 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            視聴履歴一覧
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {history.length}件
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              視聴履歴がありません
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              コンテンツを視聴すると、ここに履歴が表示されます
            </p>
            <button
              onClick={() => router.push("/dashboard/discover")}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <span>コンテンツを探す</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((historyItem) => (
              <HistoryCard key={historyItem.id} historyItem={historyItem} />
            ))}
          </div>
        )}
      </motion.div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center space-x-2"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchHistory(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}