'use client';

import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const WebSocketTestButton: React.FC = () => {
  const { state } = useNotifications();
  const isConnected = state.isWebSocketConnected;

  const simulateLikeNotification = () => {
    // WebSocketサービスを使って模擬通知を発生させる（テスト用）
    const mockNotification = {
      id: Date.now(),
      type: 'LIKE' as const,
      title: 'いいねを受け取りました！',
      message: 'テストユーザーさんがあなたのコンテンツにいいねしました',
      data: {
        contentId: 1,
        userId: 'test-user',
        userName: 'テストユーザー',
        totalLikes: 5
      },
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // カスタムイベントで通知を発火（テスト用）
    window.dispatchEvent(new CustomEvent('mockNotification', { detail: mockNotification }));
  };

  const simulateFollowNotification = () => {
    const mockNotification = {
      id: Date.now() + 1,
      type: 'FOLLOW' as const,
      title: '新しいフォロワーがいます！',
      message: 'サンプルユーザーさんがあなたをフォローしました',
      data: {
        userId: 'sample-user',
        userName: 'サンプルユーザー'
      },
      createdAt: new Date().toISOString(),
      isRead: false
    };

    window.dispatchEvent(new CustomEvent('mockNotification', { detail: mockNotification }));
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          WebSocket テスト
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          接続状態: {isConnected ? '🟢 接続中' : '🔴 未接続'}
        </p>
        
        <div className="space-y-2">
          <button
            onClick={simulateLikeNotification}
            className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
          >
            いいね通知をテスト
          </button>
          
          <button
            onClick={simulateFollowNotification}
            className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
          >
            フォロー通知をテスト
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebSocketTestButton;