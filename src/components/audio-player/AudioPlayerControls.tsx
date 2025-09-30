"use client";

import React, { memo } from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface AudioPlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  disabled: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}

const AudioPlayerControls: React.FC<AudioPlayerControlsProps> = memo(({
  isPlaying,
  isLoading,
  disabled,
  onPlayPause,
  onStop
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onPlayPause}
        disabled={disabled}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full p-2"
        aria-label={isPlaying ? "一時停止" : "再生"}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : isPlaying ? (
          <Pause size={20} />
        ) : (
          <Play size={20} />
        )}
      </button>

      <button
        onClick={onStop}
        className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-2"
        aria-label="停止"
      >
        <Square size={20} />
      </button>
    </div>
  );
});

AudioPlayerControls.displayName = 'AudioPlayerControls';
export default AudioPlayerControls;