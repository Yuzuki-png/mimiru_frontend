"use client";

import { useEffect } from "react";
import { useNotifications, type Notification } from "../../../contexts/NotificationContext";
import {
  BellIcon,
  HeartIcon,
  UserPlusIcon,
  MusicalNoteIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";

const getNotificationIcon = (type: string, isRead: boolean) => {
  const iconClass = `h-6 w-6 ${isRead ? 'text-gray-400' : 'text-white'}`;
  
  switch (type) {
    case 'LIKE':
      return isRead ? <HeartIcon className={iconClass} /> : <HeartSolidIcon className="h-6 w-6 text-white" />;
    case 'FOLLOW':
      return <UserPlusIcon className={iconClass} />;
    case 'CONTENT':
      return <MusicalNoteIcon className={iconClass} />;
    case 'SUCCESS':
      return <CheckCircleIcon className={iconClass} />;
    case 'WARNING':
      return <ExclamationTriangleIcon className={iconClass} />;
    case 'ERROR':
      return <XCircleIcon className={iconClass} />;
    case 'COMMENT':
      return <BellIcon className={iconClass} />;
    case 'SYSTEM':
      return <InformationCircleIcon className={iconClass} />;
    default:
      return isRead ? <BellIcon className={iconClass} /> : <BellSolidIcon className="h-6 w-6 text-white" />;
  }
};

const getNotificationBgColor = (type: string, isRead: boolean) => {
  if (isRead) return 'bg-gray-100 dark:bg-gray-700';
  
  switch (type) {
    case 'LIKE':
      return 'bg-red-500';
    case 'FOLLOW':
      return 'bg-blue-500';
    case 'CONTENT':
      return 'bg-green-500';
    case 'SUCCESS':
      return 'bg-green-500';
    case 'WARNING':
      return 'bg-yellow-500';
    case 'ERROR':
      return 'bg-red-500';
    case 'COMMENT':
      return 'bg-purple-500';
    case 'SYSTEM':
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '今';
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}時間前`;
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}日前`;
  } else {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export default function NotificationsPage() {
  const { state, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { notifications, loading, error, unreadCount } = state;

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // 通知のタイプに応じてナビゲーション
    if (notification.data && typeof notification.data === 'object' && 'contentId' in notification.data) {
      window.location.href = `/content/${(notification.data as { contentId: number }).contentId}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          読み込み中...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* エラーメッセージ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              通知を読み込めません
            </h3>
            <div className="text-red-500 dark:text-red-400 mb-4 text-sm">{error}</div>
            <div className="space-y-2">
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-2"
              >
                再試行
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                バックエンドサーバーが起動しているか確認してください
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BellIcon className="h-7 w-7 mr-3 text-blue-500" />
              通知
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : '未読通知はありません'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <CheckIcon className="h-4 w-4" />
              <span>全て既読にする</span>
            </button>
          )}
        </div>
      </div>

      {/* 通知リスト */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              通知がありません
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              新しい通知が届くとここに表示されます
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  {/* アイコン */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationBgColor(notification.type, notification.isRead)}`}>
                    {getNotificationIcon(notification.type, notification.isRead)}
                  </div>

                  {/* 通知内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </p>
                        <p className={`mt-1 text-sm ${!notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="削除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター統計 */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {notifications.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                総通知数
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                未読通知
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {notifications.length - unreadCount}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                既読通知
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}