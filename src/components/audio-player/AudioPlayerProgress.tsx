"use client";

import React, { memo, useCallback } from 'react';

interface AudioPlayerProgressProps {
  title: string;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (time: number): string => {
  if (!isFinite(time) || time < 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const AudioPlayerProgress: React.FC<AudioPlayerProgressProps> = memo(({
  title,
  currentTime,
  duration,
  onSeek
}) => {
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  }, [onSeek]);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {title}
        </h4>
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max={duration || 1}
        value={Math.min(currentTime, duration || 1)}
        onChange={handleSeek}
        disabled={!duration || duration <= 0}
        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
      />
    </div>
  );
});

AudioPlayerProgress.displayName = 'AudioPlayerProgress';
export default AudioPlayerProgress;