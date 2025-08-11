"use client";

import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { userApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    if (confirmationText !== '削除を実行する') {
      setError('確認テキストが正しく入力されていません');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await userApi.deleteAccount();
      
      // アカウント削除成功時の処理
      alert('アカウントが正常に削除されました。ご利用ありがとうございました。');
      
      // ログアウト処理とトップページへリダイレクト
      logout();
      window.location.href = '/';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'アカウント削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              アカウント削除
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              ⚠️ 重要な注意事項
            </h3>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              <li>• この操作は取り消すことができません</li>
              <li>• 投稿した全ての音声コンテンツが削除されます</li>
              <li>• 作成したプレイリストが削除されます</li>
              <li>• いいね履歴や学習統計が削除されます</li>
              <li>• 再生セッション履歴が削除されます</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            アカウント削除を実行するには、以下に「<strong>削除を実行する</strong>」と入力してください。
          </p>

          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="削除を実行する"
            disabled={isDeleting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          />

          {error && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmationText !== '削除を実行する'}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? '削除中...' : 'アカウント削除'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;