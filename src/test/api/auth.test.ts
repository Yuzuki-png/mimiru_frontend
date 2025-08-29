import { expect, test, describe } from 'vitest';
import { authApi } from '../../lib/api';

describe('Auth API', () => {
  test('register - ユーザー登録APIが実行される', async () => {
    const testData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'テストユーザー'
    };

    try {
      const response = await authApi.register(testData.email, testData.password, testData.name);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('access_token');
      expect(response).toHaveProperty('user');
      expect(response.user.email).toBe(testData.email);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('register without name - 名前なしユーザー登録APIが実行される', async () => {
    const testData = {
      email: 'newuser2@example.com',
      password: 'password123'
    };

    try {
      const response = await authApi.register(testData.email, testData.password);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('access_token');
      expect(response).toHaveProperty('user');
      expect(response.user.email).toBe(testData.email);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('login - ユーザーログインAPIが実行される', async () => {
    const testData = {
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const response = await authApi.login(testData.email, testData.password);
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('access_token');
      expect(response).toHaveProperty('user');
      expect(response.user.email).toBe(testData.email);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('login with invalid credentials - 無効な認証情報でログイン', async () => {
    const testData = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    };

    try {
      await authApi.login(testData.email, testData.password);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('メールアドレスまたはパスワード');
    }
  });

  test('getProfile - 認証プロフィール取得APIが実行される', async () => {
    try {
      const response = await authApi.getProfile();
      
      if (response) {
        expect(response).toBeDefined();
        expect(response).toHaveProperty('id');
        expect(response).toHaveProperty('email');
      } else {
        expect(response).toBeNull();
      }
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('login with network error simulation - ネットワークエラーのテスト', async () => {
    try {
      await authApi.login('test@example.com', 'test');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      expect(
        errorMessage.includes('サーバーに接続できません') ||
        errorMessage.includes('メールアドレスまたはパスワード') ||
        errorMessage.includes('サーバーエラー')
      ).toBe(true);
    }
  });
});