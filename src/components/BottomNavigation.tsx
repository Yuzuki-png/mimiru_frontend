"use client";

import { motion } from "framer-motion";
import {
  SpeakerWaveIcon,
  BookOpenIcon,
  HeartIcon,
  MicrophoneIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import {
  SpeakerWaveIcon as SpeakerWaveSolidIcon,
  BookOpenIcon as BookOpenSolidIcon,
  HeartIcon as HeartSolidIcon,
  MicrophoneIcon as MicrophoneSolidIcon,
  UserIcon as UserSolidIcon
} from "@heroicons/react/24/solid";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const menuItems = [
    { 
      id: 'discover', 
      label: '発見', 
      icon: SpeakerWaveIcon,
      activeIcon: SpeakerWaveSolidIcon
    },
    { 
      id: 'library', 
      label: 'ライブラリ', 
      icon: BookOpenIcon,
      activeIcon: BookOpenSolidIcon
    },
    { 
      id: 'liked', 
      label: 'お気に入り', 
      icon: HeartIcon,
      activeIcon: HeartSolidIcon
    },
    { 
      id: 'upload', 
      label: '投稿', 
      icon: MicrophoneIcon,
      activeIcon: MicrophoneSolidIcon
    },
    { 
      id: 'profile', 
      label: 'プロフィール', 
      icon: UserIcon,
      activeIcon: UserSolidIcon
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}