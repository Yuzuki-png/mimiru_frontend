'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { notificationApi, isAuthenticated } from '../lib/api';
import { useAuth } from './AuthContext';
import websocketService from '../lib/websocket';

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: { contentId?: number } | unknown;
}

interface NotificationState {
  notifications: Notification[];
  realtimeNotifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isWebSocketConnected: boolean;
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_REALTIME_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_REALTIME_NOTIFICATION'; payload: Notification }
  | { type: 'CLEAR_REALTIME_NOTIFICATIONS' }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WEBSOCKET_CONNECTION'; payload: boolean }
  | { type: 'MARK_AS_READ'; payload: string | number }
  | { type: 'MARK_REALTIME_AS_READ'; payload: string | number }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string | number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification };

const initialState: NotificationState = {
  notifications: [],
  realtimeNotifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  isWebSocketConnected: false,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_REALTIME_NOTIFICATIONS':
      return { ...state, realtimeNotifications: action.payload };
    case 'ADD_REALTIME_NOTIFICATION':
      const exists = state.realtimeNotifications.some(n => n.id === action.payload.id);
      if (exists) {
        return state;
      }
      return { 
        ...state, 
        realtimeNotifications: [action.payload, ...state.realtimeNotifications.slice(0, 9)]
      };
    case 'CLEAR_REALTIME_NOTIFICATIONS':
      return { ...state, realtimeNotifications: [] };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_WEBSOCKET_CONNECTION':
      return { ...state, isWebSocketConnected: action.payload };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_REALTIME_AS_READ':
      return {
        ...state,
        realtimeNotifications: state.realtimeNotifications.map(n =>
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
  markAsRead: (id: string | number) => Promise<void>;
  markRealtimeAsRead: (id: string | number) => void;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string | number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  clearRealtimeNotifications: () => void;
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
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
  const { user, isAuthenticated: authIsAuthenticated } = useAuth();

  const fetchNotifications = useCallback(async () => {
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

      const allNotifications = result.data || result || [];

      const realtimeIds = state.realtimeNotifications.map(n => n.id);
      const filteredNotifications = allNotifications.filter((n: Notification) => 
        !realtimeIds.includes(n.id)
      );
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: filteredNotifications });

      const unreadCount = filteredNotifications.filter((n: Notification) => !n.isRead).length;
      dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: '通知の取得に失敗しました。バックエンドサーバーが起動しているか確認してください。' });

      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.realtimeNotifications]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated()) {
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
      return;
    }

    try {
      const result = await notificationApi.getUnreadCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: result.count || 0 });
    } catch {
      const unreadCount = state.notifications.filter(n => !n.isRead).length;
      dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
    }
  }, [state.notifications]);

  const markAsRead = async (id: string | number) => {
    try {
      await notificationApi.markAsRead(id.toString());
    } catch {
    }
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
    } catch {
    }
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const deleteNotification = async (id: string | number) => {
    try {
      await notificationApi.delete(id.toString());
    } catch {
    }
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  const markRealtimeAsRead = useCallback((id: string | number) => {
    dispatch({ type: 'MARK_REALTIME_AS_READ', payload: id });
  }, []);

  const clearRealtimeNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_REALTIME_NOTIFICATIONS' });
  }, []);

  // WebSocket接続
  const connectWebSocket = useCallback(async () => {
    // 既に接続済みの場合はスキップ
    if (state.isWebSocketConnected || !authIsAuthenticated || !user) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      await websocketService.connect(token);
      dispatch({ type: 'SET_WEBSOCKET_CONNECTION', payload: true });

      websocketService.joinUserRoom(parseInt(user.id));

      websocketService.on('notification', (notification: Notification) => {
        dispatch({ type: 'ADD_REALTIME_NOTIFICATION', payload: notification });
      });

      websocketService.on('like_notification', (data: {
        id: string;
        type: 'like';
        title: string;
        message: string;
        data: unknown;
        isRead: boolean;
        createdAt: string;
      }) => {
        dispatch({ type: 'ADD_REALTIME_NOTIFICATION', payload: data });
      });

      websocketService.on('follow_notification', (data: {
        id: string;
        type: 'follow';
        title: string;
        message: string;
        data: unknown;
        isRead: boolean;
        createdAt: string;
      }) => {
        dispatch({ type: 'ADD_REALTIME_NOTIFICATION', payload: data });
      });

      websocketService.on('system_notification', (data: {
        title: string;
        message: string;
        type: string;
      }) => {
        const notification: Notification = {
          id: Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_REALTIME_NOTIFICATION', payload: notification });
      });

    } catch (error) {
      // Already connectingエラーの場合は無視
      if (error instanceof Error && error.message !== 'Already connecting') {
        dispatch({ type: 'SET_WEBSOCKET_CONNECTION', payload: false });
      }
    }
  }, [authIsAuthenticated, user, state.isWebSocketConnected]);

  const disconnectWebSocket = useCallback(() => {
    if (user) {
      websocketService.leaveUserRoom(parseInt(user.id));
    }
    websocketService.disconnect();
    dispatch({ type: 'SET_WEBSOCKET_CONNECTION', payload: false });
    dispatch({ type: 'CLEAR_REALTIME_NOTIFICATIONS' });
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (authIsAuthenticated && user) {
      connectWebSocket();
    }
    
    return () => {
      if (state.isWebSocketConnected) {
        disconnectWebSocket();
      }
    };
  }, [authIsAuthenticated, user, connectWebSocket, disconnectWebSocket, fetchNotifications, state.isWebSocketConnected]);

  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleMockNotification = (event: CustomEvent) => {
      const notification = event.detail;
      dispatch({ type: 'ADD_REALTIME_NOTIFICATION', payload: notification });
    };

    window.addEventListener('mockNotification', handleMockNotification as EventListener);

    return () => {
      window.removeEventListener('mockNotification', handleMockNotification as EventListener);
    };
  }, []);

  const contextValue: NotificationContextType = {
    state,
    fetchNotifications,
    markAsRead,
    markRealtimeAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
    clearRealtimeNotifications,
    connectWebSocket,
    disconnectWebSocket,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;