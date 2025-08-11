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
  // サーバーから受信するイベント（バックエンドの実装に合わせて）
  'notification': (data: NotificationData) => void;
  'like_notification': (data: LikeNotificationData) => void;
  'follow_notification': (data: FollowNotificationData) => void;
  'system_notification': (data: NotificationData) => void;
  'connect': () => void;
  'disconnect': () => void;
  'error': (error: Error) => void;
  
  // サーバーに送信するイベント  
  'join_user_room': (data: { userId: number }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // イベントリスナーを格納
  private eventListeners: Map<string, ((data: unknown) => void)[]> = new Map();

  // 接続
  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      // WebSocketサーバーのURL（バックエンドサーバーと同じポート）
      const wsUrl = config.apiBaseUrl.replace('/api', '');
      
      this.socket = io(wsUrl, {
        auth: {
          token: token.replace('Bearer ', '')
        },
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      // 接続成功
      this.socket.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      // 接続エラー
      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error(`WebSocket接続に失敗しました: ${error.message}`));
        }
      });

      // 切断
      this.socket.on('disconnect', () => {
        this.isConnected = false;
      });

      // エラー
      this.socket.on('error', () => {
        // エラーは静かに処理
      });
    });
  }

  // 切断
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // ユーザールームに参加（個人通知受信のため）
  joinUserRoom(userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join_user_room', { userId });
    }
  }

  // イベントリスナーを追加
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

  // イベントリスナーを削除
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

  // イベントを送信
  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
    // WebSocketが接続されていない場合は静かに処理
  }

  // 接続状態を取得
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Socket インスタンスを取得
  get instance(): Socket | null {
    return this.socket;
  }
}

// シングルトンインスタンス
export const websocketService = new WebSocketService();
export default websocketService;