'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { config } from '../lib/config';
import { AxiosError } from 'axios';

export const DebugPanel: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [apiResponse, setApiResponse] = useState<string>('');

  const testConnection = async () => {
    try {
      setConnectionStatus('unknown');
      setApiResponse('テスト中...');
      
      const response = await api.get('/');
      setConnectionStatus('connected');
      setApiResponse(`成功: ${JSON.stringify(response.data)}`);
    } catch (error: unknown) {
      setConnectionStatus('failed');
      
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          setApiResponse(`接続失敗: ${config.apiBaseUrl} に接続できません`);
        } else {
          setApiResponse(`エラー: ${error.message} (Code: ${error.code})`);
        }
      } else {
        setApiResponse(`エラー: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md z-50">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        デバッグパネル
      </h3>
      
      <div className="space-y-2">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          API URL: {config.apiBaseUrl}
        </div>
        
        <button
          onClick={testConnection}
          className="w-full px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          接続テスト
        </button>
        
        <div className={`text-xs p-2 rounded max-h-32 overflow-y-auto ${
          connectionStatus === 'connected' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
            : connectionStatus === 'failed'
            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          {apiResponse || '接続テストを実行してください'}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ステータス: {connectionStatus}
        </div>
      </div>
    </div>
  );
};