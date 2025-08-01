"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "../../contexts/SidebarContext";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();

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
      
      <main className={`${isCollapsed ? 'ml-20' : 'ml-64'} pt-20 p-6 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 