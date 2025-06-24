"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ページ遷移時にスクロール位置をリセット
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // パスからアクティブタブを決定
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname.startsWith('/dashboard/discover')) return 'discover';
    if (pathname.startsWith('/dashboard/library')) return 'library';
    if (pathname.startsWith('/dashboard/liked')) return 'liked';
    if (pathname.startsWith('/dashboard/analytics')) return 'analytics';
    if (pathname.startsWith('/dashboard/upload')) return 'upload';
    if (pathname.startsWith('/dashboard/profile')) return 'profile';
    if (pathname.startsWith('/dashboard/settings')) return 'settings';
    return 'dashboard';
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${tab}`);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getPageTitle = () => {
    const activeTab = getActiveTab();
    switch (activeTab) {
      case 'dashboard':
        return 'ダッシュボード';
      case 'discover':
        return '発見';
      case 'library':
        return 'ライブラリ';
      case 'liked':
        return 'お気に入り';
      case 'analytics':
        return '分析';
      case 'upload':
        return '音声投稿';
      case 'profile':
        return 'プロフィール';
      case 'settings':
        return '設定';
      default:
        return 'ダッシュボード';
    }
  };

  const getPageSubtitle = () => {
    const activeTab = getActiveTab();
    switch (activeTab) {
      case 'dashboard':
        return '今日も学習を続けましょう';
      case 'discover':
        return '新しいコンテンツを見つけよう';
      case 'library':
        return 'あなたのコンテンツ';
      case 'liked':
        return 'お気に入りのコンテンツ';
      case 'analytics':
        return '学習の進捗を確認';
      case 'upload':
        return '新しい音声コンテンツを投稿しましょう';
      case 'profile':
        return 'プロフィール設定';
      case 'settings':
        return 'アプリケーション設定';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <Sidebar 
        activeTab={getActiveTab()} 
        onTabChange={handleTabChange}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      {/* Top Bar */}
      <TopBar 
        title={getPageTitle()} 
        subtitle={getPageSubtitle()}
        isCollapsed={isCollapsed}
      />
      
      {/* Main Content */}
      <main className={`${isCollapsed ? 'ml-20' : 'ml-64'} pt-20 p-6 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 