"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  MicrophoneIcon,
  HeartIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  BookOpenIcon,
  PlayIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: HomeIcon },
    { id: 'discover', label: '発見', icon: SpeakerWaveIcon },
    { id: 'library', label: 'ライブラリ', icon: BookOpenIcon },
    { id: 'liked', label: 'お気に入り', icon: HeartIcon },
    { id: 'analytics', label: '分析', icon: ChartBarIcon },
    { id: 'upload', label: '投稿', icon: MicrophoneIcon },
  ];

  const bottomItems = [
    { id: 'profile', label: 'プロフィール', icon: UserIcon },
    { id: 'settings', label: '設定', icon: Cog6ToothIcon },
  ];

  const legalItems = [
    { id: 'terms', label: '利用規約', icon: DocumentTextIcon, href: '/terms-of-service' },
    { id: 'privacy', label: 'プライバシーポリシー', icon: ShieldCheckIcon, href: '/privacy-policy' },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };

  const handleLegalClick = (href: string) => {
    router.push(href);
  };

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col`}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-200 dark:border-gray-700`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <PlayIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Mimiru</span>
          </div>
        )}
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <PlayIcon className="h-5 w-5 text-white" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-2">
        <div className={`${isCollapsed ? 'space-y-1' : 'space-y-2'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center py-3 px-2' : 'items-center space-x-3 px-3 py-2.5'} rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                {isCollapsed ? (
                  <span className={`text-xs mt-1 font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {item.label.length > 4 ? item.label.substring(0, 4) : item.label}
                  </span>
                ) : (
                  <span className="font-medium">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-20 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          disabled={!mounted}
          className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center py-3 px-2' : 'items-center space-x-3 px-3 py-2.5'} rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2 group relative ${!mounted ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {!mounted ? (
            <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : theme === 'dark' ? (
            <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          )}
          {isCollapsed ? (
            <span className="text-xs mt-1 font-medium text-gray-600 dark:text-gray-300">
              {!mounted ? 'テーマ' : theme === 'dark' ? 'ライト' : 'ダーク'}
            </span>
          ) : (
            <span className="font-medium">
              {!mounted ? 'テーマ切替' : theme === 'dark' ? 'ライトモード' : 'ダークモード'}
            </span>
          )}
          {isCollapsed && (
            <div className="absolute left-20 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {!mounted ? 'テーマ切替' : theme === 'dark' ? 'ライトモード' : 'ダークモード'}
            </div>
          )}
        </button>

        <div className={`${isCollapsed ? 'space-y-1' : 'space-y-2'} mb-2`}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center py-3 px-2' : 'items-center space-x-3 px-3 py-2.5'} rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                {isCollapsed ? (
                  <span className={`text-xs mt-1 font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {item.label.length > 4 ? item.label.substring(0, 4) : item.label}
                  </span>
                ) : (
                  <span className="font-medium">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-20 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className={`${isCollapsed ? 'space-y-1' : 'space-y-1'} border-t border-gray-200 dark:border-gray-700 pt-2`}>
          {legalItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleLegalClick(item.href)}
                className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center py-2 px-2' : 'items-center space-x-3 px-3 py-2'} rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group relative`}
              >
                <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                {isCollapsed ? (
                  <span className="text-xs mt-1 font-medium text-gray-500 dark:text-gray-400">
                    {item.id === 'terms' ? '規約' : 'PP'}
                  </span>
                ) : (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-20 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
} 