"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "next-themes";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedBio, setEditedBio] = useState("");

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user?.name || "");
    setEditedBio("");
    setIsEditing(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <UserIcon className="h-8 w-8" />
          <h2 className="text-3xl font-bold">プロフィール</h2>
        </div>
        <p className="text-indigo-100 text-lg">
          あなたのプロフィール情報と設定を管理できます
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">基本情報</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>編集</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>保存</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>キャンセル</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <CameraIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.name || user?.email?.split('@')[0]}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">メンバー</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  表示名
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{user?.name || "未設定"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  メールアドレス
                </label>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  自己紹介
                </label>
                {isEditing ? (
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="あなたについて教えてください..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {editedBio || "自己紹介が設定されていません"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  登録日
                </label>
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-900 dark:text-white">2024年6月14日</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">アカウント設定</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {theme === 'dark' ? (
                    <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">テーマ</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {theme === 'dark' ? 'ダークモード' : 'ライトモード'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">通知</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      新しいコンテンツやいいねの通知
                    </p>
                  </div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">言語</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">日本語</p>
                  </div>
                </div>
                <button className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                  変更
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">アクティビティ</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">投稿数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">156</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">獲得いいね</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">連続学習日数</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">セキュリティ</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">パスワード変更</span>
                </div>
                <span className="text-gray-400">›</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">二段階認証</span>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-700"
          >
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">危険な操作</h3>
            <button className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              アカウントを削除
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 