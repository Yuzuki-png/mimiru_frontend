
interface PerformanceMetrics {
  connectTime: number;
  messageCount: number;
  lastMessageTime: number;
  averageLatency: number;
  memoryUsage: number;
}

class WebSocketPerformanceMonitor {
  private metrics: PerformanceMetrics = {
    connectTime: 0,
    messageCount: 0,
    lastMessageTime: 0,
    averageLatency: 0,
    memoryUsage: 0
  };

  private latencyHistory: number[] = [];
  private maxHistorySize = 10;

  recordConnectionTime(startTime: number): void {
    this.metrics.connectTime = Date.now() - startTime;
  }

  recordMessage(receivedTime: number = Date.now()): void {
    this.metrics.messageCount++;
    this.metrics.lastMessageTime = receivedTime;
  }

  recordLatency(sentTime: number, receivedTime: number = Date.now()): void {
    const latency = receivedTime - sentTime;
    this.latencyHistory.push(latency);
    
    if (this.latencyHistory.length > this.maxHistorySize) {
      this.latencyHistory.shift();
    }
    
    this.metrics.averageLatency = 
      this.latencyHistory.reduce((sum, lat) => sum + lat, 0) / this.latencyHistory.length;
  }

  updateMemoryUsage(): void {
    if (typeof window !== 'undefined') {
      const perfWithMemory = performance as typeof performance & {
        memory?: { usedJSHeapSize: number };
      };
      if (perfWithMemory.memory) {
        this.metrics.memoryUsage = perfWithMemory.memory.usedJSHeapSize;
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      connectTime: 0,
      messageCount: 0,
      lastMessageTime: 0,
      averageLatency: 0,
      memoryUsage: 0
    };
    this.latencyHistory = [];
  }

  // パフォーマンス統計を取得（デバッグ用）
  getStatsString(): string {
    const stats = this.getMetrics();
    return `WebSocket Stats: 接続時間=${stats.connectTime}ms, メッセージ数=${stats.messageCount}, 平均レイテンシ=${Math.round(stats.averageLatency)}ms, メモリ=${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`;
  }

  // アプリのパフォーマンス問題をチェック
  checkPerformanceIssues(): string[] {
    const issues: string[] = [];
    const stats = this.getMetrics();
    
    if (stats.averageLatency > 1000) {
      issues.push('⚠️ WebSocket レイテンシが高い (>1秒)');
    }
    
    if (stats.connectTime > 5000) {
      issues.push('⚠️ WebSocket 接続時間が長い (>5秒)');
    }
    
    if (stats.memoryUsage > 100 * 1024 * 1024) {
      issues.push('JavaScript ヒープメモリが多い (>100MB)');
    }
    
    return issues;
  }
}

export const wsPerformanceMonitor = new WebSocketPerformanceMonitor();
export default wsPerformanceMonitor;