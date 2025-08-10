'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { notificationApi, isAuthenticated } from '../lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'LIKE' | 'FOLLOW' | 'CONTENT' | 'COMMENT' | 'SYSTEM' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
  data?: { contentId?: number; [key: string]: unknown }; // 追加データ（コンテンツIDなど）
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'MARK_AS_READ'; payload: number }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      };
    case 'DELETE_NOTIFICATION':
      const notificationToDelete = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notificationToDelete && !notificationToDelete.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    default:
      return state;
  }
}

interface NotificationContextType {
  state: NotificationState;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const fetchNotifications = useCallback(async () => {
    // 認証されていない場合は処理をスキップ
    if (!isAuthenticated()) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await notificationApi.getAll({ limit: 50 });
      
      // APIレスポンスがメタ情報付きの場合と配列直接の場合を処理
      const notifications = result.data || result || [];
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      
      // 未読数を計算
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
    } catch (error) {
      console.error('通知の取得に失敗しました:', error);
      dispatch({ type: 'SET_ERROR', payload: '通知の取得に失敗しました。バックエンドサーバーが起動しているか確認してください。' });
      
      // エラー時は空の配列を設定
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    // 認証されていない場合は処理をスキップ
    if (!isAuthenticated()) {
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
      return;
    }

    try {
      const result = await notificationApi.getUnreadCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: result.count || 0 });
    } catch {
      // APIエラーの場合はサイレントに処理し、現在の通知から未読数を計算
      const unreadCount = state.notifications.filter(n => !n.isRead).length;
      dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
    }
  }, [state.notifications]);

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id.toString());
    } catch {
      // APIエラーはサイレントに処理
    }
    // UIは常に更新（オフラインでも動作）
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
    } catch {
      // APIエラーはサイレントに処理
    }
    // UIは常に更新（オフラインでも動作）
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationApi.delete(id.toString());
    } catch {
      // APIエラーはサイレントに処理
    }
    // UIは常に更新（オフラインでも動作）
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  // 初回読み込み
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 定期的に未読数を更新（30秒ごと）
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const contextValue: NotificationContextType = {
    state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;