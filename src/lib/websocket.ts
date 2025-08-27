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
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // イベントリスナーを格納
  private eventListeners: Map<string, ((data: unknown) => void)[]> = new Map();

  // 接続
  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      // 開発環境でWebSocket接続を無効化するオプション
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_WEBSOCKET === 'true') {
        reject(new Error('WebSocket is disabled in development'));
        return;
      }

      // 既に接続中の場合は既存のPromiseを返す
      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      // 接続中フラグを立てる
      this.isConnecting = true;

      // 既存の接続がある場合はクリーンアップ
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      // WebSocketサーバーのURL（バックエンドサーバーと同じポート）
      const wsUrl = config.apiBaseUrl.replace('/api', '');
      
      this.socket = io(wsUrl, {
        auth: {
          token: token.replace('Bearer ', '')
        },
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: false, // 自動再接続を無効化
        autoConnect: true,
      });

      // 接続成功
      this.socket.on('connect', () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // 登録されているリスナーを再接続
        this.reattachListeners();
        
        resolve(this.socket!);
      });

      // 接続エラー
      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.isConnecting = false;
          reject(new Error(`WebSocket接続に失敗しました: ${error.message}`));
        }
      });

      // 切断
      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        this.isConnecting = false;
        
        // サーバー側からの切断の場合は再接続を試みない
        if (reason === 'io server disconnect') {
          this.socket?.removeAllListeners();
          this.socket = null;
        }
      });

      // エラー
      this.socket.on('error', () => {
        // エラーは静かに処理
        this.isConnecting = false;
      });
    });
  }

  // 切断
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      // リスナーは保持（再接続時に使用）
    }
  }

  // リスナーを再接続時に再設定
  private reattachListeners(): void {
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  // ユーザールームに参加（個人通知受信のため）
  joinUserRoom(userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join_user_room', { userId });
    }
  }

  // ユーザールームから退出
  leaveUserRoom(userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_user_room', { userId });
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