"use client";

import React, { useEffect, useRef } from "react";
import { Play, Pause, Square, X } from "lucide-react";
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
    setCurrentTime,
    setDuration,
    setLoading,
    clearError,
  } = useAudioPlayer();

  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  
  // SidebarContextから状態を直接取得
  const { isCollapsed } = useSidebar();

  const audioRef = useRef<HTMLAudioElement>(null);

  // キーボードショートカットを有効化
  useKeyboardShortcuts();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentAudio) return;

    let hasEnded = false; // 終了処理の重複を防ぐフラグ
    let canplayHandled = false; // canplayイベントの重複処理を防ぐフラグ
    let lastTimeUpdate = 0; // 最後のtime更新時刻

    const handleLoadedMetadata = () => {
      if (audio && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else {
        // Infinityの場合は、APIから取得したdurationを使用
        if (state.currentAudio && state.currentAudio.duration && state.currentAudio.duration > 0) {
          setDuration(state.currentAudio.duration);
        } else {
          // durationが取得できない場合は推定値を使用（例：3分=180秒）
          setDuration(180);
        }
      }
    };

    const handleLoadedData = () => {
      // loadeddataでもdurationを再確認
      if (audio && isFinite(audio.duration) && audio.duration > 0 && state.duration === 0) {
        setDuration(audio.duration);
      } else if (state.duration === 0 && state.currentAudio && state.currentAudio.duration) {
        // audioElementのdurationが無効な場合、APIのdurationを使用
        setDuration(state.currentAudio.duration);
      }
      
      // 音声の実際の長さをstateに設定
      if (state.currentAudio) {
        setCurrentTime(0);
      }
    };

    const handleEnded = () => {
      if (hasEnded) return; // 既に終了処理済みの場合はreturn
      
      hasEnded = true;
      
      // 即座にプレイヤーを閉じる
      stopAudio();
    };

    // API durationに基づいた終了判定
    const checkAudioEnd = () => {
      if (!hasEnded && state.duration > 0 && state.currentTime >= state.duration - 0.1) {
        handleEnded();
      }
    };

    const handleTimeUpdate = () => {
      const now = Date.now();
      // 100ms未満の更新は無視してレンダリング頻度を制限
      if (now - lastTimeUpdate < 100) return;
      lastTimeUpdate = now;
      
      const rawCurrentTime = audio.currentTime;
      
      // audioElementのdurationが無効な場合、APIのdurationと比率計算で表示用currentTimeを算出
      if (!isFinite(audio.duration) && state.duration > 0) {
        // 最初の数秒で全体の再生時間の比率を推定
        // これは簡易的な方法で、実際の実装では音声ファイルの分析が必要
        const estimatedCurrentTime = Math.min(rawCurrentTime, state.duration);
        setCurrentTime(estimatedCurrentTime);
      } else {
        setCurrentTime(rawCurrentTime);
      }
      
      // API durationに基づいた終了判定
      checkAudioEnd();
      
      // durationがまだ設定されていない場合は再試行（ただし過度なログは避ける）
      if (audio && isFinite(audio.duration) && audio.duration > 0 && state.duration === 0) {
        setDuration(audio.duration);
      }
    };

    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      const error = audio?.error;
      
      // エラーの種類に応じてユーザーに適切なメッセージを表示
      if (error?.code === 4) {
        // 音声ファイルのフォーマットに問題があります
        // APIのdurationを使用
        if (state.currentAudio?.duration) {
          setDuration(state.currentAudio.duration);
        }
      }
      
      // エラー状態をセットしてUIに表示
    };

    const handleCanPlay = () => {
      if (canplayHandled) return; // 既に処理済みの場合はスキップ
      
      if (audio && isFinite(audio.duration) && audio.duration > 0 && state.duration === 0) {
        setDuration(audio.duration);
      } else if (state.duration === 0 && state.currentAudio && state.currentAudio.duration) {
        // audioElementのdurationが無効な場合、APIのdurationを使用
        setDuration(state.currentAudio.duration);
      }
      
      // ローディング解除（1回のみ）
      if (state.isLoading) {
        setLoading(false);
      }
      
      canplayHandled = true; // 処理完了フラグをセット
    };

    const handleLoadStart = () => {
      // loadstartイベントの処理
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, [state.currentAudio]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      // 他の音声を停止（重複再生を防ぐ）
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(otherAudio => {
        if (otherAudio !== audio && !otherAudio.paused) {
          otherAudio.pause();
        }
      });
      
      // 再生を試行
      audio.play().catch((error) => {
        if (error.name !== 'AbortError') {
          // Play error - サイレントに処理
        }
      });
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [state.isPlaying]);


  // currentTimeの設定は手動シーク時のみに制限
  // timeupdate中の無限ループを防ぐため、このuseEffectは削除または条件付きに

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const audio = audioRef.current;
    
    // シークが可能かチェック
    if (audio && isFinite(state.duration) && state.duration > 0) {
      // 直接audioElementの時刻を設定
      audio.currentTime = newTime;
      // stateも更新
      setCurrentTime(newTime);
    }
  };



  const handlePlayPause = async () => {
    if (state.isPlaying) {
      pauseAudio();
    } else {      
      const audio = audioRef.current;
      if (audio && state.currentAudio) {
        try {
          // メタデータが読み込まれていない場合は先に読み込む
          if (audio.readyState < 1) {
            setLoading(true);
            audio.load();
            
            // loadedmetadataイベントを待つ
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                setLoading(false);
                reject(new Error('メタデータの読み込みがタイムアウトしました'));
              }, 10000);

              const onLoadedMetadata = () => {
                clearTimeout(timeout);
                audio.removeEventListener('loadedmetadata', onLoadedMetadata);
                audio.removeEventListener('error', onError);
                setLoading(false);
                resolve();
              };

              const onError = () => {
                clearTimeout(timeout);
                audio.removeEventListener('loadedmetadata', onLoadedMetadata);
                audio.removeEventListener('error', onError);
                setLoading(false);
                reject(new Error('メタデータの読み込みに失敗しました'));
              };

              audio.addEventListener('loadedmetadata', onLoadedMetadata);
              audio.addEventListener('error', onError);
            });
          }

          await audio.play();
        } catch {
          setLoading(false);
          // CloudFrontのCORS問題やフォーマットエラーの場合は、APIのdurationを使用
          if (state.currentAudio.duration && state.duration === 0) {
            setDuration(state.currentAudio.duration);
          }
        }
      }
    }
  };

  const formatTime = (time: number): string => {
    // NaN, Infinity, undefined, nullなどの無効な値をチェック
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
          <audio 
            ref={audioRef} 
            preload="none" 
            controls={false}
            src={state.currentAudio.audioUrl}
          >
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
                disabled={state.isLoading || !state.currentAudio}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full p-2"
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
                    {formatTime(state.duration)}
                  </span>
                </div>
              </div>

              {/* シークバー */}
              <input
                type="range"
                min="0"
                max={state.duration || 1}
                value={Math.min(state.currentTime, state.duration || 1)}
                onChange={handleSeek}
                disabled={!state.duration || state.duration <= 0}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
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
