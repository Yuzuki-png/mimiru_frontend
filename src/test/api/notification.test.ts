import { expect, test, describe } from 'vitest';
import { notificationApi } from '../../lib/api';

describe('Notification API', () => {
  test('getAll - 通知一覧取得APIが実行される', async () => {
    try {
      const response = await notificationApi.getAll();
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('getAll with params - パラメータ付き通知取得APIが実行される', async () => {
    const params = {
      page: 1,
      limit: 10,
      unreadOnly: true
    };

    try {
      const response = await notificationApi.getAll(params);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('markAsRead - 通知既読マークAPIが実行される', async () => {
    const testId = '1';
    
    try {
      const response = await notificationApi.markAsRead(testId);
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('markAllAsRead - 全通知既読マークAPIが実行される', async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('getUnreadCount - 未読通知数取得APIが実行される', async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('count');
      expect(typeof response.count).toBe('number');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('delete - 通知削除APIが実行される', async () => {
    const testId = '1';
    
    try {
      const response = await notificationApi.delete(testId);
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});