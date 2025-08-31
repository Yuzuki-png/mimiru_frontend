import { io, Socket } from 'socket.io-client';
import { config } from './config';

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: unknown;
  createdAt: string;
  isRead: boolean;
}

interface LikeNotificationData {
  id: string;
  type: 'like';
  title: string;
  message: string;
  data: unknown;
  isRead: boolean;
  createdAt: string;
}

interface FollowNotificationData {
  id: string;
  type: 'follow';
  title: string;
  message: string;
  data: unknown;
  isRead: boolean;
  createdAt: string;
}

interface SocketEvents {
  'notification': (data: NotificationData) => void;
  'like_notification': (data: LikeNotificationData) => void;
  'follow_notification': (data: FollowNotificationData) => void;
  'system_notification': (data: NotificationData) => void;
  'connect': () => void;
  'disconnect': () => void;
  'error': (error: Error) => void;
  'join_user_room': (data: { userId: number }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private eventListeners: Map<string, ((data: unknown) => void)[]> = new Map();

  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_WEBSOCKET === 'true') {
        reject(new Error('WebSocket is disabled in development'));
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.isConnecting = true;

      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      const wsUrl = config.apiBaseUrl;
      
      this.socket = io(wsUrl, {
        auth: {
          token: token.replace('Bearer ', '')
        },
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: false,
        autoConnect: true,
        forceNew: false,
        upgrade: true,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        this.reattachListeners();
        
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.isConnecting = false;
          reject(new Error(`WebSocket接続に失敗しました: ${error.message}`));
        }
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        this.isConnecting = false;
        
        if (reason === 'io server disconnect') {
          this.socket?.removeAllListeners();
          this.socket = null;
        }
      });

      this.socket.on('error', () => {
        this.isConnecting = false;
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  private reattachListeners(): void {
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  joinUserRoom(userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join_user_room', { userId });
    }
  }

  leaveUserRoom(userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_user_room', { userId });
    }
  }

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const eventStr = event as string;
    if (!this.eventListeners.has(eventStr)) {
      this.eventListeners.set(eventStr, []);
    }
    
    this.eventListeners.get(eventStr)!.push(callback as (data: unknown) => void);
    
    if (this.socket) {
      this.socket.on(eventStr, callback);
    }
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const eventStr = event as string;
    const listeners = this.eventListeners.get(eventStr);
    if (listeners) {
      const index = listeners.indexOf(callback as (data: unknown) => void);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    
    if (this.socket) {
      this.socket.off(eventStr, callback);
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  get instance(): Socket | null {
    return this.socket;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;