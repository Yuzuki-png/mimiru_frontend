"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    newContent: true,
    likes: true,
    comments: false,
    newsletter: true
  });
  const [autoPlay, setAutoPlay] = useState(true);
  const [dataUsage, setDataUsage] = useState('wifi');

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-500 to-gray-700 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Cog6ToothIcon className="h-8 w-8" />
          <h2 className="text-3xl font-bold">設定</h2>
        </div>
        <p className="text-gray-100 text-lg">
          アプリケーションの設定をカスタマイズできます
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">外観</h3>
          
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
                <GlobeAltIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">言語</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">日本語</p>
                </div>
              </div>
              <select className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-white">
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">通知</h3>
          
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => {
              const labels = {
                newContent: '新しいコンテンツ',
                likes: 'いいね',
                comments: 'コメント',
                newsletter: 'ニュースレター'
              };
              
              return (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {labels[key as keyof typeof labels]}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'newContent' && '新しいコンテンツが投稿されたとき'}
                        {key === 'likes' && 'あなたのコンテンツにいいねがついたとき'}
                        {key === 'comments' && 'あなたのコンテンツにコメントがついたとき'}
                        {key === 'newsletter' && '週間ニュースレターの配信'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">音声設定</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <SpeakerWaveIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">自動再生</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    コンテンツを自動的に再生する
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoPlay ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoPlay ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <SpeakerWaveIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">音質</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">高音質</p>
                </div>
              </div>
              <select className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-white">
                <option value="high">高音質</option>
                <option value="medium">標準</option>
                <option value="low">低音質</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">データとストレージ</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <p className="font-medium text-gray-900 dark:text-white">データ使用量</p>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'wifi', label: 'Wi-Fi接続時のみ' },
                  { value: 'always', label: '常に許可' },
                  { value: 'never', label: '自動ダウンロードしない' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="dataUsage"
                      value={option.value}
                      checked={dataUsage === option.value}
                      onChange={(e) => setDataUsage(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <CloudIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white">ストレージ使用量</p>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">245 MB</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <button className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                <TrashIcon className="h-4 w-4" />
                <span>キャッシュをクリア</span>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">プライバシーとセキュリティ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">パスワード変更</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">アカウントのパスワードを変更</p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            <button className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">二段階認証</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">セキュリティを強化</p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            <button className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-3">
                <ArrowDownTrayIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">データのエクスポート</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">あなたのデータをダウンロード</p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            <button className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <div className="flex items-center space-x-3">
                <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="text-left">
                  <p className="font-medium text-red-600 dark:text-red-400">アカウント削除</p>
                  <p className="text-sm text-red-500 dark:text-red-400">アカウントを完全に削除</p>
                </div>
              </div>
              <span className="text-red-400">›</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 