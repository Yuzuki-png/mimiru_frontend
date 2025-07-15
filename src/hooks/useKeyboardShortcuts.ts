'use client';

import { useEffect } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

export const useKeyboardShortcuts = () => {
  const { state, pauseAudio, stopAudio } = useAudioPlayer();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // フォーカスされている要素がinput/textareaの場合はショートカットを無効にする
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
              // 再生は個別の再生ボタンから行う
              // ここでは一時停止のみ処理
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
            // 音量ミュート処理はGlobalAudioPlayerで処理
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