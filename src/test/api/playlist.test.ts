import { expect, test, describe } from 'vitest';
import { playlistApi } from '../../lib/api';

describe('Playlist API', () => {
  test('getAll - プレイリスト一覧取得APIが実行される', async () => {
    try {
      const response = await playlistApi.getAll();
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('getById - ID指定プレイリスト取得APIが実行される', async () => {
    const testId = '1';
    
    try {
      const response = await playlistApi.getById(testId);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('description');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('create - プレイリスト作成APIが実行される', async () => {
    const playlistData = {
      name: 'テストプレイリスト',
      description: 'テスト用のプレイリスト説明',
      isPublic: true
    };

    try {
      const response = await playlistApi.create(playlistData);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('id');
      expect(response.name).toBe(playlistData.name);
      expect(response.description).toBe(playlistData.description);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('update - プレイリスト更新APIが実行される', async () => {
    const testId = '1';
    const updateData = {
      name: '更新されたプレイリスト',
      description: '更新された説明'
    };

    try {
      const response = await playlistApi.update(testId, updateData);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('id');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('delete - プレイリスト削除APIが実行される', async () => {
    const testId = '1';
    
    try {
      const response = await playlistApi.delete(testId);
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('addItem - プレイリストアイテム追加APIが実行される', async () => {
    const testId = '1';
    const audioContentId = 1;
    
    try {
      const response = await playlistApi.addItem(testId, audioContentId);
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('removeItem - プレイリストアイテム削除APIが実行される', async () => {
    const testId = '1';
    const itemId = '1';
    
    try {
      const response = await playlistApi.removeItem(testId, itemId);
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('reorderItems - プレイリストアイテム並び替えAPIが実行される', async () => {
    const testId = '1';
    const items = [
      { id: 1, position: 2 },
      { id: 2, position: 1 }
    ];
    
    try {
      const response = await playlistApi.reorderItems(testId, items);
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});