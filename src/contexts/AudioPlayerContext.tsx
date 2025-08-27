'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AudioContent {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration?: number;
  startTime?: number;
}

interface PlaybackState {
  currentAudio: AudioContent | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
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
  | { type: 'SET_DURATION'; payload: number }
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
  duration: 0,
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
      return { 
        ...state, 
        isPlaying: action.payload, 
        isPaused: !action.payload,
        isLoading: action.payload ? false : state.isLoading
      };
    case 'SET_PAUSED':
      return { 
        ...state, 
        isPaused: action.payload, 
        isPlaying: !action.payload,
        isLoading: action.payload ? false : state.isLoading
      };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
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
  setDuration: (duration: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
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

      
      dispatch({ type: 'SET_CURRENT_AUDIO', payload: audioContent });
      dispatch({ type: 'SET_PLAYING', payload: true });

      if (audioContent.startTime && audioContent.startTime > 0) {
        await seekTo(audioContent.startTime);
      }

    } catch {
      dispatch({ type: 'SET_ERROR', payload: '音声の再生開始に失敗しました' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const pauseAudio = async () => {
    dispatch({ type: 'SET_PAUSED', payload: true });
  };

  const stopAudio = async () => {
    dispatch({ type: 'RESET_PLAYER' });
  };

  const seekTo = async (time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  };

  const setVolume = async (volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const setCurrentTime = (time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  };

  const setDuration = (duration: number) => {
    dispatch({ type: 'SET_DURATION', payload: duration });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
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
    setDuration,
    setError,
    setLoading,
    clearError,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export default AudioPlayerContext;