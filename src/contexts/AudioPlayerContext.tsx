'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { playbackApi } from '../lib/api';

interface AudioContent {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration?: number;
  startTime?: number; // 視聴履歴から開始する際の時間
}

interface PlaybackState {
  currentAudio: AudioContent | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

type AudioPlayerAction =
  | { type: 'SET_CURRENT_AUDIO'; payload: AudioContent }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_PLAYER' };

const initialState: PlaybackState = {
  currentAudio: null,
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  volume: 1,
  isMuted: false,
  isLoading: false,
  error: null,
};

function audioPlayerReducer(state: PlaybackState, action: AudioPlayerAction): PlaybackState {
  switch (action.type) {
    case 'SET_CURRENT_AUDIO':
      return { ...state, currentAudio: action.payload, error: null };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload, isPaused: !action.payload };
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload, isPlaying: !action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload, isMuted: action.payload === 0 };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET_PLAYER':
      return { ...initialState, volume: state.volume, isMuted: state.isMuted };
    default:
      return state;
  }
}

interface AudioPlayerContextType {
  state: PlaybackState;
  playAudio: (audioContent: AudioContent) => Promise<void>;
  pauseAudio: () => Promise<void>;
  stopAudio: () => Promise<void>;
  seekTo: (time: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setCurrentTime: (time: number) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(audioPlayerReducer, initialState);

  const playAudio = async (audioContent: AudioContent) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await playbackApi.play(audioContent.id);
      
      dispatch({ type: 'SET_CURRENT_AUDIO', payload: audioContent });
      dispatch({ type: 'SET_PLAYING', payload: true });

      // 履歴から開始時間が指定されている場合はシークする
      if (audioContent.startTime && audioContent.startTime > 0) {
        await seekTo(audioContent.startTime);
      }

    } catch (error) {
      console.error('再生開始エラー:', error);
      dispatch({ type: 'SET_ERROR', payload: '音声の再生開始に失敗しました' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const pauseAudio = async () => {
    try {
      await playbackApi.pause();
      dispatch({ type: 'SET_PAUSED', payload: true });
    } catch (error) {
      console.error('一時停止エラー:', error);
      dispatch({ type: 'SET_ERROR', payload: '音声の一時停止に失敗しました' });
    }
  };

  const stopAudio = async () => {
    try {
      await playbackApi.stop();
      dispatch({ type: 'RESET_PLAYER' });
    } catch (error) {
      console.error('停止エラー:', error);
      dispatch({ type: 'SET_ERROR', payload: '音声の停止に失敗しました' });
    }
  };

  const seekTo = async (time: number) => {
    try {
      await playbackApi.seek(time);
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    } catch (error) {
      console.error('シーク エラー:', error);
      dispatch({ type: 'SET_ERROR', payload: '再生位置の変更に失敗しました' });
    }
  };

  const setVolume = async (volume: number) => {
    try {
      await playbackApi.setVolume(volume);
      dispatch({ type: 'SET_VOLUME', payload: volume });
    } catch (error) {
      console.error('音量変更エラー:', error);
      dispatch({ type: 'SET_ERROR', payload: '音量の変更に失敗しました' });
    }
  };

  const setCurrentTime = (time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: AudioPlayerContextType = {
    state,
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    setVolume,
    setCurrentTime,
    setError,
    clearError,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export default AudioPlayerContext;