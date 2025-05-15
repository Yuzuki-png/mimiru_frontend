/**
 * アプリケーション設定
 */
export const config = {
  /**
   * バックエンドAPIのベースURL
   */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
  
  /**
   * アプリケーション名
   */
  appName: 'Mimiru',
  
  /**
   * APIのタイムアウト時間（ミリ秒）
   */
  apiTimeout: 10000,
};

export default config; 