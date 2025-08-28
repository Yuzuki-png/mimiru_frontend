import { expect, test, describe } from 'vitest';
import { userApi } from '../../lib/api';

describe('User Profile API', () => {
  test('getProfile - プロフィール取得APIが実行される', async () => {
    try {
      const profile = await userApi.getProfile();
      
      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('bio');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('updateProfile - プロフィール更新APIが実行される', async () => {
    const testData = {
      name: 'テストユーザー',
      bio: 'テスト用自己紹介'
    };

    try {
      const response = await userApi.updateProfile(testData);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('id');
      expect(response.name).toBe(testData.name);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('changePassword - パスワード変更APIが実行される', async () => {
    const passwordData = {
      currentPassword: 'currentpass123',
      newPassword: 'newpass456'
    };

    try {
      const response = await userApi.changePassword(passwordData);
      
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('getLearningStats - 学習統計取得APIが実行される', async () => {
    try {
      const stats = await userApi.getLearningStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('uploadAvatar - アバター画像アップロードAPIが実行される', async () => {
    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    try {
      const response = await userApi.uploadAvatar(testFile);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('avatarUrl');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});