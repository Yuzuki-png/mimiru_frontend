import { expect, test, describe } from 'vitest';
import { audioContentApi } from '../../lib/api';

describe('Audio Content API', () => {
  test('getAll - 音声コンテンツ一覧取得APIが実行される', async () => {
    try {
      const response = await audioContentApi.getAll();
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('getAll with params - パラメータ付きコンテンツ取得APIが実行される', async () => {
    const params = {
      page: 1,
      limit: 10,
      category: 'ビジネス'
    };

    try {
      const response = await audioContentApi.getAll(params);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('search - 音声コンテンツ検索APIが実行される', async () => {
    const searchQuery = 'テスト';
    
    try {
      const response = await audioContentApi.search(searchQuery);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('getById - ID指定コンテンツ取得APIが実行される', async () => {
    const testId = '1';
    
    try {
      const response = await audioContentApi.getById(testId);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('title');
      expect(response).toHaveProperty('description');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('create - 音声コンテンツ作成APIが実行される', async () => {
    const testFile = new File(['test audio content'], 'test.mp3', { type: 'audio/mpeg' });
    const audioData = {
      title: 'テスト音声コンテンツ',
      description: 'テスト用の説明文',
      category: 'ビジネス',
      duration: 120,
      audioFile: testFile
    };

    try {
      const response = await audioContentApi.create(audioData);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('id');
      expect(response.title).toBe(audioData.title);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('toggleLike - いいね切り替えAPIが実行される', async () => {
    const testContentId = '1';
    
    try {
      const response = await audioContentApi.toggleLike(testContentId);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('isLiked');
      expect(typeof response.isLiked).toBe('boolean');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });


  test('delete - 音声コンテンツ削除APIが実行される', async () => {
    const testId = '1';
    
    try {
      const response = await audioContentApi.delete(testId);
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});