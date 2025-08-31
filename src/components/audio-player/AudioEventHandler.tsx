"use client";

import { useEffect, RefObject } from 'react';

interface AudioContent {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number;
  startTime?: number;
}

interface AudioEventHandlerProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  currentAudio: AudioContent | null;
  duration: number;
  currentTime: number;
  isLoading: boolean;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setLoading: (loading: boolean) => void;
  onAudioEnd: () => void;
}

export const useAudioEventHandler = ({
  audioRef,
  currentAudio,
  duration,
  currentTime,
  isLoading,
  setDuration,
  setCurrentTime,
  setLoading,
  onAudioEnd
}: AudioEventHandlerProps) => {
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudio) return;

    let hasEnded = false;
    let canplayHandled = false;
    let lastTimeUpdate = 0;

    const handleLoadedMetadata = () => {
      if (audio && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else {
        if (currentAudio?.duration && currentAudio.duration > 0) {
          setDuration(currentAudio.duration);
        } else {
          setDuration(180);
        }
      }
    };

    const handleLoadedData = () => {
      if (audio && isFinite(audio.duration) && audio.duration > 0 && duration === 0) {
        setDuration(audio.duration);
      } else if (duration === 0 && currentAudio?.duration) {
        setDuration(currentAudio.duration);
      }
      
      if (currentAudio) {
        setCurrentTime(0);
      }
    };

    const handleEnded = () => {
      if (hasEnded) return;
      hasEnded = true;
      onAudioEnd();
    };

    const checkAudioEnd = () => {
      if (!hasEnded && duration > 0 && currentTime >= duration - 0.1) {
        handleEnded();
      }
    };

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastTimeUpdate < 100) return;
      lastTimeUpdate = now;
      
      const rawCurrentTime = audio.currentTime;
      
      if (!isFinite(audio.duration) && duration > 0) {
        const estimatedCurrentTime = Math.min(rawCurrentTime, duration);
        setCurrentTime(estimatedCurrentTime);
      } else {
        setCurrentTime(rawCurrentTime);
      }
      
      checkAudioEnd();
      
      if (audio && isFinite(audio.duration) && audio.duration > 0 && duration === 0) {
        setDuration(audio.duration);
      }
    };

    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      const error = audio?.error;
      
      if (error?.code === 4) {
        if (currentAudio?.duration) {
          setDuration(currentAudio.duration);
        }
      }
    };

    const handleCanPlay = () => {
      if (canplayHandled) return;
      
      if (audio && isFinite(audio.duration) && audio.duration > 0 && duration === 0) {
        setDuration(audio.duration);
      } else if (duration === 0 && currentAudio?.duration) {
        setDuration(currentAudio.duration);
      }
      
      if (isLoading) {
        setLoading(false);
      }
      
      canplayHandled = true;
    };

    const handleLoadStart = () => {
      // ロード開始時の処理
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
  }, [currentAudio, audioRef, duration, currentTime, isLoading, setDuration, setCurrentTime, setLoading, onAudioEnd]);
};