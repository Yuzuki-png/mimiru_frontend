"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { useSidebar } from "../contexts/SidebarContext";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { usePathname } from "next/navigation";
import {
  AudioPlayerControls,
  AudioPlayerProgress,
  ErrorDisplay,
  useAudioEventHandler
} from "./audio-player";


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
  
  const { isCollapsed } = useSidebar();

  const audioRef = useRef<HTMLAudioElement>(null);

  useKeyboardShortcuts();

  const handleSeek = useCallback((newTime: number) => {
    const audio = audioRef.current;
    if (audio && isFinite(state.duration) && state.duration > 0) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [state.duration, setCurrentTime]);

  useAudioEventHandler({
    audioRef,
    currentAudio: state.currentAudio,
    duration: state.duration,
    currentTime: state.currentTime,
    isLoading: state.isLoading,
    setDuration,
    setCurrentTime,
    setLoading,
    onAudioEnd: stopAudio
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(otherAudio => {
        if (otherAudio !== audio && !otherAudio.paused) {
          otherAudio.pause();
        }
      });

      
      audio.play().catch((error) => {
        if (error.name !== 'AbortError') {
        }
      });
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [state.isPlaying]);





  const handlePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      pauseAudio();
    } else {      
      const audio = audioRef.current;
      if (audio && state.currentAudio) {
        try {
          if (audio.readyState < 1) {
            setLoading(true);
            audio.load();

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
          if (state.currentAudio.duration && state.duration === 0) {
            setDuration(state.currentAudio.duration);
          }
        }
      }
    }
  }, [state.isPlaying, state.currentAudio, pauseAudio, setLoading, setDuration, state.duration]);


  if (!state.currentAudio) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed ${isDashboard ? 'bottom-20 lg:bottom-0' : 'bottom-0'} ${isDashboard ? `${isCollapsed ? 'lg:left-20' : 'lg:left-64'}` : 'left-0'} right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-20 transition-all duration-300`}
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
          <ErrorDisplay 
            error={state.error} 
            onClearError={clearError} 
          />
        )}

        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            <AudioPlayerControls
              isPlaying={state.isPlaying}
              isLoading={state.isLoading}
              disabled={state.isLoading || !state.currentAudio}
              onPlayPause={handlePlayPause}
              onStop={stopAudio}
            />

            <AudioPlayerProgress
              title={state.currentAudio.title}
              currentTime={state.currentTime}
              duration={state.duration}
              onSeek={handleSeek}
            />


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
