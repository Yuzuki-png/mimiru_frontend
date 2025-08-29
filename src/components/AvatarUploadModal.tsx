"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PhotoIcon, 
  TrashIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { userApi } from '../lib/api';
import UserAvatar from './UserAvatar';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string | null;
  userName?: string | null;
  onAvatarChange: (newAvatarUrl: string | null) => void;
}

export default function AvatarUploadModal({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  userName,
  onAvatarChange 
}: AvatarUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('JPG、PNG、WEBPファイルのみアップロード可能です。');
      return;
    }

    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください。');
      return;
    }

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userApi.uploadAvatar(file);
      setSuccess('アバター画像が正常にアップロードされました！');
      onAvatarChange(response.avatarUrl);
      
      // 2秒後にモーダルを閉じる
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'アップロードに失敗しました');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatar) return;

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await userApi.deleteAvatar();
      setSuccess('アバター画像が削除されました！');
      onAvatarChange(null);
      
      // 2秒後にモーダルを閉じる
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : '削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isUploading || isDeleting) return;
    
    setError(null);
    setSuccess(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                アバター画像
              </h3>
              <button
                onClick={handleClose}
                disabled={isUploading || isDeleting}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {success}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  このウィンドウは自動的に閉じます
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* 現在のアバター表示 */}
                <div className="flex flex-col items-center space-y-4">
                  <UserAvatar 
                    avatar={previewUrl || currentAvatar} 
                    name={userName} 
                    size="xl" 
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    現在のアバター画像
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* アップロードボタン */}
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <button
                    onClick={triggerFileInput}
                    disabled={isUploading || isDeleting}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PhotoIcon className="h-5 w-5" />
                    <span>{isUploading ? 'アップロード中...' : '画像を選択'}</span>
                  </button>

                  {currentAvatar && (
                    <button
                      onClick={handleDelete}
                      disabled={isUploading || isDeleting}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span>{isDeleting ? '削除中...' : 'アバターを削除'}</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>• JPG、PNG、WEBPファイルのみサポート</p>
                  <p>• ファイルサイズは5MB以下</p>
                  <p>• 正方形の画像を推奨します</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}