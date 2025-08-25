"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  UserIcon,
  BookOpenIcon,
  PlayIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  HeartIcon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { id: 'discover', label: '発見', icon: SpeakerWaveIcon },
    { id: 'library', label: 'ライブラリ', icon: BookOpenIcon },
    { id: 'liked', label: 'お気に入り', icon: HeartIcon },
    { id: 'upload', label: '投稿', icon: MicrophoneIcon },
    { id: 'profile', label: 'プロフィール', icon: UserIcon },
  ];

  const bottomItems = [
    { id: 'settings', label: '設定', icon: UserIcon },
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
  return (
    <motion.div
      data-sidebar
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 lg:flex ${
        isCollapsed ? 'w-20 lg:w-20' : 'w-64 lg:w-64'
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg flex-col hidden`}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <PlayIcon className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Mimiru</span>
          </div>
        )}
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <PlayIcon className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-1 sm:p-2">
        <div className={`${isCollapsed ? 'space-y-1' : 'space-y-2'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center py-2 px-1' : 'items-center space-x-3 px-3 py-2.5'} rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                {isCollapsed ? (
                  <span className={`text-xs mt-0.5 font-medium leading-tight text-center ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {item.id === 'discover' ? '発見' : 
                     item.id === 'library' ? 'ライ' : 
                     item.id === 'liked' ? 'お気' : 
                     item.id === 'upload' ? '投稿' : 
                     item.id === 'profile' ? 'プロ' : 
                     item.label.substring(0, 2)}
                  </span>
                ) : (
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-1 sm:p-2 border-t border-gray-200 dark:border-gray-700">
        <div className={`${isCollapsed ? 'space-y-1' : 'space-y-2'} mb-2`}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center py-2 px-1' : 'items-center space-x-3 px-3 py-2.5'} rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                {isCollapsed ? (
                  <span className={`text-xs mt-0.5 font-medium leading-tight text-center ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {item.id === 'analytics' ? 'アナ' : 
                     item.id === 'settings' ? '設定' : 
                     item.label.substring(0, 2)}
                  </span>
                ) : (
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
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
                className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center py-1 px-1' : 'items-center space-x-3 px-3 py-2'} rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group relative`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                {isCollapsed ? (
                  <span className="text-xs mt-0.5 font-medium text-gray-500 dark:text-gray-400 leading-tight">
                    {item.id === 'terms' ? '規約' : 'PP'}
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
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