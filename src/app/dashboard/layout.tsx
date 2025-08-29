"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "../../contexts/SidebarContext";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  UserIcon,
  BookOpenIcon,
  HeartIcon
} from "@heroicons/react/24/outline";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const menuItems = [
    { id: 'discover', label: '発見', icon: SpeakerWaveIcon },
    { id: 'library', label: 'ライブラリ', icon: BookOpenIcon },
    { id: 'liked', label: 'お気に入り', icon: HeartIcon },
    { id: 'upload', label: '投稿', icon: MicrophoneIcon },
    { id: 'profile', label: 'プロフィール', icon: UserIcon },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const getActiveTab = () => {
    if (pathname === '/dashboard') return 'discover';
    if (pathname.startsWith('/dashboard/discover')) return 'discover';
    if (pathname.startsWith('/dashboard/library')) return 'library';
    if (pathname.startsWith('/dashboard/liked')) return 'liked';
    if (pathname.startsWith('/dashboard/upload')) return 'upload';
    if (pathname.startsWith('/dashboard/profile')) return 'profile';
    return 'discover';
  };

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/${tab}`);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getPageTitle = () => {
    const activeTab = getActiveTab();
    switch (activeTab) {
      case 'discover':
        return '発見';
      case 'library':
        return 'ライブラリ';
      case 'liked':
        return 'お気に入り';
      case 'upload':
        return '音声投稿';
      case 'profile':
        return 'プロフィール・設定';
      default:
        return '発見';
    }
  };

  const getPageSubtitle = () => {
    const activeTab = getActiveTab();
    switch (activeTab) {
      case 'discover':
        return '新しいコンテンツを見つけよう';
      case 'library':
        return 'あなたのコンテンツ';
      case 'liked':
        return 'お気に入りのコンテンツ';
      case 'upload':
        return '新しい音声コンテンツを投稿しましょう';
      case 'profile':
        return 'プロフィール情報とアプリケーション設定';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar 
        activeTab={getActiveTab()} 
        onTabChange={handleTabChange}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      <TopBar 
        title={getPageTitle()} 
        subtitle={getPageSubtitle()}
        isCollapsed={isCollapsed}
      />
      
      <main className={`${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} pt-16 pb-20 transition-all duration-300 lg:pb-6`}>
        <div className="px-3 sm:px-4 lg:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
      {/* モバイル用ボトムナビゲーション */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-around py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = getActiveTab() === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1 font-medium">
                  {item.id === 'discover' ? '発見' : 
                   item.id === 'library' ? 'ライブラリ' : 
                   item.id === 'liked' ? 'お気に入り' : 
                   item.id === 'upload' ? '投稿' : 
                   item.id === 'profile' ? 'プロフィール' : 
                   item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 