"use client";

import React, { useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2, VolumeX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { useSidebar } from "../contexts/SidebarContext";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { usePathname } from "next/navigation";


const GlobalAudioPlayer: React.FC = () => {
  const {
    state,
    pauseAudio,
    stopAudio,
    seekTo,
    setVolume: setPlayerVolume,
    setCurrentTime,
    clearError,
  } = useAudioPlayer();

  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  
  // SidebarContextから状態を直接取得
  const { isCollapsed } = useSidebar();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [duration, setDuration] = React.useState(0);

  // キーボードショートカットを有効化
  useKeyboardShortcuts();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentAudio) return;

    const handleLoadedData = () => {
      setDuration(audio.duration);
      // 音声の実際の長さをstateに設定
      if (state.currentAudio) {
        setCurrentTime(0);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      stopAudio();
    };

    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      const error = audio?.error;
      console.error("オーディオ読み込みエラー:", error);
      console.error("エラーコード:", error?.code);
      console.error("エラーメッセージ:", error?.message);
      console.error("オーディオURL:", audio?.src);
      console.error("オーディオ要素の状態:", {
        readyState: audio?.readyState,
        networkState: audio?.networkState,
        currentTime: audio?.currentTime,
        duration: audio?.duration,
      });
    };

    const handleLoadStart = () => {
      // オーディオ読み込み開始
    };

    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, [state.currentAudio, setCurrentTime, stopAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 音量を設定
    audio.volume = volume;

    if (state.isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [state.isPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = state.currentTime;
  }, [state.currentTime]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setPlayerVolume(newVolume);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }

    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      const newVolume = volume > 0 ? volume : 0.5;
      audio.volume = newVolume;
      setPlayerVolume(newVolume);
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setPlayerVolume(0);
      setIsMuted(true);
    }
  };

  const handlePlayPause = () => {
    if (state.isPlaying) {
      pauseAudio();
    } else {
      const audio = audioRef.current;
      if (audio && state.currentAudio) {
        audio.play().catch(console.error);
      }
    }
  };

  const formatTime = (time: number): string => {
    if (!isFinite(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!state.currentAudio) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-0 ${isDashboard ? (isCollapsed ? 'left-20' : 'left-64') : 'left-0'} right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-20 transition-all duration-300`}
      >
        {state.currentAudio && (
          <audio ref={audioRef} preload="metadata" controls={false}>
            <source src={state.currentAudio.audioUrl} type="audio/mpeg" />
            <source src={state.currentAudio.audioUrl} type="audio/wav" />
            <source src={state.currentAudio.audioUrl} type="audio/ogg" />
            お使いのブラウザは音声の再生をサポートしていません。
          </audio>
        )}

        {state.error && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
          >
            <div className="px-4 py-2 flex items-center justify-between">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {state.error}
              </p>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            {/* 再生コントロール */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlayPause}
                disabled={state.isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full p-2 transition-colors"
                aria-label={state.isPlaying ? "一時停止" : "再生"}
              >
                {state.isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : state.isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} />
                )}
              </button>

              <button
                onClick={stopAudio}
                className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-2 transition-colors"
                aria-label="停止"
              >
                <Square size={20} />
              </button>
            </div>

            {/* トラック情報 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {state.currentAudio.title}
                </h4>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(state.currentTime)}
                  </span>
                  <span className="text-xs text-gray-400">/</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* シークバー */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={state.currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
            </div>

            {/* 音量コントロール */}
            <div className="flex items-center space-x-2 w-32">
              <button
                onClick={toggleMute}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                aria-label={isMuted ? "ミュート解除" : "ミュート"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={stopAudio}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1"
              aria-label="プレイヤーを閉じる"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalAudioPlayer;
