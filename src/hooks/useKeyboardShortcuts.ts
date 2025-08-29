'use client';

import { useEffect } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

export const useKeyboardShortcuts = () => {
  const { state, pauseAudio, stopAudio } = useAudioPlayer();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );

      if (isInputFocused) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (state.currentAudio) {
            if (state.isPlaying) {
              pauseAudio();
            } else {
            }
          }
          break;
        
        case 'Escape':
          if (state.currentAudio) {
            stopAudio();
          }
          break;
        
        case 'KeyM':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.currentAudio, state.isPlaying, pauseAudio, stopAudio]);
};

export default useKeyboardShortcuts;