/* eslint-disable no-console */

const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export class StorageManager {
  static setToken(token: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      }
    } catch (error) {
      console.error('トークンの保存に失敗しました:', error);
    }
  }

  /**
   * 認証トークンを取得
   */
  static getToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      }
      return null;
    } catch (error) {
      console.error('トークンの取得に失敗しました:', error);
      return null;
    }
  }

  /**
   * リフレッシュトークンを保存
   */
  static setRefreshToken(token: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
      }
    } catch (error) {
      console.error('リフレッシュトークンの保存に失敗しました:', error);
    }
  }

  /**
   * リフレッシュトークンを取得
   */
  static getRefreshToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
      return null;
    } catch (error) {
      console.error('リフレッシュトークンの取得に失敗しました:', error);
      return null;
    }
  }

  /**
   * 認証関連のデータをすべて削除
   */
  static clearAuth(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    } catch (error) {
      console.error('認証データの削除に失敗しました:', error);
    }
  }

  /**
   * ユーザー設定を保存
   */
  static setUserPreferences(preferences: Record<string, unknown>): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      }
    } catch (error) {
      console.error('ユーザー設定の保存に失敗しました:', error);
    }
  }

  /**
   * ユーザー設定を取得
   */
  static getUserPreferences<T = Record<string, unknown>>(): T | null {
    try {
      if (typeof window !== 'undefined') {
        const preferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        return preferences ? JSON.parse(preferences) : null;
      }
      return null;
    } catch (error) {
      console.error('ユーザー設定の取得に失敗しました:', error);
      return null;
    }
  }

  /**
   * テーマ設定を保存
   */
  static setTheme(theme: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
      }
    } catch (error) {
      console.error('テーマ設定の保存に失敗しました:', error);
    }
  }

  /**
   * テーマ設定を取得
   */
  static getTheme(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEYS.THEME);
      }
      return null;
    } catch (error) {
      console.error('テーマ設定の取得に失敗しました:', error);
      return null;
    }
  }

  /**
   * 汎用データ保存
   */
  static setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`データの保存に失敗しました (key: ${key}):`, error);
    }
  }

  /**
   * 汎用データ取得
   */
  static getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`データの取得に失敗しました (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * 汎用データ削除
   */
  static removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`データの削除に失敗しました (key: ${key}):`, error);
    }
  }

  /**
   * 全データクリア
   */
  static clear(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } catch (error) {
      console.error('ストレージのクリアに失敗しました:', error);
    }
  }

  /**
   * ストレージ使用量を取得 (バイト単位)
   */
  static getStorageSize(): number {
    try {
      if (typeof window !== 'undefined') {
        let total = 0;
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
          }
        }
        return total;
      }
      return 0;
    } catch (error) {
      console.error('ストレージサイズの取得に失敗しました:', error);
      return 0;
    }
  }
}