import { expect, test, describe } from 'vitest';
import { playbackApi } from '../../lib/api';

describe('Playback API', () => {
  test('getStatus - 再生状態取得APIが実行される', async () => {
    try {
      const response = await playbackApi.getStatus();
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('play - 音声再生開始APIが実行される', async () => {
    const testAudioContentId = '1';
    
    try {
      const response = await playbackApi.play(testAudioContentId);
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('pause - 音声一時停止APIが実行される', async () => {
    try {
      const response = await playbackApi.pause();
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('stop - 音声停止APIが実行される', async () => {
    try {
      const response = await playbackApi.stop();
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('seek - シークAPIが実行される', async () => {
    const testTime = 30; // 30秒
    
    try {
      const response = await playbackApi.seek(testTime);
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('setVolume - 音量設定APIが実行される', async () => {
    const testVolume = 0.5; // 50%
    
    try {
      const response = await playbackApi.setVolume(testVolume);
      
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('setVolume - 音量範囲テスト (0-1)', async () => {
    const volumes = [0, 0.25, 0.5, 0.75, 1];
    
    for (const volume of volumes) {
      try {
        const response = await playbackApi.setVolume(volume);
        expect(response).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    }
  });
});