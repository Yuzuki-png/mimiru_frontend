"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications, type Notification } from "../contexts/NotificationContext";
import Link from "next/link";
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  HeartIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface TopBarProps {
  title: string;
  subtitle?: string;
  isCollapsed: boolean;
}

export default function TopBar({ title, subtitle, isCollapsed }: TopBarProps) {
  const { user, logout } = useAuth();
  const { state, markRealtimeAsRead, clearRealtimeNotifications } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <HeartIcon className="h-5 w-5 text-red-500" />;
      case 'FOLLOW':
        return <UserPlusIcon className="h-5 w-5 text-blue-500" />;
      case 'COMMENT':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-green-500" />;
      case 'CONTENT':
        return <DocumentPlusIcon className="h-5 w-5 text-purple-500" />;
      case 'SYSTEM':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'LIKE':
        return 'border-l-red-500';
      case 'FOLLOW':
        return 'border-l-blue-500';
      case 'COMMENT':
        return 'border-l-green-500';
      case 'CONTENT':
        return 'border-l-purple-500';
      case 'SYSTEM':
        return 'border-l-orange-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markRealtimeAsRead(notification.id);
    
    if (notification.data && typeof notification.data === 'object' && 'contentId' in notification.data) {
      window.location.href = `/content/${(notification.data as { contentId: number }).contentId}`;
    }
  };

  const totalUnreadCount = state.unreadCount + state.realtimeNotifications.filter(n => !n.isRead).length;

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className={`fixed top-0 ${isCollapsed ? 'left-20' : 'left-64'} right-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-all duration-300`}
    >
      <div className="flex items-center justify-between px-6 py-3 h-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>


        <div className="flex items-center space-x-4">
          {/* 統合された通知システム */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <BellIcon className="h-6 w-6" />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}
            </button>

            {/* 統合通知ドロップダウン */}
            <AnimatePresence>
              {showNotificationDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        通知
                      </h3>
                      <div className="flex space-x-2">
                        <Link 
                          href="/dashboard/notifications"
                          className="text-sm text-blue-500 hover:text-blue-600"
                          onClick={() => setShowNotificationDropdown(false)}
                        >
                          すべて見る
                        </Link>
                        {state.realtimeNotifications.length > 0 && (
                          <button
                            onClick={clearRealtimeNotifications}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            削除
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotificationDropdown(false)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {/* リアルタイム通知（上部に表示） */}
                    {state.realtimeNotifications.map((notification) => (
                      <div
                        key={`realtime-${notification.id}`}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              リアルタイム・{new Date(notification.createdAt).toLocaleTimeString('ja-JP')}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}

                    {state.realtimeNotifications.length === 0 && state.notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        通知はありません
                      </div>
                    ) : (
                      <>
                        {/* 区切り線（リアルタイム通知がある場合のみ） */}
                        {state.realtimeNotifications.length > 0 && state.notifications.length > 0 && (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              以前の通知
                            </p>
                          </div>
                        )}
                        
                        {/* API通知（下部に表示、最大5件） */}
                        {state.notifications.slice(0, 5).map((notification) => (
                          <div
                            key={`api-${notification.id}`}
                            className={`p-4 border-l-4 border-l-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  {new Date(notification.createdAt).toLocaleString('ja-JP')}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8" />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || user?.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">オンライン</p>
                </div>
              </div>
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                
                <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span>設定</span>
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>ログアウト</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 通知ドロップダウン用の背景オーバーレイ */}
      {showNotificationDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotificationDropdown(false)}
        />
      )}
      
      {/* ユーザーメニュー用の背景オーバーレイ */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </motion.header>
  );
} 